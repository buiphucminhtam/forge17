# Model Usage Tracking - Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Token Dashboard                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │
│  │  Cursor DB  │  │ Forgewright │  │  (Future) API   │   │
│  │  Reader     │  │   Reader    │  │    Readers      │   │
│  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘   │
│         │                 │                   │             │
│         └────────────┬────┴───────────────────┘             │
│                      ▼                                      │
│         ┌────────────────────────┐                          │
│         │   Unified Aggregator   │                          │
│         │   - Merge by date      │                          │
│         │   - Deduplicate        │                          │
│         │   - Normalize models   │                          │
│         └────────────┬───────────┘                          │
│                      ▼                                      │
│         ┌────────────────────────┐                          │
│         │   Dashboard Renderer   │                          │
│         │   - Charts (Chart.js)   │                          │
│         │   - Tables             │                          │
│         └────────────────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

## Data Models

### UnifiedUsageRecord
```python
class UnifiedUsageRecord:
    timestamp: datetime
    source: str           # "cursor" | "forgewright" | "claude-code"
    model: str            # Full model name
    provider: str         # "anthropic" | "openai" | "google"
    count: int            # For Cursor: frequency
    tokens: Optional[int]  # Actual tokens (if available)
    cost: Optional[float]  # Estimated cost
    project: Optional[str]  # Project name (if available)
    conversation_id: Optional[str]
```

### Provider Detection
```python
MODEL_PROVIDER_MAP = {
    "claude": "anthropic",
    "gpt": "openai",
    "gemini": "google",
    "ollama": "local",
}

def detect_provider(model: str) -> str:
    model_lower = model.lower()
    for prefix, provider in MODEL_PROVIDER_MAP.items():
        if model_lower.startswith(prefix):
            return provider
    return "unknown"
```

### Cost Estimation
```python
# Public pricing (simplified)
PRICING = {
    "anthropic": {
        "claude-4.6-opus-max-thinking-fast": 0.015,  # per 1K input
        "claude-3-5-sonnet-20241022": 0.003,
    },
    "openai": {
        "gpt-5.4-high-fast": 0.01,
        "gpt-4o": 0.005,
    }
}
```

## Components

### 1. CursorDBReader
```python
class CursorDBReader:
    def __init__(self, db_path: str = "~/.cursor/ai-tracking/ai-code-tracking.db"):
        self.db_path = Path(db_path).expanduser()

    def get_conversations(self) -> List[Dict]:
        """Get all conversations with models"""
        sql = """
            SELECT conversationId, model, title, updatedAt
            FROM conversation_summaries
            ORDER BY updatedAt DESC
        """
        return self.execute(sql)

    def get_code_hashes(self) -> List[Dict]:
        """Get code changes with models"""
        sql = """
            SELECT model, COUNT(*) as count, MAX(createdAt) as lastUsed
            FROM ai_code_hashes
            GROUP BY model
        """
        return self.execute(sql)
```

### 2. ForgewrightReader
```python
class ForgewrightReader:
    def get_usage(self, project: str, days: int = 7) -> List[Dict]:
        """Read usage records from ~/.forgewright/usage/"""
        base_path = Path.home() / ".forgewright" / "usage" / project
        # ... read .jsonl files
```

### 3. UnifiedAggregator
```python
class UnifiedAggregator:
    def aggregate(self, cursor_data, forgewright_data) -> Dict:
        return {
            "by_source": {...},
            "by_model": {...},
            "by_day": {...},
            "total": {...}
        }
```

## API Server Enhancement

Extend `token-api-server.py`:

```python
# New endpoints
@app.route('/api/cursor/models')
def cursor_models():
    reader = CursorDBReader()
    return jsonify(reader.get_code_hashes())

@app.route('/api/unified/usage')
def unified_usage():
    cursor = CursorDBReader().get_code_hashes()
    forgewright = ForgewrightReader().get_usage(project)
    return jsonify(UnifiedAggregator().aggregate(cursor, forgewright))
```

## Dashboard Updates

```javascript
// New API calls
async function loadCursorModels() {
    const res = await fetch(API_BASE + '/api/cursor/models');
    const data = await res.json();
    updateCursorModelList(data);
}
```
