---
name: game-asset-vfx
description: >
  [production-grade internal] Quality standards and production patterns for game
  assets and VFX. Covers procedural sprite generation, particle effects, screen
  effects, UI polish, background design, and visual feedback systems. Focused on
  web/Phaser 3 games but principles apply to any 2D engine.
  Triggers on: "game assets", "sprite quality", "VFX quality", "visual polish",
  "game juice", "particle effects", "screen shake", "game feel", "art quality",
  "generateTexture", "procedural art", "game aesthetics", "premium visuals".
  Routed via the production-grade orchestrator (Game Build mode).
version: 1.0.0
author: forgewright
tags: [game-assets, vfx, sprites, particles, visual-polish, game-juice, phaser, 2d-art, procedural-art]
---

# Game Asset & VFX — Visual Quality Standards

## Protocols

!`cat skills/_shared/protocols/ux-protocol.md 2>/dev/null || true`
!`cat skills/_shared/protocols/input-validation.md 2>/dev/null || true`
!`cat skills/_shared/protocols/tool-efficiency.md 2>/dev/null || true`
!`cat .production-grade.yaml 2>/dev/null || echo "No config — using defaults"`

**Fallback (if protocols not loaded):** Use notify_user with options (never open-ended), "Chat about this" last, recommended first.

## Overview

This skill defines the visual quality bar for game assets and VFX. Games live or die on *feel* — and feel comes from visual polish. A mechanically solid game with flat rectangles and no feedback feels like a prototype. The same game with detailed sprites, layered particle effects, and satisfying screen reactions feels premium.

This skill focuses on **web-based 2D games** (Phaser 3 / HTML5 Canvas) where assets are generated procedurally via `generateTexture()` or loaded as sprite sheets. The patterns also apply to any 2D engine (Godot 2D, Pixi.js, Love2D).

## When to Use

- Creating new game sprites or textures procedurally
- Reviewing existing visuals for quality (audit)
- Designing VFX systems (particles, screen effects, transitions)
- Adding "game juice" — making actions feel satisfying
- Setting up backgrounds, UI elements, or menu screens
- Any time a game looks "too simple" or "prototype-ish"

---

## Part 1 — Sprite & Asset Quality Standards

### The Quality Ladder

Every visual element in a game lands on this quality ladder. The minimum bar for shipping is **Level 3**.

| Level | Name | Characteristics | Example |
|-------|------|----------------|---------|
| 1 | Placeholder | Plain rectangle, single color | `fillRect(0, 0, 32, 32)` — red square |
| 2 | Basic | Shape with border or simple gradient | Circle with outline |
| 3 | **Polished** | Multi-layer: base + gradient + highlights + shadow + detail | Gem with shine, depth, and glow |
| 4 | Premium | Animation, texture patterns, sub-pixel detail | Character with idle animation, clothing detail |
| 5 | AAA | Full sprite sheet, hand-crafted or AI-generated art | Professional pixel art or vector illustration |

### Procedural Sprite Standards (generateTexture)

When generating sprites via Phaser's `generateTexture()`, every sprite should include **at least 4 visual layers** because flat shapes read as placeholder art, while layered shapes feel like intentional design:

```
Layer 1: Base shape + fill (gradient if possible)
Layer 2: Shadow / dark edge (bottom, right)
Layer 3: Highlight / specular (top-left, center)
Layer 4: Detail / accent (pattern, icon, glow, outline)
```

#### Concrete Example — A Gem Sprite

