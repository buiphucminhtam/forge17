---
name: production-grade
description: >
  Use for any software engineering work that benefits from structured,
  production-quality execution. Routes to the right skills automatically.
  Full greenfield builds, adding features, hardening existing code,
  setting up infrastructure, code review, writing tests, documentation,
  or any combination. If the user is still exploring or uncertain,
  use polymath first.
---

# Production Grade

!`git status 2>/dev/null || echo "No git repo detected"`
!`cat CLAUDE.md 2>/dev/null || echo "No CLAUDE.md found"`
!`ls Claude-Production-Grade-Suite/ 2>/dev/null || echo "No existing workspace"`
!`cat .production-grade.yaml 2>/dev/null || echo "No config file — defaults apply"`

## Overview

Adaptive meta-skill orchestrator for all software engineering work. Analyzes the user's request, identifies which skills are needed, builds a minimal task graph, and executes — from a single code review to a full 14-skill greenfield build.

**14 skills, one orchestrator.** The orchestrator routes to the right skills based on what the user actually needs. No forced full-pipeline execution for everyday tasks.

**All skills are bundled in this plugin. Single install, everything included.**

## When to Use

- Building a new SaaS, platform, or service from scratch (full pipeline)
- Adding a feature to an existing codebase
- Hardening code before launch (security + QA + review)
- Setting up CI/CD, Docker, Terraform for existing code
- Writing tests for existing code
- Reviewing code quality or architecture conformance
- Designing architecture or API contracts
- Writing documentation for existing systems
- Performance optimization or reliability engineering
- Any task that benefits from structured, production-quality execution
- User says "build me a...", "add [feature]", "review my code", "set up CI/CD", "write tests", "harden this", "document this"

## Request Classification

Before any execution, classify the user's request into a mode. This determines which skills run and how.

**Step 1 — Analyze the request:**

Read `$ARGUMENTS` and the user's message. Classify into one of these modes:

| Mode | Trigger Signals | Skills Involved |
|------|----------------|-----------------|
| **Full Build** | "build a SaaS", "production grade", "from scratch", "full stack", greenfield intent | All 14 skills, full DEFINE→BUILD→HARDEN→SHIP→SUSTAIN pipeline |
| **Feature** | "add [feature]", "implement [feature]", "new endpoint", "new page", "integrate [service]" | PM (scoped) → Architect (scoped) → BE/FE → QA |
| **Harden** | "review", "audit", "secure", "harden", "before launch", "production ready" (on EXISTING code) | Security + QA + Code Review (parallel) → Remediation |
| **Ship** | "deploy", "CI/CD", "containerize", "infrastructure", "terraform", "docker" | DevOps → SRE |
| **Test** | "write tests", "test coverage", "test this", "add tests" | QA |
| **Review** | "review my code", "code review", "code quality", "check my code" | Code Reviewer |
| **Architect** | "design", "architecture", "API design", "data model", "tech stack", "how should I structure" | Solution Architect |
| **Document** | "document", "write docs", "API docs", "README" | Technical Writer |
| **Explore** | "explain", "understand", "help me think", "what should I", "I'm not sure" | Polymath |
| **Optimize** | "performance", "slow", "optimize", "scale", "reliability" | SRE + Code Reviewer |
| **Custom** | Doesn't fit above patterns | Present skill menu, let user pick |

**Step 2 — Present or skip the plan:**

**Single-skill modes** (Test, Review, Architect, Document, Explore): Skip plan presentation. Classify → invoke immediately. The intent is obvious — no overhead needed.

**Multi-skill modes** (Feature, Harden, Ship, Optimize, Custom): Present the plan for confirmation:

```python
AskUserQuestion(questions=[{
  "question": "Here's my plan:\n\n"
    "[numbered list of skills and what each does]\n\n"
    "Scope: [light / moderate / heavy]",
  "header": "Execution Plan",
  "options": [
    {"label": "Looks good — start (Recommended)", "description": "Execute this plan"},
    {"label": "I want the full production-grade pipeline", "description": "Run all 14 skills, 5 phases, 3 gates"},
    {"label": "Adjust the plan", "description": "Add or remove skills from the plan"},
    {"label": "Chat about this", "description": "Free-form input"}
  ],
  "multiSelect": false
}])
```

**Full Build mode**: Always proceed to the Full Build Pipeline section below.

If the user selects "full pipeline" from any mode, switch to Full Build.

**Step 3 — Execute the mode:**

For non-Full-Build modes, use the lightweight execution flows below. For Full Build, use the Full Build Pipeline.

## Mode Execution (Non-Full-Build)

