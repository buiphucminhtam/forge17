/**
 * Sample Mobile Tests
 * Example tests for iOS and Android apps
 */

import { test, expect } from '@playwright/test';

// ============ iOS Sample Tests ============

test.describe('iOS App - Sample Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to iOS simulator app
    await page.goto('app://com.example.app');
  });

  test('should login successfully', async ({ page }) => {
    // Enter email
    await page.locator('accessibilityId:emailInput').fill('test@example.com');
    
    // Enter password
    await page.locator('accessibilityId:passwordInput').fill('password123');
    
    // Tap login button
    await page.locator('accessibilityId:loginButton').tap();
    
    // Verify home screen
    await expect(page.locator('accessibilityId:homeScreen')).toBeVisible();
  });

  test('should handle keyboard input', async ({ page }) => {
    const searchField = page.locator('accessibilityId:searchField');
    await searchField.tap();
    
    await searchField.fill('search query');
    
    await page.keyboard.press('Enter');
    
    await expect(page.locator('accessibilityId:searchResults')).toBeVisible();
  });

  test('should scroll and load more content', async ({ page }) => {
    const list = page.locator('className:XCUIElementTypeTable');
    
    // Initial items
    const initialItems = await page.locator('className:XCUIElementTypeCell').count();
    expect(initialItems).toBeGreaterThan(0);
    
    // Scroll down
    await list.scrollDown();
    
    // Wait for more items
    await page.waitForTimeout(1000);
    
    const newItems = await page.locator('className:XCUIElementTypeCell').count();
    expect(newItems).toBeGreaterThanOrEqual(initialItems);
  });

  test('should handle swipe gestures', async ({ page }) => {
    // Swipe left on cell to reveal delete
    const cell = page.locator('className:XCUIElementTypeCell').first();
    await cell.swipe('left');
    
    // Tap delete button
    await page.locator('accessibilityId:deleteButton').tap();
    
    // Confirm deletion
    await page.locator('accessibilityId:confirmDelete').tap();
  });

  test('should work with alerts', async ({ page }) => {
    // Trigger alert
    await page.locator('accessibilityId:showAlertButton').tap();
    
    // Handle alert
    const alert = page.locator('className:XCUIElementTypeAlert');
    await expect(alert).toBeVisible();
    
    // Accept alert
    await page.locator('accessibilityId:alertAcceptButton').tap();
  });
});

// ============ Android Sample Tests ============

test.describe('Android App - Sample Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('app://com.example.app');
  });

  test('should login successfully', async ({ page }) => {
    // Enter email
    await page.locator('resourceId:com.example.app:id/emailInput').fill('test@example.com');
    
    // Enter password
    await page.locator('resourceId:com.example.app:id/passwordInput').fill('password123');
    
    // Tap login
    await page.locator('resourceId:com.example.app:id/loginButton').tap();
    
    // Verify home
    await expect(page.locator('resourceId:com.example.app:id/homeScreen')).toBeVisible();
  });

  test('should navigate using bottom navigation', async ({ page }) => {
    // Tap profile tab
    await page.locator('resourceId:com.example.app:id/navProfile').tap();
    
    await expect(page.locator('text:Profile')).toBeVisible();
    
    // Tap settings tab
    await page.locator('resourceId:com.example.app:id/navSettings').tap();
    
    await expect(page.locator('text:Settings')).toBeVisible();
  });

  test('should handle pull-to-refresh', async ({ page }) => {
    const list = page.locator('resourceId:com.example.app:id/recyclerView');
    
    // Pull to refresh
    await list.pullToRefresh();
    
    // Verify refresh indicator disappears
    await expect(page.locator('resourceId:com.example.app:id/refreshIndicator')).not.toBeVisible();
  });

  test('should work with context menus', async ({ page }) => {
    // Long press to open context menu
    const item = page.locator('resourceId:com.example.app:id/listItem').first();
    await item.click({ button: 'right' });
    
    // Verify context menu
    await expect(page.locator('text:Edit')).toBeVisible();
    await expect(page.locator('text:Delete')).toBeVisible();
  });

  test('should handle keyboard', async ({ page }) => {
    const input = page.locator('resourceId:com.example.app:id/searchInput');
    await input.tap();
    
    await input.fill('test');
    await page.keyboard.press('Search');
    
    await expect(page.locator('resourceId:com.example.app:id/searchResults')).toBeVisible();
  });
});

// ============ Hybrid App Tests ============

test.describe('Hybrid App - WebView Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('app://com.example.hybridapp');
  });

  test('should switch between native and WebView', async ({ page }) => {
    // Native element
    await expect(page.locator('accessibilityId:nativeHeader')).toBeVisible();
    
    // Switch to WebView
    await page.locator('accessibilityId:webContentButton').tap();
    
    // Switch context to WebView
    const contexts = page.context()['webkit' as keyof typeof page.context]?.() || [];
    
    // WebView element
    await expect(page.locator('css:#webview-content')).toBeVisible();
    
    // Switch back to native
    await page.locator('accessibilityId:backToNative').tap();
    
    await expect(page.locator('accessibilityId:nativeHeader')).toBeVisible();
  });
});

// ============ Cross-Platform Tests ============

test.describe('Cross-Platform Element Tests', () => {
  test('should find element with accessibility ID (cross-platform)', async ({ page }) => {
    // This works on both iOS and Android
    const loginButton = page.locator('accessibilityId:loginButton');
    
    await expect(loginButton).toBeVisible();
    await loginButton.tap();
  });

  test('should use platform-specific locators', async ({ page }) => {
    // iOS-specific
    const iosLocator = page.locator('classChain:**/XCUIElementTypeButton[label == "Login"]');
    
    // Android-specific
    const androidLocator = page.locator('resourceId:com.example.app:id/loginButton');
    
    // Cross-platform fallback
    const xpathLocator = page.locator('xpath=//button[contains(@id, "login")]');
    
    // Test would use appropriate locator based on platform
    const locator = process.platform === 'darwin' ? iosLocator : androidLocator;
    
    await expect(locator).toBeVisible();
  });
});
