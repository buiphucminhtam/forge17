/**
 * Device Farm Provider
 * Unified interface for cloud device farms
 */

import type { Platform } from '../../appium/config';

export type FarmProvider = 'browserstack' | 'saucelabs' | 'aws-device-farm' | 'firebase-test-lab';

export interface FarmCapabilities {
  provider: FarmProvider;
  browserVersion?: string;
  deviceName?: string;
  osVersion?: string;
  deviceOrientation?: 'portrait' | 'landscape';
  realDevice?: boolean;
}

export interface FarmConfig {
  provider: FarmProvider;
  username: string;
  accessKey: string;
  serverUrl: string;
  timeout: number;
  retryAttempts: number;
}

/**
 * Device Farm Provider Interface
 */
export interface IDeviceFarm {
  getProvider(): FarmProvider;
  
  getConfig(): FarmConfig;
  
  getCapabilities(device: DeviceRequest): Promise<Record<string, unknown>>;
  
  getAvailableDevices(): Promise<DeviceInfo[]>;
  
  createSession(capabilities: Record<string, unknown>): Promise<string>;
  
  deleteSession(sessionId: string): Promise<void>;
  
  getSessionStatus(sessionId: string): Promise<SessionStatus>;
}

export interface DeviceRequest {
  platform: Platform;
  deviceName?: string;
  osVersion?: string;
  realDevice?: boolean;
  orientation?: 'portrait' | 'landscape';
}

export interface DeviceInfo {
  id: string;
  name: string;
  platform: Platform;
  osVersion: string;
  screenSize: string;
  isAvailable: boolean;
  isRealDevice: boolean;
  pricePerMinute?: number;
}

export interface SessionStatus {
  id: string;
  status: 'running' | 'completed' | 'failed' | 'error';
  deviceId: string;
  deviceName: string;
  startedAt: number;
  duration?: number;
  error?: string;
}

/**
 * Device Farm Manager
 * Manages multiple farm providers
 */
export class DeviceFarmManager {
  private farms: Map<FarmProvider, IDeviceFarm> = new Map();

  /**
   * Register farm provider
   */
  register(provider: IDeviceFarm): void {
    this.farms.set(provider.getProvider(), provider);
  }

  /**
   * Get farm by provider
   */
  getFarm(provider: FarmProvider): IDeviceFarm | undefined {
    return this.farms.get(provider);
  }

  /**
   * Get all registered farms
   */
  getAllFarms(): FarmProvider[] {
    return Array.from(this.farms.keys());
  }

  /**
   * Get available devices from all farms
   */
  async getAvailableDevices(
    platform?: Platform
  ): Promise<{ provider: FarmProvider; devices: DeviceInfo[] }[]> {
    const results: { provider: FarmProvider; devices: DeviceInfo[] }[] = [];

    for (const [provider, farm] of this.farms) {
      try {
        const devices = await farm.getAvailableDevices();
        
        const filtered = platform
          ? devices.filter(d => d.platform === platform)
          : devices;

        results.push({ provider, devices: filtered });
      } catch (error) {
        console.error(`Failed to get devices from ${provider}:`, error);
      }
    }

    return results;
  }

  /**
   * Find best available device
   */
  async findBestDevice(
    platform: Platform,
    osVersion?: string
  ): Promise<{ farm: FarmProvider; device: DeviceInfo } | null> {
    const available = await this.getAvailableDevices(platform);

    for (const { provider, devices } of available) {
      for (const device of devices) {
        if (!device.isAvailable) continue;
        
        if (osVersion && device.osVersion !== osVersion) continue;

        return { farm: provider, device };
      }
    }

    return null;
  }

  /**
   * Create farm config from environment
   */
  static createConfig(provider: FarmProvider): FarmConfig {
    switch (provider) {
      case 'browserstack':
        return {
          provider,
          username: process.env.BROWSERSTACK_USERNAME || '',
          accessKey: process.env.BROWSERSTACK_ACCESS_KEY || '',
          serverUrl: 'http://hub.browserstack.com/wd/hub',
          timeout: 300000,
          retryAttempts: 3,
        };
      case 'saucelabs':
        return {
          provider,
          username: process.env.SAUCE_USERNAME || '',
          accessKey: process.env.SAUCE_ACCESS_KEY || '',
          serverUrl: `http://${process.env.SAUCE_USERNAME || ''}:${process.env.SAUCE_ACCESS_KEY || ''}@ondemand.saucelabs.com:443/wd/hub`,
          timeout: 300000,
          retryAttempts: 3,
        };
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }
}
