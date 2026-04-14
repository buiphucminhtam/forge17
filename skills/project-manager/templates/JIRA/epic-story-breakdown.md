# Jira Epic Story Breakdown Template

> 将 Epic 分解为可执行的 Stories，包含 Jira 特定的层级结构。

---

## Epic Information

| Field | Value |
|-------|-------|
| **Epic Key** | [EPIC-XXX] |
| **Epic Title** | [Epic Title] |
| **Project** | [PROJECT-KEY] |
| **Owner** | [Product Owner] |
| **Technical Lead** | [Tech Lead] |
| **Target Sprint** | [Sprint Number] |
| **Epic Link** | [Jira URL] |

---

## Epic Summary

### Business Context
> 描述 Epic 解决的业务问题和价值

[Why this epic exists and what business problem it solves]

### Success Criteria
| Criteria | Metric | Target |
|----------|--------|--------|
| [Criteria 1] | [Metric] | [Target] |
| [Criteria 2] | [Metric] | [Target] |

### Dependencies
| Dependency | Type | Owner | Status |
|------------|------|-------|--------|
| [External API] | External | [Team] | [Pending/Ready] |
| [Design System] | Internal | [Team] | [Pending/Ready] |

---

## Story Breakdown Structure

### L1: Epic (Parent)
```
[EPIC-XXX] - [Epic Title]
├─ Story count: [N]
├─ Total Points: [X]
├─ Timeline: [Weeks]
└─ Owner: [PO Name]
```

### L2: Features (Groups)
```
[FEATURE-1] User Authentication
├─ Stories: [N]
└─ Points: [X]

[FEATURE-2] User Authorization  
├─ Stories: [N]
└─ Points: [X]
```

### L3: User Stories (Leaf)

#### Story Template
```markdown
**Story Key:** [PROJ-XXX]
**Title:** As a [user type], I want [goal] so that [benefit]

**User Story:**
As a [who]
I want [what]
So that [why]

**Acceptance Criteria:**
- [ ] AC1: [Description with expected behavior]
- [ ] AC2: [Description]
- [ ] AC3: [Description]

**Technical Notes:**
- [Technical implementation details]
- [API endpoints needed]
- [Database changes required]

**Story Points:** [X]
**Priority:** [P0/P1/P2/P3]
**Labels:** [#feature, #auth, #api]
```

---

## Story Breakdown Table

### Feature 1: [Feature Name]

| Story Key | Title | Points | Priority | Assignee | Sprint |
|-----------|-------|--------|----------|----------|--------|
| [PROJ-101] | [Story title] | 5 | P1 | [@user] | Sprint 24 |
| [PROJ-102] | [Story title] | 3 | P1 | [@user] | Sprint 24 |
| [PROJ-103] | [Story title] | 8 | P1 | [@user] | Sprint 25 |
| [PROJ-104] | [Story title] | 5 | P2 | [@user] | Sprint 25 |

### Feature 2: [Feature Name]

| Story Key | Title | Points | Priority | Assignee | Sprint |
|-----------|-------|--------|----------|----------|--------|
| [PROJ-105] | [Story title] | 3 | P1 | [@user] | Sprint 24 |
| [PROJ-106] | [Story title] | 5 | P2 | [@user] | Sprint 26 |
| [PROJ-107] | [Story title] | 8 | P2 | [@user] | Sprint 26 |

---

## Jira Hierarchy Configuration

### Issue Links for Epic → Stories
```yaml
Type: "Parent Link"
# In Jira: Parent Link field or Epic Link field

Epic Link Field:
  - Links all stories to this epic
  - Shows in Epic Report
```

### Sub-task Breakdown (if needed)
```yaml
[PROJ-101] As user login story
├─ [PROJ-101.1] Create login API endpoint
├─ [PROJ-101.2] Create login UI component
├─ [PROJ-101.3] Write unit tests
├─ [PROJ-101.4] Write integration tests
└─ [PROJ-101.5] Update API documentation
```

---

## Story Mapping

### User Journey Mapping
```
[User Journey Step]
    ↓
[Epic]
    ↓
┌─────────────────────────────────────┐
│ Feature 1: Core Authentication     │
├─────────────────────────────────────┤
│ Story 1.1: Login Form               │
│ Story 1.2: Login API                │
│ Story 1.3: Session Management      │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ Feature 2: Password Management     │
├─────────────────────────────────────┤
│ Story 2.1: Password Reset           │
│ Story 2.2: Password Change          │
│ Story 2.3: Password Strength Check  │
└─────────────────────────────────────┘
```

---

## INVEST Criteria Check

### For Each Story

| Criteria | Description | ✅/❌ |
|----------|-------------|-------|
| **I**ndependent | Can be developed independently | ✅/❌ |
| **N**egotiable | AC can be discussed and refined | ✅/❌ |
| **V**aluable | Delivers value to user/stakeholder | ✅/❌ |
| **E**stimable | Can be estimated (not too vague) | ✅/❌ |
| **S**mall | Fits within 1 sprint | ✅/❌ |
| **T**estable | Can be verified as done | ✅/❌ |

---

## Story Dependencies

### External Dependencies
```yaml
- API: [External service API]
  Status: [Pending/Ready]
  Contact: [API team]

- Design: [Design system/UI kit]
  Status: [Pending/Ready]
  Contact: [Design team]
```

### Internal Dependencies
| Story | Depends On | Type |
|-------|------------|------|
| [PROJ-102] | [PROJ-101] | Must complete first |
| [PROJ-103] | [External API] | API availability |

---

## Progress Tracking

### Epic Progress
| Metric | Value |
|--------|-------|
| Total Stories | [N] |
| Stories Done | [X] |
| Stories In Progress | [Y] |
| Stories Remaining | [Z] |
| Total Points | [A] |
| Points Completed | [B] |
| Progress | [B/A × 100]% |

### Jira Gadget Configuration
```
Gadget: Epic Progress
Epic: [EPIC-XXX]
Show: Stories/Points
Breakdown: By Status
```

---

## Example: Epic Story Breakdown

### Epic: [AUTH-001] User Authentication

**Business Value:** Users can securely log in and manage their accounts.

### Story Breakdown

| Story | Title | Points | INVEST |
|-------|-------|--------|--------|
| [AUTH-101] | Login with email/password | 5 | ✅ |
| [AUTH-102] | Logout functionality | 2 | ✅ |
| [AUTH-103] | Password reset flow | 5 | ✅ |
| [AUTH-104] | Social login (Google) | 8 | ✅ |
| [AUTH-105] | Two-factor authentication | 13 | ❌ (Split needed) |

### Split Story: 2FA (Too Large)
```
[AUTH-105] Two-factor authentication (13 pts) → TOO LARGE

Split into:
├── [AUTH-105A] Enable 2FA in settings (3 pts)
├── [AUTH-105B] TOTP app integration (5 pts)
├── [AUTH-105C] SMS backup codes (3 pts)
└── [AUTH-105D] 2FA recovery flow (3 pts)
```
