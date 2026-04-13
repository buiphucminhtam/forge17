# Unity Performance Profiling Guide

> **Purpose:** Comprehensive profiling guidance for Unity games built with Forgewright. Covers CPU, GPU, Memory, and platform-specific optimization.

---

## Performance Budgets

### Target Performance

| Platform | Target FPS | Draw Calls | Triangle Budget | Memory |
|----------|-----------|------------|----------------|--------|
| PC (High-end) | 144 FPS | 2,000 | 10M | 8GB |
| PC (Mid-range) | 60 FPS | 1,500 | 5M | 4GB |
| Console (PS5/Xbox) | 60 FPS | 3,000 | 15M | 16GB |
| Mobile (High) | 60 FPS | 200 | 500K | 512MB |
| Mobile (Mid) | 30 FPS | 100 | 200K | 256MB |
| WebGL | 60 FPS | 500 | 1M | 512MB |

### Per-Frame Budget (60 FPS)

| Metric | Budget | Warning Threshold |
|--------|--------|------------------|
| Frame Time | 16.67ms | 12ms (80%) |
| Main Thread | 12ms | 10ms |
| Render Thread | 4ms | 3ms |
| GPU Time | 12ms | 10ms |

---

## Unity Profiler Guide

### Profiler Windows

| Window | Purpose | Shortcut |
|--------|---------|----------|
| CPU Profiler | Main thread, rendering, physics | Ctrl+7 |
| GPU Profiler | GPU time, fillrate, overdraw | Ctrl+7 |
| Memory Profiler | RAM, VRAM, allocations | Ctrl+7 |
| Audio Profiler | Audio CPU, DSP load | Ctrl+7 |
| Physics Profiler | Colliders, joints, solver | Ctrl+7 |
| UI Profiler | Canvas rebuilds, batches | Ctrl+7 |

### Key Metrics to Watch

#### CPU Profiler

| Marker | Good | Warning | Critical |
|--------|------|---------|----------|
| PlayerLoop | <12ms | 12-14ms | >14ms |
| Scripting | <4ms | 4-6ms | >6ms |
| GarbageCollector | <1ms | 1-3ms | >3ms |
| Physics | <4ms | 4-6ms | >6ms |
| Animation | <2ms | 2-4ms | >4ms |

#### GPU Profiler

| Metric | Good | Warning | Critical |
|--------|------|---------|----------|
| Fillrate | <80% | 80-95% | >95% |
| Overdraw | <2x | 2-4x | >4x |
| Triangle Count | <Budget | 80-100% | >Budget |
| Texture Memory | <Budget | 80-100% | >Budget |

---

## Common Performance Issues

### Issue 1: GC Allocations in Update

**Symptom:** GarbageCollector spikes every few frames

**Diagnosis:**
```
1. Open CPU Profiler
2. Expand "GC.Alloc" marker
3. Find which script causes allocations
```

**Common Culprits:**
```csharp
// BAD: Creates new object every frame
void Update()
{
    var data = new MyData();  // Allocates!
    Process(data);
}

// BAD: String concatenation
void Update()
{
    string s = "";
    for (int i = 0; i < 10; i++)
        s += i.ToString();  // Allocates!
}

// GOOD: Reuse object
private MyData _cachedData;
void Update()
{
    Process(_cachedData);  // No allocation
}

// GOOD: Use StringBuilder
private StringBuilder _sb = new StringBuilder();
void Update()
{
    _sb.Clear();
    for (int i = 0; i < 10; i++)
        _sb.Append(i);  // Reuses buffer
}
```

### Issue 2: Physics Overhead

**Symptom:** Physics marker shows >4ms

**Fixes:**
- Reduce collider count (use simplified colliders)
- Disable collision on distant objects
- Use LOD for colliders
- Avoid mesh colliders on moving objects
- Use rigidbody interpolation

```csharp
// GOOD: Simplified colliders
[SerializeField] private Collider _collider;

// Disable physics on far objects
void Update()
{
    if (Vector3.Distance(transform.position, Camera.main.transform.position) > 100f)
    {
        _collider.enabled = false;
        _rigidbody.Sleep();
    }
}
```

### Issue 3: Canvas Rebuild

**Symptom:** UI marker shows >2ms

**Fixes:**
- Use Canvas.Split for dynamic/static separation
- Disable Raycast Target on non-interactive elements
- Avoid layout groups where possible
- Cache Graphic.GetModifiedChannels()

