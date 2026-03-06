---
name: qa-engineer
description: >
  [production-grade internal] Writes and runs tests when you want to verify
  code works — unit, integration, e2e, performance, contract testing.
  Routed via the production-grade orchestrator.
---

# QA Engineer Skill

## Protocols

!`cat Antigravity-Production-Grade-Suite/.protocols/ux-protocol.md 2>/dev/null || true`
!`cat Antigravity-Production-Grade-Suite/.protocols/input-validation.md 2>/dev/null || true`
!`cat Antigravity-Production-Grade-Suite/.protocols/tool-efficiency.md 2>/dev/null || true`
!`cat .production-grade.yaml 2>/dev/null || echo "No config — using defaults"`
!`cat Antigravity-Production-Grade-Suite/.orchestrator/codebase-context.md 2>/dev/null || true`

**Fallback (if protocols not loaded):** Use notify_user with options (never open-ended), "Chat about this" last, recommended first. Work continuously. Print progress constantly. Validate inputs before starting — classify missing as Critical (stop), Degraded (warn, continue partial), or Optional (skip silently). Use parallel tool calls for independent reads. Use view_file_outline before full Read.

## Engagement Mode

!`cat Antigravity-Production-Grade-Suite/.orchestrator/settings.md 2>/dev/null || echo "No settings — using Standard"`

| Mode | Behavior |
|------|----------|
| **Express** | Fully autonomous. Generate all test suites with sensible coverage targets. Report test plan in output. |
| **Standard** | Surface 1-2 critical decisions — coverage targets, e2e scope (which flows to test), performance thresholds. |
| **Thorough** | Show full test plan before implementing. Ask about test data strategy, which edge cases matter most, performance SLAs to validate. Show test results summary per category. |
| **Meticulous** | Walk through test plan per service. User reviews test scenarios before implementation. Show each test category's results. Ask about flaky test tolerance and retry strategy. |

## Brownfield Awareness

If `Antigravity-Production-Grade-Suite/.orchestrator/codebase-context.md` exists and mode is `brownfield`:
- **READ existing tests first** — understand test framework, patterns, fixtures, helpers
- **MATCH existing test framework** — if they use pytest, don't introduce jest. If they use Vitest, use Vitest
- **ADD tests alongside existing ones** — don't restructure their test directory
- **Existing tests must still pass** — run the full test suite after adding new tests
- **Reuse existing fixtures and helpers** — don't duplicate test utilities

## Config Paths

Read `.production-grade.yaml` at startup. Use these overrides if defined:
- `paths.services` — default: `services/`
- `paths.frontend` — default: `frontend/`
- `paths.tests` — default: `tests/`

## Context & Position in Pipeline

This skill runs AFTER the Software Engineer and Frontend Engineer skills have completed. It expects:

- **`services/` and `libs/`** — Backend services, handlers, repositories, domain models, API route definitions
- **`frontend/`** — UI components, pages, hooks, state management, API client calls
- **`api/`, `schemas/`, `docs/architecture/`** — API contracts (OpenAPI/AsyncAPI specs), data models, sequence diagrams
- **BRD or PRD** — Acceptance criteria, user stories, business rules, edge cases

The QA Engineer does NOT modify source code. It generates test files and test infrastructure to `tests/` at the project root, and test documentation (test plan, reports) to `Antigravity-Production-Grade-Suite/qa-engineer/`.

### Graceful Degradation

At startup, check whether `frontend/` (or `paths.frontend` from config) exists. If the frontend directory is not found:
- Skip all frontend-related test phases (UI E2E, visual regression, frontend contract tests, frontend-specific checks).
- Print: `[DEGRADED: frontend not found — skipping frontend tests]`
- Continue with all backend test phases normally.

---

## Output Structure

This skill produces output in two locations: test deliverables (code, configs, fixtures) at `tests/` in the project root, and workspace artifacts (test plan, reports, findings) in `Antigravity-Production-Grade-Suite/qa-engineer/`. Never write test files into `services/` or `frontend/` directly.

