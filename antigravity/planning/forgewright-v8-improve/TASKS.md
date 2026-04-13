# Tasks: Forgewright v8.0 Systematic Flow Review & Improvement

## Task Overview

Comprehensive audit and improvement planning for Forgewright v8.0. Tasks are grouped by category.

---

## Group 1: Phase Audits (6 phases)

### 1.1 INTERPRET + DEFINE Phase Audit

| Field | Value |
|-------|-------|
| **Task ID** | 1.1 |
| **Priority** | P0 |
| **Estimate** | 4 hours |
| **Status** | Not Started |

**What to audit:**
- Step 0 Request Interpretation (MANDATORY enforcement)
- 9 dimensions extraction
- Vague pattern detection
- Clarification rules (MAX 3 questions)
- Structured request generation
- Mode classification (23 modes)
- T0.5 Business Analyst activation
- T1 Product Manager BRD flow
- Gate 1 BRD approval
- T1.5 UI Designer conditional
- T2 Solution Architect ADRs
- Gate 2 Architecture approval
- Handoff to BUILD

**Findings to document:**
- [ ] Flow consistency issues
- [ ] Missing validation steps
- [ ] Redundancies
- [ ] Gaps in error handling
- [ ] Token efficiency
- [ ] User experience improvements

---

### 1.2 BUILD Phase Audit

| Field | Value |
|-------|-------|
| **Task ID** | 1.2 |
| **Priority** | P0 |
| **Estimate** | 4 hours |
| **Status** | Not Started |

**What to audit:**
- Sequential vs parallel execution mode
- T3a Backend Engineering
- T3b Frontend Engineering (conditional)
- T3c Mobile Engineering (conditional)
- T4 DevOps Containerization
- Quality Gate per build task
- Brownfield regression checks
- Change manifest updates
- Self-healing loop (5 attempts max)
- Git rollback + escrow report

**Findings to document:**
- [ ] Parallel execution correctness
- [ ] Dependency graph accuracy
- [ ] Quality gate enforcement
- [ ] Error handling robustness
- [ ] Self-healing effectiveness
- [ ] Performance considerations

---

### 1.3 HARDEN Phase Audit

| Field | Value |
|-------|-------|
| **Task ID** | 1.3 |
| **Priority** | P0 |
| **Estimate** | 3 hours |
| **Status** | Not Started |

**What to audit:**
- Authority boundaries enforcement
- T5 QA Testing
- T6a Security Audit (SOLE OWASP authority)
- T6b Code Review (NO OWASP, architecture + quality)
- Parallel execution for Group B
- Remediation preparation
- Finding deduplication by file:line
- Critical/High filtering
- Medium/Low documentation
- Aggregate quality scoring
- Brownfield merge readiness

**Findings to document:**
- [ ] Authority boundary clarity
- [ ] Parallel execution safety
- [ ] Finding management
- [ ] Quality score accuracy
- [ ] Merge readiness criteria

---

### 1.4 SHIP Phase Audit

| Field | Value |
|-------|-------|
| **Task ID** | 1.4 |
| **Priority** | P0 |
| **Estimate** | 3 hours |
| **Status** | Not Started |

**What to audit:**
- T7 DevOps IaC + CI/CD
- T8 Remediation (HARDEN findings)
- T9 SRE Production Readiness (SOLE SLO authority)
- T10 Data Scientist (conditional)
- Gate 3 Production Readiness
- Authority boundaries (DevOps vs SRE)

**Findings to document:**
- [ ] IaC completeness
- [ ] Remediation efficiency
- [ ] SLO definition quality
- [ ] Gate 3 enforcement
- [ ] Production readiness criteria

---

### 1.5 SUSTAIN Phase Audit

| Field | Value |
|-------|-------|
| **Task ID** | 1.5 |
| **Priority** | P0 |
| **Estimate** | 2 hours |
| **Status** | Not Started |

**What to audit:**
- T11 Technical Writer
- T12 Skill Maker (3-5 project-specific skills)
- T13 Compound Learning + Final Assembly
- Compound learnings format
- Integration options (4 choices)
- Final validation (docker-compose, make test, terraform validate)
- Clean up

**Findings to document:**
- [ ] Documentation completeness
- [ ] Skill generation quality
- [ ] Learning capture effectiveness
- [ ] Integration workflow clarity

---

## Group 2: Mode Audit

### 2.1 All 23 Modes Audit

| Field | Value |
|-------|-------|
| **Task ID** | 2.1 |
| **Priority** | P0 |
| **Estimate** | 6 hours |
| **Status** | Not Started |

**What to audit (per mode):**

