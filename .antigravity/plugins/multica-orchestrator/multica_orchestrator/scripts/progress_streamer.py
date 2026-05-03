"""WebSocket progress streaming using Socket.IO for Multica Orchestrator."""

from __future__ import annotations

import asyncio
import json
import logging
from typing import Any, Optional

import socketio

logger = logging.getLogger(__name__)


class Event:
    """Socket.IO event protocol constants."""
    CONNECT = "connect"
    DISCONNECT = "disconnect"
    TASK_CREATE = "task_create"
    TASK_MOVE = "task_move"
    TASK_ASSIGN = "task_assign"
    TASK_UPDATE = "task_update"
    TASK_DELETE = "task_delete"
    PROGRESS_UPDATE = "progress_update"
    AGENT_REGISTER = "agent_register"
    AGENT_UNREGISTER = "agent_unregister"
    AGENT_STATUS = "agent_status"
    SYNC_STATE = "sync_state"
    ERROR = "error"


class ProgressStreamer:
    """
    WebSocket progress streaming server using Socket.IO.

    Manages real-time task and agent state synchronization across
    multiple connected clients.

    Example:
        >>> server = ProgressStreamer()
        >>> await server.start(host="0.0.0.0", port=8765)
        >>> # Clients can now connect and receive real-time updates
    """

    def __init__(self) -> None:
        """Initialize the progress streamer with Socket.IO async server."""
        self._sio = socketio.AsyncServer(
            cors_allowed_origins="*",
            async_mode="asgi",
            logger=False,
            engineio_logger=False,
        )
        self._app: Optional[socketio.AsyncApp] = None
        self._agents: dict[str, dict[str, Any]] = {}
        self._tasks: dict[str, dict[str, Any]] = {}
        self._clients: set[str] = set()
        self._running = False

    @property
    def sio(self) -> socketio.AsyncServer:
        """Get the underlying Socket.IO server instance."""
        return self._sio

    @property
    def app(self) -> socketio.AsyncApp:
        """Get the ASGI application."""
        if self._app is None:
            self._app = socketio.ASGIApp(self._sio, static_files={})
        return self._app

    async def start(self, host: str = "0.0.0.0", port: int = 8765) -> None:
        """
        Start the WebSocket server.

        Args:
            host: Host to bind to.
            port: Port to bind to.
        """
        import uvicorn

        config = uvicorn.Config(
            self.app,
            host=host,
            port=port,
            log_level="warning",
        )
        server = uvicorn.Server(config)
        self._running = True
        logger.info(f"Starting progress streamer on {host}:{port}")
        await server.serve()

    async def stop(self) -> None:
        """Stop the WebSocket server."""
        self._running = False
        self._agents.clear()
        self._tasks.clear()
        self._clients.clear()
        logger.info("Progress streamer stopped")

    def _register_events(self) -> None:
        """Register all Socket.IO event handlers."""
        self._sio.on(Event.CONNECT, self._on_connect)
        self._sio.on(Event.DISCONNECT, self._on_disconnect)
        self._sio.on(Event.TASK_CREATE, self._on_task_create)
        self._sio.on(Event.TASK_MOVE, self._on_task_move)
        self._sio.on(Event.TASK_ASSIGN, self._on_task_assign)
        self._sio.on(Event.TASK_UPDATE, self._on_task_update)
        self._sio.on(Event.TASK_DELETE, self._on_task_delete)
        self._sio.on(Event.PROGRESS_UPDATE, self._on_progress_update)
        self._sio.on(Event.AGENT_REGISTER, self._on_agent_register)
        self._sio.on(Event.AGENT_UNREGISTER, self._on_agent_unregister)

    async def _on_connect(self, sid: str, data: dict[str, Any]) -> None:
        """
        Handle client connection.

        Sends current state (tasks and agents) to the newly connected client.

        Args:
            sid: Socket session ID.
            data: Connection data from client.
        """
        self._clients.add(sid)
        logger.info(f"Client connected: {sid}")

        state = {
            "tasks": list(self._tasks.values()),
            "agents": list(self._agents.values()),
        }
        await self._sio.emit(Event.SYNC_STATE, state, room=sid)

    async def _on_disconnect(self, sid: str) -> None:
        """
        Handle client disconnection.

        Args:
            sid: Socket session ID.
        """
        self._clients.discard(sid)
        logger.info(f"Client disconnected: {sid}")

    async def _on_task_create(
        self, sid: str, data: dict[str, Any]
    ) -> dict[str, Any]:
        """
        Handle task creation event.

        Args:
            sid: Socket session ID.
            data: Task data containing id, title, description, etc.

        Returns:
            Confirmation with task_id.
        """
        try:
            task_id = data.get("id")
            if not task_id:
                return {"success": False, "error": "Task id is required"}

            self._tasks[task_id] = data
            await self.broadcast(Event.TASK_CREATE, data)

            return {"success": True, "task_id": task_id}
        except Exception as e:
            logger.error(f"Task create error: {e}")
            return {"success": False, "error": str(e)}

    async def _on_task_move(
        self, sid: str, data: dict[str, Any]
    ) -> dict[str, Any]:
        """
        Handle task move event (status change).

        Args:
            sid: Socket session ID.
            data: Task move data containing task_id and new status.

        Returns:
            Confirmation with task_id.
        """
        try:
            task_id = data.get("task_id")
            if not task_id:
                return {"success": False, "error": "Task id is required"}

            if task_id in self._tasks:
                self._tasks[task_id].update(data)
                await self.broadcast(Event.TASK_MOVE, data)
                return {"success": True, "task_id": task_id}

            return {"success": False, "error": f"Task {task_id} not found"}
        except Exception as e:
            logger.error(f"Task move error: {e}")
            return {"success": False, "error": str(e)}

    async def _on_task_assign(
        self, sid: str, data: dict[str, Any]
    ) -> dict[str, Any]:
        """
        Handle task assignment event.

        Args:
            sid: Socket session ID.
            data: Assignment data containing task_id and agent_id.

        Returns:
            Confirmation with task_id.
        """
        try:
            task_id = data.get("task_id")
            agent_id = data.get("agent_id")

            if not task_id or not agent_id:
                return {"success": False, "error": "task_id and agent_id are required"}

            if task_id in self._tasks:
                self._tasks[task_id]["assigned_agent"] = agent_id
                await self.broadcast(Event.TASK_ASSIGN, data)
                return {"success": True, "task_id": task_id}

            return {"success": False, "error": f"Task {task_id} not found"}
        except Exception as e:
            logger.error(f"Task assign error: {e}")
            return {"success": False, "error": str(e)}

    async def _on_task_update(
        self, sid: str, data: dict[str, Any]
    ) -> dict[str, Any]:
        """
        Handle general task update event.

        Args:
            sid: Socket session ID.
            data: Update data containing task_id and fields to update.

        Returns:
            Confirmation with task_id.
        """
        try:
            task_id = data.get("task_id")
            if not task_id:
                return {"success": False, "error": "Task id is required"}

            if task_id in self._tasks:
                self._tasks[task_id].update(data)
                await self.broadcast(Event.TASK_UPDATE, data)
                return {"success": True, "task_id": task_id}

            return {"success": False, "error": f"Task {task_id} not found"}
        except Exception as e:
            logger.error(f"Task update error: {e}")
            return {"success": False, "error": str(e)}

    async def _on_task_delete(
        self, sid: str, data: dict[str, Any]
    ) -> dict[str, Any]:
        """
        Handle task deletion event.

        Args:
            sid: Socket session ID.
            data: Deletion data containing task_id.

        Returns:
            Confirmation with task_id.
        """
        try:
            task_id = data.get("task_id")
            if not task_id:
                return {"success": False, "error": "Task id is required"}

            if task_id in self._tasks:
                del self._tasks[task_id]
                await self.broadcast(Event.TASK_DELETE, {"task_id": task_id})
                return {"success": True, "task_id": task_id}

            return {"success": False, "error": f"Task {task_id} not found"}
        except Exception as e:
            logger.error(f"Task delete error: {e}")
            return {"success": False, "error": str(e)}

    async def _on_progress_update(
        self, sid: str, data: dict[str, Any]
    ) -> None:
        """
        Handle progress update event.

        Broadcasts progress updates to all connected clients.

        Args:
            sid: Socket session ID.
            data: Progress data containing task_id, progress (0-100), message.
        """
        try:
            await self.broadcast(Event.PROGRESS_UPDATE, data)
        except Exception as e:
            logger.error(f"Progress update error: {e}")

    async def _on_agent_register(
        self, sid: str, data: dict[str, Any]
    ) -> dict[str, Any]:
        """
        Handle agent registration event.

        Args:
            sid: Socket session ID.
            data: Agent registration data containing agent_id, name, capabilities.

        Returns:
            Confirmation with agent_id.
        """
        try:
            agent_id = data.get("agent_id")
            if not agent_id:
                return {"success": False, "error": "agent_id is required"}

            self._agents[agent_id] = {
                "agent_id": agent_id,
                "name": data.get("name", agent_id),
                "capabilities": data.get("capabilities", []),
                "status": "active",
                "sid": sid,
            }
            await self.broadcast(Event.AGENT_REGISTER, self._agents[agent_id])

            return {"success": True, "agent_id": agent_id}
        except Exception as e:
            logger.error(f"Agent register error: {e}")
            return {"success": False, "error": str(e)}

    async def _on_agent_unregister(
        self, sid: str, data: dict[str, Any]
    ) -> dict[str, Any]:
        """
        Handle agent unregistration event.

        Args:
            sid: Socket session ID.
            data: Unregistration data containing agent_id.

        Returns:
            Confirmation with agent_id.
        """
        try:
            agent_id = data.get("agent_id")
            if not agent_id:
                return {"success": False, "error": "agent_id is required"}

            if agent_id in self._agents:
                del self._agents[agent_id]
                await self.broadcast(Event.AGENT_UNREGISTER, {"agent_id": agent_id})
                return {"success": True, "agent_id": agent_id}

            return {"success": False, "error": f"Agent {agent_id} not found"}
        except Exception as e:
            logger.error(f"Agent unregister error: {e}")
            return {"success": False, "error": str(e)}

    async def broadcast(self, event: str, data: dict[str, Any]) -> None:
        """
        Broadcast an event to all connected clients.

        Args:
            event: Event name to broadcast.
            data: Event data to send.
        """
        if not self._clients:
            return

        try:
            await self._sio.emit(event, data)
            logger.debug(f"Broadcast {event}: {json.dumps(data, default=str)[:100]}")
        except Exception as e:
            logger.error(f"Broadcast error for {event}: {e}")

    async def send_to(
        self, sid: str, event: str, data: dict[str, Any]
    ) -> None:
        """
        Send an event to a specific client.

        Args:
            sid: Target socket session ID.
            event: Event name to send.
            data: Event data to send.
        """
        try:
            await self._sio.emit(event, data, room=sid)
        except Exception as e:
            logger.error(f"Send error to {sid}: {e}")

    def get_tasks(self) -> list[dict[str, Any]]:
        """Get all current tasks."""
        return list(self._tasks.values())

    def get_agents(self) -> list[dict[str, Any]]:
        """Get all registered agents."""
        return list(self._agents.values())

    def get_task(self, task_id: str) -> dict[str, Any] | None:
        """
        Get a specific task by ID.

        Args:
            task_id: Task identifier.

        Returns:
            Task data or None if not found.
        """
        return self._tasks.get(task_id)

    def get_agent(self, agent_id: str) -> dict[str, Any] | None:
        """
        Get a specific agent by ID.

        Args:
            agent_id: Agent identifier.

        Returns:
            Agent data or None if not found.
        """
        return self._agents.get(agent_id)

    @property
    def connected_clients(self) -> int:
        """Get the number of connected clients."""
        return len(self._clients)

    @property
    def is_running(self) -> bool:
        """Check if the server is running."""
        return self._running


