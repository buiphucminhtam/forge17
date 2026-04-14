# MCP 快速参考卡

> PM Skill v2.0 MCP 集成速查表

---

## 工具对比矩阵

| 工具 | 最佳场景 | 认证方式 | 主要优势 | 降级方案 |
|------|----------|----------|----------|----------|
| **Linear** | 快速迭代团队 | API Key | AI 分类、智能分配 | GitHub Projects |
| **GitHub** | 代码优先团队 | PAT Token | PR 状态、Copilot | Linear |
| **Jira Rovo** | 企业级工作流 | SSO/OAuth | 代码生成、PR 审查 | Jira REST API |

---

## Linear MCP 速查

### 认证
```bash
export LINEAR_API_KEY="lin_api_xxxxx"
```

### Issue 操作
```typescript
// 创建
linear.createIssue({ teamId: "TID", title: "任务", priority: 2 })

// 获取列表
linear.getIssues({ filter: { teamId: "TID" }, orderBy: "priority" })

// 更新
linear.updateIssue({ id: "IID", stateId: "SID" })

// AI 智能分配
linear.suggestAssignee({ issueId: "IID", strategy: "balanced" })
```

### 常见错误
```
Rate Limit → 等待 60s 重试
Auth 失败 → 重新生成 API Key
Timeout → 使用缓存数据
```

---

## GitHub Projects MCP 速查

### 认证
```bash
export GITHUB_TOKEN="ghp_xxxxx"  # 需要 repo + read:project + write:project
```

### 项目操作
```typescript
// 列出项目
githubProjects.list()

// 添加 Issue
githubProjects.addItem({ projectId: "PVT_xxx", contentId: "node_id", field: "Status", value: "In Progress" })

// 更新字段
githubProjects.updateItem({ projectId: "PVT_xxx", itemId: "PVTI_xxx", field: "Sprint", value: "Sprint 24" })

// 批量更新
githubProjects.bulkUpdate({ projectId: "PVT_xxx", itemIds: ["ID1","ID2"], field: "Status", value: "Done" })
```

### 常见错误
```
"Project not found" → 检查 PVT_ 前缀
权限不足 (403) → Token 缺少 write:project
Rate Limit → 使用缓存 + 延迟重试
```

---

## Jira Rovo CLI 速查

### 安装认证
```bash
npm install -g @atlassian/rovo-dev
rovo login
```

### Issue 命令
```bash
# 查看
rovo issue view PROJ-123

# 创建
rovo issue create --project PROJ --title "任务" --type story

# 状态流转
rovo issue transition PROJ-123 --status "In Review"

# 子任务
rovo issue subtask --issue PROJ-123 --count 5
```

### 代码生成
```bash
# 基础生成
rovo issue develop --issue PROJ-123 --branch feature/auth

# 预览
rovo issue develop --issue PROJ-123 --dry-run

# 仅测试
rovo issue develop --issue PROJ-123 --test-only
```

### PR 审查
```bash
# 基础审查
rovo pr review --pr 123

# 验收标准
rovo pr review --pr 123 --criteria acceptance.md
```

### Sprint 管理
```bash
# 创建冲刺
rovo sprint create --project PROJ --name "Sprint 24" --duration "2 weeks"

# 当前冲刺
rovo sprint current --project PROJ

# 添加到冲刺
rovo sprint add PROJ-123 --sprint "Sprint 24"
```

### 常见错误
```
Auth expired → rovo login
Permission denied → 检查权限配置
AI timeout → 设置 ROVO_MODEL=claude-3-haiku
```

---

## 自动化脚本模板

### Linear → GitHub 同步
```typescript
// sync-linear-to-github.ts
async function syncIssue(linearIssue) {
  await githubProjects.addItem({
    projectId: "PVT_xxx",
    contentId: linearIssue.nodeId,
    field: "Status",
    value: mapLinearState(linearIssue.state)
  });
}
```

### Jira 冲刺自动化
```typescript
// sprint-report.ts
const report = await rovo.sprint.generateReport({ sprintId: sprint.id });
await notify({ channel: '#sprints', message: formatReport(report) });
```

---

## 环境变量速查

```bash
# Linear
LINEAR_API_KEY=lin_api_xxxxx

# GitHub
GITHUB_TOKEN=ghp_xxxxx

# Jira Rovo
ROVO_SITE=company.atlassian.net
ROVO_DEFAULT_PROJECT=PROJ
ROVO_BRANCH_PREFIX=feature
ROVO_MODEL=claude-3-5-sonnet
```

---

## 故障排除速查

| 问题 | Linear | GitHub | Jira |
|------|--------|--------|------|
| Rate Limit | 指数退避 | GraphQL 缓存 | 降低请求频率 |
| Auth 过期 | 重新生成 Key | 刷新 Token | `rovo login` |
| 项目找不到 | 检查 Team ID | 检查 PVT_ 前缀 | 检查项目 Key |
| 权限不足 | 检查 API Key 权限 | Token 作用域 | 用户权限 |
| 超时 | 启用缓存 | 批量查询 | 增加 timeout |

---

## 性能优化建议

### Linear
- 启用 Issue 缓存 (TTL: 5分钟)
- 使用批量操作代替单次调用
- 限制查询范围

### GitHub
- 使用 GraphQL 减少请求数
- 缓存项目结构
- 批量更新 Item

### Jira
- 减少 AI 调用的频率
- 脚本执行避开高峰期
- 使用本地模板

---

## 官方链接

| 工具 | 文档地址 |
|------|----------|
| Linear API | https://developers.linear.app/docs |
| GitHub MCP | https://github.com/github/github-mcp-server |
| Jira Rovo | https://developer.atlassian.com/tutorials/rovo-dev/ |

---

*最后更新: 2026-04-14*
