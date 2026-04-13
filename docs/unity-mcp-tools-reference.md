# Unity-MCP Tools Quick Reference

## Overview

Complete reference of Unity-MCP tools (100+) với Forgewright use case mapping.

**Source:** [IvanMurzak/Unity-MCP](https://github.com/IvanMurzak/Unity-MCP)  
**Version:** 0.63.4 (latest)

---

## Category: Assets

### Asset Management

| Tool | Description | Forgewright Use Case |
|------|-------------|---------------------|
| `assets-copy` | Copy asset at path | Duplicate prefab templates |
| `assets-create-folder` | Create folder in project | Organize project structure |
| `assets-delete` | Delete assets | Clean up unused assets |
| `assets-find` | Search asset database | Find existing assets |
| `assets-find-built-in` | Search built-in assets | Find Unity resources |
| `assets-get-data` | Get asset data | Inspect material properties |
| `assets-material-create` | Create new material | Create shader materials |
| `assets-modify` | Modify asset file | Update asset settings |
| `assets-move` | Move/rename assets | Organize folders |
| `assets-refresh` | Refresh AssetDatabase | After script changes |

### Prefab Operations

| Tool | Description | Forgewright Use Case |
|------|-------------|---------------------|
| `assets-prefab-close` | Close prefab edit mode | Finish prefab editing |
| `assets-prefab-create` | Create prefab from GameObject | Convert scene objects |
| `assets-prefab-instantiate` | Instantiate prefab | Spawn game objects |
| `assets-prefab-open` | Open prefab edit mode | Edit prefab |
| `assets-prefab-save` | Save prefab | Save prefab changes |

### Package Management

| Tool | Description | Forgewright Use Case |
|------|-------------|---------------------|
| `package-add` | Install UPM package | Add dependencies |
| `package-list` | List installed packages | Check dependencies |
| `package-remove` | Remove package | Clean dependencies |
| `package-search` | Search UPM registry | Find packages |

### Shaders & Materials

| Tool | Description | Forgewright Use Case |
|------|-------------|---------------------|
| `assets-shader-list-all` | List all shaders | Find available shaders |
| `assets-material-create` | Create material | Create PBR/custom materials |

---

## Category: Scene & Hierarchy

### GameObject Creation

| Tool | Description | Forgewright Use Case |
|------|-------------|---------------------|
| `gameobject-create` | Create new GameObject | Create spawn points, managers |
| `gameobject-destroy` | Destroy GameObject | Clean up objects |
| `gameobject-duplicate` | Duplicate GameObjects | Clone objects |
| `gameobject-find` | Find GameObject | Locate scene objects |
| `gameobject-modify` | Modify GameObject | Transform, name, active |

### Component Operations

| Tool | Description | Forgewright Use Case |
|------|-------------|---------------------|
| `gameobject-component-add` | Add Component | Add NetworkObject, Rigidbody |
| `gameobject-component-destroy` | Destroy component | Remove components |
| `gameobject-component-get` | Get component info | Inspect settings |
| `gameobject-component-list-all` | List all components | Find available types |
| `gameobject-component-modify` | Modify component | Configure properties |

### Hierarchy

| Tool | Description | Forgewright Use Case |
|------|-------------|---------------------|
| `gameobject-set-parent` | Set parent | Organize hierarchy |

### Object Reference

| Tool | Description | Forgewright Use Case |
|------|-------------|---------------------|
| `object-get-data` | Get object data | Inspect scene objects |
| `object-modify` | Modify object | Change properties |

---

## Category: Scene

### Scene Management

| Tool | Description | Forgewright Use Case |
|------|-------------|---------------------|
| `scene-create` | Create new scene | Add gameplay scenes |
| `scene-get-data` | Get scene data | List root GameObjects |
| `scene-list-opened` | List opened scenes | Check active scenes |
| `scene-open` | Open scene | Load gameplay scene |
| `scene-save` | Save scene | Persist scene changes |
| `scene-set-active` | Set active scene | Switch contexts |
| `scene-unload` | Unload scene | Memory optimization |

---

## Category: Scripting

### Script Management

| Tool | Description | Forgewright Use Case |
|------|-------------|---------------------|
| `script-delete` | Delete script file | Remove unused scripts |
| `script-read` | Read script content | Analyze existing code |
| `script-update-or-create` | Create/update script | Generate gameplay code |

### Dynamic Execution

| Tool | Description | Forgewright Use Case |
|------|-------------|---------------------|
| `script-execute` | Compile & execute C# via Roslyn | Test code snippets without saving |

### Reflection

| Tool | Description | Forgewright Use Case |
|------|-------------|---------------------|
| `reflection-method-call` | Call C# method | Invoke gameplay methods |
| `reflection-method-find` | Find method | Discover available APIs |

---

## Category: Screenshot

| Tool | Description | Forgewright Use Case |
|------|-------------|---------------------|
| `screenshot-camera` | Capture from camera | Shader preview, VFX capture |
| `screenshot-game-view` | Capture game view | Visual verification |
| `screenshot-scene-view` | Capture scene view | Scene documentation |

---

## Category: Editor

### Application Control

| Tool | Description | Forgewright Use Case |
|------|-------------|---------------------|
| `editor-application-get-state` | Get play mode state | Check if playing |
| `editor-application-set-state` | Control play mode | Start/stop/pause |

### Selection

| Tool | Description | Forgewright Use Case |
|------|-------------|---------------------|
| `editor-selection-get` | Get selection | Inspect selected object |
| `editor-selection-set` | Set selection | Focus on object |

### Console

| Tool | Description | Forgewright Use Case |
|------|-------------|---------------------|
| `console-get-logs` | Get Editor logs | Debug errors, warnings |

---

## Category: Testing

| Tool | Description | Forgewright Use Case |
|------|-------------|---------------------|
| `tests-run` | Run Unity tests | Execute PlayMode/EditMode tests |

---

## Extension: AI Animation

[Unity-AI-Animation](https://github.com/IvanMurzak/Unity-AI-Animation/)

Animation-specific tools:

| Tool | Description |
|------|-------------|
| `animation-state-machine-*` | Manage Animator states |
| `animation-clip-*` | Manipulate clips |
| `animation-controller-*` | Configure controllers |

---

## Extension: AI ParticleSystem

[Unity-AI-ParticleSystem](https://github.com/IvanMurzak/Unity-AI-ParticleSystem/)

VFX-specific tools:

| Tool | Description |
|------|-------------|
| `particle-system-*` | Configure ParticleSystem |
| `vfx-graph-*` | Manage VFX Graph |

---

## Extension: AI ProBuilder

[Unity-AI-ProBuilder](https://github.com/IvanMurzak/Unity-AI-ProBuilder/)

Geometry-specific tools:

| Tool | Description |
|------|-------------|
| `probuilder-*` | Create/edit ProBuilder meshes |
| `probuilder-face-*` | Modify faces |
| `probuilder-vertex-*` | Modify vertices |

---

## Forgewright → Unity-MCP Mapping

### By Phase

| Phase | Forgewright Task | Unity-MCP Tool |
|-------|-----------------|---------------|
| Scene Setup | Create manager | `gameobject-create` |
| Scene Setup | Add components | `gameobject-component-add` |
| Scene Setup | Setup materials | `assets-material-create` |
| Scene Setup | Create prefabs | `assets-prefab-create` |
| Testing | Run tests | `tests-run` |
| Testing | Debug errors | `console-get-logs` |
| Testing | Visual check | `screenshot-game-view` |
| Shader | Preview shader | `screenshot-scene-view` |
| Multiplayer | Setup network | `gameobject-component-add` |
| Multiplayer | Test connection | `editor-application-set-state` |

### By Tool Category

| Category | Unity-MCP Tools | Forgewright Skills |
|----------|-----------------|-------------------|
| Architecture | None | `unity-engineer` |
| Scene Setup | `gameobject-*`, `assets-*` | `unity-engineer` |
| Materials | `assets-material-*`, `screenshot-*` | `unity-shader-artist` |
| Networking | `gameobject-component-*`, `tests-run` | `unity-multiplayer` |
| Testing | `tests-run`, `console-get-logs` | All |

---

## Common Workflows

### Workflow 1: Create Player System

```bash
# 1. Create player GameObject
gameobject-create(name="Player", parent="Characters")

# 2. Add components
gameobject-component-add(object="Characters/Player", component="Rigidbody")
gameobject-component-add(object="Characters/Player", component="CapsuleCollider")

# 3. Create material
assets-material-create(name="M_Player", shader="Universal Render Pipeline/Lit")

# 4. Apply material
object-modify(object_path="Characters/Player", component="MeshRenderer", property="materials/0", value="Assets/M_Player.mat")

# 5. Create prefab
assets-prefab-create(source_path="Characters/Player", target_path="Assets/Prefabs/Player.prefab")
```

### Workflow 2: Shader Iteration

```bash
# 1. Create dissolve shader (manual via Forgewright)

# 2. Create material
assets-material-create(name="M_Dissolve", shader="Shader Graphs/SG_Dissolve")

# 3. Apply to object
object-modify(object_path="Assets/Prefabs/Effect.prefab", component="MeshRenderer", property="materials/0", value="Assets/M_Dissolve.mat")

# 4. Preview
screenshot-scene-view(output_path="Assets/Screenshots/dissolve_test.png")

# 5. Adjust and re-test
```

### Workflow 3: Multiplayer Test

```bash
# 1. Create NetworkManager
gameobject-create(name="NetworkManager", parent="Managers")

# 2. Add NetworkObject
gameobject-component-add(object="Managers/NetworkManager", component="Unity.Netcode.NetworkManager")

# 3. Start play mode
editor-application-set-state(play=true)

# 4. Check logs
console-get-logs(filter="Network")

# 5. Stop play mode
editor-application-set-state(play=false)
```

---

## Tool Naming Convention

Unity-MCP tools follow consistent naming:

```
{category}-{action}

Categories:
- assets-*      : Asset operations
- gameobject-*  : GameObject operations
- scene-*       : Scene operations
- script-*      : Script operations
- editor-*      : Editor operations
- screenshot-*  : Screenshot operations
- package-*     : Package operations

Actions:
- create        : Create new
- delete        : Delete
- modify        : Change properties
- get           : Retrieve data
- list          : List items
- find          : Search
- add           : Add component/item
- remove        : Remove component/item
```

---

## Rate Limits & Best Practices

### Avoid Overuse

- Batch operations when possible
- Use `assets-refresh` sparingly
- Minimize `gameobject-find` in large scenes

### Error Handling

```bash
# Check for errors
console-get-logs(filter="Error")

# Common errors:
# - "Object not found" : Check path
# - "Component not found" : Check component name
# - "Permission denied" : Check file permissions
```

### Performance Tips

1. **Prefer `object-get-data`** over `gameobject-find` for single objects
2. **Use filters** in `console-get-logs` to reduce output
3. **Batch scene changes** before saving