### Project Root Output (`tests/`)

```
tests/
├── unit/
│   └── <service>/                      # One folder per backend service
│       ├── handlers/
│       │   └── <handler>.test.ts       # HTTP handler / controller tests
│       ├── services/
│       │   └── <service>.test.ts       # Business logic / domain service tests
│       ├── repositories/
│       │   └── <repo>.test.ts          # Data access layer tests (mocked DB)
│       ├── validators/
│       │   └── <validator>.test.ts     # Input validation tests
│       └── mappers/
│           └── <mapper>.test.ts        # DTO / domain mapper tests
├── integration/
│   ├── docker-compose.test.yml         # Test dependency containers (Postgres, Redis, Kafka, etc.)
│   ├── setup.ts                        # Global integration test setup / teardown
│   └── <service>/
│       ├── db/
│       │   └── <repo>.integration.ts   # Real DB queries via testcontainers
│       ├── cache/
│       │   └── <cache>.integration.ts  # Real Redis / cache operations
│       ├── messaging/
│       │   └── <queue>.integration.ts  # Real message broker publish / consume
│       └── api/
│           └── <endpoint>.integration.ts  # HTTP-level integration (supertest / httptest)
├── contract/
│   ├── pacts/
│   │   ├── consumer/
│   │   │   └── <consumer>-<provider>.pact.ts  # Consumer-driven contract tests
│   │   └── provider/
│   │       └── <provider>.verify.ts           # Provider verification tests
│   ├── schema/
│   │   └── <api>.schema.test.ts               # OpenAPI schema validation tests
│   └── pact-broker.config.ts                  # Pact Broker connection config
├── e2e/
│   ├── api/
│   │   ├── flows/
│   │   │   └── <user-flow>.e2e.ts     # Multi-step API workflow tests
│   │   ├── smoke.e2e.ts               # Critical-path smoke tests
│   │   └── setup.ts                   # API E2E auth helpers, base URLs
│   └── ui/
│       ├── pages/                     # Page Object Models
│       │   └── <page>.page.ts
│       ├── flows/
│       │   └── <user-flow>.spec.ts    # Playwright / Cypress user flow specs
│       ├── visual/
│       │   └── <component>.visual.ts  # Visual regression snapshot tests
│       └── playwright.config.ts       # Or cypress.config.ts
├── performance/
│   ├── load-tests/
│   │   └── <scenario>.k6.js           # k6 load test scripts (sustained load)
│   ├── stress-tests/
│   │   └── <scenario>.k6.js           # k6 stress test scripts (breaking point)
│   ├── spike-tests/
│   │   └── <scenario>.k6.js           # k6 spike test scripts (sudden burst)
│   ├── baselines/
│   │   └── <scenario>.baseline.json   # Expected p50/p95/p99 latency, throughput
│   └── thresholds.js                  # Shared k6 threshold definitions
├── fixtures/
│   ├── factories/
│   │   └── <entity>.factory.ts        # Test data factories (fishery / factory-girl pattern)
│   ├── seed-data/
│   │   ├── <entity>.seed.json         # Static seed data for integration / E2E
│   │   └── seed-runner.ts             # Script to load seed data into test DBs
│   └── mocks/
│       ├── <external-api>.mock.ts     # External API mock servers (MSW / nock)
│       └── <service>.stub.ts          # Internal service stubs
└── coverage/
    └── thresholds.json                # Per-service and global coverage gates
```

### Workspace Output (`Antigravity-Production-Grade-Suite/qa-engineer/`)

```
Antigravity-Production-Grade-Suite/qa-engineer/
├── test-plan.md                        # Master test plan with traceability matrix
├── coverage-report.md                  # Coverage analysis and findings
└── findings.md                         # QA findings and recommendations
```

---

## Phases

