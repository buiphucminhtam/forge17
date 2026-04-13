# Phase Audit: SHIP

**Task:** 1.4
**Priority:** P0
**Estimate:** 3 hours
**Status:** In Progress

---

## 1. SHIP Phase Overview

**Source:** `skills/production-grade/phases/ship.md`

### 1.1 Task Graph

```
HARDEN Phase
    ↓ Quality Gate
┌──────────────────────────────────────────────────────┐
│                    SHIP Phase                          │
│                                                        │
│  ┌─────────────┐                                      │
│  │  T7 DevOps │                                      │
│  └─────────────┘                                      │
│       │                                                │
│  ┌─────────────┐                                      │
│  │  T8 Remed. │ ← Fix HARDEN findings                │
│  └─────────────┘                                      │
│       │                                                │
│  ┌─────────────┐                                      │
│  │  T9 SRE    │ ← SOLE SLO authority                │
│  └─────────────┘                                      │
│       │                                                │
│  ┌─────────────┐                                      │
│  │ T10 Data   │ ← Conditional (AI/ML detected)      │
│  │  Scientist │                                      │
│  └─────────────┘                                      │
│       │                                                │
│  ┌─────────────┐                                      │
│  │ Gate 3     │ ← Production Readiness              │
│  └─────────────┘                                      │
└──────────────────────────────────────────────────────┘
    ↓
SUSTAIN Phase
```

---

## 2. T7 DevOps IaC + CI/CD Audit

### 2.1 Responsibilities

**Source:** `ship.md` lines 11-30

#### Current Flow

1. Read architecture + implementation
2. Generate: Terraform/Pulumi, K8s manifests, CI/CD pipelines, monitoring dashboards
3. Write to project root: infrastructure/, .github/workflows/
4. DO NOT define SLOs — add placeholder
5. DO NOT write runbooks — SRE writes runbooks
6. Validate: terraform validate, pipeline syntax lint

#### Findings

| Finding | Severity | Evidence | Recommendation |
|---------|----------|----------|----------------|
| DV-01 | P1 | **"Terraform OR Pulumi"** — Which one? No guidance on choosing | Add decision criteria for IaC tool selection |
| DV-02 | P1 | **K8s mentioned but not always needed** — Monoliths don't need K8s | Add conditional K8s generation |
| DV-03 | P1 | **Monitoring dashboards** — What metrics? No specification | Add monitoring dashboard requirements |
| DV-04 | P2 | **CI/CD pipeline templates** — GitHub Actions? GitLab CI? Both? | Support multiple CI providers |
| DV-05 | P1 | **Validation commands** — `terraform validate` but no CI/CD validation | Add pipeline lint command |
| DV-06 | P1 | **No rollback automation** — Infrastructure changes should have rollback | Add rollback strategy documentation |
| DV-07 | P2 | **No cost estimation** — IaC should estimate infrastructure cost | Consider adding cost estimation |
| DV-08 | P1 | **T7 authority boundary vague** — "DevOps owns infrastructure provisioning" | Document explicit boundary |
| DV-09 | P2 | **"Monitoring dashboards" is vague** — What to include? | Add monitoring dashboard template |

### 2.2 SLO Placeholder

| Finding | Severity | Evidence | Recommendation |
|---------|----------|----------|----------------|
| SLO-01 | P1 | **SLO placeholder** — "SLO thresholds defined by SRE" but no format specified | Define SLO placeholder format |
| SLO-02 | P1 | **SRE owns SLOs but T7 creates monitoring** — Monitoring should align with SLOs | Add coordination step |

---

## 3. T8 Remediation Audit

### 3.1 Remediation Responsibilities

**Source:** `ship.md` lines 34-49

#### Current Flow

1. Read HARDEN findings from workspace
2. Focus on Critical and High severity only
3. For each finding: read file → apply fix → run tests → re-scan
4. If findings persist after 2 fix-rescan cycles → document and escalate
5. Medium/Low → document only

#### Findings

| Finding | Severity | Evidence | Recommendation |
|---------|----------|----------|----------------|
| REM-01 | P1 | **"2 fix-rescan cycles"** — Arbitrary number, no configuration | Make configurable |
| REM-02 | P1 | **No rollback for fixes** — If fix breaks something, no easy rollback | Add fix rollback capability |
| REM-03 | P2 | **Fix attribution** — Who made the fix? No tracking | Add fix attribution to findings |
| REM-04 | P1 | **Fix verification** — "Run affected tests" but which tests? | Add fix verification criteria |
| REM-05 | P1 | **Medium/Low tracking** — "document but do not block" | Add tracking system |
| REM-06 | P2 | **Fix efficiency** — No time limit per fix | Consider timeboxing fixes |
| REM-07 | P1 | **Fix may need approval** — Critical fixes should be approved | Add approval step |

