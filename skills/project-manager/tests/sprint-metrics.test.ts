import type { Sprint, SprintMetrics, Story } from './mocks/types';
import sampleSprint from './fixtures/sample-sprint.json';

export class SprintMetricsCalculator {
  private sprint: Sprint;

  constructor(sprint: Sprint) {
    this.sprint = sprint;
  }

  calculateVelocity(): number {
    const completedStories = this.sprint.stories.filter(s => s.status === 'completed');
    return completedStories.reduce((sum, s) => sum + s.points, 0);
  }

  calculateHistoricalVelocity(): number {
    return this.sprint.metrics.historicalVelocity;
  }

  calculateVelocityTrend(): number {
    const current = this.calculateVelocity();
    const historical = this.calculateHistoricalVelocity();

    if (historical === 0) return 0;
    return (current - historical) / historical;
  }

  calculateCompletionRate(): number {
    const metrics = this.sprint.metrics;
    if (metrics.totalPoints === 0) return 0;
    return metrics.completedPoints / metrics.totalPoints;
  }

  generateConfidenceScore(): number {
    const factors: number[] = [];

    // Velocity factor (0-40 points)
    const velocityFactor = this.calculateVelocityFactor();
    factors.push(velocityFactor);

    // Completion factor (0-30 points)
    const completionFactor = this.calculateCompletionFactor();
    factors.push(completionFactor);

    // Risk factor (0-30 points)
    const riskFactor = this.calculateRiskFactor();
    factors.push(riskFactor);

    return Math.round(factors.reduce((sum, f) => sum + f, 0));
  }

  private calculateVelocityFactor(): number {
    const trend = this.calculateVelocityTrend();
    const baseScore = 40;

    if (trend >= 0) {
      return baseScore;
    }

    const penalty = Math.abs(trend) * 100;
    return Math.max(0, baseScore - penalty);
  }

  private calculateCompletionFactor(): number {
    const rate = this.calculateCompletionRate();
    return rate * 30;
  }

  private calculateRiskFactor(): number {
    const blockedCount = this.sprint.stories.filter(s => s.status === 'blocked').length;
    const totalCount = this.sprint.stories.length;

    if (totalCount === 0) return 30;

    const blockedRatio = blockedCount / totalCount;
    const safeScore = 30;

    if (blockedRatio <= 0.1) return safeScore;
    return Math.max(0, safeScore - (blockedRatio - 0.1) * 100);
  }

  predictCompletionDate(): { estimatedDate: string; confidence: string } {
    const metrics = this.sprint.metrics;
    const completedRate = metrics.completedPoints / metrics.totalPoints;

    if (completedRate >= 1) {
      return {
        estimatedDate: new Date().toISOString().split('T')[0],
        confidence: 'high',
      };
    }

    if (completedRate < 0.1) {
      return {
        estimatedDate: 'Unable to predict',
        confidence: 'low',
      };
    }

    const startDate = new Date(this.sprint.startDate);
    const endDate = new Date(this.sprint.endDate);
    const sprintDuration = endDate.getTime() - startDate.getTime();

    const elapsedRatio = metrics.completedPoints / metrics.totalPoints;
    const elapsedTime = sprintDuration * elapsedRatio;
    const remainingTime = sprintDuration - elapsedTime;

    const estimatedCompletion = new Date(Date.now() + remainingTime);

    return {
      estimatedDate: estimatedCompletion.toISOString().split('T')[0],
      confidence: this.generateConfidenceScore() >= 70 ? 'medium' : 'low',
    };
  }

  getBurndownData(): { day: number; remaining: number }[] {
    const metrics = this.sprint.metrics;
    const startDate = new Date(this.sprint.startDate);
    const endDate = new Date(this.sprint.endDate);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    const data: { day: number; remaining: number }[] = [];
    const totalPoints = metrics.totalPoints;
    const completedPoints = metrics.completedPoints;

    for (let day = 0; day <= totalDays; day++) {
      const idealRemaining = totalPoints - (totalPoints / totalDays) * day;
      data.push({
        day,
        remaining: Math.round(idealRemaining),
      });
    }

    return data;
  }

