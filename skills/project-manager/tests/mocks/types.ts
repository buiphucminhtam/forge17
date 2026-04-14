// Shared types for PM skill tests

export interface Issue {
  id: string;
  identifier?: string;
  title: string;
  description?: string;
  status: string;
  priority?: number;
  assigneeId?: string;
  teamId?: string;
  cycleId?: string;
  labels?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  name: string;
  members?: string[];
}

export interface Cycle {
  id: string;
  name: string;
  teamId?: string;
  startsAt?: string;
  endsAt?: string;
}

export interface CreateIssueOptions {
  title: string;
  description?: string;
  priority?: number;
  assigneeId?: string;
  teamId?: string;
  cycleId?: string;
  labels?: string[];
}

export interface UpdateIssueOptions {
  title?: string;
  description?: string;
  status?: string;
  priority?: number;
}

export interface AsyncStandupEntry {
  member: string;
  date: string;
  yesterday: string[];
  today: string[];
  blockers: string[];
}

export interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  stories: Story[];
  metrics: SprintMetrics;
}

export interface Story {
  id: string;
  title: string;
  points: number;
  status: 'completed' | 'in_progress' | 'blocked';
  assignee?: string;
  completedAt?: string;
  blockedBy?: string[];
}

export interface SprintMetrics {
  totalPoints: number;
  completedPoints: number;
  velocity: number;
  historicalVelocity: number;
  velocityTrend: number;
}

export interface OKR {
  cycleId: string;
  objectives: Objective[];
  health: 'on_track' | 'at_risk' | 'off_track';
}

export interface Objective {
  id: string;
  title: string;
  owner: string;
  keyResults: KeyResult[];
  successProbability: number;
}

export interface KeyResult {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  tasks: string[];
}

export interface Risk {
  id: string;
  type: 'blocked' | 'velocity' | 'scope' | 'resource';
  level: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  mitigation?: string;
}
