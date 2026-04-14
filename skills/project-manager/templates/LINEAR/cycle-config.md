# Linear Cycle Configuration Template

> 专为 Linear Cycles 设计的配置模板，包含周期管理的最佳实践。

---

## Cycle Overview

### Cycle Information
| Field | Value |
|-------|-------|
| **Cycle Name** | [Cycle-Name] |
| **Project** | [Project Name] |
| **Start Date** | [YYYY-MM-DD] |
| **End Date** | [YYYY-MM-DD] |
| **Duration** | [X] weeks |
| **Status** | [Upcoming/Active/Completed] |

### Linear Cycle URL
```
https://linear.app/[workspace]/team/[team-id]/cycles/[cycle-id]
```

---

## Cycle Goals

### Primary Goal
> 一句话描述本次周期的核心目标

[Clear, measurable sprint goal]

### Success Metrics
| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| [Metric 1] | [Target] | [Current] | 🟢/🟡/🔴 |
| [Metric 2] | [Target] | [Current] | 🟢/🟡/🔴 |
| [Metric 3] | [Target] | [Current] | 🟢/🟡/🔴 |

---

## Capacity Planning

### Team Capacity Matrix
```yaml
capacity:
  team: "[Team Name]"
  total_points: [X]
  buffer: 15%              # Recommended buffer

members:
  - name: "[Name]"
    allocation: 100         # Percentage
    points_available: [X]
    PTO: [None/Dates]
    notes: "[Notes]"

  - name: "[Name]"
    allocation: 80
    points_available: [X]
    PTO: [None/Dates]
    notes: "[Notes]"
```

### Capacity Table
| Member | Allocation | Available Points | PTO | Notes |
|--------|------------|-----------------|-----|-------|
| [Name] | 100% | [X] | [None] | [Notes] |
| [Name] | 80% | [X] | [Apr 20-22] | Conference |
| [Name] | 50% | [X] | [None] | Part-time |

**Total Available:** [X] points
**Buffer:** [Y] points (15%)
**Committed:** [Z] points

---

## Issue Selection

### Selected Issues for Cycle

| Issue ID | Title | Points | Priority | Assignee | Labels |
|----------|-------|--------|----------|----------|--------|
| [AUTH-101] | [Title] | 5 | 🔴 Urgent | [@user] | [auth, login] |
| [AUTH-102] | [Title] | 3 | 🟠 High | [@user] | [auth, oauth] |
| [AUTH-103] | [Title] | 8 | 🟠 High | [@user] | [auth, 2fa] |
| [AUTH-104] | [Title] | 5 | 🟡 Medium | [@user] | [auth] |
| [AUTH-105] | [Title] | 3 | 🟡 Medium | [@user] | [docs] |

### Issues by Priority

#### Urgent Priority
```yaml
issues:
  - id: "[ISSUE-ID]"
    title: "[Title]"
    points: [X]
    reason: "[Why urgent]"
```

#### High Priority
```yaml
issues:
  - id: "[ISSUE-ID]"
    title: "[Title]"
    points: [X]
    reason: "[Why high]"
```

---

## Cycle Configuration

### Basic Settings
```yaml
cycle:
  name: "[Cycle-Name]"
  starts_at: "[YYYY-MM-DD]T00:00:00Z"
  ends_at: "[YYYY-MM-DD]T23:59:59Z"
  auto_scope: true           # Auto-add labeled issues
  auto_archive: true         # Auto-archive completed issues
```

### Advanced Settings
```yaml
settings:
  auto_add_issues: true       # Add issues when added to cycle
  set_issue_dates: true       # Set issue due dates to cycle dates
  mark_issue_end: true        # Mark issues past end date
  send_cycle_summary: true   # Send email summary on cycle end
```

---

## Cycle Automations

