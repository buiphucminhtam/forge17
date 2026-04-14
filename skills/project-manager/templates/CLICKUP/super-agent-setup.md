# ClickUp Super Agent Setup Template

> 专为 ClickUp 的 AI Teammate / Super Agent 功能设计的配置模板。

---

## Super Agent Overview

### What is ClickUp Super Agent?
> ClickUp Brain 的 AI Teammate 功能，可以创建专门的 AI Agent 来处理特定的工作流程和任务。

### Configuration URL
```
https://app.clickup.com/[workspace]/settings/ai/teammates
```

---

## Agent Configuration

### Basic Agent Setup
```yaml
agent:
  name: "[Agent Name]"
  role: "[Function/Role]"
  avatar: "[emoji or image]"
  color: "[hex]"              # Agent color theme

  description: |
    [One-sentence description of what this agent does]

  capabilities:
    - [capability 1]
    - [capability 2]
    - [capability 3]
```

### Agent Role Types
```yaml
roles:
  - name: "Project Manager Agent"
    description: "Manages sprints, tracks OKRs, generates reports"
    capabilities:
      - sprint_planning
      - okr_tracking
      - progress_reporting
      - blocker_escalation

  - name: "QA Agent"
    description: "Manages bug triage, tracks test coverage"
    capabilities:
      - bug_triage
      - test_coverage_tracking
      - regression_detection
      - quality_reporting

  - name: "DevOps Agent"
    description: "Manages deployments, monitors health"
    capabilities:
      - deployment_tracking
      - incident_management
      - health_monitoring
      - oncall_escalation

  - name: "Marketing Agent"
    description: "Manages campaigns, tracks metrics"
    capabilities:
      - campaign_tracking
      - content_calendar
      - analytics_reporting
      - lead_management
```

---

## Agent Memory & Context

### Memory Configuration
```yaml
memory:
  enabled: true
  retention: 90days

  sources:
    - type: "team_processes"
      description: "How we do things"
      examples:
        - "Sprint planning happens every Monday at 10am"
        - "PRs require 2 approvals before merge"
        - "Critical bugs need immediate escalation"

    - type: "priority_guidelines"
      description: "How we prioritize"
      examples:
        - "P0 = Production down, customer impacted"
        - "P1 = Feature blocked, no workaround"
        - "P2 = Feature impacted, workaround exists"

    - type: "escalation_rules"
      description: "When to escalate"
      examples:
        - "Escalate to lead if no progress in 48h"
        - "Escalate to management if deadline at risk"
        - "Escalate to CEO for revenue-impacting issues"
```

### Context Injection
```yaml
context:
  project_context:
    - name: "Current Sprint"
      data: "Sprint 24 - Auth Feature"
    - name: "Team"
      data: "Platform Team"
    - name: "Key Dates"
      data: "Sprint ends Apr 25, Release May 1"

  team_members:
    - name: "Alice"
      role: "Tech Lead"
      contact: "@alice"
    - name: "Bob"
      role: "Senior Engineer"
      contact: "@bob"
```

---

## Agent Capabilities

### Capability 1: Sprint Management Agent

```yaml
agent:
  name: "Sprint Bot"
  role: "Sprint Manager"
  description: "Manages sprint lifecycle and tracks progress"

capabilities:
  - name: "Sprint Planning"
    trigger: "keyword:sprint plan"
    actions:
      - analyze_capacity
      - suggest_task_selection
      - create_sprint_board
      - set_sprint_goal

  - name: "Progress Tracking"
    trigger: "keyword:status, progress"
    actions:
      - calculate_velocity
      - generate_burndown
      - identify_risks
      - suggest_adjustments

  - name: "Sprint Reporting"
    trigger: "keyword:report, summary"
    actions:
      - generate_sprint_report
      - calculate_metrics
      - identify_wins
      - create_action_items
```

### Capability 2: Bug Triage Agent

```yaml
agent:
  name: "Bug Bot"
  role: "Bug Triage Specialist"
  description: "Automatically triages and routes bugs"

capabilities:
  - name: "Auto-Triage"
    trigger: "issue_created, type=bug"
    actions:
      - analyze_severity
      - assign_priority
      - route_to_qa
      - create_subtasks

  - name: "Severity Classification"
    rules:
      - pattern: "crash, freeze, data loss"
        severity: "Critical"
        assign_to: "@senior-dev"
        notify: "#incidents"

      - pattern: "error, failed, broken"
        severity: "High"
        assign_to: "@on-call"

      - pattern: "wrong, incorrect, not working"
        severity: "Medium"
        assign_to: "@team"

  - name: "Duplicate Detection"
    enabled: true
    threshold: 0.7
    action: "link_duplicates"
```

---

## Workflow Configuration

### Workflow 1: Feature Request Flow

