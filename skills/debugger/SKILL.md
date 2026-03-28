---
name: debugger
description: >
  [production-grade internal] Systematic debugging and root-cause analysis —
  hypothesis-driven investigation, log analysis, bisection, reproduction
  strategies, and fix verification. Activated when bugs, errors, or
  unexpected behavior need diagnosis.
  Routed via the production-grade orchestrator.
---

### Debugger (2026 Agentic Architecture)

#### Protocols
!cat skills/_shared/protocols/ux-protocol.md 2>/dev/null || true
!cat skills/_shared/protocols/input-validation.md 2>/dev/null || true
!cat skills/_shared/protocols/tool-efficiency.md 2>/dev/null || true
!cat skills/_shared/protocols/graceful-failure.md 2>/dev/null || true
!cat skills/_shared/protocols/code-intelligence.md 2>/dev/null || true
!cat skills/_shared/protocols/mcp-integration.md 2>/dev/null || true
!cat .production-grade.yaml 2>/dev/null || echo "No config — using defaults"
!cat .forgewright/codebase-context.md 2>/dev/null || true

**Fallback (if protocols not loaded):** Use `notify_user` with options (never open-ended), "Chat about this" last, recommended first. Work continuously. Print progress constantly. Validate inputs before starting — classify missing as Critical (stop), Degraded (warn, continue partial), or Optional (skip silently). Leverage the Model Context Protocol (MCP) for tool execution. Use parallel tool calls for independent reads. Use `view_file_outline` before full `Read`. Enforce deterministic routing.

#### Engagement Mode
!cat .forgewright/settings.md 2>/dev/null || echo "No settings — using Standard"

| Mode | Behavior |
| --- | --- |
| **Express** | Fully autonomous. Investigate, diagnose, fix, verify via automated CI/CD checks. Report root cause, cost metrics, and fix in output. |
| **Standard** | Surface the root cause, multi-tenant impact, and proposed fix before applying. Show evidence trail from eBPF/OpenTelemetry. Auto-resolve investigation strategy. |
| **Thorough** | Present investigation plan before starting. Show each hypothesis with evidence mapped to distributed traces. Walk through fix options with infrastructure/FinOps trade-offs. Ask about acceptable risk for the fix. |
| **Meticulous** | Step-by-step investigation with user approval at each stage. Present all hypotheses ranked. User chooses investigation path. Review fix diff and blast-radius before applying. Verify Continuous Quality regression suite after fix. |

#### Brownfield & 2026 Architecture Awareness
This skill operates on existing code, frequently involving distributed composable architectures, LLM-generated code debt, and hybrid multi-cloud systems. 
*   **READ existing telemetry first** — utilize eBPF (Cilium/Tetragon) traces, OpenTelemetry logs, and structured monitoring to pinpoint anomalies without injecting sidecars.
*   **RESPECT Packaged Business Capabilities (PBCs)** — fixes must not violate established composable boundaries or domain ownership.
*   **VERIFY Tenant Isolation** — assume a multi-tenant environment. Every data access fix MUST validate `tenant_id` scopes to prevent cross-tenant data leakage. 
*   **ADD continuous quality tests** — every fix must include a regression test capable of running seamlessly in CI/CD and production (shift-right validation).

#### Overview
Systematic debugging pipeline: from symptom observation through hypothesis generation, evidence gathering, root cause identification, fix implementation, and regression verification. Built on a deterministic ReAct (Reason, Act, Observe) loop with hard stopping constraints. Produces investigation reports, semantic evaluations, and regression tests.

#### Config Paths
Read `.production-grade.yaml` at startup. Use these overrides if defined:
*   `paths.services` — default: `services/`
*   `paths.frontend` — default: `frontend/`
*   `paths.tests` — default: `tests/`
*   `paths.telemetry` — default: `logs/telemetry/`

#### When to Use
*   Application crashes or throws unexpected errors.
*   Feature works incorrectly or produces wrong output (including LLM/Agent hallucination logic).
*   Performance degradation — latency spikes, memory leaks, high FinOps unit costs.
*   Test failures — existing suites break after changes.
*   Intermittent/flaky behavior (e.g., race conditions in multi-agent orchestration).
*   "It works locally but not in staging/production."
*   User says "debug", "fix bug", "investigate", or "trace alert".

#### Input Classification
| Category | Inputs | Behavior if Missing |
| --- | --- | --- |
| Critical | Error message, stack trace, or symptom description | STOP — cannot debug without knowing the symptom. Request via `notify_user`. |
| Degraded | Reproduction steps, eBPF logs, distributed traces, affected PBCs | WARN — investigation will consume more tokens/time without these. |
| Optional | Recent git commits, test failures, FinOps metrics | Continue — gather these dynamically via MCP tools during investigation. |

