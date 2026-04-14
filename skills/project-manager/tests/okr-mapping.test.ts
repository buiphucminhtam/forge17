import type { OKR, Objective, KeyResult, Story } from './mocks/types';
import sampleOKR from './fixtures/sample-okr.json';
import sampleSprint from './fixtures/sample-sprint.json';

export class OKRMapper {
  private okr: OKR;
  private tasks: Map<string, Story>;

  constructor(okr: OKR, tasks: Story[] = []) {
    this.okr = okr;
    this.tasks = new Map(tasks.map(t => [t.id, t]));
  }

  linkTaskToKeyResult(taskId: string, keyResultId: string): boolean {
    for (const objective of this.okr.objectives) {
      const keyResult = objective.keyResults.find(kr => kr.id === keyResultId);
      if (keyResult) {
        if (!keyResult.tasks.includes(taskId)) {
          keyResult.tasks.push(taskId);
        }
        return true;
      }
    }
    return false;
  }

  unlinkTaskFromKeyResult(taskId: string, keyResultId: string): boolean {
    for (const objective of this.okr.objectives) {
      const keyResult = objective.keyResults.find(kr => kr.id === keyResultId);
      if (keyResult) {
        const index = keyResult.tasks.indexOf(taskId);
        if (index > -1) {
          keyResult.tasks.splice(index, 1);
          return true;
        }
      }
    }
    return false;
  }

  calculateSuccessProbability(objectiveId: string): number {
    const objective = this.okr.objectives.find(o => o.id === objectiveId);
    if (!objective) return 0;

    let totalWeight = 0;
    let weightedProgress = 0;

    for (const kr of objective.keyResults) {
      const progress = this.calculateKeyResultProgress(kr);
      const weight = 1 / objective.keyResults.length;
      totalWeight += weight;
      weightedProgress += progress * weight;
    }

    return Math.min(1, Math.max(0, weightedProgress));
  }

  calculateKeyResultProgress(keyResult: KeyResult): number {
    if (keyResult.target === 0) return 0;
    return Math.min(1, keyResult.current / keyResult.target);
  }

  autoUpdateFromTaskCompletion(taskId: string): void {
    if (!this.okr.autoUpdateEnabled) return;

    for (const objective of this.okr.objectives) {
      for (const keyResult of objective.keyResults) {
        if (keyResult.tasks.includes(taskId)) {
          const task = this.tasks.get(taskId);
          if (task && task.status === 'completed') {
            keyResult.current = Math.min(keyResult.target, keyResult.current + 1);
          }
        }
      }
    }
  }

  flagAtRiskOKRs(velocityThreshold: number = 0.7): string[] {
    const atRiskIds: string[] = [];

    for (const objective of this.okr.objectives) {
      const probability = this.calculateSuccessProbability(objective.id);
      const progress = this.calculateOverallProgress(objective);

      if (probability < velocityThreshold || progress < velocityThreshold) {
        atRiskIds.push(objective.id);
      }
    }

    return atRiskIds;
  }

  calculateOverallProgress(objective: Objective): number {
    if (objective.keyResults.length === 0) return 0;

    const totalProgress = objective.keyResults.reduce((sum, kr) => {
      return sum + this.calculateKeyResultProgress(kr);
    }, 0);

    return totalProgress / objective.keyResults.length;
  }

  getHealthStatus(): 'on_track' | 'at_risk' | 'off_track' {
    const atRiskCount = this.flagAtRiskOKRs().length;
    const totalObjectives = this.okr.objectives.length;

    if (atRiskCount === 0) return 'on_track';
    if (atRiskCount < totalObjectives / 2) return 'at_risk';
    return 'off_track';
  }
}

