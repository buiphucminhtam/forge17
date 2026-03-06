# HARDEN Phase — Dispatcher

This phase manages tasks T5 (QA), T6a (Security), T6b (Code Review). Sequential execution with authority boundaries.

## Authority Boundaries — CRITICAL

Enforce these boundaries strictly:
- **security-engineer** is SOLE authority on OWASP Top 10, STRIDE, PII, encryption
- **code-reviewer** does architecture conformance, code quality, performance — does NOT perform security review
- **code-reviewer** is READ-ONLY — produces findings and patch files, does NOT modify source code
- See `Antigravity-Production-Grade-Suite/.protocols/conflict-resolution.md` for full authority table

## T5: QA Testing

```
Update task.md: T5 status → in_progress

Read skills/qa-engineer/SKILL.md and follow its instructions.
Context:
- Read implementation: services/, frontend/ (if exists), api/
- Read protocols from: Antigravity-Production-Grade-Suite/.protocols/
- Read .production-grade.yaml for paths.tests and paths.services.
- Write tests to project root: tests/
- Write workspace artifacts to: Antigravity-Production-Grade-Suite/qa-engineer/
- Run integration, e2e, and performance tests.
- Distinguish test bugs (fix immediately) from implementation bugs (log as findings).

Update task.md: T5 status → completed
```

## T6a: Security Audit (SOLE OWASP AUTHORITY)

```
Update task.md: T6a status → in_progress

Read skills/security-engineer/SKILL.md and follow its instructions.
Context:
- SOLE authority on OWASP, STRIDE, PII, encryption.
- No other skill performs security review. This is YOUR exclusive domain.
- Read all implementation code: services/, frontend/, infrastructure/
- Read protocols from: Antigravity-Production-Grade-Suite/.protocols/
- Perform STRIDE threat modeling + OWASP Top 10 audit + dependency scan.
- Write findings to: Antigravity-Production-Grade-Suite/security-engineer/
- Auto-fix Critical/High issues with regression tests.
- Document Medium/Low for remediation plan.

Update task.md: T6a status → completed
```

## T6b: Code Review (NO OWASP — architecture + quality only)

```
Update task.md: T6b status → in_progress

Read skills/code-reviewer/SKILL.md and follow its instructions.
Context:
- Architecture conformance and code quality ONLY.
- DO NOT perform OWASP, STRIDE, or any security review — security-engineer is sole authority.
- Cross-reference: "See security-engineer findings for security context."
- Read architecture: docs/architecture/, api/
- Read implementation: services/, frontend/
- Read protocols from: Antigravity-Production-Grade-Suite/.protocols/
- Review: SOLID/DRY/KISS, performance, N+1 queries, resource leaks, test quality.
- Write findings to: Antigravity-Production-Grade-Suite/code-reviewer/
- READ-ONLY: produce findings only, do NOT modify source code.

Update task.md: T6b status → completed
```

## Post-HARDEN: Remediation Preparation

After all HARDEN tasks complete:
1. Collect all findings from T5, T6a, T6b workspace folders
2. Deduplicate by file:line — keep highest severity rating
3. Filter Critical/High severity findings
4. If any Critical/High exist → T8 (Remediation in SHIP phase) receives the findings list
5. Medium/Low → documented but do not block pipeline
6. Print HARDEN summary:
```
━━━ HARDEN Summary ━━━━━━━━━━━━━━━━━━━━━━
✓ QA: [N] tests passed, [M] findings
✓ Security: [N] findings ([M] Critical/High auto-fixed)
✓ Code Review: [N] findings
Remediation needed: [X] Critical/High items
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Handoff to SHIP

Read `phases/ship.md` and begin SHIP phase.
