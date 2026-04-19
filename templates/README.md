# Templates

> Canonical template directory for Forgewright v8.1+

**Status:** Active development — see [antigravity plan](../antigravity/planning/forgewright-v81-templates/PLAN.md)

## Categories

| Category | Path | Description |
|----------|------|-------------|
| **Docker** | `docker/` | Multi-stage Dockerfiles, docker-compose for dev/test/game |
| **CI/CD** | `ci/` | GitHub Actions workflows (CI, CD, PR checks, scheduled) |
| **Config** | `config/` | Project configuration (Jest, Prettier, ESLint, TSConfig) |
| **SRE** | `sre/` | Incident management, on-call, escalation, RCA |
| **Cursor** | `cursor/` | Cursor IDE rules and agent prompt templates |
| **Skills** | `skills/` | Skill-specific scaffolding (DevOps, SRE, SWE, Prompt, etc.) |
| **Game** | `game/` | Game engine templates (Godot multiplayer) |

## Usage

### Generate a single template

```bash
npx ts-node scripts/generate-template.ts \
  --template docker/Dockerfile \
  --output ./Dockerfile \
  --data '{"name": "my-app", "port": 3000}'
```

### Generate from category

```bash
npx ts-node scripts/generate-template.ts \
  --category ci \
  --output ./.github/workflows/
```

### List available templates

```bash
npx ts-node scripts/generate-template.ts --list
```

## Template Format

- **Code templates**: Handlebars (`.hbs`) with `{{variable}}` syntax
- **Config templates**: Native format (`.js`, `.json`, `.yaml`) with Handlebars placeholders
- **Doc templates**: Markdown with Handlebars for dynamic content

## Context Variables

All templates receive a shared context:

```typescript
interface TemplateContext {
  project: {
    name: string;       // "my-project"
    slug: string;       // "my-project"
    version: string;     // "1.0.0"
    description: string;
  };
  docker?: {
    baseImage?: string;
    port?: number;
    healthCheck?: boolean;
  };
  ci?: {
    nodeVersion?: string;
    testCommand?: string;
    lintCommand?: string;
  };
  sre?: {
    team?: string;
    severityLevels?: string[];
  };
}
```

## Adding New Templates

1. Create template file in appropriate category directory
2. Use Handlebars syntax for dynamic content
3. Document context variables used
4. Add entry to this README
5. Add test case in `scripts/generate-template.test.ts`

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 8.1.0 | 2026-04-20 | Initial templates directory |
