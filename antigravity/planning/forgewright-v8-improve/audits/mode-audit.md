# Mode Audit: All 23 Modes

**Task:** 2.1
**Priority:** P0
**Estimate:** 6 hours
**Status:** In Progress

---

## 1. Mode Summary

### 1.1 All Modes Overview

| # | Mode | Skills | Gates | Complexity |
|---|------|--------|-------|------------|
| 1 | Full Build | 17 | 3 | Highest |
| 2 | Feature | 5 | 1 | High |
| 3 | Harden | 3 | 1 | Medium |
| 4 | Ship | 2 | 1 | Medium |
| 5 | Test | 1 | 0 | Low |
| 6 | Review | 1 | 0 | Low |
| 7 | Architect | 1 | 1 | Medium |
| 8 | Document | 1 | 0 | Low |
| 9 | Explore | 1 | 0 | Low |
| 10 | Research | 1 | 0 | Low |
| 11 | Optimize | 2 | 1 | Medium |
| 12 | Design | 2 | 0 | Medium |
| 13 | Mobile | 4 | 1 | High |
| 14 | Game Build | 18 | 3 | Highest |
| 15 | XR Build | 1+ | 1 | High |
| 16 | Marketing | 3 | 1 | Medium |
| 17 | Grow | 4 | 1 | Medium |
| 18 | Analyze | 1 | 0 | Low |
| 19 | AI Build | 7 | 2 | High |
| 20 | Migrate | 3 | 2 | High |
| 21 | Prompt | 1 | 0 | Low |
| 22 | Debug | 2 | 1 | Medium |
| 23 | Custom | Variable | Variable | Variable |

### 1.2 Skill Count by Mode

```
Single-skill (8 modes):     Test, Review, Document, Explore, Research, Analyze, Prompt
Two-skill (4 modes):        Ship, Optimize, Design, Debug
Three-skill (3 modes):      Harden, Marketing, Migrate
Four-skill (2 modes):       Feature, Mobile, Grow
Five-skill (1 mode):        AI Build
Six-skill (1 mode):         XR Build
17-skill (1 mode):          Full Build
18-skill (1 mode):          Game Build
Variable (1 mode):          Custom
```

---

## 2. Mode Coverage Analysis

### 2.1 Overlap Detection

| Mode Pair | Overlap Area | Severity | Recommendation |
|-----------|-------------|----------|----------------|
| Harden vs Review | Code quality | P1 | Harden = security + QA + Review; Review = standalone |
| Harden vs Optimize | Performance | P2 | Harden focuses on security, Optimize on performance |
| Ship vs Migrate | Infrastructure | P2 | Ship = deploy existing; Migrate = change schema/framework |
| Analyze vs Feature | Requirements | P1 | Analyze = standalone BA; Feature = BA → PM → Build |
| Debug vs Test | Bug investigation | P2 | Debug = find bug; Test = prevent bugs |
| Review vs Code Review | Code quality | P1 | Review mode = standalone review; T6b = part of HARDEN |

### 2.2 Coverage Gaps

| Gap | Description | Mode | Recommendation |
|-----|-------------|------|----------------|
| **No "Patch" mode** | Fix specific bug/issue without full test | Missing | Consider adding Patch mode |
| **No "Refactor" mode** | Code improvement without behavior change | Missing | Consider adding Refactor mode |
| **No "Monitor" mode** | Ongoing monitoring/observability | Missing | Consider adding Monitor mode |
| **No "Incident" mode** | Incident response | Missing | Could be covered by Debug |

### 2.3 Redundancy Analysis

| Redundancy | Description | Recommendation |
|------------|-------------|----------------|
| **Architect mode overlaps with T2** | Both design architecture | Architect mode = standalone; T2 = part of DEFINE |
| **Research mode overlaps with Polymath** | Both do research | Research = NotebookLM-focused; Explore = thinking partner |

---

## 3. Individual Mode Audits

### 3.1 Full Build Mode

**Skills:** All 17 (BA, PM, Architect, BE, FE, QA, Security, DevOps, SRE, etc.)
**Gates:** 3 (BRD, Architecture, Production Readiness)

| Finding | Severity | Description |
|---------|----------|-------------|
| FB-01 | P1 | **17 skills is massive** — Hard to track progress |
| FB-02 | P1 | **No early exit** — Can't abort midway |
| FB-03 | P2 | **Parallel execution optional** — Sequential by default |

### 3.2 Feature Mode

