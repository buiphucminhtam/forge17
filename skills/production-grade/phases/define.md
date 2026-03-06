# DEFINE Phase — Dispatcher

This phase manages tasks T1 (Product Manager) and T2 (Solution Architect). Sequential execution with Gate 1 and Gate 2.

## Pre-Flight

Read `.production-grade.yaml` for path overrides:
- `paths.brd` → BRD output location (default: `Antigravity-Production-Grade-Suite/product-manager/BRD/`)
- `paths.api_contracts` → API contract location (default: `api/openapi/*.yaml`)
- `paths.adrs` → ADR location (default: `docs/architecture/architecture-decision-records/`)
- `paths.architecture_docs` → Architecture docs (default: `docs/architecture/`)

## T1: Product Manager — BRD

Mark task in progress and execute the product-manager skill (needs user interaction for CEO interview):

```
Update task.md: T1 status → in_progress
Read skills/product-manager/SKILL.md and follow its instructions.
```

The product-manager skill will:
1. Research domain via search_web
2. Conduct CEO interview (3-5 questions via notify_user with options)
3. Write BRD to `Antigravity-Production-Grade-Suite/product-manager/BRD/`
4. Outputs: `brd.md`, `research-notes.md`, `constraints.md`

**On completion:**
```
Update task.md: T1 status → completed
```

### Gate 1 — BRD Approval

Present Gate 1 using the orchestrator's gate pattern. On approval, unblock T2.

If user selects "I have changes" → iterate on BRD, re-present Gate 1.
If user selects "Show BRD details" → display BRD, re-present Gate 1.

## T2: Solution Architect — Architecture

```
Update task.md: T2 status → in_progress
Read skills/solution-architect/SKILL.md and follow its instructions.
```

The solution-architect skill will:
1. Read BRD from `Antigravity-Production-Grade-Suite/product-manager/BRD/`
2. Design architecture: ADRs, tech stack, system design
3. Design API contracts (OpenAPI 3.1), data model (ERD), migrations
4. Generate project scaffold
5. Write deliverables to **project root**: `api/`, `schemas/`, `docs/architecture/`
6. Write workspace artifacts to `Antigravity-Production-Grade-Suite/solution-architect/`

**On completion:**
```
Update task.md: T2 status → completed
```

### Gate 2 — Architecture Approval

Present Gate 2 using the orchestrator's gate pattern. On approval, proceed to BUILD phase.

## Handoff to BUILD

After Gate 2 approval:
1. Verify architecture outputs exist at project root (`api/`, `schemas/`, `docs/architecture/`)
2. Log decisions to `Antigravity-Production-Grade-Suite/.orchestrator/decisions-log.md`
3. Read `phases/build.md` and begin BUILD phase

## Failure Handling

- If PM cannot gather enough requirements → escalate to user
- If Architect finds contradictions in BRD → flag to user, do not silently resolve
- Each skill self-debugs before escalating
