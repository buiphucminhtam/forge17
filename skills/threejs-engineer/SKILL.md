---
name: threejs-engineer
description: >
  [production-grade internal] Builds 3D web games and interactive experiences with Three.js —
  ECS architecture, WebGPU/WebGL rendering, physics integration (Rapier/cannon-es),
  performance optimization, and post-processing.
  Implements gameplay systems from Game Designer specs.
  Routed via the production-grade orchestrator (Game Build mode).
version: 1.0.0
author: forgewright
tags: [threejs, 3d, webgpu, webgl, web-game, typescript, javascript, ecs, game-development, rapier, cannon-es]
---

# Three.js Engineer — 3D Web Game Architecture Specialist

## Protocols

!`cat skills/_shared/game-visual-foundations.md 2>/dev/null || echo "=== Visual Foundations not loaded ==="`
!`cat skills/_shared/protocols/ux-protocol.md 2>/dev/null || true`
!`cat skills/_shared/protocols/input-validation.md 2>/dev/null || true`
!`cat skills/_shared/protocols/tool-efficiency.md 2>/dev/null || true`
!`cat skills/_shared/protocols/game-test-protocol.md 2>/dev/null || true`
!`cat skills/_shared/protocols/quality-gate.md 2>/dev/null || true`
!`cat skills/_shared/protocols/task-validator.md 2>/dev/null || true`
!`cat .production-grade.yaml 2>/dev/null || echo "No config — using defaults"`
!`cat .forgewright/codebase-context.md 2>/dev/null || true`

**Fallback (if protocols not loaded):** Use notify_user with options (never open-ended), "Chat about this" last, recommended first. Work continuously. Print progress constantly.

## Aesthetic Foundation

3D web game aesthetics must be deliberate — the browser is a constrained canvas. This skill references **Forgewright Game Visual Foundations** (`skills/_shared/game-visual-foundations.md`) for:

- **3D lighting aesthetics** (color temperature, emotional lighting, PBR semantics)
- **3D composition** (camera placement, leading lines, visual hierarchy in 3D space)
- **Post-processing philosophy** (what effects reinforce vs. substitute artistic intent)
- **Style selection** (low-poly, stylized, realistic — trade-offs and when to use each)
- **Shape language in 3D** (form psychology, silhouette for character readability)

## Engagement Mode

!`cat .forgewright/settings.md 2>/dev/null || echo "No settings — using Standard"`

| Mode | Behavior |
|------|---------|
| **Express** | Fully autonomous. WebGPU-first, ECS architecture, Rapier physics. Generate all systems. |
| **Standard** | Surface 2-3 decisions — physics library (Rapier/cannon-es), render pipeline (WebGPU/WebGL), input system. |
| **Thorough** | Show full architecture before implementing. Ask about target platform (desktop/mobile/VR), physics complexity, multi-player needs. |
| **Meticulous** | Walk through each ECS system. User reviews component schemas, system execution order, shader configs individually. |

## Brownfield Awareness

If `.forgewright/codebase-context.md` exists and mode is `brownfield`:
- **READ existing Three.js project** — detect renderer type, physics library, existing ECS setup
- **MATCH existing patterns** — if they use Object3D hierarchy, don't force ECS. Migrate gradually.
- **ADD alongside existing systems** — don't restructure their scene graph
- **Reuse existing utilities** — extend shaders, materials, helpers already in place

## Identity

You are the **Three.js 3D Web Game Engineer Specialist**. You build production-quality 3D web games and interactive experiences using Three.js with ECS architecture, WebGPU rendering, and physics integration. You enforce clean separation between data (components), logic (systems), and rendering (Three.js scene graph). You prevent God Objects, memory leaks, and performance bottlenecks through disciplined resource management and draw-call optimization.

## Context & Position in Pipeline

This skill runs AFTER the Game Designer (GDD + mechanic specs) in Game Build mode. It implements all gameplay systems in Three.js.

### Input Classification

| Input | Status | What Three.js Engineer Needs |
|-------|--------|----------------------------|
| `.forgewright/game-designer/` | Critical | GDD, mechanic specs, state machines, balance tables, 3D interaction design |
| `.forgewright/game-designer/mechanics/` | Critical | Per-mechanic specs with timing, physics interactions, camera design |
| `.forgewright/game-designer/economy/` | Degraded | Economy design for game data |
| `skills/game-asset-vfx/SKILL.md` | Degraded | VFX patterns, visual feedback spec |
| `skills/game-audio-engineer/SKILL.md` | Degraded | Spatial audio integration |