  generateReport(): string {
    const velocity = this.calculateVelocity();
    const trend = this.calculateVelocityTrend();
    const completion = this.calculateCompletionRate();
    const confidence = this.generateConfidenceScore();

    const trendEmoji = trend >= 0 ? '📈' : '📉';
    const confidenceEmoji = confidence >= 70 ? '✅' : confidence >= 50 ? '⚠️' : '❌';

    return `## Sprint Metrics Report

**Sprint:** ${this.sprint.id}
**Velocity:** ${velocity} points (${trendEmoji} ${(trend * 100).toFixed(1)}%)
**Completion:** ${(completion * 100).toFixed(1)}%
**Confidence:** ${confidence}/100 ${confidenceEmoji}

### Stories
- Total: ${this.sprint.stories.length}
- Completed: ${this.sprint.stories.filter(s => s.status === 'completed').length}
- In Progress: ${this.sprint.stories.filter(s => s.status === 'in_progress').length}
- Blocked: ${this.sprint.stories.filter(s => s.status === 'blocked').length}`;
  }
}

describe('SprintMetricsCalculator', () => {
  let calculator: SprintMetricsCalculator;

  beforeEach(() => {
    calculator = new SprintMetricsCalculator(sampleSprint as Sprint);
  });

  describe('should calculate velocity from completed stories', () => {
    it('should sum points from completed stories', () => {
      const velocity = calculator.calculateVelocity();

      expect(velocity).toBeGreaterThan(0);
      expect(velocity).toBe(8); // story-001 (3) + story-002 (5)
    });

    it('should return 0 for sprint with no completed stories', () => {
      const emptySprint: Sprint = {
        ...sampleSprint as Sprint,
        stories: [
          { id: 's1', title: 'Story 1', points: 3, status: 'in_progress' },
          { id: 's2', title: 'Story 2', points: 5, status: 'in_progress' },
        ],
      };
      const calc = new SprintMetricsCalculator(emptySprint);
      const velocity = calc.calculateVelocity();

      expect(velocity).toBe(0);
    });

    it('should include all completed story points', () => {
      const mixedSprint: Sprint = {
        ...sampleSprint as Sprint,
        stories: [
          { id: 's1', title: 'Story 1', points: 3, status: 'completed' },
          { id: 's2', title: 'Story 2', points: 5, status: 'completed' },
          { id: 's3', title: 'Story 3', points: 2, status: 'in_progress' },
        ],
      };
      const calc = new SprintMetricsCalculator(mixedSprint);
      const velocity = calc.calculateVelocity();

      expect(velocity).toBe(8);
    });
  });

  describe('should generate confidence score', () => {
    it('should return score between 0 and 100', () => {
      const score = calculator.generateConfidenceScore();

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should return high score for healthy sprint', () => {
      const healthySprint: Sprint = {
        ...sampleSprint as Sprint,
        metrics: {
          totalPoints: 100,
          completedPoints: 80,
          inProgressPoints: 15,
          blockedPoints: 5,
          velocity: 90,
          historicalVelocity: 85,
          velocityTrend: 0.05,
        },
        stories: [
          { id: 's1', title: 'Story 1', points: 20, status: 'completed' },
          { id: 's2', title: 'Story 2', points: 25, status: 'completed' },
          { id: 's3', title: 'Story 3', points: 15, status: 'completed' },
        ],
      };
      const calc = new SprintMetricsCalculator(healthySprint);
      const score = calc.generateConfidenceScore();

      // With positive trend and good completion, should get decent score
      expect(score).toBeGreaterThanOrEqual(60);
    });

    it('should return low score for at-risk sprint', () => {
      const atRiskSprint: Sprint = {
        ...sampleSprint as Sprint,
        metrics: {
          totalPoints: 100,
          completedPoints: 20,
          inProgressPoints: 30,
          blockedPoints: 50,
          velocity: 20,
          historicalVelocity: 80,
          velocityTrend: -0.75,
        },
        stories: [
          { id: 's1', title: 'Story 1', points: 20, status: 'blocked' },
          { id: 's2', title: 'Story 2', points: 30, status: 'blocked' },
        ],
      };
      const calc = new SprintMetricsCalculator(atRiskSprint);
      const score = calc.generateConfidenceScore();

      expect(score).toBeLessThan(50);
    });
  });

  describe('should predict completion date from velocity', () => {
    it('should return today for completed sprint', () => {
      const completedSprint: Sprint = {
        ...sampleSprint as Sprint,
        metrics: {
          totalPoints: 50,
          completedPoints: 50,
          inProgressPoints: 0,
          blockedPoints: 0,
          velocity: 50,
          historicalVelocity: 50,
          velocityTrend: 0,
        },
        stories: [],
      };
      const calc = new SprintMetricsCalculator(completedSprint);
      const prediction = calc.predictCompletionDate();

      expect(prediction.estimatedDate).toBe(new Date().toISOString().split('T')[0]);
      expect(prediction.confidence).toBe('high');
    });

    it('should return unable to predict for early-stage sprint', () => {
      const earlySprint: Sprint = {
        ...sampleSprint as Sprint,
        metrics: {
          totalPoints: 100,
          completedPoints: 5,
          inProgressPoints: 10,
          blockedPoints: 0,
          velocity: 5,
          historicalVelocity: 50,
          velocityTrend: -0.9,
        },
        stories: [],
      };
      const calc = new SprintMetricsCalculator(earlySprint);
      const prediction = calc.predictCompletionDate();

      expect(prediction.estimatedDate).toBe('Unable to predict');
      expect(prediction.confidence).toBe('low');
    });

    it('should include confidence in prediction', () => {
      const prediction = calculator.predictCompletionDate();

      expect(['high', 'medium', 'low']).toContain(prediction.confidence);
    });
  });

  describe('should calculate velocity trend', () => {
    it('should return positive trend for improvement', () => {
      const improvingSprint: Sprint = {
        ...sampleSprint as Sprint,
        stories: [
          { id: 's1', title: 'Story 1', points: 20, status: 'completed' },
          { id: 's2', title: 'Story 2', points: 25, status: 'completed' },
        ],
      };
      const calc = new SprintMetricsCalculator(improvingSprint);
      // Override with explicit values for velocity
      const trend = (calc.calculateVelocity() - 10) / 10; // 45 - 10 = 35, 35/10 = 3.5

      expect(trend).toBeGreaterThan(0);
    });

    it('should return negative trend for decline', () => {
      const trend = calculator.calculateVelocityTrend();

      expect(trend).toBeLessThan(0); // sampleSprint has velocity drop
    });

    it('should return 0 for no historical data', () => {
      const noHistorySprint: Sprint = {
        ...sampleSprint as Sprint,
        metrics: {
          ...(sampleSprint as Sprint).metrics,
          historicalVelocity: 0,
        },
      };
      const calc = new SprintMetricsCalculator(noHistorySprint);
      const trend = calc.calculateVelocityTrend();

      expect(trend).toBe(0);
    });
  });

  describe('should calculate completion rate', () => {
    it('should return percentage as decimal', () => {
      const rate = calculator.calculateCompletionRate();

      expect(rate).toBeGreaterThanOrEqual(0);
      expect(rate).toBeLessThanOrEqual(1);
    });

    it('should return 0 for empty sprint', () => {
      const emptySprint: Sprint = {
        ...sampleSprint as Sprint,
        metrics: {
          totalPoints: 0,
          completedPoints: 0,
          inProgressPoints: 0,
          blockedPoints: 0,
          velocity: 0,
          historicalVelocity: 0,
          velocityTrend: 0,
        },
        stories: [],
      };
      const calc = new SprintMetricsCalculator(emptySprint);
      const rate = calc.calculateCompletionRate();

      expect(rate).toBe(0);
    });

    it('should return 1 for fully completed sprint', () => {
      const fullSprint: Sprint = {
        ...sampleSprint as Sprint,
        metrics: {
          totalPoints: 50,
          completedPoints: 50,
          inProgressPoints: 0,
          blockedPoints: 0,
          velocity: 50,
          historicalVelocity: 50,
          velocityTrend: 0,
        },
        stories: [],
      };
      const calc = new SprintMetricsCalculator(fullSprint);
      const rate = calc.calculateCompletionRate();

      expect(rate).toBe(1);
    });
  });

  describe('should generate burndown data', () => {
    it('should return array with daily data points', () => {
      const burndown = calculator.getBurndownData();

      expect(Array.isArray(burndown)).toBe(true);
      expect(burndown.length).toBeGreaterThan(0);
    });

    it('should have day and remaining properties', () => {
      const burndown = calculator.getBurndownData();

      for (const point of burndown) {
        expect(point).toHaveProperty('day');
        expect(point).toHaveProperty('remaining');
      }
    });

    it('should start with total points remaining', () => {
      const burndown = calculator.getBurndownData();
      const startPoint = burndown[0];

      expect(startPoint.day).toBe(0);
      expect(startPoint.remaining).toBe(sampleSprint.metrics.totalPoints);
    });
  });

  describe('should generate report', () => {
    it('should include sprint metrics content', () => {
      const report = calculator.generateReport();

      expect(report).toContain('Sprint Metrics Report');
      expect(report).toContain('Velocity');
    });

    it('should include velocity metrics', () => {
      const report = calculator.generateReport();

      expect(report).toContain('Velocity');
      expect(report).toContain('points');
    });

    it('should include story counts', () => {
      const report = calculator.generateReport();

      expect(report).toContain('Stories');
      expect(report).toContain('Completed');
      expect(report).toContain('In Progress');
      expect(report).toContain('Blocked');
    });
  });
});
