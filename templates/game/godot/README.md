# Game Templates — Godot

Godot-specific multiplayer templates.

## Templates

| Template | Description |
|----------|-------------|
| `lobby.gd.hbs` | Multiplayer lobby with player list and ready state |
| `network_manager.gd.hbs` | NetworkManager singleton for ENet setup |
| `syncvar.gd.hbs` | Property synchronization decorator |
| `server_authoritative.gd.hbs` | Server-authoritative game loop |

## Dependencies

These templates are designed for **Godot 4.x** with `MultiplayerAPI` (ENet).

## Usage

```gdscript
# Add to your project
extends Node

# Generate and customize for your game
```
