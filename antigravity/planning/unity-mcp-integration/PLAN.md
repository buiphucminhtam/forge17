# Unity-MCP Integration Plan

## Overview

**Project:** Integrate Unity-MCP (IvanMurzak/Unity-MCP) into Forgewright Unity skills  
**Goal:** Combine Forgewright's architecture guidance + quality gates with Unity-MCP's Editor automation  
**Timeline:** 3 phases, estimated 6-8 hours total

---

## Phase 0: Analysis & Documentation (In Progress)

### Current State Assessment

| Skill | Strengths | Gaps |
|-------|-----------|------|
| `unity-engineer` | SO-first architecture, SRP enforcement, quality gates | No Editor automation, no visual feedback |
| `unity-shader-artist` | Shader Graph best practices, HLSL standards | No screenshot verification |
| `unity-multiplayer` | Netcode patterns, bandwidth optimization | No auto-setup |

### Unity-MCP Capabilities (2.1k stars)

```
100+ MCP Tools across categories:
├── Assets: copy, create-folder, delete, find, material-create, modify, move
├── Scene/Hierarchy: gameobject-create/destroy/duplicate/modify, component-*
├── Scripting: script-update-or-create, script-execute (Roslyn), reflection-*
├── Editor: console-get-logs, application-get/set-state, selection-get/set
├── Testing: tests-run, screenshot-*
└── Extensions: AI-Animation, AI-ParticleSystem, AI-ProBuilder
```

---

## Phase 1: Skill Updates (P0)

### Task 1.1: Update `unity-engineer/SKILL.md`

**File:** `skills/unity-engineer/SKILL.md`  
**Changes:**

1. Add new section "## Integration với Unity-MCP"
2. Add prerequisites (Unity-MCP installed in project)
3. Add tool mapping table (Forgewright task → Unity-MCP tool)
4. Add combined workflow example

**New Section Content:**
```markdown
## Integration với Unity-MCP

Forgewright Unity Engineer dùng Unity-MCP cho Editor automation khi cần thao tác với Unity Editor trực tiếp.

### Prerequisites
1. Unity project đã cài Unity-MCP plugin
2. MCP server đang chạy (stdio hoặc http)
3. Unity Editor đang mở (cho Editor tools)

### Tool Mapping

| Forgewright Task | Unity-MCP Tool | When to Use |
|------------------|----------------|-------------|
| Tạo scene objects | `gameobject-create` | Placeholder objects |
| Setup prefabs | `assets-prefab-create` | Convert scene to prefab |
| Assign materials | `assets-material-create` | Create materials |
| Add components | `gameobject-component-add` | Attach scripts |
| Test gameplay | `tests-run` | PlayMode tests |
| Debug | `console-get-logs` | Error investigation |

### Combined Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│ Step 1: Architecture (Forgewright - NO Unity Editor)           │
│ ├── SO framework design                                        │
│ ├── Event channel architecture                                  │
│ └── Component responsibilities                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Step 2: Scene Setup (Unity-MCP - Editor Automation)            │
│ ├── Tạo empty GameObjects cho hierarchy                        │
│ ├── Assign prefabs từ SO references                            │
│ └── Setup materials và textures                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Step 3: Code Implementation (Forgewright - NO Unity Editor)    │
│ ├── MonoBehaviour implementations                               │
│ ├── SO event wiring                                            │
│ └── Gameplay logic                                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Step 4: Testing (Unity-MCP - Editor Automation)                │
│ ├── Run PlayMode tests                                         │
│ ├── Capture screenshots                                         │
│ └── Console log analysis                                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Step 5: Quality Gate (Forgewright)                              │
│ ├── Architecture compliance check                               │
│ ├── SO-first pattern verification                               │
│ └── Brownfield safety validation                                │
└─────────────────────────────────────────────────────────────────┘
```

### Task 1.2: Update `unity-shader-artist/SKILL.md`

**File:** `skills/unity-shader-artist/SKILL.md`  
**Changes:**

1. Add visual feedback loop section
2. Add screenshot-based verification
3. Add shader preview automation

**New Section Content:**
```markdown
## Visual Feedback với Unity-MCP

Sau khi tạo shaders, dùng Unity-MCP để verify visual output.

### Screenshot Tools

| Tool | Use Case |
|------|----------|
| `screenshot-scene-view` | Shader trông thế nào trong scene |
| `screenshot-game-view` | Shader trong gameplay context |
| `screenshot-camera` | Shader từ specific camera angle |

### Workflow

```
Shader Created → Unity-MCP screenshot → Review visual output
                    ↓
              Nếu cần chỉnh:
              → Update shader parameters
              → Re-screenshot
              → Verify
```

### Shader Iteration with Unity-MCP

1. Tạo shader với Forgewright
2. Assign vào material via `assets-material-create` hoặc `object-modify`
3. Apply lên GameObject via `gameobject-modify`
4. Screenshot via Unity-MCP
5. Review và iterate
```

### Task 1.3: Update `unity-multiplayer/SKILL.md`

**File:** `skills/unity-multiplayer/SKILL.md`  
**Changes:**

1. Add Unity-MCP integration for network testing
2. Add console-based multiplayer debugging
3. Add scene setup automation

