# Asana OKR Mapping Template

> 专为 Asana OKR 功能设计的目标与关键结果映射模板，包含项目-目标对齐配置。

---

## OKR Structure Overview

### Asana OKR URL
```
https://app.asana.com/0/okrs
```

### OKR Hierarchy
```yaml
okr_levels:
  - level: "Company"
    owner: "[CEO]"
    time_horizon: "annual"
    
  - level: "Team/Department"
    owner: "[VP/Director]"
    time_horizon: "quarterly"
    
  - level: "Individual"
    owner: "[Employee]"
    time_horizon: "quarterly"
```

---

## OKR Template

### Objective Template
```markdown
## Objective [N]: [Objective Title]

**Owner:** [@Name]
**Level:** [Company/Team/Individual]
**Time Period:** [Q[X] YYYY]
**Status:** 🟢 On Track / 🟡 At Risk / 🔴 Off Track
**Confidence:** [X]% (1-10 scale)

### Why This Matters
[2-3 sentences explaining the business value]

### Alignment
- **Parent OKR:** [Parent Objective Name]
- **Cascades to:** [Child Objectives/Teams]
- **Company Strategy:** [Strategy area]

### Key Results

| KR | Description | Owner | Unit | Baseline | Target | Current | Progress |
|----|-------------|-------|------|----------|--------|---------|----------|
| KR1 | [Description] | @user | [Unit] | [X] | [Y] | [Z] | [P]% |
| KR2 | [Description] | @user | [Unit] | [X] | [Y] | [Z] | [P]% |
| KR3 | [Description] | @user | [Unit] | [X] | [Y] | [Z] | [P]% |

### Linked Tasks
| Task | KR | Status | Progress |
|------|----|--------|----------|
| [Task 1] | KR1 | ✅ Done | 100% |
| [Task 2] | KR1 | 🔄 In Progress | 60% |
| [Task 3] | KR2 | ⏳ Todo | 0% |

### Weekly Check-ins
| Week | Update | Blocker | Confidence |
|------|--------|---------|------------|
| W1 | [Update] | None | 8 |
| W2 | [Update] | None | 8 |
| W3 | [Update] | Resource | 7 |
```

---

## Key Result Types

### Type 1: Metric-Based KR
```yaml
kr_type: metric
description: "Track measurable numeric outcomes"

fields:
  - unit: "[Unit name]"
  - baseline: [Current value]
  - target: [Goal value]
  - current: [Actual value]
  - frequency: "[weekly/monthly]"
  
example:
  unit: "%"
  baseline: 45
  target: 70
  current: 52
```

### Type 2: Task-Based KR
```yaml
kr_type: task_completion
description: "Complete specific deliverables"

fields:
  - deliverables: "[List of tasks]"
  - completion_criteria: "[What counts as done]"
  - weight: "[Importance if multiple tasks]"
  
example:
  deliverables:
    - "Launch v2.0 documentation site"
    - "Create API reference guide"
    - "Publish 5 tutorial videos"
  completion_criteria: "All published and linked"
```

### Type 3: Binary KR
```yaml
kr_type: binary
description: "Achieve a specific milestone"

fields:
  - milestone: "[What to achieve]"
  - success_criteria: "[How to verify]"
  - target_date: "[Date]"
  
example:
  milestone: "SOC 2 Type II certification"
  success_criteria: "Audit passed with no major findings"
  target_date: "2026-06-30"
```

---

## Project-to-OKR Mapping

### Mapping Configuration
```yaml
mapping:
  enabled: true
  bidirectional: true  # Changes propagate both ways
  
  rules:
    - task_completes: "Update KR progress"
    - kr_progress: "Update task priority"
    - task_blocked: "Flag KR at risk"
```

### Mapping Table
| Project | Primary OKR | Secondary OKRs | Contribution |
|---------|-------------|-----------------|--------------|
| [Project A] | Obj 1.2 | — | 100% |
| [Project B] | Obj 1.1 | Obj 2.3 | 70%/30% |
| [Project C] | Obj 2.1 | — | 100% |

### Task-OKR Link Example
```yaml
task:
  name: "Implement user login flow"
  project: "Auth Service"
  
okr_links:
  - objective: "Obj 1: Improve user activation"
    kr: "KR1.2: Login completion rate"
    contribution: 50%  # 50% of task contributes to this KR
    
  - objective: "Obj 3: Platform reliability"
    kr: "KR3.1: Auth uptime 99.9%"
    contribution: 50%
```

---

## Cascade Configuration

### Top-Down Cascade
```yaml
cascade:
  direction: "top-down"
  time_offset: 0  # No offset, simultaneous
  
  process:
    1_company:
      level: company
      time_horizon: annual
      
    2_team:
      level: team
      parent: company
      time_horizon: quarterly
      derived_from: parent objectives
      
    3_individual:
      level: individual
      parent: team
      time_horizon: quarterly
      derived_from: team objectives
```

