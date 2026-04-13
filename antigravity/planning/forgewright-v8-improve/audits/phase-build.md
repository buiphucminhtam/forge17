# Phase Audit: BUILD

**Task:** 1.2
**Priority:** P0
**Estimate:** 4 hours
**Status:** In Progress

---

## 1. BUILD Phase Overview

**Source:** `skills/production-grade/phases/build.md`

### 1.1 Execution Modes

**Current Flow:**
- **Parallel Mode:** Group A (T3a, T3b, T3c) run simultaneously via git worktrees
- **Sequential Mode:** T3a → T3b → T3c → T4

### 1.2 Task Graph

```
DEFINE Phase
    ↓ Gate 2
┌──────────────────────────────────────────────────────┐
│                    BUILD Phase                        │
│                                                      │
│  ┌─────────────┐                                    │
│  │  T3a BE    │──┐                                 │
│  └─────────────┘  │                                 │
│  ┌─────────────┐  │                                 │
│  │  T3b FE    │──┤──┐                              │
│  └─────────────┘  │  │                              │
│  ┌─────────────┐  │  │                              │
│  │  T3c Mobile│──┘  │  (conditional)              │
│  └─────────────┘     │                              │
│                      │                              │
│  ┌─────────────────┐ │                              │
│  │ T4 DevOps      │◄─┘  (depends on T3a)           │
│  └─────────────────┘                               │
└──────────────────────────────────────────────────────┘
    ↓ Quality Gate
HARDEN Phase
```

---

## 2. Parallel Execution Audit

**Source:** `skills/parallel-dispatch/SKILL.md`

### 2.1 Dependency Analysis

| Finding | Severity | Evidence | Recommendation |
|---------|----------|----------|---------------|
| P-01: **Wave planning not deterministic** — "If total tasks ≤ MAX_WORKERS: single wave" is simple but may not optimize | P2 | parallel-dispatch line 68 | Add task complexity estimation for better wave planning |
| P-02: **Community detection for task boundaries** — "If Code Intelligence available, use community clusters" | P1 | parallel-dispatch line 69-71 | Document when this helps vs hurts |
| P-03: **MAX_WORKERS hardcoded** — Default 4, configurable via env var | P2 | parallel-dispatch line 17 | Make configurable in settings |
| P-04: **T4 dependency on T3a** — DevOps waits for backend, may bottleneck | P1 | build.md line 39: "T4 depends on T3a for service discovery" | Consider service discovery automation |
| P-05: **Git worktree isolation** — Good for preventing conflicts | P1 | parallel-dispatch overview | Document cleanup strategy for worktrees |

### 2.2 Contract Generation

| Finding | Severity | Evidence | Recommendation |
|---------|----------|----------|---------------|
| C-01: **Contract format not enforced** — Task Contract Protocol exists but no programmatic validation | P1 | task-contract.md | Add JSON Schema validation |
| C-02: **Worker autonomy** — Each worktree gets full context, potential for drift | P1 | parallel-dispatch line 52-54 | Add context drift detection |
| C-03: **No circuit breaker** — Failed workers continue until max retries | P0 | Missing | Add circuit breaker per AD-004 |
| C-04: **No bulkhead isolation** — Worker failure may affect main process | P0 | Missing | Add bulkhead per AD-005 |

### 2.3 Merge Process

| Finding | Severity | Evidence | Recommendation |
|---------|----------|----------|---------------|
| M-01: **Merge arbiter validation** — merge-arbiter protocol exists | P1 | build.md line 28 | Ensure merge-arbiter checks authority boundaries |
| M-02: **Conflict resolution** — May have merge conflicts from parallel work | P1 | merge-arbiter.md | Document conflict resolution strategy |
| M-03: **Artifact validation** — DELIVERY.json collected but format not enforced | P2 | parallel-dispatch line 25 | Add schema validation for DELIVERY.json |

---

## 3. Sequential Execution Audit

### 3.1 Task Dependencies

| Task | Depends On | Finding | Recommendation |
|------|-----------|---------|----------------|
| T3a Backend | Gate 2 | ✅ Correct | |
| T3b Frontend | None (parallel) / T3a (sequential) | ⚠️ Frontend depends on API contracts from T3a | Document API contract deadline |
| T3c Mobile | None (parallel) / T3a+T3b (sequential) | ⚠️ Same as T3b | Document dependency |
| T4 DevOps | T3a | ✅ Correct | Document service discovery requirement |

### 3.2 Task Ordering Issues

