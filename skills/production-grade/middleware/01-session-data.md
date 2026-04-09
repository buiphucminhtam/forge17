# Middleware 01 — SessionData

> **Source:** `skills/_shared/protocols/session-lifecycle.md` §Steps 1-3
> **Hook:** `before_skill()`
> **Purpose:** Load project profile, session state, detect manual changes

## Execution

```
1. Load .forgewright/project-profile.json
   → If exists and fresh (<24h): use cached fingerprint
   → If stale: re-run health check only
   → If missing: run full project onboarding

2. Load .forgewright/session-log.json
   → If interrupted session: offer resume via notify_user
   → If completed: log summary, continue to new request
   → If first session: continue normally

3. Detect manual changes
   → If git available: check commits since last session
   → If structural changes detected: re-run onboarding fingerprint + patterns

4. Display quality trend (if history exists)
   → Read .forgewright/quality-history.json → show trend of last 5 sessions
```

## Outputs

- Project fingerprint loaded into context
- Session state available for all subsequent middleware
- Quality trend displayed to user

## Failure Handling

- If project-profile.json missing → WARN, continue with empty profile (new project)
- If session-log.json missing → WARN, treat as first session
- Never block pipeline due to session data issues
