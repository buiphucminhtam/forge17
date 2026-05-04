# ForgeNexus Memory Optimization Analysis

**Date:** 2026-05-04
**Status:** In Progress

## Executive Summary

The `forgenexus analyze` pipeline consumes excessive RAM due to several architectural patterns. This document identifies root causes and proposes concrete optimizations.

---

## Memory Hotspots Identified

### 1. Full Graph Load into Memory

**Location:** `src/analysis/indexer.ts` lines 381-383, 431, 447, 452

```typescript
// ❌ PROBLEM: Loads ALL nodes from DB into memory
const allNodes = this.db.getAllNodes()  // Returns entire graph

// ❌ PROBLEM: Creates multiple copies
const nameToUid = buildNameUidMap(allNodes)
const fileSymbolMap = buildFileSymbolMap(allNodes)
const nodeNames = new Map(allNodes.map((n) => [n.uid, n.name]))  // 3rd copy!
const allNodeIds = allNodes.map((n) => n.uid)  // 4th copy!

// ❌ PROBLEM: Used in binding propagation
const allEdgesNow = this.db.getAllEdges()  // Entire edge table
```

**Impact:** For a 10K node repo:
- `allNodes`: ~50MB (10K * 5KB per node with signatures)
- `nameToUid`: ~20MB (Map overhead)
- `nodeNames`: ~10MB
- `allEdgesNow`: ~100MB+ (edges > nodes typically)

**Total duplication:** 3-5x the raw data size

---

### 2. Community Detection Graph Rebuild

**Location:** `src/analysis/indexer.ts` lines 430-447, `src/data/leiden.ts`

```typescript
// ❌ Creates adjacency list in addition to edge list
const adj = new Map<string, AdjEntry>()
for (const e of allEdges) {
  // Bidirectional entries = 2x edges in memory
  adj.get(pair[0])!.neighbors.add(pair[1])
}
```

**Impact:** Edges stored twice - once in DB results, once in adjacency map

---

### 3. Leiden Algorithm Memory Allocation

**Location:** `src/data/leiden.ts`

```typescript
// ❌ Multiple Maps per community
const community: Map<string, string> = new Map()       // nodeId → commId
const communitySize: Map<string, number> = new Map()  // commId → size
const communityWeight: Map<string, number> = new Map()
const nodeCommunities: Map<string, number> = new Map()
const communityNodes: Map<string, Set<string>> = new Map()

// ❌ Shuffle array allocation
const order = [...nodes]  // Another copy
shuffle(order, opts.seed)
```

**Impact:** For 10K nodes, ~6 separate Map/Set structures

---

### 4. Parallel Worker Memory Overhead

**Location:** `src/analysis/parallel.ts`

```typescript
// ❌ All chunks loaded before worker distribution
const chunks = chunkByByteBudget(tasks, chunkByteBudget)

// ❌ Results accumulated before return
const allResults: ParseResult[] = []
```

**Impact:** For 1000 files:
- Each file content stored in `ParseTask.content`
- Results stored in `ParseResult.nodes` and `ParseResult.edges`
- Memory = file sizes * 2 (input + output)

---

### 5. Incremental Mode Still Loads Everything

**Location:** `src/analysis/indexer.ts` lines 366-368, 381

```typescript
// ❌ Even in incremental mode, loads entire graph
if (incremental) {
  filesToParse = this.getChangedFilesSinceLastIndex(files)
}

// ❌ But then calls getAllNodes() anyway
const allNodes = this.db.getAllNodes()  // NOT incremental!
```

**Impact:** Incremental parsing but full graph load = no memory savings

---

## Optimization Strategies

### Strategy 1: Stream Processing for Large Graphs

**Current:**
```typescript
const allNodes = this.db.getAllNodes()  // Load everything
const allEdges = this.db.getAllEdges()  // Load everything
```

**Optimized:**
```typescript
// Process in batches using cursor-based pagination
async function* getNodesBatched(db, batchSize = 1000) {
  let offset = 0
  while (true) {
    const batch = db.query(
      `MATCH (n:CodeNode) WHERE n.rel_type IS NULL
       RETURN n.uid, n.type, n.name, n.filePath, n.line, n.endLine
       LIMIT ${batchSize} OFFSET ${offset}`
    )
    if (batch.length === 0) break
    yield batch.map(rowToNode)
    offset += batchSize
  }
}
```

**Expected savings:** O(1) memory instead of O(n)

---

### Strategy 2: Lazy Loading for Name Resolution

**Current:**
```typescript
const nameToUid = buildNameUidMap(allNodes)  // Full pass
const fileSymbolMap = buildFileSymbolMap(allNodes)  // Another full pass
const nodeNames = new Map(allNodes.map(...))  // Third pass
```

