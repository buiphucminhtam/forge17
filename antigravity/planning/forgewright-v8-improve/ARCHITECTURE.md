# Architecture: Forgewright v8.0 Review Framework

## Overview

Forgewright v8.0 là một **systematic review** — không phải architecture redesign. Tuy nhiên, để thực hiện review hiệu quả, cần có một framework rõ ràng để đánh giá từng component.

## Review Framework Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    REVIEW ORCHESTRATOR                        │
│            (Production-grade SKILL.md)                      │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐   ┌─────────────────┐   ┌─────────────────┐
│  Phase Audits │   │  Mode Audits    │   │ Protocol Audits │
│   (6 phases)  │   │   (23 modes)    │   │  (27 protocols)│
└───────────────┘   └─────────────────┘   └─────────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  CROSS-CUTTING REVIEWS                       │
│  Skills │ Middleware │ Error Handling │ Memory │ Quality    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    RESEARCH SYNTHESIS                        │
│     Web Research + NotebookLM + Best Practices Comparison    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│               IMPROVEMENT RECOMMENDATIONS                   │
│     Prioritized by P0/P1/P2 │ Breaking │ Effort │ Impact    │
└─────────────────────────────────────────────────────────────┘
```

## Review Component Map

### Core Orchestration

```
production-grade/SKILL.md (2043 lines)
├── Middleware Chain (10 chains)
│   ├── ① SessionData
│   ├── ② ContextLoader
│   ├── ③ SkillRegistry
│   ├── ④ Guardrail
│   ├── ⑤ Summarization
│   ├── ⑥ QualityGate
│   ├── ⑦ BrownfieldSafety
│   ├── ⑧ TaskTracking
│   ├── ⑨ Memory
│   └── ⑩ GracefulFailure
│
├── Phase Dispatchers (6 phases)
│   ├── define.md (T0.5 → T2)
│   ├── build.md (T3a/b/c + T4)
│   ├── harden.md (T5, T6a, T6b)
│   ├── ship.md (T7, T8, T9, T10)
│   └── sustain.md (T11, T12, T13)
│
├── Modes (23 modes)
│   └── Skill routing based on classification
│
└── Gates (3 gates)
    ├── Gate 1: BRD Approval
    ├── Gate 2: Architecture Approval
    └── Gate 3: Production Readiness
```

### Skill Registry

```
skills/
├── production-grade/        # Orchestrator
├── _shared/
│   └── protocols/          # 27 shared protocols
├── engineering/            # 18 skills
├── game-dev/              # 18 skills
├── ai-ml/                # 3 skills
├── devops/                # 2 skills
├── growth/                # 2 skills
├── meta/                  # 6 skills
└── notebooklm-researcher/  # 1 skill

Total: 55 skills
```

### Code Intelligence

```
forgenexus/
├── src/
│   ├── cli/
│   ├── scanner/
│   ├── parser/
│   ├── resolver/
│   ├── propagator/
│   ├── community/
│   ├── process/
│   └── fts/
└── dist/
    └── cli/
```

## Review Categories

### 1. Flow Consistency

**What to check:**
- Sequential dependencies are correct
- Parallel groups have no hidden dependencies
- Gate enforcement is consistent
- Error propagation is clear

**Metrics:**
- Dependency accuracy: 100%
- Gate enforcement: 100%
- Error handling coverage: ≥90%

### 2. Coverage Completeness

**What to check:**
- All 23 modes have proper routing
- All 55 skills are reachable
- All 27 protocols are referenced
- All phases cover edge cases

**Metrics:**
- Mode coverage: 100%
- Skill reachability: 100%
- Protocol usage: ≥90%

### 3. Error Handling

**What to check:**
- Retry loops have clear limits
- Escalation paths are documented
- Graceful degradation is implemented
- Circuit breakers exist (MISSING in current)

**Metrics:**
- Retry coverage: 100%
- Escalation paths: ≥90%
- Graceful degradation: ≥80%
- Circuit breakers: 0 (gap)

### 4. Token Efficiency

**What to check:**
- Progressive loading works
- Summarization triggers correctly
- Context management is optimal
- No redundant loading

**Metrics:**
- Token budget: <70% average
- Summarization triggers: accurate
- Progressive loading: effective

## Review Output Structure

Each review produces:

```
forgewright-v8-improve/
├── audits/
│   ├── phase-interpet-define.md
│   ├── phase-build.md
│   ├── phase-harden.md
│   ├── phase-ship.md
│   ├── phase-sustain.md
│   ├── mode-audit.md
│   ├── protocol-audit.md
│   ├── skill-registry-audit.md
│   ├── middleware-audit.md
│   ├── error-handling-audit.md
│   ├── memory-audit.md
│   └── quality-gate-audit.md
│
├── research/
│   ├── web-research.md
│   ├── notebooklm-synthesis.md
│   └── best-practices-comparison.md
│
└── recommendations/
    ├── p0-critical.md
    ├── p1-high.md
    ├── p2-medium.md
    └── p3-low.md