| Mode | Trigger Signals | Skills Involved | Audit Focus |
|------|----------------|-----------------|-------------|
| Full Build | "build a SaaS", "from scratch" | All 17 skills | Coverage |
| Feature | "add [feature]", "implement" | BA → PM → BE/FE → QA | Scoping |
| Harden | "review", "audit", "secure" | Security → QA → Review | Authority |
| Ship | "deploy", "CI/CD", "docker" | DevOps → SRE | Completeness |
| Test | "write tests", "test coverage" | QA | Coverage |
| Review | "review my code" | Code Reviewer | Depth |
| Architect | "design", "architecture" | Solution Architect | Completeness |
| Document | "document", "write docs" | Technical Writer | Coverage |
| Explore | "explain", "how does" | Polymath | Effectiveness |
| Research | "research", "deep research" | NotebookLM + Polymath | Grounding |
| Optimize | "performance", "slow" | Performance + SRE | Scope |
| Design | "design UI", "wireframes" | UX → UI Designer | Coverage |
| Mobile | "mobile app", "React Native" | BA → Mobile | Completeness |
| Game Build | "game", "Unity", "Unreal" | 18 game skills | Engine coverage |
| XR Build | "VR", "AR", "MR" | XR Engineer | Platform coverage |
| Marketing | "marketing", "SEO" | Growth Marketer | Coverage |
| Grow | "growth", "CRO", "conversion" | Conversion Optimizer | Metrics |
| Analyze | "analyze requirements" | Business Analyst | Completeness |
| AI Build | "AI feature", "RAG", "LLM" | AI + Prompt + Data | RAG coverage |
| Migrate | "migrate", "upgrade" | DB Eng → QA | Coverage |
| Prompt | "improve prompts" | Prompt Engineer | Coverage |
| Debug | "debug", "bug", "error" | Debugger → Engineer | Effectiveness |
| Custom | Doesn't fit above | User selection | Flexibility |

**Findings to document:**
- [ ] Overlap between modes
- [ ] Missing modes
- [ ] Trigger signal clarity
- [ ] Skill routing accuracy

---

## Group 3: Protocol Audit

### 3.1 All 27 Protocols Audit

| Field | Value |
|-------|-------|
| **Task ID** | 3.1 |
| **Priority** | P1 |
| **Estimate** | 4 hours |
| **Status** | Not Started |

**Protocols to audit:**

| # | Protocol | Purpose | Audit Focus |
|---|----------|---------|-------------|
| 1 | plan-quality-loop | Plan scoring (8 criteria) | Threshold validity |
| 2 | quality-gate | Post-implementation validation | Level coverage |
| 3 | brownfield-safety | Regression protection | Coverage |
| 4 | execution-blocker-loop | Stuck detection | Effectiveness |
| 5 | middleware-chain | Middleware ordering | Correctness |
| 6 | session-lifecycle | Turn-start/close hooks | Completeness |
| 7 | project-onboarding | Project initialization | Depth |
| 8 | graceful-failure | Error handling | Coverage |
| 9 | code-intelligence | ForgeNexus usage | Effectiveness |
| 10 | merge-arbiter | Parallel merge | Safety |
| 11 | task-validator | Contract compliance | Completeness |
| 12 | task-contract | Worker contracts | Format |
| 13 | quality-dashboard | Quality metrics | Visibility |
| 14 | input-validation | Request validation | Coverage |
| 15 | conflict-resolution | Skill conflicts | Authority |
| 16 | ux-protocol | User experience | Consistency |
| 17 | tool-efficiency | Tool usage | Optimization |
| 18 | prompt-templates | Prompt patterns | Coverage |
| 19 | prompt-techniques | Prompt strategies | Completeness |
| 20 | credit-killing-patterns | Request anti-patterns | Detection |
| 21 | dryrun-interceptor | Dry run mode | Coverage |
| 22 | guardrail | Safety checks | Completeness |
| 23 | summarization | Context compression | Trigger |
| 24 | sensitive-file-protection | File safety | Coverage |
| 25 | self-healing-execution | Auto-fix loops | Effectiveness |
| 26 | paperclip-integration | External agents | Coverage |
| 27 | game-test-protocol | Game validation | Completeness |

**Findings to document:**
- [ ] Format consistency
- [ ] Cross-references accuracy
- [ ] Missing protocols
- [ ] Duplicate/overlap
- [ ] Documentation quality

---

## Group 4: Cross-Cutting Reviews

### 4.1 Skill Registry Audit

| Field | Value |
|-------|-------|
| **Task ID** | 4.1 |
| **Priority** | P0 |
| **Estimate** | 4 hours |
| **Status** | Not Started |

**What to audit:**
- Progressive loading correctness
- Mode → skill mapping accuracy
- Skill boundaries clarity
- Authority boundaries enforcement
- Handoff protocols between skills
- Skill self-improvement mechanism

