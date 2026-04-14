# Jira Risk Register Template

> 专为 Jira 设计的风险登记表，包含 Jira 特定的配置和自动化。

---

## Risk Register Configuration

### Project Setup
```yaml
project: [PROJECT-KEY]
issue_type: Task (for risk items)
custom_fields:
  - Risk Impact: Select (High/Medium/Low)
  - Risk Probability: Select (High/Medium/Low)
  - Risk Score: Number (calculated)
  - Risk Status: Select (Open/Mitigating/Mitigated/Closed)
  - Mitigation Plan: Text
  - Contingency Plan: Text
```

### Jira Field Mapping
| Risk Attribute | Jira Field |
|----------------|------------|
| Risk ID | Issue Key (auto-generated) |
| Risk Title | Summary |
| Description | Description |
| Impact | Risk Impact (custom field) |
| Probability | Risk Probability (custom field) |
| Status | Risk Status (custom field) |
| Mitigation | Mitigation Plan (custom field) |

---

## Risk Categories

| Category | Jira Label | Description |
|----------|------------|-------------|
| Technical | `#risk-technical` | Architecture, tech stack, integrations |
| Resource | `#risk-resource` | Team availability, skill gaps |
| External | `#risk-external` | Third-party, market changes |
| Scope | `#risk-scope` | Requirements, scope creep |
| Schedule | `#risk-schedule` | Timeline, dependencies |
| Quality | `#risk-quality` | Technical debt, test coverage |

---

## Risk Entry Template

### Issue Type: Risk Task

```markdown
**Risk ID:** RISK-[NUMBER]
**Title:** [Clear risk description]
**Category:** [#risk-category]
**Created:** [YYYY-MM-DD]
**Owner:** [@username]

## Impact Assessment

**Business Impact:**
[What happens if this risk materializes]

**Technical Impact:**
[Technical consequences]

**Impact:** [High/Medium/Low]
**Probability:** [High/Medium/Low]
**Risk Score:** [Calculated: Impact × Probability]

## Risk Conditions

**Trigger Conditions:**
- [Condition 1]
- [Condition 2]

**Risk Threshold:**
[At what point this becomes critical]

## Mitigation Plan

**Step 1:** [Action]
**Owner:** [@name] | **Due:** [Date] | **Status:** [Todo/Done]

**Step 2:** [Action]
**Owner:** [@name] | **Due:** [Date] | **Status:** [Todo/Done]

## Contingency Plan

[What to do if mitigation fails]

## Status History

| Date | Status | Updated By | Notes |
|------|--------|-----------|-------|
| [Date] | [Status] | [Name] | [Notes] |

**Labels:** #risk #active
```

---

## Jira Automation for Risks

### Automation 1: Auto-create Risk on Labels
```yaml
name: "Create Risk from Label"
trigger:
  type: issue_updated
  filter: labels added = #escalate-to-risk
condition:
  - assignee = [@project-manager]
actions:
  - create_issue:
      project: [PROJECT]
      issuetype: Task
      summary: "Risk escalated: {issue.summary}"
      description: "See parent issue: {issue.key}"
      labels: add #risk #escalated
      priority: High
  - link_issues: relates_to
  - add comment: "Risk escalated to Risk Register: [RISK-XXX]"
```

### Automation 2: Escalation Alert for High Risks
```yaml
name: "High Risk Alert"
trigger:
  type: issue_created
  filter: issuetype = Task AND labels = #risk AND priority = High
actions:
  - send notification:
      to: [@scrum-master, @po, @tech-lead]
      subject: "High Risk Created: {issue.summary}"
      body: "Risk [RISK-XXX] requires immediate attention."
  - set priority: Highest
  - add label: #critical-risk
```

### Automation 3: Auto-update Risk Status
```yaml
name: "Update Risk Status on Mitigation Complete"
trigger:
  type: comment_added
  filter: issue.labels contains #risk
condition:
  - comment contains "mitigation complete"
actions:
  - set custom field: Risk Status = Mitigating
  - add label: remove #active, add #mitigating
```

---

## Risk Dashboard Configuration

### Jira Gadgets

#### 1. Risk Count by Status
```
Gadget: Statistics
Statistic: Count
Group by: Risk Status
Filter: labels = #risk
```

#### 2. High Priority Risks
```
Gadget: Filter Results
Filter: labels = #risk AND priority in (High, Highest)
Columns: Key, Summary, Risk Impact, Risk Probability, Risk Score, Owner
Sort: Risk Score DESC
```

#### 3. Risk Trend
```
Gadget: Created vs Resolved Chart
Filter: labels = #risk
Period: Last 30 days
```

