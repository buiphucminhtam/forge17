# Task Breakdown: Platformer Game

## Summary

| Metric | Value |
|--------|-------|
| **Total Tasks** | 20 |
| **Total Estimate** | 84 hours |
| **P0 Tasks** | 5 tasks |
| **P1 Tasks** | 10 tasks |
| **P2 Tasks** | 5 tasks |

## Task List

### P0 — Critical (Core Gameplay)

| # | Task | Estimate | Dependencies |
|---|------|----------|--------------|
| P0-01 | Project setup (Phaser 3, build config) | 4h | - |
| P0-02 | Player controller (movement, physics) | 8h | P0-01 |
| P0-03 | Tilemap system & collision | 8h | P0-01 |
| P0-04 | Enemy AI system (all types) | 10h | P0-02 |
| P0-05 | Core combat (attacks, damage) | 6h | P0-02 |

### P1 — High Priority (Features)

| # | Task | Estimate | Dependencies |
|---|------|----------|--------------|
| P1-01 | Collectibles system | 6h | P0-03 |
| P1-02 | Health & scoring system | 4h | P0-02 |
| P1-03 | Boss: Golem (Level 3) | 6h | P0-04 |
| P1-04 | Boss: Dragon (Level 5) | 8h | P0-04 |
| P1-05 | Level 1: Green Hills | 4h | P0-03 |
| P1-06 | Level 2: Crystal Cave | 4h | P1-05 |
| P1-07 | Level 3: Dark Forest | 4h | P1-06 |
| P1-08 | Level 4: Sky Castle | 4h | P1-07 |
| P1-09 | Level 5: Dragon's Lair | 4h | P1-08 |
| P1-10 | Audio system | 6h | P0-01 |

### P2 — Medium Priority (Polish)

| # | Task | Estimate | Dependencies |
|---|------|----------|--------------|
| P2-01 | UI system (menus, HUD) | 6h | P0-01 |
| P2-02 | Save/load system | 4h | P1-02 |
| P2-03 | Power-up system | 4h | P1-01 |
| P2-04 | Particle effects | 4h | P0-02 |
| P2-05 | Polish & bug fixes | 8h | All P1 |

## Task Details

### P0-01: Project Setup

**Description:** Initialize Phaser 3 project with build configuration (Webpack/Vite), folder structure, and base game template.

**Acceptance Criteria:**
- [ ] Phaser 3 installed via npm
- [ ] Webpack/Vite configured for web build
- [ ] Folder structure created (scenes, sprites, audio)
- [ ] Base game runs in browser
- [ ] Hot reload working

**Files:**
- `package.json`
- `webpack.config.js`
- `src/main.js`
- `src/scenes/`

---

### P0-02: Player Controller

**Description:** Create player character with full movement system (walk, run, jump, double jump, wall jump).

**Acceptance Criteria:**
- [ ] Left/right movement with acceleration
- [ ] Variable height jump (hold = higher)
- [ ] Double jump enabled
- [ ] Wall slide and wall jump
- [ ] Coyote time (150ms grace period)
- [ ] All animation states (idle, walk, run, jump, fall, attack)

**Files:**
- `src/entities/Player.js`
- `src/scenes/PlayScene.js`

---

### P0-03: Tilemap System

**Description:** Implement tile-based level system using Tiled maps.

**Acceptance Criteria:**
- [ ] Load and parse Tiled JSON maps
- [ ] Render tilemap with camera follow
- [ ] Collision detection for all tiles
- [ ] Support for multiple tile layers
- [ ] Parallax background support

**Files:**
- `src/systems/TilemapManager.js`
- `assets/maps/*.json`
- `assets/tilesets/*.png`

---

### P0-04: Enemy AI

**Description:** Implement all enemy types with AI behaviors.

**Acceptance Criteria:**
- [ ] Slime: patrol left-right, reverse at edges
- [ ] Walker: patrol, chase player when in range
- [ ] Jumper: jump when player approaches
- [ ] Shooter: shoot projectiles at player
- [ ] Flying: sine wave movement pattern
- [ ] All enemies take damage and die

