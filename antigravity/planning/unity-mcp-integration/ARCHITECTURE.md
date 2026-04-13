# Unity-MCP Integration Architecture

## Overview

Integration architecture connecting Forgewright's production-quality Unity skills with Unity-MCP's Editor automation tools.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Forgewright Pipeline                        │
├─────────────────────────────────────────────────────────────────┤
│  Game Designer → Unity Engineer → Unity Shader Artist          │
│                → Unity Multiplayer → QA                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Unity-MCP Bridge                             │
├─────────────────────────────────────────────────────────────────┤
│  Forgewright Tasks              Unity-MCP Tools                 │
│  ─────────────────             ─────────────────                │
│  Architecture Design     →     (No Editor needed)              │
│  Scene Setup            →     gameobject-create/modify         │
│  Material Assignment    →     assets-material-create           │
│  Component Wiring       →     gameobject-component-add         │
│  Prefab Setup          →     assets-prefab-create             │
│  Testing               →     tests-run, console-get-logs       │
│  Visual Verification   →     screenshot-*                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Unity Editor                                 │
├─────────────────────────────────────────────────────────────────┤
│  Unity-MCP Plugin                                             │
│  ├── MCP Server (stdio/http)                                   │
│  ├── Tool Handlers                                            │
│  └── Skill Generator                                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### Flow 1: Architecture-First (No Editor)

```
Forgewright                  Unity-MCP              Unity Editor
    │                           │                       │
    │  Design SO framework      │                       │
    │──────────────────────────>│                       │
    │                           │                       │
    │  Generate C# code         │                       │
    │──────────────────────────>│                       │
    │                           │                       │
    │  Create .cs files        │                       │
    │──────────────────────────────────────────────────>│
    │                           │                       │
    │  (No interaction)        │                       │
```

**Use Case:** Architecture design, SO framework, gameplay logic implementation

### Flow 2: Editor Automation

```
Forgewright                  Unity-MCP              Unity Editor
    │                           │                       │
    │  Define scene structure   │                       │
    │──────────────────────────>│                       │
    │                           │                       │
    │                           │  gameobject-create    │
    │                           │──────────────────────>│
    │                           │                       │
    │                           │  Assign materials     │
    │                           │──────────────────────>│
    │                           │                       │
    │  Code review & validate   │                       │
    │─────────────────────────────────────────────────────
```

**Use Case:** Scene setup, prefab assembly, material assignment

### Flow 3: Testing & Verification

```
Forgewright                  Unity-MCP              Unity Editor
    │                           │                       │
    │  Define test scenarios     │                       │
    │──────────────────────────>│                       │
    │                           │                       │
    │                           │  tests-run            │
    │                           │──────────────────────>│
    │                           │                       │
    │                           │  screenshot-*         │
    │                           │──────────────────────>│
    │                           │                       │
    │  Receive results          │                       │
    │<─────────────────────────│                       │
    │                           │                       │
    │  Quality gate check       │                       │
```

**Use Case:** PlayMode tests, visual verification, console log analysis

---

## Component Interactions

### 1. Forgewright Skills → Unity-MCP

| Forgewright Component | Unity-MCP Interaction |
|---------------------|----------------------|
| `unity-engineer` | Scene setup, component wiring, prefab creation |
| `unity-shader-artist` | Material creation, shader assignment, visual verification |
| `unity-multiplayer` | Network object setup, multiplayer scene preparation |

### 2. Unity-MCP → Unity Editor

| Unity-MCP Tool | Editor Action |
|----------------|--------------|
| `gameobject-*` | Create/modify GameObjects in hierarchy |
| `assets-*` | Manage assets in Project window |
| `scene-*` | Load/save scenes |
| `script-*` | Edit C# files |
| `tests-run` | Execute PlayMode/EditMode tests |

### 3. Quality Gates

```
Unity-MCP Results ──► Forgewright Quality Gate
       │                         │
       ▼                         ▼
  Test results            Architecture compliance
  Screenshots             SO-first pattern check
  Console logs            Brownfield safety
```

---

## MCP Configuration

### Unity-MCP as External MCP Server

