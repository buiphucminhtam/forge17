# ClickUp Sprint Board Template

> 专为 ClickUp Sprint Board 设计的模板，包含看板配置和自动化规则。

---

## Sprint Board Overview

### Board Information
| Field | Value |
|-------|-------|
| **Space** | [Space Name] |
| **Folder** | [Folder Name] |
| **Board** | [Board Name] |
| **Sprint** | [Sprint Name] |
| **Duration** | [X weeks] |
| **Date Range** | [Start] - [End] |

### ClickUp Board URL
```
https://app.clickup.com/[workspace]/folder/[folder-id]/board/[board-id]
```

---

## Board Structure

### Default View Configuration
```yaml
view:
  type: board          # Board view
  group_by: status     # Group by status
  sort_by: priority    # Sort by priority
  filter_by:
    - sprint: "[Sprint Name]"
    - team: "[Team Name]"

columns:
  - name: "Backlog"
    color: "#878790"
    type: backlog
    collapse: false

  - name: "To Do"
    color: "#3b82f6"
    type: todo
    collapse: false

  - name: "In Progress"
    color: "#f59e0b"
    type: in_progress
    collapse: false

  - name: "In Review"
    color: "#a855f7"
    type: in_review
    collapse: false

  - name: "Done"
    color: "#22c55e"
    type: completed
    collapse: true
```

### Swimlanes
```yaml
swimlanes:
  - name: "By Priority"
    type: priority
    order: [Urgent, High, Medium, Low, None]

  - name: "By Assignee"
    type: assignee
    show_empty: true

  - name: "By Epic"
    type: tags
    filter: epic tags
```

---

## Sprint Planning Section

### Sprint Information
```markdown
## Sprint [N]: [Sprint Name]

**Goal:** [1-2 sentence objective]

**Team Capacity:**
| Member | Story Points | Availability |
|--------|-------------|--------------|
| [Name] | [X] pts | [Full-time] |
| [Name] | [X] pts | [80%] |
| [Name] | [X] pts | [PTO Apr 20] |

**Total Capacity:** [X] pts
**Committed:** [Y] pts
**Buffer:** [Z] pts

**Start Date:** [YYYY-MM-DD]
**End Date:** [YYYY-MM-DD]
```

---

## Task Card Templates

### Story Card Template
```markdown
## [STORY-XXX] Story Title

**Type:** Story
**Points:** [X]
**Priority:** [⬆️ Urgent/🟠 High/🟡 Medium/🟢 Low]
**Assignee:** [@Name]

### Description
As a [user type]
I want [goal]
So that [benefit]

### Acceptance Criteria
- [ ] AC1: [Criteria]
- [ ] AC2: [Criteria]
- [ ] AC3: [Criteria]

### Technical Notes
- [Notes]

### Dependencies
- [Depends on: STORY-XXX]

### Linked Tasks
- [Task 1]
- [Task 2]
```

### Bug Card Template
```markdown
## [BUG-XXX] Bug: Brief Description

**Type:** Bug
**Severity:** [🔴 Critical/🟠 High/🟡 Medium/🟢 Low]
**Assignee:** [@Name]

### Description
**Bug ID:** [BUG-XXX]

### Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Environment
- OS: [OS]
- Browser: [Browser]
- App Version: [Version]

### Screenshots
[Attach screenshots]

### Priority Justification
[Why this severity]
```

---

## Automation Rules

### Rule 1: Sprint Assignment
```yaml
name: "Auto-assign Sprint [N] tasks"
enabled: true

trigger:
  event: task_created
  filters:
    - folder: "[Folder Name]"
    - tags contains: "sprint-[n]"

actions:
  - set_assignee: "[Default Assignee]"
  - set_due_date: "[Sprint End Date]"
  - add_comment: "Added to Sprint [N]"
```

