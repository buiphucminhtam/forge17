# Scope Definition: Forgewright v8.0 Systematic Flow Review & Improvement

## Feature Overview

Forgewright v8.0 là major release tập trung vào **systematic review và improvement** của toàn bộ flow — từ INTERPRET → SUSTAIN. Mục tiêu là phát hiện gaps, học hỏi 2026 best practices, và cải thiện reliability, performance, và developer experience mà không breaking existing functionality.

## Goals

1. **Toàn diện (Comprehensive):** Rà soát mọi aspect của Forgewright — phases, modes, protocols, skills, middleware, error handling, memory, quality gates
2. **Có căn cứ (Evidence-based):** Dùng NotebookLM và web research để ground recommendations trong best practices 2026
3. **Thực tiễn (Actionable):** Mỗi finding phải có clear recommendation và implementation path
4. **Bảo toàn (Non-breaking):** Backward compatibility là hard constraint — không break existing users

## ✅ In Scope

### Core Features

- [ ] **Phase Audit (6 phases):** INTERPRET → DEFINE → BUILD → HARDEN → SHIP → SUSTAIN
  - Flow consistency
  - Task dependencies
  - Gate enforcement
  - Failure handling

- [ ] **Mode Audit (23 modes):** Tất cả modes từ Full Build đến Custom
  - Coverage gaps
  - Overlap/redundancy
  - Activation triggers
  - Skill routing

- [ ] **Protocol Audit (27 protocols):**
  - Consistency in format
  - Completeness of documentation
  - Cross-references accuracy
  - Best practice alignment

- [ ] **Skill Registry Audit (55 skills):**
  - Progressive loading correctness
  - Skill boundaries
  - Authority boundaries
  - Handoff protocols

- [ ] **Middleware Chain Audit (10 chains):**
  - Ordering correctness
  - Hook placement
  - Effectiveness
  - Token management

- [ ] **Error Handling Review:**
  - Retry loops
  - Escalation paths
  - Graceful degradation
  - Circuit breakers (missing?)

- [ ] **Memory System Audit:**
  - mem0 integration
  - Cross-session continuity
  - Memory categories
  - GC strategy

- [ ] **Quality Gate Review:**
  - Scoring accuracy
  - Threshold appropriateness
  - Level enforcement
  - Aggregate scoring

- [ ] **ForgeNexus Integration Review:**
  - Code intelligence usage
  - Blast radius analysis
  - Index freshness
  - Tool effectiveness

- [ ] **Documentation Audit:**
  - CLAUDE.md consistency
  - AGENTS.md accuracy
  - README.md completeness
  - Cross-references

- [ ] **Performance Review:**
  - Token usage
  - Context management
  - Summarization triggers
  - Progressive loading

- [ ] **Best Practices Comparison:**
  - LangGraph patterns
  - Semantic Kernel approaches
  - Claude Code hooks
  - MCP specification

### User Stories

| ID | User Story | Acceptance Criteria |
|----|------------|---------------------|
| US-01 | As a Forgewright maintainer, I want comprehensive audit of all flows | Every phase, mode, protocol has documented review |
| US-02 | As a Forgewright user, I want backward compatibility | No breaking changes in v8.0 |
| US-03 | As a developer, I want actionable improvements | Each finding has clear recommendation |
| US-04 | As a researcher, I want evidence-based recommendations | All recommendations grounded in best practices |

## ❌ Out of Scope

### Not Included (Current Phase)

- [ ] **New skills development** — Chỉ review existing, suggest improvements
- [ ] **Fundamental architecture changes** — Đây là improve, không phải rewrite
- [ ] **Performance optimization of ForgeNexus CLI** — Chỉ review integration, không optimize tool itself
- [ ] **Git history changes** — Không alter commit history
- [ ] **Breaking API changes** — Backward compatibility bắt buộc

### Future Phases

- [ ] **v8.1: Circuit breaker implementation** — Planned after review
- [ ] **v8.2: Bulkhead pattern for parallel** — Planned after review
- [ ] **v8.3: Cheap model routing** — Planned for cost optimization
- [ ] **v9.0: Major architecture refactor** — Only if fundamental issues found

## Constraints

### Technical Constraints

| Constraint | Description |
|------------|-------------|
| Backward Compatibility | v8.0 phải maintain 100% backward compatibility |
| Node.js | ForgeNexus requires Node.js 18+ |
| Python 3.8+ | Memory system requires Python 3.8+ |
| Token Budget | Context compression khi >70% usage |
| Progressive Loading | Skills phải load on-demand |

### Business Constraints

| Constraint | Description |
|------------|-------------|
| Timeline | Target: 2-3 weeks cho full review |
| Budget | 0 cost (all tools free tier) |
| Team Size | 1 maintainer + Claude Code |

### Regulatory/Compliance

- Không có regulatory requirements cho internal tool

## Assumptions

| # | Assumption | Impact if Wrong |
|---|------------|----------------|
| 1 | Review findings sẽ có actionable recommendations | Không implement được → deferred |
| 2 | Backward compatibility có thể maintain được | Breaking changes required → v9.0 |
| 3 | Best practices từ 2026 research applicable | Research insufficient → more research needed |
| 4 | Current architecture đủ flexible cho improvements | Architecture limits → major refactor needed |

## Dependencies

### Internal Dependencies

| Dependency | Team/Component | Status | Notes |
|------------|----------------|--------|-------|
| ForgeNexus analyze | Code intelligence | ✅ Ready | For codebase understanding |
| NotebookLM research | Research | ✅ Ready | For best practices synthesis |
| Antigravity planning | Planning system | ✅ Ready | For structured review |

### External Dependencies

| Dependency | External Service | Status | Notes |
|------------|------------------|--------|-------|
| Claude Code docs | Anthropic | ✅ Available | Official documentation |
| LangGraph docs | LangChain | ✅ Available | Open source |
| Semantic Kernel | Microsoft | ✅ Available | Open source |
| MCP specification | Anthropic | ✅ Available | Open standard |

## Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Review findings overwhelm implementation capacity | Medium | High | Prioritize P0 items, defer others |
| Backward compatibility constrains improvements | High | Medium | Document trade-offs, suggest future breaking changes |
| Research doesn't yield actionable insights | Low | High | Multiple research sources, NotebookLM synthesis |
| Scope creep from findings | Medium | High | Strict scope boundaries in SCOPE.md |

## Acceptance Criteria

| # | Criteria | Test Method |
|---|----------|-------------|
| AC-01 | All 6 phases reviewed with documented findings | Checklist completion |
| AC-02 | All 23 modes audited with coverage matrix | Mode coverage ≥100% |
| AC-03 | All 27 protocols reviewed for consistency | Cross-reference accuracy ≥90% |
| AC-04 | Best practices comparison documented | Research synthesis report |
| AC-05 | Recommendations are actionable | Each finding has implementation path |
| AC-06 | Backward compatibility maintained | Breaking changes count = 0 |
| AC-07 | Documentation consistent | Cross-reference accuracy 100% |

## Definition of Done

- [ ] All phase audits complete (6/6)
- [ ] All mode audits complete (23/23)
- [ ] All protocol audits complete (27/27)
- [ ] Research synthesis published
- [ ] Recommendations document created
- [ ] Implementation plan drafted
- [ ] Backward compatibility verified
- [ ] Documentation inconsistencies fixed
