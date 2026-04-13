# Architecture Decisions: Forgewright v8.0

## Decision Log

> Auto-generated during Forgewright v8.0 systematic flow review. Format: `[ID] | Status | Date | Title`

---

## AD-001 | Accepted | 2026-04-12 | Use NotebookLM for grounded research

**Context:**
Need to research 2026 best practices for multi-agent orchestration, Claude Code hooks, and code intelligence to inform improvement recommendations.

**Decision:**
Use NotebookLM MCP server to create a research notebook with sources from official documentation (Claude Code, MCP, LangGraph, Semantic Kernel).

**Alternatives considered:**
1. Manual web search only — less organized, no synthesis
2. Separate research tool — additional context switching
3. Skip research — less informed recommendations

**Rationale:**
NotebookLM provides grounded research with citations, which is essential for evidence-based recommendations.

**Consequences:**
- Research takes longer upfront
- Recommendations are better supported
- Can share notebook for collaboration

---

## AD-002 | Accepted | 2026-04-12 | Backward compatibility as hard constraint

**Context:**
Planning v8.0 improvements that should not break existing users' workflows.

**Decision:**
All v8.0 changes must maintain 100% backward compatibility. Breaking changes deferred to v9.0.

**Alternatives considered:**
1. Allow breaking changes with migration path — adds complexity
2. Major version bump — signals breaking changes
3. No constraint — risk user dissatisfaction

**Rationale:**
Forgewright is used in production by multiple teams. Breaking changes require careful migration planning.

**Consequences:**
- Some improvements may be deferred
- More incremental changes required
- Clear version strategy maintained

---

## AD-003 | Accepted | 2026-04-12 | Review before implementation

**Context:**
Need to understand current state before making improvements.

**Decision:**
Conduct systematic review of all components before implementing any changes.

**Alternatives considered:**
1. Implement improvements directly — faster but riskier
2. Ad-hoc review — less thorough
3. External audit — additional cost

**Rationale:**
Systematic review ensures comprehensive coverage and informed decision-making.

**Consequences:**
- More time upfront
- Better understanding of current state
- Recommendations are more actionable

---

## AD-004 | Proposed | 2026-04-12 | Add circuit breaker pattern to parallel-dispatch

**Context:**
Research shows 37% of multi-agent failures are coordination failures, 21% are verification gaps.

**Decision:**
Add circuit breaker pattern to parallel-dispatch skill to prevent cascading failures.

**Alternatives considered:**
1. Continue with retry loops only — insufficient for cascading failures
2. Full bulkhead isolation — overkill for current scale
3. No change — risk of cascading failures

**Rationale:**
Circuit breakers are a proven pattern for fault tolerance in distributed systems.

**Consequences:**
- More robust parallel execution
- Better failure isolation
- Additional configuration complexity

**Status:** Pending implementation after review complete

---

## AD-005 | Proposed | 2026-04-12 | Add bulkhead pattern for parallel workers

**Context:**
Parallel dispatch uses git worktrees for isolation, but no bulkhead pattern exists.

**Decision:**
Add bulkhead pattern to isolate worker failures from main execution.

**Alternatives considered:**
1. Current worktree isolation — basic but sufficient
2. Process-level isolation — too heavyweight
3. Container-level isolation — adds complexity

**Rationale:**
Bulkhead patterns prevent one worker's failure from affecting others.

**Consequences:**
- Better failure isolation
- More predictable parallel execution
- Additional monitoring complexity

**Status:** Pending implementation after review complete

---

## AD-006 | Proposed | 2026-04-12 | Implement cheap model routing for triage

**Context:**
Multi-agent best practices recommend using cheap models for routing/triage tasks.

**Decision:**
Implement lightweight model routing for request classification (use Claude Haiku or similar for mode detection).

**Alternatives considered:**
1. Always use best model — higher cost
2. User-specified model — inconsistent
3. Fixed model selection — not adaptive

**Rationale:**
Request classification is simple enough for cheaper models, saving tokens for actual skill work.

**Consequences:**
- Reduced token costs
- Faster classification
- Slight accuracy tradeoff

**Status:** Pending research on model selection

---

## AD-007 | Proposed | 2026-04-12 | Add structured verification for agent handoffs

**Context:**
Task Contracts exist but no structured verification of handoff completeness.

**Decision:**
Add JSON Schema validation for Task Contract compliance during merge.

**Alternatives considered:**
1. Manual verification — error-prone
2. LLM-based verification — expensive
3. No verification — risk of incomplete handoffs

**Rationale:**
Structured verification ensures handoff completeness without additional LLM cost.

**Consequences:**
- Catches incomplete handoffs early
- Better worker accountability
- Additional validation overhead

**Status:** Pending implementation after review complete

---

## AD-008 | Proposed | 2026-04-12 | Compare ForgeNexus with StakGraph

**Context:**
Research shows StakGraph as alternative code intelligence tool with Neo4j backing.

**Decision:**
Conduct feature comparison between ForgeNexus and StakGraph to identify gaps.

**Alternatives considered:**
1. Continue with ForgeNexus only — no comparison
2. Migrate to StakGraph — high switching cost
3. Support both — additional maintenance

**Rationale:**
Informed decision requires understanding alternatives.

**Consequences:**
- Better understanding of ForgeNexus position
- Potential feature gaps identified
- Clear comparison for users

**Status:** Pending implementation after review complete

---

## AD-009 | Proposed | 2026-04-12 | Expand lifecycle hooks beyond middleware chain

**Context:**
Claude Code hooks show event-driven patterns beyond request-response.

**Decision:**
Consider adding session-level and turn-level hooks for reactivity.

**Alternatives considered:**
1. Keep current middleware chain — simpler
2. Full event-driven architecture — too complex
3. Ad-hoc hooks — inconsistent

**Rationale:**
Event-driven patterns can improve reactivity and reduce polling.

**Consequences:**
- More responsive execution
- Additional complexity
- Requires careful design

**Status:** Under consideration

---

## AD-010 | Proposed | 2026-04-12 | Adopt Tree-sitter for broader language support

**Context:**
Code intelligence tools in 2026 favor Tree-sitter for AST parsing.

**Decision:**
Evaluate Tree-sitter adoption for ForgeNexus to expand language support beyond current 17 languages.

**Alternatives considered:**
1. Continue with current parser — sufficient for common languages
2. Multiple parser backends — complexity
3. Use existing tools (StakGraph) — dependency

**Rationale:**
Tree-sitter provides consistent AST across languages with good performance.

**Consequences:**
- Broader language support
- Better parsing consistency
- Migration effort required

**Status:** Pending evaluation after review complete
