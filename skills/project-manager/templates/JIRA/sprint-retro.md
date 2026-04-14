# Jira Sprint Retrospective Template

> 专为 Jira 设计的冲刺回顾模板，包含 Jira 特定的格式和自动化配置。

---

## Sprint Information

| Field | Value |
|-------|-------|
| **Sprint** | [Sprint Name] |
| **Date** | [YYYY-MM-DD] |
| **Start Date** | [YYYY-MM-DD] |
| **End Date** | [YYYY-MM-DD] |
| **Team** | [Team Name] |
| **Scrum Master** | [@scrum-master] |
| **Sprint Link** | [Jira Sprint URL] |

---

## Sprint Metrics from Jira

### Velocity Data (JQL)
```jql
project = [PROJECT-KEY] AND sprint = "Sprint [N]"
```

### Sprint Report Metrics

| Metric | Value | Jira Source |
|--------|-------|-------------|
| **Committed Stories** | [N] | JQL count |
| **Committed Points** | [X] | Sum of story points |
| **Completed Stories** | [A] | `status = Done` |
| **Completed Points** | [B] | Sum of completed points |
| **Carry-over Stories** | [C] | `status != Done` |
| **Carry-over Points** | [D] | Sum of carry-over points |
| **Velocity** | [B/X × 100]% | Calculated |
| **Bugs Created** | [E] | `issuetype = Bug` |
| **Bugs Closed** | [F] | `issuetype = Bug AND status = Done` |

---

## Jira Sprint Burndown

### Burndown Data
| Day | Committed | Remaining | Ideal |
|-----|-----------|-----------|-------|
| Day 1 | 45 | 45 | 45 |
| Day 2 | 45 | 43 | 42 |
| Day 3 | 45 | 40 | 39 |
| Day 4 | 45 | 38 | 36 |
| Day 5 | 45 | 35 | 33 |
| ... | | | |

### Burndown Chart
```
Points
 ^
45| ●─────────────────────────────────────── Committed
  |    ╲
40|     ╲●─────────────────────────────── Actual
  |      ╲        ╲
35|       ╲●       ╲●──────────────────
  |         ╲           ╲
30|          ╲___________╲________ Ideal
  └──────────────────────────────────────→ Days
    1   2   3   4   5   6   7   8
```

---

## Start / Stop / Continue

### 🟢 What to START

| # | Practice | Why It Matters | Jira Reference | Owner | Sprint |
|---|----------|----------------|----------------|-------|--------|
| 1 | [New practice] | [Benefit] | [Epic/Issue] | [@name] | Sprint N+1 |
| 2 | [New practice] | [Benefit] | [Epic/Issue] | [@name] | Sprint N+1 |

### 🔴 What to STOP

| # | Practice | Why It Failed | Jira Evidence | Better Alternative |
|---|----------|---------------|---------------|---------------------|
| 1 | [Practice] | [Issue] | [Bug count, etc.] | [Alternative] |
| 2 | [Practice] | [Issue] | [Bug count, etc.] | [Alternative] |

### 🟡 What to CONTINUE

| # | Practice | Evidence in Jira | Why Keep |
|---|----------|-------------------|----------|
| 1 | [Practice] | [Successful stories] | [Reason] |
| 2 | [Practice] | [High velocity, low bugs] | [Reason] |

---

## What Went Well

### Top Performers
> Stories/issues that went exceptionally well

| Issue | What Worked | Points | Link |
|-------|-------------|--------|------|
| [PROJ-XXX] | [Description] | 5 | [Link] |
| [PROJ-XXX] | [Description] | 8 | [Link] |

### Team Shoutouts
> Recognition for team members

