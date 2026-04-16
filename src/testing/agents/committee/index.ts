/**
 * Multi-Agent Committee Pattern
 * 
 * Based on arXiv 2512.21352 - Multi-Agent LLM Committees
 * 
 * Key findings:
 * - 2-4 agents = 91.7-100% success rate
 * - 3-round voting protocol
 * - 70% threshold for consensus
 * - 13.7-22 percentage point improvement over single agent
 */

import { callLLM, getLLMConfig, type LLMProvider } from '../../config/llm-providers';

export type AgentPersona = 'pragmatic' | 'critical' | 'thorough';

export interface CommitteeMember {
  id: string;
  persona: AgentPersona;
  role: string;
  expertise: string[];
  llm?: string;
}

export interface Vote {
  memberId: string;
  choice: string;
  confidence: number;
  reasoning: string;
}

export interface CommitteeDecision {
  consensus: boolean;
  winningChoice?: string;
  votes: Vote[];
  rounds: number;
  confidence: number;
  fallback?: string;
}

export interface CommitteeConfig {
  members: CommitteeMember[];
  rounds: number;           // 3-round voting protocol
  threshold: number;       // 0.7 = 70% agreement
  fallback: 'abstain' | 'random' | 'human';
  timeout: number;          // ms
}

const DEFAULT_CONFIG: CommitteeConfig = {
  members: [
    {
      id: 'executor',
      persona: 'pragmatic',
      role: 'Execute tests, find bugs',
      expertise: ['testing', 'execution', 'automation'],
    },
    {
      id: 'reviewer',
      persona: 'critical',
      role: 'Challenge assumptions, find edge cases',
      expertise: ['security', 'edge-cases', 'validation'],
    },
    {
      id: 'validator',
      persona: 'thorough',
      role: 'Verify fixes, ensure quality',
      expertise: ['verification', 'quality', 'coverage'],
    },
  ],
  rounds: 3,
  threshold: 0.7,
  fallback: 'human',
  timeout: 30000,
};

/**
 * Multi-Agent Committee
 * 
 * Uses LLM committees with voting protocol for autonomous testing decisions
 */
export class AgentCommittee {
  private config: CommitteeConfig;
  private provider: LLMProvider;
  
  constructor(
    config: Partial<CommitteeConfig> = {},
    provider: LLMProvider = 'openai'
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.provider = provider;
  }
  
  /**
   * Make a decision through multi-agent consensus
   */
  async decide(
    question: string,
    choices: string[],
    context?: Record<string, unknown>
  ): Promise<CommitteeDecision> {
    const allVotes: Vote[][] = [];
    let currentChoices = choices;
    
    // Run voting rounds
    for (let round = 0; round < this.config.rounds; round++) {
      const roundVotes = await this.voteRound(question, currentChoices, context);
      allVotes.push(roundVotes);
      
      // Check for consensus
      const consensus = this.checkConsensus(roundVotes);
      if (consensus) {
        return {
          consensus: true,
          winningChoice: consensus.winningChoice,
          votes: roundVotes,
          rounds: round + 1,
          confidence: consensus.confidence,
        };
      }
      
      // If no consensus, narrow choices for next round
      currentChoices = this.narrowChoices(roundVotes, currentChoices);
      
      // If only one choice left, stop
      if (currentChoices.length <= 1) break;
    }
    
    // No consensus after all rounds
    return this.handleNoConsensus(allVotes, choices);
  }
  
  /**
   * Vote round
   */
  private async voteRound(
    question: string,
    choices: string[],
    context?: Record<string, unknown>
  ): Promise<Vote[]> {
    const votes = await Promise.all(
      this.config.members.map(member => this.getMemberVote(member, question, choices, context))
    );
    return votes;
  }
  
  /**
   * Get vote from a committee member
   */
  private async getMemberVote(
    member: CommitteeMember,
    question: string,
    choices: string[],
    context?: Record<string, unknown>
  ): Promise<Vote> {
    const config = getLLMConfig(this.provider);
    
    const personaPrompt = this.getPersonaPrompt(member.persona);
    const choiceOptions = choices.map((c, i) => `${i + 1}. ${c}`).join('\n');
    
    const prompt = `
${personaPrompt}

Question: ${question}

Available choices:
${choiceOptions}

${context ? `\nContext:\n${JSON.stringify(context, null, 2)}` : ''}

Your task: Choose the best option (by number) and explain your reasoning.
Provide your answer in this format:
CHOICE: [number]
CONFIDENCE: [0.0-1.0]
REASONING: [your explanation]
`;
    
    try {
      const response = await callLLM(config, prompt);
      const parsed = this.parseVoteResponse(response.content);
      
      return {
        memberId: member.id,
        choice: choices[parsed.choice - 1] || choices[0],
        confidence: parsed.confidence,
        reasoning: parsed.reasoning,
      };
    } catch (error) {
      // Default to first choice on error
      return {
        memberId: member.id,
        choice: choices[0],
        confidence: 0.5,
        reasoning: 'Error during voting, defaulting to first option',
      };
    }
  }
  
