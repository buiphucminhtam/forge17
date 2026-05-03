"""Task execution via mmx-cli (Minimax CLI)."""

from __future__ import annotations

import asyncio
import shutil
import time
from dataclasses import dataclass, field
from typing import AsyncIterator, Optional

from .base import TaskResult
from .task_queue import Task


@dataclass
class MMxTaskResult(TaskResult):
    """Result of an MMx execution."""

    command: str = ""


class MMxExecutor:
    """Executor for running tasks via mmx-cli."""

    def __init__(self, timeout: int = 300):
        """
        Initialize MMxExecutor.

        Args:
            timeout: Default timeout in seconds for task execution.
        """
        self.timeout = timeout
        self._executable: Optional[str] = None

    def is_available(self) -> bool:
        """
        Check if mmx CLI is available on the system.

        Returns:
            True if mmx is installed and accessible, False otherwise.
        """
        mmx_path = shutil.which("mmx")
        self._executable = mmx_path
        return mmx_path is not None

    def auth_status(self) -> tuple[bool, Optional[str]]:
        """
        Check if mmx CLI is authenticated.

        Returns:
            Tuple of (is_authenticated, error_message).
        """
        if not self.is_available():
            return False, "mmx CLI is not installed"

        try:
            proc = asyncio.run(self._run_command(["mmx", "auth", "status"]))
            if proc.returncode == 0:
                return True, None
            return False, proc.stderr or "Authentication check failed"
        except Exception as e:
            return False, str(e)

    def execute(self, task: Task, timeout: Optional[int] = None) -> MMxTaskResult:
        """
        Execute a task using mmx chat.

        Args:
            task: The task to execute.
            timeout: Optional timeout in seconds (defaults to self.timeout).

        Returns:
            MMxTaskResult with execution details.
        """
        if not task.description:
            return MMxTaskResult(
                success=False,
                output="",
                error="Task description is required",
                duration=0.0,
                command="",
            )

        timeout = timeout or self.timeout
        start_time = time.time()
        command = ["mmx", "chat", task.description]

        try:
            proc = asyncio.run(self._run_command(command, timeout=timeout))
            duration = time.time() - start_time

            return MMxTaskResult(
                success=proc.returncode == 0,
                output=proc.stdout,
                error=proc.stderr if proc.returncode != 0 else None,
                duration=duration,
                command=" ".join(command),
            )
        except asyncio.TimeoutError:
            duration = time.time() - start_time
            return MMxTaskResult(
                success=False,
                output="",
                error=f"Task execution timed out after {timeout} seconds",
                duration=duration,
                command=" ".join(command),
            )
        except Exception as e:
            duration = time.time() - start_time
            return MMxTaskResult(
                success=False,
                output="",
                error=f"Execution failed: {str(e)}",
                duration=duration,
                command=" ".join(command),
            )

    async def execute_async(
        self, task: Task, timeout: Optional[int] = None
    ) -> MMxTaskResult:
        """
        Execute a task asynchronously using mmx chat.

        Args:
            task: The task to execute.
            timeout: Optional timeout in seconds (defaults to self.timeout).

        Returns:
            MMxTaskResult with execution details.
        """
        if not task.description:
            return MMxTaskResult(
                success=False,
                output="",
                error="Task description is required",
                duration=0.0,
                command="",
            )

        timeout = timeout or self.timeout
        start_time = time.time()
        command = ["mmx", "chat", task.description]

        try:
            proc = await self._run_command_async(command, timeout=timeout)
            duration = time.time() - start_time

            return MMxTaskResult(
                success=proc.returncode == 0,
                output=proc.stdout,
                error=proc.stderr if proc.returncode != 0 else None,
                duration=duration,
                command=" ".join(command),
            )
        except asyncio.TimeoutError:
            duration = time.time() - start_time
            return MMxTaskResult(
                success=False,
                output="",
                error=f"Task execution timed out after {timeout} seconds",
                duration=duration,
                command=" ".join(command),
            )
        except Exception as e:
            duration = time.time() - start_time
            return MMxTaskResult(
                success=False,
                output="",
                error=f"Execution failed: {str(e)}",
                duration=duration,
                command=" ".join(command),
            )

    def stream(self, task: Task, timeout: Optional[int] = None) -> AsyncIterator[str]:
        """
        Stream task execution output line by line.

        Args:
            task: The task to execute.
            timeout: Optional timeout in seconds (defaults to self.timeout).

        Yields:
            Lines of output from the mmx chat stream.

        Raises:
            asyncio.TimeoutError: If execution times out.
            RuntimeError: If task description is empty or execution fails.
        """
        if not task.description:
            raise RuntimeError("Task description is required")

        timeout = timeout or self.timeout
        command = ["mmx", "chat", "--stream", task.description]

        return self._stream_command(command, timeout=timeout)

    async def stream_async(
        self, task: Task, timeout: Optional[int] = None
    ) -> AsyncIterator[str]:
        """
        Stream task execution output line by line (async version).

        Args:
            task: The task to execute.
            timeout: Optional timeout in seconds (defaults to self.timeout).

        Yields:
            Lines of output from the mmx chat stream.

        Raises:
            asyncio.TimeoutError: If execution times out.
            RuntimeError: If task description is empty or execution fails.
        """
        if not task.description:
            raise RuntimeError("Task description is required")

        timeout = timeout or self.timeout
        command = ["mmx", "chat", "--stream", task.description]

        async for line in self._stream_command_async(command, timeout=timeout):
            yield line

    async def _stream_command(
        self, command: list[str], timeout: int
    ) -> AsyncIterator[str]:
        """Internal: stream command output asynchronously."""

        async def _run():
            return await self._stream_command_async(command, timeout=timeout)

        async for line in _run():
            yield line

    async def _stream_command_async(
        self, command: list[str], timeout: int
    ) -> AsyncIterator[str]:
        """Internal: run command and stream output line by line."""
        process = None
        try:
            process = await asyncio.create_subprocess_exec(
                *command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )

            try:
                await asyncio.wait_for(
                    self._read_stream(process.stdout), timeout=timeout
                )
            except asyncio.TimeoutError:
                process.kill()
                raise asyncio.TimeoutError(
                    f"Process timed out after {timeout} seconds"
                )

            await process.wait()

            if process.returncode != 0:
                stderr = await process.stderr.read()
                raise RuntimeError(
                    f"Command failed with exit code {process.returncode}: {stderr.decode()}"
                )

        except asyncio.TimeoutError:
            if process:
                process.kill()
                await process.wait()
            raise
        except Exception:
            if process:
                process.kill()
                await process.wait()
            raise

    async def _read_stream(self, stream: asyncio.StreamReader) -> AsyncIterator[str]:
        """Internal: read stream line by line."""
        while True:
            line = await stream.readline()
            if not line:
                break
            yield line.decode("utf-8", errors="replace")

    async def _run_command(
        self, command: list[str], timeout: int
    ) -> _SubprocessResult:
        """Internal: run command and return result."""
        process = await asyncio.create_subprocess_exec(
            *command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )

        try:
            stdout, stderr = await asyncio.wait_for(
                process.communicate(), timeout=timeout
            )
            return _SubprocessResult(
                returncode=process.returncode,
                stdout=stdout.decode("utf-8", errors="replace"),
                stderr=stderr.decode("utf-8", errors="replace"),
            )
        except asyncio.TimeoutError:
            process.kill()
            await process.wait()
            raise

    async def _run_command_async(
        self, command: list[str], timeout: int
    ) -> _SubprocessResult:
        """Internal: async run command and return result."""
        return await self._run_command(command, timeout)


@dataclass
class _SubprocessResult:
    """Internal: subprocess execution result."""

    returncode: int
    stdout: str
    stderr: str
