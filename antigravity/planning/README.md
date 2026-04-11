# Feature Planning Guidelines

> Hướng dẫn cách tạo feature plan chất lượng cao.

## Quy Trình Planning

```
1. SCOPE.md ────→ Xác định boundary (trong/ngoài scope)
        ↓
2. ARCHITECTURE.md ────→ Thiết kế technical architecture
        ↓
3. PLAN.md ────→ Main planning document (tổng hợp)
        ↓
4. TASKS.md ────→ Task breakdown theo priorities
        ↓
5. DECISIONS.md ────→ Architecture decisions log
        ↓
6. Review & Approve ────→ User approves trước khi implement
```

## File Checklist

Mỗi feature planning phải có:

| File | Required? | Description |
|------|-----------|-------------|
| `PLAN.md` | ✅ Bắt buộc | Main planning document |
| `SCOPE.md` | ✅ Bắt buộc | Scope definition |
| `ARCHITECTURE.md` | ⚠️ Nếu cần | Technical architecture (cho features phức tạp) |
| `TASKS.md` | ✅ Bắt buộc | Task breakdown |
| `DECISIONS.md` | ⚠️ Nên có | Architecture decisions log |
| `RETROSPECTIVE.md` | ⚠️ Sau khi xong | Post-completion retrospective |

## Scope Definition Checklist

**SCOPE.md phải có:**

- [ ] Mục tiêu rõ ràng (1-2 sentences)
- [ ] In-scope items (checklist)
- [ ] Out-of-scope items (checklist)
- [ ] Constraints (time, budget, tech)
- [ ] Assumptions
- [ ] Dependencies (external/internal)
- [ ] Risks (identified)

## Architecture Checklist

**ARCHITECTURE.md phải có:**

- [ ] Architecture diagram (Mermaid)
- [ ] Component description
- [ ] Data flow
- [ ] API contracts
- [ ] Data models
- [ ] Security considerations
- [ ] Performance considerations

## Task Breakdown Checklist

**TASKS.md phải có:**

- [ ] Tasks được break thành ≤ 4h blocks
- [ ] Priority assigned (P0/P1/P2)
- [ ] Dependencies noted
- [ ] Estimates in hours
- [ ] Acceptance criteria for each task

## Quality Gates

Trước khi gửi cho user review:

1. ✅ Scope có boundary rõ ràng
2. ✅ Architecture diagram present
3. ✅ Risks được identified
4. ✅ Tasks có estimates
5. ✅ Overall quality score ≥ 9.0

## Anti-patterns

### ❌ Không làm

- Planning without user approval
- Scope creep (thêm features không qua review)
- Vague task descriptions
- Không có risk assessment
- Estimates không realistic
- Bỏ qua dependencies

### ✅ Nên làm

- User approves scope trước
- Small, incremental planning
- Regular checkpoints
- Realistic estimates
- Clear acceptance criteria
- Document assumptions
