/**
 * MCP Server Integration Tests
 * Tests the MCP server's ability to start, register tools, and respond to requests
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { startServices, stopServices, getMcpDBUrl } from './setup.js';

describe('MCP Server Integration', () => {
  beforeAll(async () => {
    await startServices();
  }, 120_000);

  afterAll(async () => {
    await stopServices();
  });

  describe('Pipeline Manager', () => {
    it('startPipeline creates state file', async () => {
      const { startPipeline, getState, resetWorkspaceRoot } = await import('../../mcp/build/state/pipeline-manager.js');
      resetWorkspaceRoot();
      const result = startPipeline('Full Build');
      expect(result).toContain('Full Build');
      const state = getState();
      expect(state.currentMode).toBe('Full Build');
      expect(state.currentPhase).toBe(1);
    });

    it('advancePhase transitions correctly', async () => {
      const { advancePhase, getState, resetWorkspaceRoot } = await import('../../mcp/build/state/pipeline-manager.js');
      resetWorkspaceRoot();
      const result = advancePhase();
      expect(result).toContain('Phase');
      expect(getState().currentPhase).toBeGreaterThan(0);
    });

    it('gate workflow works end-to-end', async () => {
      const { requestGateApproval, approveGate, getState, resetWorkspaceRoot } = await import('../../mcp/build/state/pipeline-manager.js');
      resetWorkspaceRoot();
      const lockResult = requestGateApproval('Test gate');
      expect(lockResult).toContain('locked');
      expect(getState().status).toBe('WAITING_FOR_GATE');

      const unlockResult = approveGate();
      expect(unlockResult).toContain('approved');
      expect(getState().status).toBe('IN_PROGRESS');
    });
  });

  describe('Skill Parser', () => {
    it('getAllSkills returns array', async () => {
      const { getAllSkills } = await import('../../mcp/build/parsers/skill-parser.js');
      const skills = getAllSkills();
      expect(Array.isArray(skills)).toBe(true);
    });

    it('getSharedProtocols returns array', async () => {
      const { getSharedProtocols } = await import('../../mcp/build/parsers/skill-parser.js');
      const protocols = getSharedProtocols();
      expect(Array.isArray(protocols)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('ForgewrightError serializes correctly', async () => {
      const { ForgewrightError, ErrorCode } = await import('../../mcp/build/errors.js');
      const err = new ForgewrightError(ErrorCode.TOOL_NOT_FOUND, 'Tool missing', { tool: 'test' });
      const json = err.toJSON();
      expect(json.code).toBe('FW301');
      expect(json.context).toBeDefined();
    });

    it('isForgewrightError detects error types', async () => {
      const { isForgewrightError, ForgewrightError, ErrorCode } = await import('../../mcp/build/errors.js');
      expect(isForgewrightError(new ForgewrightError(ErrorCode.MCP_SERVER_ERROR, 'test'))).toBe(true);
      expect(isForgewrightError(new Error('plain'))).toBe(false);
    });
  });
});