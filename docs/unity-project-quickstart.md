# Unity Project Quickstart Guide

> **Purpose:** Hướng dẫn bắt đầu Unity project hiệu quả với Forgewright và Unity-MCP.
> **Audience:** Developers, AI coding assistants, và các IDE agents cần setup Unity project.

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Project Setup](#project-setup)
4. [Architecture Foundation](#architecture-foundation)
5. [Workflow: Forgewright vs Unity-MCP](#workflow-forgewright-vs-unity-mcp)
6. [Core ScriptableObject Patterns](#core-scriptableobject-patterns)
7. [Common Patterns & Anti-Patterns](#common-patterns--anti-patterns)
8. [Unity-MCP Tools Reference](#unity-mcp-tools-reference)
9. [Quick Reference Commands](#quick-reference-commands)

---

## Overview

### What is this Guide?

Hướng dẫn này cung cấp **best practices** để bắt đầu Unity project với:

- **Forgewright**: AI orchestrator với 55+ skills cho game development
- **Unity-MCP**: Model Context Protocol tools cho Unity Editor automation
- **ScriptableObject-first architecture**: Data-driven design pattern

### When to Use This Guide

| Scenario | Use This Guide? |
|----------|-----------------|
| Tạo Unity project mới (greenfield) | ✅ Yes |
| Thêm features vào existing project (brownfield) | ✅ Yes |
| Setup Unity-MCP cho Editor automation | ✅ Yes |
| Architecture review cho Unity project | ✅ Yes |

---

## Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| Unity Editor | 2022.3 LTS hoặc Unity 6 | Game engine |
| Node.js | 18+ | Unity-MCP CLI |
| git | Latest | Version control |

### Optional but Recommended

| Software | Purpose |
|----------|---------|
| Unity Hub | Quản lý Unity installations và projects |
| Visual Studio / VS Code | Code editor với Unity integration |

---

## Project Setup

### Step 1: Create Unity Project

```bash
# Option A: Unity Hub (GUI)
# 1. Open Unity Hub
# 2. New Project → 3D/URP template
# 3. Name: MyGameProject
# 4. Location: /path/to/projects/

# Option B: Command Line (headless)
unity -createproject ./MyGameProject -template 3D
```

### Step 2: Install Unity-MCP

```bash
# 1. Install Unity-MCP CLI globally
npm install -g unity-mcp-cli

# 2. Install Unity-MCP plugin vào Unity project
unity-mcp-cli install-plugin ./MyGameProject

# 3. (Optional) Login cho cloud features
unity-mcp-cli login ./MyGameProject

# 4. Open Unity project (auto-connects và generates skills)
unity-mcp-cli open ./MyGameProject

# 5. Trong Unity Editor, setup AI Game Developer:
#    Window/AI Game Developer → Auto-generate Skills
```

### Step 3: Folder Structure

Tạo folder structure chuẩn cho production Unity project:

```
Assets/
├── _Project/                          # All game-specific assets
│   ├── Scripts/
│   │   ├── Core/                      # SO Framework: Variables, Events, RuntimeSets
│   │   │   ├── Variables/
│   │   │   │   ├── FloatVariable.cs
│   │   │   │   ├── IntVariable.cs
│   │   │   │   ├── BoolVariable.cs
│   │   │   │   └── StringVariable.cs
│   │   │   ├── Events/
│   │   │   │   ├── GameEvent.cs
│   │   │   │   ├── GameEventListener.cs
│   │   │   │   └── TypedGameEvent.cs
│   │   │   ├── RuntimeSets/
│   │   │   │   ├── RuntimeSet.cs
│   │   │   │   └── TransformRuntimeSet.cs
│   │   │   └── StateMachine/
│   │   │       ├── StateMachine.cs
│   │   │       └── State.cs
│   │   ├── Gameplay/                  # Game-specific systems
│   │   │   ├── Player/
│   │   │   ├── Enemies/
│   │   │   ├── Combat/
│   │   │   └── Economy/
│   │   ├── UI/
│   │   └── Editor/                    # Custom Inspector tools
│   ├── Data/                          # SO Asset instances
│   │   ├── Variables/
│   │   ├── Events/
│   │   └── GameConfig/
│   ├── Prefabs/
│   │   ├── Player/
│   │   ├── Enemies/
│   │   └── Environment/
│   ├── Scenes/
│   ├── Art/
│   │   ├── Materials/
│   │   ├── Textures/
│   │   ├── Models/
│   │   └── Animations/
│   └── Audio/
│       ├── SFX/
│       └── Music/
├── ThirdParty/                        # Third-party assets/packages
└── Plugins/                           # Native plugins
```

---

## Architecture Foundation

### ScriptableObject-First Design

**Nguyên tắc cốt lõi:** Tất cả shared game data phải nằm trong ScriptableObjects, không trong MonoBehaviour fields.

#### Tại Sao?

```
┌─────────────────────────────────────────────────────────────┐
│  ScriptableObject Benefits                                  │
├─────────────────────────────────────────────────────────────┤
│  ✅ Designer-friendly: Edit trong Inspector không cần code  │
│  ✅ Scene-independent: Không mất khi load scene mới       │
│  ✅ Event-driven: UI update tự động khi data thay đổi     │
│  ✅ Testable: Unit test không cần Unity scene             │
│  ✅ Reusable: Import/Export giữa projects                  │
│  ✅ Version control friendly: JSON-serializable            │
└─────────────────────────────────────────────────────────────┘
```

#### Khi Nào Dùng ScriptableObject?

| Use Case | SO Type | Example |
|----------|---------|---------|
| Shared value (health, score) | Variable | `FloatVariable playerHealth` |
| Decoupled communication | Event | `GameEvent playerDied` |
| Track entities in scene | RuntimeSet | `EnemyRuntimeSet` |
| State definitions | StateSO | `PatrolState`, `ChaseState` |
| Configuration data | ConfigSO | `GameConfig`, `DifficultyConfig` |
| Item/ability definitions | DataSO | `ItemDatabase`, `AbilitySO` |

---

## Workflow: Forgewright vs Unity-MCP

### Phân Chia Responsibilities

```
┌─────────────────────────────────────────────────────────────┐
│  FORGEWRIGHT HANDLE                                         │
│  (AI-powered C# architecture - Không cần Unity Editor)     │
├─────────────────────────────────────────────────────────────┤
│  • Architecture design (SO framework)                       │
│  • Complex gameplay logic                                   │
│  • ScriptableObject definitions                             │
│  • Event channel wiring                                     │
│  • Component code generation                                │
│  • Refactoring & code review                               │
│  • Type-safe C# code generation                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  UNITY-MCP HANDLE                                           │
│  (Editor automation - Cần Unity Editor mở)                 │
├─────────────────────────────────────────────────────────────┤
│  • Scene object placement                                   │
│  • Prefab assembly & instantiation                          │
│  • Material/texture assignment                              │
│  • Screenshot verification                                   │
│  • Test execution (PlayMode/EditMode)                       │
│  • Quick visual iterations                                  │
│  • Console log analysis                                     │
└─────────────────────────────────────────────────────────────┘
```

### Combined Workflow

```
┌────────────────────────────────────────────────────────────────────┐
│ STEP 1: Architecture Design (Forgewright)                         │
│ ├── Design SO Framework                                           │
│ ├── Plan Event Channel architecture                               │
│ ├── Define Component responsibilities                              │
│ └── Generate .cs files                                            │
└────────────────────────────────────────────────────────────────────┘
                                ↓
┌────────────────────────────────────────────────────────────────────┐
│ STEP 2: Scene Setup (Unity-MCP)                                   │
│ ├── Create empty GameObjects cho hierarchy                        │
│ ├── Assign prefabs từ SO references                               │
│ └── Setup materials và textures                                   │
└────────────────────────────────────────────────────────────────────┘
                                ↓
┌────────────────────────────────────────────────────────────────────┐
│ STEP 3: Code Implementation (Forgewright)                        │
│ ├── MonoBehaviour implementations                                 │
│ ├── SO event wiring                                              │
│ └── Gameplay logic                                               │
└────────────────────────────────────────────────────────────────────┘
                                ↓
┌────────────────────────────────────────────────────────────────────┐
│ STEP 4: Testing (Unity-MCP)                                      │
│ ├── Run PlayMode tests                                            │
│ ├── Capture screenshots                                          │
│ └── Console log analysis                                          │
└────────────────────────────────────────────────────────────────────┘
                                ↓
┌────────────────────────────────────────────────────────────────────┐
│ STEP 5: Quality Gate (Forgewright)                               │
│ ├── Architecture compliance check                                 │
│ ├── SO-first pattern verification                                 │
│ └── Brownfield safety validation                                  │
└────────────────────────────────────────────────────────────────────┘
```

### Khi Nào Dùng Tool Nào?

| Use Case | Approach | Reason |
|----------|----------|--------|
| Architecture design | Forgewright | Không cần Editor, cần type safety |
| SO framework creation | Forgewright | Cần project-specific patterns |
| Scene object placement | Unity-MCP | Cần visual feedback |
| Prefab assembly | Unity-MCP | Cần drag-drop workflow |
| Component wiring | Both | Forgewright code + Unity-MCP verify |
| Material setup | Unity-MCP | Cần visual preview |
| Testing & debugging | Unity-MCP | Console logs, screenshots |
| Gameplay logic | Forgewright | Cần complex logic |
| Greenfield architecture | Forgewright | Unity-MCP không có architecture guidance |
| Complex gameplay logic | Forgewright | Cần type safety, refactoring support |
| Refactoring lớn | Forgewright | Tool-based refactor dễ break |

---

## Core ScriptableObject Patterns

### 1. Variable Pattern

```csharp
// FloatVariable.cs - Reactive float value
using UnityEngine;

[CreateAssetMenu(menuName = "Variables/Float")]
public class FloatVariable : ScriptableObject
{
    [SerializeField] private float _value;
    [SerializeField] private float _defaultValue;

    public float Value
    {
        get => _value;
        set
        {
            _value = value;
            OnValueChanged?.Invoke(value);
        }
    }

    public event System.Action<float> OnValueChanged;

    public void SetValue(float value) => Value = value;
    public void ApplyChange(float amount) => Value += amount;
    public void ResetToDefault() => Value = _defaultValue;

    private void OnEnable() => _value = _defaultValue;
}
```

**Usage:**
```csharp
// Declare in MonoBehaviour
[SerializeField] private FloatVariable _playerHealth;

// Subscribe to changes (trong OnEnable)
_playerHealth.OnValueChanged += OnHealthChanged;

// Unsubscribe (trong OnDisable)
_playerHealth.OnValueChanged -= OnHealthChanged;

// UI tự update khi health thay đổi - không cần poll!
private void OnHealthChanged(float newValue)
{
    _healthBar.fillAmount = newValue / _maxHealth;
}
```

### 2. Event Channel Pattern

```csharp
// GameEvent.cs - Decoupled messaging
using UnityEngine;
using System.Collections.Generic;

[CreateAssetMenu(menuName = "Events/Game Event")]
public class GameEvent : ScriptableObject
{
    private readonly List<GameEventListener> _listeners = new();

    public void Raise()
    {
        for (int i = _listeners.Count - 1; i >= 0; i--)
            _listeners[i].OnEventRaised();
    }

    public void RegisterListener(GameEventListener listener) => _listeners.Add(listener);
    public void UnregisterListener(GameEventListener listener) => _listeners.Remove(listener);
}

// GameEventListener.cs - MonoBehaviour subscriber
using UnityEngine;
using UnityEngine.Events;

public class GameEventListener : MonoBehaviour
{
    [SerializeField] private GameEvent _event;
    [SerializeField] private UnityEvent _response;

    private void OnEnable() => _event.RegisterListener(this);
    private void OnDisable() => _event.UnregisterListener(this);
    public void OnEventRaised() => _response.Invoke();
}
```

**Usage:**
```csharp
// PlayerDeathHandler.cs - Publisher
public class PlayerController : MonoBehaviour
{
    [SerializeField] private GameEvent _playerDiedEvent;

    private void Die()
    {
        _playerDiedEvent.Raise();
    }
}

// GameOverManager.cs - Subscriber (via Inspector)
// Attach GameEventListener component, assign _playerDiedEvent
```

### 3. Typed Event Pattern

```csharp
// TypedGameEvent.cs - Event với payload
[CreateAssetMenu(menuName = "Events/Typed/Vector3 Event")]
public class Vector3GameEvent : GameEvent
{
    private readonly List<Vector3GameEventListener> _typedListeners = new();

    public void Raise(Vector3 value)
    {
        Raise(); // Call base
        for (int i = _typedListeners.Count - 1; i >= 0; i--)
            _typedListeners[i].OnEventRaised(value);
    }

    public void RegisterTypedListener(Vector3GameEventListener l) => _typedListeners.Add(l);
    public void UnregisterTypedListener(Vector3GameEventListener l) => _typedListeners.Remove(l);
}

// Generic version cho flexibility
[CreateAssetMenu(menuName = "Events/Typed/Damage Event")]
public class DamageGameEvent : GameEvent
{
    private readonly List<System.Action<DamageInfo>> _listeners = new();

    public void Raise(DamageInfo info)
    {
        Raise();
        foreach (var listener in _listeners)
            listener(info);
    }

    public void RegisterListener(System.Action<DamageInfo> listener) => _listeners.Add(listener);
    public void UnregisterListener(System.Action<DamageInfo> listener) => _listeners.Remove(listener);
}

[System.Serializable]
public struct DamageInfo
{
    public GameObject source;
    public GameObject target;
    public float amount;
    public DamageType type;
}
```

### 4. RuntimeSet Pattern

```csharp
// RuntimeSet.cs - Entity tracking không singleton
using UnityEngine;
using System.Collections.Generic;

public abstract class RuntimeSet<T> : ScriptableObject
{
    private readonly HashSet<T> _items = new();
    public IReadOnlyCollection<T> Items => _items;
    public int Count => _items.Count;

    public void Add(T item)
    {
        if (item != null)
            _items.Add(item);
    }

    public void Remove(T item) => _items.Remove(item);
    public bool Contains(T item) => _items.Contains(item);
    public void Clear() => _items.Clear();

    private void OnDisable() => Clear();
}

// EnemyRuntimeSet.cs
[CreateAssetMenu(menuName = "RuntimeSets/Enemy")]
public class EnemyRuntimeSet : RuntimeSet<EnemyController>
{
}

// Usage: AI target finder
public class AITargetFinder : MonoBehaviour
{
    [SerializeField] private EnemyRuntimeSet _enemies;
    [SerializeField] private FloatVariable _detectionRange;

    public EnemyController FindClosestEnemy(Vector3 position)
    {
        EnemyController closest = null;
        float closestDist = float.MaxValue;

        foreach (var enemy in _enemies.Items)
        {
            float dist = Vector3.Distance(position, enemy.transform.position);
            if (dist < closestDist && dist < _detectionRange.Value)
            {
                closest = enemy;
                closestDist = dist;
            }
        }
        return closest;
    }
}
```

### 5. State Machine Pattern

```csharp
// State.cs - SO-based state definition
using UnityEngine;

[CreateAssetMenu(menuName = "AI/States/Idle")]
public class StateSO : ScriptableObject
{
    public virtual void Execute(StateMachine stateMachine) { }
    public virtual void OnEnter(StateMachine stateMachine) { }
    public virtual void OnExit(StateMachine stateMachine) { }
}

// StateMachine.cs
public class StateMachine : MonoBehaviour
{
    [SerializeField] private StateSO _initialState;
    public StateSO CurrentState { get; private set; }

    private void Start() => SetState(_initialState);

    public void SetState(StateSO newState)
    {
        if (CurrentState != null)
            CurrentState.OnExit(this);

        CurrentState = newState;

        if (CurrentState != null)
            CurrentState.OnEnter(this);
    }

    private void Update()
    {
        CurrentState?.Execute(this);
    }
}

// Concrete states
[CreateAssetMenu(menuName = "AI/States/Chase")]
public class ChaseStateSO : StateSO
{
    [SerializeField] private FloatVariable _chaseSpeed;
    [SerializeField] private FloatVariable _stopDistance;

    public override void Execute(StateMachine stateMachine)
    {
        var agent = stateMachine.GetComponent<UnityEngine.AI.NavMeshAgent>();
        var target = stateMachine.GetComponent<AIController>().Target;

        if (target != null)
        {
            agent.SetDestination(target.position);
            agent.speed = _chaseSpeed.Value;
        }
    }
}
```

---

## Common Patterns & Anti-Patterns

### ✅ DO: Recommended Patterns

| Pattern | Description | Example |
|---------|-------------|---------|
| **SO Variables** | Dùng cho tất cả shared data | `FloatVariable playerHealth` |
| **Game Events** | Decoupled communication | `PlayerDiedEvent.Raise()` |
| **Runtime Sets** | Entity tracking | `EnemyRuntimeSet.Add(enemy)` |
| **State Machines** | AI/Player states | `StateMachine.SetState(newState)` |
| **Object Pooling** | Frequent spawn/despawn | `PoolManager.Spawn("bullet")` |
| **Assembly Definitions** | Compile speed | `_Project.Core.asmdef` |
| **Custom Inspectors** | Designer-friendly | `[Range(0, 100)] public float speed` |

### ❌ DON'T: Anti-Patterns to Avoid

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| **Singleton GameManager** | Global state, untestable, scene-dependent | SO Event channels |
| **`FindObjectOfType()` at runtime** | O(n) scan mỗi lần gọi | RuntimeSet hoặc SO reference |
| **Logic trong `Update()` checking conditions** | Lãng phí CPU | Event-driven subscription |
| **God MonoBehaviour (500+ lines)** | Impossible to maintain | Single-responsibility split |
| **Magic strings** | Typo = silent failure | `const string` hoặc SO reference |
| **Scene refs trong ScriptableObjects** | Memory leaks | RuntimeSet |
| **Không gọi `SetDirty()`** | Editor changes lost | `EditorUtility.SetDirty()` |
| **Instantiate không pooling** | GC spikes | Object pooling |

---

## Unity-MCP Tools Reference

### Tool Categories

| Category | Tools Count | Purpose |
|----------|-------------|---------|
| **Assets** | 20 | Asset management, prefabs, materials |
| **Scene & Hierarchy** | 22 | GameObject operations, scene management |
| **Scripting & Editor** | 13 | Code execution, testing, debugging |
| **Extensions** | 3+ | Animation, ParticleSystem, ProBuilder |

### Essential Tools

#### Scene & GameObject

| Tool | Description | Forgewright Use Case |
|------|-------------|---------------------|
| `gameobject-create` | Tạo new GameObject | Create spawn points, managers |
| `gameobject-find` | Find GameObject by info | Locate scene objects |
| `gameobject-modify` | Change transform, name, active | Configure objects |
| `gameobject-destroy` | Delete GameObject | Clean up objects |
| `gameobject-duplicate` | Clone GameObject | Duplicate for batch creation |
| `gameobject-component-add` | Add Component | Attach scripts |
| `gameobject-component-modify` | Change component values | Configure components |

#### Scene Management

| Tool | Description | Forgewright Use Case |
|------|-------------|---------------------|
| `scene-create` | Tạo new scene | Add gameplay scenes |
| `scene-open` | Open scene file | Load gameplay scene |
| `scene-save` | Save current scene | Persist changes |
| `scene-get-data` | List root GameObjects | Analyze scene |
| `scene-set-active` | Set active scene | Switch contexts |

#### Assets & Prefabs

| Tool | Description | Forgewright Use Case |
|------|-------------|---------------------|
| `assets-prefab-create` | Scene → Prefab | Convert assembled objects |
| `assets-prefab-instantiate` | Spawn prefab | Runtime spawning |
| `assets-prefab-open` | Open prefab edit mode | Edit prefab |
| `assets-material-create` | Create material | Setup materials |
| `assets-find` | Search assets | Locate files |

#### Scripting & Testing

| Tool | Description | Forgewright Use Case |
|------|-------------|---------------------|
| `script-update-or-create` | Write/update C# file | Generate code |
| `script-execute` | Run C# with Roslyn | Quick test (no save) |
| `tests-run` | Run EditMode/PlayMode tests | Verify functionality |
| `console-get-logs` | Get Editor console logs | Debug errors |
| `editor-selection-get` | Get selected objects | Inspect selection |

#### Visual Verification

| Tool | Description | Forgewright Use Case |
|------|-------------|---------------------|
| `screenshot-game-view` | Capture Game View | Visual verification |
| `screenshot-scene-view` | Capture Scene View | Scene documentation |
| `screenshot-camera` | Capture from camera | Gameplay screenshots |

### Installation

```bash
# Unity-MCP CLI
npm install -g unity-mcp-cli

# Plugin installation
unity-mcp-cli install-plugin ./MyUnityProject

# Cloud login (optional)
unity-mcp-cli login ./MyUnityProject

# Open project
unity-mcp-cli open ./MyUnityProject

# Setup trong Editor
# Window/AI Game Developer → Auto-generate Skills
```

---

## Quick Reference Commands

### Unity-MCP CLI

```bash
# Install plugin
unity-mcp-cli install-plugin ./MyProject

# Login
unity-mcp-cli login ./MyProject

# Open project
unity-mcp-cli open ./MyProject

# Wait for ready
unity-mcp-cli wait-for-ready ./MyProject

# Install Unity (headless)
unity-mcp-cli install-unity

# Create new project
unity-mcp-cli create-project ./NewProject
```

### Unity-MCP MCP Tools

```bash
# GameObject operations
gameobject-create              # Create empty GameObject
gameobject-find                # Find GameObject
gameobject-modify              # Modify transform/properties
gameobject-destroy             # Delete GameObject
gameobject-component-add       # Add component
gameobject-component-modify    # Configure component

# Scene operations
scene-create                  # New scene
scene-open                    # Open scene
scene-save                    # Save scene
scene-get-data                # List root objects

# Asset operations
assets-prefab-create          # Create prefab
assets-prefab-instantiate     # Spawn prefab
assets-material-create        # Create material
assets-find                   # Search assets

# Testing & Debugging
tests-run                     # Run tests
console-get-logs              # Get logs
screenshot-game-view          # Capture screenshot
```

---

## Extension Packages

Unity-MCP có extension packages cho specialized features:

| Package | Description |
|---------|-------------|
| [AI Animation](https://github.com/IvanMurzak/Unity-AI-Animation) | Animation tools |
| [AI ParticleSystem](https://github.com/IvanMurzak/Unity-AI-ParticleSystem) | Particle system tools |
| [AI ProBuilder](https://github.com/IvanMurzak/Unity-AI-ProBuilder) | ProBuilder integration |

Install qua Unity Package Manager:
```
openupm add com.ivanmurzak.unity.animation
openupm add com.ivanmurzak.unity.particles
openupm add com.ivanmurzak.unity.probuilder
```

---

## Resources

| Resource | URL |
|----------|-----|
| Unity-MCP GitHub | https://github.com/IvanMurzak/Unity-MCP |
| Unity-MCP Documentation | https://github.com/IvanMurzak/Unity-MCP/blob/main/docs/default-mcp-tools.md |
| Forgewright Unity Engineer | `skills/unity-engineer/SKILL.md` |
| Unity Documentation | https://docs.unity.com/ |

---

## Appendix: Sample Project Structure

### Minimal Setup (Prototype)

```
Assets/
├── _Project/
│   ├── Scripts/
│   │   ├── Core/
│   │   │   ├── Variables/FloatVariable.cs
│   │   │   ├── Variables/IntVariable.cs
│   │   │   └── Events/GameEvent.cs
│   │   └── Gameplay/
│   │       └── Player/
│   │           └── PlayerController.cs
│   ├── Data/
│   │   ├── PlayerHealth.asset
│   │   └── OnPlayerDamaged.asset
│   └── Prefabs/
│       └── Player.prefab
```

### Full Production Setup

```
Assets/
├── _Project/
│   ├── Scripts/
│   │   ├── Core/
│   │   │   ├── Variables/
│   │   │   ├── Events/
│   │   │   ├── RuntimeSets/
│   │   │   ├── StateMachine/
│   │   │   └── Pooling/
│   │   ├── Gameplay/
│   │   │   ├── Player/
│   │   │   ├── Enemies/
│   │   │   ├── Combat/
│   │   │   ├── Economy/
│   │   │   └── Progression/
│   │   ├── UI/
│   │   │   ├── HUD/
│   │   │   └── Menus/
│   │   └── Editor/
│   │       ├── Inspectors/
│   │       └── Windows/
│   ├── Data/
│   │   ├── Variables/
│   │   ├── Events/
│   │   ├── RuntimeSets/
│   │   ├── GameConfig/
│   │   ├── Items/
│   │   └── AI/
│   ├── Prefabs/
│   ├── Scenes/
│   ├── Art/
│   └── Audio/
├── ThirdParty/
└── Plugins/
```

---

**Version:** 1.0.0
**Last Updated:** 2026-04-13
**Maintainer:** Forgewright