---

## 4. T9 SRE Audit

### 4.1 SRE Responsibilities

**Source:** `ship.md` lines 51-68

#### Current Flow

1. Read all prior outputs
2. SOLE authority on SLO definitions, error budgets, runbooks, capacity planning
3. Perform production readiness review
4. Define SLIs/SLOs per service, error budgets, burn-rate alerts
5. Design chaos engineering scenarios and game-day playbook
6. Write runbooks to docs/runbooks/
7. Write workspace artifacts to .forgewright/sre/

#### Findings

| Finding | Severity | Evidence | Recommendation |
|---------|----------|----------|----------------|
| SRE-01 | P1 | **SLI/SLO definition quality** — No criteria for what makes good SLOs | Add SLO definition guide |
| SRE-02 | P1 | **Chaos engineering** — Good practice but risky | Add safety guardrails for chaos |
| SRE-03 | P1 | **Game-day playbook** — Not defined what it includes | Add game-day playbook template |
| SRE-04 | P2 | **Burn-rate alerts** — Mentioned but not explained | Add burn-rate alert guide |
| SRE-05 | P2 | **Runbook quality** — What makes a good runbook? | Add runbook quality criteria |
| SRE-06 | P1 | **SRE vs DevOps boundary** — "SRE writes runbooks" but T7 creates monitoring | Clarify boundary |
| SRE-07 | P2 | **Capacity planning** — Vague, no methodology | Add capacity planning methodology |
| SRE-08 | P2 | **Error budgets** — Mentioned but not defined | Add error budget calculation guide |

### 4.2 SRE Authority Boundary

| Finding | Severity | Evidence | Recommendation |
|---------|----------|----------|----------------|
| AB-01 | P1 | **SRE owns SLOs but DevOps creates monitoring** — Potential conflict | Add monitoring-SLO alignment step |
| AB-02 | P1 | **SRE does NOT provision infrastructure** — Clear boundary | ✅ Good |
| AB-03 | P1 | **"Capacity planning" overlaps with DevOps** — Who does capacity planning? | Clarify responsibility |

---

## 5. T10 Data Scientist Audit

### 5.1 Conditional Activation

**Source:** `ship.md` lines 70-93

#### Current Flow

**Activated if:**
- AI/ML imports detected (openai, anthropic, langchain, transformers, torch, tensorflow)
- OR `features.ai_ml` is true

#### Findings

| Finding | Severity | Evidence | Recommendation |
|---------|----------|----------|----------------|
| DS-01 | P1 | **Import detection limited** — Only checks imports, not usage | Consider checking actual API calls |
| DS-02 | P1 | **AI/ML imports list may be incomplete** — What about huggingface, anthropic, gemini? | Expand import list |
| DS-03 | P2 | **Data Scientist skill responsibilities** — "Optimize prompts, token usage" | Add specific optimization targets |
| DS-04 | P2 | **A/B testing infrastructure** — Good feature, no details | Add A/B testing requirements |
| DS-05 | P2 | **Experiment framework** — Good feature, no details | Add experiment framework template |

---

## 6. Gate 3 Production Readiness Audit

### 6.1 Gate 3 Flow

**Source:** `ship.md` lines 94-100

#### Current Flow

After T9 completes:
1. Present Gate 3 using orchestrator pattern
2. On approval → SUSTAIN phase
3. On "Fix issues first" → create additional remediation tasks

#### Findings

| Finding | Severity | Evidence | Recommendation |
|---------|----------|----------|----------------|
| G3-01 | P1 | **Gate 3 criteria not defined** — What makes production ready? | Add production readiness checklist |
| G3-02 | P2 | **Gate 3 options limited** — Only "Fix issues first" | Consider adding "Approve with known issues" |
| G3-03 | P1 | **No production readiness score** — Should quantify readiness | Add readiness scoring |
| G3-04 | P2 | **No pre-flight checks** — What runs before Gate 3? | Add pre-flight checklist |

---

## 7. Authority Boundaries Summary

### 7.1 SHIP Phase Boundaries

