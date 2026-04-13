# Phase Audit: HARDEN

**Task:** 1.3
**Priority:** P0
**Estimate:** 3 hours
**Status:** In Progress

---

## 1. HARDEN Phase Overview

**Source:** `skills/production-grade/phases/harden.md`

### 1.1 Task Graph

```
BUILD Phase
    ↓ Quality Gate
┌──────────────────────────────────────────────────────┐
│                   HARDEN Phase                         │
│                                                       │
│  ┌─────────────┐                                     │
│  │  T5 QA     │                                     │
│  └─────────────┘                                     │
│       │                                               │
│  ┌─────────────────────┐                              │
│  │ T6a Security (SOLE) │ ← OWASP authority           │
│  └─────────────────────┘                              │
│       │                                               │
│  ┌─────────────────────┐                              │
│  │ T6b Code Review    │ ← NO security, read-only  │
│  └─────────────────────┘                              │
│       │                                               │
│  ┌──────────────────────────────────────────────┐    │
│  │         Remediation Preparation               │    │
│  └──────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────┘
    ↓ Quality Gate
SHIP Phase
```

---

## 2. Authority Boundaries Audit

### 2.1 Security Authority (T6a)

**Source:** `harden.md` lines 6-11

#### Current Definition

- **security-engineer** is SOLE authority on OWASP Top 10, STRIDE, PII, encryption
- No other skill performs security review

#### Findings

| Finding | Severity | Evidence | Recommendation |
|---------|----------|----------|----------------|
| AB-01 | P1 | **"SOLE authority" not programmatically enforced** — Relies on skill self-restraint | Add middleware check to reject security findings from non-security skills |
| AB-02 | P1 | **No audit trail for authority violations** — If T6b tries to do security, no log | Add authority violation logging |
| AB-03 | P2 | **OWASP Top 10 is 2021 version** — Should be updated to 2023/2024 | Update to latest OWASP |
| AB-04 | P2 | **STRIDE mentioned but not defined** — Users may not know what STRIDE is | Add brief definition or link |
| AB-05 | P1 | **Parallel execution authority risk** — T6a and T6b run in parallel, could produce conflicting findings | Document how conflicts are resolved |

### 2.2 Code Review Authority (T6b)

**Source:** `harden.md` lines 81-99

#### Current Definition

- Architecture conformance and code quality ONLY
- DO NOT perform OWASP, STRIDE, or any security review
- Cross-reference: "See security-engineer findings for security context"
- READ-ONLY: produces findings only, does NOT modify source code

#### Findings

| Finding | Severity | Evidence | Recommendation |
|---------|----------|----------|----------------|
| AB-06 | P1 | **"READ-ONLY" not enforced** — Code Reviewer could modify code accidentally | Add pre-commit hook to block modifications from T6b |
| AB-07 | P2 | **No explicit list of what T6b CAN review** — Could overlap with T6a accidentally | Define explicit T6b review scope |
| AB-08 | P2 | **"Cross-reference" is vague** — How to reference security findings? | Add structured cross-reference format |

### 2.3 Conflict Resolution

| Finding | Severity | Evidence | Recommendation |
|---------|----------|----------|----------------|
| CR-01 | P1 | **conflict-resolution.md exists but not referenced in HARDEN** — Should reference it | Add reference in harden.md |
| CR-02 | P1 | **No automatic conflict detection** — Manual conflict resolution required | Consider automated conflict detection |

---

## 3. Parallel Execution Audit (Group B)

### 3.1 T5, T6a, T6b Parallel

**Current:** T5 runs first, then T6a and T6b in parallel.

**Issue:** T5 (QA) runs sequentially before parallel Group B. This creates a sequential bottleneck.

#### Findings

| Finding | Severity | Evidence | Recommendation |
|---------|----------|----------|----------------|
| PE-01 | P1 | **T5 sequential before parallel** — QA could also run in parallel with T6a/T6b | Consider T5 + T6a + T6b all parallel |
| PE-02 | P2 | **Parallel contract constraints** — T6a contract includes "SOLE OWASP authority", T6b contract includes "NO security review" | Good! Document this pattern |
| PE-03 | P1 | **Authority boundaries apply in parallel mode** — Contract explicitly restricts scope | ✅ Already documented |
| PE-04 | P2 | **Worker outputs go to workspace only** — T6a and T6b findings in separate folders | Good isolation |

---

## 4. QA Testing Audit (T5)

### 4.1 QA Responsibilities

**Source:** `harden.md` lines 44-60

