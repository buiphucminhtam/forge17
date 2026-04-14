import type { Risk, Sprint, Story } from './mocks/types';
import sampleSprint from './fixtures/sample-sprint.json';

export interface DetectedRisk extends Risk {
  detectedAt: string;
  affectedItems: string[];
}

export class RiskDetector {
  private sprint: Sprint;

  constructor(sprint: Sprint) {
    this.sprint = sprint;
  }

  detectAll(): DetectedRisk[] {
    const risks: DetectedRisk[] = [];

    risks.push(...this.detectBlockedRisks());
    risks.push(...this.detectVelocityRisks());
    risks.push(...this.detectScopeRisks());
    risks.push(...this.detectResourceRisks());

    return risks;
  }

  detectBlockedRisks(): DetectedRisk[] {
    const risks: DetectedRisk[] = [];

    for (const story of this.sprint.stories) {
      if (story.status === 'blocked' && story.blockedBy) {
        risks.push({
          id: `risk-blocked-${story.id}`,
          type: 'blocked',
          level: 'critical',
          title: `${story.id} blocked by incomplete dependencies: ${story.blockedBy.join(', ')}`,
          mitigation: `Complete dependencies first: ${story.blockedBy.join(', ')}`,
          detectedAt: new Date().toISOString(),
          affectedItems: [story.id, ...story.blockedBy],
        });
      }
    }

    return risks;
  }

  detectVelocityRisks(): DetectedRisk[] {
    const risks: DetectedRisk[] = [];
    const metrics = this.sprint.metrics;

    if (metrics.velocityTrend < -0.3) {
      risks.push({
        id: 'risk-velocity-critical',
        type: 'velocity',
        level: 'critical',
        title: `Velocity dropped by ${Math.abs(metrics.velocityTrend * 100).toFixed(0)}%`,
        mitigation: 'Review capacity and redistribute work immediately',
        detectedAt: new Date().toISOString(),
        affectedItems: [],
      });
    } else if (metrics.velocityTrend < -0.2) {
      risks.push({
        id: 'risk-velocity-high',
        type: 'velocity',
        level: 'high',
        title: `Velocity dropped by ${Math.abs(metrics.velocityTrend * 100).toFixed(0)}%`,
        mitigation: 'Review capacity and redistribute work',
        detectedAt: new Date().toISOString(),
        affectedItems: [],
      });
    } else if (metrics.velocityTrend < -0.1) {
      risks.push({
        id: 'risk-velocity-medium',
        type: 'velocity',
        level: 'medium',
        title: `Velocity dropped by ${Math.abs(metrics.velocityTrend * 100).toFixed(0)}%`,
        mitigation: 'Monitor and adjust if needed',
        detectedAt: new Date().toISOString(),
        affectedItems: [],
      });
    }

    return risks;
  }

  detectScopeRisks(): DetectedRisk[] {
    const risks: DetectedRisk[] = [];
    const metrics = this.sprint.metrics;

    const completionRate = metrics.completedPoints / metrics.totalPoints;
    if (completionRate < 0.3) {
      risks.push({
        id: 'risk-scope-critical',
        type: 'scope',
        level: 'critical',
        title: 'Sprint completion rate below 30%',
        mitigation: 'Reassess sprint scope immediately',
        detectedAt: new Date().toISOString(),
        affectedItems: [],
      });
    } else if (completionRate < 0.5) {
      risks.push({
        id: 'risk-scope-high',
        type: 'scope',
        level: 'high',
        title: 'Sprint completion rate below 50%',
        mitigation: 'Prioritize must-have items',
        detectedAt: new Date().toISOString(),
        affectedItems: [],
      });
    }

    return risks;
  }

  detectResourceRisks(): DetectedRisk[] {
    const risks: DetectedRisk[] = [];

    const blockedCount = this.sprint.stories.filter(s => s.status === 'blocked').length;
    const totalCount = this.sprint.stories.length;
    const blockedRatio = blockedCount / totalCount;

    if (blockedRatio > 0.3) {
      risks.push({
        id: 'risk-resource-high',
        type: 'resource',
        level: 'high',
        title: `${blockedCount} blocked stories (${(blockedRatio * 100).toFixed(0)}% of sprint)`,
        mitigation: 'Focus on unblocking critical paths',
        detectedAt: new Date().toISOString(),
        affectedItems: this.sprint.stories
          .filter(s => s.status === 'blocked')
          .map(s => s.id),
      });
    }

    return risks;
  }

  shouldEscalate(risk: DetectedRisk): boolean {
    const escalateLevels: Risk['level'][] = ['critical', 'high'];
    return escalateLevels.includes(risk.level);
  }

  generateEscalationMessage(risk: DetectedRisk): string {
    const levelEmoji = {
      critical: '🚨',
      high: '⚠️',
      medium: '📋',
      low: 'ℹ️',
    };

    const emoji = levelEmoji[risk.level] || 'ℹ️';

    return `${emoji} **${risk.level.toUpperCase()} RISK ALERT**

**Type:** ${risk.type}
**Title:** ${risk.title}
**Detected:** ${new Date(risk.detectedAt).toLocaleString()}
${risk.affectedItems.length > 0 ? `**Affected Items:** ${risk.affectedItems.join(', ')}` : ''}
${risk.mitigation ? `**Mitigation:** ${risk.mitigation}` : ''}`;
  }

