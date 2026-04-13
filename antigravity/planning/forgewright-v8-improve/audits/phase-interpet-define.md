# Phase Audit: INTERPRET + DEFINE

**Task:** 1.1
**Priority:** P0
**Estimate:** 4 hours
**Status:** In Progress

---

## 1. INTERPRET Phase Audit

### 1.1 Step 0 — Request Interpretation

**Source:** `skills/production-grade/SKILL.md` lines 100-161

#### Current Flow

1. Extract 9 dimensions (Task, Target tool, Output format, Constraints, Input, Context, Audience, Success criteria, Examples)
2. Scan for vague patterns (credit-killing patterns)
3. Clarification Rules (MAX 3 questions, HIGH/MEDIUM/LOW confidence)
4. Generate Structured Request with `INTERPRETED REQUEST` block

#### Findings

| # | Finding | Severity | Evidence | Recommendation |
|---|---------|----------|----------|----------------|
| I-01 | **MAX 3 questions enforcement weak** — No programmatic enforcement, relies on AI compliance | P1 | Line 128: "MAX 3 clarifying questions" — advisory only | Add middleware check to count clarification questions, warn if >3 |
| I-02 | **Confidence scoring is subjective** — No deterministic way to verify HIGH/MEDIUM/LOW | P2 | Line 129-131: "If HIGH confidence: Skip clarification" | Define explicit criteria for confidence levels |
| I-03 | **No token budget check for interpretation** — Could be expensive for complex requests | P2 | Step 0 has no budget consideration | Add early exit for simple requests |
| I-04 | **Credit-killing patterns detection inconsistent** — Table exists but not enforced | P1 | Lines 117-125: Pattern list exists in CLAUDE.md but not in SKILL.md | Ensure patterns are consistently documented across files |

### 1.2 Mode Classification

**Source:** `skills/production-grade/SKILL.md` lines 181-204

#### Current Flow

23 modes with trigger signals and skills involved.

#### Findings

| # | Finding | Severity | Evidence | Recommendation |
|---|---------|----------|----------|----------------|
| M-01 | **Mode count inconsistency** — CLAUDE.md says "22 modes", AGENTS.md says "22 modes", README says "22 modes", but list shows 23 entries | P0 | CLAUDE.md line 5: "23 modes", AGENTS.md line 5: "22 modes", README badge: "modes-22" | Standardize to 23 modes across all docs |
| M-02 | **Custom Mode lacks clear trigger** — "Doesn't fit above patterns" is vague | P1 | Line 204 | Add more specific fallback criteria |
| M-03 | **Mode overlap possible** — "harden" vs "review" vs "audit" overlap | P1 | Lines 185-186, 191-192 | Clarify priority order when multiple modes match |
| M-04 | **Mode → Skills mapping not validated** — No programmatic check that skills exist for each mode | P2 | Skills mapping is inline text only | Add skill registry validation |

### 1.3 Plan Presentation

**Source:** `skills/production-grade/SKILL.md` lines 206-240

#### Findings

| # | Finding | Severity | Evidence | Recommendation |
|---|---------|----------|----------|----------------|
| P-01 | **Single-skill modes skip plan presentation** — May miss important context | P2 | Line 208: "Skip plan presentation" | Consider brief scope confirmation for all modes |
| P-02 | **"I want the full production-grade pipeline" option** — Can override any mode to full pipeline | P1 | Line 220 | Good flexibility, but should warn about time/cost |
| P-03 | **Large Feature Mode antigravity check** — "3+ components" is subjective | P1 | Line 225 | Define explicit component count heuristic |

---

## 2. DEFINE Phase Audit

**Source:** `skills/production-grade/phases/define.md`

### 2.1 T0.5 Business Analyst

#### Current Flow

1. Activation based on greenfield/brownfield/BA package existence
2. BA skill reads polymath context, codebase context
3. Outputs: stakeholder-analysis, requirements-register, feasibility-assessment, ba-package

#### Findings

| # | Finding | Severity | Evidence | Recommendation |
|---|---------|----------|----------|----------------|
| BA-01 | **BA activation logic complex** — 3 conditions (greenfield, brownfield, escape hatch) with different rules | P1 | Lines 16-21: Complex conditional logic | Simplify with clear decision tree |
| BA-02 | **BA package dependency** — T1 PM depends on BA package, circular dependency risk | P1 | Line 55: "if `.forgewright/business-analyst/handoff/ba-package.md` exists" | Ensure BA always runs before PM in full builds |
| BA-03 | **No BA skip criteria** — "may skip only when orchestrator logged" is vague | P2 | Line 19 | Add explicit skip criteria list |

### 2.2 T1 Product Manager

#### Current Flow

1. Check for BA package (reduce interview if exists)
2. Research domain via search_web
3. CEO interview (depth varies)
4. Write BRD to `.forgewright/product-manager/BRD/`