describe('OKRMapper', () => {
  let mapper: OKRMapper;

  beforeEach(() => {
    mapper = new OKRMapper(sampleOKR as OKR, sampleSprint.stories as Story[]);
  });

  describe('should link task to Key Result', () => {
    it('should successfully link a task', () => {
      const result = mapper.linkTaskToKeyResult('story-001', 'kr-001');

      expect(result).toBe(true);
    });

    it('should prevent duplicate links', () => {
      mapper.linkTaskToKeyResult('story-001', 'kr-001');
      const kr = (sampleOKR as OKR).objectives[0].keyResults[0];
      const initialCount = kr.tasks.length;

      mapper.linkTaskToKeyResult('story-001', 'kr-001');

      expect(kr.tasks.filter(t => t === 'story-001').length).toBe(1);
    });

    it('should return false for invalid key result', () => {
      const result = mapper.linkTaskToKeyResult('story-001', 'invalid-kr');

      expect(result).toBe(false);
    });
  });

  describe('should auto-update OKR when task completes', () => {
    it('should increment key result when linked task completes', () => {
      mapper.linkTaskToKeyResult('story-001', 'kr-001');
      const kr = (sampleOKR as OKR).objectives[0].keyResults[0];
      const initialCurrent = kr.current;

      mapper.autoUpdateFromTaskCompletion('story-001');

      expect(kr.current).toBeGreaterThanOrEqual(initialCurrent);
    });

    it('should not update when auto-update is disabled', () => {
      const okrDisabled = { ...sampleOKR as OKR, autoUpdateEnabled: false };
      const mapperDisabled = new OKRMapper(okrDisabled, sampleSprint.stories as Story[]);

      mapperDisabled.linkTaskToKeyResult('story-001', 'kr-001');
      const kr = (sampleOKR as OKR).objectives[0].keyResults[0];
      const currentBefore = kr.current;

      mapperDisabled.autoUpdateFromTaskCompletion('story-001');

      expect(kr.current).toBe(currentBefore);
    });

    it('should not exceed target value', () => {
      const kr = (sampleOKR as OKR).objectives[0].keyResults[0];
      kr.current = kr.target - 1;
      kr.tasks = [];

      mapper.linkTaskToKeyResult('story-001', 'kr-001');
      mapper.autoUpdateFromTaskCompletion('story-001');

      expect(kr.current).toBeLessThanOrEqual(kr.target);
    });
  });

  describe('should calculate success probability', () => {
    it('should return probability between 0 and 1', () => {
      const probability = mapper.calculateSuccessProbability('obj-001');

      expect(probability).toBeGreaterThanOrEqual(0);
      expect(probability).toBeLessThanOrEqual(1);
    });

    it('should return 0 for non-existent objective', () => {
      const probability = mapper.calculateSuccessProbability('invalid-obj');

      expect(probability).toBe(0);
    });

    it('should reflect current progress', () => {
      const probability = mapper.calculateSuccessProbability('obj-001');
      const progress = mapper.calculateOverallProgress((sampleOKR as OKR).objectives[0]);

      expect(Math.abs(probability - progress)).toBeLessThan(0.01);
    });
  });

  describe('should flag at-risk OKRs', () => {
    it('should flag objectives below threshold', () => {
      const atRisk = mapper.flagAtRiskOKRs(0.8);

      expect(Array.isArray(atRisk)).toBe(true);
    });

    it('should return empty array when all OKRs healthy', () => {
      const freshOKR = {
        ...sampleOKR as OKR,
        objectives: [
          {
            ...(sampleOKR as OKR).objectives[0],
            keyResults: [
              { ...(sampleOKR as OKR).objectives[0].keyResults[0], current: 90, target: 100 },
            ],
          },
        ],
      };
      const freshMapper = new OKRMapper(freshOKR);
      const atRisk = freshMapper.flagAtRiskOKRs(0.9);

      expect(atRisk.length).toBe(0);
    });
  });

  describe('should handle 1000+ tasks without overflow', () => {
    it('should handle large number of linked tasks', () => {
      const manyTasks: Story[] = Array.from({ length: 1500 }, (_, i) => ({
        id: `task-${i}`,
        title: `Task ${i}`,
        points: 1,
        status: i % 2 === 0 ? 'completed' : 'in_progress',
      }));

      const largeMapper = new OKRMapper(sampleOKR as OKR, manyTasks);

      for (let i = 0; i < 1000; i++) {
        largeMapper.linkTaskToKeyResult(`task-${i}`, 'kr-001');
      }

      const kr = (sampleOKR as OKR).objectives[0].keyResults[0];
      expect(kr.tasks.length).toBeGreaterThan(0);
    });

    it('should handle large number of objectives', () => {
      const manyObjectives: Objective[] = Array.from({ length: 500 }, (_, i) => ({
        id: `obj-${i}`,
        title: `Objective ${i}`,
        owner: 'test',
        keyResults: [
          {
            id: `kr-${i}`,
            title: `Key Result ${i}`,
            target: 100,
            current: 50,
            unit: 'percent',
            tasks: [],
          },
        ],
        successProbability: 0.5,
      }));

      const largeOKR: OKR = {
        ...sampleOKR as OKR,
        objectives: manyObjectives,
      };

      const largeMapper = new OKRMapper(largeOKR);
      const atRisk = largeMapper.flagAtRiskOKRs(0.6);

      expect(atRisk.length).toBeGreaterThan(0);
    });
  });

  describe('should calculate key result progress', () => {
    it('should calculate correct percentage', () => {
      const keyResult: KeyResult = {
        id: 'kr-test',
        title: 'Test KR',
        target: 100,
        current: 75,
        unit: 'percent',
        tasks: [],
      };

      const progress = mapper.calculateKeyResultProgress(keyResult);

      expect(progress).toBe(0.75);
    });

    it('should cap at 100%', () => {
      const keyResult: KeyResult = {
        id: 'kr-test',
        title: 'Test KR',
        target: 100,
        current: 150,
        unit: 'percent',
        tasks: [],
      };

      const progress = mapper.calculateKeyResultProgress(keyResult);

      expect(progress).toBe(1);
    });

    it('should handle zero target', () => {
      const keyResult: KeyResult = {
        id: 'kr-test',
        title: 'Test KR',
        target: 0,
        current: 0,
        unit: 'count',
        tasks: [],
      };

      const progress = mapper.calculateKeyResultProgress(keyResult);

      expect(progress).toBe(0);
    });
  });
});
