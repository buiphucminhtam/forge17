# Scope Definition: Platformer Game

## Game Overview

A classic 2D side-scrolling platformer built with Phaser 3. Players control a hero character navigating through 5 levels, collecting items, defeating enemies, and battling bosses.

## Gameplay

### Player Controls

| Action | Keyboard | Description |
|--------|----------|-------------|
| Move Left | A / ← | Move left |
| Move Right | D / → | Move right |
| Jump | W / ↑ / Space | Jump (hold for higher) |
| Attack | J / Click | Attack with weapon |
| Pause | Escape / P | Pause game |

### Game Mechanics

#### Player Stats

| Stat | Starting Value | Max Value |
|------|---------------|-----------|
| Health | 5 | 10 |
| Lives | 3 | 3 |
| Score | 0 | Unlimited |
| Coins | 0 | Unlimited |

#### Movement

- Horizontal speed: 200 pixels/sec
- Jump velocity: -450 pixels/sec
- Gravity: 800 pixels/sec²
- Double jump: Enabled
- Wall jump: Enabled

## ✅ In Scope

### Core Gameplay

- [ ] **Player Character**
  - Sprite with idle, walk, run, jump, attack animations
  - Health and lives system
  - Invincibility frames on damage
  - Death and respawn

- [ ] **Movement System**
  - Left/right movement with acceleration
  - Variable height jump (hold for higher)
  - Double jump ability
  - Wall sliding and wall jump
  - Coyote time (150ms)

- [ ] **Combat System**
  - Melee attack with cooldown
  - Attack hitbox visualization
  - Knockback on enemies
  - Player knockback on damage

### Enemies

- [ ] **Slime** — Basic enemy, patrols left-right, dies on touch
- [ ] **Walker** — Walks toward player when in range
- [ ] **Jumper** — Jumps when player approaches
- [ ] **Shooter** — Shoots projectiles at player
- [ ] **Flying Enemy** — Flies in patterns
- [ ] **Boss: Golem** — Level 3, charges and stomps
- [ ] **Boss: Dragon** — Level 5, flies and breathes fire

### Collectibles

| Item | Effect | Points |
|------|--------|--------|
| Coin | +1 to coin count | 100 |
| Gem (Red) | +1 health (if not max) | 500 |
| Gem (Blue) | +2 health (if not max) | 1000 |
| Power-up: Speed | 2x speed for 10s | - |
| Power-up: Attack | 2x damage for 10s | - |
| Power-up: Invincibility | Invincible for 5s | - |

### Levels

| Level | Name | Enemies | Boss | Time Target |
|-------|------|---------|------|------------|
| 1 | Green Hills | Slime, Walker | None | 2 min |
| 2 | Crystal Cave | Slime, Walker, Jumper | None | 3 min |
| 3 | Dark Forest | All basic + Shooter | Golem | 4 min |
| 4 | Sky Castle | Flying, Shooter | None | 4 min |
| 5 | Dragon's Lair | All types | Dragon | 5 min |

### UI/UX

- [ ] HUD (health, lives, coins, score)
- [ ] Pause menu (resume, restart, quit)
- [ ] Level complete screen
- [ ] Game over screen
- [ ] Title screen
- [ ] Controls screen

### Audio

- [ ] Background music per level
- [ ] Jump sound effect
- [ ] Attack sound effect
- [ ] Coin collection sound
- [ ] Damage sound
- [ ] Enemy defeat sound
- [ ] Boss music

## ❌ Out of Scope

### v2.0 Features

- [ ] Mobile touch controls
- [ ] Level editor
- [ ] Custom character skins
- [ ] Multiplayer
- [ ] Online leaderboard
- [ ] Additional playable characters
- [ ] In-app purchases
- [ ] DLC levels

## Technical Constraints

| Aspect | Specification |
|--------|--------------|
| Engine | Phaser 3.60+ |
| Resolution | 800x600 (scaled to fit) |
| Target FPS | 60 |
| Max sprite size | 256x256 |
| Audio format | MP3 + OGG |
| Save data | localStorage |

## Performance Targets

| Metric | Target |
|--------|--------|
| Frame rate | 60 FPS stable |
| Load time | < 3 seconds |
| Memory usage | < 200MB |
| Bundle size | < 5MB |

## Art Style

| Element | Style |
|---------|-------|
| Characters | Pixel art (16x16 base) |
| Tiles | Pixel art (16x16) |
| UI | Clean, minimal |
| Effects | Particle systems |

## Level Design Principles

1. **Progressive Difficulty** — Each level harder than previous
2. **Teach Mechanic** — Introduce one new enemy/mechanic per level
3. **Checkpoints** — One checkpoint per level section
4. **Fair Design** — No cheap deaths, always escapable
5. **Rewards** — Hidden areas with collectibles

## Acceptance Criteria

| # | Criteria | Test Method |
|---|----------|-------------|
| AC-01 | Player can complete level 1 | Play through level |
| AC-02 | All enemies behave correctly | Test each enemy type |
| AC-03 | Boss battles work | Defeat each boss |
| AC-04 | Save/load works | Save mid-game, reload, verify state |
| AC-05 | Audio plays correctly | Play game, verify all sounds |
| AC-06 | UI displays correctly | Verify all screens |
| AC-07 | 60 FPS maintained | Performance profiling |

## Definition of Done

- [ ] All 5 levels playable
- [ ] All enemies implemented and balanced
- [ ] Both bosses defeated and working
- [ ] All collectibles functional
- [ ] All UI screens complete
- [ ] Audio implemented for all events
- [ ] Save/load system working
- [ ] No game-breaking bugs
- [ ] 60 FPS on target hardware
- [ ] Playtested and polished
