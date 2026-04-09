# Middleware 07 — BrownfieldSafety

> **Source:** `skills/_shared/protocols/brownfield-safety.md`
> **Hook:** `after_skill()`
> **Purpose:** Regression checks, protected paths, change manifest for existing projects

## Execution

```
1. Regression check (brownfield only)
   → Run existing test suite
   → Compare with baseline from .forgewright/baseline-{session}.json
   → If previously-passing test now fails → REGRESSION → STOP
   
2. Protected paths enforcement
   → Check .forgewright/project-profile.json → risk.protected_paths
   → Verify no modifications to protected files
   
3. Change manifest update
   → Log all file operations to .forgewright/change-manifest-{session}.json
   
4. Merge readiness check (pre-Gate 3)
   → Full regression + quality check
   → If not ready → flag issues before proceeding
```

## Output

- Regression status reported
- Protected paths verified intact
- Change manifest updated

## Note

For greenfield projects, Level 2 (Regression) is auto-satisfied — no baseline exists.
