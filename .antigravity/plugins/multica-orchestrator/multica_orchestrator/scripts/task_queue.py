"""
Task Queue System with Priority Routing

A thread-safe task queue that manages agent task assignment based on
capabilities and priority. Tasks are persisted to JSON for durability.

Example:
    >>> queue = TaskQueue("/tmp/tasks.json")
    >>> task_id = queue.enqueue(Task(
    ...     title="Process image",
    ...     description="Resize and optimize image",
    ...     required_skills=["image_processing"],
    ...     priority=8
    ... ))
    >>> agent = Agent(agent_id="worker1", skills=["image_processing", "api"])
    >>> task = queue.claim(agent)
    >>> task.id == task_id
    True
"""

from __future__ import annotations

import asyncio
import json
from dataclasses import dataclass, asdict, field
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Optional


class TaskStatus(Enum):
    """Possible states for a task in the queue."""
    PENDING = "pending"
    CLAIMED = "claimed"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


@dataclass
class Task:
    """Represents a unit of work to be executed by an agent.

    Attributes:
        id: Unique identifier (UUID string).
        title: Brief summary of the task.
        description: Detailed description.
        required_skills: List of skill names needed to complete this task.
        priority: Priority level from 1 (lowest) to 10 (highest).
        status: Current state of the task.
        assigned_agent: Agent ID that claimed/owns this task.
        created_at: Timestamp when task was created.
        started_at: Timestamp when agent started working on task.
        completed_at: Timestamp when task finished.
        result: Result data (if completed).
        error: Error message (if failed).
    """
    id: str = ""
    title: str = ""
    description: str = ""
    required_skills: list[str] = field(default_factory=list)
    priority: int = 5
    status: TaskStatus = TaskStatus.PENDING
    assigned_agent: Optional[str] = None
    created_at: Optional[str] = None
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    result: Optional[dict] = None
    error: Optional[str] = None

    def __post_init__(self) -> None:
        if self.created_at is None:
            self.created_at = datetime.utcnow().isoformat()
        if not isinstance(self.status, TaskStatus):
            self.status = TaskStatus(self.status)

    def to_dict(self) -> dict:
        """Convert task to dictionary for serialization."""
        data = asdict(self)
        data["status"] = self.status.value
        return data

    @classmethod
    def from_dict(cls, data: dict) -> Task:
        """Create task from dictionary."""
        if isinstance(data.get("status"), str):
            data["status"] = TaskStatus(data["status"])
        return cls(**data)