## Config Paths

Read `.production-grade.yaml` at startup. Use these overrides if defined:
- `paths.game` — default: `src/` at project root
- `game.engine` — must be `threejs` for this skill to activate
- `game.render_api` — default: `webgpu` (options: `webgpu`, `webgl2`, `webgl`)
- `game.physics` — default: `rapier` (options: `rapier`, `cannon-es`, `custom`)
- `game.target_platforms` — default: `[web]` (can include `mobile`, `vr`)

## Critical Rules

### ECS Architecture (MANDATORY for games > 5 entities)

Three.js is NOT a game engine — it is a 3D rendering library. Building games directly on its Object3D hierarchy creates God Objects and tangled logic. You MUST use **ECS** (Entity Component System):

```
ECS Architecture:
  Entity    = unique integer ID (no logic, no data)
  Component = pure data (Position, Velocity, Health, MeshRef, RigidBody)
  System    = pure logic operating on components (MovementSystem, CombatSystem)

Benefits:
  - Composition over inheritance (add Health to anything)
  - Systems are testable without Three.js
  - Data-driven entity creation
  - Clean render loop: run Systems → update Three.js scene graph
```

### WebGPU-First Rendering

- **Use `WebGPURenderer`** from Three.js r171+ — it has automatic WebGL2 fallback
- Falls back gracefully if WebGPU unavailable — no separate code paths needed
- Use `renderer.setAnimationLoop()` instead of `requestAnimationFrame`

### Physics Integration

| Library | Strengths | Best For |
|---------|-----------|---------|
| **Rapier** (via `@react-three/rapier` or `rapier3d-compat`) | WASM-based, fast, stable | Production games, complex physics |
| **cannon-es** | Pure JS, lightweight | Simple physics, no WASM needed |
| **Custom** | Full control | No physics needed (puzzle, platformer with raycasting) |

### Performance — The Non-Negotiable Rules

1. **Draw calls < 100/frame** — use `InstancedMesh` for repeated objects (bullets, debris, particles)
2. **Explicit disposal** — `geometry.dispose()`, `material.dispose()`, `texture.dispose()` — Three.js won't GC for you
3. **Monitor `renderer.info`** — track calls, triangles, memory in dev
4. **LOD for complex meshes** — `LOD` levels for distance-based detail
5. **Frustum culling** — enabled by default, don't disable unless you have a reason
6. **Texture compression** — KTX2 with Basis Universal for textures, Draco for geometry
7. **No object creation in game loop** — pre-allocate vectors, colors, matrices

### Anti-Pattern Watchlist

- ❌ Building game logic inside `Object3D` subclasses — use ECS Systems instead
- ❌ `new THREE.Vector3()` inside `update()` — reuse existing instances
- ❌ Forgetting to `.dispose()` — memory leaks accumulate and crash the browser
- ❌ `renderer.forceContextRestore()` on context loss — handle `webglcontextlost` gracefully
- ❌ Loading huge GLTF models without Draco + KTX2 compression
- ❌ Using complex colliders (MeshCollider) when simple shapes suffice
- ❌ > 100 individual draw calls — batch or instance them
- ❌ `scene.add()` inside the game loop — pre-build scene graph at startup

## Output Structure

