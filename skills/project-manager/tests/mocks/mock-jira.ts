import { vi } from 'vitest';

export interface JiraIssue {
  id: string;
  key: string;
  summary: string;
  description: string | null;
  status: string;
  priority: string;
  assignee: string | null;
  labels: string[];
}

export interface JiraWorkflowTransition {
  id: string;
  name: string;
  to: string;
}

export interface JiraComment {
  id: string;
  body: string;
  author: string;
  created: string;
}

export const createMockJiraClient = () => {
  const issues = new Map<string, JiraIssue>();
  const transitions = new Map<string, JiraWorkflowTransition[]>();

  return {
    issue: {
      async get(key: string): Promise<JiraIssue | null> {
        return issues.get(key) || null;
      },

      async create(options: { projectKey: string; summary: string; description?: string; priority?: string }): Promise<JiraIssue> {
        const id = `jira-${Date.now()}`;
        const key = `${options.projectKey}-${Math.floor(Math.random() * 1000)}`;
        const issue: JiraIssue = {
          id,
          key,
          summary: options.summary,
          description: options.description || null,
          status: 'To Do',
          priority: options.priority || 'Medium',
          assignee: null,
          labels: [],
        };
        issues.set(key, issue);
        return issue;
      },

      async update(key: string, fields: Partial<JiraIssue>): Promise<JiraIssue> {
        const issue = issues.get(key);
        if (!issue) {
          throw new Error(`Issue ${key} not found`);
        }
        const updated = { ...issue, ...fields };
        issues.set(key, updated);
        return updated;
      },

      async addComment(key: string, body: string): Promise<JiraComment> {
        const comment: JiraComment = {
          id: `comment-${Date.now()}`,
          body,
          author: 'automation',
          created: new Date().toISOString(),
        };
        return comment;
      },

      async getTransitions(key: string): Promise<JiraWorkflowTransition[]> {
        return transitions.get(key) || [
          { id: '1', name: 'To Do', to: 'To Do' },
          { id: '2', name: 'In Progress', to: 'In Progress' },
          { id: '3', name: 'Done', to: 'Done' },
        ];
      },

      async transition(key: string, transitionId: string): Promise<void> {
        const issue = issues.get(key);
        if (issue) {
          const availableTransitions = transitions.get(key) || [];
          const transition = availableTransitions.find(t => t.id === transitionId);
          if (transition) {
            issue.status = transition.to;
          }
        }
      },
    },

    project: {
      async list(): Promise<Array<{ key: string; name: string }>> {
        return [
          { key: 'PROJ', name: 'Sample Project' },
        ];
      },
    },
  };
};

export const mockJiraRovoIntegration = {
  createIssue: vi.fn().mockResolvedValue({
    id: '10001',
    key: 'PROJ-123',
    summary: 'Rovo Task',
    status: 'To Do',
    priority: 'High',
  }),

  transitionWorkflow: vi.fn().mockResolvedValue({
    id: 'trans-1',
    name: 'Start Progress',
    to: 'In Progress',
  }),

  addSprintComment: vi.fn().mockResolvedValue({
    id: 'comment-100',
    body: 'Sprint update via Rovo',
    author: 'rovo-bot',
  }),

  createFromTemplate: vi.fn().mockResolvedValue({
    id: '10002',
    key: 'PROJ-124',
    summary: 'Template Task',
    status: 'To Do',
  }),
};

export const mockJiraTimeout = {
  issue: {
    get: vi.fn().mockRejectedValue(new Error('Jira API timeout after 15000ms')),
    create: vi.fn().mockRejectedValue(new Error('Jira API timeout after 15000ms')),
  },
};

export default {
  createMockJiraClient,
  mockJiraRovoIntegration,
  mockJiraTimeout,
};