**New Section Content:**
```markdown
## Network Testing với Unity-MCP

Dùng Unity-MCP để setup và test multiplayer scenes.

### Tools for Multiplayer

| Tool | Use Case |
|------|----------|
| `gameobject-create` | Tạo player spawn points |
| `gameobject-component-add` | Add NetworkObject |
| `editor-application-set-state` | Control play mode |
| `console-get-logs` | Debug network issues |
| `scene-save` | Save test scenes |

### Network Scene Setup

1. Tạo NetworkManager prefab
2. Setup player spawn points via Unity-MCP
3. Configure scene for multiplayer
4. Run multiple instances để test
```

---

## Phase 2: Documentation & MCP Generator (P1)

### Task 2.1: Update `AGENTS.md`

**File:** `AGENTS.md`  
**Changes:**

1. Add Unity-MCP to available integrations
2. Add Unity to supported platforms

**New Entry:**
```markdown
| Unity Engineer | `skills/unity-engineer/SKILL.md` | Unity game development + Unity-MCP integration |
```

### Task 2.2: Update MCP Generator Skill

**File:** `skills/mcp-generator/SKILL.md`  
**Changes:**

1. Add Unity-MCP detection logic
2. Add Unity-specific MCP config generation
3. Add Unity project auto-detection

**New Detection Logic:**
```markdown
## Unity Project Detection

1. Check for `Assets/` folder
2. Check for `ProjectSettings/ProjectVersion.txt`
3. Check for Unity .meta files

If Unity project detected:
- Offer to generate Unity-MCP integration
- Add Unity-specific tools to MCP config
```

### Task 2.3: Create Setup Guide

**File:** `docs/unity-mcp-setup.md` (NEW)  
**Content:**

1. Installation guide
2. Configuration instructions
3. Usage examples
4. Troubleshooting

---

## Phase 3: Advanced Features (P2)

### Task 3.1: Runtime AI Section

**File:** `skills/unity-engineer/SKILL.md`  
**Changes:**

Add new section "## Runtime AI (In-Game)"

**Content:**
```markdown
## Runtime AI (In-Game)

Unity-MCP hỗ trợ AI bên trong compiled game.

### Use Cases

| Use Case | Description |
|----------|-------------|
| NPC Bot | LLM điều khiển NPC decision-making |
| Dynamic Dialogue | Generate dialogue at runtime |
| Procedural Content | AI tạo content theo context |
| In-Game Debug | AI phân tích game state |

### Implementation Pattern

```csharp
// Build MCP plugin
var mcpPlugin = UnityMcpPluginRuntime.Initialize(builder =>
{
    builder.WithConfig(config =>
    {
        config.Host = "http://localhost:8080";
        config.Token = "your-token";
    });
    builder.WithToolsFromAssembly(Assembly.GetExecutingAssembly());
})
.Build();

await mcpPlugin.Connect();
```

### When to Use Runtime AI

- Game có NPC thông minh (chess bot, strategy AI)
- Dialogue system cần dynamic responses
- Procedural generation cần AI guidance
- Debugging trong editor với AI assistance

### When NOT to Use

- Deterministic gameplay (fighting game combos)
- Performance-critical paths
- Simple AI (patrol, chase)
- Mobile games (network dependency)
```

### Task 3.2: MCP Tools Quick Reference

**File:** `docs/unity-mcp-tools-reference.md` (NEW)  
**Content:**

Full reference of Unity-MCP tools với Forgewright use cases.

---

## Phase 4: Testing (P3)

### Task 4.1: Integration Testing

**Test Cases:**

1. ✅ Unity project detection works
2. ✅ MCP config generated correctly
3. ✅ Tool mapping accurate
4. ✅ Workflow documentation clear

**Test Project:** Tạo sample Unity project để verify integration

---

## Resource Requirements

### Time Estimate

| Phase | Tasks | Hours |
|-------|-------|-------|
| Phase 1 | 3 skill updates | 1.5-2h |
| Phase 2 | 3 documentation tasks | 1-1.5h |
| Phase 3 | 2 advanced features | 1-1.5h |
| Phase 4 | Testing | 0.5-1h |
| **Total** | **10 tasks** | **4-6h** |

### Dependencies

- Unity-MCP repo access (for tool reference)
- Sample Unity project (for testing)
- MCP server configuration knowledge

---

## Success Criteria

1. ✅ All 3 Unity skills have Unity-MCP integration docs
2. ✅ AGENTS.md includes Unity-MCP
3. ✅ MCP generator detects Unity projects
4. ✅ Setup guide created
5. ✅ Runtime AI section added
6. ✅ Quick reference guide created
7. ✅ Integration tested with sample project

---

## Risk Assessment

| Risk | Level | Mitigation |
|------|-------|------------|
| Unity-MCP API changes | MEDIUM | Use version pinning, document source |
| Platform-specific tools | LOW | Document macOS/Windows differences |
| MCP server connectivity | LOW | Include troubleshooting guide |

---

## Implementation Order

```
1. unity-engineer/SKILL.md (P0) ← Priority highest
2. unity-shader-artist/SKILL.md (P0)
3. unity-multiplayer/SKILL.md (P0)
4. AGENTS.md update (P1)
5. MCP generator update (P1)
6. docs/unity-mcp-setup.md (P1)
7. Runtime AI section (P2)
8. docs/unity-mcp-tools-reference.md (P2)
9. Testing (P3)
```
