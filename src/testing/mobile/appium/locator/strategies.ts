/**
 * Mobile Locator Strategies
 * Platform-aware element finding with fallback chain
 */

import type { Platform } from '../../appium/config';

export type MobileLocatorStrategy = 
  | 'accessibility'
  | 'id'
  | 'resource-id'
  | 'class-chain'
  | 'xpath'
  | 'text'
  | 'content-desc'
  | 'class-name';

export interface MobileLocator {
  strategy: MobileLocatorStrategy;
  selector: string;
  platform: Platform | 'both';
  confidence: number;
  description?: string;
}

export interface LocatorResult {
  success: boolean;
  locator: MobileLocator;
  element?: MobileElementInfo;
  error?: string;
}

export interface MobileElementInfo {
  id?: string;
  accessibilityId?: string;
  className: string;
  text?: string;
  contentDesc?: string;
  enabled: boolean;
  visible: boolean;
  bounds?: { x: number; y: number; width: number; height: number };
}

/**
 * Locator Strategy Manager
 * Generates and manages mobile element locators
 */
export class MobileLocatorStrategyManager {
  private platform: Platform;
  
  constructor(platform: Platform) {
    this.platform = platform;
  }

  /**
   * Generate locator from description
   */
  generateLocator(description: string, context?: {
    tagName?: string;
    text?: string;
    id?: string;
  }): MobileLocator[] {
    const locators: MobileLocator[] = [];

    // Primary: Accessibility ID
    const accessibilityId = context?.id || this.deriveAccessibilityId(description);
    if (accessibilityId) {
      locators.push({
        strategy: 'accessibility',
        selector: this.buildAccessibilityLocator(accessibilityId),
        platform: 'both',
        confidence: 0.95,
        description: `accessibility:${accessibilityId}`,
      });
    }

    // Android: Resource ID
    if (this.platform === 'Android') {
      const resourceId = context?.id || this.deriveResourceId(description);
      if (resourceId) {
        locators.push({
          strategy: 'resource-id',
          selector: resourceId,
          platform: 'Android',
          confidence: 0.9,
          description: `resource-id:${resourceId}`,
        });
      }
    }

    // iOS: Class Chain
    if (this.platform === 'iOS') {
      const classChain = this.buildClassChain(description, context);
      if (classChain) {
        locators.push({
          strategy: 'class-chain',
          selector: classChain,
          platform: 'iOS',
          confidence: 0.85,
          description: `class chain for ${description}`,
        });
      }
    }

    // Text-based
    const text = context?.text || this.deriveText(description);
    if (text) {
      locators.push({
        strategy: 'text',
        selector: this.buildTextLocator(text),
        platform: 'both',
        confidence: 0.8,
        description: `text:${text}`,
      });
    }

    // Content description
    const contentDesc = this.deriveContentDesc(description);
    if (contentDesc) {
      locators.push({
        strategy: 'content-desc',
        selector: this.buildContentDescLocator(contentDesc),
        platform: 'both',
        confidence: 0.75,
        description: `content-desc:${contentDesc}`,
      });
    }

    // XPath (fallback)
    const xpath = this.buildXPath(description, context);
    locators.push({
      strategy: 'xpath',
      selector: xpath,
      platform: 'both',
      confidence: 0.6,
      description: `xpath:${xpath}`,
    });

    return locators;
  }

  /**
   * Build accessibility locator
   */
  private buildAccessibilityLocator(id: string): string {
    return id;
  }

  /**
   * Build Android resource ID
   */
  private buildResourceIdLocator(id: string): string {
    return id;
  }

  /**
   * Build text locator
   */
  private buildTextLocator(text: string): string {
    if (this.platform === 'Android') {
      return `text=${text}`;
    }
    return `label=${text}`;
  }

  /**
   * Build content description locator
   */
  private buildContentDescLocator(desc: string): string {
    if (this.platform === 'Android') {
      return `description=${desc}`;
    }
    return `name=${desc}`;
  }

  /**
   * Build class chain for iOS
   */
  private buildClassChain(description: string, context?: {
    tagName?: string;
    text?: string;
  }): string | null {
    const parts: string[] = [];

    // Element type
    const type = this.mapToElementType(context?.tagName || description);
    parts.push(`XCUIElementType${type}`);

    // Visible predicate
    parts.push('[visible == true]');

    // Text predicate
    if (context?.text) {
      parts.push(`[label == "${context.text}"]`);
    }

    // Name predicate
    const name = this.deriveAccessibilityId(description);
    if (name) {
      parts.push(`[name == "${name}"]`);
    }

    return `**/${parts.join('')}`;
  }

