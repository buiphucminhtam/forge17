# BUILD Phase — Dispatcher

This phase manages tasks T3a (Backend), T3b (Frontend), and T4 (DevOps Containerization). Sequential execution with progress tracking.

## Pre-Flight

Read `.production-grade.yaml` to determine:
- `features.frontend` → if false, skip T3b
- `project.architecture` → monolith vs microservices (affects containerization)
- `paths.services`, `paths.frontend`, `paths.shared_libs` → output locations

## T3a: Backend Engineering

Execute backend implementation:

```
Update task.md: T3a status → in_progress

Read skills/software-engineer/SKILL.md and follow its instructions.
Context:
- Read architecture from: api/, schemas/, docs/architecture/
- Read protocols from: Antigravity-Production-Grade-Suite/.protocols/
- Read .production-grade.yaml for paths and preferences.
- Write services to project root: services/, libs/shared/
- Write workspace artifacts to: Antigravity-Production-Grade-Suite/software-engineer/
- TDD enforced: write test → watch fail → implement → watch pass → refactor.

Update task.md: T3a status → completed
```

## T3b: Frontend Engineering (skip if features.frontend is false)

Execute frontend implementation:

```
Update task.md: T3b status → in_progress

Read skills/frontend-engineer/SKILL.md and follow its instructions.
Context:
- Read API contracts from: api/
- Read BRD user stories from: Antigravity-Production-Grade-Suite/product-manager/BRD/
- Read protocols from: Antigravity-Production-Grade-Suite/.protocols/
- Read .production-grade.yaml for framework and styling preferences.
- Write frontend to project root: frontend/
- Write workspace artifacts to: Antigravity-Production-Grade-Suite/frontend-engineer/

Update task.md: T3b status → completed
```

## T4: DevOps Containerization

Execute containerization after backend is done:

```
Update task.md: T4 status → in_progress

Read skills/devops/SKILL.md and follow its instructions.
Context:
- Read services from: services/
- Read architecture from: docs/architecture/
- Read .production-grade.yaml for paths and preferences.
- Write Dockerfiles per service, docker-compose.yml at project root.
- Write workspace artifacts to: Antigravity-Production-Grade-Suite/devops/containers/
- Validate: docker build succeeds for each service, docker-compose up starts all.

Update task.md: T4 status → completed
```

## Completion

When all BUILD tasks complete:
1. Verify all services compile and start
2. Verify docker-compose brings up the full stack
3. Log BUILD completion to workspace
4. Read `phases/harden.md` and begin HARDEN phase

## Failure Handling

- Build failure after 3 retries → escalate to user via notify_user
- Frontend fails but backend succeeds → continue backend-only pipeline
- Self-debug: read errors, fix, retry before escalating