Execute each phase sequentially. Do NOT skip phases. Each phase builds on the outputs of the previous one.

### Parallel Execution Strategy

After Phase 1 (Test Planning), Phases 2-6 run in parallel — each test type is independent:

```python
# After test plan is written, spawn all test types simultaneously:
Execute sequentially: Write unit tests following Phase 2 rules. Read test-plan.md for traceability. Write to tests/unit/.
Execute sequentially: Write integration tests following Phase 3 rules. Read test-plan.md. Write to tests/integration/.
Execute sequentially: Write contract tests following Phase 4 rules. Read test-plan.md. Write to tests/contract/.
Execute sequentially: Write E2E tests following Phase 5 rules. Read test-plan.md. Write to tests/e2e/.
Execute sequentially: Write performance tests following Phase 6 rules. Read test-plan.md. Write to tests/performance/.
```

Wait for all 5 agents to complete, then run Phase 7 (Test Infrastructure) sequentially — it needs all test files to configure CI.

**Why this works:** Each test type reads source code independently and writes to its own directory. No conflicts. The test plan from Phase 1 provides shared context.

**Execution order:**
1. Phase 1: Test Planning (sequential — foundational)
2. Phases 2-6: Unit + Integration + Contract + E2E + Performance (PARALLEL)
3. Phase 7: Test Infrastructure (sequential — needs all test files)

---

### Phase 1 — Test Planning

**Goal:** Produce a traceability matrix linking every BRD acceptance criterion to concrete test cases, categorized by test type.

**Inputs to read:**
- BRD / PRD acceptance criteria (every GIVEN/WHEN/THEN or equivalent)
- `api/` API contracts (OpenAPI specs, AsyncAPI specs)
- `schemas/` data models and `docs/architecture/` sequence diagrams
- `services/` service structure (list all services, handlers, repos)
- `frontend/` component and page structure (if frontend exists; otherwise skip frontend inputs)

**Actions:**
1. Extract every acceptance criterion and assign a unique ID (AC-001, AC-002, ...).
2. For each criterion, determine which test types are required (unit, integration, contract, e2e, performance).
3. Identify all services, modules, and components that need test coverage.
4. Identify all external dependencies that require mocking or test containers.
5. Identify critical user flows for E2E coverage.
6. Identify performance-sensitive endpoints for load testing.
7. Define coverage thresholds per service (lines, branches, functions).

**Output:** Write `Antigravity-Production-Grade-Suite/qa-engineer/test-plan.md` with the following sections:
- **Scope** — What is being tested, what is explicitly out of scope
- **Test Strategy** — Test pyramid approach, which test types cover which risk areas
- **Traceability Matrix** — Table mapping AC-ID to test case IDs, test type, and priority
- **Environment Requirements** — Containers, external services, env vars needed
- **Coverage Targets** — Per-service and global coverage gates
- **Risk Register** — Areas with high complexity or insufficient testability

---

### Phase 2 — Unit Tests

**Goal:** Test each service's business logic, handlers, and repositories in isolation with full mocking of external dependencies.

**Inputs to read:**
- `services/` source code for each service
- The test plan from Phase 1

**Rules:**
1. One test file per source file. Mirror the source directory structure under `tests/unit/<service>/`.
2. Mock ALL external dependencies: databases, caches, message brokers, HTTP clients, other services.
3. Use dependency injection or module mocking — never patch globals.
4. Test the happy path, error paths, edge cases, and boundary values for every public function.
5. For handlers/controllers: test request parsing, validation error responses, correct status codes, response body shape.
6. For services/domain logic: test business rule enforcement, state transitions, calculation correctness.
7. For repositories: test query construction, parameter binding, result mapping (with mocked DB driver).
8. For validators: test every validation rule, including null, empty, boundary, and malformed inputs.
9. Every test must have a descriptive name that reads as a specification: `it("should return 404 when order does not exist for the given user")`.
10. Use factories from `tests/fixtures/factories/` for test data — never inline large object literals.
11. Assert on specific values, not just truthiness. Prefer `toEqual` over `toBeTruthy`.
12. Test error types and messages, not just that an error was thrown.

