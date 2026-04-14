# Linear Bulk Tasks Template

> 批量创建和管理 Linear 任务的模板，包含批量操作的配置和示例。

---

## Bulk Task Creation Overview

### When to Use Bulk Creation
- Initial project setup
- Sprint planning
- Epic breakdown
- Routine task creation
- Migration from other tools

### Methods Available
| Method | Best For | Tool |
|--------|----------|------|
| Manual | 1-5 tasks | Linear UI |
| CSV Import | 10-50 tasks | Linear CSV |
| API Script | 50+ tasks | Linear API |
| Template | Repeated patterns | Linear Templates |

---

## CSV Import Template

### CSV Format
```csv
title,description,priority,estimate,labels,assignee,dueDate
"Task title","Description text",Medium,3,"feature,auth","alice","2026-04-20"
"Task title 2","Description text 2",High,5,"bug","bob","2026-04-22"
```

### Complete CSV Template
```csv
title,description,priority,estimate,labels,assignee,team,project,cycle
"[Title]","[Description]",[Priority],[Points],"[Labels]","[Assignee]","[Team]","[Project]","[Cycle]"
```

### CSV Field Reference
| Field | Required | Options | Default |
|-------|----------|---------|---------|
| title | ✅ | Text | — |
| description | ❌ | Text | — |
| priority | ❌ | No priority/Low/Medium/High/Urgent | No priority |
| estimate | ❌ | Number | None |
| labels | ❌ | Comma-separated | — |
| assignee | ❌ | Email or name | Unassigned |
| team | ❌ | Team ID | Default team |
| project | ❌ | Project ID | Unscoped |
| cycle | ❌ | Cycle ID | No cycle |
| dueDate | ❌ | YYYY-MM-DD | None |

---

## Bulk Task Scripts

### Python Script: Create Bulk Tasks
```python
#!/usr/bin/env python3
"""Bulk create tasks in Linear via API"""

import os
import requests

LINEAR_API = "https://api.linear.app/graphql"
API_KEY = os.environ.get("LINEAR_API_KEY")

HEADERS = {
    "Authorization": f"{API_KEY}",
    "Content-Type": "application/json"
}

TASKS = [
    {
        "title": "Implement user login form",
        "description": "Create login form with email/password fields",
        "priority": 3,  # Medium
        "estimate": 3,
        "labels": ["auth", "frontend"],
        "team_id": "TEAM_ID"
    },
    # Add more tasks...
]

def create_task(task_data):
    """Create a single task via Linear API"""
    mutation = """
    mutation TaskCreate($input: IssueCreateInput!) {
        issueCreate(input: $input) {
            success
            issue {
                id
                identifier
                title
            }
        }
    }
    """
    response = requests.post(
        LINEAR_API,
        json={"query": mutation, "variables": {"input": task_data}},
        headers=HEADERS
    )
    return response.json()

def bulk_create_tasks(tasks):
    """Create multiple tasks"""
    results = []
    for task in tasks:
        result = create_task(task)
        results.append(result)
    return results

if __name__ == "__main__":
    results = bulk_create_tasks(TASKS)
    print(f"Created {len(results)} tasks")
```

### Bash Script: CSV Import
```bash
#!/bin/bash
# Import tasks from CSV to Linear

CSV_FILE="tasks.csv"
API_KEY="your-api-key"

while IFS=, read -r title desc priority estimate labels assignee; do
    echo "Creating: $title"
    # Add Linear API call here
done < "$CSV_FILE"
```

---

## Batch Templates

### Template 1: Sprint Planning Batch
```yaml
# Sprint Planning Batch Template
sprint: "Sprint-24"
team: "[Team]"
start_date: "2026-04-14"
end_date: "2026-04-25"

issues:
  - title: "Story: User login with email/password"
    description: |
      As a user, I want to login with email/password
      So that I can access my account
      
      Acceptance Criteria:
      - [ ] Login with valid credentials succeeds
      - [ ] Login with invalid credentials shows error
    priority: High
    estimate: 5
    labels: ["auth", "feature"]

  - title: "Story: Password reset flow"
    description: |
      As a user, I want to reset my password
      So that I can regain access if I forget it
      
      Acceptance Criteria:
      - [ ] Reset link sent to email
      - [ ] Reset link expires after 24h
    priority: High
    estimate: 3
    labels: ["auth", "feature"]

  - title: "Tech Debt: Refactor auth middleware"
    description: "Refactor auth middleware to use new auth library"
    priority: Medium
    estimate: 5
    labels: ["tech-debt", "auth"]
```

