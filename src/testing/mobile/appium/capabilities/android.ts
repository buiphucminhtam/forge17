/**
 * Android Capabilities
 * Device and app configurations for Android testing
 */

export interface AndroidDeviceConfig {
  name: string;
  udid?: string;
  platformVersion: string;
  orientation: 'PORTRAIT' | 'LANDSCAPE';
  deviceType: 'phone' | 'tablet';
  emulator: boolean;
  manufacturer: string;
  model: string;
  screenSize?: string;
  density?: string;
  hasNavigationBar: boolean;
  hasNotch: boolean;
}

export interface AndroidAppConfig {
  appPackage: string;
  appActivity: string;
  appPath?: string;
  appName?: string;
  version?: string;
  launchArgs?: string[];
  noReset?: boolean;
  fullReset?: boolean;
}

/**
 * Popular Android Devices
 */
export const ANDROID_DEVICES: Record<string, AndroidDeviceConfig> = {
  'Pixel 8 Pro': {
    name: 'Pixel 8 Pro',
    platformVersion: '14',
    orientation: 'PORTRAIT',
    deviceType: 'phone',
    emulator: false,
    manufacturer: 'Google',
    model: 'Pixel 8 Pro',
    screenSize: '6.7"',
    density: 'xxhdpi',
    hasNavigationBar: true,
    hasNotch: true,
  },
  'Pixel 8': {
    name: 'Pixel 8',
    platformVersion: '14',
    orientation: 'PORTRAIT',
    deviceType: 'phone',
    emulator: false,
    manufacturer: 'Google',
    model: 'Pixel 8',
    screenSize: '6.2"',
    density: 'xxhdpi',
    hasNavigationBar: true,
    hasNotch: true,
  },
  'Samsung Galaxy S24 Ultra': {
    name: 'Samsung Galaxy S24 Ultra',
    platformVersion: '14',
    orientation: 'PORTRAIT',
    deviceType: 'phone',
    emulator: false,
    manufacturer: 'Samsung',
    model: 'SM-S928B',
    screenSize: '6.8"',
    density: 'xxhdpi',
    hasNavigationBar: true,
    hasNotch: false,
  },
  'Samsung Galaxy A54': {
    name: 'Samsung Galaxy A54',
    platformVersion: '13',
    orientation: 'PORTRAIT',
    deviceType: 'phone',
    emulator: false,
    manufacturer: 'Samsung',
    model: 'SM-A546B',
    screenSize: '6.4"',
    density: 'xxhdpi',
    hasNavigationBar: true,
    hasNotch: true,
  },
  'Xiaomi 14': {
    name: 'Xiaomi 14',
    platformVersion: '14',
    orientation: 'PORTRAIT',
    deviceType: 'phone',
    emulator: false,
    manufacturer: 'Xiaomi',
    model: '24053PY09G',
    screenSize: '6.36"',
    density: 'xxhdpi',
    hasNavigationBar: true,
    hasNotch: true,
  },
  'Pixel 7 Emulator': {
    name: 'Pixel 7',
    platformVersion: '13',
    orientation: 'PORTRAIT',
    deviceType: 'phone',
    emulator: true,
    manufacturer: 'Google',
    model: 'sdk_gphone64',
    screenSize: '6.3"',
    density: 'xxhdpi',
    hasNavigationBar: true,
    hasNotch: true,
  },
  'Pixel Tablet': {
    name: 'Pixel Tablet',
    platformVersion: '14',
    orientation: 'PORTRAIT',
    deviceType: 'tablet',
    emulator: true,
    manufacturer: 'Google',
    model: 'sdk_tablet64',
    screenSize: '10.95"',
    density: 'xhdpi',
    hasNavigationBar: true,
    hasNotch: false,
  },
};

/**
 * Android Capabilities Builder
 */
