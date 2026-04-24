"""
Unit tests for MemoryMigrator.

Tests episode grouping and entry processing.
"""

import pytest
import json
from datetime import datetime, timedelta
from collections import Counter

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "scripts"))

# Mock the Graphiti client for testing
class MockGraphitiClient:
    """Mock Graphiti client for testing migration logic."""
    
    def __init__(self):
        self.added_memories = []
        self.stats_calls = {"episodes": 0, "facts": 0}
    
    def add_memory(self, text, category="general", source="cli", metadata=None):
        self.added_memories.append({
            "text": text,
            "category": category,
            "source": source,
        })
        return {
            "id": f"mock-{len(self.added_memories)}",
            "text": text,
            "category": category,
        }
    
    def stats(self):
        return {
            "total_episodes": self.stats_calls["episodes"],
            "total_facts": len(self.added_memories),
        }


# Import migrator with mocked dependencies
import importlib.util
spec = importlib.util.spec_from_file_location(
    "migrate_module", 
    Path(__file__).parent.parent.parent / "scripts" / "migrate-memory-to-graphiti.py"
)
migrate_module = importlib.util.module_from_spec(spec)
# Patch GraphitiClient classes without replacing the module
from unittest.mock import patch
original_import = migrate_module.__dict__.get('GraphitiClient')
if original_import:
    migrate_module.GraphitiClient = MockGraphitiClient
    migrate_module.SyncGraphitiClient = MockGraphitiClient
spec.loader.exec_module(migrate_module)

MemoryMigrator = migrate_module.MemoryMigrator


class TestEpisodeGrouping:
    """Test episode grouping logic."""
    
    def test_group_single_entry(self):
        """Test grouping single entry."""
        entries = [
            {"memory": "Test memory", "created": "2026-04-21T10:00:00", "category": "general"}
        ]
        
        migrator = MemoryMigrator(MockGraphitiClient())
        episodes = migrator.group_into_episodes(entries)
        
        assert len(episodes) == 1
        assert len(episodes[0]["entries"]) == 1
    
    def test_group_close_entries(self):
        """Test entries within 1 hour are grouped."""
        entries = [
            {"memory": "Entry 1", "created": "2026-04-21T10:00:00", "category": "general"},
            {"memory": "Entry 2", "created": "2026-04-21T10:30:00", "category": "general"},
            {"memory": "Entry 3", "created": "2026-04-21T10:45:00", "category": "general"},
        ]
        
        migrator = MemoryMigrator(MockGraphitiClient())
        episodes = migrator.group_into_episodes(entries)
        
        # All entries should be in one episode (within 1 hour)
        assert len(episodes) == 1
        assert len(episodes[0]["entries"]) == 3
    
    def test_group_separate_by_time(self):
        """Test entries >1 hour apart are separate episodes."""
        entries = [
            {"memory": "Entry 1", "created": "2026-04-21T10:00:00", "category": "general"},
            {"memory": "Entry 2", "created": "2026-04-21T11:30:00", "category": "general"},  # >1hr later
        ]
        
        migrator = MemoryMigrator(MockGraphitiClient())
        episodes = migrator.group_into_episodes(entries)
        
        # Should be two separate episodes
        assert len(episodes) == 2
    
    def test_group_separate_by_high_value_category(self):
        """Test high-value categories trigger new episode."""
        entries = [
            {"memory": "Entry 1", "created": "2026-04-21T10:00:00", "category": "general"},
            {"memory": "Decision 1", "created": "2026-04-21T10:05:00", "category": "decisions"},  # New episode
        ]
        
        migrator = MemoryMigrator(MockGraphitiClient())
        episodes = migrator.group_into_episodes(entries)
        
        # Should be two episodes
        assert len(episodes) == 2
        assert episodes[0]["categories"] == ["general"]
        assert episodes[1]["categories"] == ["decisions"]
    
    def test_architecture_triggers_new_episode(self):
        """Test architecture category triggers new episode."""
        entries = [
            {"memory": "Session note", "created": "2026-04-21T10:00:00", "category": "session"},
            {"memory": "Using KuzuDB", "created": "2026-04-21T10:05:00", "category": "architecture"},
        ]
        
        migrator = MemoryMigrator(MockGraphitiClient())
        episodes = migrator.group_into_episodes(entries)
        
        assert len(episodes) == 2
        assert episodes[1]["categories"] == ["architecture"]


class TestEntryMigration:
    """Test individual entry migration."""
    
    def test_migrate_valid_entry(self):
        """Test migrating a valid entry."""
        client = MockGraphitiClient()
        migrator = MemoryMigrator(client)
        
        entry = {
            "memory": "Test memory content",
            "category": "general",
            "source": "test",
        }
        
        result = migrator.migrate_entry(entry)
        
        assert result is True
        assert len(client.added_memories) == 1
        assert client.added_memories[0]["text"] == "Test memory content"
    
    def test_migrate_empty_memory(self):
        """Test migrating entry with empty memory."""
        client = MockGraphitiClient()
        migrator = MemoryMigrator(client)
        
        entry = {
            "memory": "",
            "category": "general",
            "source": "test",
        }
        
        result = migrator.migrate_entry(entry)
        
        assert result is False
        assert len(client.added_memories) == 0
    
    def test_stats_updated(self):
        """Test migration stats are updated."""
        client = MockGraphitiClient()
        migrator = MemoryMigrator(client)
        
        migrator.migrate_entry({
            "memory": "Decision about architecture",
            "category": "decisions",
            "source": "test",
        })
        
        assert migrator.stats["migrated"] == 1
        assert migrator.stats["categories"]["decisions"] == 1


class TestFullMigration:
    """Test full migration flow."""
    
    def test_dry_run(self):
        """Test dry run doesn't make changes."""
        client = MockGraphitiClient()
        migrator = MemoryMigrator(client)
        
        entries = [
            {"memory": "Entry 1", "created": "2026-04-21T10:00:00", "category": "general"},
            {"memory": "Entry 2", "created": "2026-04-21T10:30:00", "category": "general"},
        ]
        
        migrator.migrate(entries, dry_run=True)
        
        # No entries should be added in dry run
        assert len(client.added_memories) == 0
        assert migrator.stats["total"] == 2
    
    def test_migrate_updates_stats(self):
        """Test migration updates statistics."""
        client = MockGraphitiClient()
        migrator = MemoryMigrator(client)
        
        entries = [
            {"memory": "Entry 1", "created": "2026-04-21T10:00:00", "category": "general"},
            {"memory": "Entry 2", "created": "2026-04-21T10:30:00", "category": "decisions"},
        ]
        
        migrator.migrate(entries, dry_run=False)
        
        assert migrator.stats["migrated"] == 2
        assert migrator.stats["categories"]["general"] == 1
        assert migrator.stats["categories"]["decisions"] == 1