**Output:** Write test files to `tests/unit/<service>/`.

Also write factories to `tests/fixtures/factories/` as you discover entity shapes.

---

### Phase 3 — Integration Tests

**Goal:** Test service interactions with real dependencies using testcontainers or docker-compose.

**Inputs to read:**
- `services/` database migrations, schemas, connection configs
- `docs/architecture/` infrastructure requirements (which DBs, caches, brokers)
- The test plan from Phase 1

**Rules:**
1. Write `tests/integration/docker-compose.test.yml` with containers for every real dependency (PostgreSQL, Redis, Kafka, Elasticsearch, etc.). Pin exact image versions.
2. Write `tests/integration/setup.ts` with global before/after hooks: start containers, run migrations, seed base data, tear down after suite.
3. Each integration test file connects to real containers — no mocks for the dependency under test.
4. Test actual SQL queries against a real database with realistic data volumes (not just 1 row).
5. Test cache read/write/eviction with a real Redis instance.
6. Test message publishing and consumption with a real broker.
7. Test API endpoints with real HTTP calls (supertest / httptest) against a running server.
8. Each test must clean up its own data. Use transactions with rollback, or truncate tables in afterEach.
9. Tests must be parallelizable — use unique identifiers to avoid cross-test data collisions.
10. Test failure modes: connection timeouts, constraint violations, concurrent writes, deadlocks.

**Output:** Write test files to `tests/integration/<service>/`.

Write `docker-compose.test.yml` and `setup.ts` to `tests/integration/`.

---

### Phase 4 — Contract Tests

**Goal:** Verify API consumers and providers agree on request/response schemas and that implementations conform to OpenAPI specifications.

**Inputs to read:**
- `api/` OpenAPI specs and AsyncAPI specs
- `services/` API route definitions, request/response DTOs
- `frontend/` API client calls and expected response shapes (if frontend exists; otherwise skip consumer-side frontend contracts)

**Rules:**
1. For each API consumer (frontend, other services), write a Pact consumer test that defines the expected interactions.
2. For each API provider, write a Pact provider verification test that replays consumer expectations against the real provider.
3. Write schema validation tests that load the OpenAPI spec and validate every endpoint's actual response against the schema.
4. Test backward compatibility: if there are versioned APIs, verify old consumers still work with new providers.
5. For async APIs (events, messages), write contract tests for message schemas using AsyncAPI specs.
6. Configure Pact Broker connection in `pact-broker.config.ts` (even if the broker URL is a placeholder).
7. Contract tests must fail if a required field is removed, a type changes, or a new required field is added without consumer agreement.

**Output:** Write contract tests to `tests/contract/`.

---

### Phase 5 — E2E Tests

**Goal:** Test critical user flows end-to-end through the full stack.

**Inputs to read:**
- BRD / PRD user stories and acceptance criteria (especially the critical path)
- `frontend/` pages and navigation flow (if frontend exists; otherwise API-only E2E)
- `services/` API endpoints
- The test plan from Phase 1 (critical user flows identified)

**Rules:**
1. Identify the 5-10 most critical user flows (signup, login, core CRUD, payment, etc.).
2. For API E2E: chain multiple API calls that represent a complete user journey. Use real auth tokens. Validate side effects (DB state, emails sent, events published).
3. For UI E2E (skip if frontend not found): use Page Object Model pattern. Each page gets a class in `tests/e2e/ui/pages/`.
4. UI tests must use resilient selectors: `data-testid` attributes, ARIA roles — never CSS classes or DOM structure.
5. Write a smoke test suite (`smoke.e2e.ts`) that covers the absolute minimum "is the app alive" checks. This runs on every deploy.
6. E2E tests must be idempotent — running them twice produces the same result.
7. Include setup/teardown that creates test users, seeds required data, and cleans up after.
8. Add explicit waits for async operations — never use arbitrary `sleep()` calls.
9. For visual regression (skip if frontend not found): capture screenshots of key pages and compare against baselines.
10. Configure test timeouts generously (30s+ per test) — E2E is slow by nature.

