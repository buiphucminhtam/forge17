/**
 * Mobile Similarity Scoring
 * Calculates similarity between two mobile 5D fingerprints
 */

import type { MobileElement5D } from './fingerprint';

export interface MobileSimilarityScore {
  overall: number;
  dimensions: {
    attributes: number;
    visual: number;
    accessibility: number;
    state: number;
    content: number;
  };
  confidence: 'high' | 'medium' | 'low';
  details: string[];
  platformMatch: boolean;
}

const DIMENSION_WEIGHTS = {
  attributes: 0.30,    // Higher weight - IDs are critical on mobile
  visual: 0.15,
  accessibility: 0.25, // Accessibility is key on mobile
  state: 0.10,
  content: 0.20,
};

const HIGH_THRESHOLD = 0.85;
const MEDIUM_THRESHOLD = 0.60;

/**
 * Calculate similarity between two mobile elements
 */
export function calculateMobileSimilarity(
  source: MobileElement5D,
  target: MobileElement5D
): MobileSimilarityScore {
  // Platform check - different platforms are less comparable
  const platformMatch = source.platform === target.platform;
  
  // Calculate dimension scores
  const scores = {
    attributes: calculateAttributeSimilarity(source.attributes, target.attributes, source.platform),
    visual: calculateVisualSimilarity(source.visual, target.visual),
    accessibility: calculateAccessibilitySimilarity(source.accessibility, target.accessibility),
    state: calculateStateSimilarity(source.state, target.state),
    content: calculateContentSimilarity(source.content, target.content),
  };

  // Weighted overall score
  let overall = Object.entries(scores).reduce((sum, [key, score]) => {
    return sum + score * DIMENSION_WEIGHTS[key as keyof typeof DIMENSION_WEIGHTS];
  }, 0);

  // Penalize cross-platform matches
  if (!platformMatch) {
    overall *= 0.7;  // 30% penalty for different platforms
  }

  // Determine confidence
  const confidence = overall >= HIGH_THRESHOLD ? 'high' :
                     overall >= MEDIUM_THRESHOLD ? 'medium' : 'low';

  // Generate details
  const details = generateDetails(scores, platformMatch);

  return {
    overall,
    dimensions: scores,
    confidence,
    details,
    platformMatch,
  };
}

/**
 * Calculate attribute similarity
 */
function calculateAttributeSimilarity(
  source: MobileElement5D['attributes'],
  target: MobileElement5D['attributes'],
  platform: 'iOS' | 'Android'
): number {
  let score = 0;
  let total = 0;

  // Primary identifier (platform-specific)
  if (platform === 'iOS') {
    total++;
    if (source.accessibilityId && target.accessibilityId) {
      score += source.accessibilityId === target.accessibilityId ? 1 : 0;
    } else {
      score += 0.5;  // Both missing = neutral
    }
  } else {
    total++;
    if (source.resourceId && target.resourceId) {
      score += source.resourceId === target.resourceId ? 1 : 0;
    } else {
      score += 0.5;
    }
  }

  // Cross-platform: accessibility ID (works on both)
  if (source.accessibilityId && target.accessibilityId) {
    total++;
    score += source.accessibilityId === target.accessibilityId ? 1 : 0;
  }

  // Android content-desc vs iOS accessibility-label
  if (source.contentDesc && target.contentDesc) {
    total++;
    score += source.contentDesc === target.contentDesc ? 1 : 
             source.contentDesc.includes(target.contentDesc) ? 0.7 : 0;
  }

  // Class/tag name
  if (source.className && target.className) {
    total++;
    score += source.className === target.className ? 1 : 
             source.className.includes(target.className) ? 0.7 : 0.3;
  }

  // Package/bundle ID
  if (source.packageName && target.packageName) {
    total++;
    score += source.packageName === target.packageName ? 1 : 0.5;
  }

  return total > 0 ? score / total : 0;
}

/**
 * Calculate visual similarity
 */
