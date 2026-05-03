"""
Agent Detection Module for Multica Orchestrator.

Detects available AI agents (mmx-cli, Claude Code, Cursor Agent) and their capabilities.

Usage:
    from agent_manager import AgentDetector, AGENTS, Agent

    detector = AgentDetector()
    agents = await detector.detect_all()

    for agent in agents:
        print(f"{agent.name}: {agent.status} (priority={agent.priority})")
"""

from __future__ import annotations

import asyncio
import os
import shutil
from dataclasses import dataclass, field
from enum import Enum
from typing import Any


class AgentStatus(Enum):
    """Agent availability status."""
    AVAILABLE = "available"
    UNAVAILABLE = "unavailable"
    ERROR = "error"


class AgentCLI(Enum):
    """Supported agent CLI identifiers."""
    MMX = "mmx"
    CLAUDE = "claude"
    CURSOR = "cursor"


@dataclass(frozen=True, slots=True)
class Agent:
    """
    Represents a detected AI agent with its metadata.

    Attributes:
        name: Human-readable agent name.
        cli: CLI identifier for detection.
        version: Detected version string, or None if unavailable.
        capabilities: List of supported capabilities.
        priority: Lower number = higher priority (1 is highest).
        status: Current availability status.
    """
    name: str
    cli: str
    version: str | None
    capabilities: tuple[str, ...] = field(default_factory=tuple)
    priority: int = 0
    status: AgentStatus = AgentStatus.UNAVAILABLE

    @property
    def is_available(self) -> bool:
        """Check if agent is available."""
        return self.status == AgentStatus.AVAILABLE

    @property
    def is_primary(self) -> bool:
        """Check if this is the primary agent (highest priority)."""
        return self.is_available and self.priority == 1

    def to_dict(self) -> dict[str, Any]:
        """Convert agent to dictionary representation."""
        return {
            "name": self.name,
            "cli": self.cli,
            "version": self.version,
            "capabilities": list(self.capabilities),
            "priority": self.priority,
            "status": self.status.value,
            "is_available": self.is_available,
        }


# Pre-configured agent definitions
AGENTS: dict[str, dict[str, Any]] = {
    "mmx": {
        "name": "mmx-cli",
        "cli": "mmx",
        "capabilities": ("code", "reasoning", "research", "vietnamese"),
        "priority": 1,
        "detection": {"type": "which", "binary": "mmx"},
    },
    "claude": {
        "name": "Claude Code",
        "cli": "claude",
        "capabilities": ("code", "reasoning", "research"),
        "priority": 2,
        "detection": {"type": "which", "binary": "claude"},
    },
    "cursor": {
        "name": "Cursor Agent",
        "cli": "cursor",
        "capabilities": ("code", "refactor", "inline"),
        "priority": 3,
        "detection": {"type": "env", "var": "CURSOR_AGENT_MODE"},
    },
}


class AgentDetector:
    """
    Detects available AI agents on the system.

    Supports detection of mmx-cli, Claude Code, and Cursor Agent with
    async methods for efficient multi-agent detection.

    Example:
        >>> detector = AgentDetector()
        >>> agents = detector.detect_all_sync()
        >>> primary = detector.get_primary()
        >>> assert primary is not None
        >>> assert primary.name == "mmx-cli"
    """

    def __init__(self, config: dict[str, dict[str, Any]] | None = None) -> None:
        """
        Initialize the agent detector.

        Args:
            config: Optional custom agent configuration.
        """
        self._config = config or AGENTS

    def _is_available(self, agent_key: str) -> bool:
        """
        Check if an agent binary/environment is available.

        Args:
            agent_key: The agent identifier key.

        Returns:
            True if the agent is available on the system.
        """
        config = self._config.get(agent_key)
        if not config:
            return False

        detection = config.get("detection", {})
        detection_type = detection.get("type")

        if detection_type == "which":
            binary = detection.get("binary", agent_key)
            return shutil.which(binary) is not None

        if detection_type == "env":
            var = detection.get("var")
            return var is not None and os.environ.get(var) is not None

        return False

    def _get_version(self, agent_key: str) -> str | None:
        """
        Get the version of an installed agent.

        Args:
            agent_key: The agent identifier key.

        Returns:
            Version string if available, None otherwise.
        """
        config = self._config.get(agent_key)
        if not config:
            return None

        detection = config.get("detection", {})
        detection_type = detection.get("type")

        if detection_type == "which":
            binary = detection.get("binary", agent_key)
            path = shutil.which(binary)
            if path:
                import subprocess
                try:
                    result = subprocess.run(
                        [binary, "--version"],
                        capture_output=True,
                        text=True,
                        timeout=5,
                    )
                    if result.returncode == 0:
                        output = result.stdout.strip() or result.stderr.strip()
                        return self._parse_version(output)
                except (subprocess.SubprocessError, OSError):
                    pass

        elif detection_type == "env":
            var = detection.get("var")
            if var and os.environ.get(var):
                return "env:active"

        return None

    @staticmethod
    def _parse_version(output: str) -> str | None:
        """
        Parse version string from command output.

        Args:
            output: Raw output from version command.

        Returns:
            Extracted version string or None.
        """
        import re
        patterns = [
            r"(\d+\.\d+\.\d+(?:\.\d+)?)",
            r"v(\d+\.\d+\.\d+)",
            r"version[:\s]+(\d+\.\d+(?:\.\d+)?)",
        ]
        for pattern in patterns:
            match = re.search(pattern, output, re.IGNORECASE)
            if match:
                return match.group(1)
        return output.strip()[:20] if output else None

    async def _detect_async(self, agent_key: str) -> Agent:
        """
        Asynchronously detect a single agent.

        Args:
            agent_key: The agent identifier key.

        Returns:
            Agent instance with detection results.
        """
        config = self._config.get(agent_key, {})
        name = config.get("name", agent_key)
        cli = config.get("cli", agent_key)
        capabilities = tuple(config.get("capabilities", []))
        priority = config.get("priority", 99)

        loop = asyncio.get_running_loop()

        try:
            is_available = await loop.run_in_executor(
                None, self._is_available, agent_key
            )
            if not is_available:
                return Agent(
                    name=name,
                    cli=cli,
                    version=None,
                    capabilities=capabilities,
                    priority=priority,
                    status=AgentStatus.UNAVAILABLE,
                )

            version = await loop.run_in_executor(
                None, self._get_version, agent_key
            )

            return Agent(
                name=name,
                cli=cli,
                version=version,
                capabilities=capabilities,
                priority=priority,
                status=AgentStatus.AVAILABLE,
            )

        except Exception:
            return Agent(
                name=name,
                cli=cli,
                version=None,
                capabilities=capabilities,
                priority=priority,
                status=AgentStatus.ERROR,
            )

    async def detect_all(self) -> list[Agent]:
        """
        Detect all configured agents asynchronously.

        Returns:
            List of Agent instances sorted by priority.
        """
        tasks = [self._detect_async(key) for key in self._config]
        results = await asyncio.gather(*tasks)
        return sorted(results, key=lambda a: a.priority)

    def detect_all_sync(self) -> list[Agent]:
        """
        Synchronously detect all configured agents.

        Returns:
            List of Agent instances sorted by priority.
        """
        results = []
        for agent_key in self._config:
            agent = asyncio.run(self._detect_async(agent_key))
            results.append(agent)
        return sorted(results, key=lambda a: a.priority)

    def get_primary(self) -> Agent | None:
        """
        Get the primary (highest priority) available agent.

        Returns:
            Primary agent if any is available, None otherwise.
        """
        agents = self.detect_all_sync()
        return next((a for a in agents if a.is_primary), None)