**Skills:** 5 (BA → PM → Architect → BE/FE → QA)
**Gates:** 1 (After PM scoping)

| Finding | Severity | Description |
|---------|----------|-------------|
| FE-01 | P1 | **BA pre-flight conditional** — May skip BA unintentionally |
| FE-02 | P2 | **Test auto-run good** — "Test (AUTO-RUN)" labeled clearly |
| FE-03 | P1 | **Mini-BRD scope** — May not capture full requirements |

### 3.3 Harden Mode

**Skills:** 3 (Security → QA → Review)
**Gates:** 1 (After findings)

| Finding | Severity | Description |
|---------|----------|-------------|
| HD-01 | P1 | **Sequential execution** — Could parallelize Security + QA |
| HD-02 | P1 | **Remediation included** — Good but may slow down |
| HD-03 | P2 | **No dry-run option** — Always fixes issues |

### 3.4 Ship Mode

**Skills:** 2 (DevOps → SRE)
**Gates:** 1 (After DevOps plan)

| Finding | Severity | Description |
|---------|----------|-------------|
| SH-01 | P1 | **Infrastructure focus only** — No rollback automation |
| SH-02 | P2 | **SRE is light** — "1 gate: After DevOps infra plan" |

### 3.5 Test Mode

**Skills:** 1 (QA)
**Gates:** 0

| Finding | Severity | Description |
|---------|----------|-------------|
| TE-01 | P2 | **No test type specification** — Should specify unit/integration/e2e |
| TE-02 | P2 | **No coverage threshold** — Could pass with 0% coverage |

### 3.6 Review Mode

**Skills:** 1 (Code Reviewer)
**Gates:** 0

| Finding | Severity | Description |
|---------|----------|-------------|
| RV-01 | P1 | **Read-only good** — Clearly labeled |
| RV-02 | P2 | **No review scope** — Could review entire codebase |

### 3.7 Architect Mode

**Skills:** 1 (Solution Architect)
**Gates:** 1 (Architecture approval)

| Finding | Severity | Description |
|---------|----------|-------------|
| AR-01 | P1 | **Discovery interview** — May be time-consuming |
| AR-02 | P2 | **Scaffold generation** — Good feature |

### 3.8 Document Mode

**Skills:** 1 (Technical Writer)
**Gates:** 0

| Finding | Severity | Description |
|---------|----------|-------------|
| DC-01 | P2 | **No documentation type** — API docs? User docs? |
| DC-02 | P2 | **No review step** — Generated docs may be inaccurate |

### 3.9 Explore Mode

**Skills:** 1 (Polymath)
**Gates:** 0

| Finding | Severity | Description |
|---------|----------|-------------|
| EX-01 | P2 | **No output format** — Could be essay, list, diagram |
| EX-02 | P2 | **Hand-off clarity** — "Offer to hand off" is vague |

### 3.10 Research Mode

**Skills:** 1 (NotebookLM Researcher)
**Gates:** 0

| Finding | Severity | Description |
|---------|----------|-------------|
| RS-01 | P1 | **NotebookLM dependency** — Requires NotebookLM access |
| RS-02 | P1 | **6 phases long** — Complex workflow |
| RS-03 | P2 | **No output format** — Could be podcast, report, quiz |

### 3.11 Optimize Mode

**Skills:** 2 (Code Reviewer → SRE)
**Gates:** 1 (After analysis)

| Finding | Severity | Description |
|---------|----------|-------------|
| OP-01 | P1 | **Analysis then fix** — Good separation |
| OP-02 | P2 | **Performance metrics** — Not specified |

### 3.12 Design Mode

**Skills:** 2 (UX Researcher → UI Designer)
**Gates:** 0

| Finding | Severity | Description |
|---------|----------|-------------|
| DS-01 | P1 | **Two phases** — UX then UI, no gate between |
| DS-02 | P2 | **Design token output** — Good feature |

### 3.13 Mobile Mode

**Skills:** 4 (BA → Mobile → PM → Architect)
**Gates:** 1 (After mobile scoping)

| Finding | Severity | Description |
|---------|----------|-------------|
| MB-01 | P1 | **4 skills overkill for simple mobile** — Should simplify |
| MB-02 | P2 | **No platform decision** — iOS? Android? Both? |

### 3.14 Game Build Mode

**Skills:** 18 (Game Designer → Engine Engineer → Level/Narrative/TechArt/Audio)
**Gates:** 3

