#!/usr/bin/env python3
"""
Terminal UI for watching Multica Orchestrator progress.
Provides real-time visualization of agents, tasks, and execution state.
"""

from __future__ import annotations

import sys
from datetime import datetime
from typing import Any, List, Optional

from rich.console import Console, Group
from rich.live import Live
from rich.panel import Panel
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TaskProgressColumn
from rich.spinner import Spinner
from rich.table import Table
from rich.text import Text
from rich.layout import Layout

try:
    import socketio
except ImportError:
    socketio = None


class Agent:
    """Represents an agent in the orchestrator."""
    
    def __init__(self, agent_id: str, name: str, status: str = "idle", **kwargs):
        self.id = agent_id
        self.name = name
        self.status = status
        self.capabilities: List[str] = kwargs.get("capabilities", [])
        self.current_task: Optional[str] = kwargs.get("current_task")
        self.completed_tasks: int = kwargs.get("completed_tasks", 0)
    
    @property
    def is_active(self) -> bool:
        return self.status == "running"
    
    @property
    def is_idle(self) -> bool:
        return self.status == "idle"
    
    @property
    def is_done(self) -> bool:
        return self.status in ("completed", "done")


class Task:
    """Represents a task in the orchestrator."""
    
    def __init__(
        self,
        task_id: str,
        description: str,
        priority: int = 5,
        assigned_agent: Optional[str] = None,
        status: str = "pending",
        **kwargs
    ):
        self.id = task_id
        self.description = description
        self.priority = priority
        self.assigned_agent = assigned_agent
        self.status = status
        self.result: Any = kwargs.get("result")
        self.error: Optional[str] = kwargs.get("error")
        self.created_at: datetime = kwargs.get("created_at", datetime.now())
        self.completed_at: Optional[datetime] = kwargs.get("completed_at")
        self.progress: float = kwargs.get("progress", 0.0)
    
    @property
    def is_pending(self) -> bool:
        return self.status == "pending"
    
    @property
    def is_running(self) -> bool:
        return self.status == "running"
    
    @property
    def is_completed(self) -> bool:
        return self.status == "completed"
    
    @property
    def is_failed(self) -> bool:
        return self.status == "failed"
    
    def mark_running(self) -> None:
        self.status = "running"
        self.created_at = datetime.now()
    
    def mark_completed(self, result: Any = None) -> None:
        self.status = "completed"
        self.result = result
        self.completed_at = datetime.now()
        self.progress = 1.0
    
    def mark_failed(self, error: str) -> None:
        self.status = "failed"
        self.error = error
        self.completed_at = datetime.now()


