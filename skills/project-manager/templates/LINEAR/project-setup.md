# Linear Project Setup Template

> 专为 Linear 设计的项目初始化模板，包含 Linear 特定的配置和最佳实践。

---

## Project Details

### Basic Configuration
```yaml
name: "[Project Name]"
identifier: "[ID]"          # 3-5 chars, e.g., "AUTH", "PAYMENT"
icon: "[emoji]"              # Optional emoji
color: "[hex]"              # Hex color code
```

### Project Metadata
| Field | Value |
|-------|-------|
| **Project Name** | [Full Name] |
| **Identifier** | [ID] |
| **Description** | [Project purpose] |
| **Team** | [Primary team] |
| **Icon** | [Emoji] |
| **Color** | [Hex] |

### Linear Project URL
```
https://linear.app/[workspace]/[project-identifier]
```

---

## Cycles Configuration

### Cycle Settings
```yaml
cadence: biweekly          # Options: weekly, biweekly, monthly
start_day: Monday         # Day of week
start_time: "10:00 UTC"
auto_scope: true          # Auto-add issues to cycle based on labels
archive_on_complete: true
```

### Cycle Naming Convention
```yaml
format: "[Type]-[N]"      # e.g., "Sprint-24", "Q2-W1"

# Examples:
# - Sprint-24
# - Sprint-24-B
# - Q2-2026-Sprint-1
```

### Predefined Cycles
| Cycle Name | Start Date | End Date | Status |
|------------|------------|----------|--------|
| [Sprint-N] | [YYYY-MM-DD] | [YYYY-MM-DD] | [Active/Upcoming] |
| [Sprint-N+1] | [YYYY-MM-DD] | [YYYY-MM-DD] | [Upcoming] |
| [Sprint-N+2] | [YYYY-MM-DD] | [YYYY-MM-DD] | [Upcoming] |

---

## Workflow States

### Default States Configuration
```yaml
states:
  - name: Backlog
    color: "#878790"
    type: backlog
    position: 0

  - name: Ready
    color: "#3b82f6"
    type: triage
    position: 1

  - name: In Progress
    color: "#f59e0b"
    type: in_progress
    position: 2

  - name: In Review
    color: "#a855f7"
    type: in_review
    position: 3

  - name: Done
    color: "#22c55e"
    type: completed
    position: 4

  - name: Cancelled
    color: "#ef4444"
    type: cancelled
    position: 5
```

### State Transition Rules
```yaml
transitions:
  - from: Backlog
    to: [Ready, Cancelled]
    required_labels: []

  - from: Ready
    to: [In Progress, Backlog]
    required_labels: []

  - from: In Progress
    to: [In Review, Ready]
    required_labels: []

  - from: In Review
    to: [Done, In Progress]
    required_approval: true

  - from: Done
    to: [In Progress]        # Reopen
    require_reason: true
```

---

## Team Members

### Team Configuration
```yaml
members:
  - name: "[Name]"
    role: Lead               # Options: Lead, Contributor, Reviewer
    allocation: 100          # Percentage
    notifications: enabled

  - name: "[Name]"
    role: Contributor
    allocation: 80
    notifications: enabled
```

### Member Permissions
| Role | Create | Edit | Delete | Admin |
|------|--------|------|--------|-------|
| **Lead** | ✅ | ✅ | ✅ | ✅ |
| **Contributor** | ✅ | Own | ❌ | ❌ |
| **Reviewer** | Read | ❌ | ❌ | ❌ |

---

## Labels Configuration

### Label Structure
```yaml
labels:
  - name: "bug"
    color: "#ef4444"
    description: "Bug reports and defects"

  - name: "feature"
    color: "#22c55e"
    description: "New features and enhancements"

  - name: "tech-debt"
    color: "#f59e0b"
    description: "Technical debt items"

  - name: "urgent"
    color: "#dc2626"
    description: "Urgent priority items"

  - name: "blocked"
    color: "#6b7280"
    description: "Blocked by external dependency"

  - name: "needs-review"
    color: "#3b82f6"
    description: "Needs code review"

  - name: "docs"
    color: "#8b5cf6"
    description: "Documentation tasks"
```

---

## Issue Templates