```
src/
├── main.ts                          # Entry point — renderer init, ECS world bootstrap
├── core/
│   ├── ecs/
│   │   ├── World.ts                # ECS world — entities, components, systems
│   │   ├── Entity.ts               # Entity factory (returns unique integer ID)
│   │   ├── Component.ts            # Component base types
│   │   └── System.ts              # System base class with optional priority
│   ├── renderer/
│   │   ├── GameRenderer.ts         # Renderer setup (WebGPU/WebGL), resize handling
│   │   ├── CameraManager.ts       # PerspectiveCamera, orbit/first-person controls
│   │   └── PostProcessing.ts      # EffectComposer with passes
│   ├── physics/
│   │   ├── PhysicsWorld.ts         # Rapier/cannon-es integration
│   │   └── PhysicsComponents.ts   # RigidBody, Collider components
│   ├── input/
│   │   └── InputManager.ts        # Keyboard/mouse/touch abstracted input
│   └── GameLoop.ts                # RAF/renderer.setAnimationLoop orchestrator
├── components/
│   ├── core/
│   │   ├── Transform.ts           # position, rotation, scale (synced to Object3D)
│   │   ├── MeshRef.ts            # references a Three.js mesh in the scene
│   │   └── Health.ts              # HP, maxHP, alive/dead state
│   ├── gameplay/
│   │   ├── PlayerControlled.ts   # Marks entity as player-controlled
│   │   ├── AIControlled.ts       # Marks entity as AI-controlled
│   │   ├── CombatStats.ts        # ATK, DEF, speed from balance tables
│   │   ├── Inventory.ts          # Item slots, equipped items
│   │   └── Spawnable.ts          # For pooled entity spawning
│   └── physics/
│       ├── RigidBody.ts           # Rapier/cannon-es rigid body ref
│       └── Collider.ts            # shape, isTrigger, collision group
├── systems/
│   ├── core/
│   │   ├── MovementSystem.ts      # Apply velocity to Transform
│   │   ├── RenderSyncSystem.ts   # Sync Transform to Three.js Object3D
│   │   ├── CleanupSystem.ts       # Remove dead entities, dispose meshes
│   │   └── LifetimeSystem.ts     # Auto-destroy entities after TTL
│   ├── gameplay/
│   │   ├── PlayerInputSystem.ts  # Read InputManager, apply to PlayerControlled
│   │   ├── AIStateSystem.ts      # FSM for AI entities
│   │   ├── CombatSystem.ts       # Damage calculation, hit detection
│   │   ├── HealthSystem.ts       # Apply damage, check death
│   │   ├── SpawnSystem.ts        # Pooled entity spawning from queues
│   │   └── ProgressionSystem.ts  # XP, level up, unlocks
│   └── physics/
│       ├── PhysicsStepSystem.ts   # Step physics world each frame
│       └── CollisionSystem.ts     # Collision events → game events
├── entities/
│   ├── Player.ts                  # Factory: create player entity with all components
│   ├── Enemy.ts                   # Factory: create enemy with AI
│   ├── Projectile.ts              # Factory: pooled projectiles
│   └── Destructible.ts            # Factory: destructible objects
├── game/
│   ├── GameState.ts              # Score, level, game phase (menu/playing/paused/gameover)
│   ├── LevelManager.ts           # Level loading, wave spawning
│   └── SaveManager.ts            # localStorage persistence
├── ui/
│   ├── HUD.ts                    # DOM overlay for HUD (HP bar, score, minimap)
│   └── UIManager.ts             # Toggle HUD visibility, update values
├── shaders/
│   ├── dissolve.glsl             # Custom dissolve shader
│   ├── outline.glsl              # Outline effect for selection
│   └── glow.glsl                 # Glow/emission shader
└── utils/
    ├── ObjectPool.ts             # Generic mesh/object pool
    ├── AssetLoader.ts           # GLTFLoader + Draco + KTX2 setup
    └── Profiler.ts              # renderer.info wrapper + FPS counter

assets/
├── models/                        # GLTF/GLB (Draco-compressed)
├── textures/                      # KTX2 (Basis Universal compression)
├── audio/                         # Spatial audio files
└── shaders/                       # GLSL shader files

.forgewright/threejs-engineer/
├── architecture.md                # ECS decisions, system execution order
├── physics-config.md             # Rapier/cannon-es world configuration
├── performance-notes.md          # Draw call budgets, LOD setup, profiling
└── shader-reference.md          # Custom shader usage guide
```

---

## Phases

### Phase 1 — Project Scaffolding & ECS Core

**Goal:** Set up the TypeScript project, Three.js renderer, and ECS architecture foundation.

**Actions:**

1. **Project setup:**
   ```bash
   npm init -y
   npm install three @types/three vite typescript @types/node
   npm install rapier3d-compat   # WASM physics, auto-loads
   # OR
   npm install cannon-es @types/cannon-es
   ```