### Auto-Scope Rules
```yaml
rules:
  - name: "Auto-add auth issues to current cycle"
    trigger:
      event: issue_created
    condition:
      labels: ["auth", "login", "oauth"]
      state: "Backlog"
    action:
      add_to_cycle: "[Current Cycle]"
```

### Progress Notifications
```yaml
notifications:
  - trigger: "cycle_50_complete"
    channel: "#team"
    message: "[Cycle] is 50% complete! 🎉"

  - trigger: "cycle_90_complete"
    channel: "#team"
    message: "[Cycle] ending soon! Finish up: [Link]"

  - trigger: "cycle_incomplete_issues"
    channel: "#team"
    message: "[Cycle] ended with [N] incomplete issues"
```

---

## Cycle Metrics

### Velocity Data
```yaml
metrics:
  committed_points: [X]
  completed_points: [Y]
  carry_over_points: [Z]
  velocity: "[Y/X × 100]%"

  committed_issues: [A]
  completed_issues: [B]
  carry_over_issues: [C]
  completion_rate: "[B/A × 100]%"
```

### Burndown Data
| Day | Committed | Remaining | Ideal |
|-----|-----------|-----------|-------|
| 1 | [X] | [X] | [X] |
| 2 | [X] | [X-1] | [X-0.9] |
| 3 | [X] | [X-2] | [X-1.8] |
| 4 | [X] | [X-3] | [X-2.7] |
| 5 | [X] | [X-4] | [X-3.6] |
| ... | | | |

### Team Member Metrics
| Member | Assigned | Completed | Carry-over |
|--------|-----------|-----------|------------|
| [@user] | [X] pts | [Y] pts | [Z] pts |
| [@user] | [X] pts | [Y] pts | [Z] pts |

---

## Cycle Review Checklist

### Pre-Cycle Review
- [ ] Team capacity confirmed
- [ ] Issues properly scoped
- [ ] Dependencies identified
- [ ] Priority ordering confirmed
- [ ] Buffer time allocated
- [ ] Any PTO noted

### Mid-Cycle Review
- [ ] Progress on track?
- [ ] Blockers identified?
- [ ] Need to descope?
- [ ] Capacity changes?
- [ ] Dependencies resolved?

### Post-Cycle Review
- [ ] Velocity calculated
- [ ] Carry-over documented
- [ ] Retro action items created
- [ ] Lessons learned captured
- [ ] Next cycle prep started

---

## Example: Auth-Sprint-24

### Cycle Configuration
```yaml
cycle:
  name: "Auth-Sprint-24"
  starts_at: "2026-04-14"
  ends_at: "2026-04-25"
  auto_scope: true
  auto_archive: true
```

### Capacity
| Member | Available | Committed | Buffer |
|--------|-----------|-----------|--------|
| Alice | 13 pts | 11 pts | 2 pts |
| Bob | 15 pts | 13 pts | 2 pts |
| Charlie | 13 pts | 10 pts | 3 pts |
| **Total** | 41 pts | 34 pts | 7 pts |

### Goals
- **Primary:** Complete user login and password reset flows
- **Success:** Login completion rate > 95%, no critical auth bugs

### Selected Issues
| ID | Title | Points | Assignee |
|----|-------|--------|----------|
| AUTH-101 | User login form | 5 | Alice |
| AUTH-102 | Login API endpoint | 5 | Alice |
| AUTH-103 | Password reset flow | 8 | Bob |
| AUTH-104 | Session management | 5 | Bob |
| AUTH-105 | Auth docs update | 3 | Charlie |

### Mid-Cycle Check (Day 5)
| Status | Update |
|--------|--------|
| Completed | 18 pts (53%) |
| In Progress | 10 pts |
| Remaining | 6 pts |
| Blockers | None |
| Confidence | 🟢 High |

### Post-Cycle Review
| Metric | Value |
|--------|-------|
| Committed | 34 pts |
| Completed | 32 pts |
| Velocity | 94% |
| Carry-over | 2 pts (docs) |
| Retrospective | [Scheduled for Apr 25] |
