"""
Daemon Process for Multica Orchestrator.

Manages the Socket.IO server, agent detection, task queue, and CLI commands.
Provides health monitoring, PID file management, and graceful shutdown.

Usage:
    from multica_orchestrator.scripts.daemon import DaemonManager

    manager = DaemonManager(workspace_path="/path/to/project", port=8765)
    manager.start()
"""

from __future__ import annotations

import asyncio
import json
import os
import signal
import socket
import struct
import threading
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from pathlib import Path
from typing import Any, Optional

try:
    import structlog
    STRUCTLOG_AVAILABLE = True
except ImportError:
    structlog = None
    STRUCTLOG_AVAILABLE = False


class DaemonStatus(Enum):
    """Daemon running status."""
    STOPPED = "stopped"
    STARTING = "starting"
    RUNNING = "running"
    STOPPING = "stopping"
    ERROR = "error"


@dataclass
class HealthMetrics:
    """Health metrics for the daemon."""
    uptime_seconds: float = 0.0
    tasks_processed: int = 0
    tasks_pending: int = 0
    tasks_failed: int = 0
    last_health_check: Optional[datetime] = None
    memory_usage_mb: float = 0.0


class DaemonManager:
    """
    Main daemon process for Multica Orchestrator.

    Manages:
    - Socket.IO server for real-time communication
    - Agent detection and status tracking
    - Task queue processing
    - Unix socket commands from CLI
    - Health monitoring and PID file management

    Attributes:
        workspace_path: Root path of the workspace being managed.
        port: Port for the Socket.IO server (default: 8765).
        pid_file: Path to the PID file for daemon tracking.
        socket_path: Path to the Unix socket for CLI commands.
    """

    def __init__(
        self,
        workspace_path: str | Path,
        port: int = 8765,
        pid_file: Optional[str | Path] = None,
        socket_path: Optional[str | Path] = None,
    ):
        """
        Initialize the DaemonManager.

        Args:
            workspace_path: Root path of the workspace to manage.
            port: Port for the Socket.IO server. Defaults to 8765.
            pid_file: Optional custom path for PID file.
                Defaults to .forgewright/daemon.pid in workspace.
            socket_path: Optional custom path for Unix socket.
                Defaults to .forgewright/daemon.sock in workspace.
        """
        self.workspace_path = Path(workspace_path).resolve()
        self.port = port

        # Resolve default paths
        forgewright_dir = self.workspace_path / ".forgewright"
        forgewright_dir.mkdir(exist_ok=True)

        self.pid_file = Path(pid_file) if pid_file else forgewright_dir / "daemon.pid"
        self.socket_path = Path(socket_path) if socket_path else forgewright_dir / "daemon.sock"

        # Internal state
        self._status = DaemonStatus.STOPPED
        self._start_time: Optional[datetime] = None
        self._server: Optional[Any] = None
        self._socket_server: Optional[asyncio.Server] = None
        self._agent_detector: Optional[Any] = None
        self._task_queue: asyncio.Queue = field(default_factory=asyncio.Queue)
        self._health_metrics = HealthMetrics()
        self._shutdown_event = asyncio.Event()
        self._lock = threading.Lock()

        # Initialize logger
        self._setup_logging()

        # Signal handlers
        self._setup_signal_handlers()

    def _setup_logging(self) -> None:
        """Configure structured logging."""
        if STRUCTLOG_AVAILABLE:
            structlog.configure(
                processors=[
                    structlog.processors.TimeStamper(fmt="iso"),
                    structlog.processors.add_log_level,
                    structlog.processors.JSONRenderer(),
                ],
                wrapper_class=structlog.make_filtering_bound_logger(logging_level="INFO"),
                context_class=dict,
                logger_factory=structlog.PrintLoggerFactory(),
            )
            self.logger = structlog.get_logger("multica-daemon")
        else:
            import logging
            logging.basicConfig(
                level=logging.INFO,
                format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
            )
            self.logger = logging.getLogger("multica-daemon")

    def _setup_signal_handlers(self) -> None:
        """Set up signal handlers for graceful shutdown."""
        self._original_sigterm = signal.signal(signal.SIGTERM, self._signal_handler)
        self._original_sigint = signal.signal(signal.SIGINT, self._signal_handler)

    def _signal_handler(self, signum: int, frame: Any) -> None:
        """Handle shutdown signals gracefully."""
        sig_name = signal.Signals(signum).name
        self.logger.info("shutdown_signal_received", signal=sig_name)
        asyncio.create_task(self.stop())

    # =========================================================================
    # PID File Management
    # =========================================================================

    def _write_pid_file(self) -> None:
        """Write the current process PID to the PID file."""
        self.pid_file.parent.mkdir(parents=True, exist_ok=True)
        self.pid_file.write_text(str(os.getpid()))
        self.logger.debug("pid_file_written", path=str(self.pid_file), pid=os.getpid())

    def _read_pid_file(self) -> Optional[int]:
        """Read the PID from the PID file."""
        try:
            if self.pid_file.exists():
                return int(self.pid_file.read_text().strip())
        except (ValueError, IOError):
            pass
        return None

    def _remove_pid_file(self) -> None:
        """Remove the PID file if it exists."""
        try:
            if self.pid_file.exists():
                self.pid_file.unlink()
                self.logger.debug("pid_file_removed", path=str(self.pid_file))
        except IOError as e:
            self.logger.warning("pid_file_removal_failed", error=str(e))

    def _is_pid_running(self, pid: int) -> bool:
        """Check if a process with the given PID is running."""
        try:
            os.kill(pid, 0)
            return True
        except OSError:
            return False

    # =========================================================================
    # Lifecycle Methods
    # =========================================================================

    def start(self) -> bool:
        """
        Start the daemon process.

        Returns:
            True if daemon started successfully, False otherwise.
        """
        with self._lock:
            if self.is_running():
                self.logger.warning("daemon_already_running")
                return False

            self._status = DaemonStatus.STARTING
            self.logger.info("daemon_starting", workspace=str(self.workspace_path), port=self.port)

            try:
                # Check if another daemon is already running
                existing_pid = self._read_pid_file()
                if existing_pid and self._is_pid_running(existing_pid):
                    self.logger.error("daemon_already_running", pid=existing_pid)
                    self._status = DaemonStatus.ERROR
                    return False

                # Write PID file
                self._write_pid_file()

                # Run the async main loop
                asyncio.run(self._async_start())

                return True

            except Exception as e:
                self.logger.error("daemon_start_failed", error=str(e), exc_info=True)
                self._status = DaemonStatus.ERROR
                self._remove_pid_file()
                return False

    async def _async_start(self) -> None:
        """Async startup sequence."""
        self._start_time = datetime.now(timezone.utc)
        self._status = DaemonStatus.RUNNING
        self.logger.info("daemon_started", pid=os.getpid())

        try:
            # Start Socket.IO server
            await self._start_socketio_server()

            # Start Unix socket for CLI commands
            await self._start_cli_socket()

            # Detect available agents
            await self._detect_agents()

            # Start health monitoring
            asyncio.create_task(self._health_monitor())

            # Start task queue processor
            asyncio.create_task(self._process_task_queue())

            # Wait for shutdown signal
            await self._shutdown_event.wait()

        except Exception as e:
            self.logger.error("daemon_error", error=str(e), exc_info=True)
            self._status = DaemonStatus.ERROR
            raise
        finally:
            await self._cleanup()

    async def stop(self) -> bool:
        """
        Stop the daemon process gracefully.

        Returns:
            True if daemon stopped successfully, False otherwise.
        """
        with self._lock:
            if not self.is_running():
                self.logger.warning("daemon_not_running")
                return False

            self._status = DaemonStatus.STOPPING
            self.logger.info("daemon_stopping")

            # Signal shutdown
            self._shutdown_event.set()

            return True

    async def _cleanup(self) -> None:
        """Clean up resources on shutdown."""
        # Close Socket.IO server
        if self._server is not None:
            try:
                await self._server.shutdown()
            except Exception as e:
                self.logger.warning("socketio_cleanup_error", error=str(e))

        # Close Unix socket
        if self._socket_server is not None:
            try:
                self._socket_server.close()
                await self._socket_server.wait_closed()
            except Exception as e:
                self.logger.warning("socket_cleanup_error", error=str(e))

        # Remove socket file
        if self.socket_path.exists():
            try:
                self.socket_path.unlink()
            except IOError:
                pass

        # Remove PID file
        self._remove_pid_file()

        self._status = DaemonStatus.STOPPED
        self.logger.info("daemon_stopped")

    # =========================================================================
    # Socket.IO Server
    # =========================================================================

    async def _start_socketio_server(self) -> None:
        """Start the Socket.IO server for real-time communication."""
        try:
            import socketio

            sio = socketio.AsyncServer(
                async_mode="asgi",
                cors_allowed_origins="*",
                logger=self.logger,
            )

            # Register event handlers
            @sio.event
            async def connect(sid: str, environ: dict) -> None:
                self.logger.info("socketio_client_connected", sid=sid)

            @sio.event
            async def disconnect(sid: str) -> None:
                self.logger.info("socketio_client_disconnected", sid=sid)

            @sio.event
            async def task_submit(sid: str, data: dict) -> dict:
                """Handle task submission from clients."""
                task_id = data.get("task_id")
                task_type = data.get("type")
                payload = data.get("payload", {})

                self.logger.info("task_submitted", task_id=task_id, type=task_type)
                await self._task_queue.put({
                    "task_id": task_id,
                    "type": task_type,
                    "payload": payload,
                    "submitted_at": datetime.now(timezone.utc).isoformat(),
                })

                return {"status": "queued", "task_id": task_id}

            @sio.event
            async def agent_list(sid: str) -> dict:
                """Return list of detected agents."""
                agents = await self._get_detected_agents()
                return {"agents": agents}

            @sio.event
            async def health_check(sid: str) -> dict:
                """Return daemon health status."""
                return self.status()

            self._server = sio
            self.logger.info("socketio_server_started", port=self.port)

        except ImportError:
            self.logger.warning("python-socketio_not_installed", url="pip install python-socketio")
            self._server = None

    # =========================================================================
    # Unix Socket for CLI Commands
    # =========================================================================

    async def _start_cli_socket(self) -> None:
        """Start Unix socket server for CLI command interface."""
        if self.socket_path.exists():
            self.socket_path.unlink()

        self._socket_server = await asyncio.start_unix_server(
            self._handle_cli_connection,
            path=str(self.socket_path),
        )

        # Set socket permissions
        os.chmod(self.socket_path, 0o600)
        self.logger.info("cli_socket_started", path=str(self.socket_path))

    async def _handle_cli_connection(
        self,
        reader: asyncio.StreamReader,
        writer: asyncio.StreamWriter,
    ) -> None:
        """Handle a CLI connection."""
        addr = self.socket_path
        self.logger.debug("cli_connection_opened", path=str(addr))

        try:
            # Read command (4-byte length prefix + JSON data)
            length_data = await reader.readexactly(4)
            length = struct.unpack("!I", length_data)[0]
            data = await reader.readexactly(length)
            command = json.loads(data.decode("utf-8"))

            # Process command
            result = await self._process_cli_command(command)

            # Send response
            response_data = json.dumps(result).encode("utf-8")
            writer.write(struct.pack("!I", len(response_data)))
            writer.write(response_data)
            await writer.drain()

        except Exception as e:
            self.logger.error("cli_command_error", error=str(e))
            error_response = json.dumps({"error": str(e)}).encode("utf-8")
            writer.write(struct.pack("!I", len(error_response)))
            writer.write(error_response)
            await writer.drain()

        finally:
            writer.close()
            await writer.wait_closed()
            self.logger.debug("cli_connection_closed", path=str(addr))

    async def _process_cli_command(self, command: dict) -> dict:
        """Process a CLI command and return the result."""
        cmd_type = command.get("type", "")

        handlers = {
            "status": lambda: self.status(),
            "health": lambda: self._get_health_status(),
            "agents": lambda: {"agents": await self._get_detected_agents()},
            "queue": lambda: {"pending": self._task_queue.qsize()},
            "stop": self.stop,
            "ping": lambda: {"pong": True},
        }

        handler = handlers.get(cmd_type)
        if handler:
            result = await asyncio.to_thread(handler) if callable(handler) and not asyncio.iscoroutinefunction(handler) else handler()
            if asyncio.iscoroutine(result):
                result = await result
            return result

        return {"error": f"Unknown command: {cmd_type}"}

    # =========================================================================
    # Agent Detection
    # =========================================================================

    async def _detect_agents(self) -> None:
        """Detect available agents on startup."""
        try:
            from .agent_manager import AgentDetector

            detector = AgentDetector()
            agents = await detector.detect_all()

            self._agent_detector = {
                "detector": detector,
                "agents": agents,
                "detected_at": datetime.now(timezone.utc).isoformat(),
            }

            for agent in agents:
                self.logger.info(
                    "agent_detected",
                    name=agent.name,
                    status=agent.status.value,
                    priority=agent.priority,
                )

        except ImportError:
            self.logger.warning("agent_manager_module_not_found")
            self._agent_detector = None

    async def _get_detected_agents(self) -> list[dict[str, Any]]:
        """Get list of detected agents."""
        if not self._agent_detector:
            return []

        return [
            {
                "name": agent.name,
                "cli": agent.cli.value,
                "status": agent.status.value,
                "version": agent.version,
                "priority": agent.priority,
                "capabilities": agent.capabilities,
            }
            for agent in self._agent_detector.get("agents", [])
        ]

    # =========================================================================
    # Task Queue Processing
    # =========================================================================

    async def _process_task_queue(self) -> None:
        """Process tasks from the queue."""
        self.logger.info("task_queue_processor_started")

        while not self._shutdown_event.is_set():
            try:
                task = await asyncio.wait_for(
                    self._task_queue.get(),
                    timeout=1.0,
                )

                self.logger.info("task_processing", task_id=task.get("task_id"))
                await self._execute_task(task)
                self._health_metrics.tasks_processed += 1

            except asyncio.TimeoutError:
                continue
            except Exception as e:
                self.logger.error("task_processing_error", error=str(e))
                self._health_metrics.tasks_failed += 1

    async def _execute_task(self, task: dict) -> None:
        """Execute a task and emit result via Socket.IO."""
        task_type = task.get("type")
        payload = task.get("payload", {})

        try:
            # Route to appropriate executor
            if task_type == "mmx":
                result = await self._execute_mmx_task(payload)
            elif task_type == "shell":
                result = await self._execute_shell_task(payload)
            else:
                result = {"error": f"Unknown task type: {task_type}"}

            # Emit result via Socket.IO
            if self._server:
                await self._server.emit("task_complete", {
                    "task_id": task.get("task_id"),
                    "result": result,
                })

        except Exception as e:
            self.logger.error("task_execution_failed", task_id=task.get("task_id"), error=str(e))

    async def _execute_mmx_task(self, payload: dict) -> dict:
        """Execute a task via mmx-cli."""
        try:
            from .mmx_executor import MMxExecutor

            executor = MMxExecutor()
            prompt = payload.get("prompt", "")
            result = await executor.execute(prompt)

            return {
                "success": True,
                "output": result.output if hasattr(result, "output") else str(result),
            }

        except ImportError:
            return {"error": "mmx_executor module not available"}
        except Exception as e:
            return {"error": str(e)}

    async def _execute_shell_task(self, payload: dict) -> dict:
        """Execute a shell command task."""
        try:
            cmd = payload.get("command", "")
            timeout = payload.get("timeout", 300)

            process = await asyncio.create_subprocess_shell(
                cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )

            stdout, stderr = await asyncio.wait_for(
                process.communicate(),
                timeout=timeout,
            )

            return {
                "success": process.returncode == 0,
                "returncode": process.returncode,
                "stdout": stdout.decode(),
                "stderr": stderr.decode(),
            }

        except asyncio.TimeoutError:
            process.kill()
            return {"error": "Command timed out"}
        except Exception as e:
            return {"error": str(e)}

    # =========================================================================
    # Health Monitoring
    # =========================================================================

    async def _health_monitor(self) -> None:
        """Monitor daemon health and update metrics."""
        self.logger.info("health_monitor_started")

        while not self._shutdown_event.is_set():
            try:
                # Update uptime
                if self._start_time:
                    elapsed = datetime.now(timezone.utc) - self._start_time
                    self._health_metrics.uptime_seconds = elapsed.total_seconds()

                # Update memory usage
                try:
                    import resource
                    usage = resource.getrusage(resource.RUSAGE_SELF)
                    self._health_metrics.memory_usage_mb = usage.ru_maxrss / 1024
                except (ImportError, AttributeError):
                    pass

                # Update queue size
                self._health_metrics.tasks_pending = self._task_queue.qsize()

                # Update last health check
                self._health_metrics.last_health_check = datetime.now(timezone.utc)

                # Log health metrics periodically
                self.logger.debug(
                    "health_update",
                    uptime=self._health_metrics.uptime_seconds,
                    memory_mb=self._health_metrics.memory_usage_mb,
                    tasks_pending=self._health_metrics.tasks_pending,
                )

                await asyncio.sleep(30)  # Check every 30 seconds

            except Exception as e:
                self.logger.error("health_monitor_error", error=str(e))
                await asyncio.sleep(30)

    def _get_health_status(self) -> dict[str, Any]:
        """Get current health status."""
        return {
            "status": self._status.value,
            "uptime_seconds": self._health_metrics.uptime_seconds,
            "tasks_processed": self._health_metrics.tasks_processed,
            "tasks_pending": self._health_metrics.tasks_pending,
            "tasks_failed": self._health_metrics.tasks_failed,
            "memory_usage_mb": self._health_metrics.memory_usage_mb,
            "last_health_check": (
                self._health_metrics.last_health_check.isoformat()
                if self._health_metrics.last_health_check
                else None
            ),
        }

    # =========================================================================
    # Status and Query Methods
    # =========================================================================

    def is_running(self) -> bool:
        """
        Check if the daemon is currently running.

        Returns:
            True if daemon is running, False otherwise.
        """
        if self._status == DaemonStatus.RUNNING:
            return True

        # Check PID file
        pid = self._read_pid_file()
        if pid and self._is_pid_running(pid):
            return True

        return False

    def status(self) -> dict[str, Any]:
        """
        Get the current daemon status.

        Returns:
            Dictionary with status information including:
            - status: Current DaemonStatus value
            - pid: Process ID if running
            - port: Socket.IO server port
            - uptime_seconds: Seconds since startup
            - health: Current health metrics
            - agents: List of detected agents
        """
        pid = self._read_pid_file()

        status_dict = {
            "status": self._status.value,
            "running": self.is_running(),
            "pid": pid,
            "port": self.port,
            "workspace": str(self.workspace_path),
            "socket_path": str(self.socket_path),
            "start_time": self._start_time.isoformat() if self._start_time else None,
        }

        # Add health metrics if running
        if self._status == DaemonStatus.RUNNING:
            status_dict["health"] = self._get_health_status()

            # Add agent info if available
            if self._agent_detector:
                status_dict["agents_detected"] = len(self._agent_detector.get("agents", []))
                status_dict["agents_last_check"] = self._agent_detector.get("detected_at")

        return status_dict


# =============================================================================
# CLI Entry Point
# =============================================================================

def main() -> None:
    """Entry point for running the daemon directly."""
    import argparse

    parser = argparse.ArgumentParser(description="Multica Orchestrator Daemon")
    parser.add_argument(
        "--workspace",
        "-w",
        default=os.getcwd(),
        help="Workspace path (default: current directory)",
    )
    parser.add_argument(
        "--port",
        "-p",
        type=int,
        default=8765,
        help="Socket.IO server port (default: 8765)",
    )
    parser.add_argument(
        "--foreground",
        "-f",
        action="store_true",
        help="Run in foreground (don't daemonize)",
    )

    args = parser.parse_args()

    manager = DaemonManager(
        workspace_path=args.workspace,
        port=args.port,
    )

    if args.foreground:
        # Run in foreground
        asyncio.run(manager._async_start())
    else:
        # Daemonize and start
        manager.start()


if __name__ == "__main__":
    main()
