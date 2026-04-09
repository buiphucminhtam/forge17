#!/usr/bin/env bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ForgeNexus Health Monitor
# Checks index health, staleness, and auto-reindexes if needed.
# Run: bash scripts/forgeNexus-health.sh [repo_path]
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -uo pipefail

REPO_PATH="${1:-$(pwd)}"
INDEX_DIR="${REPO_PATH}/.forgenexus"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_ok()   { echo -e "${GREEN}✓${NC} $*"; }
log_warn() { echo -e "${YELLOW}⚠${NC} $*"; }
log_err()  { echo -e "${RED}✗${NC} $*"; }

echo "━━━ ForgeNexus Health Check ━━━"
echo "  Repo: ${REPO_PATH}"

# ── 1. Check index exists ──────────────────────────────────
if [ ! -d "$INDEX_DIR" ]; then
  log_err "No ForgeNexus index found at ${INDEX_DIR}"
  echo ""
  echo "  Run: npx forgenexus analyze --force"
  exit 1
fi

# ── 2. Check last indexed commit ────────────────────────────
LAST_COMMIT=$(git -C "$REPO_PATH" log -1 --format=%ct 2>/dev/null || echo "0")
LAST_INDEXED=$(cat "${INDEX_DIR}/.meta/last-index" 2>/dev/null || echo "0")

if [ "$LAST_INDEXED" -ge "$LAST_COMMIT" ]; then
  log_ok "Index is fresh (commit ${LAST_INDEXED} >= ${LAST_COMMIT})"
else
  log_warn "Index is stale (last indexed: ${LAST_INDEXED}, current commit: ${LAST_COMMIT})"
  echo ""
  echo "  Re-indexing..."
  cd "$REPO_PATH"
  npx forgenexus analyze 2>&1 | tail -5
  echo ""
  log_ok "Re-index complete"
fi

# ── 3. Verify index stats ─────────────────────────────────
if [ -f "${INDEX_DIR}/.meta/stats.json" ]; then
  NODES=$(node -e "const s=require('${INDEX_DIR}/.meta/stats.json'); console.log(s.nodes || 0)" 2>/dev/null || echo "0")
  EDGES=$(node -e "const s=require('${INDEX_DIR}/.meta/stats.json'); console.log(s.edges || 0)" 2>/dev/null || echo "0")
  echo ""
  echo "  Stats: ${NODES} nodes, ${EDGES} edges"
  if [ "$NODES" -gt 0 ]; then
    log_ok "Index is healthy"
  else
    log_err "Index appears empty — run: npx forgenexus analyze --force"
    exit 1
  fi
else
  log_warn "No stats file found — run: npx forgenexus analyze --force"
fi

# ── 4. Check for lock files ────────────────────────────────
LOCK_FILES=$(find "$INDEX_DIR" -name "*.lock" 2>/dev/null | wc -l | tr -d ' ')
if [ "$LOCK_FILES" -gt 0 ]; then
  log_warn "Found ${LOCK_FILES} lock files in index — MCP server may be holding locks"
  echo "  Lock files: $(find "$INDEX_DIR" -name "*.lock" 2>/dev/null | tr '\n' ' ')"
fi

echo ""
log_ok "Health check complete"