### Bottom-Up Contribution
```yaml
contribution:
  direction: "bottom-up"
  aggregation: "weighted_average"
  
  rules:
    - kr_progress: "Sum of linked task progress"
    - obj_progress: "Average of KR progress"
    - parent_progress: "Weighted average of children"
```

---

## Progress Tracking

### Progress Calculation
```yaml
progress:
  method: "weighted_average"
  
  weights:
    - kr1: 1
    - kr2: 2  # Doubled importance
    - kr3: 1
    
  formula: "(P1*W1 + P2*W2 + P3*W3) / (W1+W2+W3)"
```

### Weekly Progress Template
```markdown
## Weekly OKR Update - Week [N]

**Date:** [YYYY-MM-DD]
**Prepared by:** [@Name]

### Objective: [Title]
**Current Progress:** [X]%
**Confidence:** [Y]/10
**Trend:** 📈/📉/➡️

### KR Updates

#### KR1: [Title]
**Progress:** [X]%
**This Week:** [What happened]
**Next Week:** [What will happen]
**Blockers:** [Any blockers]

#### KR2: [Title]
**Progress:** [X]%
**This Week:** [What happened]
**Next Week:** [What will happen]
**Blockers:** [Any blockers]

### Linked Tasks Progress
| Task | KR | Status | This Week | Notes |
|------|----|--------|-----------|-------|
| [T1] | KR1 | ✅ | +30% | Completed |
| [T2] | KR1 | 🔄 | +20% | In progress |
| [T3] | KR2 | ⏳ | 0% | Waiting |
```

---

## OKR Check-in Automation

### Automation Rules
```yaml
automations:
  - name: "Weekly check-in reminder"
    trigger:
      type: scheduled
      schedule: "Monday 9:00 AM"
    action:
      create_task:
        title: "OKR Check-in - {[date]}"
        assignee: "{owner}"
        due_date: "+2d"
      notify: "{owner}"
      
  - name: "Progress update on task complete"
    trigger:
      type: task_completed
      filter: "linked_okrs exists"
    action:
      recalculate_okr_progress:
        okr: "{linked_okrs}"
      add_comment: "Task completed, OKR progress updated"

  - name: "At-risk alert"
    trigger:
      condition: "kr_progress < 25% AND week > 4"
    action:
      notify: "{owner}, {manager}"
      add_tag: "okr-at-risk"
      create_task: "OKR recovery plan"
```

---

## Example: Q2 2026 OKR Mapping

### Company OKR
```markdown
## Objective 1: Achieve 25% Revenue Growth

**Owner:** CEO
**Level:** Company
**Period:** Q2 2026

### Key Results
| KR | Description | Target | Owner |
|----|-------------|--------|-------|
| KR1 | Monthly Recurring Revenue | $625K | CFO |
| KR2 | New Enterprise Customers | 10 | VP Sales |
| KR3 | Customer Retention Rate | 92% | CSO |

### Cascade to Teams
| Team | Aligned OKRs | Primary KR |
|------|--------------|------------|
| Engineering | Platform reliability | KR3 |
| Product | User activation | KR1 |
| Sales | Enterprise deals | KR2 |
```

### Engineering Team OKR
```markdown
## Objective: Platform reliability 99.9% uptime

**Owner:** VP Engineering
**Level:** Team
**Parent:** Obj 1 - KR3
**Period:** Q2 2026

### Key Results
| KR | Description | Baseline | Target | Current |
|----|-------------|----------|--------|---------|
| KR1 | Platform uptime | 99.5% | 99.9% | 99.7% |
| KR2 | P95 latency | 250ms | <200ms | 210ms |
| KR3 | Incident MTTR | 60min | <30min | 45min |

### Project Mapping
| Project | Primary KR | Contribution |
|---------|-----------|-------------|
| DevOps Platform | KR1, KR3 | 60% |
| Auth Service | KR1 | 20% |
| Performance Optimization | KR2 | 20% |
```

### Individual OKR Example
```markdown
## Objective: Enable team to ship 25% faster

**Owner:** Alice (Tech Lead)
**Level:** Individual
**Parent:** Engineering Team OKR
**Period:** Q2 2026

### Key Results
| KR | Description | Target | Progress |
|----|-------------|--------|----------|
| KR1 | CI/CD pipeline improvements | 50% faster | 35% |
| KR2 | Code review process optimization | <4h avg | 3.5h |
| KR3 | Knowledge sharing sessions | 4 sessions | 2/4 |
```

### Progress Dashboard
```yaml
progress_dashboard:
  display:
    - objective_name
    - overall_progress
    - confidence_score
    - trend_arrow
    
  colors:
    - green: "> 70%"
    - yellow: "40-70%"
    - red: "< 40%"
```