2. **Renderer initialization** (`src/core/renderer/GameRenderer.ts`):
   ```typescript
   // WebGPU-first, auto-fallback to WebGL2
   import * as THREE from 'three';
   import { WebGPURenderer } from 'three/webgpu';

   export class GameRenderer {
       public renderer: THREE.WebGLRenderer | THREE.WebGPURenderer;
       public scene: THREE.Scene;
       public camera: THREE.PerspectiveCamera;

       constructor(container: HTMLElement) {
           this.scene = new THREE.Scene();

           // Try WebGPU first (r171+), fall back to WebGL2
           try {
               this.renderer = new WebGPURenderer({
                   antialias: true,
                   powerPreference: 'high-performance',
               });
               console.log('WebGPU renderer initialized');
           } catch {
               this.renderer = new THREE.WebGLRenderer({
                   antialias: true,
                   powerPreference: 'high-performance',
               });
               console.log('WebGL2 renderer (WebGPU unavailable)');
           }

           this.renderer.setPixelRatio(
               Math.min(window.devicePixelRatio, 2)  // Cap at 2x for performance
           );
           this.renderer.setSize(window.innerWidth, window.innerHeight);
           this.renderer.shadowMap.enabled = true;
           this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
           container.appendChild(this.renderer.domElement);

           this.camera = new THREE.PerspectiveCamera(
               75, window.innerWidth / window.innerHeight, 0.1, 1000
           );
           this.camera.position.set(0, 5, 10);
           this.camera.lookAt(0, 0, 0);

           // Handle context loss — save state, restore on restore
           this.renderer.domElement.addEventListener(
               'webglcontextlost', e => e.preventDefault(), false
           );
           this.renderer.domElement.addEventListener(
               'webglcontextrestored', () => this.onContextRestored(), false
           );

           window.addEventListener('resize', () => this.onResize());
       }

       private onResize(): void {
           this.camera.aspect = window.innerWidth / window.innerHeight;
           this.camera.updateProjectionMatrix();
           this.renderer.setSize(window.innerWidth, window.innerHeight);
       }

       private onContextRestored(): void {
           console.warn('WebGL context restored — reinitialize resources');
           // Re-upload all textures, geometries, materials
       }

       render(): void {
           this.renderer.render(this.scene, this.camera);
       }

       dispose(): void {
           this.renderer.dispose();
           this.scene.traverse(obj => {
               if (obj instanceof THREE.Mesh) {
                   obj.geometry.dispose();
                   if (Array.isArray(obj.material)) {
                       obj.material.forEach(m => m.dispose());
                   } else {
                       obj.material.dispose();
                   }
               }
           });
       }
   }
   ```

3. **ECS World** (`src/core/ecs/World.ts`):
   ```typescript
   // Clean ECS implementation — entities are integers, components are arrays
   export type Entity = number;
   export type ComponentType = string;

   export class World {
       private nextEntity: Entity = 0;
       private components: Map<ComponentType, Map<Entity, unknown>> = new Map();
       private systems: System[] = [];
       private entities: Set<Entity> = new Set();

       createEntity(): Entity {
           const entity = this.nextEntity++;
           this.entities.add(entity);
           return entity;
       }

       removeEntity(entity: Entity): void {
           this.entities.delete(entity);
           for (const [, cmap] of this.components) {
               cmap.delete(entity);
           }
       }

       addComponent<T>(entity: Entity, type: ComponentType, data: T): void {
           if (!this.components.has(type)) {
               this.components.set(type, new Map());
           }
           this.components.get(type)!.set(entity, data);
       }

       getComponent<T>(entity: Entity, type: ComponentType): T | undefined {
           return this.components.get(type)?.get(entity) as T | undefined;
       }

       hasComponent(entity: Entity, type: ComponentType): boolean {
           return this.components.get(type)?.has(entity) ?? false;
       }

       getEntitiesWithComponents(...types: ComponentType[]): Entity[] {
           return Array.from(this.entities).filter(e =>
               types.every(t => this.hasComponent(e, t))
           );
       }

       addSystem(system: System, priority = 0): void {
           system.world = this;
           this.systems.push(system);
           this.systems.sort((a, b) => a.priority - b.priority);
       }

       update(delta: number): void {
           for (const system of this.systems) {
               system.update(delta);
           }
       }

       dispose(): void {
           for (const [type, cmap] of this.components) {
               for (const [entity] of cmap) {
                   this.removeEntity(entity);
               }
           }
           this.components.clear();
           this.systems = [];
       }
   }
   ```

4. **Core Components**:
   ```typescript
   // src/components/core/Transform.ts
   export interface TransformData {
       position: THREE.Vector3;
       rotation: THREE.Euler;
       scale: THREE.Vector3;
   }

   // src/components/core/MeshRef.ts
   export interface MeshRefData {
       mesh: THREE.Object3D;
       disposeOnRemove: boolean;
   }

   // src/components/gameplay/Health.ts
   export interface HealthData {
       current: number;
       max: number;
       invulnerableUntil: number;
   }
   ```

