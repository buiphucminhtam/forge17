/**
 * Appium Configuration
 * Mobile automation configuration and settings
 */

export type Platform = 'iOS' | 'Android';
export type AutomationType = 'XCUITest' | 'UiAutomator2' | 'Espresso';

export interface AppiumConfig {
  host: string;
  port: number;
  path: string;
  protocol: string;
  timeout: number;
  retryAttempts: number;
  screenshotPath: string;
  explicitWaitTimeout: number;
  implicitWaitTimeout: number;
  newCommandTimeout: number;
}

export const DEFAULT_CONFIG: AppiumConfig = {
  host: process.env.APPIUM_HOST || 'localhost',
  port: parseInt(process.env.APPIUM_PORT || '4723', 10),
  path: '/wd/hub',
  protocol: 'http',
  timeout: 30000,
  retryAttempts: 3,
  screenshotPath: './test-results/screenshots',
  explicitWaitTimeout: 30000,
  implicitWaitTimeout: 5000,
  newCommandTimeout: 300000,  // 5 minutes
};

/**
 * Build Appium URL
 */
export function buildAppiumURL(config: Partial<AppiumConfig> = {}): string {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  return `${cfg.protocol}://${cfg.host}:${cfg.port}${cfg.path}`;
}

/**
 * Get default capabilities for platform
 */
export function getDefaultCapabilities(platform: Platform): Record<string, unknown> {
  const common = {
    'appium:newCommandTimeout': DEFAULT_CONFIG.newCommandTimeout / 1000,
    'appium: screenshotQuality': 'original',
    'appium: screenshotWaitTimeout': 10,
    'appium: pageLoadStrategy': 'normal',
  };

  if (platform === 'iOS') {
    return {
      ...common,
      'platformName': 'iOS',
      'appium:automationName': 'XCUITest',
      'appium:deviceName': process.env.DEVICE_NAME || 'iPhone 15',
      'appium:platformVersion': process.env.IOS_VERSION || '17.0',
      'appium:orientation': 'PORTRAIT',
      'appium:noReset': true,
      'appium:fullReset': false,
    };
  }

  return {
    ...common,
    'platformName': 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': process.env.DEVICE_NAME || 'Pixel 8',
    'appium:platformVersion': process.env.ANDROID_VERSION || '14',
    'appium:orientation': 'PORTRAIT',
    'appium:noReset': true,
    'appium:autoGrantPermissions': true,
    'appium:disableWindowAnimation': true,
  };
}

/**
 * Create Appium options for WebDriver
 */
export function createAppiumOptions(
  platform: Platform,
  appPath?: string,
  additionalCaps: Record<string, unknown> = {}
): Record<string, unknown> {
  const caps = getDefaultCapabilities(platform);

  if (appPath) {
    caps['appium:app'] = appPath;
  }

  // Add bundle ID for iOS
  if (platform === 'iOS' && process.env.IOS_BUNDLE_ID) {
    caps['appium:bundleId'] = process.env.IOS_BUNDLE_ID;
  }

  // Add app package for Android
  if (platform === 'Android' && process.env.ANDROID_APP_PACKAGE) {
    caps['appium:appPackage'] = process.env.ANDROID_APP_PACKAGE;
    caps['appium:appActivity'] = process.env.ANDROID_APP_ACTIVITY || '.MainActivity';
  }

  return { ...caps, ...additionalCaps };
}

/**
 * Appium gesture settings
 */
export interface GestureSettings {
  scrollDuration: number;
  swipeDuration: number;
  tapDuration: number;
  longPressDuration: number;
  pinchScale: number;
  swipeVelocity: number;
}

export const DEFAULT_GESTURE_SETTINGS: GestureSettings = {
  scrollDuration: 500,
  swipeDuration: 300,
  tapDuration: 100,
  longPressDuration: 1000,
  pinchScale: 0.5,
  swipeVelocity: 2500,
};

/**
 * Timeouts configuration
 */
export interface TimeoutSettings {
  explicit: number;
  implicit: number;
  script: number;
  pageLoad: number;
}

export const DEFAULT_TIMEOUTS: TimeoutSettings = {
  explicit: 30000,
  implicit: 5000,
  script: 30000,
  pageLoad: 30000,
};