#### Process Flow & Parallel Execution
After Phase 1 (Triage), multiple hypotheses are investigated via parallel worker agents orchestrated by a centralized state machine. 

**Execution order:**
1. **Phase 1: Triage** (Sequential — gather symptoms and eBPF/observability data)
2. **Phase 2: Hypothesize** (Sequential — generate ranked hypotheses based on system architecture)
3. **Phase 3: Investigate** (PARALLEL — dispatch sub-agents to test multiple hypotheses simultaneously using independent ReAct loops)
4. **Phase 4: Fix** (Sequential — synthesize evidence, implement the fix)
5. **Phase 5: Verify** (Sequential — run tests, confirm fix, validate security and tenant boundaries)

--------------------------------------------------------------------------------

#### The Iron Law of Debugging (2026 Revision)
**Inspired by the Superpowers systematic debugging methodology & Agentic Guardrails**

If you haven't completed Phase 1, you **cannot propose fixes**. Period. Furthermore, agent loops MUST be strictly bounded.

##### Red Flags — STOP and Return to Phase 1
If you catch yourself demonstrating these behaviors:
*   "Quick fix for now, investigate later."
*   "Just try changing X and see if it works" (Guess-and-check thrashing).
*   "Add multiple changes, run tests."
*   Proposing solutions before tracing data flow across microservices.
*   **Runaway Loop Alert:** Calling the same tool or checking the same log 3+ times without new information.
*   **"One more fix attempt" (when already tried 2+)** -> 3+ failures = structural/architectural problem. Stop fixing symptoms.

**ALL of these mean: STOP. Return to Phase 1.**

##### Agent Loop Safeguards (Anti-Runaway Constraints)
1.  **Max Iteration Limit:** Never exceed 5 ReAct iterations per hypothesis. If unresolved, mark as *Inconclusive* and halt.
2.  **State Tracking:** Maintain explicit memory of checked files and executed commands to prevent infinite looping.
3.  **Token Budgeting:** Terminate if investigation context window approaches 80% capacity without identifying root cause.

--------------------------------------------------------------------------------

#### Phase 1 — Triage & Symptom Collection
**Goal:** Gather all available evidence across distributed systems before forming hypotheses.

**Actions:**
1.  **Classify severity:**
    *   **P0 — Outage**: Production down, multi-tenant data leak, security breach → fix immediately.
    *   **P1 — Critical**: Core capability broken, agentic workflow stalled → fix within hours.
    *   **P2 — Major**: Feature broken, workaround exists → fix within sprint.
    *   **P3 — Minor**: Cosmetic, edge case, minor token inefficiency → schedule for backlog.
2.  **Collect symptoms** (read in parallel via MCP):
    *   Error messages, exceptions, and stack traces.
    *   Distributed traces (OpenTelemetry spans, Jaeger).
    *   Kernel-level security/network anomalies (eBPF / Tetragon logs).
    *   Environment (local/staging/prod, cloud provider, K8s namespace).
3.  **Check recent changes:**
    *   Git history (e.g., AI-generated silent PRs that bypassed review).
    *   Infrastructure as Code (IaC 2.0) drift.
4.  **Check existing tests & compliance:**
    *   Are there failing tests? Which ones?
    *   Does this touch highly regulated data (PCI, HIPAA, EU AI Act traceability)?

**Output:** Symptom summary with severity classification, telemetry context, and blast radius.

--------------------------------------------------------------------------------

#### Phase 2 — Hypothesis Generation
**Goal:** Generate ranked hypotheses for the root cause based on evidence and distributed system realities.

**Framework — "5 Why" + "Where":**
1.  **WHERE** does the error originate? (Frontend → API Gateway → PBC/Microservice → Database → LLM Wrapper → eBPF/Infra)
2.  **WHEN** did it start? (Correlate with deployments, IaC changes, LLM model version deprecations)
3.  **WHY** does it happen? (Logic bug, cross-tenant leak, race condition, token limit exceeded, prompt hallucination, network policy block)

**Ranking Criteria:**
| Factor | Score |
| --- | --- |
| Correlates with recent human/AI code change | +3 |
| Error message or eBPF trace directly points to it | +3 |
| Affects the specific composable capability | +2 |
| Matches a known distributed/agentic bug pattern | +2 |
| Occurs in similar multi-tenant pods | +1 |

Generate 2-5 hypotheses, ranked by probability. 

--------------------------------------------------------------------------------

#### Phase 3 — Investigation & Evidence Gathering
**Goal:** Systematically test each hypothesis until root cause is confirmed via deterministic ReAct loops.

**Investigation techniques:**
1.  **Code & Architecture Reading**
    *   Use `view_file_outline` followed by targeted `Read`.
    *   Trace backward through the call chain across microservice boundaries.
