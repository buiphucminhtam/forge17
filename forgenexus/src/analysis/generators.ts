/**
 * [MEMORY-OPT] Memory-efficient generator functions for large graph processing.
 *
 * Instead of loading all nodes/edges into memory at once,
 * these generators process data in batches using cursor-based iteration.
 */

import type { CodeNode, CodeEdge } from '../types.js'
import type { ForgeDB } from '../data/db.js'

const EDGE_TYPES_FOR_COMMUNITY = new Set([
  'CALLS', 'IMPORTS', 'HAS_METHOD', 'HAS_PROPERTY',
  'EXTENDS', 'IMPLEMENTS', 'MEMBER_OF',
])

/**
 * Generator-based name→uid map builder.
 * Single pass, single Map — O(n) time, O(n) space.
 */
export function* buildNameUidMapGenerator(
  nodes: Generator<CodeNode, void, unknown> | CodeNode[],
): Generator<[string, string], void, unknown> {
  for (const node of nodes) {
    const key = `${node.type}:${node.name}`
    yield [key, node.uid]
  }
}

/**
 * Generator-based file→symbols map builder.
 * Single pass, single Map — O(n) time, O(n) space.
 */
export function* buildFileSymbolMapGenerator(
  nodes: Generator<CodeNode, void, unknown> | CodeNode[],
): Generator<[string, Set<string>], void, unknown> {
  const map = new Map<string, Set<string>>()

  for (const node of nodes) {
    if (!map.has(node.filePath)) {
      map.set(node.filePath, new Set())
    }
    map.get(node.filePath)!.add(node.name)
  }

  for (const [filePath, symbols] of map) {
    yield [filePath, symbols]
  }
}

/**
 * Build name→uid Map from generator (single allocation).
 */
export function buildNameUidMapFromGenerator(db: ForgeDB): Map<string, string> {
  return new Map(buildNameUidMapGenerator(db.iterateNodes()))
}

/**
 * Build file→symbols Map from generator (single allocation).
 */
export function buildFileSymbolMapFromGenerator(db: ForgeDB): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>()
  for (const node of db.iterateNodes()) {
    if (!map.has(node.filePath)) {
      map.set(node.filePath, new Set())
    }
    map.get(node.filePath)!.add(node.name)
  }
  return map
}

/**
 * Generator for edge processing with filtering.
 */
export function* filterEdgesByType(
  edges: Generator<CodeEdge, void, unknown> | CodeEdge[],
  types: string[],
): Generator<CodeEdge, void, unknown> {
  const typeSet = new Set(types)
  for (const edge of edges) {
    if (typeSet.has(edge.type)) {
      yield edge
    }
  }
}

/**
 * [MEMORY-OPT] Stream all nodes into arrays with optional filtering.
 * Uses generator internally to minimize memory during iteration,
 * but collects into arrays only for the specific use cases that need them.
 */
export interface NodeArrays {
  allNodes: CodeNode[]
  nodeIds: string[]
  nodeNames: Map<string, string>
}

export function buildNodeArraysFromGenerator(db: ForgeDB, batchSize = 1000): NodeArrays {
  const allNodes: CodeNode[] = []
  const nodeIds: string[] = []
  const nodeNames = new Map<string, string>()

  for (const node of db.iterateNodes(batchSize)) {
    allNodes.push(node)
    nodeIds.push(node.uid)
    nodeNames.set(node.uid, node.name)
  }

  return { allNodes, nodeIds, nodeNames }
}

/**
 * [MEMORY-OPT] Stream edges for community detection.
 * Only collects edges of relevant types.
 * Memory: O(batchSize) instead of O(totalEdges).
 */
export function* streamCommunityEdges(
  db: ForgeDB,
  batchSize = 1000,
): Generator<{ from: string; to: string; weight: number }, void, unknown> {
  for (const edge of db.iterateEdges(batchSize)) {
    if (EDGE_TYPES_FOR_COMMUNITY.has(edge.type)) {
      yield { from: edge.fromUid, to: edge.toUid, weight: edge.confidence }
    }
  }
}

/**
 * [MEMORY-OPT] Collect community edges into array for Leiden.
 * Memory: O(commEdges) instead of O(totalEdges).
 */
export function buildCommunityEdgeArray(db: ForgeDB, batchSize = 1000): { from: string; to: string; weight: number }[] {
  return [...streamCommunityEdges(db, batchSize)]
}
