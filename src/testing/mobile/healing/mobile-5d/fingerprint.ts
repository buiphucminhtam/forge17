/**
 * Mobile 5D Element Model
 * Multi-dimensional element identification for mobile apps
 * 
 * Based on web 5D model but adapted for mobile:
 * - Dimension 1: Mobile-specific attributes
 * - Dimension 2: Visual (device-aware)
 * - Dimension 3: Accessibility
 * - Dimension 4: State & Interactions
 * - Dimension 5: Content
 */

export interface MobileAttributes {
  // iOS
  accessibilityId?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  
  // Android
  resourceId?: string;
  contentDesc?: string;
  
  // Common
  className?: string;
  packageName?: string;
  bundleId?: string;
  
  // Hierarchical
  index?: number;
  parent?: string;
  childCount?: number;
}

export interface MobileVisual {
  // Device-aware dimensions
  width: number;
  height: number;
  
  // Position
  x: number;
  y: number;
  centerX: number;
  centerY: number;
  
  // Screen-relative (accounts for notch, nav bar)
  screenX: number;
  screenY: number;
  
  // Safe area awareness
  inSafeAreaTop: boolean;
  inSafeAreaBottom: boolean;
  inSafeAreaLeft: boolean;
  inSafeAreaRight: boolean;
  
  // Visual properties
  alpha: number;
  backgroundColor?: string;
  
  // Orientation-aware
  orientation: 'portrait' | 'landscape';
}

export interface MobileAccessibility {
  // iOS
  isAccessibilityElement: boolean;
  accessibilityElementsHidden: boolean;
  
  // Android
  enabledForAccessibility: boolean;
  
  // Semantic
  contentDescription?: string;
  hint?: string;
  stateDescription?: string;
  
  // Role-based
  role?: 'button' | 'link' | 'image' | 'text' | 'checkbox' | 'radio' | 'switch' | 'search' | 'keyboard' | 'none';
  
  // Live region
  liveRegion?: 'polite' | 'assertive' | 'none';
}

export interface MobileState {
  // Basic state
  enabled: boolean;
  visible: boolean;
  displayed: boolean;
  selected: boolean;
  checked?: boolean;
  
  // Focus
  focused: boolean;
  focusable: boolean;
  
  // Type-specific
  checked?: boolean;
  isPassword?: boolean;
  isEditable?: boolean;
  
  // Gestures
  swipeable: boolean;
  scrollable: boolean;
  
  // Expected interaction
  expectedInteraction: 'tap' | 'long-press' | 'swipe' | 'scroll' | 'type' | 'check' | 'none';
}

export interface MobileContent {
  // Text content
  text: string;
  hintText?: string;
  labelText?: string;
  
  // Value
  value?: string;
  placeholder?: string;
  
  // Semantic meaning
  semanticText: string;
  
  // Input type
  inputType?: 'text' | 'email' | 'password' | 'number' | 'phone' | 'url' | 'search' | 'datetime';
}

export interface MobileElement5D {
  // Dimension 1: Attributes
  attributes: MobileAttributes;
  
  // Dimension 2: Visual
  visual: MobileVisual;
  
  // Dimension 3: Accessibility
  accessibility: MobileAccessibility;
  
  // Dimension 4: State
  state: MobileState;
  
  // Dimension 5: Content
  content: MobileContent;
  
  // Metadata
  tagName: string;  // iOS: XCUIElementType, Android: class name
  platform: 'iOS' | 'Android';
  generatedAt: number;
  screenWidth: number;
  screenHeight: number;
}

export interface MobileFingerprint {
  element5D: MobileElement5D;
  hash: string;
  originalLocator?: string;
  locatorType?: 'id' | 'accessibility' | 'xpath' | 'class' | 'text' | 'chain';
}

/**
 * Create mobile 5D fingerprint from element
 */