# Module-level singleton instance for convenience
_server: ProgressStreamer | None = None


def get_server() -> ProgressStreamer:
    """
    Get the module-level singleton server instance.

    Returns:
        The global ProgressStreamer instance.
    """
    global _server
    if _server is None:
        _server = ProgressStreamer()
    return _server


async def create_server(
    host: str = "0.0.0.0",
    port: int = 8765,
    cors_origins: str = "*",
) -> ProgressStreamer:
    """
    Create and start a new progress streamer server.

    Args:
        host: Host to bind to.
        port: Port to bind to.
        cors_origins: CORS allowed origins.

    Returns:
        Started ProgressStreamer instance.
    """
    server = ProgressStreamer()
    await server.start(host=host, port=port)
    return server


# =============================================================================
# CLI Entry Point
# =============================================================================


async def main() -> None:
    """CLI entry point for running the progress streamer server."""
    import argparse

    parser = argparse.ArgumentParser(description="Multica Orchestrator Progress Streamer")
    parser.add_argument("--host", default="0.0.0.0", help="Host to bind to")
    parser.add_argument("--port", type=int, default=8765, help="Port to bind to")
    parser.add_argument("--log-level", default="INFO", help="Logging level")
    args = parser.parse_args()

    logging.basicConfig(
        level=getattr(logging, args.log_level.upper()),
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )

    server = get_server()
    await server.start(host=args.host, port=args.port)


if __name__ == "__main__":
    asyncio.run(main())