| Member | Shoutout | Linked Issue |
|--------|----------|-------------|
| [@user] | [Why they're recognized] | [PROJ-XXX] |
| [@user] | [Why they're recognized] | [PROJ-XXX] |

---

## What Didn't Go Well

### Problem Stories
> Stories that had issues or were blocked

| Issue | Problem | Root Cause | Lessons |
|-------|---------|------------|---------| 
| [PROJ-XXX] | [Description] | [Cause] | [Learn] |
| [PROJ-XXX] | [Description] | [Cause] | [Learn] |

### Bug Analysis
> Bugs created this sprint

| Bug Key | Title | Severity | Root Cause |
|---------|-------|----------|------------|
| [BUG-XXX] | [Title] | [High/Med/Low] | [Cause] |

**Bug Metrics:**
- Bugs Created: [N]
- Bugs Fixed: [M]
- Bug Escape Rate: [N/Committed × 100]%

---

## Action Items

### Jira Task Creation Format

| # | Action | Jira Issue Type | Project | Owner | Due | Priority |
|---|--------|----------------|---------|-------|-----|----------|
| 1 | [Specific action] | Sub-task | [PROJ] | [@user] | [Date] | P1 |
| 2 | [Specific action] | Task | [PROJ] | [@user] | [Date] | P2 |
| 3 | [Specific action] | Story | [PROJ] | [@user] | [Date] | P2 |

### Create Retro Action Items in Jira
```markdown
**Issue Type:** Task
**Summary:** Retro Action: [Action description]
**Project:** [PROJECT]
**Labels:** #retro #sprint-[N]
**Priority:** [P1/P2]
**Assignee:** [@user]
**Due Date:** [Date]

**Description:**
From Sprint [N] Retrospective:
- **Source:** What to [Start/Stop/Continue]
- **Action:** [Specific action to take]
- **Success Criteria:** [How we'll know it's done]
```

### Jira Automation for Action Items
```yaml
name: "Create Sprint Retro Project"
trigger:
  type: sprint_started
  filter: sprint = "Sprint [N]"
condition:
  - project = [PROJECT]
actions:
  - create_issue:
      project: [PROJECT]
      issuetype: Epic
      summary: "Sprint [N] Action Items"
      labels: add #retro-epic
  - add comment: "Retro action items will be tracked in this epic"
```

---

## Team Health Check

### Voting Results
> Use Jira Retrospective Gadget or Simple SVG Voting

| Category | Votes | Topic |
|----------|-------|-------|
| Start | [N] | [Topic] |
| Stop | [N] | [Topic] |
| Continue | [N] | [Topic] |

### Team Sentiment
| Sentiment | Count | Trend |
|-----------|-------|-------|
| 😊 Very Positive | [N] | ↑/↓/→ |
| 🙂 Positive | [N] | ↑/↓/→ |
| 😐 Neutral | [N] | ↑/↓/→ |
| 😟 Negative | [N] | ↑/↓/→ |
| 😠 Very Negative | [N] | ↑/↓/→ |

---

## Sprint Summary for Jira Comment

### Comment Template
```markdown
## Sprint Retrospective Summary - Sprint [N]

**Date:** [YYYY-MM-DD]
**Facilitator:** [@scrum-master]

### Metrics
- Velocity: [X] pts completed / [Y] pts committed ([X/Y × 100]%)
- Carry-over: [Z] pts
- Bugs: [E] created, [F] fixed

### Top 3 Actions for Next Sprint
1. [Action 1]
2. [Action 2]
3. [Action 3]

### Team Sentiment: [Positive/Neutral/Negative]

**Jira:** Sprint [N] retro actions will be tracked in [EPIC-XXX]

---
_Generated from Sprint Retrospective_
```

---

## Retro Board Configuration

### Jira Board Setup
```
Columns:
  - 🟢 Start
  - 🔴 Stop  
  - 🟡 Continue
  - ✅ Action Items

Quick Filters:
  - My Actions: assignee = currentUser() AND labels = #retro-action
  - This Sprint: labels = #retro AND created >= [sprint-start]
```

---

## Example: Sprint 24 Retrospective

### Metrics from Jira
| Metric | Sprint 23 | Sprint 24 | Trend |
|--------|-----------|-----------|-------|
| Committed | 40 pts | 45 pts | ↑ |
| Completed | 38 pts | 35 pts | ↓ |
| Velocity | 95% | 78% | ↓ |
| Bugs | 3 | 7 | ↑ |

### Action Items Created
```markdown
Issue: [PROJ-200] Retro Action: Implement code review time limit
Labels: #retro #sprint-24 #action
Priority: P2
Assignee: @bob
Due: 2026-04-21

Issue: [PROJ-201] Retro Action: Add edge cases to AC checklist
Labels: #retro #sprint-24 #action
Priority: P1
Assignee: @alice
Due: 2026-04-18
```

### Summary Comment
```markdown
## Sprint 24 Retrospective Complete

Team: Platform Team
Date: 2026-04-14

**What we learned:**
- Need better estimation for external API integration (took 2x)
- Code review should happen within 24 hours
- Adding more detail to AC reduces rework

**Actions for Sprint 25:**
1. Add edge case checklist to all stories (@alice)
2. Set up calendar reminder for code review (@bob)
3. Buffer external dependencies by 50% (@charlie)

**Team sentiment:** 🟢 Improved from last sprint

_Track all actions in [EPIC-024]_
```
