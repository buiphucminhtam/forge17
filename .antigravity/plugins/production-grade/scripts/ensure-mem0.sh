#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────
# Ensures Forgewright local memory (mem0-cli) is initialized
# in the host project (.forgewright/memory.jsonl).
#
# Usage (from host project):
#   bash <path-to-forgewright>/scripts/ensure-mem0.sh [PROJECT_ROOT]
#   ./forgewright/scripts/ensure-mem0.sh           # if submodule at ./forgewright
#   bash .antigravity/plugins/production-grade/scripts/ensure-mem0.sh
#
# If PROJECT_ROOT is omitted: sibling of this repo with .git, else plugin root.
#
# Skip (CI / headless only): FORGEWRIGHT_SKIP_MEM0=1
# ─────────────────────────────────────────────────────────

set -euo pipefail

if [ "${FORGEWRIGHT_SKIP_MEM0:-}" = "1" ]; then
  exit 0
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FORGEWRIGHT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

if [ -n "${1:-}" ]; then
  PROJECT_ROOT="$(cd "$1" && pwd)"
else
  if [ -f "${FORGEWRIGHT_DIR}/../.git" ] || [ -d "${FORGEWRIGHT_DIR}/../.git" ]; then
    PROJECT_ROOT="$(cd "${FORGEWRIGHT_DIR}/.." && pwd)"
  else
    PROJECT_ROOT="$FORGEWRIGHT_DIR"
  fi
fi

MEMORY_FILE="${PROJECT_ROOT}/.forgewright/memory.jsonl"
MEM0_CLI="${FORGEWRIGHT_DIR}/scripts/mem0-cli.py"

if [ -f "$MEMORY_FILE" ]; then
  exit 0
fi

if ! command -v python3 &>/dev/null; then
  echo "[Forgewright] mem0 requires python3. Install Python 3 and re-run:" >&2
  echo "  bash ${FORGEWRIGHT_DIR}/scripts/ensure-mem0.sh" >&2
  exit 1
fi

if [ ! -f "$MEM0_CLI" ]; then
  echo "[Forgewright] Missing mem0 CLI at ${MEM0_CLI}" >&2
  exit 1
fi

(
  cd "$PROJECT_ROOT"
  python3 "$MEM0_CLI" setup
)

if [ ! -f "$MEMORY_FILE" ]; then
  echo "[Forgewright] mem0 setup did not create ${MEMORY_FILE}" >&2
  exit 1
fi

echo "[Forgewright] mem0 initialized (.forgewright/memory.jsonl). Run: python3 ${MEM0_CLI} refresh" >&2
