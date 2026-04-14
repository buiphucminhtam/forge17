# Jira Definition of Done Template

> Jira 项目专用的 Definition of Done (DoD) 模板，包含自动化配置。

---

## Definition of Done Overview

### What is DoD?
> 团队一致同意的完成标准，确保每个交付物满足质量门槛。

**Why DoD matters:**
- Consistent quality across all work
- Clear expectations for everyone
- Reduced rework and bugs
- Faster sprint reviews

---

## Team Default DoD

### Core DoD (所有 Story 必填)

| # | Criteria | Jira Field | Verification |
|---|----------|------------|--------------|
| 1 | Code follows style guide | Labels: `#code-style` | CI check passes |
| 2 | Unit tests written | Test Coverage Report | Coverage ≥ 80% |
| 3 | Integration tests passing | CI Pipeline | All tests green |
| 4 | Code review approved | PR Approval | Min 1 approver |
| 5 | No critical/high bugs introduced | Bug Count | 0 new critical |
| 6 | Documentation updated | Confluence Link | Comment added |
| 7 | QA sign-off received | QA Approval | Comment from QA |
| 8 | PO acceptance confirmed | PO Approval | Comment from PO |

### Extended DoD (Feature Epics 必填)

| # | Criteria | Jira Field | Verification |
|---|----------|------------|--------------|
| 9 | Performance tested | Load Test Report | P95 < 200ms |
| 10 | Security reviewed | Security Sign-off | No Critical issues |
| 11 | Accessibility verified | A11y Check | WCAG AA |
| 12 | Migration scripts tested | DB Migration | All env pass |

---

## Jira DoD Implementation

### Method 1: Checklist Template (Sub-tasks)

#### For Each Story, Add Sub-tasks:
```yaml
[PROJ-XXX] Story Title
├── [PROJ-XXX.1] ☐ Code follows style guide
├── [PROJ-XXX.2] ☐ Unit tests written (≥80%)
├── [PROJ-XXX.3] ☐ Integration tests passing
├── [PROJ-XXX.4] ☐ Code review approved
├── [PROJ-XXX.5] ☐ No critical bugs introduced
├── [PROJ-XXX.6] ☐ Documentation updated
├── [PROJ-XXX.7] ☐ QA sign-off received
└── [PROJ-XXX.8] ☐ PO acceptance confirmed
```

#### Automation Rule
```yaml
name: "Auto-create DoD checklist"
trigger:
  type: issue_created
  filter: issuetype = Story
actions:
  - create_subtask: "Code follows style guide"
  - create_subtask: "Unit tests written (≥80%)"
  - create_subtask: "Integration tests passing"
  - create_subtask: "Code review approved"
  - create_subtask: "No critical bugs introduced"
  - create_subtask: "Documentation updated"
  - create_subtask: "QA sign-off received"
  - create_subtask: "PO acceptance confirmed"
```

### Method 2: Labels-Based DoD

```yaml
Labels to add when DoD complete:
  - #dod-complete
  - #qa-approved
  - #po-approved

Automation:
  trigger: All sub-tasks completed
  action: 
    - set labels: add #dod-complete
    - add comment: "✅ All DoD criteria met"
```

### Method 3: Custom Fields DoD

#### Create Custom Fields:
```
Field Name: DoD Status
Type: Radio Button
Options:
  - ☐ Not Started
  - 🔄 In Progress
  - ✅ Complete

Field Name: DoD Approvals
Type: Multi-select
Options:
  - ✅ Code Style
  - ✅ Unit Tests
  - ✅ Integration Tests
  - ✅ Code Review
  - ✅ QA Sign-off
  - ✅ PO Acceptance
```

---

## DoD by Issue Type

### Story DoD
```
☑ Acceptance criteria met
☑ Code complete
☑ Unit tests written
☑ Integration tests passing
☑ Code review approved
☑ No critical/high bugs
☑ Documentation updated
☑ QA sign-off
☑ PO acceptance
```

### Task DoD
```
☑ Technical implementation complete
☑ Code review approved
☑ Tests written
☑ Documentation updated
☑ Deployed to staging
```

