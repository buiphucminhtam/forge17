# Jira Sprint Planning Template

> 专为 Jira 设计的冲刺规划模板，包含 Jira 特定的字段和配置。

---

## Epic Link

```
Epic Key: [EPIC-XXX]
Epic Title: [Epic Title]
Project: [PROJECT-KEY]
```

**Epic Link in Jira:**
```
https://[your-domain].atlassian.net/browse/[EPIC-XXX]
```

---

## Sprint Information

| Field | Value | Jira Field |
|-------|-------|------------|
| **Sprint Name** | [Sprint Name] | `Sprint` |
| **Duration** | [X weeks] | — |
| **Start Date** | [YYYY-MM-DD] | `Start Date` |
| **End Date** | [YYYY-MM-DD] | `Due Date` |
| **Sprint Goal** | [1-2 sentence objective] | `Sprint Goal` |
| **Scrum Master** | [Name] | `Scrum Master` |
| **Product Owner** | [Name] | `Product Owner` |

---

## Jira Issues Configuration

### Project Setup
```
Project: [PROJECT-KEY]
Issue Types:
  - Epic (Parent)
  - Story (User-facing features)
  - Task (Technical work)
  - Bug (Defects)
  - Sub-task (Breakdown of stories)
```

### Workflow States
```
Backlog → Ready → In Progress → In Review → Done
         ↓
      Cannot Reproduce (Bug only)
```

### Default Labels
```
#feature #tech-debt #bug #docs # infra
```

---

## Sprint Stories

### Story Breakdown

| Issue Key | Summary | Story Points | Assignee | Sprint | Priority |
|-----------|---------|--------------|----------|--------|----------|
| [PROJ-101] | [Title] | 5 | @user | Sprint 24 | P1 |
| [PROJ-102] | [Title] | 3 | @user | Sprint 24 | P2 |
| [PROJ-103] | [Title] | 8 | @user | Sprint 24 | P1 |
| [PROJ-104] | [Title] | 5 | @user | Sprint 24 | P2 |
| [PROJ-105] | [Title] | 2 | @user | Sprint 24 | P3 |

### Epic-Story Hierarchy
```
[EPIC-XXX] User Authentication
├── [PROJ-101] As user, I want to login with email/password
├── [PROJ-102] As user, I want to reset my password
├── [PROJ-103] As user, I want to use social login (Google)
└── [PROJ-104] As user, I want to enable 2FA
```

---

## Acceptance Criteria Mapping

| Story | Acceptance Criteria | Jira AC Link |
|-------|---------------------|--------------|
| [PROJ-101] | • Login with valid credentials succeeds<br>• Login with invalid credentials shows error<br>• Password field is masked | [Link to AC] |
| [PROJ-102] | • Reset link sent to registered email<br>• Reset link expires after 24h<br>• Password change requires new password | [Link to AC] |
| [PROJ-103] | • Google OAuth flow completes<br>• User profile created from Google data | [Link to AC] |

---

## Definition of Done Checklist

### In Jira Format
```
☐ Code follows project style guide
☐ Unit tests written (≥80% coverage)
☐ Integration tests passing
☐ Code review approved (min 1 approver)
☐ No new critical/high severity bugs
☐ Documentation updated in Confluence
☐ QA sign-off received
☐ Product Owner acceptance confirmed
☐ Labels updated: #done
☐ Sprint field cleared
```

### DoD as Jira Checklist (subtasks)
```
☑ Create unit tests
☑ Write integration tests
☑ Update documentation
☑ Add QA sign-off comment
☑ Get PO acceptance comment
```

---

## Jira-Specific Configuration

### Issue Links
```
blocks ←→ is blocked by
relates to ←→ is related to
duplicates ←→ is duplicated by
```

### Issue Fields to Populate
```yaml
- sprint: [Sprint Name]
- priority: [P0/P1/P2/P3]
- labels: [feature, auth, frontend]
- assignee: [@username]
- reporter: [@username]
- story_points: [number]
- sprint_goal_alignment: [yes/no]
```

### Jira Automations
```yaml
# Auto-transition on PR merge
trigger: PR merged to main
actions:
  - transition: In Review → Done
  - add comment: "Automatically closed via PR #{number}"
  - set labels: remove #in-progress, add #done

# Auto-assign bugs
trigger: Issue type = Bug
actions:
  - set assignee: [@tech-lead]
  - set priority: [Based on severity label]
  - add labels: #bug #needs-triage
```

---

## Velocity Tracking

### Jira JQL for Sprint Metrics
```jql
project = [PROJECT-KEY] AND sprint = [SPRINT-NUMBER]
```

### Velocity Report Data
| Metric | Value | Jira Query Result |
|--------|-------|-------------------|
| **Committed Stories** | [X] | `sprint = "Sprint 24" AND issuetype = Story` |
| **Committed Points** | [Y] | Sum of story points |
| **Completed Stories** | [A] | `sprint = "Sprint 24" AND status = Done` |
| **Completed Points** | [B] | Sum of completed points |
| **Carry-over Stories** | [C] | `sprint = "Sprint 24" AND status != Done` |
| **Velocity** | [B/Y × 100]% | Calculated |

---

## Jira Board Configuration

### Columns
```
To Do | In Progress | In Review | Done
(Backlog) (Development) (QA) (Shipped)
```

### Quick Filters
```
# My issues: assignee = currentUser()
# Blocked: statusCategory != Done AND labels = blocked
# Bugs: issuetype = Bug AND statusCategory != Done
# High priority: priority in (Highest, High)
```

### Swimlanes
```
Epic | No Epic | Ready for Sprint
```

---

## Example: Jira Sprint 24

**Epic:** [AUTH-001] User Authentication

**Sprint Goal:** Complete user authentication flow including login, logout, password reset, and social login options.

### Jira Issue Creation Example
```markdown
Issue Type: Story
Project: AUTH
Summary: As a user, I want to login with email/password
Description:
  As a [type of user]
  I want [goal]
  So that [benefit]
  
  **Acceptance Criteria:**
  - [ ] AC1: Login with valid credentials succeeds
  - [ ] AC2: Login with invalid credentials shows error message
  
Labels: #feature #auth #frontend
Story Points: 5
Sprint: Sprint 24
```

### Jira Automation Rule Example
```yaml
name: "Auto-assign Sprint 24 stories"
trigger:
  type: issue_created
  filter: project = AUTH AND labels = sprint-24
actions:
  - set assignee: [@oncall]
  - set sprint: Sprint 24
  - add comment: "Assigned to @oncall for Sprint 24"
```
