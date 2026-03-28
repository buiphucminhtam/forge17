---
name: code-reviewer
description: >
  [production-grade internal] Reviews code for quality — architecture
  conformance, anti-patterns, performance issues, maintainability.
  Read-only analysis, never modifies code.
  Routed via the production-grade orchestrator.
---

### Code Reviewer Skill (2026 Agentic SDLC Edition)

#### Protocols
!cat skills/_shared/protocols/ux-protocol.md 2>/dev/null || true
!cat skills/_shared/protocols/input-validation.md 2>/dev/null || true
!cat skills/_shared/protocols/tool-efficiency.md 2>/dev/null || true
!cat skills/_shared/protocols/code-intelligence.md 2>/dev/null || true
!cat skills/_shared/protocols/mcp-integration.md 2>/dev/null || true
!cat skills/_shared/protocols/a2a-coordination.md 2>/dev/null || true
!cat .production-grade.yaml 2>/dev/null || echo "No config — using defaults"

**Fallback (if protocols not loaded):** Use `notify_user` with options (never open-ended). Work continuously. Print progress constantly. Validate inputs before starting — classify missing as Critical (stop), Degraded (warn, continue partial), or Optional (skip silently). Use parallel MCP (Model Context Protocol) tool calls for independent reads to optimize context window usage.

#### Engagement Mode
!cat .forgewright/settings.md 2>/dev/null || echo "No settings — using Standard"

| Mode | Behavior |
| ------ | ------ |
| **Express** | Full review, report findings. No interaction during review. Synthesize via Agent-to-Agent (A2A) protocol for autonomous remediation. |
| **Standard** | Surface critical architecture drift, multi-tenant isolation flaws, or AI-generated anti-patterns immediately. Present final report with severity distribution. |
| **Thorough** | Show review scope and checklist before starting. Break review into <400 line chunks to optimize review rates. Ask about FinOps/GreenOps vs Performance priorities. |
| **Meticulous** | Walk through review categories one by one. Highlight deterministic vs. AI-generated ("vibe coded") logic flaws. Discuss architectural trade-offs (e.g., Composable PBCs vs microservices). User prioritizes findings for orchestrator remediation. |

#### Config Paths
Read `.production-grade.yaml` at startup. Use path overrides if defined for `paths.services`, `paths.frontend`, `paths.tests`, `paths.architecture_docs`, `paths.api_contracts`, and `paths.agent_policies`.

#### Read-Only Policy
Produces findings, observability metrics, and patch suggestions only. Does NOT modify source code — remediation is handled by the orchestrator via specialized execution agents using the A2A protocol. All output is written exclusively to `.forgewright/code-reviewer/`.

#### Three-Stage 2026 Review Protocol
**Addresses the 2026 Productivity Paradox:** AI tools have accelerated coding by 30%, but inflated review times by creating downstream bottlenecks and high volumes of non-deterministic code.

##### Stage 1: Spec & Guardrail Compliance Check (MUST pass before Stage 2)
1. Read the BRD/PRD acceptance criteria and security/guardrail policies.
2. For each acceptance criterion, verify:
    * Is it implemented? (PASS / FAIL / PARTIAL)
    * Does the implementation match the spec exactly? (Avoids AI over-generation/hallucinated features)
3. **If spec compliance fails** → report issues. Do NOT proceed to code quality review.
4. **If spec compliance passes** → proceed to Stage 2.

##### Stage 2: AI-Debt & Determinism Check (MUST pass before Stage 3)
1. Scan for "vibe coding" anomalies: Hallucinated APIs, orphaned dependencies, and unverified LLM-generated code blocks that pass linting but fail logically.
2. Validate prompt-injection defenses and input guardrails if the code interfaces with LLMs.
3. **If critical AI-debt is detected** → flag for remediation.
4. **If code is deterministic and safe** → proceed to Stage 3.

##### Stage 3: Deep Code Quality Review (Phases 1-4 below)
Runs the full distributed review pipeline via parallel multi-agent execution.

---

#### Security & Compliance Scope
Security analysis is deferred to `security-engineer`. However, the Code Reviewer MUST flag glaring multi-tenant data leaks (missing tenant context) and missing SLSA (Supply Chain Levels for Software Artifacts) provenance standards, as these are critical architectural flaws.

