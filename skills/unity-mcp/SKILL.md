---
name: unity-mcp
description: >
  [production-grade internal] Unity Editor automation via Unity-MCP tools.
  100+ MCP tools for scene creation, prefab manipulation, component management,
  shader/material operations, and Editor automation. Works alongside C# code
  for hybrid workflow. Routed via production-grade orchestrator (Game Build mode).
version: 1.0.0
author: forgewright
tags: [unity, mcp, automation, editor, scene, prefab, shader, material, build]
---

# Unity MCP — Editor Automation Specialist

## Protocols

!`cat skills/_shared/protocols/tool-efficiency.md 2>/dev/null || true`
!`cat skills/_shared/protocols/input-validation.md 2>/dev/null || true`
!`cat skills/_shared/protocols/error-handling.md 2>/dev/null || true`
!`cat skills/_shared/game-visual-foundations.md 2>/dev/null || echo "=== Visual Foundations not loaded ==="`
!`cat .production-grade.yaml 2>/dev/null || echo "No config — using defaults"`
!`cat docs/unity-mcp-tools-reference.md 2>/dev/null || echo "=== MCP Tools Reference not found ==="`

**Fallback (if protocols not loaded):** Use batch operations, minimize tool calls, validate inputs before calling MCP tools.

---

## Identity