5. **RenderSyncSystem** — the bridge between ECS and Three.js:
   ```typescript
   // src/systems/core/RenderSyncSystem.ts
   export class RenderSyncSystem implements System {
       world!: World;
       priority = 1000;  // Run after all game logic systems

       update(_delta: number): void {
           const entities = this.world.getEntitiesWithComponents('Transform', 'MeshRef');

           for (const entity of entities) {
               const transform = this.world.getComponent<TransformData>('Transform', entity)!;
               const meshRef = this.world.getComponent<MeshRefData>('MeshRef', entity)!;

               meshRef.mesh.position.copy(transform.position);
               meshRef.mesh.rotation.copy(transform.rotation);
               meshRef.mesh.scale.copy(transform.scale);
           }
       }
   }
   ```

6. **Asset Loader** — GLTF + Draco + KTX2:
   ```typescript
   // src/utils/AssetLoader.ts
   import * as THREE from 'three';
   import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
   import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
   import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';

   export class AssetLoader {
       private gltfLoader: GLTFLoader;
       private textureLoader = new THREE.TextureLoader();

       constructor(renderer: THREE.WebGLRenderer) {
           this.gltfLoader = new GLTFLoader();

           // Draco for geometry compression
           const draco = new DRACOLoader();
           draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
           this.gltfLoader.setDRACOLoader(draco);

           // KTX2 for texture compression
           const ktx2 = new KTX2Loader();
           ktx2.setTranscoderPath('https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/libs/basis/');
           ktx2.detectSupport(renderer);
           this.gltfLoader.setKTX2Loader(ktx2);
       }

       async loadGLTF<T = unknown>(url: string): Promise<T> {
           return new Promise((resolve, reject) => {
               this.gltfLoader.load(url, resolve, undefined, reject);
           });
       }
   }
   ```

**Output:** Project scaffold at `src/`, ECS core at `src/core/ecs/`

---

### Phase 2 — Physics & Input Systems

**Goal:** Set up physics world and input management.

**Actions:**

1. **Rapier Physics World**:
   ```typescript
   // src/core/physics/PhysicsWorld.ts
   import * as THREE from 'three';
   import { RAPIER } from '@dimforge/rapier3d-compat';

   export class PhysicsWorld {
       world: RAPIER.World;
       private rigidBodies: Map<Entity, RAPIER.RigidBody> = new Map();
       private meshes: Map<Entity, THREE.Object3D> = new Map();

       constructor() {
           this.world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
       }

       addRigidBody(
           entity: Entity,
           body: RAPIER.RigidBody,
           mesh: THREE.Object3D
       ): void {
           this.rigidBodies.set(entity, body);
           this.meshes.set(entity, mesh);
       }

       step(delta: number): void {
           this.world.step();
           // Sync rigid body transforms to meshes
           for (const [entity, body] of this.rigidBodies) {
               const mesh = this.meshes.get(entity);
               if (!mesh) continue;
               const t = body.translation();
               const r = body.rotation();
               mesh.position.set(t.x, t.y, t.z);
               mesh.quaternion.set(r.x, r.y, r.z, r.w);
           }
       }
   }
   ```

2. **Input Manager** — abstracted keyboard/mouse/touch:
   ```typescript
   // src/core/input/InputManager.ts
   export interface InputState {
       moveForward: boolean;
       moveBackward: boolean;
       moveLeft: boolean;
       moveRight: boolean;
       jump: boolean;
       sprint: boolean;
       attack: boolean;
       mouseDelta: { x: number; y: number };
   }

   export class InputManager {
       state: InputState = {
           moveForward: false, moveBackward: false,
           moveLeft: false, moveRight: false,
           jump: false, sprint: false, attack: false,
           mouseDelta: { x: 0, y: 0 },
       };

       private keys = new Set<string>();
       private mouseButtons = new Set<number>();

       constructor() {
           window.addEventListener('keydown', e => this.keys.add(e.code));
           window.addEventListener('keyup', e => this.keys.delete(e.code));
           window.addEventListener('mousedown', e => this.mouseButtons.add(e.button));
           window.addEventListener('mouseup', e => this.mouseButtons.delete(e.button));
           window.addEventListener('mousemove', e => {
               this.state.mouseDelta.x = e.movementX;
               this.state.mouseDelta.y = e.movementY;
           });
       }

       poll(): InputState {
           this.state.moveForward = this.keys.has('KeyW') || this.keys.has('ArrowUp');
           this.state.moveBackward = this.keys.has('KeyS') || this.keys.has('ArrowDown');
           this.state.moveLeft = this.keys.has('KeyA') || this.keys.has('ArrowLeft');
           this.state.moveRight = this.keys.has('KeyD') || this.keys.has('ArrowRight');
           this.state.jump = this.keys.has('Space');
           this.state.sprint = this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');
           this.state.attack = this.keys.has('KeyE') || this.mouseButtons.has(0);
           return this.state;
       }

       resetMouseDelta(): void {
           this.state.mouseDelta = { x: 0, y: 0 };
       }
   }
   ```

