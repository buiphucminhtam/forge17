# ADR-004: Skills Count Verification (Oscillation Prevention)

## Status
Accepted

## Context
Forgewright's changelog (v7.7.0) acknowledged a "skill count oscillation" issue: the number of skills documented (52) kept changing as new skills were added or removed without updating the central reference.

This caused:
- Documentation drift (AGENTS.md says 52, actual might differ)
- Confusion about what skills are available
- No automated guard against future drift

## Decision
Introduce a verification script that runs in CI:

```bash
# scripts/verify-skill-count.sh
bash scripts/verify-skill-count.sh
# Exit 0 if count matches expected, exit 1 otherwise
```

The script:
1. Counts all directories in `skills/` excluding `_shared`
2. Compares against `EXPECTED=52`
3. Lists all skills for transparency
4. Fails the script if count mismatches

## Consequences

### Positive
- Automated detection of skill count drift
- CI prevents commits that change the count without updating docs
- Full skill list visible in output for review

### Negative
- Adding a new skill requires updating the script
- Skipping the check is still possible (developer discretion)

## Notes
Current verified count: 52 skills across Engineering (25), Game Dev (15), Orchestration (7), and Growth/Data (5).