### 4.2 Middleware Chain Audit

| Field | Value |
|-------|-------|
| **Task ID** | 4.2 |
| **Priority** | P1 |
| **Estimate** | 3 hours |
| **Status** | Not Started |

**What to audit:**
- Pre-skill: ①-⑤ ordering
- Post-skill: ⑥-⑩ ordering
- Hook placement correctness
- Token management effectiveness
- Error propagation

### 4.3 Error Handling Review

| Field | Value |
|-------|-------|
| **Task ID** | 4.3 |
| **Priority** | P1 |
| **Estimate** | 3 hours |
| **Status** | Not Started |

**What to audit:**
- Retry loops (up to 3-5 attempts)
- Escalation paths
- Graceful degradation
- Circuit breakers (MISSING?)
- Bulkhead patterns (MISSING?)
- Timeout management
- Deadlock detection

### 4.4 Memory System Audit

| Field | Value |
|-------|-------|
| **Task ID** | 4.4 |
| **Priority** | P2 |
| **Estimate** | 2 hours |
| **Status** | Not Started |

**What to audit:**
- mem0 integration completeness
- Memory categories (10 categories)
- GC strategy effectiveness
- Cross-session continuity
- TF-IDF search quality

### 4.5 Quality Gate Review

| Field | Value |
|-------|-------|
| **Task ID** | 4.5 |
| **Priority** | P1 |
| **Estimate** | 3 hours |
| **Status** | Not Started |

**What to audit:**
- Level 0 plan quality (threshold 9.0)
- Level 1 syntax & build (block)
- Level 2 regression safety (block brownfield)
- Level 3 quality standards (warn)
- Level 4 acceptance traceability (info)
- Scoring calculation accuracy
- Threshold appropriateness

---

## Group 5: Research & Synthesis

### 5.1 Best Practices Comparison

| Field | Value |
|-------|-------|
| **Task ID** | 5.1 |
| **Priority** | P1 |
| **Estimate** | 4 hours |
| **Status** | Not Started |

**What to compare:**

| Framework | Focus | Comparison Points |
|-----------|-------|------------------|
| LangGraph | State machine graphs | Workflow modeling |
| Semantic Kernel | LLM integration | Prompt management |
| Claude Code hooks | Lifecycle events | Event handling |
| MCP | Tool abstraction | Protocol design |

**Output:** Comparison matrix with recommendations

### 5.2 ForgeNexus Integration Review

| Field | Value |
|-------|-------|
| **Task ID** | 5.2 |
| **Priority** | P2 |
| **Estimate** | 2 hours |
| **Status** | Not Started |

**What to review:**
- 12 MCP tools usage
- Blast radius analysis integration
- Index freshness management
- Community detection for parallel
- Comparison with StakGraph

### 5.3 Documentation Audit

| Field | Value |
|-------|-------|
| **Task ID** | 5.3 |
| **Priority** | P2 |
| **Estimate** | 3 hours |
| **Status** | Not Started |

**What to audit:**
- CLAUDE.md → AGENTS.md consistency
- AGENTS.md → skills/SKILL.md consistency
- README.md accuracy
- Cross-references
- Version consistency (v7.8 vs v7.9 vs v7.8.1)

---

## Group 6: Output

### 6.1 Improvement Recommendations

| Field | Value |
|-------|-------|
| **Task ID** | 6.1 |
| **Priority** | P0 |
| **Estimate** | 4 hours |
| **Status** | Not Started |

**Output format:**
```
## Category: [Phase/Mode/Protocol/etc]

### Finding: [Description]
- **Severity:** P0/P1/P2/P3
- **Evidence:** [From audit]
- **Recommendation:** [Actionable]
- **Implementation:** [Steps]
- **Breaking Change:** Yes/No
```

### 6.2 Implementation Plan

| Field | Value |
|-------|-------|
| **Task ID** | 6.2 |
| **Priority** | P0 |
| **Estimate** | 4 hours |
| **Status** | Not Started |

**Output:** Prioritized implementation roadmap for v8.0

---

## Task Status Summary

| Group | Tasks | Total Hours | Completed |
|-------|-------|-------------|-----------|
| 1. Phase Audits | 5 | 16h | 0 |
| 2. Mode Audit | 1 | 6h | 0 |
| 3. Protocol Audit | 1 | 4h | 0 |
| 4. Cross-Cutting | 5 | 15h | 0 |
| 5. Research | 3 | 9h | 0 |
| 6. Output | 2 | 8h | 0 |
| **Total** | **17** | **58h** | **0** |

---

## Notes

- All tasks follow Plan Quality Loop protocol (≥9.0 threshold)
- Each task outputs findings to task-specific audit document
- Final synthesis in DECISIONS.md and RETROSPECTIVE.md
