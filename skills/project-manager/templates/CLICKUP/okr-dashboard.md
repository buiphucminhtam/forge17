# ClickUp OKR Dashboard Template

> 专为 ClickUp OKR 功能设计的仪表板模板，包含 OKR 配置和 AI 生成功能。

---

## OKR Dashboard Overview

### Dashboard Information
| Field | Value |
|-------|-------|
| **Quarter** | Q[X] [YYYY] |
| **Team** | [Team Name] |
| **Date Range** | [Start] - [End] |
| **Last Updated** | [YYYY-MM-DD] |

### ClickUp OKR Link
```
https://app.clickup.com/[workspace]/space/[space-id]/okrs
```

---

## OKR Structure

### Level 1: Company OKRs
```
Company Objective: [Objective]
├─ OKR 1.1: [Key Result]
├─ OKR 1.2: [Key Result]
└─ OKR 1.3: [Key Result]
```

### Level 2: Team OKRs
```
Team Objective: [Team Objective]
├─ OKR 2.1: [Key Result]
├─ OKR 2.2: [Key Result]
└─ OKR 2.3: [Key Result]
```

### Level 3: Individual OKRs
```
Individual Objective: [Name]
├─ OKR 3.1: [Key Result]
└─ OKR 3.2: [Key Result]
```

---

## Objective Templates

### Objective Template
```markdown
## Objective [X]: [Objective Title]

**Owner:** [@Name]
**Team:** [Team Name]
**Aligns to:** [Company/Team OKR]
**Status:** 🟢 On Track / 🟡 At Risk / 🔴 Off Track

**Why this matters:**
[1-2 sentences explaining the business value]

**Key Results:**
| KR | Description | Owner | Baseline | Target | Current | Progress |
|----|-------------|-------|----------|--------|---------|----------|
| KR1 | [Description] | @user | [X] | [Y] | [Z] | [P]% |
| KR2 | [Description] | @user | [X] | [Y] | [Z] | [P]% |
| KR3 | [Description] | @user | [X] | [Y] | [Z] | [P]% |

**Linked Tasks:**
- [Task Link 1]
- [Task Link 2]
- [Task Link 3]
```

---

## Key Result Templates

### Key Result Types

#### Type 1: Metric-Based KR
```markdown
## KR-[Number]: [Description]

**Type:** Metric
**Owner:** [@Name]
**Unit:** [Unit]

### Progress Data
| Week | Date | Value | Notes |
|------|------|-------|-------|
| 1 | [Date] | [Value] | [Notes] |
| 2 | [Date] | [Value] | [Notes] |
| 3 | [Date] | [Value] | [Notes] |
| 4 | [Date] | [Value] | [Notes] |

### Chart
```
Value
  ↑
  │    ●────●────●
  │   ╱            ╲
  │  ╱              ●────● Target
  │ ●
  │ ●───
  └──────────────────────────→ Time
```

### Current Status
- **Baseline:** [Value]
- **Current:** [Value]
- **Target:** [Value]
- **Progress:** [X]%
- **Trend:** 📈 Increasing / 📉 Decreasing / ➡️ Stable
```

#### Type 2: Task-Based KR
```markdown
## KR-[Number]: [Description]

**Type:** Task Completion
**Owner:** [@Name]

### Tasks
| Task | Status | Due Date | Assignee |
|------|--------|----------|----------|
| [Task 1] | ✅ Done | [Date] | @user |
| [Task 2] | 🔄 In Progress | [Date] | @user |
| [Task 3] | ⏳ Todo | [Date] | @user |
| [Task 4] | ⏳ Todo | [Date] | @user |

### Progress Calculation
- **Total Tasks:** [N]
- **Completed:** [X]
- **In Progress:** [Y]
- **Remaining:** [Z]
- **Progress:** [X/N × 100]%
```

#### Type 3: Binary KR
```markdown
## KR-[Number]: [Description]

**Type:** Binary (Done/Not Done)
**Owner:** [@Name]
**Status:** ❌ Not Achieved

### Checklist
- [x] [Milestone 1]
- [x] [Milestone 2]
- [ ] [Milestone 3]
- [ ] [Milestone 4]

### Next Steps
[What needs to happen to complete this KR]
```

---

## Progress Tracking