**Architecture:**
```json
{
  "mcpServers": {
    "unity-game-developer": {
      "command": "<unity-project>/Library/mcp-server/osx-arm64/unity-mcp-server",
      "args": ["--port=8080", "--client-transport=stdio"]
    }
  }
}
```

### MCP Resource Structure

```
unity-game-developer://
├── assets/              # Asset management tools
├── scene/               # Scene manipulation tools
├── scripting/          # Code editing tools
├── editor/             # Editor control tools
└── tests/              # Testing tools
```

---

## Integration Patterns

### Pattern 1: Forgewright-First, Unity-MCP-Second

**Workflow:**
1. Forgewright: Design architecture (no Editor)
2. Forgewright: Generate SO framework code
3. Unity-MCP: Create scene objects
4. Unity-MCP: Assign components
5. Forgewright: Review and validate

**When:** New architecture, greenfield projects

### Pattern 2: Unity-MCP-First, Forgewright-Second

**Workflow:**
1. Unity-MCP: Create initial scene structure
2. Forgewright: Analyze existing code
3. Forgewright: Extend with SO patterns
4. Unity-MCP: Apply changes

**When:** Brownfield projects, extending existing code

### Pattern 3: Interleaved (Iterative)

**Workflow:**
1. Forgewright: Design component
2. Unity-MCP: Create GameObject
3. Forgewright: Implement logic
4. Unity-MCP: Add components
5. Forgewright: Connect events
6. Unity-MCP: Test and screenshot
7. Forgewright: Review and iterate

**When:** Complex features, visual verification needed

---

## File Organization

### Integration Files

```
forgewright/
├── skills/
│   ├── unity-engineer/
│   │   ├── SKILL.md              # Updated with Unity-MCP section
│   │   └── unity-mcp-workflow.md # (optional) Detailed workflow
│   ├── unity-shader-artist/
│   │   └── SKILL.md              # Updated with visual feedback
│   └── unity-multiplayer/
│       └── SKILL.md              # Updated with network testing
├── docs/
│   ├── unity-mcp-setup.md        # Installation & setup guide
│   └── unity-mcp-tools-reference.md # Full tool reference
└── antigravity/
    └── planning/
        └── unity-mcp-integration/
            ├── PLAN.md           # This plan
            ├── SCOPE.md          # Scope definition
            ├── TASKS.md          # Task breakdown
            └── ARCHITECTURE.md   # This file
```

---

## Extension Points

### 1. Custom Unity-MCP Tools

Forgewright có thể recommend tạo custom tools cho project-specific automation:

```csharp
[McpPluginToolType]
public class Tool_Forgewright
{
    [McpPluginTool("forgewright-create-so-framework")]
    public string CreateSOFramework()
    {
        // Custom tool cho Forgewright-specific patterns
    }
}
```

### 2. Extension Packages

Unity-MCP có extensions cho:
- `Unity-AI-Animation`: Animation-specific tools
- `Unity-AI-ParticleSystem`: VFX tools
- `Unity-AI-ProBuilder`: ProBuilder tools

Forgewright có thể recommend cài đặt these khi cần.

---

## Security Considerations

1. **Unity Editor Access:** Unity-MCP có full Editor access
   - ✅ Không ảnh hưởng nếu chỉ dùng local
   - ⚠️ Cần authentication token nếu remote

2. **File System Access:** MCP server có read/write access
   - ✅ Chỉ trong Unity project directory
   - ⚠️ Backup trước khi batch operations

3. **Network Access:** Runtime AI cần LLM connection
   - ⚠️ Privacy considerations cho game data
   - ✅ Local LLM option available

---

## Performance Considerations

1. **MCP Latency:** stdio transport có ~50-200ms overhead
   - ✅ Không đáng kể cho iterative workflow
   - ⚠️ Có thể chậm cho real-time operations

2. **Unity Compilation:** Full recompile khi script changes
   - ✅ Dùng `script-execute` (Roslyn) để test không cần save
   - ✅ Partial compilation với assembly definitions

3. **Asset Database Refresh:** Refresh operations có thể chậm
   - ✅ Batch operations khi possible
   - ✅ Refresh chỉ khi cần thiết
