# Linear AI Triage Rules Template

> 专为 Linear AI Triage 设计的规则模板，包含自动分类和分配的规则配置。

---

## AI Triage Overview

### What is AI Triage?
> Linear AI 自动分析问题并执行操作（标记、分配、优先级）的规则系统。

### Triage Goals
- Reduce manual triage time
- Ensure consistent priority handling
- Route issues to right team members
- Flag issues requiring attention

### Key Components
| Component | Description |
|-----------|-------------|
| **Triggers** | Conditions that activate rules |
| **Conditions** | Filters for which issues apply |
| **Actions** | What to do when triggered |

---

## Auto-Assignment Rules

### Rule 1: Bug Auto-Assignment
```yaml
name: "Bug triage to QA"
enabled: true

trigger:
  event: issue_created
  filters:
    - labels contains "bug"

conditions:
  - type: label_match
    value: "bug"
  - type: severity
    value: ["high", "critical"]

actions:
  - type: assign
    target: "@qa-lead"
  - type: set_priority
    value: "High"
  - type: add_labels
    labels: ["needs-triage", "bug-triage"]
  - type: add_comment
    text: "🔍 Bug triaged by AI. Assigned to @qa-lead for severity assessment."
```

### Rule 2: Feature Auto-Assignment by Label
```yaml
name: "Feature routing by team"
enabled: true

trigger:
  event: issue_created
  filters:
    - labels contains ["frontend", "backend", "mobile"]

rules:
  - match:
      labels contains: "frontend"
    actions:
      - assign: "@frontend-lead"
      - add_project: "Frontend"
      - set_priority: "Medium"

  - match:
      labels contains: "backend"
    actions:
      - assign: "@backend-lead"
      - add_project: "Backend"
      - set_priority: "Medium"

  - match:
      labels contains: "mobile"
    actions:
      - assign: "@mobile-lead"
      - add_project: "Mobile"
      - set_priority: "Medium"
```

### Rule 3: Priority Escalation
```yaml
name: "Priority escalation rules"
enabled: true

trigger:
  event: issue_updated
  filters:
    - priority changed

escalations:
  - condition:
      priority: "Urgent"
    actions:
      - assign: "@oncall"
      - notify: "#incidents"
      - add_labels: ["critical", "escalated"]
      - set_due_date: "+1d"

  - condition:
      priority: "High"
      age_days: 3
    actions:
      - notify: "@team-lead"
      - add_labels: ["needs-attention"]

  - condition:
      priority: "High"
      age_days: 7
    actions:
      - notify: "#pm-alerts"
      - add_labels: ["stale-high-priority"]
```

---

## Auto-Labeling Rules

### Rule 4: Content-Based Labeling
```yaml
name: "AI content labeling"
enabled: true

trigger:
  event: issue_created
  OR: issue_updated

analyzers:
  - name: "Type detection"
    patterns:
      - "bug|error|crash|fail|broken" → add_labels: ["bug"]
      - "feature|add|new|implement" → add_labels: ["feature"]
      - "improve|optimize|refactor" → add_labels: ["improvement"]
      - "document|readme|docs" → add_labels: ["docs"]
      - "security|vulnerability|exploit" → add_labels: ["security"]
```

### Rule 5: Complexity Detection
```yaml
name: "Estimate complexity"
enabled: true

trigger:
  event: issue_created

analysis:
  - type: content_analysis
    input: description
    patterns:
      - complexity: "high"
        indicators: ["integrate", "multiple", "complex", "migration"]
      - complexity: "medium"
        indicators: ["api", "database", "service"]
      - complexity: "low"
        indicators: ["simple", "quick", "trivial"]

actions:
  - type: add_comment
    condition:
      complexity: "high"
    text: "⚠️ AI detected this issue may be complex. Consider breaking it down."
```

---

## Auto-Priority Rules

### Rule 6: Smart Priority
```yaml
name: "Smart priority assignment"
enabled: true

trigger:
  event: issue_created

priority_rules:
  - name: "Customer-reported issues"
    condition:
      source: "customer"
      OR: description contains ["customer", "user report", "production"]
    priority: "High"
    add_labels: ["customer-facing"]

  - name: "Security issues"
    condition:
      labels contains: "security"
    priority: "Urgent"
    add_labels: ["security-review"]

  - name: "Performance issues"
    condition:
      description contains: ["slow", "performance", "latency", "timeout"]
    priority: "High"
    add_labels: ["performance"]

  - name: "Tech debt prioritization"
    condition:
      labels contains: "tech-debt"
    priority: "Low"
    unless:
      labels contains: ["critical", "blocking"]
```

---

## Auto-Close Rules

### Rule 7: Duplicate Detection
```yaml
name: "Duplicate detection"
enabled: true

trigger:
  event: issue_created

duplicate_check:
  - type: similarity
    threshold: 0.8
    fields: ["title", "description"]

  - type: keyword_match
    keywords: ["duplicate", "same as", "already exists"]

actions:
  - type: add_comment
    text: "🤖 This issue may be a duplicate. Linking potential matches..."
  - type: link_related
    direction: "duplicate"
  - type: notify
    target: "@creator"
    text: "This issue may be a duplicate. Please verify."
```