### Bug DoD
```
☑ Bug reproduced and verified fixed
☑ Regression test added
☑ No side effects
☑ QA sign-off
☑ Deployed to production
```

### Sub-task DoD
```
☑ Specific sub-task complete
☑ Self-reviewed
☑ Checked in
```

---

## DoD Verification Comment Template

### Comment Format
```markdown
## ✅ Definition of Done Verification

**Story:** [PROJ-XXX]
**Completed by:** [@username]
**Date:** [YYYY-MM-DD]

### Core Criteria
- [x] Code follows style guide → CI: ✅
- [x] Unit tests ≥ 80% → Coverage: [X]%
- [x] Integration tests passing → 0 failures
- [x] Code review approved → [@approver]
- [x] No critical bugs → 0 critical, [N] high
- [x] Documentation updated → [Link]
- [x] QA sign-off → [@qa]
- [x] PO acceptance → [@po]

### Sign-offs
| Role | Name | Date |
|------|------|------|
| Developer | [@dev] | [Date] |
| Reviewer | [@reviewer] | [Date] |
| QA | [@qa] | [Date] |
| PO | [@po] | [Date] |
```

---

## DoD Automation Rules

### Rule 1: Prevent Done Without All Sub-tasks
```yaml
name: "Block Done if DoD incomplete"
trigger:
  type: status_changed
  to: Done
condition:
  - sub-tasks incomplete
actions:
  - set status: In Review
  - add comment: "❌ Cannot move to Done. Complete all DoD sub-tasks first."
```

### Rule 2: Auto-assign Reviewers
```yaml
name: "Auto-assign PR reviewers"
trigger:
  type: PR created
condition:
  - labels contains #needs-review
actions:
  - add reviewer: [@tech-lead]
  - add reviewer: [@peer-reviewer]
```

### Rule 3: DoD Completion Notification
```yaml
name: "Notify on DoD complete"
trigger:
  type: labels_added
  filter: labels = #dod-complete
condition:
  - status = Done
actions:
  - send notification to: [@po, @scrum-master]
  - add comment: "🎉 Story [PROJ-XXX] has completed all DoD criteria!"
```

---

## DoD Violations Tracking

### Jira Filter for Incomplete DoD
```jql
project = [PROJECT] 
AND issuetype = Story 
AND status = Done 
AND labels != dod-complete
ORDER BY updated DESC
```

### Violation Report
| Sprint | Story | Violation | Impact | Resolution |
|--------|-------|-----------|--------|------------|
| [N] | [PROJ-XXX] | [Missing test] | [Risk] | [Fixed by] |

---

## Team DoD Agreement

### Signatures

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Scrum Master | [Name] | [Date] | __________ |
| Tech Lead | [Name] | [Date] | __________ |
| QA Lead | [Name] | [Date] | __________ |
| PO | [Name] | [Date] | __________ |
| Developer 1 | [Name] | [Date] | __________ |
| Developer 2 | [Name] | [Date] | __________ |

### DoD Review Cadence
- **Sprint Review:** Review DoD effectiveness
- **Quarterly:** Major DoD updates
- **On-demand:** When issues arise

---

## Example: Complete DoD Entry

### Story: [AUTH-101] User Login

**Jira Issue Link:**
```
https://acme.atlassian.net/browse/AUTH-101
```

**DoD Sub-tasks:**
```
☑ AUTH-101.1 Code follows style guide (Alice)
☑ AUTH-101.2 Unit tests written (Alice)
☑ AUTH-101.3 Integration tests passing (Alice)
☑ AUTH-101.4 Code review approved (Bob)
☑ AUTH-101.5 No critical bugs introduced (Alice)
☑ AUTH-101.6 Documentation updated (Alice)
☑ AUTH-101.7 QA sign-off received (Carol)
☑ AUTH-101.8 PO acceptance confirmed (David)
```

**Final Comment:**
```markdown
## ✅ Definition of Done Complete

**Story:** AUTH-101 - User Login
**Developer:** @alice
**Date:** 2026-04-14

All 8 DoD criteria verified complete.
Test coverage: 87%
PR approved by: @bob
QA sign-off: @carol
PO acceptance: @david
```
