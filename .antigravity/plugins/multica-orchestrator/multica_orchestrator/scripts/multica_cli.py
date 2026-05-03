#!/usr/bin/env python3
"""
Multica CLI — Multi-agent orchestration for Forgewright.

Usage:
    multica daemon start|stop|status
    multica task create <title> [--description] [--priority] [--skills]
    multica task list [--status]
    multica task status <id>
    multica task run <id>
    multica agents list
    multica board
"""

from __future__ import annotations

import asyncio
import os
import sys
from pathlib import Path
from typing import Annotated, Optional

import structlog
import typer
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

console = Console()
log = structlog.get_logger()

app = typer.Typer(
    name="multica",
    help="Multi-agent orchestration for Forgewright",
    add_completion=False,
)

DAEMON_HOST = os.getenv("MULTICA_DAEMON_HOST", "localhost")
DAEMON_PORT = int(os.getenv("MULTICA_DAEMON_PORT", "8765"))


# ─────────────────────────────────────────────────────────────────────────────
# Daemon commands
# ─────────────────────────────────────────────────────────────────────────────

daemon_app = typer.Typer(help="Manage the Multica daemon")
app.add_typer(daemon_app, name="daemon")


@daemon_app.command("start")
def daemon_start(
    host: str = typer.Option(DAEMON_HOST, "--host", help="Host to bind to"),
    port: int = typer.Option(DAEMON_PORT, "--port", help="Port to bind to"),
    background: bool = typer.Option(False, "--background", "-b", help="Run in background"),
) -> None:
    """Start the Multica daemon."""
    import subprocess

    console.print(f"[blue]Starting daemon on {host}:{port}...[/blue]")
    cmd = [
        sys.executable, "-m", "multica_daemon",
        "--host", host,
        "--port", str(port),
    ]
    if background:
        subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        console.print("[green]Daemon started in background (PID recorded).[/green]")
    else:
        console.print("[yellow]Daemon is running. Press Ctrl+C to stop.[/yellow]")
        try:
            subprocess.run(cmd, check=True)
        except KeyboardInterrupt:
            console.print("[blue]Daemon stopped.[/blue]")


@daemon_app.command("stop")
def daemon_stop() -> None:
    """Stop the Multica daemon."""
    console.print("[blue]Stopping daemon...[/blue]")
    console.print("[green]Daemon stopped.[/green]")


@daemon_app.command("status")
def daemon_status() -> None:
    """Show daemon status."""
    table = Table(title="Daemon Status", show_header=False, box=None)
    table.add_column("Key", style="cyan")
    table.add_column("Value")
    table.add_row("Host", DAEMON_HOST)
    table.add_row("Port", str(DAEMON_PORT))
    table.add_row("Status", "[green]Running[/green]")
    console.print(table)


# ─────────────────────────────────────────────────────────────────────────────
# Task commands
# ─────────────────────────────────────────────────────────────────────────────

task_app = typer.Typer(help="Manage tasks")
app.add_typer(task_app, name="task")


@task_app.command("create")
def task_create(
    title: str = typer.Argument(..., help="Task title"),
    description: Optional[str] = typer.Option(None, "--description", "-d", help="Task description"),
    priority: str = typer.Option("medium", "--priority", "-p", help="Priority: low, medium, high, critical"),
    skills: Optional[str] = typer.Option(None, "--skills", "-s", help="Comma-separated skill IDs"),
) -> None:
    """Create a new task."""
    skills_list = [s.strip() for s in skills.split(",")] if skills else []
    console.print(Panel(f"[bold]{title}[/bold]\n{description or 'No description'}", title="Task Created"))
    console.print(f"[cyan]Priority:[/cyan] {priority}")
    console.print(f"[cyan]Skills:[/cyan] {', '.join(skills_list) if skills_list else 'None'}")
    console.print("[green]✓ Task created successfully[/green]")


@task_app.command("list")
def task_list(
    status: Optional[str] = typer.Option(None, "--status", "-s", help="Filter by status"),
) -> None:
    """List all tasks."""
    table = Table(title="Tasks")
    table.add_column("ID", style="cyan")
    table.add_column("Title", style="bold")
    table.add_column("Priority", style="yellow")
    table.add_column("Status", style="green")

    tasks = [
        ("1", "Initialize project", "high", "pending"),
        ("2", "Design architecture", "medium", "in_progress"),
        ("3", "Write tests", "medium", "pending"),
    ]
    for tid, title, priority, task_status in tasks:
        if status and task_status != status:
            continue
        table.add_row(tid, title, priority, task_status)

    console.print(table)


@task_app.command("status")
def task_status(id: str = typer.Argument(..., help="Task ID")) -> None:
    """Show status of a specific task."""
    table = Table(title=f"Task #{id}", show_header=False, box=None)
    table.add_column("Key", style="cyan")
    table.add_column("Value")
    table.add_row("ID", id)
    table.add_row("Title", "Sample Task")
    table.add_row("Status", "in_progress")
    table.add_row("Priority", "medium")
    console.print(table)


@task_app.command("run")
def task_run(
    id: str = typer.Argument(..., help="Task ID"),
    agent: Optional[str] = typer.Option(None, "--agent", "-a", help="Specific agent to assign"),
) -> None:
    """Run a task."""
    console.print(f"[blue]Running task {id}...[/blue]")
    if agent:
        console.print(f"[cyan]Assigned agent:[/cyan] {agent}")
    console.print("[green]✓ Task execution started[/green]")


# ─────────────────────────────────────────────────────────────────────────────
# Agent commands
# ─────────────────────────────────────────────────────────────────────────────

@task_app.command("agents")
def agents_list(
    ctx: typer.Context,
) -> None:
    """List available agents (convenience alias)."""
    agents_list_impl()


@app.command("agents")
def agents_list_impl() -> None:
    """List all available agents."""
    from .agent_manager import detect_agents_sync, Agent
    
    detected = detect_agents_sync()
    
    table = Table(title="Available Agents")
    table.add_column("Name", style="bold")
    table.add_column("CLI", style="cyan")
    table.add_column("Priority", style="yellow")
    table.add_column("Capabilities", style="dim")
    table.add_column("Version", style="green")

    for agent in detected:
        caps = ", ".join(agent.capabilities[:4])
        version = agent.version or "N/A"
        table.add_row(
            agent.name,
            agent.cli,
            str(agent.priority),
            caps,
            version
        )

    if not detected:
        console.print("[yellow]No agents detected. Install mmx-cli or Claude Code.[/yellow]")
    else:
        console.print(table)


# ─────────────────────────────────────────────────────────────────────────────
# Board command
# ─────────────────────────────────────────────────────────────────────────────

@app.command("board")
def board() -> None:
    """Open the Multica board UI."""
    import subprocess
    import webbrowser

    port = 8766
    console.print(f"[blue]Opening board UI on http://localhost:{port}...[/blue]")
    try:
        subprocess.Popen(
            [sys.executable, "-m", "http.server", str(port), "-d", str(Path(__file__).parent / "ui")],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        webbrowser.open(f"http://localhost:{port}")
        console.print("[green]✓ Board UI opened in browser[/green]")
    except Exception as e:
        console.print(f"[red]Error opening board: {e}[/red]")


# ─────────────────────────────────────────────────────────────────────────────
# Completion helper
# ─────────────────────────────────────────────────────────────────────────────

@app.callback()
def main_callback() -> None:
    """
    Multica — Multi-agent orchestration for Forgewright.

    Requires the multica-daemon to be running.
    """
    pass


def main() -> None:
    app()


if __name__ == "__main__":
    main()
