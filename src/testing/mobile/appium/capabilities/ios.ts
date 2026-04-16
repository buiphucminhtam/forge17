/**
 * iOS Capabilities
 * Device and app configurations for iOS testing
 */

export interface iOSDeviceConfig {
  name: string;
  udid?: string;
  platformVersion: string;
  orientation: 'PORTRAIT' | 'LANDSCAPE';
  deviceType: 'iphone' | 'ipad';
  simulator: boolean;
  safeArea?: boolean;
  hasNotch: boolean;
  homeIndicator: boolean;
}

export interface iOSAppConfig {
  bundleId: string;
  appPath?: string;
  appName?: string;
  version?: string;
  launchArgs?: string[];
  launchEnv?: Record<string, string>;
}

/**
 * Popular iOS Devices
 */
export const IOS_DEVICES: Record<string, iOSDeviceConfig> = {
  'iPhone 15 Pro Max': {
    name: 'iPhone 15 Pro Max',
    platformVersion: '17.0',
    orientation: 'PORTRAIT',
    deviceType: 'iphone',
    simulator: true,
    safeArea: true,
    hasNotch: true,
    homeIndicator: false,
  },
  'iPhone 15 Pro': {
    name: 'iPhone 15 Pro',
    platformVersion: '17.0',
    orientation: 'PORTRAIT',
    deviceType: 'iphone',
    simulator: true,
    safeArea: true,
    hasNotch: true,
    homeIndicator: false,
  },
  'iPhone 15': {
    name: 'iPhone 15',
    platformVersion: '17.0',
    orientation: 'PORTRAIT',
    deviceType: 'iphone',
    simulator: true,
    safeArea: true,
    hasNotch: true,
    homeIndicator: false,
  },
  'iPhone 14 Pro Max': {
    name: 'iPhone 14 Pro Max',
    platformVersion: '16.0',
    orientation: 'PORTRAIT',
    deviceType: 'iphone',
    simulator: true,
    safeArea: true,
    hasNotch: true,
    homeIndicator: false,
  },
  'iPhone SE (3rd gen)': {
    name: 'iPhone SE (3rd gen)',
    platformVersion: '16.0',
    orientation: 'PORTRAIT',
    deviceType: 'iphone',
    simulator: true,
    safeArea: false,
    hasNotch: false,
    homeIndicator: true,
  },
  'iPad Pro 12.9': {
    name: 'iPad Pro 12.9',
    platformVersion: '17.0',
    orientation: 'PORTRAIT',
    deviceType: 'ipad',
    simulator: true,
    safeArea: true,
    hasNotch: false,
    homeIndicator: true,
  },
};

/**
 * iOS Capabilities Builder
 */
export function buildIOSCapabilities(
  device: iOSDeviceConfig,
  app?: iOSAppConfig
): Record<string, unknown> {
  const caps: Record<string, unknown> = {
    'platformName': 'iOS',
    'appium:automationName': 'XCUITest',
    'appium:deviceName': device.name,
    'appium:platformVersion': device.platformVersion,
    'appium:orientation': device.orientation,
    'appium:useNewWDA': true,
    'appium:wdaLaunchTimeout': 120000,
    'appium:wdaConnectionTimeout': 60000,
    'appium:waitForQuiescence': false,
    'appium:disableSafariInitialFocus': true,
    'appium:safariShowStatusBar': false,
    'appium:safariIgnoreFavicon': true,
  };

  // Device-specific settings
  if (device.simulator) {
    caps['appium: simulatorTraceTemplatePath'] = undefined;
    caps['appium: enforceStrictCapsCollection'] = false;
  }

  // Safe area handling
  if (device.safeArea) {
    caps['appium: safeArea'] = true;
  }

  // Notched devices
  if (device.hasNotch) {
    caps['appium: notch'] = true;
  }

  // App configuration
  if (app) {
    if (app.appPath) {
      caps['appium:app'] = app.appPath;
    }
    if (app.bundleId) {
      caps['appium:bundleId'] = app.bundleId;
    }
    if (app.launchArgs?.length) {
      caps['appium: appArguments'] = app.launchArgs.join(' ');
    }
    if (app.launchEnv) {
      caps['appium: appEnvironment'] = app.launchEnv;
    }
  }

  return caps;
}

/**
 * iOS-specific locators (XCUITest)
 */
export const IOS_LOCATOR_STRATEGIES = {
  // Priority order for iOS
  primary: ['accessibility id', 'class chain', 'xpath'],
  
  // iOS-specific selectors
  accessibilityId: (id: string) => `accessibility id:${id}`,
  classChain: (predicate: string) => `**/${predicate}`,
  
  // Class names
  button: 'XCUIElementTypeButton',
  textField: 'XCUIElementTypeTextField',
  staticText: 'XCUIElementTypeStaticText',
  cell: 'XCUIElementTypeCell',
  tabBar: 'XCUIElementTypeTabBar',
  navigationBar: 'XCUIElementTypeNavigationBar',
  scrollView: 'XCUIElementTypeScrollView',
  switch: 'XCUIElementTypeSwitch',
  slider: 'XCUIElementTypeSlider',
  
  // Common predicates
  predicates: {
    visible: 'visible == true',
    enabled: 'enabled == true',
    label: (label: string) => `label == "${label}"`,
    value: (value: string) => `value == "${value}"`,
    containsLabel: (text: string) => `label CONTAINS "${text}"`,
    containsValue: (text: string) => `value CONTAINS "${text}"`,
  },
};

/**
 * iOS gestures
 */
export const IOS_GESTURES = {
  // XCUITest-specific gestures
  scroll: {
    direction: 'down' | 'up' | 'left' | 'right',
    distance: number,
  },
  swipe: {
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    velocity: number,
  },
  pinch: {
    scale: number,
    velocity: number,
  },
  doubleTap: {
    x: number,
    y: number,
  },
  forceTouch: {
    x: number,
    y: number,
    pressure: number,
  },
};

/**
 * Create class chain locator
 */
export function createClassChainLocator(options: {
  type?: string;
  visible?: boolean;
  enabled?: boolean;
  label?: string;
  value?: string;
  index?: number;
}): string {
  const parts: string[] = [];

  if (options.type) {
    parts.push(`XCUIElementType${options.type}`);
  } else {
    parts.push('XCUIElementTypeAny');
  }

  const predicates: string[] = [];

  if (options.visible !== undefined) {
    predicates.push(`visible == ${options.visible}`);
  }

  if (options.enabled !== undefined) {
    predicates.push(`enabled == ${options.enabled}`);
  }

  if (options.label) {
    predicates.push(`label == "${options.label}"`);
  }

  if (options.value) {
    predicates.push(`value == "${options.value}"`);
  }

  if (predicates.length > 0) {
    parts.push(`[${predicates.join(' AND ')}]`);
  }

  if (options.index !== undefined) {
    parts.push(`[${options.index}]`);
  }

  return parts.join('');
}
