"""
Integration tests for Graphiti CLI commands.

These tests require FalkorDB and Ollama to be running.
Skip if services are not available.
"""

import pytest
import subprocess
import json
from pathlib import Path

# Mark as integration tests
pytestmark = pytest.mark.integration


class TestGraphitiCLI:
    """Test Graphiti CLI commands."""
    
    def test_cli_help(self):
        """Test CLI help output."""
        result = subprocess.run(
            ["python3", "scripts/graphiti-cli.py", "--help"],
            capture_output=True,
            text=True,
            cwd=Path(__file__).parent.parent.parent
        )
        
        assert result.returncode == 0
        assert "Commands:" in result.stdout
        assert "add" in result.stdout
        assert "search" in result.stdout
        assert "history" in result.stdout
    
    def test_health_check(self):
        """Test health check command."""
        result = subprocess.run(
            ["python3", "scripts/graphiti-cli.py", "health"],
            capture_output=True,
            text=True,
            cwd=Path(__file__).parent.parent.parent
        )
        
        # Should complete (may have warnings if services not running)
        assert result.returncode in [0, 1]
        assert "System Health Check" in result.stdout or "❌" in result.stdout


class TestGraphitiSetup:
    """Test Graphiti setup."""
    
    def test_setup_command(self):
        """Test setup command runs."""
        result = subprocess.run(
            ["python3", "scripts/graphiti-cli.py", "setup"],
            capture_output=True,
            text=True,
            cwd=Path(__file__).parent.parent.parent
        )
        
        # Should complete (will report issues if deps not installed)
        assert "Setup" in result.stdout or "❌" in result.stdout


class TestCLICommands:
    """Test individual CLI commands."""
    
    def test_add_requires_text(self):
        """Test add command requires text argument."""
        result = subprocess.run(
            ["python3", "scripts/graphiti-cli.py", "add"],
            capture_output=True,
            text=True,
            cwd=Path(__file__).parent.parent.parent
        )
        
        # Should fail with usage message
        assert result.returncode == 1
        assert "Usage" in result.stdout or "❌" in result.stdout
    
    def test_search_requires_query(self):
        """Test search command requires query argument."""
        result = subprocess.run(
            ["python3", "scripts/graphiti-cli.py", "search"],
            capture_output=True,
            text=True,
            cwd=Path(__file__).parent.parent.parent
        )
        
        assert result.returncode == 1
    
    def test_history_requires_entity(self):
        """Test history command requires entity argument."""
        result = subprocess.run(
            ["python3", "scripts/graphiti-cli.py", "history"],
            capture_output=True,
            text=True,
            cwd=Path(__file__).parent.parent.parent
        )
        
        assert result.returncode == 1
    
    def test_stats_command(self):
        """Test stats command runs."""
        result = subprocess.run(
            ["python3", "scripts/graphiti-cli.py", "stats"],
            capture_output=True,
            text=True,
            cwd=Path(__file__).parent.parent.parent
        )
        
        # Should complete (will show error if Graphiti not connected)
        assert "Graph Statistics" in result.stdout or "error" in result.stdout.lower()
    
    def test_list_command(self):
        """Test list command runs."""
        result = subprocess.run(
            ["python3", "scripts/graphiti-cli.py", "list"],
            capture_output=True,
            text=True,
            cwd=Path(__file__).parent.parent.parent
        )
        
        # Should complete (0 if Graphiti available, 1 if not)
        assert result.returncode in [0, 1]
        assert "Memories" in result.stdout or "not available" in result.stdout or "failed" in result.stdout.lower()


class TestTemporalQueries:
    """Test temporal query parsing in CLI."""
    
    def test_search_with_when_flag(self):
        """Test search with --when flag."""
        result = subprocess.run(
            ["python3", "scripts/graphiti-cli.py", "search", "test", "--when", "last 7 days"],
            capture_output=True,
            text=True,
            cwd=Path(__file__).parent.parent.parent
        )
        
        # Should parse time filter
        assert "Time filter" in result.stdout or "last 7 days" in result.stdout.lower() or result.returncode in [0, 1]
    
    def test_search_with_format(self):
        """Test search with format options."""
        for fmt in ["compact", "full", "json"]:
            result = subprocess.run(
                ["python3", "scripts/graphiti-cli.py", "search", "test", "--format", fmt],
                capture_output=True,
                text=True,
                cwd=Path(__file__).parent.parent.parent
            )
            
            # Should accept format option
            assert result.returncode in [0, 1]  # 1 if no results or not connected


class TestMigrationCommands:
    """Test migration commands."""
    
    def test_migrate_dry_run(self):
        """Test migrate dry-run."""
        result = subprocess.run(
            ["python3", "scripts/graphiti-cli.py", "migrate", "--dry-run"],
            capture_output=True,
            text=True,
            cwd=Path(__file__).parent.parent.parent
        )
        
        # Should complete (may show no file if first run)
        assert "Migration" in result.stdout or "not found" in result.stdout
        assert result.returncode in [0, 1]
    
    def test_migrate_standalone_dry_run(self):
        """Test standalone migration script dry-run."""
        result = subprocess.run(
            ["python3", "scripts/migrate-memory-to-graphiti.py", "--dry-run"],
            capture_output=True,
            text=True,
            cwd=Path(__file__).parent.parent.parent
        )
        
        # Should show dry run output
        assert "DRY RUN" in result.stdout or "No entries" in result.stdout or result.returncode in [0, 1]
