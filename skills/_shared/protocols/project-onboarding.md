# Project Onboarding Protocol

**Every new project installation MUST run this protocol to create a comprehensive project fingerprint.** This applies to both greenfield and brownfield projects, adapting depth based on what exists.

## When to Run

- **First time** Forge17 is invoked in a project (no `.forge17/project-profile.json` exists)
- **On explicit `/onboard`** command from user
- **When manual changes detected** (session-lifecycle protocol detects drift)
- **Skip if** `.forge17/project-profile.json` exists AND is less than 24 hours old AND no git changes since last onboarding

## Phase 1 — Fingerprint (Parallel Scans)

Run all scans simultaneously:

```
# Language & Framework detection
find_by_name("package.json"), find_by_name("go.mod"), find_by_name("pyproject.toml"),
find_by_name("Cargo.toml"), find_by_name("pom.xml"), find_by_name("build.gradle"),
find_by_name("Gemfile"), find_by_name("composer.json"), find_by_name("mix.exs")

# Architecture detection
find_by_name("*", "src/"), find_by_name("*", "services/"), find_by_name("*", "apps/"),
find_by_name("*", "packages/"), find_by_name("*", "modules/")

# Infrastructure detection
find_by_name("Dockerfile*"), find_by_name("docker-compose*"),
find_by_name("*", ".github/workflows/"), find_by_name(".gitlab-ci.yml"),
find_by_name("Jenkinsfile"), find_by_name("*.tf"), find_by_name("vercel.json"),
find_by_name("railway.json"), find_by_name("netlify.toml")

# Test detection
find_by_name("*", "tests/"), find_by_name("*", "__tests__/"), find_by_name("*", "spec/"),
find_by_name("*.test.*"), find_by_name("*.spec.*"),
find_by_name("jest.config*"), find_by_name("vitest.config*"), find_by_name("pytest.ini"),
find_by_name("playwright.config*"), find_by_name(".mocharc*")

# Config detection
find_by_name(".production-grade.yaml"), find_by_name(".eslintrc*"),
find_by_name(".prettierrc*"), find_by_name("tsconfig.json"),
find_by_name(".editorconfig"), find_by_name("biome.json")
```

**Output:** Populate `fingerprint` section of project profile.

## Phase 2 — Health Check

Run project health checks based on detected stack:

```
# Build check (detect and run appropriate build command)
IF package.json → npm run build (or pnpm build, yarn build)
IF go.mod → go build ./...
IF pyproject.toml → python -m py_compile on src/**/*.py
IF Cargo.toml → cargo check

# Test check (detect and run existing tests)
IF package.json has "test" script → npm test
IF go.mod → go test ./...
IF pyproject.toml → pytest --co (collect only, don't run — just count)
IF Cargo.toml → cargo test

# Lint check (detect and run existing linter)
IF .eslintrc* exists → npx eslint . --format json
IF biome.json exists → npx biome check .
IF pyproject.toml has ruff → ruff check .

# Dependency health
IF package.json → npm audit --json (count vulnerabilities)
IF go.mod → go list -m -json all | check for deprecated
IF pyproject.toml → pip-audit (if available)
```

**Error handling:** If any health check command fails to execute (not installed, etc.), mark as `"unknown"` — never fail the onboarding because of a missing tool.

**Output:** Populate `health` section of project profile.

## Phase 3 — Pattern Analysis

Read 3-5 representative source files to detect coding patterns:

```
1. Select files:
   - Largest source file in each major directory
   - Most recently modified files (active development area)
   - Entry point files (index.ts, main.go, app.py, etc.)

2. Analyze:
   - Naming convention: camelCase / snake_case / PascalCase / kebab-case
   - Import style: absolute paths / relative paths / barrel files / path aliases
   - Error handling: try-catch / Result types / error middleware / custom error classes
   - Component pattern (frontend): feature-based / type-based / atomic design
   - State management (frontend): Redux / Zustand / Jotai / Context / Signals
   - API pattern: REST controllers / server actions / tRPC / GraphQL resolvers
   - File organization: feature-sliced / layer-based / domain-driven

3. Confidence scoring:
   - High (>80% of files follow pattern) → enforce in quality gate
   - Medium (50-80%) → suggest but don't block
   - Low (<50%) → note as inconsistent, don't enforce
```