| Finding | Severity | Description |
|---------|----------|-------------|
| S-01 | P1 | **Frontend may start before API contracts finalized** — T3b could start before T3a defines contracts |
| S-02 | P2 | **No parallel opportunity in sequential mode** — T3b and T3c could start after T3a without waiting for each other |
| S-03 | P2 | **T4 DevOps blocked by full T3a** — Could start Docker work while backend completes |

---

## 4. Quality Gate Integration

### 4.1 Per-Task Quality Gates

**Source:** `build.md` lines 128-146

#### Current Flow

After EACH build task (T3a, T3b, T3c, T4):
1. Run Universal Quality Gate Protocol
2. Per-skill quality gate
3. Brownfield regression check
4. Change manifest update
5. Session lifecycle hook
6. Display mini-scorecard

#### Findings

| Finding | Severity | Evidence | Recommendation |
|---------|----------|----------|----------------|
| QG-01 | P1 | **Gate runs after task, not during** — Quality issues caught late | Consider mid-task checkpoints for long tasks |
| QG-02 | P2 | **Mini-scorecard format not standardized** — Ad-hoc display | Standardize scorecard format across phases |
| QG-03 | P1 | **Regression baseline** — `.forgewright/baseline-{session}.json` required for brownfield | Ensure baseline captured at session start |
| QG-04 | P2 | **Change manifest format** — `.forgewright/change-manifest-{session}.json` | Add schema validation |

### 4.2 Quality Score Enforcement

| Finding | Severity | Evidence | Recommendation |
|---------|----------|----------|---------------|
| QS-01 | P1 | **Score below threshold pauses, doesn't stop** — "pause, show scorecard, ask user" | Document when automatic escalation happens |
| QS-02 | P2 | **No quality trend tracking** — Can't see if quality is improving across sessions | Add historical quality metrics |
| QS-03 | P1 | **Quality Gate runs after skill** — Should run during skill (per protocol) | Align with quality-gate.md protocol |

---

## 5. Error Handling

### 5.1 Self-Healing Loop

**Source:** `build.md` lines 160-169

#### Current Flow

```
Self-healing loop (up to 5 attempts):
  1. Read error
  2. Web search (site filter)
  3. Analyze root cause
  4. Formulate fix
  5. Retry
  ↓ After 5 failures
Git rollback + escrow report
```

#### Findings

| Finding | Severity | Evidence | Recommendation |
|---------|----------|----------|---------------|
| EH-01 | P0 | **Missing circuit breaker** — 5 retries without circuit breaker can cause cascading failures | Add circuit breaker per AD-004 |
| EH-02 | P1 | **Web search scope** — "site filter" not specified | Document expected search scope |
| EH-03 | P2 | **Escrow report format** — Not defined | Define escrow report template |
| EH-04 | P1 | **Rollback scope** — "Git rollback" ambiguous (last commit? last task?) | Define rollback granularity |
| EH-05 | P1 | **Self-healing applies to T3a only** — T3b/T3c failures just continue | Document partial pipeline handling |

### 5.2 Failure Modes

| Failure Mode | Current Handling | Gap |
|--------------|-----------------|-----|
| T3a fails | Retry 5x → rollback | ✅ Covered |
| T3b fails, T3a succeeds | Continue backend-only pipeline | ⚠️ Not documented |
| T3c fails, others succeed | Continue without mobile | ⚠️ Not documented |
| T4 fails | Escalate to user | ✅ Covered |
| Regression detected | Revert + retry | ✅ Covered |
| Quality below threshold | Pause + ask user | ⚠️ Not automated |

---

## 6. Brownfield Safety

### 6.1 Regression Prevention

| Finding | Severity | Evidence | Recommendation |
|---------|----------|----------|---------------|
| BS-01 | P1 | **Baseline captured per session** — `.forgewright/baseline-{session}.json` | Document baseline lifecycle |
| BS-02 | P1 | **Protected paths** — BrownfieldSafety middleware checks | Ensure protected paths configurable |
| BS-03 | P2 | **No incremental regression tracking** — Can't see what regressed in which file | Add per-file regression report |

### 6.2 Scope Enforcement

