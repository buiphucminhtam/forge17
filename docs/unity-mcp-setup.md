# Unity-MCP Setup Guide

## Overview

Hướng dẫn cài đặt và cấu hình **Unity-MCP** (IvanMurzak/Unity-MCP) để tích hợp với Forgewright Unity skills.

**Unity-MCP** cung cấp 100+ MCP tools để thao tác với Unity Editor từ AI agents như Claude Code, Cursor, Gemini.

---

## Prerequisites

- Unity 2021.3+ (LTS recommended)
- Node.js 18+ (cho CLI)
- AI agent hỗ trợ MCP (Claude Code, Cursor, Gemini, Copilot)

> **⚠️ Important:** Project path không được chứa spaces
> - ✅ `C:/MyProjects/MyProject`
> - ❌ `C:/My Projects/MyProject`

---

## Installation

### Option 1: CLI (Recommended)

#### 1.1 Install unity-mcp-cli

```bash
npm install -g unity-mcp-cli
```

#### 1.2 Install Unity-MCP Plugin

```bash
# Di chuyển đến Unity project
cd ./MyUnityProject

# Cài plugin vào project
unity-mcp-cli install-plugin .
```

#### 1.3 Open Unity Project

```bash
# Mở Unity project (plugin sẽ auto-connect)
unity-mcp-cli open .
```

#### 1.4 Setup AI Agent

```bash
# Generate config cho Claude Code
unity-mcp-cli setup-skills claude-code .
```

### Option 2: Manual Installation

#### 1. Download Installer

