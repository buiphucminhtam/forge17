# PM Tool Templates

> 项目管理工具专用模板库，覆盖 Jira、Linear、ClickUp、Asana 四大主流工具。

---

## 目录结构

```
.forgewright/project-manager/templates/
├── README.md                    # 本文件 - 概述与快速入门
├── BASE/                       # 工具无关的基础模板
│   ├── sprint-planning.md      # 冲刺规划模板
│   ├── risk-register.md        # 风险登记表模板
│   └── retro-template.md       # 冲刺回顾模板
├── JIRA/                       # Jira 专用模板
│   ├── sprint-planning.md      # Jira Sprint 规划
│   ├── epic-story-breakdown.md # Epic → Story 分解
│   ├── definition-of-done.md   # 完成定义 (DoD)
│   ├── risk-register.md        # Jira 风险登记
│   └── sprint-retro.md         # Jira 冲刺回顾
├── LINEAR/                     # Linear 专用模板
│   ├── project-setup.md        # 项目初始化配置
│   ├── cycle-config.md         # Cycle 配置
│   ├── bulk-tasks.md           # 批量任务管理
│   └── ai-triage-rules.md      # AI Triage 规则
├── CLICKUP/                    # ClickUp 专用模板
│   ├── okr-dashboard.md        # OKR 仪表板
│   ├── sprint-board.md         # Sprint 看板
│   ├── ai-standup-config.md    # AI Standup 配置
│   └── super-agent-setup.md    # Super Agent 设置
└── ASANA/                      # Asana 专用模板
    ├── ai-studio-workflow.md    # AI Studio 工作流
    ├── portfolio-dashboard.md   # Portfolio 仪表板
    ├── okr-mapping.md          # OKR 映射
    └── ai-teammate-onboarding.md # AI Teammate 入住
```

---

## 快速开始

### 1. 选择你的工具

| 工具 | 特点 | 最佳场景 |
|------|------|----------|
| **Jira** | 企业级，功能全面 | 大型团队，复杂项目 |
| **Linear** | 简洁快速，开发者友好 | 快速迭代的初创/中型团队 |
| **ClickUp** | AI 功能强大，一体化 | 需要 AI 辅助的项目管理 |
| **Asana** | AI Studio 自动化 | 跨团队协作，OKR 驱动 |

### 2. 选择模板类型

| 需求 | 推荐模板 |
|------|----------|
| 冲刺规划 | `BASE/sprint-planning.md` 或 `JIRA/sprint-planning.md` |
| 风险管理 | `BASE/risk-register.md` 或 `JIRA/risk-register.md` |
| 冲刺回顾 | `BASE/retro-template.md` 或 `JIRA/sprint-retro.md` |
| 项目初始化 | `LINEAR/project-setup.md` |
| OKR 管理 | `CLICKUP/okr-dashboard.md` 或 `ASANA/okr-mapping.md` |
| 自动化工作流 | `LINEAR/ai-triage-rules.md` 或 `ASANA/ai-studio-workflow.md` |

### 3. 自定义模板

1. 复制模板到你的工作目录
2. 替换 `[占位符]` 为实际值
3. 根据团队需求调整格式
4. 保存为团队标准模板

---

## 模板使用指南

### Base 模板 (工具无关)

基础模板适用于任何项目管理工具，提供标准化的结构和格式。

**适用场景：**
- 需要跨工具迁移
- 团队使用多种工具
- 想要统一格式

**文件说明：**
- `sprint-planning.md` — 冲刺规划标准模板
- `risk-register.md` — 风险登记标准模板
- `retro-template.md` — 冲刺回顾标准模板

### Jira 模板

Jira 模板利用 Jira 的特定字段、工作流和自动化功能。

**Jira 特有的优势：**
- Epic-Story 子任务层级
- JQL 查询示例
- Automation Rules 配置
- Sprint Report 集成

**使用步骤：**
1. 在 Jira 创建对应项目
2. 复制模板内容到 Jira Issue Description
3. 使用 Jira Automation 规则
4. 导入 JQL 查询