# Module-level convenience functions
async def detect_agents() -> list[Agent]:
    """Detect all available agents."""
    detector = AgentDetector()
    return await detector.detect_all()


def detect_agents_sync() -> list[Agent]:
    """Synchronously detect all available agents."""
    detector = AgentDetector()
    return detector.detect_all_sync()


def get_primary_agent() -> Agent | None:
    """Get the primary available agent."""
    detector = AgentDetector()
    return detector.get_primary()


# =============================================================================
# UNIT TESTS (run with: python -m pytest agent_manager.py -v)
# =============================================================================
"""
Unit Tests for AgentDetector:

>>> import asyncio
>>> from agent_manager import AgentDetector, Agent, AgentStatus, AGENTS

>>> # Test 1: Agent dataclass creation
>>> agent = Agent(name="test", cli="test", version="1.0.0",
...               capabilities=("code",), priority=1, status=AgentStatus.AVAILABLE)
>>> agent.is_available
True
>>> agent.is_primary
True
>>> agent.to_dict()["name"]
'test'

>>> # Test 2: Detector initialization
>>> detector = AgentDetector()
>>> len(detector._config)
3
>>> "mmx" in detector._config
True

>>> # Test 3: Version parsing
>>> AgentDetector._parse_version("mmx version 1.2.3")
'1.2.3'
>>> AgentDetector._parse_version("Claude Code v2.5.0")
'2.5.0'
>>> AgentDetector._parse_version("cursor 3.0")
'3.0'

>>> # Test 4: Async detection (run in async context)
>>> async def test_detect():
...     detector = AgentDetector()
...     agents = await detector.detect_all()
...     assert len(agents) == 3
...     assert agents[0].priority <= agents[1].priority <= agents[2].priority
...     return True
>>> asyncio.run(test_detect())
True

>>> # Test 5: Sync detection
>>> agents = AgentDetector().detect_all_sync()
>>> assert all(hasattr(a, 'name') for a in agents)
>>> assert all(hasattr(a, 'status') for a in agents)

>>> # Test 6: Custom config
>>> custom_config = {
...     "custom": {
...         "name": "Custom Agent",
...         "cli": "custom",
...         "capabilities": ("test",),
...         "priority": 1,
...         "detection": {"type": "env", "var": "CUSTOM_AGENT_PATH"},
...     }
... }
>>> detector = AgentDetector(config=custom_config)
>>> agent = asyncio.run(detector._detect_async("custom"))
>>> assert agent.name == "Custom Agent"
>>> assert agent.priority == 1
"""


if __name__ == "__main__":
    import doctest

    # Run doctests
    results = doctest.testmod(verbose=True)
    print(f"\nDoctest results: {results.attempted} tests, {results.failed} failures")

    # Also run interactive demo
    print("\n" + "=" * 60)
    print("Agent Detection Demo")
    print("=" * 60)

    agents = detect_agents_sync()
    print(f"\nDetected {len(agents)} agent(s):\n")

    for agent in agents:
        status_icon = "✓" if agent.is_available else "✗"
        print(f"  {status_icon} {agent.name}")
        print(f"      CLI: {agent.cli}")
        print(f"      Status: {agent.status.value}")
        print(f"      Version: {agent.version or 'N/A'}")
        print(f"      Priority: {agent.priority}")
        print(f"      Capabilities: {', '.join(agent.capabilities)}")
        print()

    primary = get_primary_agent()
    if primary:
        print(f"Primary agent: {primary.name}")
    else:
        print("No primary agent available")