Tải `.unitypackage` từ [Unity Asset Store](https://github.com/IvanMurzak/Unity-MCP/releases)

#### 2. Import vào Unity

```
Assets → Import Package → Custom Package → chọn file .unitypackage
```

#### 3. Configure AI Agent

Mở `Window/AI Game Developer` trong Unity Editor, click `Auto-generate Skills`

---

## Configuration

### Claude Code

#### macOS (Apple Silicon)

```json
{
  "mcpServers": {
    "ai-game-developer": {
      "command": "/Users/you/Projects/MyUnityProject/Library/mcp-server/osx-arm64/unity-mcp-server",
      "args": ["--port=8080", "--client-transport=stdio"]
    }
  }
}
```

#### macOS (Intel)

```json
{
  "mcpServers": {
    "ai-game-developer": {
      "command": "/Users/you/Projects/MyUnityProject/Library/mcp-server/osx-x64/unity-mcp-server",
      "args": ["--port=8080", "--client-transport=stdio"]
    }
  }
}
```

#### Windows

```json
{
  "mcpServers": {
    "ai-game-developer": {
      "command": "C:\\Projects\\MyUnityProject\\Library\\mcp-server\\win-x64\\unity-mcp-server.exe",
      "args": ["--port=8080", "--client-transport=stdio"]
    }
  }
}
```

### Cursor

Thêm vào `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "ai-game-developer": {
      "command": "/path/to/unity-mcp-server",
      "args": ["--port=8080", "--client-transport=stdio"]
    }
  }
}
```

### Gemini CLI

```bash
gemini mcp add ai-game-developer <command>
```

---

## Docker Deployment

### streamableHttp Transport

```bash
docker run -p 8080:8080 ivanmurzakdev/unity-mcp-server
```

```json
{
  "mcpServers": {
    "ai-game-developer": {
      "url": "http://localhost:8080"
    }
  }
}
```

### stdio Transport

```bash
docker run -t -e MCP_PLUGIN_CLIENT_TRANSPORT=stdio -p 8080:8080 ivanmurzakdev/unity-mcp-server
```

---

## Usage with Forgewright

### Combined Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│ Forgewright: Architecture Design (NO Unity Editor)              │
│ - SO framework, event channels, component architecture          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Unity-MCP: Scene Setup (Editor Automation)                      │
│ - Create GameObjects, assign components, setup materials        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Forgewright: Code Implementation (NO Unity Editor)              │
│ - Gameplay logic, event wiring, UI systems                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Unity-MCP: Testing & Verification                               │
│ - Run tests, capture screenshots, debug console                 │
└─────────────────────────────────────────────────────────────────┘
```

### Example: Create Player System

**Step 1: Design Architecture (Forgewright)**

```
# Prompt cho Forgewright:
"Design a player controller system using SO-first architecture.
 Include FloatVariable for health, GameEvent for damage, and
 single-responsibility components for movement and combat."
```

**Step 2: Setup Scene (Unity-MCP)**

```
# Use Unity-MCP tools:
gameobject-create(name="Player", parent="Game")
gameobject-component-add(object="Player", component="Rigidbody")
gameobject-component-add(object="Player", component="CapsuleCollider")
```

**Step 3: Implement Logic (Forgewright)**

```
# Prompt cho Forgewright:
"Implement PlayerHealth.cs that uses FloatVariable SO for health
 and raises GameEvent on damage. Follow the architecture we designed."
```

**Step 4: Test (Unity-MCP)**

```
# Use Unity-MCP tools:
editor-application-set-state(play=true)
console-get-logs(filter="Error")
screenshot-game-view()
```

---

## MCP Tools Reference

### Assets

| Tool | Description |
|------|-------------|
| `assets-copy` | Copy asset at path |
| `assets-create-folder` | Create folder in project |
| `assets-delete` | Delete assets |
| `assets-find` | Search asset database |
| `assets-material-create` | Create new material |
| `assets-prefab-create` | Create prefab from GameObject |
| `assets-prefab-instantiate` | Instantiate prefab in scene |
| `package-add` | Install UPM package |
| `package-list` | List installed packages |

### Scene & Hierarchy

| Tool | Description |
|------|-------------|
| `gameobject-create` | Create new GameObject |
| `gameobject-destroy` | Destroy GameObject |
| `gameobject-duplicate` | Duplicate GameObjects |
| `gameobject-modify` | Modify GameObject properties |
| `gameobject-component-add` | Add Component |
| `gameobject-component-modify` | Modify Component |
| `scene-create` | Create new scene |
| `scene-open` | Open scene |
| `scene-save` | Save scene |

### Scripting

| Tool | Description |
|------|-------------|
| `script-update-or-create` | Create/update C# file |
| `script-execute` | Execute C# via Roslyn |
| `script-read` | Read script content |
| `reflection-method-call` | Call C# method |
| `reflection-method-find` | Find method via reflection |

### Testing & Debug

| Tool | Description |
|------|-------------|
| `tests-run` | Run Unity tests |
| `console-get-logs` | Get Editor console logs |
| `screenshot-scene-view` | Screenshot scene view |
| `screenshot-game-view` | Screenshot game view |

### Editor Control

| Tool | Description |
|------|-------------|
| `editor-application-set-state` | Control play/pause |
| `editor-selection-get` | Get selection |
| `editor-selection-set` | Set selection |

---

## Troubleshooting

### "MCP Server not responding"

1. Check Unity Editor is open
2. Verify port matches (default 8080)
3. Restart Unity Editor
4. Reinstall plugin

### "Tool not found"

1. Check Unity-MCP version
2. Re-generate skills: `Window/AI Game Developer → Auto-generate`
3. Restart AI agent

### "Permission denied" (macOS)

```bash
chmod +x Library/mcp-server/osx-arm64/unity-mcp-server
```

### "Project path with spaces"

Unity-MCP không hỗ trợ paths có spaces. Di chuyển project đến path không có spaces.

### Connection timeout

Tăng timeout trong Unity Editor:
```
Window/AI Game Developer → Advanced → Plugin Timeout
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MCP_PLUGIN_PORT` | 8080 | Connection port |
| `MCP_PLUGIN_CLIENT_TIMEOUT` | 10000 | Timeout (ms) |
| `MCP_PLUGIN_CLIENT_TRANSPORT` | streamableHttp | Transport type |

### Command Line Override

```bash
Unity.exe -batchmode -nographics \
  -UNITY_MCP_HOST=http://localhost:8080 \
  -UNITY_MCP_KEEP_CONNECTED=true \
  -UNITY_MCP_AUTH_OPTION=required \
  -UNITY_MCP_TOKEN=my-secret-token
```

---

## Extension Packages

### AI Animation

```bash
openupm add com.ivanmurzak.unity.ai-animation
```

### AI ParticleSystem

```bash
openupm add com.ivanmurzak.unity.ai-particle-system
```

### AI ProBuilder

```bash
openupm add com.ivanmurzak.unity.ai-probuilder
```

---

## Resources

- [Unity-MCP GitHub](https://github.com/IvanMurzak/Unity-MCP)
- [Documentation](https://github.com/IvanMurzak/Unity-MCP/wiki)
- [Discord Community](https://discord.gg/unity-mcp)
- [Forgewright Unity Skills](./unity-mcp-integration)
