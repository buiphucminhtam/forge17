import type { Issue, Team, Cycle, CreateIssueOptions, UpdateIssueOptions } from './types';
import { vi } from 'vitest';

export interface LinearClient {
  issue: IssueClient;
  team: TeamClient;
  cycle: CycleClient;
}

export interface IssueClient {
  create(options: CreateIssueOptions): Promise<Issue>;
  update(id: string, options: UpdateIssueOptions): Promise<Issue>;
  delete(id: string): Promise<boolean>;
  get(id: string): Promise<Issue | null>;
}

export interface TeamClient {
  get(id: string): Promise<Team | null>;
  list(): Promise<Team[]>;
}

export interface CycleClient {
  get(id: string): Promise<Cycle | null>;
  list(teamId?: string): Promise<Cycle[]>;
}

export const createMockLinearClient = (): LinearClient => {
  const issues = new Map<string, Issue>();
  const teams = new Map<string, Team>();
  const cycles = new Map<string, Cycle>();

  return {
    issue: {
      async create(options: CreateIssueOptions): Promise<Issue> {
        const id = `ISSUE-${Date.now()}`;
        const issue: Issue = {
          id,
          identifier: `ENG-${Math.floor(Math.random() * 1000)}`,
          title: options.title,
          description: options.description || '',
          status: ' backlog',
          priority: options.priority || 0,
          assigneeId: options.assigneeId,
          teamId: options.teamId,
          cycleId: options.cycleId,
          labels: options.labels || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        issues.set(id, issue);
        return issue;
      },

      async update(id: string, options: UpdateIssueOptions): Promise<Issue> {
        const issue = issues.get(id);
        if (!issue) {
          throw new Error(`Issue ${id} not found`);
        }
        const updated: Issue = {
          ...issue,
          ...options,
          updatedAt: new Date().toISOString(),
        };
        issues.set(id, updated);
        return updated;
      },

      async delete(id: string): Promise<boolean> {
        return issues.delete(id);
      },

      async get(id: string): Promise<Issue | null> {
        return issues.get(id) || null;
      },
    },

    team: {
      async get(id: string): Promise<Team | null> {
        return teams.get(id) || null;
      },

      async list(): Promise<Team[]> {
        return Array.from(teams.values());
      },
    },

    cycle: {
      async get(id: string): Promise<Cycle | null> {
        return cycles.get(id) || null;
      },

      async list(teamId?: string): Promise<Cycle[]> {
        const all = Array.from(cycles.values());
        return teamId ? all.filter(c => c.teamId === teamId) : all;
      },
    },
  };
};

export const mockLinearIntegration = {
  createIssue: vi.fn().mockResolvedValue({
    id: 'mock-issue-001',
    identifier: 'ENG-123',
    title: 'Mock Issue',
    status: ' backlog',
    priority: 2,
  }),

  updateIssue: vi.fn().mockResolvedValue({
    id: 'mock-issue-001',
    title: 'Updated Mock Issue',
    status: 'in_progress',
  }),

  addComment: vi.fn().mockResolvedValue({
    id: 'comment-001',
    issueId: 'mock-issue-001',
    body: 'Test comment',
    createdAt: new Date().toISOString(),
  }),

  createCycle: vi.fn().mockResolvedValue({
    id: 'cycle-001',
    name: 'Sprint 1',
    startsAt: '2024-01-15',
    endsAt: '2024-01-26',
  }),
};

export const mockLinearTimeout = {
  issue: {
    create: vi.fn().mockRejectedValue(new Error('Linear API timeout after 30000ms')),
  },
};

export default {
  createMockLinearClient,
  mockLinearIntegration,
  mockLinearTimeout,
};