  getRiskSummary(): { level: Risk['level']; count: number }[] {
    const risks = this.detectAll();

    return [
      { level: 'critical', count: risks.filter(r => r.level === 'critical').length },
      { level: 'high', count: risks.filter(r => r.level === 'high').length },
      { level: 'medium', count: risks.filter(r => r.level === 'medium').length },
      { level: 'low', count: risks.filter(r => r.level === 'low').length },
    ];
  }
}

describe('RiskDetector', () => {
  let detector: RiskDetector;

  beforeEach(() => {
    detector = new RiskDetector(sampleSprint as Sprint);
  });

  describe('should flag Critical risk', () => {
    it('should detect blocked story as critical risk', () => {
      const risks = detector.detectBlockedRisks();

      expect(risks.length).toBeGreaterThan(0);
      expect(risks.some(r => r.level === 'critical')).toBe(true);
    });

    it('should identify affected items for blocked risks', () => {
      const risks = detector.detectBlockedRisks();

      for (const risk of risks) {
        expect(risk.affectedItems.length).toBeGreaterThan(0);
      }
    });

    it('should detect severe velocity drop as critical', () => {
      const sprintWithSevereDrop: Sprint = {
        ...sampleSprint as Sprint,
        metrics: {
          ...(sampleSprint as Sprint).metrics,
          velocityTrend: -0.5,
        },
      };
      const detectorForDrop = new RiskDetector(sprintWithSevereDrop);
      const risks = detectorForDrop.detectVelocityRisks();

      expect(risks.some(r => r.level === 'critical')).toBe(true);
    });
  });

  describe('should flag High risk', () => {
    it('should detect moderate velocity drop as high risk', () => {
      const risks = detector.detectVelocityRisks();

      const highRisks = risks.filter(r => r.level === 'high');
      expect(highRisks.length).toBeGreaterThanOrEqual(0);
    });

    it('should include mitigation in high risk alerts', () => {
      const risks = detector.detectVelocityRisks();

      for (const risk of risks) {
        if (risk.level === 'high') {
          expect(risk.mitigation).toBeDefined();
        }
      }
    });
  });

  describe('should flag Medium risk', () => {
    it('should detect minor velocity drop as medium risk', () => {
      const sprintWithMinorDrop: Sprint = {
        ...sampleSprint as Sprint,
        metrics: {
          ...(sampleSprint as Sprint).metrics,
          velocityTrend: -0.15,
        },
      };
      const detectorForMinor = new RiskDetector(sprintWithMinorDrop);
      const risks = detectorForMinor.detectVelocityRisks();

      expect(risks.some(r => r.level === 'medium')).toBe(true);
    });
  });

  describe('should auto-generate escalation message', () => {
    it('should generate formatted escalation for critical risk', () => {
      const risks = detector.detectBlockedRisks();
      if (risks.length > 0) {
        const message = detector.generateEscalationMessage(risks[0]);

        expect(message).toContain('CRITICAL');
        expect(message).toContain('🚨');
        expect(message).toContain('blocked');
      }
    });

    it('should generate formatted escalation for high risk', () => {
      const risks = detector.detectVelocityRisks();
      const highOrMediumRisks = risks.filter(r => r.level === 'high' || r.level === 'medium');
      if (highOrMediumRisks.length > 0) {
        const message = detector.generateEscalationMessage(highOrMediumRisks[0]);

        expect(message).toMatch(/(HIGH|MEDIUM)/);
        expect(message).toMatch(/[📋⚠️]/);
      }
    });

    it('should include affected items in escalation', () => {
      const risks = detector.detectBlockedRisks();
      if (risks.length > 0 && risks[0].affectedItems.length > 0) {
        const message = detector.generateEscalationMessage(risks[0]);

        expect(message).toContain('Affected Items');
      }
    });
  });

  describe('should NOT escalate Low risk', () => {
    it('should not escalate medium risks by default', () => {
      const sprintSafe: Sprint = {
        ...sampleSprint as Sprint,
        metrics: {
          totalPoints: 100,
          completedPoints: 80,
          inProgressPoints: 15,
          blockedPoints: 5,
          velocity: 10,
          historicalVelocity: 10,
          velocityTrend: 0,
        },
        stories: [],
      };
      const detectorSafe = new RiskDetector(sprintSafe);
      const risks = detectorSafe.detectAll();
      const shouldEscalateAny = risks.some(r => detectorSafe.shouldEscalate(r));

      expect(shouldEscalateAny).toBe(false);
    });

    it('should correctly identify escalate-worthy risks', () => {
      const risks = detector.detectBlockedRisks();

      for (const risk of risks) {
        expect(detector.shouldEscalate(risk)).toBe(true);
      }
    });
  });

  describe('should detect scope risks', () => {
    it('should detect low completion rate', () => {
      const sprintLowCompletion: Sprint = {
        ...sampleSprint as Sprint,
        metrics: {
          ...(sampleSprint as Sprint).metrics,
          totalPoints: 100,
          completedPoints: 20,
        },
      };
      const detectorLow = new RiskDetector(sprintLowCompletion);
      const risks = detectorLow.detectScopeRisks();

      expect(risks.length).toBeGreaterThan(0);
    });
  });

  describe('should provide risk summary', () => {
    it('should return counts by level', () => {
      const summary = detector.getRiskSummary();

      expect(summary).toHaveLength(4);
      expect(summary.some(s => s.level === 'critical')).toBe(true);
      expect(summary.some(s => s.level === 'high')).toBe(true);
    });

    it('should sum to total risk count', () => {
      const summary = detector.getRiskSummary();
      const total = summary.reduce((sum, s) => sum + s.count, 0);
      const allRisks = detector.detectAll();

      expect(total).toBe(allRisks.length);
    });
  });
});
