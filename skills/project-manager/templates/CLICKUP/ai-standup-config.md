# ClickUp AI Standup Config Template

> 专为 ClickUp AI Standup 功能设计的配置模板，包含团队站立会议自动化。

---

## AI Standup Overview

### What is ClickUp AI Standup?
> ClickUp Brain 的 AI 驱动站立会议功能，自动收集团队更新、生成摘要和识别 blockers。

### Configuration URL
```
https://app.clickup.com/[workspace]/settings/ai/standups
```

---

## Standup Configuration

### Basic Settings
```yaml
standup:
  name: "[Team] Daily Standup"
  schedule:
    frequency: daily          # daily, weekly
    day: [Monday-Friday]
    time: "09:30"
    timezone: "UTC"

  format:
    type: async             # async, sync
    response_window: "2h"   # Time for team to respond

  channels:
    primary: "#standups"
    summary: "#team-updates"
    blockers: "#blockers"
```

### Team Configuration
```yaml
team:
  name: "[Team Name]"
  members:
    - name: "[Name]"
      slack: "@user"
      timezone: "[TZ]"
      role: "lead"
      required: true

    - name: "[Name]"
      slack: "@user"
      timezone: "[TZ]"
      role: "member"
      required: true

  working_days:
    - Monday
    - Tuesday
    - Wednesday
    - Thursday
    - Friday

  holidays:
    - "[Country]: [Dates]"
```

---

## Standup Questions

### Default Questions Template
```markdown
## Daily Standup Questions

### Question 1: Yesterday
**Question:** "What did you accomplish yesterday?"
**AI Prompt:** "Summarize accomplishments, highlight if any PRs merged or tasks completed"
**Required:** true
**Format:** bullet_points

### Question 2: Today
**Question:** "What are you working on today?"
**AI Prompt:** "List main tasks, estimate time allocation"
**Required:** true
**Format:** bullet_points

### Question 3: Blockers
**Question:** "Any blockers or concerns?"
**AI Prompt:** "Flag any blockers, auto-escalate if high priority"
**Required:** false
**Format:** free_text

### Question 4: Notes (Optional)
**Question:** "Any additional notes?"
**AI Prompt:** "Capture context without flagging"
**Required:** false
**Format:** free_text
```

### Custom Questions by Team
```yaml
questions:
  team: "Engineering"
  prompts:
    - q1: "What did you ship yesterday?"
      format: "links"          # Auto-format PR links
      ai_analysis: "velocity"

    - q2: "What will you ship today?"
      format: "checkboxes"
      ai_analysis: "commitment"

    - q3: "Any blockers?"
      format: "boolean"
      if_blocker: "open_text"

    - q4: "Code review queue size?"
      format: "number"
      track_trend: true

  team: "Product"
  prompts:
    - q1: "What user insights did you gather?"
    - q2: "What decisions need stakeholder input?"
    - q3: "Any scope changes to flag?"

  team: "Design"
  prompts:
    - q1: "What designs were completed/started?"
    - q2: "Any assets ready for handoff?"
    - q3: "Feedback needed from who?"
```

---

## AI Processing Rules

### AI Analysis Configuration
```yaml
ai:
  enabled: true
  features:
    - summary_generation
    - blocker_detection
    - duplicate_detection
    - sentiment_analysis
    - commitment_tracking

  summary:
    format: "markdown"
    sections:
      - highlights
      - blockers
      - cross_team_dependencies
      - wins

  sentiment:
    track: true
    alert_threshold: 3     # Negative sentiment count
    action: "notify_lead"
```

### Blocker Detection
```yaml
blocker_detection:
  enabled: true
  sensitivity: "medium"     # low, medium, high

  keywords:
    - "blocked"
    - "can't"
    - "stuck"
    - "waiting on"
    - "dependent on"
    - "need help"
    - "unclear"

  actions:
    - type: "auto_flag"
      add_tag: "blocker"
      priority: "High"

    - type: "notify"
      channel: "#blockers"
      mention_assignee: true

    - type: "create_issue"
      template: "blocker_ticket"
      assign_to: "blocker_owner"
```

---

## Standup Format Options

### Format 1: Quick Sync
```yaml
format: quick_sync
duration: 5 minutes
questions:
  - "What did you do?"
  - "What are you doing?"
  - "Any blockers?"

display: "compact"
```