```yaml
workflow:
  name: "Feature Request Handler"
  trigger:
    type: "task_added"
    filter: "tags contains feature-request"

steps:
  1:
    name: "Initial Analysis"
    agent: "Sprint Bot"
    actions:
      - analyze_request
      - score_value
      - estimate_complexity
      - add_comment: "Analyzed by [Agent]: Value={score}/10"

  2:
    name: "Technical Review"
    agent: "Tech Lead Bot"
    actions:
      - review_feasibility
      - identify_dependencies
      - estimate_effort
      - set_priority_recommendation

  3:
    name: "Product Review"
    agent: "PM Bot"
    actions:
      - validate_business_value
      - check_strategic_alignment
      - set_priority
      - create_work breakdown

  4:
    name: "Notification"
    actions:
      - notify_team: "#feature-requests"
      - create_task: "Technical Review"
      - create_task: "Product Review"
```

### Workflow 2: Incident Management Flow

```yaml
workflow:
  name: "Incident Response"
  trigger:
    type: "task_created"
    filter: "tags contains incident, priority=urgent"

steps:
  1:
    name: "Instant Alert"
    actions:
      - notify_channel: "#incidents"
      - mention: "@on-call"
      - add_tag: "active-incident"
      - set_priority: "Urgent"

  2:
    name: "Triage"
    agent: "DevOps Bot"
    actions:
      - analyze_impact
      - identify_cause
      - recommend_fix
      - update_status

  3:
    name: "Coordination"
    actions:
      - create_incident_channel
      - assign_incident_commander
      - set_status_channel

  4:
    name: "Resolution Tracking"
    actions:
      - track_time_to_resolve
      - document_timeline
      - create_postmortem_task
```

---

## Agent Collaboration

### Inter-Agent Communication
```yaml
collaboration:
  rules:
    - from: "Bug Bot"
      to: "Sprint Bot"
      message: "Bug triaged, need capacity planning"

    - from: "Sprint Bot"
      to: "PM Bot"
      message: "Sprint velocity concerns, review scope"

    - from: "PM Bot"
      to: "Sprint Bot"
      message: "New priority items added to backlog"
```

### Handoff Rules
```yaml
handoffs:
  - from: "Bug Bot"
    condition: "severity = Critical"
    to: "Incident Manager"
    action: "create_incident"

  - from: "Sprint Bot"
    condition: "sprint_incomplete > 30%"
    to: "PM Bot"
    action: "request_scope_review"

  - from: "QA Bot"
    condition: "regression_detected"
    to: "DevOps Bot"
    action: "trigger_deployment_hold"
```

---

## Example: PM Agent Configuration

### Agent Definition
```yaml
agent:
  name: "PM Bot"
  role: "Product Manager"
  avatar: "📋"
  color: "#3b82f6"

  description: "Manages sprints, tracks OKRs, and coordinates team communication"

  memory:
    team_processes:
      - "Weekly sprint planning: Monday 10am"
      - "Daily standups: 9:30am"
      - "Retrospectives: Bi-weekly Friday 3pm"

    priority_meanings:
      - "P0: Customer blocking, revenue impact"
      - "P1: Feature blocked, no workaround"
      - "P2: Feature impact, workaround exists"
      - "P3: Nice to have"

  capabilities:
    - sprint_management
    - okr_tracking
    - report_generation
    - meeting_scheduling
    - stakeholder_communication
```

### Active Workflows
| Workflow | Trigger | Actions |
|----------|---------|---------|
| Sprint Planning | Weekly (Monday) | Capacity check, story selection |
| Daily Digest | Daily (8am) | Generate team update |
| Weekly Report | Weekly (Friday) | Sprint summary, OKR update |
| Blocker Escalation | On demand | Alert appropriate team |

### Sample Interaction
```markdown
User: "PM Bot, sprint 24 is at risk"

PM Bot Response:
## 🚨 Sprint Health Alert

**Sprint:** Sprint 24 - Auth Feature
**Health Status:** 🔴 At Risk

### Analysis
- **Completion Rate:** 65% (target: 80%)
- **Days Remaining:** 3
- **At Risk Tasks:** 5

### Recommendations
1. **Descope:** Move AUTH-106 (2FA) to Sprint 25
2. **Add Resources:** Consider pair programming on AUTH-105
3. **Reduce Scope:** Defer auth docs update

### Recommended Action
[Propose sprint scope adjustment for your review]

Would you like me to:
- Create task to move AUTH-106?
- Notify team about scope review?
- Generate detailed risk report?
```

---

## Best Practices

### Agent Setup Tips
1. **Start Simple** — Begin with 1-2 capabilities
2. **Train with Examples** — Provide real context
3. **Monitor Accuracy** — Review outputs regularly
4. **Iterate Quickly** — Adjust based on feedback

### Memory Management
- Keep memory current (quarterly review)
- Use specific examples over general rules
- Document team-specific conventions
- Clear outdated information
