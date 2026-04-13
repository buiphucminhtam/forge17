# Unity MCP Cheat Sheet

> **Quick reference for Unity-MCP tools** | Based on [IvanMurzak/Unity-MCP](https://github.com/IvanMurzak/Unity-MCP)

---

## Tool Categories

| Prefix | Category | Count |
|--------|----------|-------|
| `assets-*` | Asset operations | 18 |
| `gameobject-*` | GameObject manipulation | 14 |
| `scene-*` | Scene management | 8 |
| `script-*` | Script operations | 6 |
| `editor-*` | Editor automation | 12 |
| `package-*` | Package Manager | 4 |

---

## Scene Setup

```bash
# Create new scene
scene-create(path="Assets/Scenes/Gameplay.unity")

# Load scene
scene-load(path="Assets/Scenes/Gameplay.unity")

# Save scene
scene-save(path="Assets/Scenes/Gameplay.unity")

# Get active scene
scene-get-active
```

---

## GameObject Creation

```bash
# Create GameObject
gameobject-create(name="Player")

# Create with parent
gameobject-create(name="Model", parent="Player")

# Find GameObject
gameobject-find(name="Player")

# Set parent
gameobject-set-parent(child="Enemy", parent="Enemies")

# Modify properties
gameobject-modify(name="Player", properties={active: true, layer: 8})

# Duplicate
gameobject-duplicate(name="Player", newName="Enemy")

# Destroy
gameobject-destroy(name="TempObject")
```

---

## Component Management

```bash
# Add component
gameobject-component-add(gameobject="Player", component="Rigidbody")

# List all components
gameobject-component-list-all(gameobject="Player")

# Get component info
gameobject-component-get(gameobject="Player", component="Rigidbody")

# Modify component
gameobject-component-modify(
  gameobject="Player",
  component="Rigidbody",
  properties={mass: 70, drag: 5}
)

# Remove component
gameobject-component-destroy(gameobject="Player", component="Rigidbody")
```

---

## Prefab Operations

```bash
# Create prefab from scene object
assets-prefab-create(source="Player", path="Assets/Prefabs/Player.prefab")

# Open prefab for editing
assets-prefab-open(path="Assets/Prefabs/Player.prefab")

# Save prefab
assets-prefab-save(path="Assets/Prefabs/Player.prefab")

# Close prefab
assets-prefab-close

# Instantiate in scene
assets-prefab-instantiate(prefab="Assets/Prefabs/Player.prefab", position=[0,0,0])
```

---

## Materials & Shaders

```bash
# Create material
assets-material-create(name="M_Red", path="Assets/Materials", shader="Standard")

# List all shaders
assets-shader-list-all

# Modify material
assets-modify(
  path="Assets/Materials/M_Red.mat",
  properties={_Color: [1, 0, 0, 1], _Metallic: 0.5}
)
```

---

## Package Management

```bash
# Add package
package-add(package="com.unity.render-pipelines.universal")

# List packages
package-list

# Search registry
package-search(query="physics")

# Remove package
package-remove(package="com.unity.ai.navigation")
```

---

## Editor Operations

```bash
# Get project path
editor-get-project-path

# Get current scene path
editor-get-current-scene-path

# Set play state
editor-application-set-state(play=true)   # Start play
editor-application-set-state(play=false)  # Stop play

# Get console logs
console-get-logs(filter="Error")

# Clear console
console-clear
```

---

## Folder Structure

```bash
# Create folder
assets-create-folder(path="Assets/_Project/Scripts/Core")

# Move asset
assets-move(source="Assets/Old/Folder", destination="Assets/New/Folder")

# Find assets
assets-find(filter="*.prefab")
```

---

## Error Handling

```bash
# Check for errors
console-get-logs(filter="Error")

# Common errors:
# - "Object not found" → Use gameobject-find first
# - "Component not found" → Check component name with gameobject-component-list-all
# - "Asset not found" → Use assets-find to locate
# - "Permission denied" → Check file permissions
```

---

## Best Practices

| Do | Don't |
|----|-------|
| Create parent containers first | Create deeply nested objects directly |
| Use `assets-refresh` sparingly | Call `assets-refresh` in loops |
| Cache `gameobject-find` results | Call `gameobject-find` repeatedly |
| Batch scene operations | Mix reads and writes |
| Save scene after major changes | Save after every minor change |

---

## Workflow Examples

### Player Setup
```bash
gameobject-create(name="Player")
gameobject-create(name="Model", parent="Player")
gameobject-create(name="Collider", parent="Player")
gameobject-component-add(gameobject="Player", component="Rigidbody")
gameobject-component-add(gameobject="Player", component="CapsuleCollider")
gameobject-component-modify(gameobject="Player", component="Rigidbody", properties={mass: 70})
assets-prefab-create(source="Player", path="Assets/Prefabs/Player.prefab")
```

### Scene with Managers
```bash
gameobject-create(name="GameManager", parent="Managers")
gameobject-create(name="AudioManager", parent="Managers")
gameobject-create(name="UIManager", parent="Managers")
scene-save(path="Assets/Scenes/Gameplay.unity")
```