| Skill | Owns | Does NOT Own |
|-------|------|--------------|
| DevOps | Infrastructure provisioning, CI/CD, monitoring setup | SLOs, runbooks |
| SRE | SLOs, error budgets, runbooks, capacity planning | Infrastructure provisioning |
| Data Scientist | LLM/ML optimization, A/B testing | Infrastructure, SLOs |

### 7.2 Boundary Issues

| Finding | Severity | Description |
|---------|----------|-------------|
| BI-01 | P1 | DevOps creates monitoring but SRE defines SLOs → need alignment |
| BI-02 | P1 | Capacity planning overlaps → need clear responsibility |

---

## 8. Summary

### Findings by Severity

| Severity | Count | Items |
|----------|-------|-------|
| P0 | 0 | None identified |
| P1 | 18 | IaC gaps, SLO clarity, gate criteria |
| P2 | 15 | Configuration, documentation improvements |
| **Total** | **33** | |

### Priority P0 Items

*None identified in SHIP phase.*

### Priority P1 Items

1. **DV-01:** Add IaC tool decision criteria
2. **DV-02:** Add conditional K8s generation
3. **DV-03:** Add monitoring dashboard requirements
4. **DV-05:** Add CI/CD validation command
5. **DV-06:** Add rollback strategy
6. **DV-08:** Document DevOps authority boundary
7. **SLO-01:** Define SLO placeholder format
8. **SLO-02:** Add DevOps-SRE coordination step
9. **REM-01:** Make fix cycle count configurable
10. **REM-02:** Add fix rollback capability
11. **REM-04:** Add fix verification criteria
12. **REM-05:** Add tracking for deferred findings
13. **REM-07:** Add approval step for fixes
14. **SRE-01:** Add SLO definition guide
15. **SRE-02:** Add chaos engineering safety guardrails
16. **SRE-03:** Add game-day playbook template
17. **SRE-06:** Clarify DevOps-SRE boundary
18. **AB-01:** Add monitoring-SLO alignment step
19. **AB-03:** Clarify capacity planning responsibility
20. **DS-01:** Expand AI/ML detection beyond imports
21. **DS-02:** Expand AI/ML import list
22. **G3-01:** Add production readiness checklist
23. **G3-03:** Add readiness scoring

### Priority P2 Items

1. **DV-04:** Support multiple CI providers
2. **DV-07:** Consider cost estimation
3. **DV-09:** Add monitoring dashboard template
4. **REM-03:** Add fix attribution
5. **REM-06:** Consider timeboxing fixes
6. **SRE-04:** Add burn-rate alert guide
7. **SRE-05:** Add runbook quality criteria
8. **SRE-07:** Add capacity planning methodology
9. **SRE-08:** Add error budget calculation guide
10. **DS-03:** Add Data Scientist optimization targets
11. **DS-04:** Add A/B testing requirements
12. **DS-05:** Add experiment framework template
13. **G3-02:** Consider "Approve with known issues"
14. **G3-04:** Add pre-flight checklist
15. **BI-02:** Document capacity planning responsibility

---

## 9. Recommendations Summary

### Immediate (v8.0)

1. **DV-01:** Add IaC tool decision criteria (Terraform vs Pulumi)
2. **SLO-01:** Define SLO placeholder format
3. **G3-01:** Add production readiness checklist
4. **AB-03:** Clarify capacity planning responsibility
5. **REM-04:** Add fix verification criteria

### Short-term (v8.x)

6. **DV-02:** Add conditional K8s generation based on architecture
7. **DV-06:** Add rollback strategy documentation
8. **SRE-01:** Add SLO definition guide
9. **REM-02:** Add fix rollback capability
10. **DS-02:** Expand AI/ML import detection

### Medium-term (Future)

11. **DV-03:** Add monitoring dashboard requirements
12. **SRE-02:** Add chaos engineering safety guardrails
13. **SRE-03:** Add game-day playbook template
14. **G3-03:** Add readiness scoring system
15. **DS-04:** Add A/B testing requirements

---

## 10. Backward Compatibility Assessment

| Change | Breaking? | Migration Path |
|--------|-----------|----------------|
| Add IaC decision criteria | No | New feature |
| Define SLO format | No | Documentation only |
| Add production checklist | No | New feature |
| Clarify boundaries | No | Documentation only |
| Add fix verification | No | New feature |

**Conclusion:** All v8.0 SHIP changes are backward compatible.