#### Findings

| # | Finding | Severity | Evidence | Recommendation |
|---|---------|----------|----------|----------------|
| PM-01 | **CEO interview requirement** — Requires user interaction, may block automation | P1 | Line 47: "needs user interaction for CEO interview" | Document automation fallback |
| PM-02 | **BRD location not configurable** — Hard-coded path | P2 | Line 58: `.forgewright/product-manager/BRD/` | Make configurable via `.production-grade.yaml` |
| PM-03 | **Research skip condition** — "skip if BA or Polymath already researched" | P2 | Line 56 | Good efficiency, ensure context transfer works |

### 2.3 Gate 1 — BRD Approval

#### Current Flow

Present Gate 1, on approval unblock T1.5 or T2. Memory save on approval.

#### Findings

| # | Finding | Severity | Evidence | Recommendation |
|---|---------|----------|----------|----------------|
| G1-01 | **Gate options limited** — Only "I have changes" and "Show BRD details" | P2 | Lines 75-76 | Consider adding "Approve with notes" option |
| G1-02 | **Memory save format** — Uses CLI command, not programmatic | P2 | Line 72-73 | Consider direct memory integration |

### 2.4 T1.5 UI Designer

#### Current Flow

Conditional on `features.ui_design` or BRD containing UI requirements. Skip for backend-only.

#### Findings

| # | Finding | Severity | Evidence | Recommendation |
|---|---------|----------|----------|----------------|
| UI-01 | **Design tokens path** — `docs/design/design-tokens.json` hard-coded | P2 | Line 90 | Make configurable |
| UI-02 | **UI requirements detection** — "BRD contains UI/frontend requirements" is heuristic | P1 | Line 80 | Define explicit BRD UI requirement markers |

### 2.5 T2 Solution Architect

#### Current Flow

1. Read BRD and design specs
2. Design architecture: ADRs, tech stack, system design
3. Design API contracts (OpenAPI 3.1), data model (ERD), migrations
4. Generate project scaffold
5. Write to project root and workspace

#### Findings

| # | Finding | Severity | Evidence | Recommendation |
|---|---------|----------|----------|----------------|
| SA-01 | **API contracts location** — Default `api/openapi/*.yaml` should be in `.production-grade.yaml` | P2 | define.md line 9 | Already configurable ✅ |
| SA-02 | **ADR location** — Default `docs/architecture/architecture-decision-records/` | P2 | define.md line 10 | Already configurable ✅ |
| SA-03 | **Scaffold generation** — No validation that scaffold follows project conventions | P1 | Line 109-111 | Add convention check after scaffold |

### 2.6 Gate 2 — Architecture Approval

#### Current Flow

Present Gate 2, on approval proceed to BUILD phase.

#### Findings

| # | Finding | Severity | Evidence | Recommendation |
|---|---------|----------|----------|----------------|
| G2-01 | **Gate 2 options same as Gate 1** — Limited options | P2 | ship.md line 121 | Consider project-specific approval criteria |

### 2.7 Handoff to BUILD

#### Current Flow

After Gate 2: verify outputs, log decisions, read BUILD phase.

#### Findings

| # | Finding | Severity | Evidence | Recommendation |
|---|---------|----------|----------|----------------|
| H-01 | **Output verification** — Checks existence but not completeness | P1 | Line 126-128 | Add completeness checklist for architecture outputs |
| H-02 | **Decisions log** — `.forgewright/decisions-log.md` but no standard format | P2 | Line 128 | Add decisions log template |
| H-03 | **No validation that T1.5 ran if needed** — Could skip UI design accidentally | P1 | Line 127 | Add conditional check for UI design requirement |

---

## 3. Cross-Reference Consistency

### 3.1 Version Inconsistencies

| File | Version Claim | Actual |
|------|-------------|--------|
| README.md | v7.9.0 | 7.9.0 |
| CLAUDE.md | v7.8.0? | Not clear |
| AGENTS.md | v7.8.1 (from VERSION file) | 7.8.1 |
| project-profile.json | 7.7.0 | 7.7.0 |

**Finding:** Multiple version claims, need single source of truth.

### 3.2 Mode Count

| File | Mode Count | Listed |
|------|-----------|--------|
| CLAUDE.md | 23 | ✅ |
| AGENTS.md | 22 (listed as 22) | ❌ |
| README.md | 22 (badge) | ❌ |
| SKILL.md | 23 | ✅ |

**Finding:** 2 files claim 22 modes, 2 claim 23 modes. Need standardization.

### 3.3 Skill Count

| File | Skill Count |
|------|-------------|
| README.md | 55 |
| CLAUDE.md | 55 |
| AGENTS.md | 55 |

**Finding:** ✅ Consistent at 55 skills.

### 3.4 Protocol Count

| File | Protocol Count |
|------|----------------|
| README.md | 15 |
| CLAUDE.md | Not stated |
| AGENTS.md | 27 |