```

## Key Architecture Decisions

### Decision 1: Review Before Implementation

**Rationale:** Avoid breaking changes by understanding current state thoroughly

**Trade-offs:**
- More time upfront
- Better informed decisions
- Reduced risk of regressions

### Decision 2: Backward Compatibility as Hard Constraint

**Rationale:** Don't break existing users

**Trade-offs:**
- Some improvements may be deferred
- More incremental changes
- Clear versioning strategy

### Decision 3: Evidence-Based Recommendations

**Rationale:** Ground improvements in best practices, not opinions

**Trade-offs:**
- Research takes time
- May find conflicting advice
- Need to synthesize multiple sources

## Integration Points

### External Systems

```
Forgewright
    │
    ├── Claude Code
    │   └── Hooks, lifecycle events
    │
    ├── NotebookLM
    │   └── Research, grounded knowledge
    │
    ├── ForgeNexus
    │   └── Code intelligence, blast radius
    │
    └── GitHub
        └── Version control, CI/CD
```

### Internal Components

```
Forgewright Components
    │
    ├── Orchestrator (SKILL.md)
    │   ├── Request Classification
    │   ├── Mode Routing
    │   └── Phase Dispatch
    │
    ├── Skills (55 skills)
    │   ├── Progressive Loading
    │   ├── Authority Boundaries
    │   └── Handoffs
    │
    ├── Protocols (27 protocols)
    │   ├── Quality Gates
    │   ├── Error Handling
    │   └── Integration
    │
    └── State (.forgewright/)
        ├── project-profile.json
        ├── settings.md
        └── memory/
```

## Risk Architecture

### Risk Categories

| Category | Examples | Mitigation |
|----------|----------|------------|
| **Scope** | Scope creep | Strict SCOPE.md boundaries |
| **Technical** | Breaking changes | Backward compatibility checks |
| **Timeline** | Overruns | Parallel audits with subagents |
| **Quality** | Incomplete reviews | Structured audit templates |

### Risk Matrix

```
Impact
  High  │  [Timeline]   [Scope]    [Breaking]
        │    [Quality]    [Quality]  [Breaking]
Medium  │               [Timeline]
  Low   │
        └────────────────────────────────────
               Low      Medium     High
                      Probability
```

## Review Execution Model

### Sequential (Default)

For sequential reviews:
```
Task 1.1 → Task 1.2 → Task 1.3 → ... → Task 6.2
```

### Parallel (For independent audits)

For parallel audits:
```
┌────────────┐   ┌────────────┐   ┌────────────┐
│ Task 1.1  │   │ Task 1.2  │   │ Task 1.3  │
│ INTERPRET │   │  BUILD    │   │  HARDEN   │
└────────────┘   └────────────┘   └────────────┘
        │               │                │
        └───────────────┼────────────────┘
                        ▼
                Task 6.1 (Synthesis)
```

## Quality Assurance

### Review Quality Criteria

| Criterion | Definition | Target |
|-----------|------------|--------|
| Completeness | All items reviewed | 100% |
| Accuracy | Findings are correct | ≥95% |
| Actionability | Recommendations clear | 100% |
| Consistency | Same standards applied | 100% |

### Verification Methods

1. **Checklist completion** — All items checked
2. **Cross-reference verification** — Links work
3. **Consistency check** — Same format used
4. **Evidence trail** — Findings backed by code
