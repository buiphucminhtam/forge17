#!/usr/bin/env python3
"""
Standalone Memory Migration Script

Migrate from mem0-cli memory.jsonl to Graphiti temporal knowledge graph.

Usage:
    python3 scripts/migrate-memory-to-graphiti.py [--dry-run] [--batch-size N] [--backup]

Options:
    --dry-run      Preview migration without making changes
    --batch-size   Entries per batch (default: 10)
    --backup       Create backup of memory.jsonl before migration
    --verify       Verify migration after completion

This script provides more control than the built-in migrate command.
"""

import os
import sys
import json
import asyncio
import argparse
import shutil
from datetime import datetime
from pathlib import Path
from collections import Counter

# Add scripts directory to path
sys.path.insert(0, str(Path(__file__).parent))

from graphiti_client import GraphitiClient, SyncGraphitiClient


# ── Constants ──

FORGEWRIGHT_DIR = ".forgewright"
MEMORY_LOG = os.path.join(FORGEWRIGHT_DIR, "memory.jsonl")
DEFAULT_BATCH_SIZE = 10


# ── Migration Logic ──

class MemoryMigrator:
    """Migrate memories from JSONL to Graphiti."""
    
    def __init__(self, client: SyncGraphitiClient):
        self.client = client
        self.stats = {
            "total": 0,
            "migrated": 0,
            "skipped": 0,
            "errors": 0,
            "categories": Counter(),
            "errors_list": [],
        }
    
    def load_entries(self) -> list:
        """Load entries from memory.jsonl."""
        if not Path(MEMORY_LOG).exists():
            print(f"❌ Source file not found: {MEMORY_LOG}")
            return []
        
        entries = []
        with open(MEMORY_LOG, "r") as f:
            for line_num, line in enumerate(f, 1):
                line = line.strip()
                if not line:
                    continue
                try:
                    entry = json.loads(line)
                    entry["_line_num"] = line_num
                    entries.append(entry)
                except json.JSONDecodeError as e:
                    print(f"⚠️ Skipping line {line_num}: JSON decode error ({e})")
        
        return entries
    
    def group_into_episodes(self, entries: list) -> list:
        """
        Group entries into episodes based on temporal proximity.
        
        Episodes are separated by:
        - 1+ hour gap between entries
        - Category changes (decisions, architecture = new episode)
        """
        if not entries:
            return []
        
        episodes = []
        current_episode = {
            "name": f"migrated-{entries[0]['created'][:10]}",
            "date": entries[0]["created"],
            "entries": [entries[0]],
            "categories": [entries[0].get("category", "general")],
        }
        
        for entry in entries[1:]:
            prev_created = datetime.fromisoformat(entries[0]["created"])
            curr_created = datetime.fromisoformat(entry["created"])
            gap_hours = (curr_created - prev_created).total_seconds() / 3600
            
            # Category triggers new episode
            high_value_cats = {"decisions", "architecture", "project"}
            if entry.get("category") in high_value_cats:
                episodes.append(current_episode)
                current_episode = {
                    "name": f"migrated-{entry['created'][:10]}",
                    "date": entry["created"],
                    "entries": [entry],
                    "categories": [entry.get("category", "general")],
                }
            # Time gap triggers new episode
            elif gap_hours > 1:
                episodes.append(current_episode)
                current_episode = {
                    "name": f"migrated-{entry['created'][:10]}",
                    "date": entry["created"],
                    "entries": [entry],
                    "categories": [entry.get("category", "general")],
                }
            else:
                current_episode["entries"].append(entry)
                if entry.get("category") not in current_episode["categories"]:
                    current_episode["categories"].append(entry.get("category", "general"))
        
        episodes.append(current_episode)
        return episodes
    
    def migrate_entry(self, entry: dict) -> bool:
        """Migrate single entry to Graphiti."""
        try:
            text = entry.get("memory", "")
            category = entry.get("category", "general")
            source = entry.get("source", "migrated")
            
            if not text:
                self.stats["skipped"] += 1
                return False
            
            self.client.add_memory(
                text=text,
                category=category,
                source=f"migrated:{source}",
            )
            
            self.stats["migrated"] += 1
            self.stats["categories"][category] += 1
            return True
            
        except Exception as e:
            self.stats["errors"] += 1
            self.stats["errors_list"].append({
                "entry": entry.get("memory", "")[:100],
                "error": str(e),
            })
            return False
    
    def migrate(self, entries: list, dry_run: bool = False, batch_size: int = 10) -> dict:
        """
        Migrate all entries to Graphiti.
        
        Args:
            entries: List of memory entries
            dry_run: If True, don't make changes
            batch_size: Entries per batch (for progress reporting)
        
        Returns:
            Migration statistics
        """
        self.stats["total"] = len(entries)
        
        if dry_run:
            print(f"📋 DRY RUN: Would migrate {len(entries)} entries")
            print("\nSample entries:")
            for entry in entries[:5]:
                print(f"  • [{entry.get('category', 'general')}] {entry.get('memory', '')[:60]}...")
            if len(entries) > 5:
                print(f"  ... and {len(entries) - 5} more")
            return self.stats
        
        # Migrate in batches
        print(f"🚀 Starting migration of {len(entries)} entries...")
        print()
        
        for i, entry in enumerate(entries, 1):
            success = self.migrate_entry(entry)
            
            # Progress report
            if i % batch_size == 0 or i == len(entries):
                print(f"   Progress: {i}/{len(entries)} ({100*i/len(entries):.1f}%) "
                      f"- Migrated: {self.stats['migrated']}, "
                      f"Skipped: {self.stats['skipped']}, "
                      f"Errors: {self.stats['errors']}")
        
        return self.stats
    
    def verify(self) -> bool:
        """Verify migration by checking Graphiti stats."""
        try:
            stats = self.client.stats()
            print("\n📊 Migration Verification:")
            print(f"   Graph episodes: {stats.get('total_episodes', 0)}")
            print(f"   Graph facts: {stats.get('total_facts', 0)}")
            
            if stats.get("total_facts", 0) >= self.stats["migrated"]:
                print("✅ Verification passed!")
                return True
            else:
                print("⚠️ Verification: Graph has fewer facts than migrated entries")
                return False
        except Exception as e:
            print(f"❌ Verification failed: {e}")
            return False


