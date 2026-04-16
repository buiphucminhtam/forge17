/**
 * Stably AI Integration
 * Natural Language Element Locators
 * 
 * Supports: "product cards in the carousel", "checkout button", etc.
 */

import { callLLM, getLLMConfig, type LLMProvider } from '../config/llm-providers';

export interface StablyConfig {
  enabled: boolean;
  provider: LLMProvider;
  model?: string;
  fallbackToAria?: boolean;
  cacheEnabled?: boolean;
  cacheTTL?: number;
}

const DEFAULT_CONFIG: StablyConfig = {
  enabled: true,
  provider: 'openai',
  fallbackToAria: true,
  cacheEnabled: true,
  cacheTTL: 3600,
};

/**
 * Stably Element Locator
 * Natural language to element selector
 */
export class StablyLocator {
  private config: StablyConfig;
  private cache: Map<string, string> = new Map();
  
  constructor(config: Partial<StablyConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }
  
  /**
   * Find element using natural language description
   */
  async find(
    description: string,
    context?: {
      pageHTML?: string;
      pageURL?: string;
      existingElements?: string[];
    }
  ): Promise<LocatorResult> {
    // Check cache first
    if (this.config.cacheEnabled) {
      const cached = this.cache.get(description);
      if (cached) {
        return {
          success: true,
          locator: cached,
          confidence: 0.95,
          method: 'cache',
          description,
        };
      }
    }
    
    // Use LLM to generate locator
    const config = getLLMConfig(this.config.provider);
    
    const prompt = `
You are an expert at converting natural language descriptions to CSS/XPath selectors.

Description: "${description}"
${context?.pageURL ? `Page URL: ${context.pageURL}` : ''}
${context?.existingElements ? `Available elements:\n${context.existingElements.join('\n')}` : ''}

Task: Convert the description to a Playwright-compatible CSS or XPath selector.

Rules:
1. Prefer CSS selectors when possible
2. Use semantic selectors (role, aria-label) over visual selectors
3. Make selectors robust against minor UI changes
4. Use data-testid when available

Provide your answer in this format:
LOCATOR: [the best selector]
CONFIDENCE: [0.0-1.0]
METHOD: [css|xpath|role|aria|text]
REASONING: [why this selector is best]
`;
    
    try {
      const response = await callLLM(config, prompt);
      const parsed = this.parseResponse(response.content);
      
      // Cache result
      if (this.config.cacheEnabled) {
        this.cache.set(description, parsed.locator);
      }
      
      return {
        success: true,
        locator: parsed.locator,
        confidence: parsed.confidence,
        method: parsed.method,
        description,
        reasoning: parsed.reasoning,
      };
    } catch (error) {
      // Fallback to aria-based locator
      if (this.config.fallbackToAria) {
        return this.fallbackToAria(description);
      }
      
      return {
        success: false,
        locator: '',
        confidence: 0,
        method: 'none',
        description,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  /**
   * Parse LLM response
   */
  private parseResponse(content: string): {
    locator: string;
    confidence: number;
    method: 'css' | 'xpath' | 'role' | 'aria' | 'text';
    reasoning: string;
  } {
    const locatorMatch = content.match(/LOCATOR:\s*([^\n]+)/i);
    const confidenceMatch = content.match(/CONFIDENCE:\s*([\d.]+)/i);
    const methodMatch = content.match(/METHOD:\s*(\w+)/i);
    const reasoningMatch = content.match(/REASONING:\s*([\s\S]*?)(?:LOCATOR|CONFIDENCE|METHOD|$)/i);
    
    return {
      locator: locatorMatch ? locatorMatch[1].trim() : '',
      confidence: confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.5,
      method: (methodMatch ? methodMatch[1].toLowerCase() : 'css') as 'css' | 'xpath' | 'role' | 'aria' | 'text',
      reasoning: reasoningMatch ? reasoningMatch[1].trim() : '',
    };
  }
  
  /**
   * Fallback to aria-based locator
   */
  private fallbackToAria(description: string): LocatorResult {
    // Generate aria-based locator as fallback
    const words = description.toLowerCase().split(/\s+/);
    const lastWord = words[words.length - 1];
    
    // Common patterns
    const patterns = [
      { regex: /button|click/, selector: '[role="button"]' },
      { regex: /input|field|text/, selector: '[role="textbox"]' },
      { regex: /link|navigate|go/, selector: 'a' },
      { regex: /menu|dropdown|select/, selector: '[role="menu"]' },
      { regex: /dialog|modal|popup/, selector: '[role="dialog"]' },
      { regex: /form|submit/, selector: 'form' },
      { regex: /table|grid|data/, selector: 'table' },
      { regex: /image|img|picture/, selector: 'img' },
      { regex: /heading|title|header/, selector: 'h1, h2, h3' },
      { regex: /checkbox|toggle|check/, selector: '[role="checkbox"]' },
      { regex: /radio|option/, selector: '[role="radio"]' },
      { regex: /tab|switch/, selector: '[role="tab"]' },
    ];
    
    for (const pattern of patterns) {
      if (pattern.regex.test(description)) {
        return {
          success: true,
          locator: pattern.selector,
          confidence: 0.4,
          method: 'aria',
          description,
          reasoning: 'Fallback aria-based locator',
        };
      }
    }
    
    // Generic fallback
    return {
      success: true,
      locator: `text="${lastWord}"`,
      confidence: 0.2,
      method: 'text',
      description,
      reasoning: 'Fallback text-based locator',
    };
  }
  
  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
  
  /**
   * Get cache stats
   */
  getCacheStats(): { size: number } {
    return { size: this.cache.size };
  }
}

export interface LocatorResult {
  success: boolean;
  locator: string;
  confidence: number;
  method: 'css' | 'xpath' | 'role' | 'aria' | 'text' | 'cache' | 'none';
  description: string;
  reasoning?: string;
  error?: string;
}

/**
 * Example natural language queries:
 * 
 * const stably = new StablyLocator();
 * 
 * await stably.find("checkout button");           // [role="button"]:has-text("Checkout")
 * await stably.find("email input field");         // [name="email"] or [type="email"]
 * await stably.find("product cards in carousel");  // .product-card, .carousel-item
 * await stably.find("error message");             // [role="alert"]
 * await stably.find("submit form button");         // button[type="submit"]
 */