  /**
   * Parse vote response from LLM
   */
  private parseVoteResponse(content: string): { choice: number; confidence: number; reasoning: string } {
    const choiceMatch = content.match(/CHOICE:\s*(\d+)/i);
    const confidenceMatch = content.match(/CONFIDENCE:\s*([\d.]+)/i);
    const reasoningMatch = content.match(/REASONING:\s*([\s\S]*?)(?:CHOICE|CONFIDENCE|$)/i);
    
    return {
      choice: choiceMatch ? parseInt(choiceMatch[1], 10) : 1,
      confidence: confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.5,
      reasoning: reasoningMatch ? reasoningMatch[1].trim() : '',
    };
  }
  
  /**
   * Get persona-specific prompt
   */
  private getPersonaPrompt(persona: AgentPersona): string {
    const prompts = {
      pragmatic: `You are a PRAGMATIC decision maker.
Focus on practical, actionable solutions.
Prioritize speed and reliability over completeness.
Choose the option that will work best in practice.`,
      
      critical: `You are a CRITICAL reviewer.
Challenge assumptions and look for edge cases.
Be skeptical of easy answers.
Choose the option that has been most thoroughly validated.`,
      
      thorough: `You are a THOROUGH validator.
Ensure complete coverage and detailed validation.
Consider all possible scenarios.
Choose the option that provides the best overall quality.`,
    };
    
    return prompts[persona];
  }
  
  /**
   * Check if consensus has been reached
   */
  private checkConsensus(votes: Vote[]): { consensus: boolean; winningChoice?: string; confidence: number } {
    if (votes.length === 0) return { consensus: false };
    
    // Count votes per choice
    const voteCounts: Record<string, { count: number; totalConfidence: number }> = {};
    
    votes.forEach(vote => {
      if (!voteCounts[vote.choice]) {
        voteCounts[vote.choice] = { count: 0, totalConfidence: 0 };
      }
      voteCounts[vote.choice].count++;
      voteCounts[vote.choice].totalConfidence += vote.confidence;
    });
    
    // Check if any choice meets threshold
    const totalVotes = votes.length;
    
    for (const [choice, { count, totalConfidence }] of Object.entries(voteCounts)) {
      const voteRatio = count / totalVotes;
      const avgConfidence = totalConfidence / count;
      const weightedScore = voteRatio * avgConfidence;
      
      if (weightedScore >= this.config.threshold) {
        return {
          consensus: true,
          winningChoice: choice,
          confidence: weightedScore,
        };
      }
    }
    
    return { consensus: false, confidence: 0 };
  }
  
  /**
   * Narrow choices based on votes for next round
   */
  private narrowChoices(votes: Vote[], currentChoices: string[]): string[] {
    // Get vote counts
    const voteCounts: Record<string, number> = {};
    
    votes.forEach(vote => {
      voteCounts[vote.choice] = (voteCounts[vote.choice] || 0) + vote.confidence;
    });
    
    // Sort by votes
    const sorted = Object.entries(voteCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([choice]) => choice);
    
    // Keep top 2 choices
    return sorted.slice(0, Math.min(2, sorted.length));
  }
  
  /**
   * Handle no consensus after all rounds
   */
  private handleNoConsensus(allVotes: Vote[][][], originalChoices: string[]): CommitteeDecision {
    // Get final votes from last round
    const finalVotes = allVotes[allVotes.length - 1];
    
    // Count total votes
    const voteCounts: Record<string, number> = {};
    finalVotes.forEach(vote => {
      voteCounts[vote.choice] = (voteCounts[vote.choice] || 0) + 1;
    });
    
    // Pick the choice with most votes
    const winner = Object.entries(voteCounts)
      .sort((a, b) => b[1] - a[1])[0];
    
    const winningChoice = winner ? winner[0] : this.config.fallback === 'random'
      ? originalChoices[Math.floor(Math.random() * originalChoices.length)]
      : undefined;
    
    return {
      consensus: false,
      winningChoice,
      votes: finalVotes,
      rounds: allVotes.length,
      confidence: winner ? winner[1] / finalVotes.length : 0,
      fallback: winningChoice ? undefined : this.config.fallback,
    };
  }
  
  /**
   * Get committee statistics
   */
  getStats(): {
    members: number;
    rounds: number;
    threshold: number;
  } {
    return {
      members: this.config.members.length,
      rounds: this.config.rounds,
      threshold: this.config.threshold,
    };
  }
}
