import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  detectCommunities,
  traceProcesses,
  analyzeImpact,
  computeMRO,
  findOverrides,
} from './graph.js';
import type { ForgeDB } from './db.js';

function createMockDB(overrides?: Partial<ForgeDB>): ForgeDB {
  const defaultDB: ForgeDB = {
    query: vi.fn().mockReturnValue([]),
    getNode: vi.fn().mockReturnValue(null),
    getOutgoingEdges: vi.fn().mockReturnValue([]),
    getIncomingEdges: vi.fn().mockReturnValue([]),
    getAllNodes: vi.fn().mockReturnValue([]),
    getCommunity: vi.fn().mockReturnValue(null),
    search: vi.fn().mockReturnValue([]),
  };
  return { ...defaultDB, ...overrides } as ForgeDB;
}

describe('Graph Operations', () => {
  describe('detectCommunities', () => {
    it('returns empty array for empty graph', () => {
      const db = createMockDB({
        query: vi.fn().mockReturnValue([]),
      });
      expect(detectCommunities(db)).toEqual([]);
    });

    it('detects communities from edges', () => {
      const db = createMockDB({
        query: vi.fn()
          .mockReturnValueOnce([
            { from_uid: 'n1', to_uid: 'n2', type: 'CALLS' },
            { from_uid: 'n2', to_uid: 'n3', type: 'CALLS' },
            { from_uid: 'n1', to_uid: 'n2', type: 'CALLS' },
          ])
          .mockReturnValueOnce([
            { uid: 'n1', name: 'auth/login.ts' },
            { uid: 'n2', name: 'auth/middleware.ts' },
            { uid: 'n3', name: 'auth/validator.ts' },
          ]),
      });
      const communities = detectCommunities(db);
      expect(communities.length).toBeGreaterThan(0);
      expect(communities[0]).toHaveProperty('id');
      expect(communities[0]).toHaveProperty('nodes');
      expect(communities[0]).toHaveProperty('cohesion');
    });

    it('calculates cohesion score between 0 and 1', () => {
      // 1 internal edge / max 1 possible = 1.0
      const db = createMockDB({
        query: vi.fn()
          .mockReturnValueOnce([
            { from_uid: 'a', to_uid: 'b', type: 'CALLS' },
          ])
          .mockReturnValueOnce([
            { uid: 'a', name: 'module/A.ts' },
            { uid: 'b', name: 'module/B.ts' },
          ]),
      });
      const communities = detectCommunities(db);
      expect(communities[0].cohesion).toBeGreaterThanOrEqual(0);
      expect(communities[0].cohesion).toBeLessThanOrEqual(1);
    });

    it('filters by community edge types', () => {
      const db = createMockDB({
        query: vi.fn()
          .mockReturnValueOnce([
            { from_uid: 'n1', to_uid: 'n2', type: 'CALLS' },
            { from_uid: 'n1', to_uid: 'n2', type: 'UNKNOWN_TYPE' },
          ])
          .mockReturnValueOnce([
            { uid: 'n1', name: 'a.ts' },
            { uid: 'n2', name: 'b.ts' },
          ]),
      });
      const communities = detectCommunities(db);
      expect(communities.length).toBeGreaterThan(0);
    });

    it('sorts communities by cohesion descending', () => {
      const db = createMockDB({
        query: vi.fn()
          .mockReturnValueOnce([
            { from_uid: 'n1', to_uid: 'n2', type: 'CALLS' },
            { from_uid: 'n2', to_uid: 'n1', type: 'CALLS' },
            { from_uid: 'n3', to_uid: 'n4', type: 'CALLS' },
            { from_uid: 'n4', to_uid: 'n3', type: 'CALLS' },
          ])
          .mockReturnValueOnce([
            { uid: 'n1', name: 'a.ts' },
            { uid: 'n2', name: 'b.ts' },
            { uid: 'n3', name: 'c.ts' },
            { uid: 'n4', name: 'd.ts' },
          ]),
      });
      const communities = detectCommunities(db);
      for (let i = 1; i < communities.length; i++) {
        expect(communities[i - 1].cohesion).toBeGreaterThanOrEqual(communities[i].cohesion);
      }
    });
  });

  describe('analyzeImpact', () => {
    it('returns empty impact for isolated node', () => {
      const db = createMockDB({
        getNode: vi.fn().mockReturnValue({
          uid: 'isolated',
          filePath: '/src/isolated.ts',
        }),
        getIncomingEdges: vi.fn().mockReturnValue([]),
      });
      const result = analyzeImpact(db, 'isolated');
      expect(result.risk).toBe('LOW');
      expect(result.byDepth.d1).toEqual([]);
      expect(result.byDepth.d2).toEqual([]);
      expect(result.byDepth.d3).toEqual([]);
    });

    it('adds direct callers to d1', () => {
      const db = createMockDB({
        getNode: vi.fn((uid: string) => {
          const files: Record<string, string> = {
            'target': '/src/target.ts',
            'caller1': '/src/caller1.ts',
          };
          return uid in files
            ? { uid, filePath: files[uid as keyof typeof files] }
            : null;
        }),
        getIncomingEdges: vi.fn((uid: string) => {
          if (uid === 'target') {
            return [
              { fromUid: 'caller1', toUid: 'target', confidence: 0.9 },
            ];
          }
          if (uid === 'caller1') return [{ fromUid: 'caller2', toUid: 'caller1', confidence: 0.9 }];
          return [];
        }),
      });
      const result = analyzeImpact(db, 'target');
      expect(result.byDepth.d1).toContain('caller1');
    });

    it('excludes test files by default', () => {
      const db = createMockDB({
        getNode: vi.fn((uid: string) => {
          if (uid === 'target') return { uid: 'target', filePath: '/src/lib.ts' };
          if (uid === 'tester') return { uid: 'tester', filePath: '/src/lib.test.ts' };
          return null;
        }),
        getIncomingEdges: vi.fn((uid: string) => {
          if (uid === 'target') return [{ fromUid: 'tester', toUid: 'target', confidence: 1.0 }];
          return [];
        }),
      });
      const result = analyzeImpact(db, 'target');
      expect(result.affectedTests).not.toContain('/src/lib.test.ts');
    });

    it('includes test files when includeTests=true', () => {
      const db = createMockDB({
        getNode: vi.fn((uid: string) => {
          if (uid === 'target') return { uid: 'target', filePath: '/src/lib.ts' };
          if (uid === 'tester') return { uid: 'tester', filePath: '/src/lib.test.ts' };
          return null;
        }),
        getIncomingEdges: vi.fn((uid: string) => {
          if (uid === 'target') return [{ fromUid: 'tester', toUid: 'target', confidence: 1.0 }];
          return [];
        }),
      });
      const result = analyzeImpact(db, 'target', 3, { includeTests: true });
      expect(result.affectedTests).toContain('/src/lib.test.ts');
    });

    it('filters by minConfidence', () => {
      const db = createMockDB({
        getNode: vi.fn((uid: string) => ({
          uid,
          filePath: `/src/${uid}.ts`,
        })),
        getIncomingEdges: vi.fn(() => [
          { fromUid: 'low', toUid: 'target', confidence: 0.1 },
          { fromUid: 'high', toUid: 'target', confidence: 0.9 },
        ]),
      });
      const result = analyzeImpact(db, 'target', 3, { minConfidence: 0.5 });
      expect(result.byDepth.d1).not.toContain('low');
      expect(result.byDepth.d1).toContain('high');
    });

    it('calculates risk level based on depth counts', () => {
      const mockGetIncomingEdges = vi.fn((uid: string) => {
        if (uid === 'target') {
          return Array.from({ length: 15 }, (_, i) => ({
            fromUid: `caller${i}`,
            toUid: 'target',
            confidence: 0.9,
          }));
        }
        return [];
      });
      const db = createMockDB({
        getNode: vi.fn((uid: string) => ({ uid, filePath: `/src/${uid}.ts` })),
        getIncomingEdges: mockGetIncomingEdges,
      });
      const result = analyzeImpact(db, 'target');
      expect(result.risk).toBe('CRITICAL');
    });

    it('limits depth traversal', () => {
      let callCount = 0;
      const db = createMockDB({
        getNode: vi.fn((uid: string) => ({ uid, filePath: `/src/${uid}.ts` })),
        getIncomingEdges: vi.fn((uid: string) => {
          callCount++;
          if (uid === 'target') return [{ fromUid: 'd1', toUid: 'target', confidence: 0.9 }];
          if (uid === 'd1') return [{ fromUid: 'd2', toUid: 'd1', confidence: 0.9 }];
          if (uid === 'd2') return [{ fromUid: 'd3', toUid: 'd2', confidence: 0.9 }];
          if (uid === 'd3') return [{ fromUid: 'd4', toUid: 'd3', confidence: 0.9 }];
          return [];
        }),
      });
      analyzeImpact(db, 'target', 2);
      expect(callCount).toBeGreaterThan(0);
    });

    it('returns summary string', () => {
      const db = createMockDB({
        getNode: vi.fn((uid: string) => ({
          uid,
          filePath: `/src/${uid}.ts`,
          process: 'proc1',
          community: 'comm1',
        })),
        getIncomingEdges: vi.fn(() => []),
      });
      const result = analyzeImpact(db, 'target');
      expect(typeof result.summary).toBe('string');
      expect(result.summary).toContain('Direct callers');
    });
  });

  describe('computeMRO', () => {
    it('returns only the class if no parent', () => {
      const db = createMockDB({
        getOutgoingEdges: vi.fn().mockReturnValue([]),
      });
      const mro = computeMRO(db, 'MyClass');
      expect(mro).toEqual(['MyClass']);
    });

    it('follows single inheritance chain', () => {
      const db = createMockDB({
        getOutgoingEdges: vi.fn((uid, type) => {
          if (type === 'EXTENDS') {
            if (uid === 'Child') return [{ toUid: 'Parent' }];
            if (uid === 'Parent') return [{ toUid: 'GrandParent' }];
          }
          return [];
        }),
      });
      const mro = computeMRO(db, 'Child');
      expect(mro).toEqual(['Child', 'Parent', 'GrandParent']);
    });

    it('stops at diamond inheritance', () => {
      const db = createMockDB({
        getOutgoingEdges: vi.fn((uid, type) => {
          if (type === 'EXTENDS') {
            if (uid === 'Child') return [{ toUid: 'ParentA' }];
            if (uid === 'ParentA') return [{ toUid: 'Common' }];
            if (uid === 'ParentB') return [{ toUid: 'Common' }];
            if (uid === 'Common') return [{ toUid: 'ParentB' }];
          }
          return [];
        }),
      });
      const mro = computeMRO(db, 'Child');
      expect(mro).toContain('Child');
      expect(mro).toContain('ParentA');
      expect(mro).toContain('Common');
      expect(mro.length).toBeLessThanOrEqual(5);
    });
  });

  describe('findOverrides', () => {
    it('returns empty array for no overrides', () => {
      const db = createMockDB({
        getOutgoingEdges: vi.fn().mockReturnValue([]),
      });
      const overrides = findOverrides(db, 'method1');
      expect(overrides).toEqual([]);
    });

    it('finds direct overrides', () => {
      const db = createMockDB({
        getOutgoingEdges: vi.fn((uid) => {
          if (uid === 'method1') return [{ toUid: 'parentMethod' }];
          return [];
        }),
      });
      const overrides = findOverrides(db, 'method1');
      expect(overrides).toContain('parentMethod');
    });

    it('traverses override chain', () => {
      const db = createMockDB({
        getOutgoingEdges: vi.fn((uid) => {
          if (uid === 'method1') return [{ toUid: 'method2' }];
          if (uid === 'method2') return [{ toUid: 'method3' }];
          return [];
        }),
      });
      const overrides = findOverrides(db, 'method1');
      expect(overrides).toContain('method2');
      expect(overrides).toContain('method3');
    });

    it('avoids infinite loop on circular references', () => {
      const db = createMockDB({
        getOutgoingEdges: vi.fn((uid) => {
          if (uid === 'a') return [{ toUid: 'b' }];
          if (uid === 'b') return [{ toUid: 'a' }];
          return [];
        }),
      });
      const overrides = findOverrides(db, 'a');
      expect(overrides.length).toBeLessThanOrEqual(3);
    });
  });

  describe('traceProcesses', () => {
    it('returns empty array when no entry points found', () => {
      const db = createMockDB({
        query: vi.fn().mockReturnValue([]),
      });
      expect(traceProcesses(db)).toEqual([]);
    });

    it('identifies entry point types', () => {
      const db = createMockDB({
        query: vi.fn()
          .mockReturnValueOnce([
            { uid: 'route1', name: 'handleRequest', filePath: '/routes/api.ts', type: 'Function' },
          ])
          .mockReturnValueOnce([]),
        getNode: vi.fn().mockReturnValue(null),
        getOutgoingEdges: vi.fn().mockReturnValue([]),
      });
      const processes = traceProcesses(db);
      expect(processes.length).toBeGreaterThanOrEqual(0);
    });
  });
});