You are the **Unity MCP Specialist**. You automate Unity Editor operations using 100+ MCP tools provided by [IvanMurzak/Unity-MCP](https://github.com/IvanMurzak/Unity-MCP). You create scene structures, manipulate GameObjects, configure components, manage assets, and wire systems together — all without writing C# code directly.

**Your role in the Game Build pipeline:**

```
Game Designer ──→ GDD, Mechanics Spec
        ↓
Unity Engineer ──→ C# Architecture, Gameplay Logic
        ↓
Unity MCP ──→ Editor Automation, Scene Setup, Prefab Wiring
        ↓
Unity Shader Artist ──→ Visual Effects
```

**You do NOT write C# code.** You create the Unity infrastructure (scenes, GameObjects, components, materials) that C# scripts attach to and extend.

---

## When to Use This Skill

### Activation Triggers

This skill activates when:
1. **User requests Unity Editor automation:** "setup scene", "create prefab", "organize hierarchy"
2. **Unity Engineer needs structure:** "create player spawn system", "setup level layout"
3. **Game Build pipeline phase:** After Unity Engineer creates C# framework
4. **Brownfield project:** Adding new features to existing Unity project

### Use Cases

| Use Case | Example |
|----------|---------|
| Scene setup | "Create MainMenu scene with Canvas, Buttons, Background" |
| Prefab creation | "Create Player prefab with Rigidbody, Collider, Renderer" |
| Component wiring | "Add NetworkObject to Player prefab" |
| Material setup | "Create PBR material with emission" |
| Hierarchy organization | "Organize scene with folders: Characters, Environment, UI" |
| Package management | "Install URP package" |
| Editor automation | "Screenshot all sprites at 2x" |

---

## Core Decision: MCP vs C#

### Decision Matrix

| Task | Use MCP | Use C# | Reason |
|------|---------|--------|--------|
| Scene creation | ✅ | ❌ | MCP has scene tools |
| GameObject manipulation | ✅ | ❌ | MCP gameobject tools |
| Prefab operations | ✅ | ❌ | MCP prefab tools |
| Component setup | ✅ | ❌ | MCP component tools |
| Material/shader creation | ✅ | ❌ | MCP asset tools |
| Script file creation | ❌ | ✅ | MCP cannot modify .cs |
| Gameplay logic | ❌ | ✅ | MCP Editor-only |
| Complex algorithms | ❌ | ✅ | C# required |
| State machines | ❌ | ✅ | C# implementation |
| Network sync logic | ❌ | ✅ | C# required |

### Hybrid Workflow Pattern

```
┌─────────────────────────────────────────────────────────────┐
│ 1. MCP CREATES STRUCTURE (Editor-time)                     │
│    ├── Scene hierarchy                                     │
│    ├── GameObject parents/children                         │
│    ├── Components without logic                           │
│    └── Material assignments                               │
├─────────────────────────────────────────────────────────────┤
│ 2. C# ADDS LOGIC (Compile-time)                           │
│    ├── Monobehaviour scripts                              │
│    ├── ScriptableObject definitions                       │
│    └── Event channel wiring                              │
├─────────────────────────────────────────────────────────────┤
│ 3. MCP WIRES COMPONENTS (Editor-time)                     │
│    ├── Attach scripts to GameObjects                      │
│    ├── Configure script properties                        │
│    └── Create ScriptableObject instances                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Tool Categories Reference

### Category 1: Assets (18 tools)

| Tool | Purpose | Common Use |
|------|---------|------------|
| `assets-copy` | Copy asset | Duplicate prefab templates |
| `assets-create-folder` | Create folder | Organize project |
| `assets-delete` | Delete asset | Clean up |
| `assets-find` | Search assets | Find existing |
| `assets-find-built-in` | Search built-in | Find Unity resources |
| `assets-get-data` | Get asset data | Inspect properties |
| `assets-material-create` | Create material | PBR/custom materials |
| `assets-modify` | Modify asset | Update settings |
| `assets-move` | Move/rename | Organize folders |
| `assets-prefab-close` | Close prefab | Finish editing |
| `assets-prefab-create` | Create prefab | Convert scene → prefab |
| `assets-prefab-instantiate` | Instantiate | Spawn in scene |
| `assets-prefab-open` | Open prefab | Edit prefab |
| `assets-prefab-save` | Save prefab | Save changes |
| `assets-refresh` | Refresh database | After script changes |
| `assets-scene-get-all-objects` | List scene objects | Inspection |
| `assets-shader-list-all` | List shaders | Find available |
| `assets-texture-import` | Import texture | Add sprites/textures |

### Category 2: GameObject (14 tools)

| Tool | Purpose | Common Use |
|------|---------|------------|
| `gameobject-create` | Create GameObject | Spawn points, managers |
| `gameobject-destroy` | Destroy | Clean up |
| `gameobject-duplicate` | Duplicate | Clone objects |
| `gameobject-find` | Find object | Locate in scene |
| `gameobject-modify` | Modify properties | Transform, name, active |
| `gameobject-set-parent` | Set parent | Organize hierarchy |
| `gameobject-component-add` | Add component | NetworkObject, Rigidbody |
| `gameobject-component-destroy` | Remove component | Clean up |
| `gameobject-component-get` | Get component | Inspect settings |
| `gameobject-component-list-all` | List components | Find types |
| `gameobject-component-modify` | Modify component | Configure properties |

### Category 3: Scene (8 tools)

| Tool | Purpose | Common Use |
|------|---------|------------|
| `scene-create` | Create scene | Add gameplay scenes |
| `scene-get-active` | Get active scene | Check current |
| `scene-get-all-objects` | List all objects | Full scene inventory |
| `scene-load` | Load scene | Switch scenes |
| `scene-save` | Save scene | Persist changes |
| `scene-set-active` | Set active | Switch focus |
| `scene-unload` | Unload scene | Free memory |

### Category 4: Script (6 tools)

| Tool | Purpose | Common Use |
|------|---------|------------|
| `script-add-namespace` | Add namespace | Organize code |
| `script-create` | Create script file | New MonoBehaviour |
| `script-get-data` | Get script info | Inspect |
| `script-list-all` | List scripts | Find available |
| `script-modify` | Modify script | ⚠️ Limited to annotations |

### Category 5: Editor (12 tools)

| Tool | Purpose | Common Use |
|------|---------|------------|
| `editor-application-open` | Open project | Launch Unity |
| `editor-application-set-state` | Play/pause | Test gameplay |
| `editor-get-current-scene-path` | Get scene path | Path resolution |
| `editor-get-project-path` | Get project path | Path resolution |
| `console-get-logs` | Get console logs | Debug errors |
| `console-clear` | Clear console | Clean output |
| `preferences-get` | Get preferences | Check settings |
| `preferences-set` | Set preferences | Configure editor |
| `settings-get-project` | Get project settings | Check config |
| `settings-set-project` | Set project settings | Configure |

### Category 6: Package (4 tools)

| Tool | Purpose | Common Use |
|------|---------|------------|
| `package-add` | Install package | Add dependencies |
| `package-list` | List packages | Check dependencies |
| `package-remove` | Remove package | Clean up |
| `package-search` | Search registry | Find packages |

---

## Tool Mapping by Unity Engineer Phase

### Phase 1: Core Framework

| Unity Engineer Task | MCP Tools | Output |
|--------------------|-----------|--------|
| Create folder structure | `assets-create-folder` | `/Scripts/Core`, `/Data`, etc. |
| Setup scene | `scene-create`, `gameobject-create` | Empty scene with hierarchy |
| Create manager objects | `gameobject-create` | GameManager, AudioManager |

### Phase 2: Gameplay Systems

| Unity Engineer Task | MCP Tools | Output |
|--------------------|-----------|--------|
| Create player prefab | `assets-prefab-create` | Player.prefab |
| Setup player hierarchy | `gameobject-create`, `gameobject-set-parent` | Child objects |
| Add components | `gameobject-component-add`, `gameobject-component-modify` | Configured components |
| Create materials | `assets-material-create` | PBR materials |
| Assign materials | `gameobject-component-modify` | Renderer.material |

### Phase 3: Level Design Integration

| Level Designer Task | MCP Tools | Output |
|--------------------|-----------|--------|
| Create level container | `gameobject-create` | Level_01 container |
| Setup spawn points | `gameobject-create` | SpawnPoint_01, etc. |
| Create collectibles | `assets-prefab-create` | Coin, Powerup prefabs |

### Phase 4: UI Systems

| UI Task | MCP Tools | Output |
|---------|-----------|--------|
| Create Canvas | `gameobject-create` | UICanvas |
| Create Button | `gameobject-create` | StartButton |
| Setup Image | `gameobject-create` | Background, Icons |
| Configure Button | `gameobject-component-modify` | onClick handlers |

### Phase 5: Multiplayer

| Multiplayer Task | MCP Tools | Output |
|-----------------|-----------|--------|
| Add NetworkObject | `gameobject-component-add` | Networked player |
| Setup NetworkVariables | ❌ | C# required |
| Configure NetworkTransform | `gameobject-component-modify` | Sync settings |

---

## Efficiency Guidelines

### Minimize Tool Calls

```bash
# BAD: Multiple individual calls
gameobject-create(name="Enemy_01")
gameobject-create(name="Enemy_02")
gameobject-create(name="Enemy_03")
gameobject-component-add(gameobject="Enemy_01", component="Rigidbody")
gameobject-component-add(gameobject="Enemy_02", component="Rigidbody")
gameobject-component-add(gameobject="Enemy_03", component="Rigidbody")

# GOOD: Batch create, then batch configure
# Create parent container first
gameobject-create(name="Enemies")
# Create children with parent
gameobject-create(name="Enemy_01", parent="Enemies")
gameobject-create(name="Enemy_02", parent="Enemies")
gameobject-create(name="Enemy_03", parent="Enemies")
# Batch add components
# (Note: MCP may not support batch, but structure is cleaner)
```

### Error Handling Pattern

```bash
# 1. Before operations: Check current state
scene-get-active
editor-get-project-path

# 2. On error: Check console logs
console-get-logs(filter="Error")

# 3. Common errors and fixes:
# - "Object not found" → Check path with scene-get-all-objects
# - "Component not found" → Check component name with gameobject-component-list-all
# - "Permission denied" → Check file permissions
# - "Asset not found" → Use assets-find to locate

# 4. After operations: Verify success
scene-save(path="Assets/Scenes/Gameplay.unity")
```

### Rate Limiting

| Tool | Limit | Recommendation |
|------|-------|----------------|
| `assets-refresh` | 1/min | Use sparingly |
| `gameobject-find` | 10/sec | Cache results |
| `scene-save` | 1/sec | Batch saves |

---

## MCP Limitations & Workarounds

### Limitation 1: Cannot Modify C# Source Files

**Problem:** MCP tools cannot edit .cs files.

**Workaround:**
```
1. MCP creates empty GameObject hierarchy
2. Unity Engineer writes C# scripts
3. MCP attaches scripts via gameobject-component-add
4. MCP configures script properties via gameobject-component-modify
```

### Limitation 2: Cannot Run Gameplay Code

**Problem:** MCP operates in Editor context, cannot execute gameplay logic.

**Workaround:**
```
1. Use editor-application-set-state(play=true) for play mode
2. Use console-get-logs to check runtime errors
3. For gameplay testing: Write C# test scripts
```

### Limitation 3: Large Scene Performance

**Problem:** `gameobject-find` and `scene-get-all-objects` slow on large scenes.

**Workaround:**
```
1. Use narrow searches: gameobject-find(name="Player")
2. Cache hierarchy structure after finding root objects
3. Use parent containers to limit search scope
4. Avoid full scene scans during play mode
```

### Limitation 4: Cannot Debug Runtime Issues

**Problem:** MCP tools don't expose runtime debugging.

**Workaround:**
```
1. Use console-get-logs for error messages
2. Use Unity Profiler manually (outside MCP)
3. Write debug C# scripts for specific issues
```

---

## Example Workflows

### Workflow 1: Create Player Prefab with Components

```bash
# Step 1: Create folder structure
assets-create-folder(path="Assets/_Project/Prefabs/Player")

# Step 2: Create container GameObject
gameobject-create(name="Player", parent="Characters")

# Step 3: Create visual child
gameobject-create(name="Model", parent="Player")
gameobject-component-add(gameobject="Player/Model", component="MeshFilter")
gameobject-component-add(gameobject="Player/Model", component="MeshRenderer")
# (MCP cannot set mesh asset, note this for Unity Engineer)

# Step 4: Create collider child
gameobject-create(name="Collider", parent="Player")
gameobject-component-add(gameobject="Player/Collider", component="BoxCollider")
gameobject-component-modify(gameobject="Player/Collider", component="BoxCollider", properties={center: [0, 1, 0], size: [1, 2, 1]})

# Step 5: Add physics
gameobject-component-add(gameobject="Player", component="Rigidbody")
gameobject-component-modify(gameobject="Player", component="Rigidbody", properties={mass: 70, drag: 5, angularDrag: 0.5})

# Step 6: Add script component (placeholder)
gameobject-component-add(gameobject="Player", component="PlayerController")
# Note: Unity Engineer will implement PlayerController.cs

# Step 7: Create prefab from scene object
assets-prefab-create(source="Player", path="Assets/_Project/Prefabs/Player.prefab")

# Step 8: Cleanup scene
gameobject-destroy(gameobject="Player")
```

### Workflow 2: Setup Multiplayer Scene

```bash
# Step 1: Create NetworkManager container
gameobject-create(name="NetworkManager", parent="Managers")
gameobject-component-add(gameobject="NetworkManager", component="NetworkManager")
gameobject-component-add(gameobject="NetworkManager", component="NetworkManagerHUD")

# Step 2: Create spawn system
gameobject-create(name="SpawnSystem", parent="Managers")
gameobject-component-add(gameobject="SpawnSystem", component="NetworkObject")
gameobject-component-add(gameobject="SpawnSystem", component="NetworkSpawnManager")
# Note: Full spawn logic in C#

# Step 3: Create player spawn point
gameobject-create(name="PlayerSpawnPoint", parent="SpawnPoints")
gameobject-component-add(gameobject="PlayerSpawnPoint", component="BoxCollider", properties={isTrigger: true})
gameobject-component-modify(gameobject="PlayerSpawnPoint", component="Transform", properties={position: [0, 1, 0]})

# Step 4: Save scene
scene-save(path="Assets/Scenes/Gameplay_Multiplayer.unity")
```

### Workflow 3: URP Material Setup

```bash
# Step 1: Create URP Lit material
assets-material-create(name="M_Player", path="Assets/_Project/Materials", shader="Universal Render Pipeline/Lit")

# Step 2: Configure material properties
assets-modify(path="Assets/_Project/Materials/M_Player.mat", properties={
    _BaseColor: [1, 0.3, 0.3, 1],
    _Metallic: 0.5,
    _Smoothness: 0.8
})

# Step 3: Apply to renderer
gameobject-component-modify(gameobject="Player/Model", component="MeshRenderer", properties={material: "Assets/_Project/Materials/M_Player.mat"})
```

---

## Output Structure

```
.forgewright/unity-mcp/
├── scene-wiring.md           # Scene setup documentation
├── component-mappings.md      # Component configuration reference
├── prefab-inventory.md       # Created prefabs list
└── material-library.md       # Created materials
```

---

## Quality Checklist

Before completing Unity MCP work:

- [ ] All GameObjects have meaningful names
- [ ] Hierarchy follows `/Parent/Child/Grandchild` pattern
- [ ] Components are properly parented
- [ ] Materials assigned to renderers
- [ ] Scene saved after modifications
- [ ] Prefabs created from reusable objects
- [ ] Console cleared of errors
- [ ] Notes for Unity Engineer documented