### Rule 8: Auto-Close Resolved
```yaml
name: "Auto-close stale resolved issues"
enabled: true

trigger:
  event: scheduled
  schedule: "daily at 18:00"

filters:
  - state: "Done"
    age_days: 7
  - state: "Cancelled"
    age_days: 3

actions:
  - type: archive
  - type: add_labels
    labels: ["auto-archived"]
  - type: add_comment
    text: "📦 Auto-archived after 7 days in Done status"
```

---

## Notification Rules

### Rule 9: Smart Notifications
```yaml
name: "Context-aware notifications"
enabled: true

notifications:
  - trigger:
      condition:
        priority: "Urgent"
    channels:
      - "#incidents"
      - "@oncall"
    message: "🚨 Urgent issue created: {issue.title}"
    mention: true

  - trigger:
      condition:
        labels contains: "blocked"
    channels:
      - "#blockers"
    message: "🚧 Issue blocked: {issue.title}"
    mention_assignee: true

  - trigger:
      condition:
        assignee changed
    channels:
      - "@new_assignee"
    message: "📋 You've been assigned: {issue.title}"

  - trigger:
      condition:
        cycle ending
        issues_incomplete: true
    channels:
      - "#team"
    message: "⚠️ Cycle ending with {count} incomplete issues"
```

---

## Custom AI Triage Workflows

### Workflow 1: Bug Triage Flow
```yaml
name: "Bug triage workflow"
enabled: true

steps:
  1:
    - analyze: "severity from description"
    - check: "is customer reported?"
    - set_priority: ["Urgent" if customer else "High"]

  2:
    - assign: "@qa-lead"
    - add_labels: ["bug", "needs-triage"]

  3:
    - create_subtask: "Reproduce bug"
    - create_subtask: "Root cause analysis"
    - create_subtask: "Fix implementation"
    - create_subtask: "Regression test"

  4:
    - notify: ["#qa", "@assignee"]
    - message: "New bug triage: {issue.identifier}"
```

### Workflow 2: Feature Request Flow
```yaml
name: "Feature request workflow"
enabled: true

steps:
  1:
    - analyze: "user value from description"
    - check: "impact estimate"
    - add_labels: ["feature-request"]

  2:
    - assign: "@product-manager"
    - set_priority: "Medium"

  3:
    - add_comment:
        text: |
          📋 Feature Request Triage
          
          **Value Score:** {ai_analysis.score}/10
          **Complexity:** {ai_analysis.complexity}
          **Recommendation:** {ai_analysis.recommendation}

  4:
    - create_subtask: "Product evaluation"
    - create_subtask: "Technical feasibility"
    - create_subtask: "Competitive analysis"
```

---

## Triage Performance Metrics

### Metrics to Track
| Metric | Target | Current |
|--------|--------|---------|
| Issues triaged automatically | >80% | [N]% |
| Average triage time | <5 min | [N] min |
| Assignment accuracy | >90% | [N]% |
| Priority accuracy | >85% | [N]% |
| Manual intervention rate | <20% | [N]% |

### Triage Quality Review
```yaml
review:
  frequency: weekly
  sample_size: 20
  metrics:
    - correct_assignment_rate
    - correct_priority_rate
    - missed_escalations
    - false_positives

  action:
    if accuracy < 85%:
      - review rules
      - adjust conditions
      - add training examples
```

---

## Example: Complete Triage Configuration

### Configuration YAML
```yaml
# AI Triage Rules for Auth Team
version: "1.0"
team: "Auth"

rules:
  # Rule 1: All bugs go to QA
  - name: bug-to-qa
    trigger: issue_created
    condition: labels contains "bug"
    actions:
      - assign: "@alice"          # QA Lead
      - set_priority: "High"
      - add_labels: ["needs-triage", "bug"]

  # Rule 2: Auth labels route to auth team
  - name: auth-routing
    trigger: issue_created
    condition: labels contains "auth"
    actions:
      - assign: "@bob"            # Auth Lead
      - add_project: "Auth"

  # Rule 3: Security issues are critical
  - name: security-critical
    trigger: issue_created
    condition: labels contains "security"
    actions:
      - set_priority: "Urgent"
      - assign: "@security-team"
      - notify: "#security-alerts"
      - add_labels: ["security-review"]

  # Rule 4: Auto-close duplicates
  - name: duplicate-close
    trigger: scheduled
    schedule: "daily"
    condition: 
      - labels contains "duplicate"
      - state: "Done"
      - age_days: 3
    actions:
      - archive
```

### Effectiveness Report
| Metric | Week 1 | Week 2 | Week 3 |
|--------|--------|--------|--------|
| Auto-triaged | 45% | 72% | 85% |
| Avg triage time | 12 min | 6 min | 3 min |
| Accuracy | 78% | 88% | 93% |
| Team satisfaction | 🟡 | 🟢 | 🟢 |