#### Current Flow

1. Read implementation code
2. Write tests to project root: tests/
3. Run integration, e2e, and performance tests
4. Distinguish test bugs (fix immediately) vs implementation bugs (log as findings)

#### Findings

| Finding | Severity | Evidence | Recommendation |
|---------|----------|----------|----------------|
| QA-01 | P1 | **Test location configurable** — `paths.tests` from `.production-grade.yaml` | ✅ Good |
| QA-02 | P1 | **"Distinguish test bugs from implementation bugs"** — How? No criteria defined | Add bug classification guide |
| QA-03 | P2 | **Test types specified** — Integration, e2e, performance | Add unit test requirement |
| QA-04 | P2 | **Performance tests mentioned but not detailed** — What metrics? | Add performance test requirements |
| QA-05 | P2 | **No test coverage threshold** — Could pass with 0% coverage | Consider minimum coverage requirement |

---

## 5. Security Audit Audit (T6a)

### 5.1 Security Responsibilities

**Source:** `harden.md` lines 62-79

#### Current Flow

1. Read all implementation code
2. Perform STRIDE threat modeling + OWASP Top 10 audit + dependency scan
3. Write findings to workspace
4. Auto-fix Critical/High issues with regression tests
5. Document Medium/Low for remediation plan

#### Findings

| Finding | Severity | Evidence | Recommendation |
|---------|----------|----------|----------------|
| SEC-01 | P1 | **OWASP Top 10 version** — 2021 or newer? | Specify version, update to latest |
| SEC-02 | P1 | **Dependency scan tool** — "dependency scan" but no tool specified | Define scan tool (e.g., npm audit, Snyk, OWASP Dependency-Check) |
| SEC-03 | P1 | **Auto-fix Critical/High** — Good, but what about fixes breaking functionality? | Require regression tests for auto-fixes |
| SEC-04 | P2 | **STRIDE not defined** — Threat modeling framework | Add brief description or link to docs |
| SEC-05 | P1 | **Auto-fix may need user approval** — Critical fixes should be approved | Add approval step for auto-fixes |
| SEC-06 | P2 | **No CVSS scoring** — Findings should have severity scores | Add CVSS scoring requirement |
| SEC-07 | P2 | **No CVE database lookup** — Dependency scan should cross-reference CVE | Add CVE lookup requirement |

---

## 6. Code Review Audit (T6b)

### 6.1 Code Review Responsibilities

**Source:** `harden.md` lines 81-99

#### Current Flow

1. Read architecture + implementation
2. Review: SOLID/DRY/KISS, performance, N+1 queries, resource leaks, test quality
3. Write findings to workspace
4. READ-ONLY: produce findings only, do NOT modify source code

#### Findings

| Finding | Severity | Evidence | Recommendation |
|---------|----------|----------|----------------|
| CRV-01 | P1 | **READ-ONLY enforcement weak** — No programmatic check | Add pre-commit hook to block modifications from code-reviewer |
| CRV-02 | P1 | **SOLID/DRY/KISS not defined** — Principles may be interpreted differently | Add brief definitions or reference links |
| CRV-03 | P2 | **"Test quality" review** — What criteria? Coverage? | Add test quality criteria |
| CRV-04 | P2 | **No code smell catalog** — Should reference common smells | Add common code smells reference |
| CRV-05 | P1 | **No duplicate detection with T6a** — Could have overlapping findings | Add finding deduplication across skills |

---

## 7. Remediation Preparation Audit

### 7.1 Finding Management

**Source:** `harden.md` lines 109-141

#### Current Flow

1. Collect findings from T5, T6a, T6b
2. Deduplicate by file:line
3. Filter Critical/High
4. Critical/High → T8 (SHIP phase)
5. Medium/Low → documented only
6. Aggregate quality scoring
7. Brownfield merge readiness check

#### Findings

| Finding | Severity | Evidence | Recommendation |
|---------|----------|----------|----------------|
| REM-01 | P1 | **Deduplication by file:line** — What about semantic duplicates? | Consider semantic deduplication |
| REM-02 | P1 | **Finding severity classification** — Who classifies? Could be inconsistent | Add severity classification guide |
| REM-03 | P2 | **No duplicate across skills** — T5, T6a, T6b findings not deduplicated | Add cross-skill deduplication |
| REM-04 | P1 | **Critical/High threshold** — 100% of critical/high must be fixed? | Define remediation scope |
| REM-05 | P1 | **Medium/Low documented** — But no tracking | Add tracking for deferred findings |
| REM-06 | P2 | **Quality score computation** — Not defined how to aggregate | Define aggregate scoring formula |

