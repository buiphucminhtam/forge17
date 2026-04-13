# Implementation Plan: Forgewright v8.0

## Overview

Forgewright v8.0 tập trung vào **Systematic Review** và **Non-Breaking Improvements**. Tất cả changes phải maintain backward compatibility.

---

## Version Strategy

| Version | Changes | Breaking? |
|---------|---------|-----------|
| v8.0.0 | Documentation fixes + Critical improvements | No |
| v8.1.0 | High priority improvements | No |
| v8.2.0 | Medium priority improvements | No |
| v9.0.0 | Major refactors (if needed) | Maybe |

---

## v8.0.0 Implementation (Target: 2-3 weeks)

### Phase 1: Documentation Fixes (Week 1, Day 1-2)

#### D1: Version & Mode Count Standardization

| Task | Effort | Owner | Status |
|------|--------|-------|--------|
| Fix README.md mode badge (22 → 23) | 15 min | TBD | Pending |
| Fix README.md protocol badge (15 → 27) | 15 min | TBD | Pending |
| Update AGENTS.md mode count (22 → 23) | 15 min | TBD | Pending |
| Add version to CLAUDE.md | 15 min | TBD | Pending |
| Add single source of truth comment | 15 min | TBD | Pending |
| Update README diagrams | 30 min | TBD | Pending |

**Total: ~2.5 hours**

#### D2: Cross-Reference Validation

| Task | Effort | Owner | Status |
|------|--------|-------|--------|
| Validate all skill references | 1 hour | TBD | Pending |
| Validate all protocol references | 1 hour | TBD | Pending |
| Fix broken references | 1 hour | TBD | Pending |

**Total: ~3 hours**

### Phase 2: Critical Improvements (Week 1, Day 3-5)

#### D3: Circuit Breaker Pattern

| Task | Effort | Owner | Status |
|------|--------|-------|--------|
| Create circuit-breaker.md protocol | 2 hours | TBD | Pending |
| Add to parallel-dispatch skill | 1 hour | TBD | Pending |
| Add documentation | 1 hour | TBD | Pending |
| Test with parallel execution | 2 hours | TBD | Pending |

**Total: ~6 hours**

#### D4: Bulkhead Isolation

| Task | Effort | Owner | Status |
|------|--------|-------|--------|
| Create bulkhead.md protocol | 2 hours | TBD | Pending |
| Add resource limits to parallel-dispatch | 1 hour | TBD | Pending |
| Add failure propagation prevention | 2 hours | TBD | Pending |
| Test isolation | 1 hour | TBD | Pending |

**Total: ~6 hours**

#### D5: Authority Enforcement

| Task | Effort | Owner | Status |
|------|--------|-------|--------|
| Add SOLE OWASP check to Guardrail | 2 hours | TBD | Pending |
| Add SOLE SLO check to Guardrail | 1 hour | TBD | Pending |
| Add READ-ONLY hook for Code Reviewer | 2 hours | TBD | Pending |
| Test enforcement | 1 hour | TBD | Pending |

**Total: ~6 hours**

### Phase 3: High Priority (Week 2)

#### Quality & Secret Detection

| Task | Effort | Owner | Status |
|------|--------|-------|--------|
| Enhance secret detection patterns | 4 hours | TBD | Pending |
| Add more regex patterns | 2 hours | TBD | Pending |
| Add obfuscated secret detection | 4 hours | TBD | Pending |

#### Mode Simplification

| Task | Effort | Owner | Status |
|------|--------|-------|--------|
| Simplify Mobile mode (4 → 2 skills) | 4 hours | TBD | Pending |
| Simplify AI Build (7 → 5 skills) | 4 hours | TBD | Pending |
| Update Custom mode menu | 2 hours | TBD | Pending |

#### Protocol Improvements

| Task | Effort | Owner | Status |
|------|--------|-------|--------|
| Add JSON Schema for task-contract | 4 hours | TBD | Pending |
| Add conflict-resolution reference in HARDEN | 1 hour | TBD | Pending |
| Add verification protocol | 4 hours | TBD | Pending |

### Phase 4: Integration (Week 3)

#### ForgeNexus Integration