```javascript
// ❌ BAD — Level 1 placeholder
const g = this.make.graphics();
g.fillStyle(0xff0000);
g.fillRect(0, 0, 32, 32);
g.generateTexture('gem', 32, 32);

// ✅ GOOD — Level 3 polished
const g = this.make.graphics();
const size = 32;

// Layer 1: Base with gradient-like fill (darker at bottom)
g.fillStyle(0xcc2244);
g.fillTriangle(size/2, 2, 4, size*0.4, size-4, size*0.4); // top facet
g.fillStyle(0xaa1133);
g.fillTriangle(4, size*0.4, size-4, size*0.4, size/2, size-2); // bottom facet

// Layer 2: Shadow (darker edge)
g.fillStyle(0x660022, 0.4);
g.fillTriangle(size*0.6, size*0.4, size-4, size*0.4, size/2, size-2);

// Layer 3: Highlight (bright specular)
g.fillStyle(0xffffff, 0.5);
g.fillTriangle(size/2, 4, size*0.35, size*0.35, size*0.55, size*0.25);

// Layer 4: Center glow
g.fillStyle(0xff88aa, 0.6);
g.fillCircle(size/2, size*0.38, 3);

g.generateTexture('gem', size, size);
```

### Asset Naming Convention

Consistent naming reduces confusion and enables automation:

```
tx_[category]_[name]_[variant]

Categories:
  player    — player character sprites
  enemy     — enemy/obstacle sprites
  item      — collectibles, power-ups
  tile      — environment/level tiles
  ui        — buttons, icons, frames
  bg        — background elements
  fx        — VFX textures (particles, trails)

Examples:
  tx_player_idle
  tx_enemy_slime_red
  tx_item_gem_blue
  tx_tile_ground_grass
  tx_ui_btn_primary
  tx_fx_particle_circle
```

### Color Palette Rules

Random or "pure" colors (0xff0000, 0x00ff00, 0x0000ff) look amateurish because they're oversaturated and clash with each other. Use curated palettes:

| Context | Good Palette Example | Why |
|---------|---------------------|-----|
| Dark/Space | `#0a0e27, #141834, #1a1040, #00d4ff, #ff6b6b` | Low-key base with vibrant accents |
| Fantasy | `#2d1b4e, #5c3d8f, #ff9f43, #ffd93d, #51cf66` | Rich purples with warm gold highlights |
| Arcade | `#0f1923, #1e3a5f, #00ccff, #ff4466, #ffcc22` | Deep blue base with pop colors |
| Nature | `#1a2f1a, #2d5a2d, #7bc67b, #a8d8a8, #f0f7da` | Earthy greens, natural feel |

**Rule of thumb:** Pick 1-2 background colors (dark, desaturated), 1 primary accent, 1 secondary accent, 1 highlight color.

### generateTexture Performance Guidelines

Procedural generation is **preload-time cost, zero-runtime cost** because the texture lives in GPU memory after generation. This makes it ideal for web games, but there are pitfalls:

- Generate textures in `preload()` or `create()`, never in `update()`
- Keep texture dimensions power-of-2 when possible (32, 64, 128) for GPU optimization
- Limit total generated textures to < 100 per scene to avoid VRAM pressure on mobile
- Reuse textures — don't generate the same sprite multiple times
- Destroy the temporary `Graphics` object after `generateTexture()` — it won't be collected otherwise

---

## Part 2 — VFX Quality Standards

### The VFX Hierarchy

Every game needs VFX at three tiers. Missing any tier makes the game feel incomplete:

| Tier | Purpose | Examples | When |
|------|---------|---------|------|
| **T1 — Feedback** | Direct response to player action | Hit particles, score popups, button press | Every interaction |
| **T2 — Atmosphere** | Ambient life and mood | Floating particles, gradient backgrounds, grid patterns | Always running |
| **T3 — Celebration** | Reward and milestone moments | Confetti, screen flash, combo text, level-up burst | On achievement |

### Required VFX Per Game Type

| Game Type | Minimum VFX Set |
|-----------|----------------|
| **Puzzle** | Match particles, combo flash, board clear confetti, score popup, ambient bg particles |
| **Platformer** | Jump dust, land squash, death explosion, collectible sparkle, damage flash |
| **Shooter** | Muzzle flash, hit impact, explosion (multi-ring), trail effect, screen shake |
| **Card** | Card flip glow, damage numbers, heal particles, turn flash, victory confetti |
| **Idle/Merge** | Merge burst, upgrade glow ring, milestone confetti, currency popup, ambient sparkle |

### Shared VFX Library Reference

All games should use `@shared/lib/vfx-helpers.js` which provides these production-ready effects:

| Effect | Method | Use For |
|--------|--------|---------|
| Camera shake | `VFX.screenShake(scene, intensity, duration)` | Impacts, explosions |
| Particle burst | `VFX.particleBurst(scene, x, y, color, count)` | Destruction, collection |
| Explosion | `VFX.explosion(scene, x, y, opts)` | Multi-ring death/destruction |
| Floating text | `VFX.floatingText(scene, x, y, text, style)` | Score, damage numbers |
| Screen flash | `VFX.flashScreen(scene, color, duration, alpha)` | Hit feedback, transitions |
| Vignette | `VFX.vignetteFlash(scene, duration, intensity)` | Damage taken, dramatic moments |
| Pulse scale | `VFX.pulseScale(scene, obj, scale, duration)` | UI emphasis, heartbeat |
| Glow ring | `VFX.glowRing(scene, x, y, radius, color)` | Power-up, selection |
| Sparkle trail | `VFX.sparkleTrail(scene, x, y, count, color)` | Collectible attraction |
| Trail effect | `VFX.trailEffect(scene, gameObject, color)` | Projectiles, dashes |
| Confetti | `VFX.confetti(scene, x, y, opts)` | Level complete, victory |
| Ripple | `VFX.ripple(scene, x, y, opts)` | Water, ability activation |
| Score pop | `VFX.scorePop(scene, x, y, points, color)` | Scoring events |
| Hit stop | `VFX.hitStop(scene, durationMs)` | Impact emphasis (frame freeze) |
| Slow motion | `VFX.slowMotion(scene, factor, duration)` | Dramatic kills, finishers |
| Squash/stretch | `VFX.squashStretch(scene, obj, opts)` | Landing, bouncing |
| Ambient particles | `VFX.ambientParticles(scene, opts)` | Background atmosphere |
| Grid background | `VFX.gridBackground(scene, opts)` | Tech/arcade aesthetic |
| Combo flash | `VFX.comboFlash(scene, count)` | Combo system feedback |
| Wipe transition | `VFX.wipeTransition(scene, onMid, duration)` | Scene transitions |

### VFX Performance Budget

Web games run in the browser — performance matters more than native because you're sharing resources with the OS, browser tabs, and extensions:

| Metric | Budget (Desktop) | Budget (Mobile) | Why |
|--------|-----------------|-----------------|-----|
| Concurrent particles | < 200 | < 80 | Each is a Phaser game object with tweens |
| Active tweens | < 50 | < 25 | Tweens run every frame in `update()` |
| Screen shakes per second | ≤ 2 | ≤ 1 | Overlapping shakes feel broken |
| Flash overlays | 1 at a time | 1 at a time | Multiple overlaps = white screen |
| Particle lifespan | 200-800ms | 150-500ms | Long-lived particles accumulate |
| Depth sorting calls | Minimize | Minimize | `setDepth()` triggers re-sort |

**Cleanup rule:** Every visual effect MUST self-destruct. Use `onComplete: () => obj.destroy()` in tweens. A particle system that doesn't clean up will eventually crash the browser tab.

### VFX Depth Layering

Consistent depth values prevent visual glitches where effects appear behind game objects:

```
Depth Map:
  -100    Background grid / gradient
  -50     Ambient particles
  0-100   Game world objects (tiles, environment)
  100-500 Entities (player, enemies, NPCs)
  500-1K  Entity effects (trails, auras)
  1K-5K   Projectiles
  5K-7K   Glow rings, ripples
  7K-8K   Sparkles, particle bursts
  8K-9K   Floating text, score popups
  9K-9.5K Combo text, toast notifications
  9.5K    Screen flash, vignette
  10K     Scene transition wipe
```

---

## Part 3 — Background & Scene Design

### Background Quality Standards

Flat solid-color backgrounds are the #1 indicator of a prototype. Every scene needs layered backgrounds:

| Layer | What | Implementation |
|-------|------|---------------|
| Base | Gradient (2+ colors) | `UI.createGradientBg(scene, topColor, bottomColor)` |
| Atmosphere | Floating particles | `VFX.ambientParticles(scene, { count: 30-50 })` |
| Pattern (optional) | Grid, dots, or scan lines | `VFX.gridBackground(scene)` or `UI.createDotBackground(scene)` |

### Menu Screen Checklist

| Element | Required | Standard |
|---------|----------|----------|
| Gradient background | ✅ | 2-color gradient, no flat color |
| Ambient particles | ✅ | 20-40 floating dots |
| Game title | ✅ | Large, custom font (Outfit), with glow or shadow |
| Play button | ✅ | Hover scale (1.04x), press scale (0.96x), highlight shine |
| Best score | ✅ | Muted color, positioned near title |
| Scene transition | ✅ | Fade or wipe into gameplay |
| Sound toggle | ✅ | Top-right corner, uses AudioManager |

### Game Over Screen Checklist

| Element | Required | Standard |
|---------|----------|----------|
| Overlay | ✅ | Dark semi-transparent (0.7 alpha) |
| Panel | ✅ | Glassmorphism card with border |
| Final score | ✅ | Large, animated count-up |
| Star rating | ✅ | 1-3 stars with staggered appear animation |
| Stats summary | ✅ | Time, accuracy, combos, etc. |
| Retry button | ✅ | Primary style, prominent |
| Menu button | ✅ | Secondary/outline style |
| Confetti (on 3 stars) | ✅ | `VFX.confetti()` celebration |

---

## Part 4 — UI Component Standards

### Typography

Browser default fonts (Times New Roman, Arial) immediately signal "not a real game." Always specify custom fonts:

```javascript
// In index.html <head>:
// <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap" rel="stylesheet">

// In code:
const FONT = '"Outfit", "Segoe UI", system-ui, sans-serif';
```

### Button Quality Standard

Every interactive button needs these properties because static buttons feel dead:

| Property | Value | Why |
|----------|-------|-----|
| Hover scale | 1.04x | Signals interactivity |
| Press scale | 0.96x | Confirms click registration |
| Highlight shine | White 15% overlay on top half | Adds depth, prevents flat look |
| Border radius | 8-16px | Sharp corners feel aggressive |
| Hand cursor | `useHandCursor: true` | Standard UX convention |
| SFX | "click" sound on press | Audio feedback reinforces action |

### Loading / Boot Screen Standard

First impressions matter — a loading screen sets the quality expectation:

| Element | Standard |
|---------|----------|
| Background | Match game gradient theme |
| Logo/Title | Centered, starts at 80% scale, tweens to 100% |
| Progress bar | `UI.createProgressBar()` with actual load progress |
| Transition out | Fade to black over 300ms on load complete |
| Minimum display | 1.5s minimum even if assets load faster |

---

## Part 5 — Visual Feedback Specification Template

Every game must include a Visual Feedback Table in its GDD. This table maps **every player action** to its visual and audio response:

```markdown
## Visual Feedback Table

| Player Action | Visual Effect | Sound | Screen Effect | Priority |
|---------------|--------------|-------|---------------|----------|
| [action name] | [VFX method + params] | [sfx key] | [shake/flash/none] | P0/P1/P2 |
```

**Priority guide:**
- **P0 — Required:** Without this, the action feels broken (hit feedback, basic destruction)
- **P1 — Expected:** Players notice if missing (combo indicators, score popups)
- **P2 — Polish:** Elevates from good to great (ambient particles, subtle pulses)

---

## Common Mistakes