**Output:** Write E2E tests and page objects to `tests/e2e/`. Write Playwright or Cypress config.

---

### Phase 6 — Performance Tests

**Goal:** Establish performance baselines and create load/stress test scripts for performance-sensitive endpoints.

**Inputs to read:**
- `docs/architecture/` NFRs (latency targets, throughput requirements, SLOs)
- `services/` API endpoints (especially high-traffic ones)
- The test plan from Phase 1 (performance-sensitive areas)

**Rules:**
1. Write k6 scripts (JavaScript). Each script targets a specific scenario (e.g., "user browsing products", "checkout flow under load").
2. Load tests: simulate sustained normal traffic. Define realistic ramp-up patterns (e.g., 0 -> 100 VUs over 2 min, hold 10 min, ramp down).
3. Stress tests: find the breaking point. Ramp VUs aggressively until error rate exceeds 5% or p99 exceeds SLO.
4. Spike tests: simulate sudden traffic bursts (0 -> 500 VUs in 10 seconds).
5. Define thresholds in each script: `http_req_duration['p(95)'] < 500`, `http_req_failed < 0.01`.
6. Write baseline JSON files that record expected performance under normal load. CI compares against these.
7. Use realistic test data — not the same request repeated. Parameterize with CSV data files or k6 SharedArray.
8. Include authentication in test scripts (token generation, session management).
9. Test both read-heavy and write-heavy endpoints separately.
10. Add custom metrics for business-critical operations (e.g., `order_processing_time`).

**Output:** Write k6 scripts to `tests/performance/`. Write baseline files to `tests/performance/baselines/`.

---

### Phase 7 — Test Infrastructure

**Goal:** Configure CI test execution, coverage enforcement, and test reliability tooling.

**Inputs to read:**
- All test files generated in Phases 2-6
- Coverage thresholds from the test plan
- Project CI/CD system (GitHub Actions, GitLab CI, etc.)

**Actions:**
1. Write `tests/coverage/thresholds.json` with per-service and global coverage gates:
   ```json
   {
     "global": { "lines": 80, "branches": 75, "functions": 80, "statements": 80 },
     "services": {
       "<service-name>": { "lines": 85, "branches": 80, "functions": 85, "statements": 85 }
     }
   }
   ```
2. Write `.github/workflows/test.yml` (or `ci/test-config.yml`) with:
   - **Unit test stage** — runs first, fast, no containers. Fails fast on coverage threshold breach.
   - **Integration test stage** — starts docker-compose dependencies, runs integration suite, tears down.
   - **Contract test stage** — runs Pact tests, publishes results to broker.
   - **E2E test stage** — deploys to test environment, runs smoke + full E2E suite.
   - **Performance test stage** — runs load tests against staging, compares to baselines.
   - Parallel execution: split unit and integration tests across multiple CI runners by service.
   - Test result artifacts: JUnit XML reports, coverage HTML reports, k6 JSON results.
   - Flaky test detection: track test pass/fail history, quarantine tests with >5% flake rate.
   - Retry policy: retry failed E2E tests up to 2 times before marking as failed.
3. Write seed data runner to `tests/fixtures/seed-data/seed-runner.ts`.
4. Write external API mock configurations to `tests/fixtures/mocks/`.

**Output:** Write CI config to `.github/workflows/test.yml`, coverage thresholds and test infrastructure to `tests/`.

---

## Common Mistakes

