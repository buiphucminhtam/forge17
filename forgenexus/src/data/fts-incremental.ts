/**
 * Incremental FTS — update only changed nodes instead of full rebuild.
 *
 * NOTE: This module is deprecated. KuzuDB handles FTS automatically via
 * CREATE FTS INDEX ON clause. This function is now a no-op placeholder.
 */
import type { ForgeDB } from './db.js'

/**
 * Incrementally update FTS index for changed nodes.
 * 
 * @deprecated KuzuDB maintains FTS automatically. This is a no-op.
 */
export function incrementalFTSUpdate(
  _db: ForgeDB,
  _changedNodeUids: Set<string>,
  _totalNodes: number,
): void {
  // KuzuDB FTS is automatic - no action needed
  // Previous SQLite implementation removed - db.db.prepare() no longer valid
  return
}
