# Config Templates

Project configuration templates for linting, testing, formatting, and development tooling.

## Templates

| Template | Description |
|----------|-------------|
| `jest.config.js.hbs` | Jest with TypeScript, coverage, isolated modules |
| `prettierrc.hbs` | Prettier v3 config (Forgewright style) |
| `tsconfig.base.hbs` | Base TypeScript config (strict mode) |
| `.eslintrc.root.hbs` | Root ESLint config (workspace-wide) |
| `env.example.hbs` | Environment variable template |
| `Makefile.hbs` | Common build targets |
| `.editorconfig.hbs` | EditorConfig standard settings |

## Usage

```bash
# Generate Jest config
npx ts-node scripts/generate-template.ts \
  --template config/jest.config.js \
  --output ./jest.config.js

# Generate Prettier config
npx ts-node scripts/generate-template.ts \
  --template config/prettierrc \
  --output ./.prettierrc

# Generate .env.example
npx ts-node scripts/generate-template.ts \
  --template config/env.example \
  --output ./.env.example
```

## Context Variables

```typescript
{
  project: string;           // Project name
  port?: number;             // Default port (e.g., 3000)
  databaseUrl?: string;      // Database connection string
  nodeVersion?: string;      // Node version (e.g., 20)
  testEnvironment?: string;  // jest-environment-jsdom | node
  coverageThreshold?: number;// Coverage threshold (default: 80)
}
```

## Prettier v3 Settings

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "quoteProps": "consistent",
  "trailingComma": "all",
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```