class TerminalUI:
    """Terminal UI for watching Multica Orchestrator progress."""
    
    COLORS = {
        "completed": "green",
        "failed": "red",
        "running": "yellow",
        "pending": "cyan",
        "idle": "dim",
    }
    
    SPINNERS = {
        "running": "dots",
        "pending": "line",
    }
    
    def __init__(self, console: Optional[Console] = None):
        self.console = console or Console()
        self._live: Optional[Live] = None
        self._agents: List[Agent] = []
        self._tasks: List[Task] = []
        self._progress_bars: dict[str, Progress] = {}
        self._socket_client: Optional[Any] = None
        self._daemon_url: str = "http://localhost:8765"
        self._watching: bool = False
    
    def show_banner(self) -> None:
        """Display the Multica Orchestrator banner."""
        banner = Text()
        banner.append("╔══════════════════════════════════════════════════════════╗\n", style="bold cyan")
        banner.append("║           Multica Orchestrator - Live Monitor            ║\n", style="bold cyan")
        banner.append("╠══════════════════════════════════════════════════════════╣\n", style="cyan")
        banner.append("║  [a] Agents    [t] Tasks    [s] Stats    [q] Quit     ║\n", style="dim cyan")
        banner.append("╚══════════════════════════════════════════════════════════╝", style="bold cyan")
        
        self.console.print(banner)
    
    def show_agents(self, agents: List[Agent]) -> None:
        """Display agents table."""
        self._agents = agents
        
        table = Table(title="[b]Agents[/b]", show_header=True, header_style="bold magenta")
        table.add_column("ID", style="cyan", width=12)
        table.add_column("Name", style="white")
        table.add_column("Status", width=10)
        table.add_column("Current Task", style="dim")
        table.add_column("Completed", justify="right", width=10)
        
        for agent in agents:
            status_style = self.COLORS.get(agent.status, "white")
            status_text = f"[{status_style}]{agent.status}[/{status_style}]"
            
            current_task = agent.current_task or "-"
            if agent.is_active:
                current_task = f"[yellow]⟳[/yellow] {current_task}"
            
            table.add_row(
                agent.id,
                agent.name,
                status_text,
                current_task,
                str(agent.completed_tasks),
            )
        
        self.console.print(table)
    
    def show_tasks(self, tasks: List[Task]) -> None:
        """Display tasks table."""
        self._tasks = tasks
        
        table = Table(title="[b]Tasks[/b]", show_header=True, header_style="bold green")
        table.add_column("ID", style="cyan", width=8)
        table.add_column("Description", style="white", max_width=40)
        table.add_column("Priority", justify="center", width=8)
        table.add_column("Agent", style="dim", width=10)
        table.add_column("Status", width=12)
        table.add_column("Progress", width=10)
        
        for task in tasks:
            status_style = self.COLORS.get(task.status, "white")
            status_text = f"[{status_style}]{task.status}[/{status_style}]"
            
            priority_indicator = ""
            if task.priority >= 8:
                priority_indicator = "🔴"
            elif task.priority >= 5:
                priority_indicator = "🟡"
            else:
                priority_indicator = "🟢"
            
            progress_bar = self._make_progress_bar(task.progress)
            
            table.add_row(
                task.id,
                task.description[:40] + ("..." if len(task.description) > 40 else ""),
                f"{priority_indicator} {task.priority}",
                task.assigned_agent or "-",
                status_text,
                progress_bar,
            )
        
        self.console.print(table)
    
    def show_progress(self, task: Task, message: str) -> None:
        """Show progress update for a specific task."""
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            BarColumn(),
            TaskProgressColumn(),
            TextColumn("{task.fields[message]}"),
            console=self.console,
            auto_refresh=True,
        ) as progress:
            progress_task = progress.add_task(
                task.description,
                message=message,
                total=100,
            )
            # In real implementation, this would be updated via socket events
    
    def show_task_created(self, task: Task) -> None:
        """Display notification when a task is created."""
        icon = "✨"
        timestamp = datetime.now().strftime("%H:%M:%S")
        msg = f"[{timestamp}] {icon} [cyan]Task Created:[/cyan] [white]{task.description}[/white]"
        msg += f" [dim](priority={task.priority}, id={task.id})[/dim]"
        self.console.print(msg)
    
    def show_task_completed(self, task: Task, result: Any = None) -> None:
        """Display notification when a task is completed."""
        icon = "✅"
        timestamp = datetime.now().strftime("%H:%M:%S")
        msg = f"[{timestamp}] {icon} [green]Task Completed:[/green] [white]{task.description}[/white]"
        
        if result:
            result_str = str(result)[:50]
            msg += f" [dim]→ {result_str}[/dim]"
        
        self.console.print(msg)
    
    def show_task_failed(self, task: Task, error: Any) -> None:
        """Display notification when a task fails."""
        icon = "❌"
        timestamp = datetime.now().strftime("%H:%M:%S")
        msg = f"[{timestamp}] {icon} [red]Task Failed:[/red] [white]{task.description}[/white]"
        
        if error:
            error_str = str(error)[:100]
            msg += f"\n[{timestamp}]       [red]Error:[/red] [dim]{error_str}[/dim]"
        
        self.console.print(msg)
    
    def clear(self) -> None:
        """Clear the terminal screen."""
        self.console.clear()
    
    def _make_progress_bar(self, progress: float) -> str:
        """Create a simple text progress bar."""
        width = 8
        filled = int(progress * width)
        empty = width - filled
        return f"[green]{'█' * filled}[/green][dim]{'░' * empty}[/dim]"
    
    def _create_layout(self) -> Layout:
        """Create the main layout for live display."""
        layout = Layout()
        
        # Header
        layout.split_column(
            Layout(name="header", size=6),
            Layout(name="main"),
            Layout(name="footer", size=3),
        )
        
        # Main area split into agents and tasks
        layout["main"].split_row(
            Layout(name="agents", ratio=1),
            Layout(name="tasks", ratio=1),
        )
        
        return layout
    
    def _render_header(self) -> Panel:
        """Render the header panel."""
        active_agents = sum(1 for a in self._agents if a.is_active)
        pending_tasks = sum(1 for t in self._tasks if t.is_pending)
        running_tasks = sum(1 for t in self._tasks if t.is_running)
        completed_tasks = sum(1 for t in self._tasks if t.is_completed)
        
        stats = Text()
        stats.append(f"  Active Agents: [yellow]{active_agents}[/yellow]  ", style="bold")
        stats.append(f"  Pending: [cyan]{pending_tasks}[/cyan]  ", style="bold")
        stats.append(f"  Running: [yellow]{running_tasks}[/yellow]  ", style="bold")
        stats.append(f"  Completed: [green]{completed_tasks}[/green]", style="bold")
        
        return Panel(stats, title="[b]Multica Orchestrator[/b]", border_style="cyan")
    
    def _render_agents_table(self) -> Table:
        """Render agents table for live display."""
        table = Table(title="[b]Agents[/b]", show_header=True, box=None)
        table.add_column("Name", style="cyan")
        table.add_column("Status", width=10)
        table.add_column("Tasks", justify="right")
        
        for agent in self._agents:
            status_style = self.COLORS.get(agent.status, "white")
            status_icon = "●" if agent.is_active else "○"
            status = f"[{status_style}]{status_icon} {agent.status}[/{status_style}]"
            
            table.add_row(agent.name, status, str(agent.completed_tasks))
        
        return table
    
    def _render_tasks_table(self) -> Table:
        """Render tasks table for live display."""
        table = Table(title="[b]Tasks[/b]", show_header=True, box=None)
        table.add_column("Description", style="white", max_width=30)
        table.add_column("Status", width=10)
        table.add_column("P", justify="center", width=3)
        
        for task in sorted(self._tasks, key=lambda t: t.priority, reverse=True)[:10]:
            status_style = self.COLORS.get(task.status, "white")
            status_icon = {
                "running": "⟳",
                "completed": "✓",
                "failed": "✗",
                "pending": "○",
            }.get(task.status, "○")
            status = f"[{status_style}]{status_icon} {task.status}[/{status_style}]"
            
            table.add_row(
                task.description[:30] + ("…" if len(task.description) > 30 else ""),
                status,
                str(task.priority),
            )
        
        return table
    
    def start_live(self) -> None:
        """Start live refresh display."""
        self._live = Live(
            self._create_renderable(),
            console=self.console,
            auto_refresh=False,
            refresh_per_second=10,
        )
        self._live.start()
    
    def update_live(self) -> None:
        """Update the live display."""
        if self._live:
            self._live.update(self._create_renderable())
    
    def stop_live(self) -> None:
        """Stop live refresh display."""
        if self._live:
            self._live.stop()
            self._live = None
    
    def _create_renderable(self) -> Group:
        """Create the main renderable group."""
        return Group(
            self._render_header(),
            self._render_agents_table(),
            self._render_tasks_table(),
        )
    
    # Socket.IO client methods
    
    def connect_to_daemon(self, url: Optional[str] = None) -> bool:
        """Connect to the Multica daemon via Socket.IO."""
        if socketio is None:
            self.console.print("[yellow]Warning: python-socketio not installed. Watch mode disabled.[/yellow]")
            return False
        
        self._daemon_url = url or self._daemon_url
        
        try:
            self._socket_client = socketio.Client()
            
            @self._socket_client.on("connect")
            def on_connect():
                self.console.print(f"[green]Connected to daemon at {self._daemon_url}[/green]")
            
            @self._socket_client.on("disconnect")
            def on_disconnect():
                self.console.print("[yellow]Disconnected from daemon[/yellow]")
            
            @self._socket_client.on("agent_update")
            def on_agent_update(data):
                self._handle_agent_update(data)
            
            @self._socket_client.on("task_created")
            def on_task_created(data):
                self._handle_task_created(data)
            
            @self._socket_client.on("task_progress")
            def on_task_progress(data):
                self._handle_task_progress(data)
            
            @self._socket_client.on("task_completed")
            def on_task_completed(data):
                self._handle_task_completed(data)
            
            @self._socket_client.on("task_failed")
            def on_task_failed(data):
                self._handle_task_failed(data)
            
            self._socket_client.connect(self._daemon_url)
            return True
            
        except Exception as e:
            self.console.print(f"[red]Failed to connect to daemon: {e}[/red]")
            return False
    
    def disconnect_from_daemon(self) -> None:
        """Disconnect from the daemon."""
        if self._socket_client:
            self._socket_client.disconnect()
            self._socket_client = None
    
    def _handle_agent_update(self, data: dict) -> None:
        """Handle agent update event from daemon."""
        agent_id = data.get("agent_id")
        status = data.get("status")
        
        for agent in self._agents:
            if agent.id == agent_id:
                agent.status = status
                agent.current_task = data.get("current_task")
                break
        
        self.update_live()
    
    def _handle_task_created(self, data: dict) -> None:
        """Handle task created event from daemon."""
        task = Task(
            task_id=data.get("task_id"),
            description=data.get("description"),
            priority=data.get("priority", 5),
            assigned_agent=data.get("assigned_agent"),
        )
        self._tasks.append(task)
        self.show_task_created(task)
        self.update_live()
    
    def _handle_task_progress(self, data: dict) -> None:
        """Handle task progress event from daemon."""
        task_id = data.get("task_id")
        progress = data.get("progress", 0)
        message = data.get("message", "")
        
        for task in self._tasks:
            if task.id == task_id:
                task.progress = progress
                task.status = "running"
                self.console.print(f"[dim]  {message}[/dim]")
                break
        
        self.update_live()
    
    def _handle_task_completed(self, data: dict) -> None:
        """Handle task completed event from daemon."""
        task_id = data.get("task_id")
        result = data.get("result")
        
        for task in self._tasks:
            if task.id == task_id:
                task.mark_completed(result)
                self.show_task_completed(task, result)
                break
        
        self.update_live()
    
    def _handle_task_failed(self, data: dict) -> None:
        """Handle task failed event from daemon."""
        task_id = data.get("task_id")
        error = data.get("error")
        
        for task in self._tasks:
            if task.id == task_id:
                task.mark_failed(error)
                self.show_task_failed(task, error)
                break
        
        self.update_live()
    
    def watch(self, daemon_url: Optional[str] = None) -> None:
        """Watch mode - connect to daemon and display updates."""
        self._watching = True
        self.clear()
        self.show_banner()
        
        if not self.connect_to_daemon(daemon_url):
            self.console.print("[yellow]Running in demo mode (no daemon connection)[/yellow]")
            self._run_demo()
            return
        
        try:
            self.start_live()
            
            while self._watching:
                try:
                    # Check for keyboard input
                    if sys.stdin in select.select([sys.stdin], [], [], 1)[0]:
                        key = sys.stdin.read(1)
                        if key.lower() == "q":
                            self._watching = False
                except (ImportError, AttributeError):
                    # select not available on Windows
                    import time
                    time.sleep(1)
                    
        except KeyboardInterrupt:
            self._watching = False
        finally:
            self.stop_live()
            self.disconnect_from_daemon()
            self.console.print("\n[cyan]Goodbye![/cyan]")
    
    def _run_demo(self) -> None:
        """Run a demo of the UI."""
        demo_agents = [
            Agent("agent-1", "Worker Alpha", status="running", current_task="Processing data", completed_tasks=5),
            Agent("agent-2", "Worker Beta", status="idle", completed_tasks=3),
            Agent("agent-3", "Worker Gamma", status="completed", completed_tasks=8),
        ]
        
        demo_tasks = [
            Task("task-1", "Initialize system", priority=9, status="completed"),
            Task("task-2", "Process user requests", priority=7, status="running"),
            Task("task-3", "Generate reports", priority=5, assigned_agent="agent-1"),
            Task("task-4", "Cleanup resources", priority=3),
            Task("task-5", "Finalize operations", priority=1, assigned_agent="agent-2"),
        ]
        
        self._agents = demo_agents
        self._tasks = demo_tasks
        
        self.start_live()
        
        import time
        for i in range(10):
            time.sleep(0.5)
            self.update_live()
        
        self.stop_live()


# Allow running as standalone script
if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Multica Orchestrator Terminal UI")
    parser.add_argument("--daemon", "-d", default="http://localhost:8765", help="Daemon URL")
    parser.add_argument("--demo", action="store_true", help="Run in demo mode")
    args = parser.parse_args()
    
    ui = TerminalUI()
    
    if args.demo:
        ui._run_demo()
    else:
        ui.watch(args.daemon)