export function buildAndroidCapabilities(
  device: AndroidDeviceConfig,
  app?: AndroidAppConfig
): Record<string, unknown> {
  const caps: Record<string, unknown> = {
    'platformName': 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': device.name,
    'appium:platformVersion': device.platformVersion,
    'appium:orientation': device.orientation,
    'appium:noReset': app?.noReset ?? true,
    'appium:fullReset': app?.fullReset ?? false,
    'appium:disableWindowAnimation': true,
    'appium:disableIdAutoAugment': false,
    'appium:skipUnlock': true,
    'appium:unlockType': 'fingerprint',
    'appium:skipLogcatCapture': false,
    'appium:意愿图elementResponseAttributes': 'text,rect,enabled,displayed,selected',
  };

  // Device manufacturer-specific
  if (device.manufacturer === 'Samsung') {
    caps['appium:samsungBrowserVersion'] = 'latest';
  }

  // Emulator settings
  if (device.emulator) {
    caps['appium:avd'] = device.name;
    caps['appium:avdLaunchTimeout'] = 120000;
    caps['appium:avdReadyTimeout'] = 120000;
    caps['appium:avdArgs'] = '-wipe-data';
    caps['appium:gpu'] = 'auto';
  }

  // Navigation bar handling
  if (!device.hasNavigationBar) {
    caps['appium:hidesKeyboardWithKeybaord'] = true;
  }

  // App configuration
  if (app) {
    if (app.appPath) {
      caps['appium:app'] = app.appPath;
    }
    if (app.appPackage) {
      caps['appium:appPackage'] = app.appPackage;
    }
    if (app.appActivity) {
      caps['appium:appActivity'] = app.appActivity;
    }
    if (app.launchArgs?.length) {
      caps['appium:appArguments'] = app.launchArgs.join(' ');
    }
  }

  return caps;
}

/**
 * Android-specific locators (UiAutomator2)
 */
export const ANDROID_LOCATOR_STRATEGIES = {
  // Priority order for Android
  primary: ['resource-id', 'accessibility id', 'text', 'class name', 'xpath'],
  
  // Android-specific selectors
  resourceId: (id: string) => `resource-id:${id}`,
  accessibilityId: (id: string) => `accessibility:${id}`,
  text: (text: string) => `text:${text}`,
  
  // Class names
  button: 'android.widget.Button',
  textField: 'android.widget.EditText',
  textView: 'android.widget.TextView',
  imageView: 'android.widget.ImageView',
  listView: 'android.widget.ListView',
  recyclerView: 'androidx.recyclerview.widget.RecyclerView',
  webView: 'android.webkit.WebView',
  switch: 'android.widget.Switch',
  checkBox: 'android.widget.CheckBox',
  radioButton: 'android.widget.RadioButton',
  seekBar: 'android.widget.SeekBar',
  
  // UiSelector patterns
  uiSelector: {
    resourceId: (id: string) => `resourceId("${id}")`,
    text: (text: string) => `text("${text}")`,
    textContains: (text: string) => `textContains("${text}")`,
    className: (className: string) => `className("${className}")`,
    description: (desc: string) => `description("${desc}")`,
    descriptionContains: (desc: string) => `descriptionContains("${desc}")`,
    index: (index: number) => `index(${index})`,
    instance: (instance: number) => `instance(${instance})`,
  },
};

/**
 * Android gestures
 */
export const ANDROID_GESTURES = {
  // UiAutomator2 gestures
  scroll: {
    direction: 'up' | 'down' | 'left' | 'right',
    startX?: number,
    startY?: number,
    endX?: number,
    endY?: number,
  },
  swipe: {
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    speed: number,
  },
  pinch: {
    mode: 'in' | 'out',
    element?: WebElement,
  },
  drag: {
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    speed: number,
  },
};

/**
 * Create UiSelector string
 */
export function createUiSelector(options: {
  resourceId?: string;
  text?: string;
  textContains?: string;
  className?: string;
  description?: string;
  index?: number;
  instance?: number;
  enabled?: boolean;
  clickable?: boolean;
}): string {
  const selectors: string[] = [];

  if (options.resourceId) {
    selectors.push(`resourceId("${options.resourceId}")`);
  }

  if (options.text) {
    selectors.push(`text("${options.text}")`);
  }

  if (options.textContains) {
    selectors.push(`textContains("${options.textContains}")`);
  }

  if (options.className) {
    selectors.push(`className("${options.className}")`);
  }

  if (options.description) {
    selectors.push(`description("${options.description}")`);
  }

  if (options.index !== undefined) {
    selectors.push(`index(${options.index})`);
  }

  if (options.instance !== undefined) {
    selectors.push(`instance(${options.instance})`);
  }

  if (options.enabled !== undefined) {
    selectors.push(`enabled(${options.enabled})`);
  }

  if (options.clickable !== undefined) {
    selectors.push(`clickable(${options.clickable})`);
  }

  return selectors.join('.');
}

/**
 * Android package.Activity patterns
 */
export const ACTIVITY_PATTERNS = {
  // Common launcher activities
  launcher: (pkg: string) => `.MainActivity`,
  
  // Activity patterns
  default: (pkg: string) => `${pkg}.MainActivity`,
  settings: (pkg: string) => `${pkg}.SettingsActivity`,
  login: (pkg: string) => `${pkg}.ui.LoginActivity`,
  splash: (pkg: string) => `${pkg}.SplashActivity`,
  
  // Deep link patterns
  deeplink: (scheme: string, host: string, path: string) => 
    `${scheme}://${host}${path}`,
};