**Files:**
- `src/entities/Enemy.js`
- `src/entities/enemies/*.js`
- `src/entities/Projectile.js`

---

### P0-05: Combat System

**Description:** Player attack system with hitboxes and damage.

**Acceptance Criteria:**
- [ ] Attack animation and hitbox
- [ ] Attack cooldown (300ms)
- [ ] Enemy knockback on hit
- [ ] Player invincibility frames (1s)
- [ ] Attack sound effect

**Files:**
- `src/systems/CombatSystem.js`

---

## Sprint Planning

### Sprint 1: Foundation (20h)

| Task | Estimate | Days |
|------|----------|------|
| P0-01 | 4h | 0.5 |
| P0-02 | 8h | 1 |
| P0-03 | 8h | 1 |
| **Total** | 20h | **2.5 days** |

### Sprint 2: Enemies & Combat (22h)

| Task | Estimate | Days |
|------|----------|------|
| P0-04 | 10h | 1.25 |
| P0-05 | 6h | 0.75 |
| P1-02 | 4h | 0.5 |
| P2-04 | 4h | 0.5 |
| **Total** | 24h | **3 days** |

### Sprint 3: Collectibles & Power-ups (14h)

| Task | Estimate | Days |
|------|----------|------|
| P1-01 | 6h | 0.75 |
| P1-03 | 6h | 0.75 |
| P2-03 | 4h | 0.5 |
| **Total** | 16h | **2 days** |

### Sprint 4: Levels (20h)

| Task | Estimate | Days |
|------|----------|------|
| P1-05 | 4h | 0.5 |
| P1-06 | 4h | 0.5 |
| P1-07 | 4h | 0.5 |
| P1-08 | 4h | 0.5 |
| P1-09 | 4h | 0.5 |
| **Total** | 20h | **2.5 days** |

### Sprint 5: Bosses & Audio (14h)

| Task | Estimate | Days |
|------|----------|------|
| P1-04 | 8h | 1 |
| P1-10 | 6h | 0.75 |
| **Total** | 14h | **1.75 days** |

### Sprint 6: UI & Polish (18h)

| Task | Estimate | Days |
|------|----------|------|
| P2-01 | 6h | 0.75 |
| P2-02 | 4h | 0.5 |
| P2-05 | 8h | 1 |
| **Total** | 18h | **2.25 days** |

**Total: 112 hours / ~14 days**

---

## Enemy Specifications

### Slime

| Property | Value |
|----------|-------|
| Health | 1 hit |
| Speed | 50 px/s |
| Behavior | Patrol, reverse at edges |
| Damage to player | 1 |

### Walker

| Property | Value |
|----------|-------|
| Health | 2 hits |
| Speed | 80 px/s |
| Behavior | Patrol, chase within 150px |
| Damage to player | 1 |

### Jumper

| Property | Value |
|----------|-------|
| Health | 2 hits |
| Speed | 60 px/s |
| Behavior | Jump when player within 200px |
| Jump height | 200px |
| Damage to player | 1 |

### Shooter

| Property | Value |
|----------|-------|
| Health | 3 hits |
| Speed | 0 (stationary) |
| Behavior | Shoot every 2s when player in range |
| Projectile speed | 200 px/s |
| Range | 300px |
| Damage to player | 1 |

### Golem (Boss)

| Property | Value |
|----------|-------|
| Health | 20 hits |
| Behavior | Patrol → Charge → Stomp |
| Charge speed | 400 px/s |
| Stomp damage | 150px radius |
| Damage to player | 2 |

### Dragon (Boss)

| Property | Value |
|----------|-------|
| Health | 40 hits |
| Behavior | Fly → Fire breath → Dive attack |
| Fire breath | 60px wide, 200px long |
| Dive speed | 500 px/s |
| Damage to player | 3 |
