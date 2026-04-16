/**
 * 5D Element Model for Self-Healing
 * Based on Functionize's multi-dimensional element identification
 * 
 * Dimensions:
 * 1. Attributes & Properties (id, classes, roles, aria, states)
 * 2. Visual Characteristics (size, position, color, font)
 * 3. Hierarchy & Relationships (DOM structure, siblings, landmarks)
 * 4. State & Interactions (active, disabled, focused, expected)
 * 5. Content & Metadata (text, alt, aria, semantic)
 */

export interface ElementAttributes {
  id?: string;
  classes: string[];
  roles: string[];
  ariaLabels: string[];
  name?: string;
  behavioralStates: string[];  // active, disabled, focused, hover, etc.
}

export interface ElementVisual {
  size: { width: number; height: number };
  position: { x: number; y: number };
  color: string;
  font: string;
  fontSize: string;
  fontWeight: string;
  renderingStyle: string;
  backgroundColor?: string;
  borderRadius?: string;
  zIndex?: number;
}

export interface ElementHierarchy {
  parent?: string;
  parentTag?: string;
  siblings: string[];
  siblingTags: string[];
  iframeNesting: string[];
  proximityToLandmarks: string[];  // nav, header, main, footer, aside
  depth: number;
  xpath: string;
}

export interface ElementState {
  active: boolean;
  disabled: boolean;
  focused: boolean;
  visible: boolean;
  checked?: boolean;
  selected?: boolean;
  expanded?: boolean;
  expectedInteraction: 'click' | 'type' | 'hover' | 'select' | 'check' | 'none';
}

export interface ElementContent {
  visibleText: string;
  innerText: string;
  altText?: string;
  title?: string;
  placeholder?: string;
  ariaDescription?: string;
  ariaLabel?: string;
  semanticMeaning: string;  // derived from text + context
  inputType?: string;
}

export interface Element5D {
  // Dimension 1: Attributes & Properties
  attributes: ElementAttributes;
  
  // Dimension 2: Visual Characteristics
  visual: ElementVisual;
  
  // Dimension 3: Hierarchy & Relationships
  hierarchy: ElementHierarchy;
  
  // Dimension 4: State & Interactions
  state: ElementState;
  
  // Dimension 5: Content & Metadata
  content: ElementContent;
  
  // Metadata
  tagName: string;
  generatedAt: number;
  url: string;
}

export interface ElementFingerprint {
  element5D: Element5D;
  hash: string;
  originalSelector?: string;
}

/**
 * Create a 5D fingerprint from a DOM element
 */
export async function create5DFingerprint(
  element: {
    getAttribute: (name: string) => string | null;
    tagName: string;
    textContent: string | null;
    innerText: string | null;
    offsetWidth?: number;
    offsetHeight?: number;
    getBoundingClientRect?: () => DOMRect;
    ownerDocument?: { URL?: string };
  },
  options?: {
    includeVisual?: boolean;
    includeHierarchy?: boolean;
  }
): Promise<Element5D> {
  const opts = {
    includeVisual: true,
    includeHierarchy: true,
    ...options,
  };
  
  // Dimension 1: Attributes
  const attributes: ElementAttributes = {
    id: element.getAttribute('id') || undefined,
    classes: element.getAttribute('class')?.split(/\s+/).filter(Boolean) || [],
    roles: extractRoles(element),
    ariaLabels: extractAriaLabels(element),
    name: element.getAttribute('name') || element.getAttribute('aria-label') || undefined,
    behavioralStates: extractBehavioralStates(element),
  };
  
  // Dimension 2: Visual
  let visual: ElementVisual | undefined;
  if (opts.includeVisual) {
    const rect = element.getBoundingClientRect?.();
    visual = {
      size: {
        width: element.offsetWidth || rect?.width || 0,
        height: element.offsetHeight || rect?.height || 0,
      },
      position: {
        x: rect?.x || 0,
        y: rect?.y || 0,
      },
      color: element.getAttribute('style')?.match(/color:\s*([^;]+)/)?.[1] || '',
      font: element.getAttribute('style')?.match(/font-family:\s*([^;]+)/)?.[1] || '',
      fontSize: element.getAttribute('style')?.match(/font-size:\s*([^;]+)/)?.[1] || '',
      fontWeight: element.getAttribute('style')?.match(/font-weight:\s*([^;]+)/)?.[1] || '',
      renderingStyle: extractRenderingStyle(element),
    };
  }
  
  // Dimension 3: Hierarchy
  let hierarchy: ElementHierarchy | undefined;
  if (opts.includeHierarchy) {
    hierarchy = {
      parent: element.getAttribute('data-testid') || undefined,
      parentTag: '',
      siblings: [],
      siblingTags: [],
      iframeNesting: [],
      proximityToLandmarks: [],
      depth: 0,
      xpath: '',
    };
  }
  
  // Dimension 4: State
  const state: ElementState = {
    active: !element.getAttribute('disabled'),
    disabled: !!element.getAttribute('disabled'),
    focused: false,  // Set by caller if needed
    visible: element.offsetWidth > 0 && element.offsetHeight > 0,
    expectedInteraction: inferExpectedInteraction(element),
  };
  
  // Dimension 5: Content
  const content: ElementContent = {
    visibleText: element.innerText?.trim() || element.textContent?.trim() || '',
    innerText: element.innerText || '',
    altText: element.getAttribute('alt') || undefined,
    title: element.getAttribute('title') || undefined,
    placeholder: element.getAttribute('placeholder') || undefined,
    ariaDescription: element.getAttribute('aria-describedby') || undefined,
    ariaLabel: element.getAttribute('aria-label') || undefined,
    semanticMeaning: deriveSemanticMeaning(element),
    inputType: element.getAttribute('type') || undefined,
  };
  
  return {
    attributes,
    visual: visual || {
      size: { width: 0, height: 0 },
      position: { x: 0, y: 0 },
      color: '',
      font: '',
      fontSize: '',
      fontWeight: '',
      renderingStyle: '',
    },
    hierarchy: hierarchy || {
      parent: undefined,
      parentTag: '',
      siblings: [],
      siblingTags: [],
      iframeNesting: [],
      proximityToLandmarks: [],
      depth: 0,
      xpath: '',
    },
    state,
    content,
    tagName: element.tagName.toLowerCase(),
    generatedAt: Date.now(),
    url: element.ownerDocument?.URL || '',
  };
}

