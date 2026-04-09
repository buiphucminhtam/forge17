# Middleware 05 — Summarization

> **Source:** `skills/_shared/protocols/summarization.md`
> **Hook:** `before_skill()`
> **Purpose:** Auto-compress context if above 70% token budget

## Execution

```
1. Check token budget usage

2. If usage > 70%:
   - Summarize conversation history (keep decisions, discard exploration)
   - Compress workspace artifacts to essential summaries
   - Keep current request and recent context intact
   
3. Target: reduce to 50% budget usage
```

## Output

- Context compressed to budget-preserving size
- All decisions preserved
- No loss of current work context

## Note

This is a non-blocking optimization. If summarization fails, continue with existing context.