**Output:** Write `patterns` section to project profile AND `.forge17/code-conventions.md` (human-readable).

## Phase 4 — Risk Assessment

```
1. Tech debt scan:
   - Count TODO/FIXME/HACK/XXX in source files (exclude node_modules, vendor)
   - Score: 0-10 → 1.0, 11-50 → 3.0, 51-100 → 5.0, 100+ → 7.0+

2. Deprecated dependencies:
   - Check for deprecated packages in lock files
   - Check major version gaps (installed v2, latest v5 = high risk)

3. Known CVEs:
   - From npm audit / pip-audit / cargo audit output in Phase 2
   - Classify: Critical / High / Medium / Low

4. Protected paths:
   - Always protect: .env*, *.key, *.pem, credentials/*, secrets/*
   - Detect production configs: production.*, *-prod.*
   - Detect migration files: migrations/, prisma/migrations/
   - Detect CI/CD: .github/, .gitlab-ci.yml

5. Protected branches:
   - Read from git: main, master, production, release/*
   - Check branch protection rules if accessible

6. Compute risk score (1-10):
   - tech_debt_weight × 0.2 + deprecated_deps × 0.2 + cve_count × 0.3 + (10 - test_coverage/10) × 0.3
```

**Output:** Populate `risk` section of project profile.

## Phase 5 — Profile Generation

Write `.forge17/project-profile.json`:

```json
{
  "schema_version": "1.0",
  "fingerprint": {
    "language": "typescript",
    "framework": "next.js@15.1",
    "package_manager": "pnpm",
    "architecture": "modular-monolith",
    "test_framework": "vitest",
    "lint_tool": "biome",
    "ci_system": "github-actions",
    "deployment": "vercel",
    "monorepo": false,
    "services": ["api", "web"],
    "detected_at": "ISO-8601"
  },
  "health": {
    "build_passes": true,
    "tests_pass": true,
    "test_count": 142,
    "test_coverage_percent": 78,
    "lint_clean": false,
    "lint_error_count": 23,
    "deprecated_dep_count": 3,
    "known_cve_count": 1,
    "cve_severity": { "critical": 0, "high": 0, "medium": 1, "low": 0 },
    "checked_at": "ISO-8601"
  },
  "patterns": {
    "naming_convention": "camelCase",
    "naming_confidence": "high",
    "component_pattern": "feature-based",
    "error_handling": "custom-error-classes",
    "import_style": "path-aliases",
    "state_management": "zustand",
    "api_pattern": "server-actions",
    "file_organization": "feature-sliced"
  },
  "risk": {
    "tech_debt_score": 3.2,
    "overall_risk_score": 4.1,
    "critical_risks": [],
    "protected_paths": [".env*", "prisma/migrations/**", ".github/**"],
    "protected_branches": ["main", "production"]
  },
  "forge17": {
    "version": "7.0.0",
    "onboarded_at": "ISO-8601",
    "last_session": null,
    "total_sessions": 0
  }
}
```

Also write `.forge17/code-conventions.md` — human-readable version of patterns section for developers.

Also ensure `.forge17/.gitignore` is created:

```
# Session-specific (never commit)
session-log.json
baseline-*.json
change-manifest-*.json
quality-metrics.json
quality-history.json
quality-report-*.json
memory.db

# Project-specific (commit these)
!project-profile.json
!code-conventions.md
!.gitignore
```

## Completion

Print onboarding summary:

```
━━━ Project Onboarded ━━━━━━━━━━━━━━━━━━━━━━
Stack:     TypeScript / Next.js 15 / pnpm
Tests:     142 passing (78% coverage)
Health:    ✓ Build OK | ⚠ 23 lint errors | ⚠ 1 CVE (medium)
Risk:      4.1/10 (low-moderate)
Patterns:  camelCase, feature-based, Zustand
Profile:   .forge17/project-profile.json
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Greenfield Behavior

For new/empty projects, the protocol still runs but produces minimal output:

```json
{
  "fingerprint": { "language": "unknown", "framework": "unknown", ... },
  "health": { "build_passes": null, "tests_pass": null, ... },
  "patterns": {},
  "risk": { "tech_debt_score": 0, "overall_risk_score": 0, ... }
}
```

The profile is populated progressively as the pipeline creates project structure.
