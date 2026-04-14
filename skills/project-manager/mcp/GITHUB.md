# GitHub Projects MCP 集成指南

> GitHub Projects — 代码优先团队的项目管理，支持原生 Copilot 集成和 PR 状态跟踪。

## 目录

- [认证配置](#认证配置)
- [项目操作](#项目操作)
- [Issue 管理](#issue-管理)
- [Sprint 面板](#sprint-面板)
- [错误处理](#错误处理)
- [降级策略](#降级策略)

---

## 认证配置

### 步骤 1: 创建 GitHub Token

1. 访问: https://github.com/settings/tokens
2. 点击 **Generate new token (classic)**
3. 设置令牌名称: `forgewright-mcp`
4. 勾选所需作用域:

| 作用域 | 用途 |
|--------|------|
| `repo` | 访问仓库 Issues 和 PRs |
| `read:project` | 读取项目板 |
| `write:project` | 更新项目字段 |

### 步骤 2: 配置环境变量

```bash
# .env 或 shell 配置文件
export GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxx"
```

### 步骤 3: MCP 配置

```json
// cursor-mcp.json
{
  "mcpServers": {
    "github-projects": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"]
    }
  }
}
```

### 步骤 4: 获取项目 ID

```typescript
// 列出用户项目
githubProjects.list()
// 返回: [{ id: "PVT_xxx", name: "My Project", number: 1 }]

// 获取组织项目
githubProjects.list({
  organization: "your-org"
})
```

---

## 项目操作

### 获取项目信息

```typescript
// 获取项目详情
githubProjects.getProject({
  projectId: "PVT_xxx"
})
// 返回: { id, name, number, url, columns: [...], fields: [...] }
```

### 创建项目

```typescript
// 创建用户项目
githubProjects.createProject({
  name: "Q1 2026 Roadmap",
  owner: "username",
  description: "Q1 产品路线图"
})

// 创建组织项目
githubProjects.createProject({
  name: "Engineering Sprint Board",
  organization: "your-org",
  visibility: "PRIVATE"
})
```

### 管理字段

```typescript
// 添加新字段
githubProjects.addField({
  projectId: "PVT_xxx",
  name: "Sprint",
  type: "single_select",
  options: ["Sprint 1", "Sprint 2", "Sprint 3", "Backlog"]
})

// 添加数值字段
githubProjects.addField({
  projectId: "PVT_xxx",
  name: "Story Points",
  type: "number"
})

// 添加日期字段
githubProjects.addField({
  projectId: "PVT_xxx",
  name: "Target Date",
  type: "date"
})
```

---

## Issue 管理

### 添加 Issue 到项目

```typescript
// 获取 Issue Node ID
const issue = await github.getIssue({
  owner: "owner",
  repo: "repo",
  issueNumber: 123
})

// 添加到项目
githubProjects.addItem({
  projectId: "PVT_xxx",
  contentId: issue.node_id,      // Issue 的 GraphQL Node ID
  field: "Status",
  value: "In Progress"
})
```

### 更新项目字段

```typescript
// 更新状态
githubProjects.updateItem({
  projectId: "PVT_xxx",
  itemId: "PVTI_xxx",            // 项目项 ID
  field: "Status",
  value: "Done"
})

// 更新 Sprint
githubProjects.updateItem({
  projectId: "PVT_xxx",
  itemId: "PVTI_xxx",
  field: "Sprint",
  value: "Sprint 24"
})

// 更新分配人
githubProjects.updateItem({
  projectId: "PVT_xxx",
  itemId: "PVTI_xxx",
  field: "Assignee",
  value: "username"
})

// 更新优先级
githubProjects.updateItem({
  projectId: "PVT_xxx",
  itemId: "PVTI_xxx",
  field: "Priority",
  value: "High"
})
```

### 批量更新

```typescript
// 批量移动到新状态
githubProjects.bulkUpdate({
  projectId: "PVT_xxx",
  itemIds: ["PVTI_1", "PVTI_2", "PVTI_3"],
  field: "Status",
  value: "In Review"
})
```

---

## Sprint 面板

### 创建 Sprint 视图

```typescript
// 创建迭代视图
githubProjects.createView({
  projectId: "PVT_xxx",
  name: "Current Sprint",
  filter: {
    field: "Sprint",
    value: "Sprint 24"
  },
  groupBy: "Status",
  sortBy: "Priority"
})
```

### 自动化规则

```typescript
// 设置自动规则
githubProjects.createAutomation({
  projectId: "PVT_xxx",
  trigger: {
    type: "status_change",
    from: "In Review",
    to: "Done"
  },
  actions: [
    {
      type: "set_field",
      field: "Sprint",
      value: "Completed"
    },
    {
      type: "notify",
      channel: "#engineering"
    }
  ]
})
```

### Sprint 统计

```typescript
// 获取 Sprint 数据
githubProjects.getSprintMetrics({
  projectId: "PVT_xxx",
  sprintField: "Sprint",
  sprintValue: "Sprint 24"
})
// 返回: { total: 15, completed: 8, inProgress: 4, blocked: 1, todo: 2 }
```

---

## PR 状态集成

### 链接 PR 到项目

```typescript
// 获取 PR Node ID
const pr = await github.getPullRequest({
  owner: "owner",
  repo: "repo",
  pullNumber: 456
})

// 添加到项目
githubProjects.addItem({
  projectId: "PVT_xxx",
  contentId: pr.node_id,
  field: "Status",
  value: "In Review"
})
```

### 自动更新 PR 状态

```typescript
// 设置基于 PR 状态的自动化
githubProjects.createAutomation({
  projectId: "PVT_xxx",
  trigger: {
    type: "linked_pr_merged"
  },
  actions: [
    {
      type: "set_field",
      field: "Status",
      value: "Done"
    }
  ]
})
```

### PR 审查状态

```typescript
// 获取关联 PR 的审查状态
githubProjects.getLinkedPRStatus({
  projectId: "PVT_xxx",
  itemId: "PVTI_xxx"
})
// 返回: { prNumber: 456, status: "approved", reviews: [...], checks: "passing" }
```

---

## 错误处理

### 项目未找到 (404)

```typescript
// 检查 PVT_ 前缀
if (error.message.includes("Could not resolve to a Project")) {
  console.error("项目 ID 格式错误或项目不存在");
  console.log("确保使用 PVT_ 前缀的全局项目 ID");
  // 列出可用项目
  const projects = await githubProjects.list();
  console.log("可用项目:", projects.map(p => p.id));
}
```

### 权限不足 (403)

```typescript
if (error.status === 403) {
  console.error("缺少项目写入权限");
  console.log("请确保 Token 包含 write:project 作用域");
  // 请求权限
  await notifyUser({
    message: "需要 GitHub 项目写入权限",
    action: "打开 https://github.com/settings/tokens 重新生成 Token"
  });
}
```

### Rate Limit

```typescript
// GraphQL API 限制处理
const { rateLimit } = await githubProjects.getProjectRateLimit();
if (rateLimit.remaining < 10) {
  const waitTime = rateLimit.resetAt - Date.now();
  console.log(`Rate limit 接近，请等待 ${Math.ceil(waitTime/1000)} 秒`);
  await sleep(waitTime);
}
```

---

## 降级策略

### 1. GitHub GraphQL API 直接调用

```bash
# 使用 gh CLI
gh api graphql -f query='
  query {
    projectV2(number: 1) {
      id
      title
      items(first: 20) {
        nodes {
          id
          content {
            ... on Issue { title }
            ... on PullRequest { title }
          }
        }
      }
    }
  }
'
```

### 2. GitHub CLI 命令

```bash
# 查看项目
gh project view 1 --owner username

# 添加 issue 到项目
gh project item-add 1 --issue 123 --url https://github.com/owner/repo
```

### 3. Linear 作为备份

参见 [LINEAR.md](./LINEAR.md) 集成 Linear 作为备用项目管理工具。

---

## 性能优化

### 批量 GraphQL 查询

```typescript
// 使用 fragments 减少请求
const query = `
  query GetProject($projectId: ID!) {
    node(id: $projectId) {
      ... on ProjectV2 {
        items(first: 50) {
          nodes {
            id
            fieldValues(first: 10) {
              nodes {
                ... on ProjectV2ItemFieldTextValue { text field { ... on ProjectV2Field { name } } }
                ... on ProjectV2ItemFieldSingleSelectValue { name field { ... on ProjectV2Field { name } } }
              }
            }
          }
        }
      }
    }
  }
`;
```

### 缓存策略

```typescript
const projectCache = new Map();
const CACHE_TTL = 2 * 60 * 1000; // 2分钟

async function getCachedProject(projectId) {
  const cached = projectCache.get(projectId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  const data = await githubProjects.getProject({ projectId });
  projectCache.set(projectId, { data, timestamp: Date.now() });
  return data;
}
```

---

## 官方文档

- GitHub MCP Server: https://github.com/github/github-mcp-server
- GraphQL API: https://docs.github.com/en/graphql
- Projects API: https://docs.github.com/en/rest/projects