**Optimized:**
```typescript
// Build once, use generators
function* buildNameUidMapGenerator(nodes) {
  for (const node of nodes) {
    const key = `${node.type}:${node.name}`
    yield [key, node.uid]
  }
}

// Single pass, single Map
const nameToUid = new Map(buildNameUidMapGenerator(allNodes))
```

**Expected savings:** 2-3x reduction in intermediate allocations

---

### Strategy 3: Incremental Binding Propagation

**Current:**
```typescript
const propagated = propagateBindings(allNodes, allEdgesNow)
```

**Optimized:**
```typescript
// Only propagate for changed UIDs
const changedUids = new Set(newNodes.map(n => n.uid))
const propagated = propagateBindingsIncremental(changedUids, db)
```

**Expected savings:** O(changed) instead of O(all)

---

### Strategy 4: Community Detection - Skip or Stream

**Current:**
```typescript
// Always runs full Leiden for non-huge repos
if (isVeryLarge) {
  console.log(`Leiden: Skipping (${nodeCount} nodes exceeds 15K threshold)`)
}
```

**Optimized:**
```typescript
// Lower thresholds, add streaming option
const isVeryLarge = nodeCount > 5000  // Was 15K
const isLarge = nodeCount > 2000       // Was 10K

// Or: use sampling for very large graphs
if (nodeCount > 10000) {
  const sampled = sampleNodes(allNodes, 5000)
  communities = detectLeidenCommunities(sampled, sampledEdges, ...)
}
```

**Expected savings:** 50-70% reduction for medium-large repos

---

### Strategy 5: Worker Pool Memory Optimization

**Current:**
```typescript
const allResults: ParseResult[] = []  // Accumulates everything
allResults.push(...results)
```

**Optimized:**
```typescript
// Stream results to database directly
async function* parseAndInsert(tasks, workerPool) {
  for await (const chunk of workerPool.streamParse(tasks)) {
    db.insertNodesBatch(chunk.nodes)
    db.insertEdgesBatch(chunk.edges)
    yield chunk  // Or don't yield - write directly
  }
}
```

**Expected savings:** Proportional to file count (could be 10x for large repos)

---

### Strategy 6: Memory-Mapped Database

**KuzuDB consideration:**

KuzuDB supports memory-mapped I/O. Ensure:
```javascript
const db = new Database(path, {
  enable_experimental_feature: true,
  max_recursives_per_node: 1000
})
```

**Also:** Consider enabling compression for the database file:
```javascript
// KuzuDB 0.12+ supports this
const db = new Database(path, {
  buffer_pool_size: '1GB'  // Limit memory
})
```

---

## Implementation Priority

| Priority | Strategy | Effort | Impact | Risk |
|----------|----------|--------|--------|------|
| P0 | Lower Leiden thresholds | Low | High | Low |
| P0 | Incremental binding propagation | Medium | High | Medium |
| P1 | Stream processing for name resolution | Medium | High | Low |
| P1 | Batch processing for large graphs | High | Very High | Medium |
| P2 | Worker streaming to DB | High | Medium | High |
| P2 | Memory-mapped database tuning | Low | Medium | Low |

---

## Quick Wins (P0)

### Quick Win 1: Lower Community Detection Thresholds

```typescript
// src/analysis/indexer.ts line 493-495
const isVeryLarge = nodeCount > 5000   // Was 15K → Now 5K
const isLarge = nodeCount > 2000        // Was 10K → Now 2K
```

### Quick Win 2: Skip Binding Propagation for Small Changes

```typescript
// src/analysis/indexer.ts - add early exit
if (tasks.length < 10 && cachedResults.length > 100) {
  // Small change, skip expensive propagation
  console.log('[ForgeNexus] Binding: Skipping (small change)')
  progress('binding', 100)
} else {
  const propagated = propagateBindings(allNodes, allEdgesNow)
}
```

### Quick Win 3: Limit Leiden Iterations

```typescript
// src/analysis/indexer.ts line 503-504
const maxIters = isLarge ? 1 : isMedium ? 2 : 3  // Reduced from 2,3,5
const resolution = isLarge ? 5.0 : isMedium ? 3.0 : 1.5  // Higher = fewer communities = less memory
```

---

## Monitoring

Add memory profiling to the indexer:

```typescript
// At start of analyze()
const startMem = process.memoryUsage().heapUsed

// At end of analyze()
const endMem = process.memoryUsage().heapUsed
const deltaMB = Math.round((endMem - startMem) / 1024 / 1024)
console.log(`[ForgeNexus] Memory: ${deltaMB}MB used`)
```

---

## References

- KuzuDB memory configuration: https://docs.kuzudb.com
- Node.js memory management: https://nodejs.org/api/per_thread_globals.html
- Leiden algorithm paper: https://arxiv.org/abs/1810.08473
