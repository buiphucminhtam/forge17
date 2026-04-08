/**
 * LRU Cache for class enclosure lookups.
 *
 * Problem: extractMemberOfEdges() walks the parent chain for every method/property
 * node to find its enclosing class. For large files (1000+ nodes), this means
 * up to 1000 × 10 = 10,000 parent chain traversals.
 *
 * Solution: cache enclosing class lookups per (nodeUid, filePath, depth).
 * Since AST nodes don't have stable IDs, we use (nodeType, startRow, filePath) as key.
 * This is a classic LRU cache with configurable size.
 */

interface CacheEntry {
  containerUid: string | null
  containerType: string | null
  lastAccessed: number
}

interface EnclosureKey {
  nodeType: string
  row: number
  filePath: string
}

/**
 * Simple LRU cache for class enclosure lookups.
 * Key: `${filePath}:${row}:${nodeType}`
 * Value: `{ containerUid, containerType }`
 */
export class EnclosureCache {
  private cache = new Map<string, CacheEntry>()
  private maxSize: number
  private accessOrder: string[] = []

  constructor(maxSize = 2000) {
    this.maxSize = maxSize
  }

  private makeKey(nodeType: string, row: number, filePath: string): string {
    // Shorten filePath to reduce key size
    const shortPath = filePath.length > 80 ? filePath.slice(-80) : filePath
    return `${shortPath}:${row}:${nodeType}`
  }

  get(nodeType: string, row: number, filePath: string): CacheEntry | undefined {
    const key = this.makeKey(nodeType, row, filePath)
    const entry = this.cache.get(key)
    if (entry) {
      // Move to end (most recently used)
      this.touch(key)
      return entry
    }
    return undefined
  }

  set(
    nodeType: string,
    row: number,
    filePath: string,
    containerUid: string | null,
    containerType: string | null,
  ): void {
    const key = this.makeKey(nodeType, row, filePath)

    // Evict LRU entries if at capacity
    while (this.cache.size >= this.maxSize) {
      const lru = this.accessOrder.shift()
      if (lru) this.cache.delete(lru)
    }

    this.cache.set(key, {
      containerUid,
      containerType,
      lastAccessed: Date.now(),
    })
    this.accessOrder.push(key)
  }

  private touch(key: string): void {
    const idx = this.accessOrder.indexOf(key)
    if (idx !== -1) {
      this.accessOrder.splice(idx, 1)
    }
    this.accessOrder.push(key)
  }

  clear(): void {
    this.cache.clear()
    this.accessOrder = []
  }

  get stats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.hitRate,
    }
  }

  private hits = 0
  private misses = 0
  private hitRate = 0

  recordHit(): void {
    this.hits++
    this.misses // reference
    this.hitRate = this.hits / (this.hits + this.misses) || 0
  }

  recordMiss(): void {
    this.misses++
    this.hitRate = this.hits / (this.hits + this.misses) || 0
  }
}

/**
 * Global enclosure cache — shared across all parsing sessions.
 * Reset between incremental analysis runs.
 */
export const globalEnclosureCache = new EnclosureCache(5000)
