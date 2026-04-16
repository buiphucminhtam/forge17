# Mobile Testing Infrastructure

## Directory Structure

```
src/testing/mobile/
├── appium/
│   ├── config.ts              # Appium configuration
│   ├── capabilities/
│   │   ├── ios.ts            # iOS capabilities
│   │   ├── android.ts        # Android capabilities
│   │   └── index.ts          # Capability exports
│   ├── driver/
│   │   ├── manager.ts        # Driver lifecycle
│   │   ├── session.ts        # Session management
│   │   └── pool.ts           # Driver pool
│   └── locator/
│       ├── strategies.ts      # Locator strategies
│       ├── mobile-locator.ts # Mobile locator class
│       └── finder.ts         # Element finder
├── healing/
│   ├── mobile-5d/
│   │   ├── fingerprint.ts    # Mobile 5D fingerprint
│   │   ├── similarity.ts     # Mobile similarity scoring
│   │   └── healing.ts       # Mobile healing engine
│   └── cache/
│       └── element-cache.ts   # Mobile element cache
├── agents/
│   ├── mobile-test-pilot.ts # Mobile UI testing
│   ├── mobile-healer.ts      # Mobile self-healing
│   ├── gesture-agent.ts      # Touch gesture handling
│   └── committee.ts          # Mobile committee
├── visual/
│   ├── capture.ts            # Screenshot capture
│   ├── device-matrix.ts      # Multi-device testing
│   └── diff.ts               # Visual diff
├── farm/
│   ├── provider.ts           # Farm abstraction
│   ├── browserstack.ts       # BrowserStack integration
│   ├── saucelabs.ts          # SauceLabs integration
│   └── scheduler.ts           # Device scheduling
├── tests/
│   ├── ios/
│   ├── android/
│   └── sample/
└── index.ts                  # Main exports
```

## Quick Reference

| Platform | Locator | Priority |
|----------|---------|----------|
| iOS | accessibilityId | 1st |
| iOS | class chain | 2nd |
| iOS | XPath | 3rd |
| Android | resourceId | 1st |
| Android | accessibilityId | 2nd |
| Android | XPath | 3rd |

## Environment Variables

```bash
# Appium
APPIUM_HOST=localhost
APPIUM_PORT=4723

# BrowserStack
BROWSERSTACK_USERNAME=
BROWSERSTACK_ACCESS_KEY=

# SauceLabs
SAUCE_USERNAME=
SAUCE_ACCESS_KEY=

# Device
PLATFORM=iOS|Android
DEVICE_NAME=iPhone 15|Pixel 8
```