---

## Risk JQL Queries

### Active Risks
```jql
labels = #risk AND status != Closed ORDER BY priority DESC
```

### High Impact Risks
```jql
labels = #risk AND "Risk Impact" = High ORDER BY created DESC
```

### Risks by Category
```jql
labels = #risk AND labels = #risk-technical ORDER BY created DESC
```

### Risks by Owner
```jql
labels = #risk AND assignee = [@username] ORDER BY priority DESC
```

---

## Risk Matrix View

### Board/Sprint View Configuration
```
Swimlanes: Risk Status
Columns: Key, Summary, "Risk Impact", "Risk Probability", "Risk Score"
Quick Filters:
  - High Risk: "Risk Score" > 6
  - My Risks: assignee = currentUser()
  - Overdue: due < now()
```

---

## Risk Reporting

### Weekly Risk Report Template

```markdown
## Weekly Risk Report - [Week Number]

**Report Date:** [YYYY-MM-DD]
**Reporter:** [@name]

### Summary
| Metric | Count |
|--------|-------|
| Total Risks | [N] |
| New This Week | [+X] |
| Mitigated This Week | [-X] |
| Closed This Week | [-X] |
| Escalated to Critical | [X] |

### High Priority Risks (>6 Score)

| Risk ID | Title | Score | Owner | Status |
|---------|-------|-------|-------|--------|
| RISK-001 | [Title] | 9 | @user | [Status] |
| RISK-002 | [Title] | 6 | @user | [Status] |

### Risks Needing Attention

| Risk ID | Issue | Reason | Action Required |
|---------|-------|--------|-----------------|
| [ID] | [Key] | [Reason] | [Action] |

### Risk Trend
[Chart or trend description]
```

---

## Risk Review Meeting Agenda

### Frequency: Weekly
### Duration: 30 minutes
### Participants: Scrum Master, Tech Lead, PM

#### Agenda
```
1. Review new risks (5 min)
   - Any new risks escalated?
   - Assign owners

2. Update risk status (10 min)
   - Progress on mitigations?
   - Any risks materialized?

3. Deep dive: High priority risks (10 min)
   - Are mitigations working?
   - Do we need more resources?

4. Identify emerging risks (5 min)
   - What might become a risk?
   - Early warning signs?
```

---

## Example Risk Entry

### RISK-023: Third-party Payment API Rate Limiting

```markdown
**Risk ID:** RISK-023
**Title:** Stripe API rate limiting during peak traffic
**Category:** #risk-external
**Created:** 2026-04-01
**Owner:** @alice (DevOps)

## Impact Assessment

**Business Impact:** All payment processing fails, revenue loss estimated $50K/hour

**Technical Impact:** API returns 429 errors, payment service unavailable

**Impact:** High | **Probability:** Medium | **Risk Score:** 6

## Risk Conditions

**Trigger Conditions:**
- API requests > 1000/minute
- Burst traffic from promotions

**Risk Threshold:**
- Sustained > 500 requests/minute for 5+ minutes

## Mitigation Plan

| Step | Action | Owner | Due | Status |
|------|--------|-------|-----|--------|
| 1 | Implement exponential backoff | @alice | 04/07 | ✅ Done |
| 2 | Add rate limiting middleware | @alice | 04/10 | ✅ Done |
| 3 | Set up monitoring alerts | @bob | 04/10 | ✅ Done |
| 4 | Document fallback procedures | @alice | 04/14 | 🔄 In Progress |

## Contingency Plan

If rate limiting occurs:
1. Display "Payment processing delayed" message
2. Queue payments for retry
3. Alert on-call engineer
4. Manual payment processing fallback

## Status History

| Date | Status | Updated By | Notes |
|------|--------|-----------|-------|
| 04/01 | Open | @alice | Initial creation |
| 04/07 | Mitigating | @alice | Backoff implemented |
| 04/14 | Mitigating | @alice | Fallback docs in progress |

**Labels:** #risk #external #payment
**Priority:** High
**Due Date:** 2026-04-14
```

---

## Risk Archive

### Closed Risks Repository
```jql
labels = #risk AND status = Closed ORDER BY resolved DESC
```

### Lessons Learned Template
```markdown
## Risk Post-Mortem: RISK-[XXX]

**Risk:** [Title]
**Date Materialized:** [Date]
**Impact:** [Description]
**Duration:** [How long]

### What Happened

### Root Cause

### Mitigation Effectiveness
- What worked:
- What didn't:

### Lessons Learned
- [Lesson 1]
- [Lesson 2]

### Process Improvements
[Changes to make for next time]
```