| Task | Effort | Owner | Status |
|------|--------|-------|--------|
| Add pre-edit impact check | 2 hours | TBD | Pending |
| Improve detect_changes integration | 2 hours | TBD | Pending |
| Add route_map usage examples | 1 hour | TBD | Pending |

#### Quality Gate Integration

| Task | Effort | Owner | Status |
|------|--------|-------|--------|
| Add self-healing for build failures | 4 hours | TBD | Pending |
| Add scope enforcement action | 2 hours | TBD | Pending |
| Add quality trends tracking | 4 hours | TBD | Pending |

---

## v8.1.0 Implementation (Target: 4-6 weeks)

### Medium Priority Improvements

1. **Timeout Management** (8 hours)
   - Add action-level timeouts
   - Add investigation timeouts
   - Add web search timeouts

2. **Mobile/AI Build Simplification** (8 hours)
   - Simplify Mobile mode
   - Simplify AI Build mode
   - Update Custom mode

3. **Protocol Enhancements** (8 hours)
   - Add merge arbiter patterns
   - Improve graceful failure
   - Add verification protocol

4. **Skill Registry Improvements** (8 hours)
   - Remove duplicate skills
   - Standardize handoff format
   - Add handoff validation

---

## v8.2.0 Implementation (Target: 6-8 weeks)

### Advanced Improvements

1. **Checkpointing** (16 hours)
   - Add state machine checkpointing
   - Add recovery support
   - Add human-in-loop

2. **Token Budget Tracking** (8 hours)
   - Add real-time tracking
   - Add budget alerts
   - Add optimization suggestions

3. **Event-Driven Pattern** (24 hours)
   - Add pub/sub infrastructure
   - Add event handlers
   - Add event-driven phases

---

## Quick Fixes (Can ship in v8.0.0 immediately)

### Documentation Fixes

```bash
# 1. Fix README.md mode badge
# Change: modes-22 → modes-23
# File: README.md line 7

# 2. Fix README.md protocol badge
# Change: protocols-15 → protocols-27
# File: README.md line 8

# 3. Update AGENTS.md mode count
# Change: "22 modes" → "23 modes"
# File: AGENTS.md

# 4. Add version to CLAUDE.md
# Add: Version 7.8.1 (from VERSION file)
# File: CLAUDE.md header
```

### Authority Enforcement

```markdown
# Add to Guardrail middleware:

## Authority Boundary Check

```bash
# Check if current skill has authority for action
# Security → OWASP authority
# SRE → SLO authority
# Code Reviewer → READ-ONLY
```

---

## Rollback Plan

| Phase | Rollback Action | Time |
|-------|----------------|------|
| Phase 1 | Revert doc changes | <5 min |
| Phase 2 | Revert circuit breaker | <10 min |
| Phase 3 | Revert enhancements | <15 min |
| Phase 4 | Revert integration | <20 min |

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Documentation errors | 0 | Cross-reference validation |
| Breaking changes | 0 | Test suite |
| Authority violations | 0 | Guardrail logs |
| Parallel failures | <10% | Execution logs |
| Quality scores | >90% | Quality dashboard |

---

## Testing Strategy

### Unit Tests

| Test | Coverage | Status |
|------|----------|--------|
| Circuit breaker | 100% | Pending |
| Bulkhead isolation | 100% | Pending |
| Authority enforcement | 100% | Pending |
| Secret detection | 95% | Pending |

### Integration Tests

| Test | Coverage | Status |
|------|----------|--------|
| Parallel execution | Full | Pending |
| Quality gate | Full | Pending |
| Error handling | Full | Pending |
| Memory system | Partial | Pending |

### E2E Tests

| Test | Coverage | Status |
|------|----------|--------|
| Full Build pipeline | Core | Pending |
| Feature mode | Core | Pending |
| Game Build pipeline | Core | Pending |

---

## Release Checklist

- [ ] All documentation fixes applied
- [ ] All P0 items implemented
- [ ] All P1 items implemented (as time permits)
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Quality scores >90%
- [ ] No breaking changes
- [ ] CHANGELOG updated
- [ ] Version bumped to 8.0.0
- [ ] GitHub release created
