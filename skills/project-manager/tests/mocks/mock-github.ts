import { vi } from 'vitest';

export interface GitHubProject {
  id: number;
  number: number;
  name: string;
  body: string | null;
  state: 'open' | 'closed';
  items: GitHubProjectItem[];
}

export interface GitHubProjectItem {
  id: string;
  contentId: string;
  contentType: 'Issue' | 'PullRequest';
  status: string | null;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  labels: string[];
  assignees: string[];
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed' | 'merged';
  merged: boolean;
}

export const createMockGitHubClient = () => {
  const projects = new Map<number, GitHubProject>();
  const issues = new Map<number, GitHubIssue>();
  const pullRequests = new Map<number, GitHubPullRequest>();

  return {
    projects: {
      async get(projectId: number): Promise<GitHubProject | null> {
        return projects.get(projectId) || null;
      },

      async createItem(projectId: number, contentId: string, contentType: string): Promise<GitHubProjectItem> {
        const item: GitHubProjectItem = {
          id: `item-${Date.now()}`,
          contentId,
          contentType: contentType as 'Issue' | 'PullRequest',
          status: null,
        };
        const project = projects.get(projectId);
        if (project) {
          project.items.push(item);
        }
        return item;
      },

      async updateItemStatus(projectId: number, itemId: string, status: string): Promise<void> {
        const project = projects.get(projectId);
        if (project) {
          const item = project.items.find(i => i.id === itemId);
          if (item) {
            item.status = status;
          }
        }
      },
    },

    issues: {
      async get(owner: string, repo: string, issueNumber: number): Promise<GitHubIssue | null> {
        return issues.get(issueNumber) || null;
      },

      async create(options: { owner: string; repo: string; title: string; body?: string; labels?: string[] }): Promise<GitHubIssue> {
        const issue: GitHubIssue = {
          id: Date.now(),
          number: Math.floor(Math.random() * 1000),
          title: options.title,
          body: options.body || null,
          state: 'open',
          labels: options.labels || [],
          assignees: [],
        };
        issues.set(issue.number, issue);
        return issue;
      },

      async addLabels(owner: string, repo: string, issueNumber: number, labels: string[]): Promise<string[]> {
        const issue = issues.get(issueNumber);
        if (issue) {
          issue.labels = [...new Set([...issue.labels, ...labels])];
        }
        return issue?.labels || [];
      },
    },

    pullRequests: {
      async get(owner: string, repo: string, prNumber: number): Promise<GitHubPullRequest | null> {
        return pullRequests.get(prNumber) || null;
      },

      async createReview(owner: string, repo: string, prNumber: number, body: string): Promise<void> {
        // Mock implementation
      },
    },
  };
};

export const mockGitHubIntegration = {
  getProject: vi.fn().mockResolvedValue({
    id: 1,
    number: 1,
    name: 'Sprint Planning',
    state: 'open',
    items: [],
  }),

  addIssueToProject: vi.fn().mockResolvedValue({
    id: 'item-1',
    contentId: 'issue-1',
    contentType: 'Issue',
    status: 'To Do',
  }),

  updateProjectItemStatus: vi.fn().mockResolvedValue({
    id: 'item-1',
    status: 'In Progress',
  }),

  createIssue: vi.fn().mockResolvedValue({
    id: 123,
    number: 45,
    title: 'Test Issue',
    state: 'open',
    labels: ['enhancement'],
  }),

  addLabels: vi.fn().mockResolvedValue(['enhancement', 'priority']),
};

export const mockGitHubTimeout = {
  projects: {
    get: vi.fn().mockRejectedValue(new Error('GitHub API timeout after 10000ms')),
  },
};

export default {
  createMockGitHubClient,
  mockGitHubIntegration,
  mockGitHubTimeout,
};