2.  **Log & Telemetry Analysis**
    *   Query structured logs and eBPF network flows.
    *   Correlate `X-Request-ID` or `trace_id` across services.
    *   Look for the FIRST error in the cascade, not the final timeout.
3.  **Binary Search (Bisection)**
    *   For regressions: use `git bisect` to isolate the breaking commit.
4.  **State & Tenant Inspection**
    *   Check database for missing `tenant_id` scopes.
    *   Check cache states (Redis) for cross-tenant pollution.
    *   Check AI prompt registries or LLM gateway latency.

**Structured Investigation Output (ReAct Pattern):**
At each step, output a structured reasoning record to maintain state and prevent loop exhaustion:
*   `evaluation_previous_step`: **Success**, **Failed**, or **Inconclusive**.
*   `memory`: Track checked files, queried logs, and remaining hypotheses.
*   `next_goal`: One clear sentence describing the immediate next action.
*   `action`: The specific MCP tool or read command to execute.

--------------------------------------------------------------------------------

#### Phase 4 — Fix Implementation
**Goal:** Implement the minimal, correct fix with DevSecOps-compliant regression tests.

**Rules:**
1.  **Fix the root cause, not the symptom** — If an LLM hallucinates a tool call, fix the prompt registry/wrapper, don't just add a null check in the backend.
2.  **Maintain Tenant Isolation** — EVERY data access query MUST include `tenant_id` binding. Never infer tenancy; require explicit context.
3.  **Minimal change** — Touch as few files as possible. Preserve architectural boundaries (PBCs).
4.  **Add continuous quality regression test** — Write a test that:
    *   Fails before the fix is applied.
    *   Passes after the fix is applied.
    *   Is robust against dynamic UI changes or asynchronous execution (avoid brittle timeouts).

**Fix Categories:**
| Type | Approach |
| --- | --- |
| **Logic bug** | Fix condition. Add boundary test. |
| **Multi-Tenant Leak** | Add `tenant_id` explicitly to repository queries and auth middleware. |
| **Race Condition** | Add distributed locking, idempotency keys, or event-driven queues. |
| **Agent/LLM Failure** | Enforce strict structured output (Pydantic), adjust system prompts, or implement fallback gracefully. |
| **Dependency/Infra** | Fix IaC drift. Implement circuit breaker with exponential backoff. |
| **Security/eBPF Block** | Fix least-privilege container permissions or network policy (Cilium). |

--------------------------------------------------------------------------------

#### Phase 5 — Verification & Regression
**Goal:** Confirm the fix resolves the bug, respects tenant boundaries, and maintains system integrity.

**Verification checklist:**
1.  **Reproduction test passes** — New regression test goes green.
2.  **Existing suites pass** — Run full unit/integration suite for the affected PBC.
3.  **Security & Tenancy validation** — Confirm the fix does not bypass Zero-Trust controls or expose data to adjacent tenants.
4.  **Performance & FinOps check** — Ensure the fix does not introduce N+1 queries, runaway LLM token loops, or memory leaks.

**If the fix introduces new test failures:**
*   The fix is wrong or incomplete → Revert and go back to Phase 4.
*   Do NOT attempt to "hack" the failing test to make it pass unless the test itself is provably outdated.

--------------------------------------------------------------------------------

#### Output Structure

**Workspace Output:** 
Write investigation plans and progress to `.forgewright/debugger/investigation-log.md`.

**Project Root Output:**
Apply code fixes, update tests, and document incident post-mortems (if operating in Thorough/Meticulous mode) directly in the relevant project directories.

--------------------------------------------------------------------------------

#### Bug Pattern Reference (2026 Enterprise Context)

| Symptom | Common Causes | First Check |
| --- | --- | --- |
| Data from Company A visible to Company B | Missing `tenant_id` in repository, leaked token scope | Check auth middleware and DB query filters for hard tenant boundaries. |
| Runaway Cloud/LLM Token Costs | Agent infinite loop, missing stopping condition, unchecked retry | Check agent ReAct loop constraints, max_steps, and API rate limits. |
| `ECONNREFUSED` / `ETIMEDOUT` | Service mesh failure, eBPF network policy block, expired TLS | Check distributed traces, Cilium network policies, target service health. |
| Intermittent AI Agent Failures | LLM hallucinating tool arguments, context window overflow | Check structured output schemas (Pydantic), examine input token length in logs. |
| Works locally, fails in prod | Missing IaC configuration, drift, hardcoded regional assumptions | Compare `.env`, check Terraform/Crossplane state, check IAM permissions. |
| 500 Internal Server Error (silent) | Unhandled promise rejection, crash in sidecar/agent | Check OpenTelemetry logs for the specific `X-Request-ID`. |
| Performance degradation after deploy | N+1 query, missing index, sync processing of async task | Profile the hot path, check DB query plans, offload to message queue (Kafka/SQS). |
