# Model Usage Tracking - Tasks

## Progress Checklist

- [x] P0-01: Create CursorDBReader class
- [x] P0-02: Add `/api/cursor/models` endpoint
- [x] P0-03: Test Cursor DB reading
- [x] P1-01: Create UnifiedAggregator
- [x] P1-02: Add source tabs to dashboard
- [x] P1-03: Add model comparison chart
- [x] P2-01: Add cost estimation
- [x] P2-02: Add per-project breakdown

## All tasks completed ✅

---

## P0 Tasks (Foundation)

### P0-01: CursorDBReader Class
**File:** `scripts/token-api-server.py`
**Effort:** 1h
**Status:** Not Started

```python
class CursorDBReader:
    """Read usage data from Cursor's SQLite database"""
    
    DB_PATH = Path.home() / ".cursor/ai-tracking/ai-code-tracking.db"
    
    def __init__(self):
        if not self.DB_PATH.exists():
            raise FileNotFoundError(f"Cursor DB not found: {self.DB_PATH}")
        self.conn = sqlite3.connect(self.DB_PATH)
    
    def get_model_stats(self) -> List[Dict]:
        """Get aggregated model usage stats"""
        sql = """
            SELECT 
                model,
                COUNT(*) as call_count,
                COUNT(DISTINCT conversationId) as conversations
            FROM ai_code_hashes
            WHERE model IS NOT NULL AND model != 'default'
            GROUP BY model
            ORDER BY call_count DESC
        """
        return self._execute(sql)
    
    def get_conversation_models(self) -> List[Dict]:
        """Get per-conversation model info"""
        sql = """
            SELECT 
                conversationId,
                model,
                title,
                updatedAt
            FROM conversation_summaries
            WHERE model IS NOT NULL
            ORDER BY updatedAt DESC
            LIMIT 100
        """
        return self._execute(sql)
    
    def _execute(self, sql: str) -> List[Dict]:
        cursor = self.conn.execute(sql)
        columns = [desc[0] for desc in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
```

**Acceptance Criteria:**
- [ ] Returns list of {model, call_count, conversations}
- [ ] Handles missing DB gracefully
- [ ] Works when Cursor is running

---

### P0-02: API Endpoint
**File:** `scripts/token-api-server.py`
**Effort:** 30m
**Status:** Not Started

```python
@app.route('/api/cursor/models')
def cursor_models():
    """Get Cursor model usage stats"""
    try:
        reader = CursorDBReader()
        return jsonify({
            'models': reader.get_model_stats(),
            'conversations': reader.get_conversation_models()[:10]
        })
    except FileNotFoundError:
        return jsonify({'error': 'Cursor DB not found', 'models': [], 'conversations': []}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

**Acceptance Criteria:**
- [ ] Returns JSON with models array
- [ ] 404 if Cursor DB not found
- [ ] Handles errors gracefully

---

### P0-03: Test Cursor DB Reading
**Effort:** 30m
**Status:** Not Started

```bash
# Manual test
curl http://localhost:8890/api/cursor/models | python3 -m json.tool
```

**Expected Output:**
```json
{
    "models": [
        {"model": "claude-4.6-opus-max-thinking-fast", "call_count": 125061, "conversations": 150},
        {"model": "gpt-5.4-high-fast", "call_count": 27714, "conversations": 89},
        ...
    ]
}
```

---

## P1 Tasks (Dashboard)

### P1-01: UnifiedAggregator
**File:** `scripts/token-api-server.py`
**Effort:** 1h
**Status:** Not Started

```python
class UnifiedAggregator:
    """Merge usage from multiple sources"""
    
    def aggregate(self, cursor_data: List[Dict], forgewright_data: Dict) -> Dict:
        # Merge by model
        # Add source field
        # Normalize model names
        pass
```

---

### P1-02: Source Tabs
**File:** `scripts/token-dashboard.html`
**Effort:** 1h
**Status:** Not Started

Add tabs:
- [ ] All Sources
- [ ] Cursor Only
- [ ] Forgewright Only

---

### P1-03: Model Comparison Chart
**File:** `scripts/token-dashboard.html`
**Effort:** 1h
**Status:** Not Started

Add bar chart comparing model usage across sources.

---

## P2 Tasks (Enhancements)

### P2-01: Cost Estimation
**Effort:** 1h
**Status:** Not Started

Add estimated costs based on:
- Model pricing (public data)
- Call counts
- Average tokens per call (estimated)

---

### P2-02: Per-Project Breakdown
**Effort:** 1h
**Status:** Not Started

If project path available from Cursor conversations, aggregate by project.

---

## Time Log

| Task | Started | Completed | Actual Time |
|------|---------|-----------|-------------|
| P0-01 | - | - | - |
| P0-02 | - | - | - |
| P0-03 | - | - | - |
| P1-01 | - | - | - |
| P1-02 | - | - | - |
| P1-03 | - | - | - |
| P2-01 | - | - | - |
| P2-02 | - | - | - |
