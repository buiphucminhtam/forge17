# Middleware 04 — Guardrail

> **Source:** `skills/_shared/protocols/guardrail.md`
> **Hook:** `before_tool()`
> **Purpose:** Pre-tool authorization — block destructive operations, sensitive file access

## Execution

```
1. Check tool call against allow/blocklist rules
   
   BLOCKED operations:
   - rm -rf /, chmod 777, destructive git operations
   - .env, .key, .pem, credentials.json reads
   - .forgewright/protected_paths writes
   
2. Scan staged files for API keys, tokens, passwords
   
3. Validate sensitive file access
   → .env files: require explicit user approval
   → credentials: redact in output
```

## Failure Handling

- If blocked tool called → DENY and explain why
- If sensitive file detected → WARN with redaction recommendation
- Never silently allow destructive operations