def create_backup(path: str) -> str:
    """Create timestamped backup of memory.jsonl."""
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    backup_path = f"{path}.backup-{timestamp}"
    shutil.copy(path, backup_path)
    print(f"✅ Backup created: {backup_path}")
    return backup_path


# ── Main ──

def main():
    parser = argparse.ArgumentParser(
        description="Migrate mem0-cli memory to Graphiti temporal knowledge graph"
    )
    parser.add_argument("--dry-run", action="store_true", help="Preview without making changes")
    parser.add_argument("--batch-size", type=int, default=DEFAULT_BATCH_SIZE, help="Progress batch size")
    parser.add_argument("--backup", action="store_true", help="Create backup before migration")
    parser.add_argument("--verify", action="store_true", help="Verify after migration")
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("🔄 Memory Migration: mem0-cli → Graphiti")
    print("=" * 60)
    print()
    
    # Initialize migrator
    try:
        client = SyncGraphitiClient()
    except Exception as e:
        print(f"❌ Failed to connect to Graphiti: {e}")
        print("\nMake sure:")
        print("  1. FalkorDB is running: docker-compose -f docker-compose.graphiti.yml up -d")
        print("  2. Ollama is running: ollama serve")
        print("  3. Run setup: python3 scripts/graphiti-cli.py setup")
        return 1
    
    migrator = MemoryMigrator(client)
    
    # Load entries
    print("📂 Loading entries from memory.jsonl...")
    entries = migrator.load_entries()
    
    if not entries:
        print("❌ No entries to migrate")
        return 1
    
    print(f"   Found {len(entries)} entries")
    
    # Backup
    if args.backup and not args.dry_run:
        create_backup(MEMORY_LOG)
    
    # Group into episodes (for info only)
    episodes = migrator.group_into_episodes(entries)
    print(f"   Organized into {len(episodes)} episodes")
    print()
    
    # Migrate
    stats = migrator.migrate(entries, dry_run=args.dry_run, batch_size=args.batch_size)
    
    # Results
    print()
    print("=" * 60)
    print("📊 Migration Results")
    print("=" * 60)
    print(f"   Total entries: {stats['total']}")
    print(f"   ✅ Migrated: {stats['migrated']}")
    print(f"   ⏭️  Skipped: {stats['skipped']}")
    print(f"   ❌ Errors: {stats['errors']}")
    
    if stats["categories"]:
        print("\n   By category:")
        for cat, count in stats["categories"].most_common():
            print(f"      {cat}: {count}")
    
    if stats["errors_list"] and len(stats["errors_list"]) <= 5:
        print("\n   Error details:")
        for err in stats["errors_list"]:
            print(f"      • {err['entry'][:50]}... → {err['error']}")
    
    # Verify
    if args.verify and not args.dry_run:
        print()
        migrator.verify()
    
    print()
    print("=" * 60)
    
    if stats["errors"] > 0:
        print(f"⚠️  Migration completed with {stats['errors']} errors")
        return 1
    else:
        print("✅ Migration completed successfully!")
        print()
        print("Next steps:")
        print("  1. Verify data: python3 scripts/graphiti-cli.py stats")
        print("  2. Search: python3 scripts/graphiti-cli.py search \"query\"")
        print("  3. Try temporal: python3 scripts/graphiti-cli.py search \"query\" --when \"last 7 days\"")
        return 0


if __name__ == "__main__":
    sys.exit(main())