// Helper functions

function extractRoles(element: { getAttribute: (name: string) => string | null }): string[] {
  const role = element.getAttribute('role');
  return role ? [role] : [];
}

function extractAriaLabels(element: { getAttribute: (name: string) => string | null }): string[] {
  const labels: string[] = [];
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) labels.push(ariaLabel);
  const ariaLabelledby = element.getAttribute('aria-labelledby');
  if (ariaLabelledby) labels.push(ariaLabelledby);
  return labels;
}

function extractBehavioralStates(element: { getAttribute: (name: string) => string | null }): string[] {
  const states: string[] = [];
  ['disabled', 'readonly', 'required', 'checked', 'selected', 'expanded', 'hidden'].forEach((attr) => {
    if (element.getAttribute(attr)) states.push(attr);
  });
  return states;
}

function extractRenderingStyle(element: { getAttribute: (name: string) => string | null }): string {
  const display = element.getAttribute('style')?.match(/display:\s*([^;]+)/)?.[1];
  const visibility = element.getAttribute('style')?.match(/visibility:\s*([^;]+)/)?.[1];
  const opacity = element.getAttribute('style')?.match(/opacity:\s*([^;]+)/)?.[1];
  return [display, visibility, opacity].filter(Boolean).join(';');
}

function inferExpectedInteraction(element: { tagName: string; getAttribute: (name: string) => string | null }): ElementState['expectedInteraction'] {
  const tag = element.tagName.toLowerCase();
  const type = element.getAttribute('type');
  
  if (['button', 'a', 'summary'].includes(tag)) return 'click';
  if (tag === 'input') {
    if (['checkbox', 'radio'].includes(type || '')) return 'check';
    return 'type';
  }
  if (['select', 'textarea'].includes(tag)) return 'select';
  if (tag === 'details') return 'click';
  return 'none';
}

function deriveSemanticMeaning(element: { tagName: string; textContent: string | null; getAttribute: (name: string) => string | null }): string {
  const tag = element.tagName.toLowerCase();
  const text = element.textContent?.trim() || '';
  const role = element.getAttribute('role');
  const ariaLabel = element.getAttribute('aria-label');
  
  // Derive semantic meaning from tag, text, and attributes
  if (role) return role;
  if (ariaLabel) return ariaLabel;
  if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) return `heading:${text.slice(0, 50)}`;
  if (['button', 'a'].includes(tag)) return `link/button:${text.slice(0, 50)}`;
  if (tag === 'input') return `input:${element.getAttribute('name') || text}`;
  if (tag === 'img') return `image:${element.getAttribute('alt') || text}`;
  
  return text.slice(0, 50);
}