### Standard Issue Template
```markdown
---
title: "[Issue Title]"
description: |
  **Problem:**
  [What problem this solves]

  **Solution:**
  [How to solve it]

  **Acceptance Criteria:**
  - [ ] AC1: [Criteria]
  - [ ] AC2: [Criteria]

  **Technical Notes:**
  - [Notes]

priority: [No priority/Low/Medium/High/Urgent]
labels: [feature, auth]
estimate: [Story points]
assignee: [@user]
---

## Discussion
[Internal notes and discussion]
```

### Bug Report Template
```markdown
---
title: "Bug: [Brief description]"
description: |
  **Bug ID:** [BUG-ID]

  **Description:**
  [Detailed description]

  **Steps to Reproduce:**
  1. [Step 1]
  2. [Step 2]
  3. [Step 3]

  **Expected Behavior:**
  [What should happen]

  **Actual Behavior:**
  [What actually happens]

  **Screenshots/Recordings:**
  [Attach media]

  **Environment:**
  - OS: [OS version]
  - Browser: [Browser version]
  - App version: [Version]

priority: [High/Urgent]
labels: [bug]
---

## Root Cause Analysis
[To be filled during investigation]
```

### Feature Request Template
```markdown
---
title: "Feature: [Brief description]"
description: |
  **Feature ID:** [FEATURE-ID]

  **Problem:**
  [Current pain point]

  **Proposed Solution:**
  [How it should work]

  **User Stories:**
  - As a [user type], I want [goal] so that [benefit]

  **Alternatives Considered:**
  [What else was tried or rejected]

  **Success Criteria:**
  - [ ] [Metric 1]
  - [ ] [Metric 2]

  **Priority Justification:**
  [Why this is important now]

labels: [feature]
estimate: [Story points]
---

## Implementation Notes
[To be filled by engineering]
```

---

## Priority Mapping

### Linear Priority Levels
| Level | Numeric | Label | SLA |
|-------|---------|-------|-----|
| **Urgent** | 0 | 🔴 Urgent | 4 hours |
| **High** | 1 | 🟠 High | 24 hours |
| **Medium** | 2 | 🟡 Medium | 1 week |
| **Low** | 3 | 🟢 Low | 2 weeks |
| **No Priority** | 4 | ⚪ None | Backlog |

### Priority Escalation Rules
```yaml
escalations:
  - trigger: "no_response_24h" AND priority = Urgent
    action: notify_team_channel

  - trigger: "no_response_48h" AND priority = High
    action: notify_lead

  - trigger: "cycle_end" AND priority != Done
    action: escalate_to_planning
```

---

## Linear Automations

### Auto-Assignment Rules
```yaml
rules:
  - name: "Auto-assign bugs to QA"
    trigger:
      type: issue_created
      filter: labels contains "bug"
    actions:
      - set_assignee: [@qa-lead]
      - set_priority: High

  - name: "Auto-assign based on label"
    trigger:
      type: issue_created
      filter: labels contains "frontend"
    actions:
      - set_assignee: [@frontend-lead]

  - name: "Auto-assign triage issues"
    trigger:
      type: issue_created
      filter: state = Backlog
    actions:
      - set_assignee: [@oncall]
      - add_comment: "Triaged by [Bot], assigned to @oncall"
```

### Notification Rules
```yaml
notifications:
  - trigger: issue_assigned
    channel: "#team-notifications"
    mention_assignee: true

  - trigger: issue_moved_to_done
    channel: "#wins"
    include_metrics: true

  - trigger: issue_un triaged_72h
    channel: "#pm-alerts"
    mention_team: true
```

---

## Example: Linear Auth Project Setup

### Configuration
```yaml
name: "Authentication Service"
identifier: "AUTH"
icon: "🔐"
color: "#3b82f6"

cycles:
  cadence: biweekly
  start_day: Monday
```

### Labels
```yaml
labels:
  - name: "login"
    color: "#22c55e"
  - name: "oauth"
    color: "#3b82f6"
  - name: "2fa"
    color: "#f59e0b"
  - name: "password"
    color: "#ef4444"
```

### Team
```yaml
members:
  - name: "Alice Chen"
    role: Lead
    allocation: 100
  - name: "Bob Smith"
    role: Contributor
    allocation: 100
  - name: "Carol Wu"
    role: Contributor
    allocation: 50
```
