# Multica Hub

Unified Multi-IDE Orchestration Dashboard - Quản lý tất cả Forgewright workspaces từ một nơi.

## Features

### Environment Status Dashboard
- Hiển thị **per-project status**: Forgewright submodule, MCP config, Git
- **Auto-scan** tất cả projects trong `~/Documents/GitHub`
- **Setup buttons** cho từng project:
  - `Init + Setup`: Thêm Forgewright submodule + setup MCP
  - `Setup MCP`: Chỉ setup MCP cho project đã có Forgewright
- Real-time status check với auto-refresh

### Supported Projects
Tự động detect các projects có:
- Git repository
- Forgewright submodule
- MCP manifest (`.antigravity/mcp-manifest.json`)

## Quick Start

```bash
cd multica-hub
pnpm install
pnpm dev
```

Dashboard sẽ chạy tại: http://localhost:4000

## API Endpoints

### GET /api/projects
Returns list of all GitHub projects with Forgewright status.

```json
{
  "projects": [
    {
      "name": "project-name",
      "path": "/path/to/project",
      "hasForgewright": true,
      "hasMCP": true,
      "hasGit": true
    }
  ],
  "total": 15,
  "withForgewright": 6,
  "withMCP": 6
}
```

### POST /api/projects/setup
Setup Forgewright/MCP cho project.

**Request:**
```json
{
  "projectPath": "/path/to/project",
  "action": "init-forgewright" | "setup-mcp" | "check-status"
}
```

**Actions:**
| Action | Description |
|--------|-------------|
| `init-forgewright` | Thêm forgewright submodule + setup MCP |
| `setup-mcp` | Chỉ setup MCP (cần có forgewright) |
| `check-status` | Kiểm tra status hiện tại |

**Response:**
```json
{
  "success": true,
  "message": "Setup completed",
  "hasForgewright": true,
  "hasMCP": true,
  "details": []
}
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 4000 | Dashboard port |
| `GITHUB_PATH` | `~/Documents/GitHub` | Projects directory |

## Project Structure

```
multica-hub/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── projects/
│   │   │   │   ├── route.ts       # GET /api/projects
│   │   │   │   └── setup/
│   │   │   │       └── route.ts   # POST /api/projects/setup
│   │   │   └── page.tsx          # Main dashboard
│   │   └── status/
│   │       └── page.tsx          # Status page
│   └── components/
│       └── hub/
│           ├── EnvironmentStatus.tsx  # Status component
│           ├── GlobalStats.tsx
│           ├── HubHeader.tsx
│           └── HubSidebar.tsx
├── prisma/
│   └── schema.prisma
└── package.json
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: Tailwind CSS, Lucide Icons
- **Database**: Prisma + SQLite (local)
- **Icons**: Lucide React

## Related

- [Forgewright](https://github.com/buiphucminhtam/forgewright) - Main project
- [Antigravity](./.antigravity/) - Project intelligence layer