### Template 2: Epic Breakdown Batch
```yaml
# Epic Breakdown Batch Template
epic: "AUTH-001"
epic_title: "User Authentication"
total_points: 35

stories:
  - title: "Story: User registration"
    points: 8
    dependencies: []

  - title: "Story: User login"
    points: 5
    dependencies: []

  - title: "Story: Password reset"
    points: 5
    dependencies: []

  - title: "Story: Social login (Google)"
    points: 8
    dependencies: ["User login"]

  - title: "Story: Two-factor authentication"
    points: 13
    dependencies: ["User login"]
    split_required: true

  - title: "Task: Security audit"
    points: 3
    dependencies: []
```

### Template 3: Bug Fix Batch
```yaml
# Bug Fix Batch Template
project: "[Project]"
severity: High

bugs:
  - title: "Bug: Login fails on Safari 17"
    description: |
      **Bug ID:** BUG-123
      
      **Description:** Users cannot login when using Safari 17
      
      **Steps to Reproduce:**
      1. Open Safari 17
      2. Navigate to login page
      3. Enter credentials
      4. Click login
      
      **Expected:** Login succeeds
      **Actual:** "Session error" message shown
    priority: Urgent
    labels: ["bug", "safari", "auth"]
    assignee: "@senior-dev"

  - title: "Bug: Password reset email not received"
    description: |
      **Bug ID:** BUG-124
      
      **Description:** Password reset email not sent to Gmail users
      
      **Steps to Reproduce:**
      1. Click "Forgot password"
      2. Enter Gmail address
      3. Submit
      
      **Expected:** Email received within 5 minutes
      **Actual:** No email received
    priority: High
    labels: ["bug", "email", "auth"]
    assignee: "@backend-dev"
```

---

## Bulk Update Operations

### Bulk Status Update
```yaml
# Move all "In Progress" to "In Review" for auth team
operations:
  - filter:
      project: "[Project]"
      labels: ["auth"]
      state: "In Progress"
      assignee: "@team
    action:
      set_state: "In Review"
      add_labels: ["needs-review"]
      notify: "#team"
```

### Bulk Reassignment
```yaml
operations:
  - filter:
      project: "[Project]"
      assignee: "@old-member"
    action:
      set_assignee: "@new-member"
      add_comment: "Reassigned due to team change"
```

### Bulk Label Management
```yaml
operations:
  - filter:
      project: "[Project]"
      title_contains: "DEPRECATED"
    action:
      add_labels: ["deprecated", "tech-debt"]
      set_priority: Low
```

---

## Linear API for Bulk Operations

### GraphQL Batch Mutation
```graphql
mutation BulkCreateIssues($issues: [IssueCreateInput!]!) {
  issueBatchCreate(issues: $issues) {
    success
    issues {
      id
      identifier
      title
    }
  }
}

# Variables
{
  "issues": [
    {
      "teamId": "TEAM_ID",
      "title": "Task 1",
      "priority": 3,
      "estimate": 3
    },
    {
      "teamId": "TEAM_ID",
      "title": "Task 2",
      "priority": 3,
      "estimate": 5
    }
  ]
}
```

---

## Example: Bulk Create Sprint 24 Tasks

### Using CSV
```csv
title,description,priority,estimate,labels,assignee,cycle
"Story: Login form UI","Create login form component",High,3,"auth,frontend","alice","Auth-Sprint-24"
"Story: Login API","Create login endpoint",High,5,"auth,backend","bob","Auth-Sprint-24"
"Story: Session management","Implement JWT session handling",High,5,"auth,backend","bob","Auth-Sprint-24"
"Task: Update auth docs","Update authentication documentation",Medium,2,"docs","charlie","Auth-Sprint-24"
"Tech Debt: Auth cleanup","Clean up old auth code",Medium,3,"tech-debt","alice","Auth-Sprint-24"
```

### Expected Result
| ID | Title | Points | Assignee |
|----|-------|--------|----------|
| AUTH-101 | Story: Login form UI | 3 | alice |
| AUTH-102 | Story: Login API | 5 | bob |
| AUTH-103 | Story: Session management | 5 | bob |
| AUTH-104 | Task: Update auth docs | 2 | charlie |
| AUTH-105 | Tech Debt: Auth cleanup | 3 | alice |
| **Total** | | **18 pts** | |

---

## Best Practices

### Bulk Creation
1. **Plan first** — Define all tasks before bulk creation
2. **Use templates** — Reuse patterns for consistency
3. **Validate CSV** — Check for errors before import
4. **Batch sizes** — Keep batches under 100 for performance
5. **Review after** — Verify all tasks created correctly

### Task Naming
- Use consistent prefix (Story:, Task:, Bug:, Tech Debt:)
- Include ticket ID in title if migrating
- Keep titles under 100 characters
- Use labels for categorization

### Priority Mapping
| Linear Priority | Numeric | Meaning |
|---------------|---------|---------|
| No priority | 0 | Backlog |
| Urgent | 1 | Critical |
| High | 2 | Important |
| Medium | 3 | Normal |
| Low | 4 | Low priority |
