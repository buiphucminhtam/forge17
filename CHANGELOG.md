# Changelog

All notable changes to the Production Grade Plugin.

## [3.3.0] — 2026-03-05

### Added
- **Brownfield awareness** — orchestrator detects greenfield vs existing codebase at startup. Scans for source files, frameworks, and infrastructure. Generates `.production-grade.yaml` from discovered structure. Writes `codebase-context.md` with safety rules for all agents.
- **Codebase discovery** — parallel scan of project root for package.json, go.mod, pyproject.toml, existing src/, services/, frontend/, tests/, Dockerfiles, CI configs.
- All 8 BUILD/SHIP skills (software-engineer, frontend-engineer, devops, qa-engineer, solution-architect, sre, technical-writer, and orchestrator) now load brownfield context and follow "never overwrite, extend don't replace" rules.

### Changed
- **MECE intent-based skill routing** — all 14 skill descriptions rewritten from keyword triggers to intent descriptions. Each skill has a unique precondition and domain. No overlap.

### Fixed
- **Protocol loading crash** — all 13 sub-skills crashed on load when protocol files didn't exist. Added `|| true` fallback.
- **Polymath priority** — uncertainty expressions now correctly route to polymath before product-manager.

## [3.2.0] — 2026-03-05

### Added
- **Auto-update with consent** — orchestrator checks for new versions on pipeline start, prompts user only when update is available. Silent if current, graceful fallback if offline.
- Dynamic version display in pipeline banner and completion summary.

### Fixed
- **Protocol loading crash** — all 13 sub-skills crashed on load when protocol files didn't exist yet. Added `|| true` fallback to all `cat` commands.
- **MECE intent-based skill routing** — replaced keyword trigger matching with intent descriptions across all 14 skills. Each skill now describes user state and domain, not trigger phrases. Polymath correctly activates on uncertainty signals instead of losing to keyword matches.
- **Polymath priority** — uncertainty expressions ("don't know where to start", "not sure how") now correctly route to polymath before product-manager or production-grade.

## [3.1.0] — 2026-03-05

### Added
- **Polymath co-pilot** — the 14th skill. Thinks with you before, during, and after the pipeline.
- 6 Polymath modes: onboard, research, ideate, advise, translate, synthesize.
- Pre-flight gap detection — orchestrator detects knowledge gaps and invokes Polymath before proceeding.
- Gate companion — "Chat about this" at any approval gate routes to Polymath for plain-language explanation.
- Product Manager integration — PM reads Polymath context package to shorten CEO interview.

### Changed
- README rewritten as concise marketing material with GitHub badges, Star History, and Quick Start near top.

## [3.0.0] — 2026-03-04

### Changed
- **Full rewrite** — Teams/TaskList orchestration replaces custom state management.
- 7 parallel execution points across the pipeline.
- 4 shared protocols: UX, input validation, tool efficiency, conflict resolution.
- Large skills split into router + on-demand phases for 65% token savings.
- Sole-authority conflict resolution: security-engineer owns OWASP, SRE owns SLOs.

### Added
- Phase-based skill splitting: software-engineer (5), frontend-engineer (5), security-engineer (6), SRE (5), data-scientist (6), technical-writer (4).
- Conditional task execution: frontend auto-skip, data-scientist auto-detect.
- Partial execution: "just define", "just build", "just harden", "just ship", "just document".

## [2.0.0] — 2026-03-04

### Changed
- **Bundle all 13 skills** into a single plugin install.
- Unified workspace architecture: deliverables at project root, workspace artifacts in `Claude-Production-Grade-Suite/`.
- Prescriptive UX Protocol enforced across all skills: AskUserQuestion with options only, never open-ended.

### Added
- Skill Maker as pipeline phase for generating project-specific custom skills.
- VISION.md: ten principles governing the ecosystem.

## [1.0.0] — 2026-03-03

### Added
- Initial release: production-grade orchestrator plugin.
- 12 specialized agent skills coordinated through dependency graph.
- 3 approval gates, autonomous execution between gates.
- DEFINE > BUILD > HARDEN > SHIP > SUSTAIN pipeline.