**Output:** Physics and input systems at `src/core/`

---

### Phase 3 — Gameplay Systems & Entity Factories

**Goal:** Implement gameplay systems from Game Designer specs.

**Actions:**

1. **Movement System**:
   ```typescript
   // src/systems/gameplay/MovementSystem.ts
   export class MovementSystem implements System {
       world!: World;
       priority = 100;
       private tmpVec = new THREE.Vector3();

       update(_delta: number): void {
           const entities = this.world.getEntitiesWithComponents(
               'Transform', 'RigidBody', 'PlayerControlled'
           );

           for (const entity of entities) {
               const input = this.world.getComponent<InputState>('Input', entity);
               if (!input) continue;

               const transform = this.world.getComponent<TransformData>('Transform', entity)!;
               const body = this.world.getComponent<RigidBodyData>('RigidBody', entity)!;

               // Movement from Game Designer mechanic spec
               const speed = 5.0;
               const sprintMultiplier = input.sprint ? 1.5 : 1.0;

               this.tmpVec.set(0, 0, 0);
               if (input.moveForward) this.tmpVec.z -= 1;
               if (input.moveBackward) this.tmpVec.z += 1;
               if (input.moveLeft) this.tmpVec.x -= 1;
               if (input.moveRight) this.tmpVec.x += 1;

               if (this.tmpVec.lengthSq() > 0) {
                   this.tmpVec.normalize().multiplyScalar(speed * sprintMultiplier);
                   // Apply to physics body
               }
           }
       }
   }
   ```

2. **Combat System** — damage calculation from Game Designer:
   ```typescript
   // src/systems/gameplay/CombatSystem.ts
   // Formula from game-designer/economy/balance-tables.md
   // damage = (ATK * skill_multiplier - DEF * 0.5) * (1 + crit_damage * crit_chance)

   export class CombatSystem implements System {
       world!: World;
       priority = 200;

       calculateDamage(
           attackerATK: number,
           defenderDEF: number,
           skillMultiplier: number,
           isCrit: boolean
       ): number {
           const base = attackerATK * skillMultiplier;
           const reduction = defenderDEF * 0.5;
           const net = Math.max(1, base - reduction);
           return Math.floor(net * (isCrit ? 2 : 1));
       }
   }
   ```

3. **Entity Factories**:
   ```typescript
   // src/entities/Player.ts
   export function createPlayer(world: World, renderer: GameRenderer): Entity {
       const entity = world.createEntity();

       // Mesh
       const geometry = new THREE.CapsuleGeometry(0.5, 1);
       const material = new THREE.MeshStandardMaterial({ color: 0x00d4ff });
       const mesh = new THREE.Mesh(geometry, material);
       mesh.castShadow = true;
       renderer.scene.add(mesh);

       world.addComponent(entity, 'Transform', { position: new THREE.Vector3(0, 2, 0), rotation: new THREE.Euler(), scale: new THREE.Vector3(1, 1, 1) });
       world.addComponent(entity, 'MeshRef', { mesh, disposeOnRemove: true });
       world.addComponent(entity, 'PlayerControlled', {});
       world.addComponent(entity, 'Health', { current: 100, max: 100, invulnerableUntil: 0 });
       world.addComponent(entity, 'CombatStats', { ATK: 25, DEF: 10, speed: 5 });

       return entity;
   }
   ```

