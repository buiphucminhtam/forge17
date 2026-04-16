/**
 * Parallel Execution
 * Run mobile tests across multiple devices in parallel
 */

import type { DeviceConfig } from '../visual/device-matrix';
import type { DeviceRequest } from './provider';

export interface ParallelConfig {
  maxWorkers: number;
  retryFailed: boolean;
  maxRetries: number;
  stopOnFirstFailure: boolean;
  generateReport: boolean;
}

const DEFAULT_CONFIG: ParallelConfig = {
  maxWorkers: 5,
  retryFailed: true,
  maxRetries: 2,
  stopOnFirstFailure: false,
  generateReport: true,
};

export interface ParallelResult {
  deviceName: string;
  passed: boolean;
  duration: number;
  attempts: number;
  error?: string;
  screenshots?: string[];
}

export interface ParallelExecutionReport {
  total: number;
  passed: number;
  failed: number;
  totalDuration: number;
  results: ParallelResult[];
  deviceBreakdown: Record<string, { passed: number; failed: number }>;
}

/**
 * Parallel Test Runner
 * Executes tests on multiple devices simultaneously
 */
export class ParallelTestRunner {
  private config: ParallelConfig;

  constructor(config: Partial<ParallelConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Execute tests in parallel
   */
  async execute<T>(
    devices: DeviceConfig[],
    testFn: (device: DeviceConfig) => Promise<T>,
    options?: {
      onDeviceStart?: (device: DeviceConfig) => void;
      onDeviceComplete?: (device: DeviceConfig, result: T) => void;
      onDeviceError?: (device: DeviceConfig, error: Error) => void;
    }
  ): Promise<ParallelResult[]> {
    const results: ParallelResult[] = [];
    const deviceQueue = [...devices];
    const running: Promise<void>[] = [];

    // Create worker pool
    for (let i = 0; i < Math.min(this.config.maxWorkers, devices.length); i++) {
      running.push(this.worker(deviceQueue, results, testFn, options));
    }

    // Wait for all workers to complete
    await Promise.all(running);

    return results;
  }

  /**
   * Worker function
   */
  private async worker<T>(
    queue: DeviceConfig[],
    results: ParallelResult[],
    testFn: (device: DeviceConfig) => Promise<T>,
    options?: {
      onDeviceStart?: (device: DeviceConfig) => void;
      onDeviceComplete?: (device: DeviceConfig, result: T) => void;
      onDeviceError?: (device: DeviceConfig, error: Error) => void;
    }
  ): Promise<void> {
    while (queue.length > 0) {
      const device = queue.shift();
      if (!device) break;

      const startTime = Date.now();
      let attempts = 0;
      let lastError: Error | undefined;

      options?.onDeviceStart?.(device);

      // Retry logic
      while (attempts <= this.config.maxRetries) {
        attempts++;

        try {
          const result = await testFn(device);
          options?.onDeviceComplete?.(device, result);

          results.push({
            deviceName: device.name,
            passed: true,
            duration: Date.now() - startTime,
            attempts,
          });

          break;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error('Unknown error');
          options?.onDeviceError?.(device, lastError);

          if (attempts > this.config.maxRetries) {
            results.push({
              deviceName: device.name,
              passed: false,
              duration: Date.now() - startTime,
              attempts,
              error: lastError.message,
            });

            if (this.config.stopOnFirstFailure) {
              // Clear remaining queue
              queue.length = 0;
              break;
            }
          }
        }
      }
    }
  }

  /**
   * Generate execution report
   */
  generateReport(results: ParallelResult[]): ParallelExecutionReport {
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

    // Device breakdown
    const breakdown: Record<string, { passed: number; failed: number }> = {};
    for (const result of results) {
      if (!breakdown[result.deviceName]) {
        breakdown[result.deviceName] = { passed: 0, failed: 0 };
      }
      if (result.passed) {
        breakdown[result.deviceName].passed++;
      } else {
        breakdown[result.deviceName].failed++;
      }
    }

    return {
      total: results.length,
      passed,
      failed,
      totalDuration,
      results,
      deviceBreakdown: breakdown,
    };
  }

  /**
   * Get configuration
   */
  getConfig(): ParallelConfig {
    return { ...this.config };
  }
}

/**
 * Device Request Queue
 * Manages device requests for optimal allocation
 */
export class DeviceRequestQueue {
  private queue: DeviceRequest[] = [];
  private allocated: Map<string, string> = new Map();  // device -> sessionId

  /**
   * Add device request
   */
  enqueue(request: DeviceRequest): void {
    this.queue.push(request);
  }

  /**
   * Get next available device
   */
  dequeue(): DeviceRequest | undefined {
    return this.queue.shift();
  }

  /**
   * Allocate device
   */
  allocate(deviceId: string, sessionId: string): void {
    this.allocated.set(deviceId, sessionId);
  }

  /**
   * Release device
   */
  release(deviceId: string): void {
    this.allocated.delete(deviceId);
  }

  /**
   * Get queue size
   */
  size(): number {
    return this.queue.length;
  }

  /**
   * Get allocated count
   */
  allocatedCount(): number {
    return this.allocated.size;
  }

  /**
   * Clear queue
   */
  clear(): void {
    this.queue = [];
    this.allocated.clear();
  }
}