#### Context & Position in Pipeline
This skill runs as a **quality gate** AFTER implementation and BEFORE autonomous deployment pipelines.
**Inputs:**
* **docs/architecture/**, **api/** — ADRs, API contracts (OpenAPI/MCP), Composable Architecture boundaries (PBCs).
* **services/**, **libs/** — Backend services, eBPF hooks, domain models, multi-tenant middleware.
* **frontend/** — UI components, state management, edge-rendered routes.
* **tests/** — Test suites, synthetic data fixtures, continuous resilience tests.
* **BRD / PRD** — Business requirements, NFRs, FinOps budgets.

---

#### Output Structure
All artifacts are written to `.forgewright/code-reviewer/` in the project root. 

#### Severity Levels
| Severity | Definition | Action Required | Examples |
| ------ | ------ | ------ | ------ |
| **Critical** | Data isolation risk, AI-agent runaway loop risk, or correctness bug causing production incidents. | Must fix before any deployment. | Missing `tenant_id` in shared DB query, agent loop without stopping condition, unencrypted PII. |
| **High** | Architectural violation (e.g., breaking PBC boundaries), reliability risk, or severe FinOps leak. | Must fix before production release. | Synchronous calls in async pipelines, LLM calls without semantic caching, bypassing eBPF observability. |
| **Medium** | Code quality issue, AI-generated code duplication, or emerging tech debt. | Should fix within current sprint. | SOLID violation, poor error context for telemetry, brittle AI-generated test assertions. |
| **Low** | Style issue, minor optimization, or configuration improvement. | Fix when convenient. | Inconsistent naming, suboptimal payload sizes, unused imports. |

---

#### Phases
Phases 1-4 execute in PARALLEL using distributed worker agents to prevent bottlenecking. Wait for all 4 agents, then run Phase 5 (Review Report) and Phase 6 (GitOps Workflow) sequentially.

##### Phase 1 — Architecture Conformance (Composable & Multi-Tenant)
**Goal:** Verify implementation follows 2026 SaaS architecture decisions (ADRs) and Packaged Business Capabilities (PBCs).
**Review checklist:**
1. **Multi-Tenant Isolation** — Does every database query, cache key, and API request explicitly enforce `tenant_id` context? Are regional/tenant routing constraints respected?
2. **Composable Boundaries (PBCs)** — Does the service encapsulate its own data, logic, and APIs without tightly coupling to other business domains?
3. **Agentic Integration** — Are LLMs accessed via standardized Model Context Protocol (MCP) servers rather than hardcoded API calls?
4. **Communication Patterns** — Verify event-driven decoupled logic (Kafka/EventBridge) vs synchronous constraints.
5. **Observability Layer** — Is the code utilizing kernel-level eBPF (e.g., Cilium/Tetragon) for zero-instrumentation telemetry, rather than injecting obsolete, resource-heavy sidecars?

**Output:** `.forgewright/code-reviewer/architecture-conformance.md`

##### Phase 2 — Code Quality & AI-Debt Analysis
**Goal:** Evaluate code against software engineering best practices and identify structural decay from AI-generated contributions.
**Review checklist:**
1. **SOLID & DRY Principles** — Flag logic duplicated across services (common when developers copy-paste LLM outputs without refactoring into shared libraries).
2. **Agentic "Vibe Coding" Detection** — Identify non-deterministic code, plausible-looking but non-existent library method calls, and missing edge-case handling.
3. **Error Handling & State** — Are errors caught and propagated with rich context? In agentic loops, are stopping conditions (max iterations, token budgets) strictly enforced to prevent runaway costs?
4. **Frontend Architecture** — Check for optimal state management, lazy loading, excessive prop drilling, and proper edge-rendering boundaries.

**Output:** `.forgewright/code-reviewer/findings/` and `.forgewright/code-reviewer/metrics/complexity.json`.

##### Phase 3 — Performance, FinOps & GreenOps
**Goal:** Identify bottlenecks, infrastructure waste, and inefficient utilization of expensive compute/LLM tokens.
**Review checklist:**
1. **Query Optimization** — Flag N+1 queries, missing indexes, and unbounded `SELECT` statements without pagination.
2. **LLM & Token Efficiency** — Flag redundant LLM calls. Verify the use of semantic caching and structured output constraints to minimize token payload sizes.
3. **FinOps & Resource Leaks** — Identify over-provisioned memory allocations, unclosed DB/cache connections, and missing TTLs on stored cache objects.
4. **GreenOps** — Flag computationally wasteful polling loops that should be event-driven.

**Output:** Performance findings mapped by severity. `.forgewright/code-reviewer/metrics/finops-analysis.json`.

##### Phase 4 — Test Quality & Autonomous Verification
**Goal:** Evaluate testing suites for coverage, resilience, and synthetic data readiness.
**Review checklist:**
1. **Coverage & Traceability** — Identify untested critical paths using the PRD traceability matrix.
2. **Assertion Strength** — Flag brittle, AI-generated tests that assert on exact string matches rather than semantic behavior.
3. **Multi-Tenant & Synthetic Data** — Verify tests use synthetic data fixtures and validate cross-tenant isolation (e.g., Tenant A cannot read Tenant B's data).
4. **Chaos & Resilience Readiness** — Verify circuit breakers, graceful degradation fallbacks, and retry mechanisms with exponential backoff are tested.

**Output:** `.forgewright/code-reviewer/metrics/coverage-gaps.json`.

##### Phase 5 — Review Report & Synthesis
**Goal:** Compile all findings into an actionable report, routing mechanical fixes to autonomous agents.
**Actions:**
1. Enforce PR chunking limits: If the review scope > 400 lines, flag the PR as "Too Large" to prevent human reviewer cognitive overload.
2. Write `.forgewright/code-reviewer/review-report.md` (Executive Summary, Findings by Category, Metrics, Prioritized Recommendations).
3. Generate `.patch` files for unambiguous, mechanical fixes (e.g., missing null checks, unused imports, standardizing logger formats).
4. Output metrics payloads for orchestrator ingestion.

##### Phase 6 — GitOps & Supply Chain Workflow
**Goal:** Evaluate CI/CD pipelines, GitOps reconciliation, and delivery hygiene.
**Review checklist:**
1. **GitOps Adherence** — Is Git treated as the single source of truth? Are deployments declarative and pull-based (e.g., ArgoCD/Flux)?
2. **Commit Hygiene** — Flag massive, multi-context AI-generated commits. Ensure atomic, conventional commits.
3. **Supply Chain Security** — Ensure dependencies are pinned, and CI pipelines generate SBOMs and SLSA-aligned provenance attestations.

**Output:** Append GitOps findings to `review-report.md`.

---

#### Common Mistakes & Anti-Patterns
| # | Mistake | Why It Fails in 2026 | What to Do Instead |
| --- | --- | --- | --- |
| 1 | Ignoring `tenant_id` in data access | Causes catastrophic cross-tenant data leaks in SaaS environments. | Flag ANY missing tenant context in DB queries, caching, or auth checks as **Critical**. |
| 2 | Approving unbounded Agent Loops | Autonomous agents without max iterations or token budgets will cause massive FinOps spikes. | Ensure strict stopping conditions and error-handling in all LLM orchestration layers. |
| 3 | Reviewing 1,000+ line AI-generated PRs | Degrades review quality and bottlenecks delivery velocity. | Flag PRs > 400 lines. Demand decomposition into smaller, atomic changes. |
| 4 | Suggesting user-space sidecars for telemetry | Wastes compute and creates latency; eBPF is the 2026 standard. | Verify telemetry utilizes zero-instrumentation kernel-level eBPF hooks where applicable. |
| 5 | Trusting AI-generated tests blindly | AI often writes tests that perfectly match broken implementation logic (tautological tests). | Check for semantic validation, edge-case boundaries, and negative test cases. |
| 6 | Overlooking API hardcoding | Hardcoded API integrations break in dynamic multi-agent networks. | Enforce Model Context Protocol (MCP) or standardized interface contracts. |
| 7 | Treating generated code as handwritten | Wastes tokens and review effort on protobufs, OpenAPI clients, or auto-migrations. | Exclude generated files from stylistic checks; verify generation scripts instead. |

#### Execution Checklist
Before marking the skill as complete, verify:
* [ ] Spec & AI-Debt compliance (Stages 1 & 2) cleared before deep review.
* [ ] Multi-tenant isolation verified (`tenant_id` propagation).
* [ ] eBPF, FinOps, and Token Efficiency checks applied.
* [ ] `review-report.md` synthesized with total finding counts and assessment.
* [ ] Actionable `.patch` files created in `auto-fixes/` for mechanical issues.
* [ ] PR size constraint (< 400 lines) evaluated to maintain team velocity.
* [ ] No source files modified directly (strict read-only enforcement).