| # | Mistake | Why It Fails | What to Do Instead |
|---|---------|-------------|-------------------|
| 1 | Plain rectangles as sprites | Looks like a 2005 Flash prototype | Use 4+ layer procedural sprites with gradient, highlight, shadow, detail |
| 2 | Using emoji as game objects | Renders differently per OS, looks amateur | Generate proper circle/polygon textures with `generateTexture()` |
| 3 | Flat solid backgrounds | Screams "placeholder" | Gradient base + ambient particles + optional grid/dot pattern |
| 4 | No feedback on player actions | Game feels "floaty" and unresponsive | Every action gets VFX (particle, text, shake) + SFX |
| 5 | System fonts (Arial/Times) | Looks like a web form, not a game | Use Outfit or similar from Google Fonts |
| 6 | Particles that never die | Memory leak → browser crash | Every tween/particle must have `onComplete: () => obj.destroy()` |
| 7 | Pure RGB colors (0xff0000) | Oversaturated, clashing, amateur | Use curated palettes with desaturated bases + vibrant accents |
| 8 | Same depth for everything | VFX hidden behind game objects | Follow the depth map: bg < entities < effects < UI < overlays |
| 9 | No scene transitions | Jarring jump between scenes | Use `VFX.wipeTransition()` or camera fade |
| 10 | Buttons with no hover/press | Dead-feeling UI | Hover scale 1.04x, press 0.96x, highlight shine, click SFX |
| 11 | Generating textures in update() | Creates new GPU textures every frame → OOM | Generate all textures in preload/create, store in texture cache |
| 12 | Ignoring mobile performance | Desktop works, mobile crashes | Respect particle/tween budgets, use shorter lifespans |

---

## Quality Audit Checklist

Score each item 0 (missing) or 1 (present). **Minimum passing score: 12/16.**

| # | Check | Score |
|---|-------|-------|
| 1 | Sprites use 4+ visual layers (no flat rectangles) | 0-1 |
| 2 | Color palette is curated (no pure RGB) | 0-1 |
| 3 | Background has gradient + ambient particles | 0-1 |
| 4 | Custom font loaded (not system default) | 0-1 |
| 5 | Buttons have hover/press feedback | 0-1 |
| 6 | Boot/loading screen with progress bar | 0-1 |
| 7 | Scene transitions (fade/wipe) | 0-1 |
| 8 | Every player action has VFX + SFX response | 0-1 |
| 9 | Particle effects self-destruct (no leaks) | 0-1 |
| 10 | Score/damage floating text on relevant events | 0-1 |
| 11 | Screen shake on impacts/explosions | 0-1 |
| 12 | Combo/streak visual indicator | 0-1 |
| 13 | Game Over screen with stats + star rating | 0-1 |
| 14 | Celebration VFX on achievements (confetti, flash) | 0-1 |
| 15 | Depth layering follows standard depth map | 0-1 |
| 16 | Performance budgets respected (< 200 particles, < 50 tweens) | 0-1 |

**Grade:**
- 14-16: A — Premium quality, ship-ready
- 12-13: B — Good, minor polish needed
- 9-11: C — Needs improvement, specific items missing
- 0-8: D — Major visual rework needed

## Handoff Protocol

| To | Provide | Format |
|----|---------|--------|
| Game Designer | Feedback on VFX feasibility, performance constraints | Inline in feedback spec |
| Engine Engineer | Asset naming convention, texture generation code, VFX trigger events | Code snippets + depth map |
| Level Designer | Background theme per level, ambient effect density | Per-level visual config |
| Game Audio Engineer | VFX timing sync points for SFX triggers | Delay values per effect |
| QA Engineer | Performance budgets, visual regression checklist | Audit checklist above |

## Execution Checklist

- [ ] All sprites at Level 3+ quality (4-layer minimum)
- [ ] Curated color palette defined and consistent across scenes
- [ ] Gradient backgrounds + ambient particles in every scene
- [ ] Custom font (Outfit) loaded and used throughout
- [ ] Boot/loading screen with animated progress
- [ ] All buttons have hover/press micro-animations
- [ ] Scene transitions (wipe or fade) between all scenes
- [ ] Visual Feedback Table complete for all player actions
- [ ] Shared VFX library (`vfx-helpers.js`) integrated
- [ ] All particle effects self-destruct
- [ ] Depth layering follows standard depth map
- [ ] Performance within budget (particles, tweens)
- [ ] Menu screen meets checklist (gradient, title, button, score)
- [ ] Game Over screen meets checklist (overlay, panel, stats, stars)
- [ ] Sound toggle present via AudioManager
- [ ] Quality audit score ≥ 12/16
