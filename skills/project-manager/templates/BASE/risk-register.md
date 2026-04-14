# Risk Register Template (Base)

> 工具无关的风险登记表模板，适用于任何项目管理工具。

---

## Risk Register Header

| Field | Value |
|-------|-------|
| **Project** | [Project Name] |
| **Sprint/Phase** | [Sprint/Phase Name] |
| **Date Created** | [YYYY-MM-DD] |
| **Last Updated** | [YYYY-MM-DD] |
| **Risk Owner** | [Name] |

---

## Risk Categories

| Category | Description |
|----------|-------------|
| Technical | Architecture, tech stack, integration risks |
| Resource | Team availability, skill gaps |
| External | Third-party dependencies, market changes |
| Scope | Requirement ambiguity, scope creep |
| Schedule | Timeline compression, dependencies |
| Quality | Technical debt, test coverage gaps |

---

## Risk Matrix

| ID | Risk | Category | Impact | Probability | Score | Owner | Status |
|----|------|----------|--------|-------------|-------|-------|--------|
| R1 | [Description] | [Category] | [H/M/L] | [H/M/L] | [#] | [Name] | [Open/Mitigated] |
| R2 | [Description] | [Category] | [H/M/L] | [H/M/L] | [#] | [Name] | [Open/Mitigated] |
| R3 | [Description] | [Category] | [H/M/L] | [H/M/L] | [#] | [Name] | [Open/Mitigated] |

### Scoring Guide

| Impact | Probability | Score |
|--------|-------------|-------|
| High | High | 9 |
| High | Medium | 6 |
| High | Low | 3 |
| Medium | High | 6 |
| Medium | Medium | 4 |
| Medium | Low | 2 |
| Low | High | 3 |
| Low | Medium | 2 |
| Low | Low | 1 |

**Threshold:** Score ≥ 6 requires active mitigation plan

---

## Detailed Risk Entries

### R1: [Risk Title]

**Description:**
[Detailed description of the risk]

**Category:** [Technical/Resource/External/Scope/Schedule/Quality]

**Impact Assessment:**
- **Business Impact:** [What happens if this risk materializes]
- **Technical Impact:** [Technical consequences]
- **Timeline Impact:** [Schedule implications]

**Probability:** [High/Medium/Low]

**Trigger Conditions:**
- [Condition 1]
- [Condition 2]

**Mitigation Plan:**
| Step | Action | Owner | Due Date | Status |
|------|--------|-------|----------|--------|
| 1 | [Action] | [Name] | [Date] | [Done/Todo] |
| 2 | [Action] | [Name] | [Date] | [Done/Todo] |

**Contingency Plan:**
[What to do if mitigation fails]

**Status History:**
| Date | Status | Updated By | Notes |
|------|--------|-----------|-------|
| [Date] | [Status] | [Name] | [Notes] |

---

## Risk Trend

### Weekly Review

| Risk ID | Week 1 | Week 2 | Week 3 | Week 4 | Trend |
|---------|--------|--------|--------|--------|-------|
| R1 | 🟡 6 | 🟡 6 | 🟢 4 | 🟢 2 | ↓ Decreasing |
| R2 | 🔴 9 | 🔴 9 | 🔴 9 | 🟡 6 | ↓ Decreasing |
| R3 | 🟢 3 | 🟢 3 | 🟢 3 | 🟢 3 | → Stable |

---

## Escalation Policy

| Score | Action Required |
|-------|----------------|
| 9 | Immediate escalation to Product Owner and CTO |
| 6-8 | Escalation to Scrum Master within 24 hours |
| 3-5 | Track in weekly risk review |
| 1-2 | Monitor but no formal tracking |

---

## Risk Review Meetings

- **Frequency:** Weekly (or bi-weekly sprint)
- **Participants:** Scrum Master, Tech Lead, Product Owner
- **Agenda:**
  1. Review new risks
  2. Update risk status
  3. Review mitigation progress
  4. Identify emerging risks

---

## Example Entry

### R1: Third-party API dependency

**Description:** Our payment processing relies on Stripe API. API outage would block all payments.

**Category:** External

**Impact:** High | **Probability:** Low

**Score:** 6

**Mitigation Plan:**
| Step | Action | Owner | Due |
|------|--------|-------|-----|
| 1 | Implement retry logic with exponential backoff | Dev | Week 1 |
| 2 | Add circuit breaker pattern | Dev | Week 2 |
| 3 | Document fallback procedures | DevOps | Week 2 |

**Status:** 🟡 In Progress
