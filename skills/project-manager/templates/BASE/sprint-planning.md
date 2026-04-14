# Sprint Planning Template (Base)

> 工具无关的冲刺规划模板，适用于任何项目管理工具。

## Sprint Information

| Field | Value |
|-------|-------|
| **Sprint Name** | [Sprint Name] |
| **Duration** | [X weeks] |
| **Start Date** | [YYYY-MM-DD] |
| **End Date** | [YYYY-MM-DD] |
| **Team** | [Team Name] |
| **Scrum Master** | [Name] |
| **Product Owner** | [Name] |

---

## Sprint Goal

> 一句话描述本次冲刺的主要目标

[描述本次冲刺的核心目标，1-2句话]

---

## Team Capacity

### Team Members

| Member | Story Points | Availability | Notes |
|--------|---------------|--------------|-------|
| [Name] | [X pts] | [Full-time/Part-time] | [Notes] |
| [Name] | [X pts] | [Full-time/Part-time] | [Notes] |
| [Name] | [X pts] | [Full-time/Part-time] | [Notes] |

**Total Capacity:** [X] story points

### Capacity Notes
- [Any capacity constraints]
- [Holiday/leave planned]
- [External meetings overhead]

---

## Sprint Backlog

### Priority Matrix

| Priority | Story | Points | Assignee | Status |
|----------|-------|--------|----------|--------|
| P0 | [Story name] | [X] | [Name] | [Todo] |
| P0 | [Story name] | [X] | [Name] | [Todo] |
| P1 | [Story name] | [X] | [Name] | [Todo] |
| P1 | [Story name] | [X] | [Name] | [Todo] |
| P2 | [Story name] | [X] | [Name] | [Todo] |

### Points Summary

| Metric | Value |
|--------|-------|
| Committed | [X] pts |
| P0 items | [Y] pts |
| P1 items | [Z] pts |
| Buffer | [W] pts |

---

## Dependencies

### External Dependencies
| Dependency | Owner | Due Date | Status |
|------------|-------|----------|---------|
| [Dependency] | [Team/Person] | [Date] | [Blocked/At Risk/OK] |

### Internal Dependencies
| Story | Blocked By | Unblock Action |
|-------|------------|----------------|
| [Story] | [Dependency] | [Action] |

---

## Risks & Blockers

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| [Risk] | [High/Med/Low] | [High/Med/Low] | [Plan] |
| [Risk] | [High/Med/Low] | [High/Med/Low] | [Plan] |

---

## Definition of Done

- [ ] Code is complete and follows style guide
- [ ] Unit tests written and passing (≥80% coverage)
- [ ] Integration tests passing
- [ ] Code review approved by at least one peer
- [ ] Documentation updated (README, API docs, etc.)
- [ ] QA sign-off received
- [ ] Product Owner acceptance confirmed
- [ ] No critical/high bugs introduced

---

## Communication Plan

| Meeting | Day | Time | Duration | Owner |
|---------|-----|------|----------|-------|
| Daily Standup | [Days] | [Time] | 15 min | Scrum Master |
| Sprint Planning | [Day 1] | [Time] | 2 hrs | Scrum Master |
| Sprint Review | [Day 14] | [Time] | 1 hr | Product Owner |
| Sprint Retro | [Day 14] | [Time] | 1 hr | Scrum Master |

---

## Example

### Example Sprint: "User Authentication Sprint"

**Sprint Goal:** Complete user authentication flow including login, logout, and password reset.

| Member | Capacity |
|--------|----------|
| Alice | 13 pts (PTO on Day 5) |
| Bob | 15 pts |
| Charlie | 13 pts |

**Committed:** 35 pts (with 6 pts buffer)

**Key Stories:**
- US-101: User login with email/password (5 pts)
- US-102: User logout (2 pts)
- US-103: Password reset flow (5 pts)
- US-104: Session management (3 pts)