export function createMobile5DFingerprint(
  element: MobileElementData,
  platform: 'iOS' | 'Android'
): MobileElement5D {
  // Dimension 1: Attributes
  const attributes: MobileAttributes = {
    accessibilityId: element.accessibilityId,
    accessibilityLabel: element.accessibilityLabel,
    accessibilityHint: element.accessibilityHint,
    resourceId: element.resourceId,
    contentDesc: element.contentDesc,
    className: element.className,
    packageName: element.packageName,
    bundleId: element.bundleId,
    index: element.index,
    parent: element.parent,
    childCount: element.childCount,
  };

  // Dimension 2: Visual
  const visual: MobileVisual = {
    width: element.width,
    height: element.height,
    x: element.x,
    y: element.y,
    centerX: element.x + element.width / 2,
    centerY: element.y + element.height / 2,
    screenX: element.screenX ?? element.x,
    screenY: element.screenY ?? element.y,
    inSafeAreaTop: element.inSafeAreaTop ?? false,
    inSafeAreaBottom: element.inSafeAreaBottom ?? false,
    inSafeAreaLeft: element.inSafeAreaLeft ?? false,
    inSafeAreaRight: element.inSafeAreaRight ?? false,
    alpha: element.alpha ?? 1,
    backgroundColor: element.backgroundColor,
    orientation: element.orientation ?? 'portrait',
  };

  // Dimension 3: Accessibility
  const accessibility: MobileAccessibility = {
    isAccessibilityElement: element.isAccessibilityElement ?? true,
    accessibilityElementsHidden: element.accessibilityElementsHidden ?? false,
    enabledForAccessibility: element.enabledForAccessibility ?? true,
    contentDescription: element.contentDescription,
    hint: element.hint,
    stateDescription: element.stateDescription,
    role: element.role,
    liveRegion: element.liveRegion,
  };

  // Dimension 4: State
  const state: MobileState = {
    enabled: element.enabled ?? true,
    visible: element.visible ?? true,
    displayed: element.displayed ?? true,
    selected: element.selected ?? false,
    checked: element.checked,
    focused: element.focused ?? false,
    focusable: element.focusable ?? false,
    isPassword: element.isPassword,
    isEditable: element.isEditable ?? false,
    swipeable: element.swipeable ?? false,
    scrollable: element.scrollable ?? false,
    expectedInteraction: element.expectedInteraction ?? inferInteraction(element, platform),
  };

  // Dimension 5: Content
  const content: MobileContent = {
    text: element.text ?? '',
    hintText: element.hintText,
    labelText: element.labelText,
    value: element.value,
    placeholder: element.placeholder,
    semanticText: deriveSemanticText(element, platform),
    inputType: element.inputType,
  };

  return {
    attributes,
    visual,
    accessibility,
    state,
    content,
    tagName: element.tagName,
    platform,
    generatedAt: Date.now(),
    screenWidth: element.screenWidth ?? 0,
    screenHeight: element.screenHeight ?? 0,
  };
}

/**
 * Infer expected interaction from element
 */
function inferInteraction(
  element: MobileElementData,
  platform: 'iOS' | 'Android'
): MobileState['expectedInteraction'] {
  const tag = element.tagName.toLowerCase();
  const className = element.className?.toLowerCase() || '';
  const accessibilityId = (element.accessibilityId || element.accessibilityLabel || '').toLowerCase();
  const resourceId = (element.resourceId || element.contentDesc || '').toLowerCase();

  // Button
  if (tag.includes('button') || className.includes('button') || 
      accessibilityId.includes('button') || resourceId.includes('button')) {
    return 'tap';
  }

  // Switch/Toggle
  if (tag.includes('switch') || className.includes('switch') ||
      accessibilityId.includes('switch') || resourceId.includes('switch')) {
    return 'check';
  }

  // Checkbox
  if (tag.includes('checkbox') || className.includes('checkbox')) {
    return 'check';
  }

  // Text input
  if (tag.includes('textfield') || tag.includes('edittext') ||
      className.includes('textfield') || className.includes('edittext') ||
      element.isEditable) {
    return 'type';
  }

  // List/Scroll
  if (tag.includes('scroll') || tag.includes('list') || className.includes('scroll') ||
      element.scrollable) {
    return 'scroll';
  }

  // Swipeable
  if (element.swipeable) {
    return 'swipe';
  }

  // Long press
  if (accessibilityId.includes('long') || resourceId.includes('long')) {
    return 'long-press';
  }

  return 'tap';
}

/**
 * Derive semantic text for mobile
 */
function deriveSemanticText(
  element: MobileElementData,
  platform: 'iOS' | 'Android'
): string {
  // Priority: contentDescription > accessibilityLabel > text > value
  const label = element.contentDescription || 
                element.accessibilityLabel || 
                element.accessibilityHint ||
                element.text || 
                element.value ||
                element.hintText ||
                element.labelText;

  // Add context from tag
  const tag = element.tagName;
  if (label) {
    return `${tag}:${label}`;
  }

  return tag;
}

/**
 * Mobile element data (input type)
 */
export interface MobileElementData {
  // Common
  tagName: string;
  
  // iOS
  accessibilityId?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  
  // Android
  resourceId?: string;
  contentDesc?: string;
  packageName?: string;
  
  // Size & Position
  width: number;
  height: number;
  x: number;
  y: number;
  screenX?: number;
  screenY?: number;
  
  // Safe area
  inSafeAreaTop?: boolean;
  inSafeAreaBottom?: boolean;
  inSafeAreaLeft?: boolean;
  inSafeAreaRight?: boolean;
  
  // Visual
  alpha?: number;
  backgroundColor?: string;
  orientation?: 'portrait' | 'landscape';
  
  // Accessibility
  isAccessibilityElement?: boolean;
  accessibilityElementsHidden?: boolean;
  enabledForAccessibility?: boolean;
  contentDescription?: string;
  hint?: string;
  stateDescription?: string;
  role?: MobileAccessibility['role'];
  liveRegion?: MobileAccessibility['liveRegion'];
  
  // State
  enabled?: boolean;
  visible?: boolean;
  displayed?: boolean;
  selected?: boolean;
  checked?: boolean;
  focused?: boolean;
  focusable?: boolean;
  isPassword?: boolean;
  isEditable?: boolean;
  swipeable?: boolean;
  scrollable?: boolean;
  
  // Content
  text?: string;
  hintText?: string;
  labelText?: string;
  value?: string;
  placeholder?: string;
  inputType?: MobileContent['inputType'];
  
  // Hierarchy
  index?: number;
  parent?: string;
  childCount?: number;
  
  // Screen
  screenWidth?: number;
  screenHeight?: number;
}