### Weekly Check-in Template
```markdown
## Weekly OKR Check-in - Week [N]

**Date:** [YYYY-MM-DD]
**Prepared by:** [@Name]

### Status Summary
| OKR | Previous | Current | Change | Confidence |
|-----|----------|---------|--------|------------|
| 1.1 | 45% | 52% | +7% | 🟢 High |
| 1.2 | 60% | 65% | +5% | 🟢 High |
| 2.1 | 30% | 35% | +5% | 🟡 Medium |
| 2.2 | 0% | 10% | +10% | 🟡 Medium |

### Updates

#### OKR 1.1 - [Title]
**Update:** [What happened this week]
**Blockers:** [Any blockers]
**Confidence:** 🟢 High (80% confidence of achieving)

#### OKR 2.1 - [Title]
**Update:** [What happened this week]
**Blockers:** [Any blockers]
**Confidence:** 🟡 Medium (50% confidence of achieving)

### Risks
| OKR | Risk | Mitigation | Owner |
|-----|------|------------|-------|
| 2.2 | [Risk] | [Mitigation] | @user |

### Confidence Scoring
**Scale:** 1-10 (1=No confidence, 10=Certain)
| OKR | Score | Rationale |
|-----|-------|------------|
| 1.1 | 8 | On track, no blockers |
| 1.2 | 7 | Steady progress |
| 2.1 | 5 | Some dependencies |
| 2.2 | 4 | High risk of scope creep |
```

---

## AI-Generated Insights

### ClickUp Brain Integration
```markdown
## AI-Generated OKR Summary

**Generated:** [YYYY-MM-DD HH:MM]
**Source:** ClickUp Brain

### Key Insights

**1. Velocity Alert**
[AI insight about progress velocity]

**2. Risk Detection**
[AI insight about at-risk OKRs]

**3. Correlation Analysis**
[AI insight about linked tasks and OKR progress]

**4. Recommendations**
[AI-generated recommendations for next week]

### Engagement Score
- **Team Activity:** [N] actions this week
- **Task Completion Rate:** [X]%
- **Avg Time in Status:** [N] days

### Trend Analysis
| OKR | 4-Week Trend | Prediction |
|-----|--------------|------------|
| 1.1 | 📈 Positive | Likely to achieve |
| 1.2 | ➡️ Stable | On track |
| 2.1 | 📉 Negative | Needs attention |
| 2.2 | 📉 Negative | At risk |
```

---

## Dashboard Widgets

### Recommended Widget Configuration
```yaml
widgets:
  - type: okr_progress
    title: "OKR Progress Overview"
    display: "grid"
    show: [progress, confidence]

  - type: key_result_chart
    title: "KR Progress Over Time"
    chart_type: "line"
    period: "quarterly"

  - type: task_list
    title: "Top Contributing Tasks"
    filter: "linked_to_okr = true"
    sort: "okr_impact DESC"
    limit: 10

  - type: confidence_gauge
    title: "Overall Confidence"
    display: "gauge"

  - type: at_risk_alerts
    title: "At-Risk OKRs"
    filter: "confidence < 5"
    include_recommendations: true
```

---

## Example: Q2 2026 OKR Dashboard

### Company OKR: Grow Revenue

```markdown
## Objective 1: Grow Revenue 25%

**Owner:** [CEO Name]
**Status:** 🟡 At Risk

### Key Results

| KR | Description | Owner | Baseline | Target | Current | Progress |
|----|-------------|-------|----------|--------|---------|----------|
| KR1 | Monthly Recurring Revenue | @cfo | $500K | $625K | $540K | 29% |
| KR2 | New Enterprise Customers | @sales-lead | 0 | 10 | 4 | 40% |
| KR3 | Customer Retention Rate | @cso | 85% | 92% | 88% | 43% |

### KR1 Detail: MRR Growth

**Type:** Metric
**Unit:** USD ($)

| Week | Date | MRR | Notes |
|------|------|-----|-------|
| 1 | Apr 1 | $500K | Quarter start |
| 2 | Apr 7 | $505K | +1 deal |
| 3 | Apr 14 | $515K | +2 deals |
| 4 | Apr 21 | $525K | +1 deal |
| 5 | Apr 28 | $540K | +2 deals |

**Progress:** 29% (40K / 125K)
**Trend:** 📈 +$10K/week
**Prediction:** Will achieve if maintain $10K/week
**Confidence:** 🟡 Medium (60%)
```

### Team OKR: Platform Team

```markdown
## Objective: Platform Reliability 99.9%

**Owner:** [VP Engineering]
**Aligns to:** Company OKR 1

### Key Results
| KR | Description | Target | Current | Progress |
|----|-------------|--------|---------|----------|
| KR1 | Uptime | 99.9% | 99.7% | 70% |
| KR2 | P95 Latency | <200ms | 180ms | 85% |
| KR3 | Incident MTTR | <30min | 45min | 30% |

### Linked Tasks
- [Task] Implement monitoring alerts → Progress: 80%
- [Task] Database optimization → Progress: 60%
- [Task] CDN configuration → Progress: 100%
```
