# Skills Templates

Skill-specific scaffolding templates for generating code and documents.

## Templates

| Template | Description |
|----------|-------------|
| `devops-checklist.hbs` | DevOps phase checklist |
| `sre-template.hbs` | SRE runbook template |
| `swe-patterns.hbs` | Software engineer patterns (auth, API) |
| `migration.hbs` | Database migration template |
| `assertions.ts.hbs` | Mobile testing assertions |
| `level-blockout.hbs` | Level design blockout template |
| `material-templates.hbs` | Technical artist material docs |
| `growth-strategy.hbs` | Growth marketing strategy |
| `prompt-templates/` | Prompt engineering templates |
| &nbsp;&nbsp;&nbsp;`system-prompt.hbs` | System prompt template |
| &nbsp;&nbsp;&nbsp;`user-prompt.hbs` | User prompt template |
| &nbsp;&nbsp;&nbsp;`few-shot.hbs` | Few-shot example template |
| &nbsp;&nbsp;&nbsp;`chain-of-thought.hbs` | Chain-of-thought template |

## Usage

```bash
# Generate DevOps checklist
npx ts-node scripts/generate-template.ts \
  --template skills/devops-checklist \
  --output ./docs/devops/checklist.md \
  --data '{"project": "my-app", "phase": "deploy"}'

# Generate database migration
npx ts-node scripts/generate-template.ts \
  --template skills/migration \
  --output ./migrations/001_create_users.sql \
  --data '{"table": "users", "columns": ["id", "email", "name"]}'
```

## Context Variables

```typescript
{
  project?: string;         // Project name
  phase?: string;           // Current phase (build, test, deploy, monitor)
  table?: string;           // Database table name
  columns?: string[];       // Table columns
  platform?: string;        // Platform (ios, android)
}
```

## Prompt Templates

See `prompt-templates/README.md` for detailed usage.