  /**
   * Build XPath locator
   */
  private buildXPath(description: string, context?: {
    tagName?: string;
    text?: string;
    id?: string;
  }): string {
    const tag = context?.tagName ? 
      (this.platform === 'Android' ? 'android.widget.' : 'XCUIElementType') + context.tagName : 
      '*';

    const predicates: string[] = [];

    // Text
    if (context?.text) {
      predicates.push(`@label='${context.text}'`);
    }

    // ID
    if (context?.id) {
      if (this.platform === 'Android') {
        predicates.push(`@resource-id='${context.id}'`);
      } else {
        predicates.push(`@name='${context.id}'`);
      }
    }

    if (predicates.length > 0) {
      return `//${tag}[${predicates.join(' and ')}]`;
    }

    return `//${tag}`;
  }

  /**
   * Derive accessibility ID from description
   */
  private deriveAccessibilityId(description: string): string | null {
    // Common patterns
    const patterns = [
      /^(.*?)(button|btn)?$/i,
      /^(.*?)(field|input)?$/i,
      /^(.*?)(link)?$/i,
    ];

    for (const pattern of patterns) {
      const match = description.match(pattern);
      if (match) {
        const derived = match[1].trim().replace(/\s+/g, '_').toLowerCase();
        if (derived.length > 2) {
          return derived;
        }
      }
    }

    return null;
  }

  /**
   * Derive Android resource ID
   */
  private deriveResourceId(description: string): string | null {
    const base = this.deriveAccessibilityId(description);
    if (base) {
      return `${base}`;
    }
    return null;
  }

  /**
   * Derive text from description
   */
  private deriveText(description: string): string | null {
    // If description sounds like button text
    if (/^(submit|save|cancel|ok|yes|no|next|back|login|sign in|register)/i.test(description)) {
      return description;
    }
    return null;
  }

  /**
   * Derive content description
   */
  private deriveContentDesc(description: string): string | null {
    // If description is an icon/image description
    if (/^(icon|image|logo|picture|photo|avatar|menu|hamburger|back|close)/i.test(description)) {
      return description;
    }
    return null;
  }

  /**
   * Map description to element type
   */
  private mapToElementType(description: string): string {
    const desc = description.toLowerCase();
    
    if (/button|submit|save|cancel|ok|yes|no/.test(desc)) return 'Button';
    if (/text.*field|input|enter|type|email|password/.test(desc)) return 'TextField';
    if (/switch|toggle/.test(desc)) return 'Switch';
    if (/checkbox|check/.test(desc)) return 'CheckBox';
    if (/radio|option/.test(desc)) return 'RadioButton';
    if (/tab/.test(desc)) return 'Tab';
    if (/cell|row|item/.test(desc)) return 'Cell';
    if (/navigation|nav/.test(desc)) return 'NavigationBar';
    if (/alert|dialog|popup/.test(desc)) return 'Alert';
    if (/slider/.test(desc)) return 'Slider';
    if (/search|find/.test(desc)) return 'SearchField';
    
    return 'Any';
  }

  /**
   * Get fallback chain for platform
   */
  getFallbackChain(): MobileLocatorStrategy[] {
    if (this.platform === 'iOS') {
      return ['accessibility', 'class-chain', 'xpath', 'text'];
    }
    return ['accessibility', 'resource-id', 'xpath', 'text'];
  }
}

/**
 * Cross-platform locator translation
 */
export function translateLocator(
  locator: MobileLocator,
  toPlatform: Platform
): MobileLocator {
  if (locator.platform === toPlatform || locator.platform === 'both') {
    return locator;
  }

  // Translate between platforms
  const translated: MobileLocator = { ...locator };

  switch (locator.strategy) {
    case 'accessibility':
      translated.selector = locator.selector;
      translated.platform = 'both';
      translated.confidence *= 0.9;  // Slight penalty for cross-platform
      break;

    case 'resource-id':
      if (toPlatform === 'iOS') {
        // Android resource-id -> iOS accessibility-id
        translated.strategy = 'accessibility';
        translated.selector = locator.selector.split('/').pop() || locator.selector;
      }
      break;

    case 'class-chain':
      if (toPlatform === 'Android') {
        // iOS class-chain -> Android XPath
        translated.strategy = 'xpath';
        translated.selector = `//*[contains(@class,'${locator.selector.split('/').pop()}')]`;
      }
      break;

    case 'text':
      translated.platform = 'both';
      break;
  }

  return translated;
}
