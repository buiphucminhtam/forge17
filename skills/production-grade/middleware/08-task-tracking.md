# Middleware 08 — TaskTracking

> **Source:** `skills/_shared/protocols/session-lifecycle.md` §Hooks
> **Hook:** `after_skill()`
> **Purpose:** Update task.md, emit lifecycle events

## Execution

```
1. Update .forgewright/task.md with skill completion status

2. Emit session lifecycle hook:
   TASK_COMPLETE(task_id, name, status, summary)

3. Update session-log.json with task result
```

## Output

- task.md reflects current pipeline state
- Session log updated for resume capability

## Lifecycle Events

| Event | When | Action |
|-------|------|--------|
| PHASE_COMPLETE | Phase ends | Update session-log, save to memory |
| TASK_COMPLETE | Task ends | Update session-log |
| GATE_DECISION | Gate approved/rejected | Save decision to memory |
| ARCH_DECISION | Architecture approved | Save to mem0 |
| ERROR | Any error | Save blocker to memory |
