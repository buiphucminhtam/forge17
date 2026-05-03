"""Base dataclasses for the multica orchestrator."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional


@dataclass
class TaskResult:
    """Result of a task execution."""

    success: bool
    output: str = ""
    error: Optional[str] = None
    duration: float = 0.0


@dataclass
class Agent:
    """Represents an available agent."""

    id: str
    name: str
    cli: str
    version: Optional[str] = None
    capabilities: list[str] = None
    priority: int = 10
    status: str = "available"

    def __post_init__(self) -> None:
        if self.capabilities is None:
            self.capabilities = []