### Format 2: Detailed Async
```yaml
format: detailed_async
response_window: 3 hours
questions:
  - "Yesterday's wins"
  - "Today's focus"
  - "Blockers"
  - "Help needed"
  - "FYIs"

display: "detailed"
include_progress_bars: true
```

### Format 3: Metric-Focused
```yaml
format: metrics_focused
questions:
  - "PRs merged yesterday: [N]"
  - "Tasks completed: [N]"
  - "Hours in meetings: [N]"
  - "Any blockers?"

display: "metrics_dashboard"
auto_calculate: true
```

---

## Automation Rules

### Rule 1: Standup Reminders
```yaml
name: "Standup reminder"
enabled: true

trigger:
  event: scheduled
  schedule: "Daily at 09:00"

actions:
  - send_message:
      channel: "#standups"
      message: |
        📋 Daily Standup Time!
        
        Share your update in the standup thread.
        
        Questions:
        1️⃣ What did you accomplish?
        2️⃣ What are you working on?
        3️⃣ Any blockers?

  - create_reminder:
      title: "Complete standup"
      remind_at: "09:30"
      assignee: "@all"
```

### Rule 2: Late Response Follow-up
```yaml
name: "Late response follow-up"
enabled: true

trigger:
  event: scheduled
  schedule: "Daily at 10:30"

conditions:
  - standup_active: true
  - member_response: false

actions:
  - send_reminder:
      channel: "#standups"
      mention: "@user"
      message: "👋 Don't forget to complete your standup update!"
```

### Rule 3: Summary Distribution
```yaml
name: "Distribute standup summary"
enabled: true

trigger:
  event: scheduled
  schedule: "Daily at 10:00"

conditions:
  - all_required_members_responded: true
  - standup_closed: true

actions:
  - generate_summary:
      channel: "#team-updates"
      format: "markdown"
      include:
        - highlights
        - blockers
        - action_items

  - archive_standup: true
```

---

## Summary Template

### AI-Generated Summary Format
```markdown
## 📋 [Team] Standup Summary - [Date]

**Generated by:** ClickUp AI
**Participants:** [@user1, @user2, @user3]

### 🎉 Highlights
- [Highlight 1]
- [Highlight 2]
- [Highlight 3]

### 🔄 In Progress
| Member | Task | Progress |
|--------|------|----------|
| [@user] | [Task] | 60% |
| [@user] | [Task] | 30% |

### 🚧 Blockers
| Blocker | Owner | Action |
|---------|-------|--------|
| [Blocker 1] | @user | [Action] |
| [Blocker 2] | @user | [Action] |

### 📊 Metrics
- **PRs Merged:** [N]
- **Tasks Completed:** [N]
- **Blockers Opened:** [N]
- **Blockers Resolved:** [N]

### ⏭️ Next Steps
- [Action 1]
- [Action 2]

---
_Generated at [HH:MM]_
```

---

## Example: Engineering Team Standup

### Configuration
```yaml
standup:
  name: "Platform Engineering Daily"
  schedule:
    frequency: daily
    day: Monday-Friday
    time: "09:30"
    timezone: "America/Los_Angeles"

  team:
    - alice
    - bob
    - charlie
    - diana

  channels:
    primary: "#eng-standups"
    summary: "#eng-updates"
    blockers: "#eng-blockers"
```

### Questions
1. What did you ship yesterday? (with PR links)
2. What are you working on today?
3. Any blockers or dependencies?
4. Need any code reviews?

### Sample AI Summary
```markdown
## 📋 Platform Engineering Standup - Apr 14, 2026

**Participants:** Alice, Bob, Charlie, Diana

### 🎉 Highlights
- Alice merged authentication refactor (AUTH-201)
- Bob shipped password reset flow
- Charlie completed API rate limiting

### 🔄 In Progress
| Member | Task | Status |
|--------|------|--------|
| Alice | 2FA implementation | 40% |
| Bob | Session management | 60% |
| Charlie | Security audit | 20% |
| Diana | QA testing auth flow | — |

### 🚧 Blockers
| Blocker | Owner | Action |
|---------|-------|--------|
| Waiting on design specs for 2FA UI | Alice | @design-team |
| Need Stripe API access for payment testing | Bob | @devops |

### 📊 Quick Stats
- PRs Merged: 3
- Tasks Completed: 5
- Active Blockers: 2 (both being addressed)

### ⏭️ Next Steps
- Alice: Review 2FA design by EOD
- Bob: Test payment flow with Stripe
- Charlie: Continue security audit
- Diana: Complete auth regression testing
```