| Finding | Severity | Evidence | Recommendation |
|---------|----------|----------|---------------|
| SE-01 | P1 | **T3a scope: services/, libs/** — Clear but not enforced programmatically | Add scope validation |
| SE-02 | P1 | **T3b scope: frontend/** — Same | Add scope validation |
| SE-03 | P2 | **Scope violation detection** — Via git diff, not real-time | Consider real-time scope monitoring |

---

## 7. Performance Considerations

### 7.1 Token Efficiency

| Phase | Token Estimate | Finding |
|-------|---------------|---------|
| Pre-flight | Low | ✅ Good |
| Parallel setup | Medium | ⚠️ Context serialization overhead |
| Worker execution | High | ⚠️ Each worker loads full context |
| Merge | Medium | ⚠️ Multiple artifacts to process |
| Quality gate | Medium | ✅ Efficient |

### 7.2 Parallel Efficiency

| Finding | Severity | Recommendation |
|---------|----------|----------------|
| **Worktree creation overhead** — Creates new git worktrees for each parallel task | P2 | Document minimum viable parallelism |
| **Context duplication** — Each worktree gets full context | P1 | Consider context slicing per task |
| **Merge bottleneck** — Sequential merge of parallel outputs | P2 | Consider parallel merge validation |

---

## 8. Summary

### Findings by Severity

| Severity | Count | Items |
|----------|-------|-------|
| P0 | 2 | Missing circuit breaker, missing bulkhead isolation |
| P1 | 16 | Various flow and enforcement gaps |
| P2 | 12 | Configuration and efficiency improvements |
| **Total** | **30** | |

### Priority P0 Items

1. **EH-01:** Add circuit breaker to self-healing loop
2. **C-04:** Add bulkhead isolation for parallel workers

### Priority P1 Items

1. **P-02:** Document community detection usage
2. **P-04:** Document service discovery strategy
3. **P-05:** Document worktree cleanup strategy
4. **C-01:** Add JSON Schema validation for Task Contracts
5. **C-02:** Add context drift detection
6. **M-01:** Ensure merge-arbiter checks authority boundaries
7. **M-02:** Document conflict resolution strategy
8. **S-01:** Document API contract deadline for frontend
9. **QG-01:** Consider mid-task quality checkpoints
10. **QG-03:** Ensure baseline captured at session start
11. **QS-01:** Document automatic escalation criteria
12. **EH-02:** Document web search scope
13. **EH-04:** Define rollback granularity
14. **EH-05:** Document partial pipeline handling
15. **BS-01:** Document baseline lifecycle
16. **BS-02:** Ensure protected paths configurable

### Priority P2 Items

1. **P-01:** Add task complexity estimation for wave planning
2. **P-03:** Make MAX_WORKERS configurable
3. **M-03:** Add schema validation for DELIVERY.json
4. **S-02:** Consider optimized sequential ordering
5. **S-03:** Consider T4 parallel start option
6. **QG-02:** Standardize scorecard format
7. **QG-04:** Add schema validation for change manifest
8. **QS-02:** Add historical quality metrics
9. **QS-03:** Align quality gate timing with protocol
10. **EH-03:** Define escrow report template
11. **BS-03:** Add per-file regression report
12. **Context duplication:** Consider context slicing per task

---

## 9. Recommendations Summary

### Immediate (v8.0)

1. **EH-01:** Add circuit breaker to self-healing loop — max 3 retries, then escalate
2. **C-04:** Add bulkhead isolation — worker failure doesn't crash main process
3. **S-01:** Document API contract deadline — frontend waits for contracts
4. **EH-05:** Document partial pipeline handling — what happens when one task fails
5. **BS-02:** Ensure protected paths configurable via `.production-grade.yaml`

### Short-term (v8.x)

6. **C-01:** Add JSON Schema validation for Task Contracts
7. **P-05:** Document worktree cleanup strategy
8. **QG-03:** Ensure baseline captured at session start
9. **EH-04:** Define rollback granularity (commit-level vs task-level)
10. **BS-01:** Document baseline lifecycle (create, update, cleanup)

### Medium-term (Future)

11. **P-01:** Add task complexity estimation for wave planning
12. **S-02:** Optimize sequential task ordering
13. **QS-02:** Add historical quality metrics tracking
14. **Context duplication:** Implement context slicing per task

---

## 10. Backward Compatibility Assessment

| Change | Breaking? | Migration Path |
|--------|-----------|----------------|
| Add circuit breaker | No | New feature, existing loops unchanged |
| Add bulkhead isolation | No | New feature, existing behavior unchanged |
| Document API deadline | No | Documentation only |
| Document partial pipeline | No | Documentation only |
| Ensure protected paths config | No | Existing config preserved |

**Conclusion:** All v8.0 BUILD changes are backward compatible.
