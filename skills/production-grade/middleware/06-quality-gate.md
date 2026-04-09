# Middleware 06 — QualityGate

> **Source:** `skills/_shared/protocols/quality-gate.md`
> **Hook:** `after_skill()`
> **Purpose:** Universal per-skill validation — 4 levels, 0-100 score, threshold enforcement

## Execution

```
1. Run per-skill validation (Level 1-4):
   Level 1 (Build):      Code compiles, tests pass, docs written
   Level 2 (Regression):  Existing tests still pass (brownfield only)
   Level 3 (Standards):  Conventions followed, no stubs, imports resolve
   Level 4 (Traceability): BRD criteria covered, security issues addressed

2. Compute quality score (0-100)

3. Threshold enforcement:
   Score < block_score (default 60) → STOP pipeline
   Score < minimum_score (default 90) → WARN at next gate
   
4. Display mini-scorecard after each skill
```

## Output

- Quality scorecard per skill
- Aggregate scorecard at each gate
- Machine-readable: `.forgewright/quality-report-{session}.json`

## Note

This middleware runs AFTER every skill in ANY mode — Full Build, Feature, Harden, etc.