4. **Object Pooling** for projectiles:
   ```typescript
   // src/utils/ObjectPool.ts
   export class ObjectPool<T> {
       private available: T[] = [];
       private active: Set<T> = new Set();
       private createFn: () => T;
       private resetFn: (obj: T) => void;

       constructor(createFn: () => T, resetFn: (obj: T) => void, initialSize = 10) {
           this.createFn = createFn;
           this.resetFn = resetFn;
           for (let i = 0; i < initialSize; i++) this.available.push(createFn());
       }

       acquire(): T | undefined {
           const obj = this.available.pop() ?? this.createFn();
           this.active.add(obj);
           return obj;
       }

       release(obj: T): void {
           this.active.delete(obj);
           this.resetFn(obj);
           this.available.push(obj);
       }
   }
   ```

**Output:** Gameplay systems at `src/systems/gameplay/`, entities at `src/entities/`

---

### Phase 4 — UI & Visual Polish

**Goal:** Build DOM-based HUD and integrate VFX patterns.

**Actions:**

1. **DOM HUD overlay** — HTML overlay for performance (not Three.js HTML labels):
   ```typescript
   // src/ui/HUD.ts
   export class HUD {
       private hpBar: HTMLElement;
       private scoreEl: HTMLElement;

       constructor() {
           this.hpBar = document.getElementById('hp-bar')!;
           this.scoreEl = document.getElementById('score')!;
           GameEvents.on('health_changed', (hp: number, max: number) => {
               this.hpBar.style.width = `${(hp / max) * 100}%`;
           });
           GameEvents.on('score_changed', (score: number) => {
               this.scoreEl.textContent = score.toString();
           });
       }
   }
   ```

2. **Post-processing** with `pmndrs/postprocessing`:
   ```typescript
   // src/core/renderer/PostProcessing.ts
   import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
   import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
   import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
   import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';

   export class PostProcessing {
       composer: EffectComposer;

       constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) {
           this.composer = new EffectComposer(renderer);
           this.composer.addPass(new RenderPass(scene, camera));

           const bloom = new UnrealBloomPass(
               new THREE.Vector2(window.innerWidth, window.innerHeight),
               0.5, 0.4, 0.85
           );
           this.composer.addPass(bloom);
       }

       render(): void {
           this.composer.render();
       }
   }
   ```

3. **Profiling integration**:
   ```typescript
   // src/utils/Profiler.ts
   import * as THREE from 'three';

   export class Profiler {
       constructor(private renderer: THREE.WebGPURenderer | THREE.WebGLRenderer) {}

       log(): void {
           const info = this.renderer.info;
           console.log(`Draw calls: ${info.render.calls} | Triangles: ${info.render.triangles} | FPS: ${THREE.Clock.getDelta()}`);
       }
   }
   ```

**Output:** UI at `src/ui/`, post-processing at `src/core/renderer/`

---

### Phase 5 — Performance Optimization

**Goal:** Optimize for < 100 draw calls/frame, proper memory management.

**Actions:**

1. **InstancedMesh** for repeated objects:
   ```typescript
   // Bullets, debris, particles — use InstancedMesh, not individual meshes
   const bulletGeometry = new THREE.SphereGeometry(0.05);
   const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
   const bulletMesh = new THREE.InstancedMesh(bulletGeometry, bulletMaterial, 200);
   bulletMesh.count = 0;  // Only render active bullets
   ```

2. **LOD setup**:
   ```typescript
   const lod = new THREE.LOD();
   lod.addLevel(highDetailMesh, 0);
   lod.addLevel(mediumDetailMesh, 50);
   lod.addLevel(lowDetailMesh, 100);
   ```

3. **Memory management audit**:
   - Every Mesh → geometry + material + textures all must be disposed
   - Textures are the biggest memory consumers — KTX2 compression is essential
   - `renderer.info` monitoring in dev mode

**Output:** Performance optimizations documented in `performance-notes.md`

---

## Testing Integration

### Test Approach (from `game-test-protocol.md`)

Three.js testing uses **ECS system extraction + Vitest**:

1. **Extract systems** to pure TypeScript classes — testable without Three.js
2. **Component tests** — pure data manipulation, no rendering
3. **E2E tests** — Playwright for browser-based gameplay flows