### Linear 模板

Linear 模板专注于快速执行和 AI 驱动的分类。

**Linear 特有的优势：**
- Cycle 配置
- API 批量操作
- AI Triage Rules
- 简洁的 YAML 配置

**使用步骤：**
1. 在 Linear 创建项目
2. 应用 `project-setup.md` 配置
3. 使用 `cycle-config.md` 创建 Cycle
4. 配置 AI Triage Rules

### ClickUp 模板

ClickUp 模板利用其强大的 AI 功能（ClickUp Brain）。

**ClickUp 特有的优势：**
- AI 生成摘要
- OKR 仪表板
- AI Standup 自动收集
- Super Agent 自定义

**使用步骤：**
1. 在 ClickUp 创建 Space/Folder
2. 使用模板配置 List/Board
3. 启用 ClickUp Brain
4. 配置 AI 功能

### Asana 模板

Asana 模板利用 AI Studio 的工作流自动化。

**Asana 特有的优势：**
- AI Studio Workflow 配置
- Portfolio 多项目管理
- OKR 映射与级联
- AI Teammate 个性化

**使用步骤：**
1. 在 Asana 创建 Portfolio
2. 配置 AI Studio Workflow
3. 使用 OKR Mapping 模板
4. 设置 AI Teammate

---

## 模板内容预览

### Sprint Planning 模板结构

```markdown
## Sprint Information
- Sprint Name: [Name]
- Duration: [X weeks]
- Start Date: [Date]
- End Date: [Date]

## Sprint Goal
[One sentence objective]

## Team Capacity
| Member | Story Points | Notes |

## Sprint Backlog
| Priority | Story | Points | Assignee |

## Definition of Done
- [ ] Code complete
- [ ] Tests written
- [ ] Code reviewed
```

### OKR Dashboard 模板结构

```markdown
## Objective 1: [Title]
**Owner:** [Name]

### Key Results
| KR | Description | Owner | Current | Target | Status |
|----|-------------|-------|---------|--------|--------|

### Progress Updates
[AI-generated summary]
```

---

## 配置示例

### Jira Sprint 创建

```jql
project = AUTH AND sprint = "Sprint 24"
ORDER BY priority DESC
```

### Linear Cycle 配置

```yaml
cycle:
  name: "Sprint-24"
  starts_at: "2026-04-14"
  ends_at: "2026-04-25"
```

### ClickUp AI Workflow

```yaml
workflow:
  name: "Bug Triage"
  trigger:
    type: task_added
    filter: "tags contains bug"
  ai_model: "GPT-4"
```

### Asana OKR 映射

```yaml
mapping:
  enabled: true
  bidirectional: true
  
  rules:
    - task_completes: "Update KR progress"
```

---

## 最佳实践

### 1. 模板定制
- 先使用模板结构
- 根据团队流程调整
- 保持跨工具一致性

### 2. 自动化规则
- 从简单规则开始
- 逐步增加复杂规则
- 定期审查规则有效性

### 3. 指标追踪
- 使用模板中的指标字段
- 每周回顾数据
- 根据数据调整流程

### 4. 团队协作
- 让团队参与模板选择
- 收集反馈持续改进
- 分享成功案例

---

## 模板统计

| 工具 | 模板数量 | 特点 |
|------|----------|------|
| BASE | 3 | 工具无关 |
| Jira | 5 | 企业级功能 |
| Linear | 4 | 开发者友好 |
| ClickUp | 4 | AI 驱动 |
| Asana | 4 | 工作流自动化 |
| **总计** | **20** | — |

---

## 相关资源

- [Forgewright PM Skill](file://skills/project-manager/SKILL.md)
- [Jira Documentation](https://support.atlassian.com/jira-software)
- [Linear Documentation](https://docs.linear.app)
- [ClickUp Documentation](https://clickup.com/docs)
- [Asana Documentation](https://developers.asana.com/docs)

---

## 更新日志

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-04-14 | 初始版本，包含 20 个模板 |
