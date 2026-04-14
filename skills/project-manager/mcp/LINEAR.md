# Linear MCP 集成指南

> Linear — 专为快速迭代团队设计的项目管理工具，支持 AI 任务分类和智能分配。

## 目录

- [认证配置](#认证配置)
- [核心操作](#核心操作)
- [AI 任务管理](#ai-任务管理)
- [错误处理](#错误处理)
- [降级策略](#降级策略)

---

## 认证配置

### 步骤 1: 获取 API Key

1. 登录 Linear: https://linear.app
2. 进入 **Settings** → **API**
3. 点击 **Create API key**
4. 复制生成的 key（格式: `lin_api_xxxxx`）

### 步骤 2: 配置环境变量

```bash
# .env 或 shell 配置文件
export LINEAR_API_KEY="lin_api_xxxxxxxxxxxx"
```

### 步骤 3: MCP 配置

```json
// cursor-mcp.json 或 .mcp.json
{
  "mcpServers": {
    "linear": {
      "command": "npx",
      "args": ["-y", "@linear/mcp"]
    }
  }
}
```

### 步骤 4: 测试连接

```typescript
// MCP 工具调用
linear.test()
// 预期返回: { success: true, workspace: "your-workspace" }
```

---

## 核心操作

### 创建 Issue

```typescript
// 基本创建
linear.createIssue({
  teamId: "TEAM_ID",           // 必需: 团队 ID
  title: "实现用户认证模块",      // 必需: Issue 标题
  description: "支持 OAuth2 和本地登录",  // 可选: 描述
  assigneeId: "USER_ID",       // 可选: 分配给
  priority: 2,                 // 可选: 0-4 (0=无, 1=紧急, 2=高, 3=中, 4=低)
  labelIds: ["LABEL_ID"],      // 可选: 标签
  cycleId: "CYCLE_ID"          // 可选: 所属周期
})
```

### 获取 Issue 列表

```typescript
// 按团队筛选
linear.getIssues({
  filter: {
    teamId: { eq: "TEAM_ID" },
    state: { noteq: "completed" }
  },
  orderBy: "priority",
  first: 50
})

// 按周期获取
linear.getIssues({
  filter: {
    cycleId: { eq: "CYCLE_ID" }
  }
})
```

### 更新 Issue 状态

```typescript
// 状态流转
linear.updateIssue({
  id: "ISSUE_ID",
  stateId: "STATE_ID",         // 新状态 ID
  assigneeId: "USER_ID",        // 可选: 重新分配
  priority: 1                   // 可选: 调整优先级
})
```

### 批量操作

```typescript
// 批量更新状态
linear.bulkUpdate({
  ids: ["ID1", "ID2", "ID3"],
  stateId: "DONE_STATE_ID"
})

// 批量分配
linear.bulkUpdate({
  ids: ["ID1", "ID2", "ID3"],
  assigneeId: "NEW_USER_ID"
})
```

### 周期 (Sprint) 管理

```typescript
// 创建新周期
linear.createCycle({
  teamId: "TEAM_ID",
  name: "Sprint 24",
  startsAt: "2024-01-15",
  endsAt: "2024-01-29"
})

// 将 Issue 添加到周期
linear.updateIssue({
  id: "ISSUE_ID",
  cycleId: "CYCLE_ID"
})

// 完成周期
linear.completeCycle({
  id: "CYCLE_ID"
})
```

---

## AI 任务管理

### 智能分类

```typescript
// AI 自动路由到正确周期
linear.autoTriage({
  issueId: "ISSUE_ID",
  targetTeamId: "TEAM_ID"        // 可选: 特定团队
})
// 返回: { routed: true, cycleId: "...", confidence: 0.92 }
```

### 智能分配

```typescript
// 基于工作负载推荐分配
linear.suggestAssignee({
  issueId: "ISSUE_ID",
  strategy: "balanced"          // balanced | skill-match | availability
})
// 返回: { assigneeId: "USER_ID", workload: 65, score: 0.88 }
```

### AI 摘要生成

```typescript
// 生成 Issue 摘要
linear.summarizeIssue({
  issueId: "ISSUE_ID"
})
// 返回: { summary: "...", keyPoints: [...], estimatedHours: 4 }
```

---

## 错误处理

### Rate Limit (429)

```typescript
// 指数退避策略
async function withRetry(operation, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (error.code === 429) {
        const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
        await sleep(delay);
      } else {
        throw error;
      }
    }
  }
}
```

### 认证失败 (401)

```typescript
// 检测并重新认证
if (error.code === 401) {
  console.error("Linear API key 无效或已过期");
  console.log("请访问 https://linear.app/settings/api 重新生成");
  // 触发用户重新输入 token
}
```

### 超时处理

```typescript
// 带超时的请求
const response = await linear.getIssues({
  filter: { teamId: "TEAM_ID" },
  timeout: 5000  // 5秒超时
}).catch(() => cachedData);  // 降级到缓存
```

---

## 降级策略

当 Linear MCP 不可用时，按以下顺序降级：

### 1. Linear REST API

```bash
# 直接调用 REST API
curl -X GET "https://api.linear.app/graphql" \
  -H "Authorization: Bearer $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ issues { nodes { id title state { name } } } }"}'
```

### 2. GitHub Projects (备份)

参见 [GITHUB.md](./GITHUB.md) 集成 GitHub Projects 作为备份。

### 3. 手动操作 (最后手段)

```bash
# 打开 Linear Web
open https://linear.app/your-workspace
```

---

## 性能优化

### 缓存策略

```typescript
// 缓存频繁访问的数据
const cache = new Map();
const TTL = 5 * 60 * 1000; // 5分钟

async function getCachedIssues(teamId) {
  const key = `issues:${teamId}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < TTL) {
    return cached.data;
  }
  const data = await linear.getIssues({ filter: { teamId } });
  cache.set(key, { data, timestamp: Date.now() });
  return data;
}
```

### 批量请求

```typescript
// 使用批量操作减少 API 调用
const batchCreate = async (issues) => {
  const chunks = chunk(issues, 10);  // 每批10个
  for (const chunk of chunks) {
    await linear.bulkCreate(chunk);
  }
};
```

---

## 官方文档

- Linear API: https://developers.linear.app/docs
- GraphQL Playground: https://api.linear.app/graphql
- MCP SDK: https://github.com/linearunofficial/linear-mcp
