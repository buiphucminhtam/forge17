/**
 * SauceLabs Integration
 * SauceLabs device farm provider
 */

import type { Platform } from '../../appium/config';
import type { 
  IDeviceFarm, 
  FarmConfig, 
  DeviceInfo, 
  DeviceRequest, 
  SessionStatus 
} from './provider';

/**
 * SauceLabs Device Farm
 */
export class SauceLabsFarm implements IDeviceFarm {
  private config: FarmConfig;

  constructor(config: FarmConfig) {
    this.config = config;
  }

  getProvider() {
    return 'saucelabs' as const;
  }

  getConfig(): FarmConfig {
    return { ...this.config };
  }

  async getCapabilities(device: DeviceRequest): Promise<Record<string, unknown>> {
    const caps: Record<string, unknown> = {
      'username': this.config.username,
      'accessKey': this.config.accessKey,
      'platformName': device.platform,
      'appiumVersion': '2.0',
      'derivedDataPath': '/tmp/derived_data',
    };

    if (device.deviceName) {
      caps['deviceName'] = device.deviceName;
    }

    if (device.osVersion) {
      caps['os_version'] = device.osVersion;
    }

    if (device.orientation) {
      caps['orientation'] = device.orientation;
    }

    if (device.realDevice !== undefined) {
      caps['realDevice'] = device.realDevice;
    }

    return caps;
  }

  async getAvailableDevices(): Promise<DeviceInfo[]> {
    const url = `https://api.us-west-1.saucelabs.com/rest/v1.1/devices?available=true`;

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.config.username}:${this.config.accessKey}`).toString('base64')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`SauceLabs API error: ${response.status}`);
      }

      const data = await response.json();
      return this.mapDevices(data.devices || []);
    } catch (error) {
      console.error('Failed to fetch SauceLabs devices:', error);
      return this.getDefaultDevices();
    }
  }

  private mapDevices(devices: Record<string, unknown>[]): DeviceInfo[] {
    return devices.map((d: Record<string, unknown>) => ({
      id: d.id as string,
      name: d.name as string,
      platform: d.os as string === 'iOS' ? 'iOS' : 'Android',
      osVersion: d.os_version as string,
      screenSize: '',
      isAvailable: d.status as string === 'available',
      isRealDevice: !(d.long_name as string)?.includes('Simulator'),
      pricePerMinute: d.price_per_minute as number,
    }));
  }

  private getDefaultDevices(): DeviceInfo[] {
    return [
      { id: 'iphone_15_pro_sim', name: 'iPhone 15 Pro Simulator', platform: 'iOS', osVersion: '17', screenSize: '6.1"', isAvailable: true, isRealDevice: false },
      { id: 'iphone_15_sim', name: 'iPhone 15 Simulator', platform: 'iOS', osVersion: '17', screenSize: '6.1"', isAvailable: true, isRealDevice: false },
      { id: 'pixel_8_pro_real', name: 'Google Pixel 8 Pro', platform: 'Android', osVersion: '14', screenSize: '6.7"', isAvailable: true, isRealDevice: true },
      { id: 'pixel_8_real', name: 'Google Pixel 8', platform: 'Android', osVersion: '14', screenSize: '6.2"', isAvailable: true, isRealDevice: true },
      { id: 'galaxy_s24_real', name: 'Samsung Galaxy S24', platform: 'Android', osVersion: '14', screenSize: '6.2"', isAvailable: true, isRealDevice: true },
    ];
  }

  async createSession(capabilities: Record<string, unknown>): Promise<string> {
    const sessionId = `sl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    return sessionId;
  }

  async deleteSession(sessionId: string): Promise<void> {
    // SauceLabs handles session cleanup automatically
  }

  async getSessionStatus(sessionId: string): Promise<SessionStatus> {
    return {
      id: sessionId,
      status: 'running',
      deviceId: '',
      deviceName: '',
      startedAt: Date.now(),
    };
  }
}

/**
 * SauceLabs-specific capabilities
 */
export const SAUCELABS_CAPS = {
  // Performance
  'performance': true,
  'sauceAdf': true,
  
  // Video & Logging
  'videoCapture': true,
  'extendedDebugging': true,
  'capturePerformance': true,
  
  // Timeouts
  'maxDuration': 3600,
  'commandTimeout': 300,
  'idleTimeout': 90,
  
  // Network
  'sauce:options': {
    'networkThrottle': false,
    'reload': true,
  },
};

/**
 * Create SauceLabs capabilities
 */
export function createSauceLabsCaps(
  device: DeviceRequest,
  options?: {
    projectName?: string;
    buildName?: string;
    sessionName?: string;
  }
): Record<string, unknown> {
  return {
    'username': process.env.SAUCE_USERNAME,
    'accessKey': process.env.SAUCE_ACCESS_KEY,
    'platformName': device.platform,
    'appiumVersion': '2.0',
    ...SAUCELABS_CAPS,
    ...options,
  };
}

/**
 * SauceLabs Data Center endpoints
 */
export const SAUCELABS_DATACENTERS = {
  'us-west': 'ondemand.saucelabs.com',
  'us-east': 'ondemand.us-east-1.saucelabs.com',
  'eu-central': 'ondemand.eu-central-1.saucelabs.com',
};