function calculateVisualSimilarity(
  source: MobileElement5D['visual'],
  target: MobileElement5D['visual']
): number {
  let score = 0;
  let total = 0;

  // Size similarity (most important for mobile)
  total++;
  score += calculateSizeSimilarity(source, target);

  // Position quadrant
  total++;
  score += calculatePositionSimilarity(source, target);

  // Safe area alignment
  if (source.inSafeAreaTop !== undefined && target.inSafeAreaTop !== undefined) {
    total++;
    const topMatch = source.inSafeAreaTop === target.inSafeAreaTop;
    const bottomMatch = source.inSafeAreaBottom === target.inSafeAreaBottom;
    score += (topMatch && bottomMatch) ? 1 : 0.5;
  }

  // Orientation
  if (source.orientation && target.orientation) {
    total++;
    score += source.orientation === target.orientation ? 1 : 0.5;
  }

  // Alpha
  if (source.alpha !== undefined && target.alpha !== undefined) {
    total++;
    score += Math.abs(source.alpha - target.alpha) < 0.1 ? 1 : 0;
  }

  return total > 0 ? score / total : 0;
}

/**
 * Calculate size similarity with mobile tolerance
 */
function calculateSizeSimilarity(
  source: { width: number; height: number },
  target: { width: number; height: number }
): number {
  const widthRatio = Math.min(source.width, target.width) / Math.max(source.width, target.width);
  const heightRatio = Math.min(source.height, target.height) / Math.max(source.height, target.height);

  // Mobile has less size variation tolerance (apps are more uniform)
  const tolerance = 0.15;
  const adjustedWidth = widthRatio > 1 - tolerance ? 1 : widthRatio;
  const adjustedHeight = heightRatio > 1 - tolerance ? 1 : heightRatio;

  return (adjustedWidth + adjustedHeight) / 2;
}

/**
 * Calculate position similarity
 */
function calculatePositionSimilarity(
  source: { centerX: number; centerY: number },
  target: { centerX: number; centerY: number }
): number {
  // Same relative position (top, middle, bottom)
  const sourceYZone = source.centerY < 0.33 ? 'top' : 
                      source.centerY > 0.66 ? 'bottom' : 'middle';
  const targetYZone = target.centerY < 0.33 ? 'top' :
                      target.centerY > 0.66 ? 'bottom' : 'middle';

  if (sourceYZone === targetYZone) return 1;

  // Adjacent zones
  const zones = ['top', 'middle', 'bottom'];
  const sourceIndex = zones.indexOf(sourceYZone);
  const targetIndex = zones.indexOf(targetYZone);
  
  if (Math.abs(sourceIndex - targetIndex) === 1) return 0.5;
  
  return 0.2;
}

/**
 * Calculate accessibility similarity
 */
function calculateAccessibilitySimilarity(
  source: MobileElement5D['accessibility'],
  target: MobileElement5D['accessibility']
): number {
  let score = 0;
  let total = 0;

  // Content description
  if (source.contentDescription && target.contentDescription) {
    total++;
    score += source.contentDescription === target.contentDescription ? 1 :
             source.contentDescription.includes(target.contentDescription) ? 0.8 : 0.3;
  }

  // Hint
  if (source.hint && target.hint) {
    total++;
    score += source.hint === target.hint ? 1 : 0.5;
  }

  // Role
  if (source.role && target.role) {
    total++;
    score += source.role === target.role ? 1 : 0.3;
  }

  // Live region
  if (source.liveRegion && target.liveRegion) {
    total++;
    score += source.liveRegion === target.liveRegion ? 1 : 0;
  }

  // Accessibility enabled
  total++;
  if (source.isAccessibilityElement === target.isAccessibilityElement) {
    score += 1;
  }

  return total > 0 ? score / total : 0;
}

/**
 * Calculate state similarity
 */