| # | Mistake | Why It Fails | What to Do Instead |
|---|---------|-------------|-------------------|
| 1 | Writing tests inside `services/` or `frontend/` source directories | Pollutes source directories; violates pipeline separation | Always write tests to `tests/` at project root exclusively |
| 2 | Testing implementation details instead of behavior | Tests break on every refactor, providing no safety net | Test public interfaces, inputs, and outputs — not private methods or internal state |
| 3 | Using `any` type or skipping type assertions in test mocks | Mocks drift from real interfaces silently; tests pass but code is broken | Type mocks against the real interface; use `jest.Mocked<typeof RealService>` or equivalent |
| 4 | Sharing mutable state between tests | Tests pass in isolation but fail when run together; order-dependent results | Reset state in beforeEach; use factory functions that return fresh instances |
| 5 | Hardcoding connection strings, ports, or URLs in test files | Tests break in CI, on other machines, or when container ports change | Use environment variables with sensible defaults; read from docker-compose labels |
| 6 | Writing integration tests that mock the dependency under test | You are just writing unit tests with extra steps; real bugs slip through | If testing DB queries, use a real database. If testing cache, use real Redis. Mock only the things NOT under test |
| 7 | E2E tests that depend on specific database IDs or auto-increment values | Tests break when seed data changes or when run against a non-empty database | Create test data as part of test setup; reference by unique business identifiers, not DB IDs |
| 8 | Performance test scripts with a single hardcoded request | Does not simulate real traffic patterns; results are misleading | Parameterize requests with varied data; simulate realistic user think-time with `sleep(Math.random() * 3)` |
| 9 | Coverage thresholds set to 100% | Encourages meaningless tests written just to hit the number; blocks legitimate PRs | Set realistic thresholds (80-85% lines, 75-80% branches); focus on critical path coverage |
| 10 | Ignoring test execution time | Slow test suites get skipped by developers; CI feedback loops become painful | Parallelize tests by service; keep unit suite under 60 seconds; keep integration suite under 5 minutes |
| 11 | Not testing error paths and failure modes | Happy-path-only tests miss the bugs that actually cause production incidents | For every success test, write at least one failure test: invalid input, timeout, auth failure, conflict |
| 12 | Writing E2E tests with `sleep()` for async waits | Flaky on slow CI runners; wastes time on fast ones | Use explicit wait-for conditions: poll for element visibility, API response, or DB state change |
| 13 | Contract tests that only check status codes | Schema changes, missing fields, and type mismatches go undetected | Validate full response body shape, field types, required fields, and enum values against the contract |
| 14 | No seed data strategy — each test creates its own world from scratch | Integration and E2E suites become extremely slow; redundant setup logic everywhere | Build a shared seed-data layer with factories and a seed runner; tests add only their unique data on top |
| 15 | Generating test files without reading the actual implementation first | Tests reference nonexistent functions, wrong parameter names, or incorrect module paths | Always read the source file before writing its test file; match imports, function signatures, and error types exactly |

---

## Execution Checklist

Before marking the skill as complete, verify:

- [ ] `Antigravity-Production-Grade-Suite/qa-engineer/test-plan.md` has a traceability matrix covering every BRD acceptance criterion
- [ ] Every service in `services/` has corresponding unit tests in `tests/unit/`
- [ ] Every repository/data-access module has integration tests with real database containers
- [ ] Every API endpoint has at least one contract test validating its schema
- [ ] The top 5-10 critical user flows have E2E tests
- [ ] At least 3 performance-sensitive endpoints have k6 load test scripts with baselines
- [ ] `tests/integration/docker-compose.test.yml` defines all required test containers with pinned versions
- [ ] `tests/coverage/thresholds.json` defines realistic per-service coverage gates
- [ ] `.github/workflows/test.yml` orchestrates all test stages with parallelization and artifact collection
- [ ] All test factories are in `tests/fixtures/factories/` and reused across test types
- [ ] No test file has hardcoded secrets, credentials, or environment-specific values
- [ ] All tests can run independently and in any order
