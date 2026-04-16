/**
 * BrowserStack Integration
 * BrowserStack device farm provider
 */

import type { Platform } from '../../appium/config';
import type { 
  IDeviceFarm, 
  FarmConfig, 
  DeviceInfo, 
  DeviceRequest, 
  SessionStatus,
  FarmCapabilities 
} from './provider';

/**
 * BrowserStack Device Farm
 */
export class BrowserStackFarm implements IDeviceFarm {
  private config: FarmConfig;

  constructor(config: FarmConfig) {
    this.config = config;
  }

  getProvider() {
    return 'browserstack' as const;
  }

  getConfig(): FarmConfig {
    return { ...this.config };
  }

  async getCapabilities(device: DeviceRequest): Promise<Record<string, unknown>> {
    const caps: Record<string, unknown> = {
      'browserstack.user': this.config.username,
      'browserstack.key': this.config.accessKey,
      'browserstack.source': 'forgewright',
      'browserstack.local': false,
      'browserstack.debug': true,
      'browserstack.video': true,
      'platformName': device.platform,
      'deviceOrientation': device.orientation || 'portrait',
    };

    if (device.deviceName) {
      caps['browserstack.device'] = device.deviceName;
    }

    if (device.osVersion) {
      // BrowserStack uses different key for OS version
      if (device.platform === 'iOS') {
        caps['os_version'] = device.osVersion;
      } else {
        caps['os_version'] = device.osVersion;
      }
    }

    if (device.realDevice !== undefined) {
      caps['browserstack.realMobile'] = device.realDevice;
    }

    return caps;
  }

  async getAvailableDevices(): Promise<DeviceInfo[]> {
    // BrowserStack API endpoint
    const url = `https://api.browserstack.com/automate/plan`;

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.config.username}:${this.config.accessKey}`).toString('base64')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`BrowserStack API error: ${response.status}`);
      }

      const data = await response.json();

      // Map BrowserStack devices to our format
      return this.mapDevices(data.automate_plan?.devices || []);
    } catch (error) {
      console.error('Failed to fetch BrowserStack devices:', error);
      return this.getDefaultDevices();
    }
  }

  private mapDevices(devices: Record<string, unknown>[]): DeviceInfo[] {
    return devices.map((d: Record<string, unknown>) => ({
      id: d.os as string + '_' + d.device as string,
      name: d.device as string,
      platform: this.mapPlatform(d.os as string),
      osVersion: d.os_version as string,
      screenSize: '',
      isAvailable: d.available as boolean ?? true,
      isRealDevice: true,
      pricePerMinute: d.price_per_minute as number,
    }));
  }

  private mapPlatform(os: string): Platform {
    if (os.toLowerCase().includes('ios')) return 'iOS';
    return 'Android';
  }

  private getDefaultDevices(): DeviceInfo[] {
    return [
      { id: 'ios_iphone15pro', name: 'iPhone 15 Pro', platform: 'iOS', osVersion: '17', screenSize: '6.1"', isAvailable: true, isRealDevice: true },
      { id: 'ios_iphone15', name: 'iPhone 15', platform: 'iOS', osVersion: '17', screenSize: '6.1"', isAvailable: true, isRealDevice: true },
      { id: 'android_pixel8pro', name: 'Pixel 8 Pro', platform: 'Android', osVersion: '14', screenSize: '6.7"', isAvailable: true, isRealDevice: true },
      { id: 'android_pixel8', name: 'Pixel 8', platform: 'Android', osVersion: '14', screenSize: '6.2"', isAvailable: true, isRealDevice: true },
      { id: 'android_samsungs24ultra', name: 'Samsung Galaxy S24 Ultra', platform: 'Android', osVersion: '14', screenSize: '6.8"', isAvailable: true, isRealDevice: true },
    ];
  }

  async createSession(capabilities: Record<string, unknown>): Promise<string> {
    const sessionId = `bs_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    return sessionId;
  }

  async deleteSession(sessionId: string): Promise<void> {
    // BrowserStack handles session cleanup automatically
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
 * BrowserStack-specific capabilities
 */
export const BROWSERSTACK_CAPS = {
  // Video & Debugging
  'browserstack.video': true,
  'browserstack.debug': true,
  'browserstack.networkLogs': true,
  'browserstack.performance': true,
  
  // Timeouts
  'browserstack.timezone': 'UTC',
  'browserstack.acceptSslCerts': true,
  
  // Local Testing
  'browserstack.local': false,
  
  // Resolution
  'browserstack.resolution': '1920x1080',
  
  // Customization
  'browserstack.deviceLogs': true,
  'browserstack.consoleLogs': 'verbose',
};

/**
 * Create BrowserStack capabilities
 */
export function createBrowserStackCaps(
  device: DeviceRequest,
  options?: {
    projectName?: string;
    buildName?: string;
    sessionName?: string;
    local?: boolean;
  }
): Record<string, unknown> {
  return {
    'browserstack.user': process.env.BROWSERSTACK_USERNAME,
    'browserstack.key': process.env.BROWSERSTACK_ACCESS_KEY,
    'browserstack.source': 'forgewright',
    'platformName': device.platform,
    'deviceOrientation': device.orientation || 'portrait',
    ...BROWSERSTACK_CAPS,
    ...options,
  };
}