| Finding | Severity | Description |
|---------|----------|-------------|
| GM-01 | P1 | **18 skills highest** — Complex, hard to track |
| GM-02 | P1 | **Engine selection** — User picks from 6 options |
| GM-03 | P2 | **Build output** — Should specify target platforms |

### 3.15 XR Build Mode

**Skills:** 1+ (XR Engineer + Game Build pipeline)
**Gates:** 1

| Finding | Severity | Description |
|---------|----------|-------------|
| XR-01 | P1 | **"Game-like XR" conditional** — Unclear when to use |
| XR-02 | P2 | **Platform unclear** — Quest? Vision Pro? |

### 3.16 Marketing Mode

**Skills:** 3 (Growth Marketer → Conversion Optimizer → FE)
**Gates:** 1 (After strategy)

| Finding | Severity | Description |
|---------|----------|-------------|
| MK-01 | P1 | **SEO implementation** — Frontend Engineer adds meta tags |
| MK-02 | P2 | **Content strategy** — Vague scope |

### 3.17 Grow Mode

**Skills:** 4 (Conversion Optimizer → Growth Marketer → FE → QA)
**Gates:** 1 (After audit)

| Finding | Severity | Description |
|---------|----------|-------------|
| GR-01 | P1 | **A/B test infrastructure** — Good feature |
| GR-02 | P2 | **Growth loops** — Vague concept |

### 3.18 Analyze Mode

**Skills:** 1 (Business Analyst)
**Gates:** 0

| Finding | Severity | Description |
|---------|----------|-------------|
| AZ-01 | P1 | **Standalone BA** — Good for requirements gathering |
| AZ-02 | P2 | **Handoff options** — "Offer handoff options" |

### 3.19 AI Build Mode

**Skills:** 7 (PM → Data Scientist → Prompt Engineer → Architect → BE → FE → QA)
**Gates:** 2 (After AI design, After evaluation)

| Finding | Severity | Description |
|---------|----------|-------------|
| AI-01 | P1 | **Complex workflow** — 7 skills, 2 gates |
| AI-02 | P1 | **Evaluation framework** — "QA + evaluation framework" vague |
| AI-03 | P2 | **Model selection** — Should benchmark multiple models |

### 3.20 Migrate Mode

**Skills:** 3 (Database Engineer → Software Engineer → QA)
**Gates:** 2

| Finding | Severity | Description |
|---------|----------|-------------|
| MG-01 | P1 | **Migration types** — DB migration, framework upgrade, or code migration |
| MG-02 | P1 | **Rollback plan** — Good to include |
| MG-03 | P2 | **Zero-downtime** — Should mention |

### 3.21 Prompt Mode

**Skills:** 1 (Prompt Engineer)
**Gates:** 0

| Finding | Severity | Description |
|---------|----------|-------------|
| PR-01 | P1 | **Prompt optimization** — Good use case |
| PR-02 | P2 | **No evaluation** — Should test prompts |

### 3.22 Debug Mode

**Skills:** 2 (Debugger → Engineer)
**Gates:** 1 (After root cause)

| Finding | Severity | Description |
|---------|----------|-------------|
| DB-01 | P1 | **Root cause first** — Good approach |
| DB-02 | P2 | **Fix attribution** — Engineer vs Debugger |

### 3.23 Custom Mode

**Skills:** Variable (user picks)
**Gates:** Variable

| Finding | Severity | Description |
|---------|----------|-------------|
| CU-01 | P1 | **Skill menu** — 45 skills in menu, overwhelming |
| CU-02 | P2 | **Skill conflict** — "Resolve via authority hierarchy" vague |

---

## 4. Mode Trigger Analysis

### 4.1 Trigger Word Mapping

| Mode | Primary Triggers | Secondary Triggers |
|------|-----------------|-------------------|
| Full Build | "build a SaaS", "from scratch" | "full stack", "production grade" |
| Feature | "add [feature]", "implement" | "new endpoint", "integrate" |
| Harden | "review", "audit", "secure" | "harden", "before launch" |
| Ship | "deploy", "CI/CD", "docker" | "infrastructure", "terraform" |
| Test | "write tests", "test coverage" | "add tests" |
| Review | "review my code" | "code quality" |
| Architect | "design", "architecture" | "API design", "tech stack" |
| Document | "document", "write docs" | "API docs", "README" |
| Explore | "explain", "how does" | "help me think" |
| Research | "research", "deep research" | "find sources", "investigate" |
| Optimize | "performance", "slow" | "optimize", "scale" |
| Design | "design UI", "wireframes" | "UX", "color palette" |
| Mobile | "mobile app", "React Native" | "iOS", "Android" |
| Game Build | "game", "Unity", "Unreal" | "gameplay", "game design" |
| XR Build | "VR", "AR", "MR" | "Quest", "Vision Pro" |
| Marketing | "marketing", "SEO" | "go-to-market", "content" |
| Grow | "growth", "CRO", "conversion" | "A/B test", "churn" |
| Analyze | "analyze requirements" | "evaluate", "feasibility" |
| AI Build | "AI feature", "RAG", "LLM" | "chatbot", "embeddings" |
| Migrate | "migrate", "upgrade" | "database change", "schema" |
| Prompt | "improve prompts" | "prompt engineering" |
| Debug | "debug", "bug", "error" | "broken", "not working" |
| Custom | (no match) | (fallback) |

