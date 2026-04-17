# Model Usage Tracking - Scope Definition

## Mục tiêu
Track chính xác model usage từ Cursor, Claude Code, Forgewright và các nền tảng khác để hiểu chi phí, tối ưu hóa, và đưa ra recommendations.

## Trong Scope

### Data Sources
| Source | Data Type | Feasibility |
|--------|-----------|-------------|
| Cursor DB (`~/.cursor/ai-tracking/ai-code-tracking.db`) | Model frequency, conversations | ✅ HIGH |
| Forgewright usage (`~/.forgewright/usage/`) | Per-skill breakdown | ✅ HIGH |
| Anthropic API | Actual tokens, costs | ⚠️ MEDIUM (needs API key) |
| OpenAI API | Actual tokens, costs | ⚠️ MEDIUM (needs API key) |

### Features
- [ ] Đọc Cursor SQLite database
- [ ] Parse conversation_summaries (model per conversation)
- [ ] Parse ai_code_hashes (model per code change)
- [ ] Aggregate by model
- [ ] Aggregate by source (cursor, forgewright, claude-code)
- [ ] Dashboard với charts
- [ ] Export reports (JSON, CSV)

### Dashboard Views
- [ ] Overview: Total usage by source
- [ ] Model breakdown: Which models used most
- [ ] Trend: Usage over time
- [ ] Cost estimation (based on public pricing)
- [ ] Per-project breakdown

## Ngoài Scope
- Real-time API interception
- Proxy-based tracking
- Modifying Cursor/source behavior
- Direct provider API calls (sẽ add sau nếu user cung cấp API keys)

## Constraints
- Must be local-only (privacy)
- No external API calls (except optional provider APIs)
- Must work offline

## Success Criteria
1. ✅ Accurately shows Cursor model usage (frequency)
2. ✅ Shows Forgewright usage per skill
3. ✅ Dashboard loads < 2 seconds
4. ✅ No data leaves local machine
