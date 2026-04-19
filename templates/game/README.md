# Game Templates

Game engine scaffolding templates for multiplayer game development.

## Templates (Godot)

| Template | Description |
|----------|-------------|
| `godot/lobby.gd.hbs` | Multiplayer lobby system |
| `godot/network_manager.gd.hbs` | NetworkManager singleton |
| `godot/syncvar.gd.hbs` | Property synchronization helper |
| `godot/server_authoritative.gd.hbs` | Server-authoritative game loop |

## Usage

```bash
# Generate lobby system
npx ts-node scripts/generate-template.ts \
  --template game/godot/lobby \
  --output ./lobby.gd \
  --data '{"maxPlayers": 4, "gameMode": "deathmatch"}'

# Generate NetworkManager
npx ts-node scripts/generate-template.ts \
  --template game/godot/network_manager \
  --output ./network_manager.gd \
  --data '{"serverPort": 34567, "maxConnections": 8}'
```

## Context Variables

```typescript
{
  maxPlayers?: number;     // Max players in lobby (default: 4)
  gameMode?: string;       // "deathmatch" | "team" | "co-op"
  serverPort?: number;     // Server port (default: 34567)
  maxConnections?: number; // Max connections (default: 8)
  tickRate?: number;       // Server tick rate (default: 64)
}
```

## Godot Multiplayer Setup

1. Generate NetworkManager singleton
2. Generate lobby system
3. Add SyncVar helpers for property sync
4. Implement server-authoritative logic

## Features

- **Lobby**: Player list, ready state, host migration
- **NetworkManager**: ENet setup, connection handling, latency reporting
- **SyncVar**: Authority management, interpolation, delta compression
- **Server Authoritative**: Tick management, client prediction, reconciliation
