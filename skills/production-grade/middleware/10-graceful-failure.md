# Middleware 10 — GracefulFailure

> **Source:** `skills/_shared/protocols/graceful-failure.md`
> **Hook:** `on_error()`
> **Purpose:** Retry logic, stuck detection, graceful exit protocol

## Execution

```
1. Retry management
   → After failed self-repair attempt: retry with adjusted strategy
   → Max 3 retries per task before escalation
   
2. Stuck detection
   → Monitor for repeated failed attempts
   → If same error pattern repeats 3x → likely impossible task
   
3. Escalation triggers
   → After 3 failed attempts → escalate with:
     - What failed
     - What was tried
     - Root cause analysis
     - Remaining options
     
4. Graceful exit format
   → Structured report with all context for next session
   → Saved to .forgewright/session-log.json
```

## Failure Categories

| Category | Behavior |
|----------|----------|
| Transient | Retry with backoff |
| Configuration | Fix config, retry |
| External | Log, skip, continue |
| Impossible | Escalate to user |

## Note

This prevents skills from looping indefinitely on impossible tasks.