### 4.2 Ambiguous Triggers

| Trigger | Possible Modes | Recommendation |
|---------|---------------|----------------|
| "build" | Full Build, Feature, Game Build | Check for "SaaS", "app", "game" keywords |
| "test" | Test, Debug | "Test this" = Test, "debug" = Debug |
| "review" | Review, Harden | "code review" = Review, "security audit" = Harden |
| "fix" | Debug, Feature | "fix bug" = Debug, "fix issue" = Feature |
| "design" | Architect, Design | "architecture" = Architect, "UI" = Design |
| "deploy" | Ship, Migrate | "existing code" = Ship, "migrate" = Migrate |

---

## 5. Mode → Skill Routing Verification

### 5.1 Routing Accuracy

| Mode | Skills Listed | Skills Actual | Match |
|------|--------------|----------------|-------|
| Full Build | 17 | All skills | ✅ |
| Feature | 5 | BA, PM, Architect, BE/FE, QA | ✅ |
| Harden | 3 | Security, QA, Review | ✅ |
| Ship | 2 | DevOps, SRE | ✅ |
| Test | 1 | QA | ✅ |
| Review | 1 | Code Reviewer | ✅ |
| Architect | 1 | Solution Architect | ✅ |
| Document | 1 | Technical Writer | ✅ |
| Explore | 1 | Polymath | ✅ |
| Research | 1 | NotebookLM Researcher | ✅ |
| Optimize | 2 | Code Reviewer, SRE | ✅ |
| Design | 2 | UX Researcher, UI Designer | ✅ |
| Mobile | 4 | BA, Mobile, PM, Architect | ⚠️ Should be fewer |
| Game Build | 18 | Game Designer + Engine + Level + Narrative + TechArt + Audio | ✅ |
| XR Build | 1+ | XR Engineer + Game Build pipeline | ✅ |
| Marketing | 3 | Growth Marketer, Conversion Optimizer, FE | ✅ |
| Grow | 4 | Conversion Optimizer, Growth Marketer, FE, QA | ✅ |
| Analyze | 1 | Business Analyst | ✅ |
| AI Build | 7 | PM, Data Scientist, Prompt Engineer, Architect, BE, FE, QA | ⚠️ Too many? |
| Migrate | 3 | Database Engineer, Software Engineer, QA | ✅ |
| Prompt | 1 | Prompt Engineer | ✅ |
| Debug | 2 | Debugger, Engineer | ✅ |
| Custom | Variable | User picks | ✅ |

### 5.2 Routing Issues

| Issue | Mode | Description |
|-------|------|-------------|
| **Mobile mode too heavy** | Mobile | 4 skills for mobile feature may be overkill |
| **AI Build mode too heavy** | AI Build | 7 skills with 2 gates, complex |
| **Custom mode overwhelming** | Custom | 45 skills in menu |

---

## 6. Gate Consistency

### 6.1 Gate Count by Mode

| Gates | Modes |
|-------|-------|
| 0 gates | Test, Review, Document, Explore, Research, Analyze, Prompt |
| 1 gate | Feature, Harden, Ship, Architect, Optimize, Design, Mobile, XR Build, Marketing, Grow, Debug |
| 2 gates | AI Build, Migrate |
| 3 gates | Full Build, Game Build |

### 6.2 Gate Placement

| Mode | Gate Placement | Finding |
|------|---------------|---------|
| Feature | After PM scoping | ✅ Good |
| Harden | After findings | ✅ Good |
| Ship | After DevOps plan | ✅ Good |
| Architect | After discovery | ✅ Good |
| AI Build | After AI design + After evaluation | ⚠️ 2 gates may slow down |
| Migrate | After plan + After scripts | ⚠️ 2 gates may slow down |
| Game Build | After design + Multiple points | ⚠️ Complex gate system |