**Finding:** Inconsistent protocol count (15 vs 27).

---

## 4. Flow Consistency Issues

### 4.1 INTERPRET → DEFINE Handoff

| Issue | Description |
|-------|-------------|
| **Gap:** Step 0 generates `INTERPRETED REQUEST` but no validation it's used | Check if T0.5 reads interpreted request |
| **Gap:** Mode classification output format not standardized | Should be machine-readable |
| **Gap:** No validation that Step 0 ran before mode selection | Could skip interpretation |

### 4.2 DEFINE Gate Enforcement

| Issue | Description |
|-------|-------------|
| **Weak:** Gate approval is user-dependent | No automated validation |
| **Gap:** No timeout for gate waiting | Could stall indefinitely |
| **Missing:** Gate history for audit | Can't track approval/rejection patterns |

---

## 5. Token Efficiency

### 5.1 INTERPRET Phase

| Issue | Impact | Recommendation |
|-------|--------|----------------|
| 9 dimensions extraction loads context | Medium | Lazy load context dimensions |
| Credit-killing pattern table | Low | Inline small patterns only |
| Structured request generation | Low | Template-based, efficient |

### 5.2 DEFINE Phase

| Issue | Impact | Recommendation |
|-------|--------|----------------|
| BA reads polymath + codebase context | High | Cache context between phases |
| PM research via search_web | High | Parallelize with other work |
| Architect reads multiple outputs | High | Streamlined handoff format |

---

## 6. Summary

### Findings by Severity

| Severity | Count | Items |
|----------|-------|-------|
| P0 | 1 | Mode count inconsistency across docs |
| P1 | 11 | Various flow and enforcement gaps |
| P2 | 15 | Configuration and efficiency improvements |
| **Total** | **27** | |

### Priority P0 Items

1. **M-01:** Standardize mode count to 23 across all documentation

### Priority P1 Items

1. **I-01:** Add programmatic enforcement for MAX 3 questions
2. **I-04:** Ensure credit-killing patterns consistency
3. **M-03:** Clarify mode overlap priority
4. **BA-01:** Simplify BA activation logic
5. **BA-02:** Ensure BA runs before PM in full builds
6. **PM-01:** Document automation fallback for CEO interview
7. **UI-02:** Define explicit UI requirement markers
8. **SA-03:** Add convention check after scaffold
9. **H-01:** Add completeness checklist for architecture outputs
10. **H-03:** Add conditional check for UI design requirement
11. **Version inconsistency:** Standardize version across docs

### Priority P2 Items

1. **I-02:** Define explicit confidence scoring criteria
2. **I-03:** Add token budget check for interpretation
3. **M-02:** Add specific Custom Mode fallback criteria
4. **M-04:** Add skill registry validation
5. **P-01:** Consider brief scope confirmation for all modes
6. **P-02:** Add warning for full pipeline option
7. **P-03:** Define explicit component count heuristic
8. **BA-03:** Add explicit BA skip criteria
9. **PM-02:** Make BRD location configurable
10. **PM-03:** Verify context transfer works
11. **G1-01:** Consider "Approve with notes" option
12. **G1-02:** Consider direct memory integration
13. **UI-01:** Make design tokens path configurable
14. **G2-01:** Consider project-specific approval criteria
15. **H-02:** Add decisions log template

---

## 7. Recommendations Summary

### Immediate (v8.0)

1. Fix mode count inconsistency (22 vs 23) — **P0**
2. Simplify BA activation logic with decision tree — **P1**
3. Add completeness checklist for DEFINE outputs — **P1**
4. Standardize version across all documentation — **P1**
5. Ensure credit-killing patterns consistency — **P1**
6. Clarify mode overlap priority — **P1**

### Short-term (v8.x)

7. Add programmatic MAX 3 questions enforcement — **P1**
8. Define explicit UI requirement markers — **P1**
9. Add convention check after scaffold — **P1**
10. Add conditional UI design requirement check — **P1**

### Medium-term (Future)

11. Define explicit confidence scoring criteria — **P2**
12. Add token budget check for interpretation — **P2**
13. Add skill registry validation — **P2**
14. Define explicit component count heuristic — **P2**
15. Add explicit BA skip criteria — **P2**
16. Make BRD location configurable — **P2**
17. Consider direct memory integration — **P2**
18. Add decisions log template — **P2**

---

## 8. Backward Compatibility Assessment

| Change | Breaking? | Migration Path |
|--------|-----------|----------------|
| Fix mode count docs | No | Update README.md, AGENTS.md |
| Simplify BA activation | No | Logic only, no API change |
| Add completeness checklist | No | New validation, existing passes |
| Version standardization | No | Documentation only |
| Mode overlap clarification | No | Priority documentation |

**Conclusion:** All v8.0 changes are backward compatible.
