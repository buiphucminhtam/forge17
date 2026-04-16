/**
 * Similarity Scoring for 5D Element Matching
 * Calculates similarity between two 5D fingerprints
 */

import { Element5D } from './fingerprint';

export interface SimilarityScore {
  overall: number;
  dimensions: {
    attributes: number;
    visual: number;
    hierarchy: number;
    state: number;
    content: number;
  };
  confidence: 'high' | 'medium' | 'low';
  details: string[];
}

const DIMENSION_WEIGHTS = {
  attributes: 0.25,
  visual: 0.15,
  hierarchy: 0.20,
  state: 0.15,
  content: 0.25,
};

// Thresholds
const HIGH_THRESHOLD = 0.85;
const MEDIUM_THRESHOLD = 0.60;

/**
 * Calculate similarity between two 5D elements
 */
export function calculateSimilarity(
  source: Element5D,
  target: Element5D
): SimilarityScore {
  const scores = {
    attributes: calculateAttributeSimilarity(source.attributes, target.attributes),
    visual: calculateVisualSimilarity(source.visual, target.visual),
    hierarchy: calculateHierarchySimilarity(source.hierarchy, target.hierarchy),
    state: calculateStateSimilarity(source.state, target.state),
    content: calculateContentSimilarity(source.content, target.content),
  };
  
  // Weighted overall score
  const overall = Object.entries(scores).reduce((sum, [key, score]) => {
    return sum + score * DIMENSION_WEIGHTS[key as keyof typeof DIMENSION_WEIGHTS];
  }, 0);
  
  // Determine confidence
  const confidence = overall >= HIGH_THRESHOLD ? 'high' : 
                     overall >= MEDIUM_THRESHOLD ? 'medium' : 'low';
  
  // Generate details
  const details = generateSimilarityDetails(scores);
  
  return {
    overall,
    dimensions: scores,
    confidence,
    details,
  };
}

/**
 * Calculate attribute similarity (0-1)
 */
function calculateAttributeSimilarity(
  source: Element5D['attributes'],
  target: Element5D['attributes']
): number {
  let score = 0;
  let total = 0;
  
  // ID match
  if (source.id && target.id) {
    total++;
    score += source.id === target.id ? 1 : 0;
  } else if (!source.id && !target.id) {
    total++;
    score += 0.5;  // Both have no ID is neutral
  }
  
  // Classes overlap
  if (source.classes.length > 0 || target.classes.length > 0) {
    total++;
    const overlap = source.classes.filter(c => target.classes.includes(c)).length;
    const union = new Set([...source.classes, ...target.classes]).size;
    score += union > 0 ? overlap / union : 0;
  }
  
  // Role match
  if (source.roles.length > 0 || target.roles.length > 0) {
    total++;
    score += source.roles.some(r => target.roles.includes(r)) ? 1 : 0;
  }
  
  // Name match
  if (source.name && target.name) {
    total++;
    score += source.name === target.name ? 1 : 
            source.name.includes(target.name) || target.name.includes(source.name) ? 0.7 : 0;
  }
  
  return total > 0 ? score / total : 0;
}

/**
 * Calculate visual similarity (0-1)
 */
function calculateVisualSimilarity(
  source: Element5D['visual'],
  target: Element5D['visual']
): number {
  let score = 0;
  let total = 0;
  
  // Size similarity
  total++;
  const sizeScore = calculateSizeSimilarity(source.size, target.size);
  score += sizeScore;
  
  // Position similarity
  total++;
  const posScore = calculatePositionSimilarity(source.position, target.position);
  score += posScore;
  
  // Color match (simplified - just check if same)
  if (source.color && target.color) {
    total++;
    score += source.color === target.color ? 1 : 0.5;
  } else {
    total++;
  }
  
  return total > 0 ? score / total : 0;
}

/**
 * Calculate size similarity with tolerance
 */
function calculateSizeSimilarity(
  source: { width: number; height: number },
  target: { width: number; height: number }
): number {
  const widthRatio = Math.min(source.width, target.width) / Math.max(source.width, target.width);
  const heightRatio = Math.min(source.height, target.height) / Math.max(source.height, target.height);
  
  // Allow 10% tolerance
  const tolerance = 0.10;
  const adjustedWidth = widthRatio > 1 - tolerance ? 1 : widthRatio;
  const adjustedHeight = heightRatio > 1 - tolerance ? 1 : heightRatio;
  
  return (adjustedWidth + adjustedHeight) / 2;
}

/**
 * Calculate position similarity based on quadrant
 */
function calculatePositionSimilarity(
  source: { x: number; y: number },
  target: { x: number; y: number }
): number {
  // Same quadrant = high similarity
  // Different quadrant = lower similarity
  const sourceQuadrant = `${source.x > 0 ? 'R' : 'L'}${source.y > 0 ? 'B' : 'T'}`;
  const targetQuadrant = `${target.x > 0 ? 'R' : 'L'}${target.y > 0 ? 'B' : 'T'}`;
  
  if (sourceQuadrant === targetQuadrant) return 1;
  
  // Diagonal neighbors
  if (sourceQuadrant === 'RT' && targetQuadrant === 'LB') return 0.2;
  if (sourceQuadrant === 'RB' && targetQuadrant === 'LT') return 0.2;
  
  return 0.5;
}