class TaskQueue:
    """Thread-safe task queue with priority-based routing.

    Manages task lifecycle from enqueue through completion or failure.
    Persists state to JSON file for durability across restarts.

    Example:
        >>> queue = TaskQueue("/tmp/queue.json")
        >>> task_id = queue.enqueue(Task(
        ...     id="task-1",
        ...     title="Build feature",
        ...     description="Implement login",
        ...     required_skills=["backend"],
        ...     priority=7
        ... ))
        >>> pending = queue.get_pending()
        >>> len(pending)
        1
        >>> queue.complete(task_id, {"success": True})
        >>> queue.get_task(task_id).status
        <TaskStatus.COMPLETED: 'completed'>
    """

    def __init__(self, storage_path: str | Path) -> None:
        """Initialize the task queue.

        Args:
            storage_path: Path to JSON file for persistence.
        """
        self.storage_path = Path(storage_path)
        self._lock = asyncio.Lock()
        self._tasks: dict[str, Task] = {}
        self._load()

    def _load(self) -> None:
        """Load tasks from JSON storage file."""
        if self.storage_path.exists():
            try:
                with open(self.storage_path, "r") as f:
                    data = json.load(f)
                    self._tasks = {
                        task_id: Task.from_dict(task_data)
                        for task_id, task_data in data.items()
                    }
            except (json.JSONDecodeError, KeyError, TypeError):
                self._tasks = {}

    def _save(self) -> None:
        """Persist tasks to JSON storage file."""
        self.storage_path.parent.mkdir(parents=True, exist_ok=True)
        with open(self.storage_path, "w") as f:
            json.dump(
                {task_id: task.to_dict() for task_id, task in self._tasks.items()},
                f,
                indent=2
            )

    async def enqueue(self, task: Task) -> str:
        """Add a new task to the queue.

        Args:
            task: Task instance to enqueue.

        Returns:
            The task ID.
        """
        async with self._lock:
            task.status = TaskStatus.PENDING
            if task.created_at is None:
                task.created_at = datetime.utcnow().isoformat()
            self._tasks[task.id] = task
            self._save()
            return task.id

    def enqueue_sync(self, task: Task) -> str:
        """Synchronous version of enqueue for non-async contexts."""
        task.status = TaskStatus.PENDING
        if task.created_at is None:
            task.created_at = datetime.utcnow().isoformat()
        self._tasks[task.id] = task
        self._save()
        return task.id

    async def claim(
        self,
        agent: "Agent"  # type: ignore[name-defined] # Forward reference
    ) -> Optional[Task]:
        """Claim the highest-priority matching task for an agent.

        Finds pending tasks where all required_skills are present in the
        agent's capabilities, sorted by priority (desc) then created_at (asc).

        Args:
            agent: Agent with skills attribute.

        Returns:
            Claimed task or None if no matching tasks available.
        """
        async with self._lock:
            matching = [
                task for task in self._tasks.values()
                if task.status == TaskStatus.PENDING
                and all(skill in agent.skills for skill in task.required_skills)
            ]

            if not matching:
                return None

            matching.sort(key=lambda t: (-t.priority, t.created_at))
            task = matching[0]

            task.status = TaskStatus.CLAIMED
            task.assigned_agent = agent.agent_id
            task.started_at = datetime.utcnow().isoformat()

            self._save()
            return task

    def claim_sync(
        self,
        agent_skills: list[str],
        agent_id: str = "unknown"
    ) -> Optional[Task]:
        """Synchronous claim for non-async contexts.

        Args:
            agent_skills: List of skills the agent possesses.
            agent_id: Agent identifier.

        Returns:
            Claimed task or None.
        """
        matching = [
            task for task in self._tasks.values()
            if task.status == TaskStatus.PENDING
            and all(skill in agent_skills for skill in task.required_skills)
        ]

        if not matching:
            return None

        matching.sort(key=lambda t: (-t.priority, t.created_at))
        task = matching[0]

        task.status = TaskStatus.CLAIMED
        task.assigned_agent = agent_id
        task.started_at = datetime.utcnow().isoformat()

        self._save()
        return task

    async def complete(self, task_id: str, result: dict) -> bool:
        """Mark a task as completed with result data.

        Args:
            task_id: ID of the task to complete.
            result: Result data to store.

        Returns:
            True if task was found and updated, False otherwise.
        """
        async with self._lock:
            if task_id not in self._tasks:
                return False

            task = self._tasks[task_id]
            task.status = TaskStatus.COMPLETED
            task.result = result
            task.completed_at = datetime.utcnow().isoformat()
            self._save()
            return True

    def complete_sync(self, task_id: str, result: dict) -> bool:
        """Synchronous version of complete."""
        if task_id not in self._tasks:
            return False

        task = self._tasks[task_id]
        task.status = TaskStatus.COMPLETED
        task.result = result
        task.completed_at = datetime.utcnow().isoformat()
        self._save()
        return True

    async def fail(self, task_id: str, error: str) -> bool:
        """Mark a task as failed with error message.

        Args:
            task_id: ID of the task that failed.
            error: Error description.

        Returns:
            True if task was found and updated, False otherwise.
        """
        async with self._lock:
            if task_id not in self._tasks:
                return False

            task = self._tasks[task_id]
            task.status = TaskStatus.FAILED
            task.error = error
            task.completed_at = datetime.utcnow().isoformat()
            self._save()
            return True

    def fail_sync(self, task_id: str, error: str) -> bool:
        """Synchronous version of fail."""
        if task_id not in self._tasks:
            return False

        task = self._tasks[task_id]
        task.status = TaskStatus.FAILED
        task.error = error
        task.completed_at = datetime.utcnow().isoformat()
        self._save()
        return True

    async def get_pending(self) -> list[Task]:
        """Get all pending tasks.

        Returns:
            List of tasks with PENDING status.
        """
        async with self._lock:
            return [
                task for task in self._tasks.values()
                if task.status == TaskStatus.PENDING
            ]

    def get_pending_sync(self) -> list[Task]:
        """Synchronous version of get_pending."""
        return [
            task for task in self._tasks.values()
            if task.status == TaskStatus.PENDING
        ]

    async def get_task(self, task_id: str) -> Optional[Task]:
        """Retrieve a task by ID.

        Args:
            task_id: Task identifier.

        Returns:
            Task instance or None if not found.
        """
        async with self._lock:
            return self._tasks.get(task_id)

    def get_task_sync(self, task_id: str) -> Optional[Task]:
        """Synchronous version of get_task."""
        return self._tasks.get(task_id)

    async def update_status(self, task_id: str, status: TaskStatus) -> bool:
        """Update the status of a task.

        Args:
            task_id: Task identifier.
            status: New status value.

        Returns:
            True if task was found and updated, False otherwise.
        """
        async with self._lock:
            if task_id not in self._tasks:
                return False

            self._tasks[task_id].status = status
            self._save()
            return True

    def update_status_sync(self, task_id: str, status: TaskStatus) -> bool:
        """Synchronous version of update_status."""
        if task_id not in self._tasks:
            return False

        self._tasks[task_id].status = status
        self._save()
        return True


if __name__ == "__main__":
    import tempfile
    from dataclasses import dataclass, field

    @dataclass
    class Agent:
        """Minimal agent for testing."""
        agent_id: str
        skills: list[str]

    with tempfile.NamedTemporaryFile(suffix=".json", delete=False) as f:
        path = f.name

    queue = TaskQueue(path)

    task1 = Task(
        id="task-1",
        title="Low priority",
        description="Do something",
        required_skills=["python"],
        priority=3
    )
    task2 = Task(
        id="task-2",
        title="High priority",
        description="Do something urgent",
        required_skills=["python"],
        priority=9
    )
    task3 = Task(
        id="task-3",
        title="Requires Rust",
        description="Rust task",
        required_skills=["rust"],
        priority=10
    )

    queue.enqueue_sync(task1)
    queue.enqueue_sync(task2)
    queue.enqueue_sync(task3)

    agent = Agent(agent_id="worker-1", skills=["python", "testing"])

    claimed = queue.claim_sync(agent.skills, agent.agent_id)
    print(f"Claimed: {claimed.title} (priority={claimed.priority})")

    pending = queue.get_pending_sync()
    print(f"Pending count: {len(pending)}")

    queue.complete_sync("task-2", {"output": "done"})
    completed = queue.get_task_sync("task-2")
    print(f"Status: {completed.status.value}")

    queue.fail_sync("task-3", "Rust not available")
    failed = queue.get_task_sync("task-3")
    print(f"Error: {failed.error}")

    import os
    os.unlink(path)