```csharp
// BAD: Layout group rebuilds on content change
<VerticalLayoutGroup>
    <Text>Dynamic Content</Text>  // Triggers rebuild
</VerticalLayoutGroup>

// GOOD: Separate static and dynamic
<VerticalLayoutGroup>  <!-- Static, rarely rebuilt -->
    <Image>
    <Text>
</VerticalLayoutGroup>

<VerticalLayoutGroup>  <!-- Dynamic, frequent rebuilds -->
    <Text>Dynamic Content</Text>
</VerticalLayoutGroup>
```

### Issue 4: Shader Complexity

**Symptom:** GPU profiler shows high shader time

**Fixes:**
- Use mobile shaders on mobile
- Reduce shader variants (multi_compile → multi_compile_fwdbase)
- Use LOD for shaders
- Avoid real-time shadows on mobile

### Issue 5: Asset Loading

**Symptom:** Frame stutter on scene load

**Fixes:**
- Use Addressables for async loading
- Implement loading screens
- Profile texture streaming
- Use compressed textures (ASTC, ETC2)

---

## Memory Optimization

### Memory Budget (Mobile)

| Asset Type | Budget per Asset | Total Budget |
|------------|-----------------|--------------|
| Textures | 2-4MB | 128MB |
| Meshes | 1-2MB | 64MB |
| Audio | 1-2MB | 32MB |
| Animations | 500KB | 16MB |
| Shaders | 500KB | 8MB |
| Scripts | 200KB | 2MB |

### Memory Profiling Workflow

```
1. Open Memory Profiler
2. Take snapshot (before gameplay)
3. Play for 5 minutes
4. Take snapshot (after gameplay)
5. Compare snapshots
6. Check for leaks
```

### Common Memory Leaks

```csharp
// LEAK: Event not unsubscribed
void OnEnable()
{
    EventChannel.OnEvent += HandleEvent;  // Subscribe
}

void OnDisable()
{
    // Missing unsubscribe!
}

// FIXED: Always unsubscribe
void OnDisable()
{
    EventChannel.OnEvent -= HandleEvent;  // Unsubscribe
}

// LEAK: Dictionary never cleared
private Dictionary<string, GameObject> _objects = new();

void Start()
{
    foreach (var obj in FindObjectsOfType<MyObject>())
        _objects[obj.Id] = obj.gameObject;
}

void OnDestroy()
{
    // Dictionary still holds references!
}
```

---

## Platform-Specific Optimization

### iOS

| Optimization | Impact | How |
|-------------|--------|-----|
| ASTC textures | High | Texture Import → Platform → iOS → ASTC |
| Metal API | High | Player Settings → Auto Graphics API |
| THUMB instruction set | Medium | Player Settings → ARMv7 THUMB: OFF |
| Memory | Critical | Keep <512MB total |

### Android

| Optimization | Impact | How |
|-------------|--------|-----|
| ETC2/ASTC textures | High | Texture Import → Platform → Android |
| OpenGL ES 3.0 | Medium | Player Settings → Auto Graphics API |
| Multithreaded rendering | Medium | Player Settings → Multithreaded Rendering |
| Memory | Critical | Keep <256MB for mid-range devices |

### WebGL

| Optimization | Impact | How |
|-------------|--------|-----|
| DXT compression | High | Texture Import → Platform → WebGL → DXT |
| Memory | Critical | Keep <512MB, use streaming |
| Code stripping | Medium | Player Settings → Managed Stripping Level |
| Exception support | Medium | Player Settings → Strip Engine Code |

---

## Profiling Workflow

### Step 1: Baseline

```
1. Build in Development mode
2. Open Profiler (Ctrl+Shift+P in Play Mode)
3. Profile empty scene
4. Record baseline metrics
```

### Step 2: Profile Core Loop

```
1. Implement minimal gameplay (move, shoot)
2. Profile for 5 minutes
3. Identify hot paths
4. Fix top 3 issues
```

### Step 3: Profile Extended Play

```
1. Play for 30 minutes
2. Watch for memory leaks
3. Check GC patterns
4. Monitor frame time stability
```

### Step 4: Platform Profiling

```
1. Build for target platform
2. Profile on device (not Editor!)
3. Compare with desktop profiling
4. Adjust budgets accordingly
```

---

## Performance Checklist

### Pre-Build

- [ ] Textures compressed for target platform
- [ ] Mesh LODs implemented
- [ ] Audio imported with correct format
- [ ] Shadows optimized (cascade count, shadow distance)
- [ ] Particle systems have budget limits
- [ ] Physics auto-simulate disabled when not needed

### Pre-Release

- [ ] Profiling on target device completed
- [ ] Memory profiling shows no leaks
- [ ] Frame time stable over 30 minutes
- [ ] All warning thresholds met
- [ ] Performance regression test created