---

## 7. Summary

### Findings by Severity

| Severity | Count | Key Items |
|----------|-------|-----------|
| P0 | 1 | Mode count inconsistency (22 vs 23) |
| P1 | 25 | Coverage gaps, routing issues, trigger ambiguity |
| P2 | 30 | Minor improvements, documentation clarity |
| **Total** | **56** | |

### Priority P0 Items

1. **Mode count** — Standardize to 23 modes across all docs

### Priority P1 Items

1. **Overlap: Harden vs Review** — Clarify when to use which
2. **Overlap: Analyze vs Feature** — Analyze = standalone BA
3. **Coverage: No Patch mode** — Consider adding
4. **Coverage: No Refactor mode** — Consider adding
5. **Trigger: "build" ambiguity** — Needs disambiguation
6. **Trigger: "test" ambiguity** — Needs disambiguation
7. **Mobile: 4 skills heavy** — Consider simplification
8. **Custom: 45 skills overwhelming** — Categorize and filter
9. **Research: NotebookLM dependency** — Document fallback
10. **AI Build: 7 skills complex** — Consider simplification
11. **XR Build: "game-like" conditional** — Make explicit
12. **Full Build: No early exit** — Consider adding abort option
13. **Game Build: 18 skills complex** — Consider simplification
14. **FB-01:** Add progress tracking for Full Build
15. **FE-01:** BA pre-flight clarity
16. **HD-01:** Consider parallel Security + QA
17. **SH-01:** Add rollback automation
18. **RS-02:** Simplify Research workflow
19. **MK-01:** SEO implementation clarity
20. **AZ-02:** Handoff clarity
21. **AI-02:** Evaluation framework clarity
22. **MG-01:** Migration type clarity
23. **DB-02:** Fix attribution clarity
24. **CU-01:** Custom mode simplification
25. **Trigger ambiguity** — Add disambiguation guide

### Priority P2 Items

1. **Test: No coverage threshold** — Consider adding
2. **Review: No scope** — Consider adding
3. **Architect: Scaffold generation** — Good feature
4. **Document: No type** — Consider specifying
5. **Explore: Output format** — Consider adding
6. **Research: Output format** — Consider adding
7. **Optimize: Metrics** — Consider specifying
8. **Design: Good separation** — UX → UI is good
9. **Mobile: Platform** — Consider adding
10. **Game Build: Platforms** — Consider specifying
11. **XR Build: Platforms** — Consider specifying
12. **Marketing: Content scope** — Consider clarifying
13. **Grow: Growth loops** — Consider defining
14. **Prompt: No evaluation** — Consider adding
15. **Custom: Skill conflict** — Consider documenting
16. And 14 more minor items...

---

## 8. Recommendations Summary

### Immediate (v8.0)

1. **Mode count** — Fix 22 vs 23 inconsistency
2. **Trigger disambiguation** — Add clear trigger guide
3. **Custom mode** — Categorize skills, reduce cognitive load
4. **Mobile mode** — Simplify from 4 to 2-3 skills
5. **AI Build mode** — Simplify from 7 to 5 skills

### Short-term (v8.x)

6. **Harden vs Review** — Create comparison guide
7. **Analyze vs Feature** — Clarify BA standalone use case
8. **Patch mode** — Consider adding
9. **Refactor mode** — Consider adding
10. **Research mode** — Simplify 6-phase workflow

### Medium-term (Future)

11. **Game Build mode** — Consider modular skills
12. **XR Build mode** — Make "game-like" explicit
13. **Full Build** — Add early exit option
14. **Custom mode** — Add skill recommendation engine

---

## 9. Backward Compatibility Assessment

| Change | Breaking? | Migration Path |
|--------|-----------|----------------|
| Fix mode count | No | Documentation only |
| Add trigger guide | No | New feature |
| Simplify Mobile mode | No | New recommendations |
| Add Patch mode | No | New mode |
| Add Refactor mode | No | New mode |


---

## New Findings (Iteration 2 — 2026-04-13) [D2.2 Applied]

| ID | Severity | Description | Evidence | Recommendation | Breaking |
|----|----------|-------------|----------|-----------------|----------|
| C1-09 | P2 | AI Build mode incorrectly included Web Scraper — scrape/crawl triggers and Web Scraper skill removed | SKILL.md:188 | Applied — no further action needed | No |

**Conclusion:** All v8.0 mode changes are backward compatible.
