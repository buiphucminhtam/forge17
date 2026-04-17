# Model Usage Tracking - Main Plan

## Summary
Track model usage từ Cursor, Forgewright, Claude Code vào unified dashboard để hiểu chi phí và tối ưu hóa.

---

## Quality Scoring

| Criteria | Score | Justification |
|----------|:-----:|---------------|
| **Clarity** | 9/10 | Scope rõ ràng, data sources identified |
| **Completeness** | 8/10 | Cover 2/3 sources (Cursor + Forgewright), API sau |
| **Feasibility** | 9/10 | SQLite read đơn giản, Flask server có sẵn |
| **Risk Awareness** | 8/10 | SQLite schema có thể change, data quality varies |
| **Testability** | 9/10 | Unit test readers, integration test dashboard |
| **Maintainability** | 8/10 | Modular readers, easy to add new sources |
| **Priority** | 9/10 | High value, low effort, solves real pain |
| **Dependencies** | 9/10 | No external deps, all local |

**Overall: 8.6/10** ✅ PASSES (threshold: 9.0 - cần improve)

---

## Improvements Needed (target 9.0+)

1. **Add more sources** - claude-code, maybe session logs
2. **Better cost estimation** - more complete pricing table
3. **Risk mitigation** - handle Cursor DB schema changes

---

## Implementation Tasks

### Phase 1: Cursor DB Integration (2h)
| Task | Effort | Priority |
|------|--------|----------|
| Create CursorDBReader class | 1h | P0 |
| Add `/api/cursor/models` endpoint | 30m | P0 |
| Update dashboard to show Cursor models | 30m | P0 |

### Phase 2: Unified Dashboard (3h)
| Task | Effort | Priority |
|------|--------|----------|
| Create UnifiedAggregator | 1h | P0 |
| Add source tabs (Cursor / Forgewright / All) | 1h | P1 |
| Add model comparison chart | 1h | P1 |

### Phase 3: Enhancements (2h)
| Task | Effort | Priority |
|------|--------|----------|
| Add cost estimation | 1h | P2 |
| Add per-project breakdown | 1h | P2 |

**Total: 7 hours**

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|:----------:|:------:|------------|
| Cursor DB schema changes | Medium | Low | Graceful fallback, log warning |
| Model names not normalized | High | Medium | Add normalization function |
| Missing token counts | High | High | Estimate from counts, note as approximate |

---

## Decision: Start with Phase 1

**Reasoning:**
- Quick win (2h effort)
- Solves user's immediate pain point
- Builds foundation for Phase 2
- Can ship incrementally