function calculateStateSimilarity(
  source: MobileElement5D['state'],
  target: MobileElement5D['state']
): number {
  let score = 0;
  let total = 0;

  // Key states
  const stateKeys: (keyof MobileElement5D['state'])[] = 
    ['enabled', 'visible', 'selected', 'focused', 'checked'];

  for (const key of stateKeys) {
    if (source[key] !== undefined && target[key] !== undefined) {
      total++;
      score += source[key] === target[key] ? 1 : 0;
    }
  }

  // Expected interaction
  total++;
  score += source.expectedInteraction === target.expectedInteraction ? 1 : 0.5;

  return total > 0 ? score / total : 0;
}

/**
 * Calculate content similarity
 */
function calculateContentSimilarity(
  source: MobileElement5D['content'],
  target: MobileElement5D['content']
): number {
  let score = 0;
  let total = 0;

  // Text
  if (source.text && target.text) {
    total++;
    score += calculateTextSimilarity(source.text, target.text);
  }

  // Semantic text
  if (source.semanticText && target.semanticText) {
    total++;
    const sourceTag = source.semanticText.split(':')[0];
    const targetTag = target.semanticText.split(':')[0];
    const sourceLabel = source.semanticText.split(':')[1] || '';
    const targetLabel = target.semanticText.split(':')[1] || '';
    
    score += sourceTag === targetTag ? 1 :
             sourceLabel.includes(targetLabel) || targetLabel.includes(sourceLabel) ? 0.7 : 0.3;
  }

  // Input type
  if (source.inputType && target.inputType) {
    total++;
    score += source.inputType === target.inputType ? 1 : 0.3;
  }

  return total > 0 ? score / total : 0;
}

/**
 * Calculate text similarity using word overlap
 */
function calculateTextSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/).filter(w => w.length > 1));
  const words2 = new Set(text2.toLowerCase().split(/\s+/).filter(w => w.length > 1));

  if (words1.size === 0 && words2.size === 0) return 1;
  if (words1.size === 0 || words2.size === 0) return 0;

  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

/**
 * Generate similarity details
 */
function generateDetails(
  scores: MobileSimilarityScore['dimensions'],
  platformMatch: boolean
): string[] {
  const details: string[] = [];

  if (!platformMatch) {
    details.push('Cross-platform comparison (penalized)');
  }

  if (scores.attributes >= 0.8) details.push('Strong attribute match');
  else if (scores.attributes >= 0.5) details.push('Moderate attribute match');

  if (scores.visual >= 0.8) details.push('Similar visual properties');
  else if (scores.visual >= 0.5) details.push('Some visual similarity');

  if (scores.accessibility >= 0.8) details.push('Strong accessibility match');
  else if (scores.accessibility >= 0.5) details.push('Moderate accessibility match');

  if (scores.state >= 0.8) details.push('Matching states');
  else if (scores.state >= 0.5) details.push('Some state differences');

  if (scores.content >= 0.8) details.push('Similar content');
  else if (scores.content >= 0.5) details.push('Some content overlap');

  return details;
}

/**
 * Find best matching element from candidates
 */
export function findBestMobileMatch(
  source: MobileElement5D,
  candidates: MobileElement5D[],
  options?: {
    minThreshold?: number;
    preferSamePlatform?: boolean;
    preferSameTag?: boolean;
  }
): { element: MobileElement5D; score: MobileSimilarityScore } | null {
  const opts = {
    minThreshold: MEDIUM_THRESHOLD,
    preferSamePlatform: true,
    preferSameTag: true,
    ...options,
  };

  let scored = candidates.map(candidate => ({
    element: candidate,
    score: calculateMobileSimilarity(source, candidate),
  }));

  // Filter by minimum threshold
  scored = scored.filter(s => s.score.overall >= opts.minThreshold!);

  if (scored.length === 0) return null;

  // Prefer same platform
  if (opts.preferSamePlatform) {
    const samePlatform = scored.filter(s => s.score.platformMatch);
    if (samePlatform.length > 0) {
      scored = samePlatform;
    }
  }

  // Sort by overall score
  scored.sort((a, b) => b.score.overall - a.score.overall);

  return scored[0];
}
