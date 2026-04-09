# ADR-003: Parallel Pre-Commit Hook (2-Wave Architecture)

## Status
Accepted

## Context
Forgewright's pre-commit hook ran four checks sequentially:
1. ESLint
2. Prettier
3. TypeScript type check
4. Vitest

On a codebase with 64 TypeScript files, this meant ~20-40 seconds per commit even for trivial changes.

## Decision
Restructure pre-commit into two waves:

### Wave 1 (parallel)
- ESLint (with `--cache`)
- Prettier (with `--cache`)

### Wave 2 (parallel, starts after Wave 1)
- TypeScript type check
- Vitest unit tests

```
Wave 1:  [ESLint ═══════]  [Prettier ═════]
           └── wait both ──┘
Wave 2:        [TypeScript ══]  [Vitest ════════════]
                                    └── wait both ──┘
Total: max(wave1) + max(wave2)
```

GitHub Actions CI also parallelized:
- `lint-and-format`, `typecheck`, `test`, `commitlint` all run in parallel (no `needs:`)
- `test-coverage` waits for `test` only

## Consequences

### Positive
- Pre-commit time reduced from ~40s to ~20s (2x speedup)
- GitHub Actions CI total time reduced from ~sum(4 jobs) to ~max(4 jobs)
- ESLint `--cache` provides incremental-only checking on subsequent runs

### Negative
- Both waves must pass for the commit to succeed (same as before)
- First run without cache is still slow
- Error messages from parallel processes may interleave

## Notes
Pre-commit runs only on `mcp/` directory (TypeScript source). Production skills (`skills/`) are markdown files and don't require linting.
