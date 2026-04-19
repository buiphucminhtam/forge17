# Prompt Templates

Templates for prompt engineering — system prompts, user prompts, few-shot examples, and chain-of-thought reasoning.

## Templates

| Template | Description |
|----------|-------------|
| `system-prompt.hbs` | System prompt with role, context, guidelines |
| `user-prompt.hbs` | User prompt with task, context, output format |
| `few-shot.hbs` | Few-shot example template (input → output pairs) |
| `chain-of-thought.hbs` | Chain-of-thought reasoning template |

## Usage

```bash
# Generate system prompt
npx ts-node scripts/generate-template.ts \
  --template skills/prompt-templates/system-prompt \
  --output ./prompts/system.md \
  --data '{"role": "Code Reviewer", "focus": "security"}'

# Generate few-shot prompt
npx ts-node scripts/generate-template.ts \
  --template skills/prompt-templates/few-shot \
  --output ./prompts/few-shot.md \
  --data '{"task": "Summarize PR", "examples": 3}'
```

## Context Variables

```typescript
{
  role?: string;           // AI role (e.g., "Code Reviewer")
  focus?: string;          // Focus area (e.g., "security", "performance")
  task?: string;           // Task description
  examples?: number;       // Number of few-shot examples
  guidelines?: string[];    // Custom guidelines
  constraints?: string[];  // Output constraints
  outputFormat?: string;   // Expected output format
}
```

## Template Structure

### System Prompt

```markdown
# Role: [Role Name]

## Context
[Brief context about the domain]

## Guidelines
1. [Guideline 1]
2. [Guideline 2]

## Constraints
- [Constraint 1]
- [Constraint 2]
```

### User Prompt

```markdown
# Task: [Task Description]

## Input
{{input}}

## Context
{{context}}

## Expected Output Format
{{format}}
```