---

## 8. Quality Gate Integration

### 8.1 Per-Task Quality Gates

**Source:** `harden.md` lines 101-108

#### Current Flow

1. Per-skill quality gate
2. Session lifecycle hook
3. Display mini-scorecard per task

#### Findings

| Finding | Severity | Evidence | Recommendation |
|---------|----------|----------|----------------|
| QG-01 | P1 | **Authority boundary violations** — Quality Gate should check authority compliance | Add authority compliance check |
| QG-02 | P2 | **Mini-scorecard consistency** — Should match BUILD phase format | Standardize across phases |

---

## 9. Summary

### Findings by Severity

| Severity | Count | Items |
|----------|-------|-------|
| P0 | 0 | None identified |
| P1 | 18 | Authority enforcement, deduplication, remediation gaps |
| P2 | 13 | Configuration, documentation, clarity improvements |
| **Total** | **31** | |

### Priority P0 Items

*None identified in HARDEN phase.*

### Priority P1 Items

1. **AB-01:** Add programmatic authority enforcement
2. **AB-02:** Add authority violation logging
3. **AB-05:** Document conflict resolution in parallel
4. **CR-01:** Reference conflict-resolution.md in HARDEN
5. **CR-02:** Consider automated conflict detection
6. **PE-01:** Consider all-parallel execution (T5 + T6a + T6b)
7. **QA-02:** Add bug classification guide
8. **SEC-01:** Specify OWASP Top 10 version
9. **SEC-02:** Define dependency scan tool
10. **SEC-03:** Require regression tests for auto-fixes
11. **SEC-05:** Add approval step for auto-fixes
12. **CRV-01:** Add READ-ONLY enforcement hook
13. **CRV-02:** Add SOLID/DRY/KISS definitions
14. **CRV-05:** Add cross-skill duplicate detection
15. **REM-01:** Consider semantic deduplication
16. **REM-02:** Add severity classification guide
17. **REM-03:** Add cross-skill deduplication
18. **REM-04:** Define remediation scope
19. **REM-05:** Add tracking for deferred findings
20. **QG-01:** Add authority compliance check in Quality Gate

### Priority P2 Items

1. **AB-03:** Update OWASP to latest version
2. **AB-04:** Add STRIDE definition
3. **AB-07:** Define explicit T6b review scope
4. **AB-08:** Add structured cross-reference format
5. **PE-02:** Document parallel contract constraints pattern
6. **QA-03:** Add unit test requirement
7. **QA-04:** Add performance test requirements
8. **QA-05:** Consider minimum coverage requirement
9. **SEC-04:** Add STRIDE description
10. **SEC-06:** Add CVSS scoring requirement
11. **SEC-07:** Add CVE lookup requirement
12. **CRV-03:** Add test quality criteria
13. **CRV-04:** Add code smells reference
14. **REM-06:** Define aggregate scoring formula
15. **QG-02:** Standardize mini-scorecard format

---

## 10. Recommendations Summary

### Immediate (v8.0)

1. **AB-01:** Add programmatic authority enforcement middleware
2. **CRV-01:** Add READ-ONLY enforcement for code reviewer
3. **SEC-02:** Define dependency scan tool in security skill
4. **REM-02:** Add severity classification guide
5. **CR-01:** Reference conflict-resolution.md in HARDEN

### Short-term (v8.x)

6. **AB-02:** Add authority violation logging
7. **SEC-01:** Update OWASP to latest version
8. **SEC-03:** Require regression tests for auto-fixes
9. **CRV-02:** Add SOLID/DRY/KISS definitions
10. **REM-01:** Consider semantic deduplication

### Medium-term (Future)

11. **PE-01:** Consider all-parallel execution
12. **SEC-06:** Add CVSS scoring requirement
13. **SEC-07:** Add CVE lookup requirement
14. **QA-05:** Consider minimum coverage requirement
15. **CR-02:** Implement automated conflict detection

---

## 11. Backward Compatibility Assessment

| Change | Breaking? | Migration Path |
|--------|-----------|----------------|
| Add authority enforcement | No | New feature, existing skills unchanged |
| Add READ-ONLY hook | No | New feature, no behavior change |
| Define dependency tool | No | Documentation only |
| Add severity guide | No | Guidelines only |
| Reference conflict-resolution | No | Documentation link |

**Conclusion:** All v8.0 HARDEN changes are backward compatible.