### Rule 2: Status-Based Actions
```yaml
rules:
  - name: "Notify on In Progress"
    trigger:
      status: "In Progress"
    actions:
      - notify_assignee: true
      - start_timer: true
      - add_comment: "Work started on {task.title}"

  - name: "Notify on Done"
    trigger:
      status: "Done"
    actions:
      - notify_team: "#team-wins"
      - add_comment: "✅ Completed: {task.title}"
      - archive_after: "7d"

  - name: "Blocker Alert"
    trigger:
      tags added: "blocked"
    actions:
      - notify_team: "#blockers"
      - notify_assignee: true
      - add_comment: "🚧 This task is blocked"
```

### Rule 3: Priority Escalation
```yaml
name: "Urgent priority escalation"
enabled: true

trigger:
  event: priority_changed
  filters:
    - priority: "Urgent"

actions:
  - notify_team: "#incidents"
  - add_tags: ["escalated", "needs-attention"]
  - set_due_date: "+1d"
  - add_comment: "🚨 Escalated to urgent: {task.title}"
```

### Rule 4: Sprint End Rules
```yaml
name: "Sprint end cleanup"
enabled: true

trigger:
  event: scheduled
  schedule: "Sprint End Date at 18:00"

actions:
  - for_each_task:
      filter: "status != Done AND sprint = [Sprint Name]"
    actions:
      - add_tags: ["carry-over"]
      - move_to: "Next Sprint"
      - add_comment: "Carried over from Sprint [N]"

  - create_task:
      title: "Sprint [N] Retrospective"
      folder: "[Folder]"
      assign_to: "@scrum-master"
      due_date: "+1d"
```

---

## Sprint Metrics

### Metrics to Track
```yaml
metrics:
  - name: "Velocity"
    type: points
    calculation: "completed_points / committed_points"

  - name: "Completion Rate"
    type: percentage
    calculation: "completed_tasks / total_tasks"

  - name: "Cycle Time"
    type: duration
    calculation: "Done Date - Start Date (avg)"

  - name: "Lead Time"
    type: duration
    calculation: "Done Date - Created Date (avg)"
```

### Sprint Burndown
| Day | Committed | Completed | Remaining | Ideal |
|-----|-----------|-----------|-----------|-------|
| 1 | 40 | 0 | 40 | 40 |
| 2 | 40 | 3 | 37 | 37 |
| 3 | 40 | 8 | 32 | 34 |
| 4 | 40 | 12 | 28 | 31 |
| 5 | 40 | 18 | 22 | 28 |
| 6 | 40 | 22 | 18 | 25 |
| 7 | 40 | 28 | 12 | 22 |
| 8 | 40 | 32 | 8 | 19 |

---

## Example: Sprint Board Setup

### Board Configuration
```yaml
space: "Platform Team"
folder: "Sprint 24"
board: "Sprint 24 - Auth Feature"

columns:
  - Backlog
  - To Do
  - In Progress
  - In Review
  - Done
```

### Sprint Goal
> Complete user authentication flow including login, logout, password reset, and 2FA support.

### Team Capacity
| Member | Available | Committed | Buffer |
|--------|-----------|-----------|--------|
| Alice | 13 pts | 11 pts | 2 pts |
| Bob | 15 pts | 13 pts | 2 pts |
| Charlie | 13 pts | 10 pts | 3 pts |

### Tasks on Board
| Column | Task | Points | Assignee |
|--------|------|--------|----------|
| Backlog | [Tasks if any] | — | — |
| To Do | AUTH-101: Login form | 3 | Alice |
| To Do | AUTH-105: Auth docs | 2 | Charlie |
| In Progress | AUTH-102: Login API | 5 | Alice |
| In Progress | AUTH-103: Password reset | 5 | Bob |
| In Review | AUTH-104: Session mgmt | 5 | Bob |
| Done | AUTH-100: Auth setup | 3 | Alice |

### Sprint Metrics
| Metric | Target | Actual |
|--------|--------|--------|
| Velocity | 34 pts | 32 pts (in progress) |
| Completion | 100% | 94% (projected) |
