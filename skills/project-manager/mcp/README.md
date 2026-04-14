# MCP 集成文档总览

> 为 PM Skill v2.0 提供 Linear、GitHub Projects、Jira Rovo CLI 的 MCP 集成指南。

## 目录

| 文档 | 用途 | 适用场景 |
|------|------|----------|
| [LINEAR.md](./LINEAR.md) | Linear MCP 集成 | 快速迭代团队、AI 任务分类 |
| [GITHUB.md](./GITHUB.md) | GitHub Projects MCP | 代码优先团队、PR 状态跟踪 |
| [JIRA.md](./JIRA.md) | Jira Rovo Dev CLI | 企业级、复杂工作流 |
| [QUICKREF.md](./QUICKREF.md) | 快速参考卡片 | 快速查询命令和选项 |

## 快速开始

### 1. Linear MCP
```bash
# 安装
npm install @linear/mcp

# 配置环境变量
export LINEAR_API_KEY=your_api_key

# 测试连接
linear.test()
```

### 2. GitHub Projects MCP
```bash
# 安装
npm install @modelcontextprotocol/server-github

# 配置 GitHub Token
export GITHUB_TOKEN=your_github_token

# 验证项目访问
githubProjects.list()
```

### 3. Jira Rovo CLI
```bash
# 安装
npm install -g @atlassian/rovo-dev

# 登录
rovo login

# 创建分支
rovo issue develop --issue PROJ-123 --branch feature/auth
```

## 认证矩阵

| 工具 | 认证方式 | 环境变量 | Token 作用域 |
|------|----------|----------|--------------|
| Linear | API Key | `LINEAR_API_KEY` | 无需特定作用域 |
| GitHub | Personal Access Token | `GITHUB_TOKEN` | `repo`, `read:project` |
| Jira | SSO/OAuth | 自动管理 | `write:issue` |

## 错误处理策略

所有 MCP 工具均遵循统一错误处理：

```
Rate Limit → 指数退避重试 (1s, 2s, 4s, max 3次)
Auth Failure → 重新认证 + 通知用户
Timeout → 使用缓存数据 + 后台重试
Network Error → 降级到 CLI 命令
```

## 官方文档链接

- Linear MCP: https://developers.linear.app/docs
- GitHub MCP: https://github.com/github/github-mcp-server
- Jira Rovo: https://developer.atlassian.com/tutorials/rovo-dev/

## 下一阶段

完成 MCP 集成后，参考 [QUICKREF.md](./QUICKREF.md) 获取快速命令参考。
