/**
 * Capabilities Index
 * Unified export for iOS and Android capabilities
 */

export { buildIOSCapabilities, IOS_DEVICES, IOS_LOCATOR_STRATEGIES, IOS_GESTURES, createClassChainLocator } from './ios';
export { buildAndroidCapabilities, ANDROID_DEVICES, ANDROID_LOCATOR_STRATEGIES, ANDROID_GESTURES, createUiSelector, ACTIVITY_PATTERNS } from './android';

import type { iOSDeviceConfig, iOSAppConfig } from './ios';
import type { AndroidDeviceConfig, AndroidAppConfig } from './android';

export type { iOSDeviceConfig, iOSAppConfig };
export type { AndroidDeviceConfig, AndroidAppConfig };
