# CI/CD Templates

GitHub Actions workflow templates for continuous integration and deployment.

## Templates

| Template | Description |
|----------|-------------|
| `github-ci.hbs` | Test + lint + type-check pipeline |
| `github-cd-staging.hbs` | Auto-deploy to staging on push to develop |
| `github-cd-production.hbs` | Manual approval + deploy to production |
| `github-pr-checks.hbs` | PR validation (lint, test, preview) |
| `commit-lint.hbs` | Conventional Commits enforcement |
| `scheduled.hbs` | Cron job template (daily/weekly) |

## Usage

```bash
# Generate CI pipeline
npx ts-node scripts/generate-template.ts \
  --template ci/github-ci \
  --output ./.github/workflows/ci.yml \
  --data '{"project": "my-app", "nodeVersion": "20"}'

# Generate CD pipeline
npx ts-node scripts/generate-template.ts \
  --template ci/github-cd-production \
  --output ./.github/workflows/cd-production.yml \
  --data '{"project": "my-app", "environment": "production"}'
```

## Context Variables

```typescript
{
  project: string;       // Project name
  nodeVersion?: string;  // Default: 20
  testCommand?: string;  // Default: npm test
  lintCommand?: string;  // Default: npm run lint
  environment?: string;  // staging | production
  team?: string;         // Team for notifications
}
```

## Workflow Triggers

| Workflow | Trigger |
|----------|---------|
| CI | push (main), pull_request |
| CD Staging | push (develop) |
| CD Production | push (main) with manual approval |
| PR Checks | pull_request |
| Commit Lint | commit messages |
| Scheduled | cron (configurable) |