/**
 * Calculate hierarchy similarity (0-1)
 */
function calculateHierarchySimilarity(
  source: Element5D['hierarchy'],
  target: Element5D['hierarchy']
): number {
  let score = 0;
  let total = 0;
  
  // Same tag name
  total++;
  score += source.parentTag === target.parentTag ? 1 : 0.5;
  
  // Sibling overlap
  if (source.siblings.length > 0 || target.siblings.length > 0) {
    total++;
    const overlap = source.siblings.filter(s => target.siblings.includes(s)).length;
    const union = new Set([...source.siblings, ...target.siblings]).size;
    score += union > 0 ? overlap / union : 0;
  }
  
  // Depth difference
  total++;
  const depthDiff = Math.abs(source.depth - target.depth);
  score += depthDiff === 0 ? 1 : depthDiff === 1 ? 0.8 : 1 - (depthDiff * 0.2);
  
  return total > 0 ? score / total : 0;
}

/**
 * Calculate state similarity (0-1)
 */
function calculateStateSimilarity(
  source: Element5D['state'],
  target: Element5D['state']
): number {
  let score = 0;
  let total = 0;
  
  // State matches
  const stateKeys: (keyof Element5D['state'])[] = ['active', 'disabled', 'focused', 'visible', 'checked', 'selected', 'expanded'];
  
  for (const key of stateKeys) {
    if (source[key] !== undefined && target[key] !== undefined) {
      total++;
      score += source[key] === target[key] ? 1 : 0;
    }
  }
  
  // Expected interaction
  total++;
  score += source.expectedInteraction === target.expectedInteraction ? 1 : 0;
  
  return total > 0 ? score / total : 0;
}

/**
 * Calculate content similarity (0-1)
 */
function calculateContentSimilarity(
  source: Element5D['content'],
  target: Element5D['content']
): number {
  let score = 0;
  let total = 0;
  
  // Text similarity using Levenshtein-like approach
  if (source.visibleText && target.visibleText) {
    total++;
    score += calculateTextSimilarity(source.visibleText, target.visibleText);
  }
  
  // Semantic meaning match
  if (source.semanticMeaning && target.semanticMeaning) {
    total++;
    score += source.semanticMeaning === target.semanticMeaning ? 1 :
            source.semanticMeaning.includes(target.semanticMeaning) ? 0.7 : 0.3;
  }
  
  // Placeholder match
  if (source.placeholder && target.placeholder) {
    total++;
    score += source.placeholder === target.placeholder ? 1 : 0;
  }
  
  return total > 0 ? score / total : 0;
}

/**
 * Calculate text similarity (0-1) using Jaccard index on words
 */
function calculateTextSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  const words2 = new Set(text2.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  
  if (words1.size === 0 && words2.size === 0) return 1;
  if (words1.size === 0 || words2.size === 0) return 0;
  
  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

/**
 * Generate human-readable details for similarity score
 */
function generateSimilarityDetails(scores: SimilarityScore['dimensions']): string[] {
  const details: string[] = [];
  
  if (scores.attributes >= 0.8) details.push('Strong attribute match');
  else if (scores.attributes >= 0.5) details.push('Moderate attribute match');
  
  if (scores.visual >= 0.8) details.push('Similar visual properties');
  else if (scores.visual >= 0.5) details.push('Some visual similarity');
  
  if (scores.hierarchy >= 0.8) details.push('Same DOM structure');
  else if (scores.hierarchy >= 0.5) details.push('Similar hierarchy');
  
  if (scores.state >= 0.8) details.push('Matching states');
  else if (scores.state >= 0.5) details.push('Some state differences');
  
  if (scores.content >= 0.8) details.push('Similar content');
  else if (scores.content >= 0.5) details.push('Some content overlap');
  
  return details;
}

/**
 * Find best matching element from a list based on 5D similarity
 */
export function findBestMatch(
  source: Element5D,
  candidates: Element5D[],
  options?: {
    minThreshold?: number;
    preferSameTag?: boolean;
  }
): { element: Element5D; score: SimilarityScore } | null {
  const opts = {
    minThreshold: MEDIUM_THRESHOLD,
    preferSameTag: true,
    ...options,
  };
  
  const scored = candidates.map(candidate => ({
    element: candidate,
    score: calculateSimilarity(source, candidate),
  }));
  
  // Filter by minimum threshold
  const filtered = scored.filter(s => s.score.overall >= opts.minThreshold!);
  
  if (filtered.length === 0) return null;
  
  // Sort by overall score
  filtered.sort((a, b) => b.score.overall - a.score.overall);
  
  // If preferSameTag, boost same-tag elements
  if (opts.preferSameTag) {
    const sameTag = filtered.find(s => s.element.tagName === source.tagName);
    const bestNonTag = filtered.find(s => s.element.tagName !== source.tagName);
    
    if (sameTag && bestNonTag) {
      // If same tag is within 10% of best, prefer it
      if (sameTag.score.overall >= bestNonTag.score.overall - 0.1) {
        return sameTag;
      }
    }
  }
  
  return filtered[0];
}
