# ADR-001: Orchestrator Separation (Phases + Middleware + Modes)

## Status
Accepted

## Context
Forgewright's production-grade orchestrator (`SKILL.md`) grew to 1700+ lines, mixing concerns: CEO routing logic, 19 mode execution flows, 10 middleware definitions, Full Build pipeline, task dependencies, gate patterns, and quality gates.

This made the file:
- Hard to navigate (1700+ lines of markdown)
- Difficult to maintain (changing one mode required editing the whole file)
- Confusing for contributors (unclear which section governs which behavior)

## Decision
Split into three layers with clear responsibilities:

### Layer 1 — Orchestrator (CEO)
`skills/production-grade/SKILL.md` (~400 lines)
- Request classification (19 modes)
- Mode routing and plan quality loop
- Full Build pipeline orchestration
- Phase dispatcher references
- Gate patterns and user interaction

### Layer 2 — Phase Dispatchers
`skills/production-grade/phases/*.md` (5 files, ~100 lines each)
- `define.md` — T0.5, T1, T1.5, T2
- `build.md` — T3a, T3b, T3c, T4
- `harden.md` — T5, T6a, T6b
- `ship.md` — T7, T8, T9, T10
- `sustain.md` — T11, T12, T13

### Layer 3 — Middleware
`skills/production-grade/middleware/*.md` (10 files)
- 01-session-data.md through 10-graceful-failure.md
- One file per middleware step
- Replaces inline protocol reading with clear file references

### Layer 4 — Mode Reference
`skills/production-grade/modes/README.md`
- Quick reference index for all 19 modes
- Single-skill vs multi-skill classification
- Gate count per mode

## Consequences

### Positive
- Each concern is isolated and independently maintainable
- Changing a mode's execution flow doesn't touch the orchestrator
- Middleware chain is a first-class concept, not an inline comment
- Token savings from progressive loading per mode

### Negative
- More files to navigate (19+ files instead of 1)
- Cross-references between layers need maintenance
- contributors must understand the layering

## Notes
Implemented in v7.8.1 as part of the quality overhaul.