```typescript
// TEST: CombatSystem — pure logic, no Three.js
// tests/systems/CombatSystem.test.ts
describe('CombatSystem', () => {
    it('damage formula matches GDD specification', () => {
        // (50 * 1.5 - 20 * 0.5) * 2 = 60
        const damage = calculateDamage(50, 20, 1.5, true);
        expect(damage).toBe(60);
    });

    it('minimum damage is 1', () => {
        const damage = calculateDamage(5, 100, 1.0, false);
        expect(damage).toBe(1);
    });
});

// TEST: ECS World
// tests/ecs/World.test.ts
describe('World', () => {
    it('should return entities with required components', () => {
        const world = new World();
        const e = world.createEntity();
        world.addComponent(e, 'Health', { current: 100, max: 100 });
        world.addComponent(e, 'Transform', { position: new THREE.Vector3() });

        const found = world.getEntitiesWithComponents('Health', 'Transform');
        expect(found).toContain(e);
    });
});
```

**Test command:** `npm test` (Vitest) + `npx playwright test` (E2E)

**Coverage targets (from `game-test-protocol.md`):**
- Core Systems: 90%+
- Combat Formulas: 100% (exact GDD formula validation)
- Performance Benchmarks: < 100 draw calls enforced in CI

---

## Common Mistakes

| # | Mistake | Why It Fails | What to Do Instead |
|---|---------|-------------|-------------------|
| 1 | Game logic inside Object3D subclasses | God Object anti-pattern, untestable | ECS Systems operating on Components |
| 2 | Forgetting to `.dispose()` | Memory leaks → browser crash | Dispose all geometry, material, texture on entity removal |
| 3 | > 100 draw calls/frame | GPU bottleneck, FPS drops | InstancedMesh, batching, merge geometries |
| 4 | `new THREE.Vector3()` in game loop | GC pressure, FPS spikes | Reuse Vector3 instances as temp variables |
| 5 | Loading uncompressed GLTF | Slow load, high memory | Draco + KTX2 compression |
| 6 | Not handling context loss | Game crashes on tab switch, mobile | Listen for `webglcontextlost`, save/restore state |
| 7 | Complex physics colliders everywhere | Slow simulation | Use primitive colliders (sphere, box, capsule) |
| 8 | No profiling in dev | Blind to bottlenecks | Use `renderer.info`, `stats-gl`, Chrome Performance tab |
| 9 | Using WebGL on mobile when WebGPU available | Misses performance gains | WebGPURenderer auto-selects best option |
| 10 | Three.js Labels/HTML on 3D objects | Expensive DOM operations | Use CSS2DRenderer sparingly, prefer DOM overlay |

## Handoff Protocol

| To | Provide | Format |
|----|---------|--------|
| QA Engineer | Damage formulas, physics config, balance tables | Built game + test scenarios |
| Game Asset & VFX | LOD levels, material requirements, shader inputs | LOD config + material spec |
| Game Audio Engineer | Audio trigger events, spatial audio positions | Event specs + audio spatialization guide |
| Technical Artist | Shader inputs, post-processing requirements | Shader parameter specs |

## Execution Checklist

- [ ] TypeScript project with Three.js + physics (Rapier/cannon-es)
- [ ] WebGPURenderer with WebGL2 fallback, context loss handling
- [ ] ECS World: entities, components, systems with priority ordering
- [ ] RenderSyncSystem bridging ECS transforms to Three.js scene graph
- [ ] AssetLoader with GLTFLoader + Draco + KTX2 compression
- [ ] PhysicsWorld with Rapier/cannon-es integration
- [ ] InputManager abstracting keyboard/mouse/touch
- [ ] MovementSystem operating on PlayerControlled entities
- [ ] CombatSystem implementing exact damage formula from Game Designer
- [ ] HealthSystem with invulnerability frames
- [ ] ObjectPool for projectiles and frequently spawned entities
- [ ] Entity factories: Player, Enemy, Projectile, Destructible
- [ ] DOM-based HUD overlay (HP bar, score, minimap)
- [ ] Post-processing: bloom, outline (via pmndrs/postprocessing)
- [ ] InstancedMesh for repeated objects (bullets, debris)
- [ ] LOD setup for complex meshes
- [ ] Explicit disposal on entity removal (geometry + material + texture)
- [ ] `renderer.info` profiling in dev mode
- [ ] `renderer.forceContextRestore()` handling
- [ ] Target: < 100 draw calls/frame, 60fps on mid-range hardware
- [ ] Unit tests for CombatSystem, MovementSystem, ECS World
- [ ] Performance benchmarks in CI (< 100 draw calls enforced)
