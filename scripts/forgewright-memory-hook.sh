#!/usr/bin/env bash
#────────────────────────────────────────────────────────────────────────────
# Forgewright Memory Hook Integration
#────────────────────────────────────────────────────────────────────────────
# Purpose: Claude Code hook that triggers memory checkpoints
# Install: Add to your Claude Code config (~/.claude/settings.json)
#
# Claude Code hooks config example:
# {
#   "hooks": {
#     "PostToolUse": "./scripts/forgewright-memory-hook.sh",
#     "PostMessage": "./scripts/forgewright-memory-hook.sh tick"
#   }
# }
#────────────────────────────────────────────────────────────────────────────

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Load environment
export MEMORY_CHECKPOINT_INTERVAL="${MEMORY_CHECKPOINT_INTERVAL:-3}"
export MEMORY_TOKEN_THRESHOLD="${MEMORY_TOKEN_THRESHOLD:-70}"

# Memory session script
MEMORY_SESSION="${SCRIPT_DIR}/memory-session.sh"

main() {
    local action="${1:-}"

    case "${action}" in
        tick|post_message)
            # Called after each user message
            "${MEMORY_SESSION}" tick
            ;;
        checkpoint|post_write)
            # Called after file writes
            "${MEMORY_SESSION}" checkpoint
            ;;
        resume|pre_message)
            # Called before user message (session resume)
            "${MEMORY_SESSION}" resume
            ;;
        status)
            "${MEMORY_SESSION}" status
            ;;
        *)
            # Default: checkpoint if needed
            "${MEMORY_SESSION}" status 2>/dev/null || true
            ;;
    esac
}

main "$@"