All modes share these behaviors:
- Bootstrap workspace: `mkdir -p Claude-Production-Grade-Suite/.protocols/ Claude-Production-Grade-Suite/.orchestrator/`
- Write shared protocols (same as Full Build step 3)
- Read `.production-grade.yaml` for path overrides
- Read existing workspace state if present
- Engagement mode + parallelism: ask ONLY if mode involves 3+ skills. For 1-2 skill modes, use Standard engagement + Sequential execution (overhead of asking isn't worth it).

### Feature Mode

Add a feature to an existing codebase. Lightweight DEFINE → BUILD → TEST.

1. **Codebase scan** — read existing code structure, framework, patterns
2. **PM (Express depth)** — 2-3 questions to scope the feature. Write a mini-BRD (user stories + acceptance criteria for this feature only)
3. **Architect (scoped)** — design how this feature fits the existing architecture. New endpoints, schema changes, component additions. NOT a full system redesign.
4. **Build** — Software Engineer and/or Frontend Engineer implement the feature
5. **Test** — QA writes and runs tests for the new feature
6. **Optional: Review** — Code Reviewer checks the new code against existing patterns

**1 gate:** After PM scoping (step 2), confirm scope before building.

### Harden Mode

Security + quality audit on existing code. No building, pure analysis + fixes.

1. **Codebase scan** — read all existing code
2. **Parallel:** Security Engineer + QA Engineer + Code Reviewer analyze the code simultaneously
3. **Consolidated findings** — merge all findings, deduplicate, sort by severity
4. **Present findings** — show Critical/High/Medium/Low counts with top issues
5. **Remediation** — fix Critical and High issues (with user confirmation)

**1 gate:** After findings (step 4), before remediation.

### Ship Mode

Get existing code deployed. Infrastructure + reliability.

1. **Codebase scan** — read existing code, identify services, dependencies
2. **DevOps** — Dockerfiles, CI/CD pipelines, IaC (Terraform/Pulumi), monitoring
3. **SRE** — SLO definitions, runbooks, alerting, chaos experiment plan

**1 gate:** After DevOps infra plan, before applying.

### Test Mode

Write tests for existing code. Single skill.

1. Invoke QA Engineer directly against existing code
2. QA reads code, writes test plan, implements tests, runs them
3. Report results

**0 gates.** QA operates autonomously.

### Review Mode

Code quality review. Single skill, read-only.

1. Invoke Code Reviewer directly
2. Review produces findings report
3. Present findings with severity distribution

**0 gates.** Read-only operation.

### Architect Mode

Design or redesign architecture. Single skill.

1. Invoke Solution Architect
2. Full discovery interview (depth based on engagement mode)
3. Produces ADRs, diagrams, tech stack, API contracts, scaffold

**1 gate:** Architecture approval before scaffold generation.

### Document Mode

Generate documentation for existing code. Single skill.

1. Invoke Technical Writer
2. Reads all code + existing docs
3. Generates API reference, dev guides, architecture overview

**0 gates.** Technical Writer operates autonomously.

### Explore Mode

Thinking partner. Single skill.

1. Invoke Polymath
2. Research, advise, ideate — whatever the user needs
3. When ready, offer to hand off to any other mode

**0 gates.** Polymath manages its own dialogue.

### Optimize Mode

Performance + reliability analysis. Two skills.

1. **Code Reviewer** — identify performance anti-patterns, N+1 queries, memory leaks
2. **SRE** — capacity analysis, scaling bottlenecks, SLO evaluation
3. **Consolidated report** — performance findings + reliability recommendations
4. **Remediation** — fix top issues

**1 gate:** After analysis, before fixes.

### Custom Mode

User picks skills from a menu.

```python
AskUserQuestion(questions=[{
  "question": "Which skills do you need?",
  "header": "Skill Selection",
  "options": [
    {"label": "Product Manager", "description": "Requirements, user stories, BRD"},
    {"label": "Solution Architect", "description": "System design, API contracts, tech stack"},
    {"label": "Software Engineer", "description": "Backend implementation"},
    {"label": "Frontend Engineer", "description": "UI components, pages, design system"},
    {"label": "QA Engineer", "description": "Tests — unit, integration, e2e, performance"},
    {"label": "Security Engineer", "description": "OWASP audit, STRIDE, vulnerability scan"},
    {"label": "Code Reviewer", "description": "Architecture conformance, code quality"},
    {"label": "DevOps", "description": "Docker, CI/CD, Terraform, monitoring"},
    {"label": "SRE", "description": "SLOs, chaos engineering, runbooks"},
    {"label": "Technical Writer", "description": "API docs, dev guides, architecture docs"},
    {"label": "Data Scientist", "description": "LLM optimization, ML pipelines, experiments"},
    {"label": "Chat about this", "description": "Free-form input"}
  ],
  "multiSelect": true
}])
```

Execute selected skills in dependency order. If user picks conflicting skills, resolve via the authority hierarchy.

## Auto-Update Check

Run BEFORE any execution (all modes). Silent if current. One prompt max if update exists.

**Step 0 — version check:**

1. Read `~/.claude/plugins/installed_plugins.json` → find the `production-grade@nagisanzenin` entry → extract `version` (this is your local version)
2. WebFetch `https://raw.githubusercontent.com/nagisanzenin/claude-code-production-grade-plugin/main/.claude-plugin/plugin.json` → extract `version` (this is the remote version)
3. **If WebFetch fails** (offline, timeout, 404) → silently continue. Never block the pipeline over an update check.
4. **If remote ≤ local** → continue silently (user sees nothing)
5. **If remote > local** → prompt:

```python
AskUserQuestion(questions=[{
  "question": "production-grade v{remote} is available (you have v{local})",
  "header": "Update Available",
  "options": [
    {"label": "Update to v{remote} (Recommended)", "description": "Auto-update and restart pipeline"},
    {"label": "Skip — continue with v{local}", "description": "Use current version"}
  ],
  "multiSelect": false
}])
```

6. **If skip** → continue pipeline with current version
7. **If update** → execute in sequence:
   ```bash
   git clone --depth 1 https://github.com/nagisanzenin/claude-code-production-grade-plugin.git /tmp/pg-update
   ```
   - Read new SHA: `git -C /tmp/pg-update rev-parse HEAD`
   - Create cache dir: `mkdir -p ~/.claude/plugins/cache/nagisanzenin/production-grade/{remote_version}`
   - Copy files: `cp -r /tmp/pg-update/skills /tmp/pg-update/.claude-plugin /tmp/pg-update/README.md /tmp/pg-update/VISION.md ~/.claude/plugins/cache/nagisanzenin/production-grade/{remote_version}/`
   - Update `~/.claude/plugins/installed_plugins.json` → set `version` to remote version, `installPath` to new cache dir, `gitCommitSha` to new SHA, `lastUpdated` to current ISO timestamp
   - Clean up: `rm -rf /tmp/pg-update`
   - Print: `✓ Updated to v{remote_version}. Re-invoke /production-grade to use the new version.`
   - **STOP** — do not continue pipeline. The current session loaded the old SKILL.md; the user must re-invoke to pick up new content.

**If any update step fails**, print a warning and continue with the current version. Never let the updater break the pipeline.

## Full Build Pipeline

When mode is **Full Build**, follow this EXACT sequence:

1. **Print kickoff banner:**
```
━━━ Production Grade Pipeline v{local_version} ━━━━━━━━━━━━━━━━━━
Project: [extracted from user's message]
⧖ Bootstrapping workspace...
```

2. **Bootstrap workspace:**
```bash
mkdir -p Claude-Production-Grade-Suite/.protocols/
mkdir -p Claude-Production-Grade-Suite/.orchestrator/
```

3. **Write shared protocols** to `Claude-Production-Grade-Suite/.protocols/`:

| Protocol File | Content |
|---------------|---------|
| `ux-protocol.md` | 6 UX rules: never open-ended questions, "Chat about this" last, recommended first, continuous execution, real-time progress, autonomy |
| `input-validation.md` | 5-step validation: read config → probe inputs in parallel → classify Critical/Degraded/Optional → print gap summary → adapt scope |
| `tool-efficiency.md` | Parallel tool calls, smart_outline before Read, Glob not find, Grep not grep, config-aware paths |
| `conflict-resolution.md` | Authority hierarchy, dedup by file:line (keep highest severity), HARDEN→BUILD feedback loops (2 cycle max) |

Read these from the plugin's `skills/_shared/protocols/` directory and copy them. If plugin path is unavailable, write from the summaries above.

4. **Codebase discovery — detect greenfield vs brownfield:**

   Run these scans in parallel:
   ```python
   Glob("package.json"), Glob("go.mod"), Glob("pyproject.toml"), Glob("Cargo.toml"), Glob("pom.xml")
   Glob("src/**"), Glob("services/**"), Glob("frontend/**"), Glob("tests/**"), Glob("docs/**")
   Glob("Dockerfile*"), Glob(".github/workflows/*"), Glob("infrastructure/**"), Glob("terraform/**")
   Glob(".production-grade.yaml")
   ```

   **Classify the project:**

   | Signal | Mode | Behavior |
   |--------|------|----------|
   | Empty/new directory, no source files | **Greenfield** | Create everything from scratch |
   | Source files exist, no `.production-grade.yaml` | **Brownfield (unmapped)** | Discover structure, generate config, adapt |
   | Source files + `.production-grade.yaml` exist | **Brownfield (mapped)** | Use config paths, augment existing code |

   **If Greenfield** → log `✓ Greenfield project — creating from scratch` and continue to step 5.

   **If Brownfield** → run the adaptation sequence:

   a. **Structure report** — scan and summarize what exists:
   ```
   ⧖ Existing codebase detected. Scanning structure...
   Language: [detected from package.json/go.mod/etc.]
   Framework: [detected from dependencies]
   Directories found: src/, tests/, docs/, .github/workflows/
   Files: [N] source files, [N] test files, [N] config files
   ```

   b. **Path mapping** — if no `.production-grade.yaml`, generate one from discovered structure:
   ```python
   AskUserQuestion(questions=[{
     "question": "I've detected an existing codebase. Here's what I found:\n\n"
       "[structure summary]\n\n"
       "I'll map the pipeline outputs to your existing structure.",
     "header": "Existing Codebase Detected",
     "options": [
       {"label": "Approve mapping (Recommended)", "description": "Use detected paths, generate .production-grade.yaml"},
       {"label": "Customize paths", "description": "Review and adjust the path mapping"},
       {"label": "Treat as greenfield", "description": "Ignore existing code, create fresh structure"},
       {"label": "Chat about this", "description": "Discuss how the pipeline adapts to your codebase"}
     ],
     "multiSelect": false
   }])
   ```

   c. **Write `.production-grade.yaml`** from discovered structure — map `paths.*` to actual directories found.

   d. **Set brownfield context** — write to `Claude-Production-Grade-Suite/.orchestrator/codebase-context.md`:
   ```markdown
   # Codebase Context
   Mode: brownfield
   Language: [detected]
   Framework: [detected]
   Existing paths: [mapping]

   ## Rules for all agents
   - NEVER overwrite existing files without explicit user approval
   - READ existing code patterns before writing new code
   - MATCH existing code style (naming, formatting, structure)
   - ADD to existing directories, don't replace them
   - If a file exists at the target path, create alongside it or extend it
   - Existing tests must still pass after changes
   ```

   All agents read this file before executing. It overrides default "create from scratch" behavior.

5. **Engagement mode:**

```python
AskUserQuestion(questions=[{
  "question": "How deeply should the pipeline involve you in decisions?",
  "header": "Engagement Mode",
  "options": [
    {"label": "Standard (Recommended)", "description": "3 gates + moderate architect interview. Best balance of speed and control."},
    {"label": "Express", "description": "Minimal interaction. 3 gates only, auto-derive architecture from BRD. Fastest."},
    {"label": "Thorough", "description": "Deep interviews at PM and Architect. Full capacity planning. Review phase summaries."},
    {"label": "Meticulous", "description": "Maximum depth. Approve each ADR individually. Review every agent output. Full control."}
  ],
  "multiSelect": false
}])
```

Write the choice to `Claude-Production-Grade-Suite/.orchestrator/settings.md`:
```markdown
# Pipeline Settings
Engagement: [express|standard|thorough|meticulous]
Parallelism: [maximum|standard|sequential]
```

All skills read this file at startup to adapt their depth. The engagement mode controls:
- **PM interview depth** — Express: 2-3 questions. Standard: 3-5. Thorough: 5-8. Meticulous: 8-12.
- **Architect discovery depth** — Express: auto-derive. Standard: 5-7 questions. Thorough: 12-15 with capacity planning. Meticulous: full walkthrough + individual ADR approval.
- **Phase summaries** — Thorough/Meticulous show intermediate outputs between phases.
- **Gate detail** — Meticulous adds per-agent output review at each gate.

6. **Parallelism preference:**

```python
AskUserQuestion(questions=[{
  "question": "How should the pipeline parallelize work?",
  "header": "Performance Mode",
  "options": [
    {"label": "Maximum parallelism (Recommended)", "description": "Fastest execution, lowest total token cost. Spawns up to 7+ concurrent agents. Best for most projects."},
    {"label": "Standard", "description": "2-3 concurrent agents. Slower but lighter on system resources."},
    {"label": "Sequential", "description": "One agent at a time. Use for debugging or when inspecting each step."}
  ],
  "multiSelect": false
}])
```

Store both choices in `Claude-Production-Grade-Suite/.orchestrator/settings.md`. Maximum parallelism is the recommended default — parallel execution is both faster AND cheaper in total tokens because each agent carries minimal context instead of accumulating prior work.

7. **Detect existing workspace** — if `Claude-Production-Grade-Suite/.orchestrator/` has prior state, offer to resume or restart via AskUserQuestion.

8. **Polymath pre-flight check:**
   - If `Claude-Production-Grade-Suite/polymath/handoff/context-package.md` exists → read it, pass to PM as pre-loaded context. Log: `✓ Polymath context loaded — skipping redundant discovery`
   - If no polymath context, assess the user's request for knowledge gaps:
     - **Vague scope** (no specific problem domain), **no constraints** (scale, budget, team), **complex domain with no domain language**, **contradictory signals**
     - If gaps detected → invoke `Skill("polymath")` for pre-flight consultation before proceeding. The polymath will research, clarify with the user, and write a context package when ready.
     - If no gaps → proceed directly. Log: `✓ Request is clear — proceeding to PM`
   - If user explicitly requests to skip polymath ("just build it", clear detailed spec) → proceed immediately.

9. **Research the domain** — use WebSearch before asking the user anything (skip if polymath already researched).

10. **Create team and task graph:**
```python
TeamCreate(team_name="production-grade")
```
Create all 13 tasks with dependencies (see Task Dependency Graph). Use TaskCreate for each, then TaskUpdate to set `addBlockedBy` relationships using the returned task IDs.

11. **Begin Phase 1** — read `phases/define.md` and start immediately. Do NOT ask "should I proceed?"

**Key principle:** The user already told you what to build. Research, plan, start building. Pause at the 3 approval gates. In Thorough/Meticulous mode, also show phase summaries between major phases — but never block on them (inform, don't gate).

## User Experience Protocol

Follow the shared UX Protocol at `Claude-Production-Grade-Suite/.protocols/ux-protocol.md`. Key rules:
1. **NEVER** ask open-ended questions — always use AskUserQuestion with predefined options
2. **"Chat about this"** always last option
3. **Recommended option first** with `(Recommended)` suffix
4. **Continuous execution** — work until next gate or completion
5. **Real-time progress** — constant ⧖/✓ terminal updates
6. **Autonomy** — sensible defaults, self-resolve, report decisions

### Gate Companion — Polymath Integration

When the user selects **"Chat about this"** at any gate, invoke the polymath in translate mode:

```python
Skill(skill="polymath")
# Polymath reads the gate artifacts, explains in plain language,
# answers the user's questions via structured options,
# then re-presents the original gate options when the user is ready.
```

This ensures non-technical users can understand what they're approving without the orchestrator needing to be the translator.

### Strategic Gates (3 total)

**Gate 1 — BRD Approval** (after T1):
```python
AskUserQuestion(questions=[{
  "question": "BRD complete: [X] user stories, [Y] acceptance criteria. Approve?",
  "header": "Gate 1: BRD",
  "options": [
    {"label": "Approve — start architecture (Recommended)", "description": "BRD locked, proceed to Solution Architect"},
    {"label": "Show BRD details", "description": "Display the full BRD before deciding"},
    {"label": "I have changes", "description": "Request modifications to requirements"},
    {"label": "Chat about this", "description": "Free-form input about the BRD"}
  ],
  "multiSelect": false
}])
```

**Gate 2 — Architecture Approval** (after T2):
```python
AskUserQuestion(questions=[{
  "question": "Architecture complete: [tech stack summary]. Approve to start building?",
  "header": "Gate 2: Arch",
  "options": [
    {"label": "Approve — start building (Recommended)", "description": "Architecture locked, begin autonomous BUILD phase"},
    {"label": "Show architecture details", "description": "Walk through ADRs, diagrams, and API spec"},
    {"label": "I have concerns", "description": "Flag issues with architecture decisions"},
    {"label": "Chat about this", "description": "Free-form input about the architecture"}
  ],
  "multiSelect": false
}])
```

**Gate 3 — Production Readiness** (after T9):
```python
AskUserQuestion(questions=[{
  "question": "All phases complete. [summary]. Ship it?",
  "header": "Gate 3: Ship",
  "options": [
    {"label": "Ship it — production ready (Recommended)", "description": "Finalize assembly and deploy"},
    {"label": "Show full report", "description": "Display complete pipeline summary"},
    {"label": "Fix issues first", "description": "Address remaining findings before shipping"},
    {"label": "Chat about this", "description": "Free-form input about production readiness"}
  ],
  "multiSelect": false
}])
```

## Task Dependency Graph — Two-Wave Parallel Execution

Dynamic task generation with two-wave parallelism. The orchestrator reads the architecture output (number of services, pages, modules) and generates tasks accordingly — one Agent per work unit.

**Maximum parallelism mode (default):**

```
T1: product-manager (BRD)
    ↓ [GATE 1]
T2: solution-architect (Architecture)
    ↓ [GATE 2]
    ↓ parallelism preference
┌────────────── WAVE A: BUILD + ANALYSIS (all parallel) ──────────────┐
│                                                                      │
│  BUILD (needs architecture):                                         │
│    T3a: software-engineer ──── spawns N agents (1 per service)       │
│    T3b: frontend-engineer ──── spawns N agents (1 per page group)    │
│                                                                      │
│  ANALYSIS (needs architecture only, starts alongside build):         │
│    T4a: devops — Dockerfiles + CI skeleton                           │
│    T5a: qa-engineer — test plan + test scaffolds                     │
│    T6a: security-engineer — STRIDE threat model                      │
│    T6b: code-reviewer — arch conformance + review checklist          │
│    T9a: sre — SLO definitions + alert rules                         │
│                                                                      │
│  Up to 7+ concurrent agents in Wave A                                │
└──────────────────────────────────────────────────────────────────────┘
    ↓ (wait for T3a + T3b code to be written)
┌────────────── WAVE B: EXECUTION against code (all parallel) ────────┐
│                                                                      │
│    T4b: devops — build + push containers                             │
│    T5b: qa-engineer — implement tests (spawns N: unit/integ/e2e/perf)│
│    T6c: security-engineer — code audit + dep scan (spawns N phases)  │
│    T6d: code-reviewer — actual review (spawns N: arch/quality/perf)  │
│                                                                      │
│  Up to 4 concurrent agents, each spawning 3-4 internal agents        │
└──────────────────────────────────────────────────────────────────────┘
    ↓
T7: devops (IaC + CI/CD) ──────────┐
T8: remediation (HARDEN fixes) ────┘ PARALLEL
    ↓
T9b: sre (chaos + capacity) ──────┐
T10: data-scientist (conditional) ─┘ PARALLEL
    ↓ [GATE 3]
T11: technical-writer (spawns N: API ref / dev guide / ops guide) ──┐
T12: skill-maker ──────────────────────────────────────────────────┘ PARALLEL
    ↓
T13: Compound Learning + Assembly
```

**Standard mode:** Collapses waves — Wave A runs build only, Wave B runs all harden sequentially. No internal skill parallelism.

**Sequential mode:** One task at a time. Original 13-task serial execution.

### Task Dependencies (Maximum Parallelism)

Create tasks with TaskCreate, then set dependencies with TaskUpdate using the returned IDs.

**Wave A tasks** — all depend on T2 (architecture), no dependencies on each other:

| Task | Blocked By | Notes |
|------|-----------|-------|
| T1 | — | First task, no blockers |
| T2 | T1 | Needs BRD |
| T3a | T2 | Backend — spawns 1 Agent per service from architecture |
| T3b | T2 | Frontend — spawns 1 Agent per page group from BRD |
| T4a | T2 | DevOps analysis — Dockerfiles + CI skeleton |
| T5a | T2 | QA test plan — from BRD + architecture |
| T6a | T2 | Security threat model — STRIDE from architecture |
| T6b | T2 | Review prep — arch conformance checklist |
| T9a | T2 | SRE — SLO definitions from architecture + monitoring |

**Wave B tasks** — depend on T3a/T3b (code) + their Wave A analysis:

| Task | Blocked By | Notes |
|------|-----------|-------|
| T4b | T3a, T4a | Build containers — needs code + Dockerfiles |
| T5b | T3a, T3b, T5a | Implement tests — needs code + test plan |
| T6c | T3a, T3b, T6a | Code audit — needs code + threat model |
| T6d | T3a, T3b, T6b | Code review — needs code + checklist |

**Post-wave tasks:**

| Task | Blocked By | Notes |
|------|-----------|-------|
| T7 | T5b, T6c, T6d | IaC + CI/CD — needs HARDEN output |
| T8 | T5b, T6c, T6d | Remediation — needs HARDEN findings |
| T9b | T7, T8, T9a | SRE execution — needs infra + SLO defs |
| T10 | T7, T8 | Conditional on AI/ML usage |
| T11 | T9b | Docs — needs all prior output |
| T12 | T9b | Skills — needs all prior output |
| T13 | T11, T12 | Final step |

### Dynamic Task Generation

After Gate 2 (architecture approved), the orchestrator reads the architecture output to determine work units:

1. **Count services** — Read `docs/architecture/` service list or `api/` specs. For each service, create a subtask under T3a.
2. **Count pages** — Read BRD user stories. Group into page clusters (auth, dashboard, settings, etc.). For each group, create a subtask under T3b.
3. **Generate Wave A TaskList** — All T3a subtasks + T3b subtasks + T4a + T5a + T6a + T6b + T9a. No cross-dependencies.
4. **On Wave A completion** — Generate Wave B TaskList with dependencies on Wave A outputs.

Each subtask is dispatched as:
```python
Agent(
  prompt="You are the Software Engineer. Implement the {service_name} service. Read architecture at docs/architecture/ and API contract at api/openapi/{service}.yaml. Follow skills/software-engineer/phases/02-service-implementation.md. Write output to services/{service_name}/.",
  subagent_type="general-purpose",
  mode="bypassPermissions",
  run_in_background=True
)
```

### Conditional Tasks

- **T3b (Frontend):** Skip if `.production-grade.yaml` has `features.frontend: false`
- **T10 (Data Scientist):** Auto-detect by scanning for `openai`, `anthropic`, `langchain`, `transformers`, `torch`, `tensorflow` imports. If not detected and `features.ai_ml: false`, mark as completed immediately.

## Phase Execution

Each phase loads its dispatcher file for task management and agent spawning.

| Phase | File | Tasks | Parallel Strategy |
|-------|------|-------|-------------------|
| DEFINE | `phases/define.md` | T1, T2 | Sequential (gates) |
| BUILD + ANALYSIS | `phases/build.md` | T3a, T3b, T4a, T5a, T6a, T6b, T9a | Wave A: all 7 parallel, skills spawn internal agents |
| HARDEN | `phases/harden.md` | T4b, T5b, T6c, T6d | Wave B: all 4 parallel, skills spawn internal agents |
| SHIP | `phases/ship.md` | T7, T8, T9b, T10 | #5, #6 parallel pairs |
| SUSTAIN | `phases/sustain.md` | T11, T12, T13 | #7 parallel + internal |

**Internal skill parallelism** — each skill spawns its own concurrent agents:

| Skill | What Parallelizes Internally |
|-------|------------------------------|
| software-engineer | Shared foundations first (sequential), then 1 Agent per service (Phase 2b: parallel). Quality over speed — foundations ensure consistency. |
| frontend-engineer | UI Primitives first (sequential), then Layout + Features parallel (Phase 3b), then Pages parallel (Phase 4). Primitives are foundational atoms. |
| qa-engineer | 4 parallel Agents: unit, integration, e2e, performance tests |
| security-engineer | 4 parallel Agents: code audit, auth review, data security, supply chain |
| code-reviewer | 3 parallel Agents: arch conformance, code quality, performance review |
| devops | 3 parallel Agents: IaC, CI/CD, container orchestration |
| sre | 3 parallel Agents: chaos engineering, incident management, capacity planning |
| technical-writer | 2 parallel Agents: API reference, developer guides |

**Read the phase file BEFORE starting that phase. Never load all phase files at once.**

### Agent Dispatch Methods

**Skill Tool** — for sequential, user-interactive tasks (PM interview, gate approvals):
```python
Skill(skill="product-manager")
```

**Agent Tool** — for parallel, background tasks:
```python
Agent(
  prompt="You are the Backend Engineer. Read architecture at...",
  subagent_type="general-purpose",
  mode="bypassPermissions",
  run_in_background=True
)
```

## Conflict Resolution

Follow the shared protocol at `Claude-Production-Grade-Suite/.protocols/conflict-resolution.md`.

| Artifact | Sole Authority | Others Must NOT |
|----------|---------------|-----------------|
| OWASP, STRIDE, PII, encryption | **security-engineer** | code-reviewer must NOT do security review |
| SLO, error budgets, runbooks | **sre** | devops must NOT define SLOs |
| Code quality, arch conformance | **code-reviewer** | — |
| Infrastructure, CI/CD, monitoring setup | **devops** | sre reviews but doesn't provision |
| Requirements (WHAT) | **product-manager** | architect flags gaps, doesn't change requirements |
| Architecture (HOW) | **solution-architect** | — |

### Remediation Feedback Loop

When HARDEN skills find Critical/High issues:
1. Orchestrator creates T8 (Remediation) task with findings
2. Remediation agent fixes code in `services/`, `frontend/`
3. Re-scan affected files after fixes
4. If still failing after **2 cycles** → escalate to user via AskUserQuestion

## Context Bridging

| Task | Reads From | Writes To (Project Root) | Writes To (Workspace) |
|------|-----------|--------------------------|----------------------|
| Polymath | User dialogue, web research | — | `polymath/context/`, `polymath/handoff/` |
| T1: PM | User input, polymath context, web research | — | `product-manager/BRD/` |
| T2: Architect | `product-manager/BRD/` | `api/`, `schemas/`, `docs/architecture/` | `solution-architect/` |
| T3a: Backend | `api/`, `schemas/`, `docs/architecture/` | `services/`, `libs/shared/` | `software-engineer/` |
| T3b: Frontend | `api/`, `product-manager/BRD/` | `frontend/` | `frontend-engineer/` |
| T4: DevOps | `services/`, `docs/architecture/` | Dockerfiles at root | `devops/containers/` |
| T5: QA | `services/`, `frontend/`, `api/` | `tests/` | `qa-engineer/` |
| T6a: Security | All implementation code | — | `security-engineer/` |
| T6b: Review | All implementation + architecture | — | `code-reviewer/` |
| T7: DevOps IaC | Architecture, implementation | `infrastructure/`, `.github/workflows/` | `devops/` |
| T8: Remediation | HARDEN findings | Fixes in `services/`, `frontend/` | — |
| T9: SRE | All prior outputs | `docs/runbooks/` | `sre/` |
| T10: Data Sci | Implementation (LLM usage) | — | `data-scientist/` |
| T11: Tech Writer | ALL workspace + project | `docs/` | `technical-writer/` |
| T12: Skill Maker | ALL workspace | `.claude/skills/` | `skill-maker/` |

**Deliverables** go to project root (respecting `.production-grade.yaml` path overrides). **Workspace artifacts** go to `Claude-Production-Grade-Suite/<skill-name>/`.

## Workspace Architecture

```
Claude-Production-Grade-Suite/
├── .protocols/              # Shared protocols (written at bootstrap)
├── .orchestrator/           # Pipeline state via TaskList
├── product-manager/         # BRD, research
├── solution-architect/      # Architecture artifacts
├── software-engineer/       # Backend logs/artifacts
├── frontend-engineer/       # Frontend logs/artifacts
├── qa-engineer/             # Test artifacts
├── security-engineer/       # Security findings
├── code-reviewer/           # Quality findings
├── devops/                  # Infrastructure artifacts
├── sre/                     # Readiness artifacts
├── data-scientist/          # AI/ML artifacts (conditional)
├── technical-writer/        # Documentation artifacts
└── skill-maker/             # Custom skills
```

## Adaptive Rules

| Situation | Action |
|-----------|--------|
| No frontend needed | Skip T3b, simplify DevOps |
| Monolith architecture | Single Dockerfile, skip K8s/service mesh |
| LLM/ML APIs detected | Auto-enable T10 (Data Scientist) |
| Critical security finding | Create remediation task (T8) |
| QA failures > 20% | Flag to user |
| Architecture drift detected | Warn user (arch decisions are user-approved) |
| `features.frontend: false` | Skip T3b entirely |
| `features.ai_ml: false` | Skip T10 unless auto-detected |

## Security Hooks (Continuous)

Security runs during ALL phases:
- Block `rm -rf /`, `chmod 777`, destructive operations
- Block `.env`, `.key`, `.pem`, `credentials.json` from git
- Scan staged files for API keys, tokens, passwords
- Engineers scan for hardcoded secrets as they write code

## Autonomous Agent Behavior

Every agent follows:
1. **Build and verify** — after writing code, run it. After writing tests, execute them.
2. **Validation loop** — `while not valid: fix(errors); validate()`
3. **Self-debug** — read errors, identify root cause. After 3 failures: stop and report.
4. **Quality bar** — no TODOs, no stubs. All code compiles. All tests pass.
5. **TDD enforced** — write test first, watch fail, implement, watch pass, refactor.

## Partial Execution

| Command | Tasks Run |
|---------|----------|
| `/production-grade just define` | T1, T2 only |
| `/production-grade just build` | T3a, T3b, T4 (requires T2 output) |
| `/production-grade just harden` | T5, T6a, T6b (requires BUILD output) |
| `/production-grade just ship` | T7-T10 (requires HARDEN output) |
| `/production-grade just document` | T11 only |
| `/production-grade skip frontend` | Omit T3b |
| `/production-grade start from architecture` | Skip T1, start at T2 |

## Final Summary Template

```
╔══════════════════════════════════════════════════════════════╗
║          PRODUCTION GRADE v{local_version} — COMPLETE          ║
╠══════════════════════════════════════════════════════════════╣
║  Project: <name>                                             ║
║                                                              ║
║  DEFINE:  ✓ BRD (<X> stories) ✓ Architecture (<pattern>)     ║
║  BUILD:   ✓ Backend (<N> services) ✓ Tests (<N> passing)     ║
║  HARDEN:  ✓ Security (<N> fixed) ✓ Code Review (<N> fixed)   ║
║  SHIP:    ✓ Docker ✓ CI/CD ✓ Terraform ✓ SRE approved       ║
║  SUSTAIN: ✓ Docs ✓ Skills (<N> created) ✓ Learnings captured ║
║                                                              ║
║  Workspace: Claude-Production-Grade-Suite/                   ║
║  Config: .production-grade.yaml                              ║
╚══════════════════════════════════════════════════════════════╝
```

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Running BUILD without DEFINE | Architecture decisions must exist first |
| Code reviewer doing OWASP review | security-engineer is sole OWASP authority |
| DevOps defining SLOs | sre is sole SLO authority |
| DevOps writing runbooks | sre writes runbooks to docs/runbooks/ |
| Skipping tests | Production grade means tested |
| Not running code after writing | Every agent verifies output compiles and runs |
| Agents working in isolation | Cross-reference via Context Bridging table |
| Over-asking the user | Respect engagement mode. Express: 3 gates only. Standard: 3 gates + moderate interview. Thorough/Meticulous: deeper interviews but always structured options. |
| Ignoring engagement mode | ALL skills must read settings.md and adapt depth. Express architect doesn't ask 15 questions. Meticulous PM doesn't skip to BRD after 2 questions. |
| One-size-fits-all architecture | Architecture is derived from constraints (scale, team, budget, compliance). A 100-user internal tool does NOT need microservices + K8s. |
| Writing stubs | No `// TODO: implement` in production code |
| Hardcoded paths | Read `.production-grade.yaml` for path overrides |
| Sequential when parallel possible | Maximum parallelism: two-wave execution + internal skill agents. Every independent unit gets its own agent |
| Duplicating security review | code-reviewer references security-engineer findings |
