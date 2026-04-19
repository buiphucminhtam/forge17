# Antigravity Plugin Templates Note

> **Date:** 2026-04-20
> **Status:** Resolved

## Issue

The `.antigravity/plugins/production-grade/` directory contains copies of skill templates (`skills/mcp-generator/templates/`, `skills/_shared/templates/`). These were flagged as "duplicate templates."

## Resolution

**These are NOT duplicates in the traditional sense.** The files in `.antigravity/plugins/production-grade/` serve a different purpose:

| Location | Purpose | Content |
|----------|---------|---------|
| `skills/mcp-generator/templates/` | **Canonical source** | Handlebars templates with `{{placeholder}}` syntax |
| `.antigravity/plugins/production-grade/skills/mcp-generator/templates/` | **Self-contained plugin copy** | Pre-copied for Antigravity's isolated execution |

## Why This Is Intentional

1. **Antigravity is a plugin** — it should be self-contained and not depend on the parent forgewright submodule
2. **Git worktree isolation** — when using Antigravity in a different project, the templates must be available locally
3. **Reproducibility** — the plugin version is pinned at a specific commit

## Maintenance Strategy

When templates in `skills/` are updated:

1. **Update canonical templates** in `skills/mcp-generator/templates/`
2. **Update ANTIGRAVITY_VERSION** in `.antigravity/plugins/production-grade/AGENTS.md` to trigger a re-sync
3. **Run sync script** (if exists) or manually copy updated templates

## Template Sources

| Template Category | Canonical Location | Plugin Copy Location |
|-----------------|-------------------|-------------------|
| MCP Generator | `skills/mcp-generator/templates/` | `.antigravity/plugins/production-grade/skills/mcp-generator/templates/` |
| Shared Config | `skills/_shared/templates/` | `.antigravity/plugins/production-grade/skills/_shared/templates/` |
| Project Manager | `skills/project-manager/templates/` | NOT COPIED (referenced from skills/) |
| NEW v8.1 Templates | `templates/` | NOT COPIED (new canonical location) |

## New v8.1 Templates

The new `templates/` directory at project root is the **canonical location** for all v8.1+ templates:

- `templates/docker/` — Docker templates
- `templates/ci/` — CI/CD templates
- `templates/config/` — Config templates
- `templates/sre/` — SRE templates
- `templates/cursor/` — Cursor rules
- `templates/skills/` — Skill templates
- `templates/game/` — Game templates

Antigravity should **NOT** copy these — they are project-specific and should be generated on-demand using `scripts/generate-template.ts`.

## Future Plan

Once Antigravity's plugin architecture is mature, consider:
1. Templates live in `templates/` (canonical)
2. Antigravity references `templates/` via relative path or env var
3. No more file duplication
