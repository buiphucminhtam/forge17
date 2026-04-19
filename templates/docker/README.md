# Docker Templates

Multi-stage Dockerfiles and docker-compose configurations for containerized development and deployment.

## Templates

| Template | Description |
|----------|-------------|
| `Dockerfile.service.hbs` | Multi-stage Node.js/TypeScript Dockerfile with non-root user |
| `docker-compose.dev.hbs` | Development environment with hot reload |
| `docker-compose.test.hbs` | Isolated test environment with dedicated network |
| `docker-compose.game.hbs` | Game server container (Godot/Rust server) |
| `dockerignore.hbs` | Node.js .dockerignore defaults |

## Usage

```bash
# Generate Dockerfile
npx ts-node scripts/generate-template.ts \
  --template docker/Dockerfile.service \
  --output ./Dockerfile \
  --data '{"name": "my-service", "port": 3000}'

# Generate docker-compose
npx ts-node scripts/generate-template.ts \
  --template docker/docker-compose.dev \
  --output ./docker-compose.yml \
  --data '{"name": "my-service", "port": 3000}'
```

## Context Variables

```typescript
{
  name: string;           // Service name (kebab-case)
  port: number;           // Exposed port
  baseImage?: string;     // Default: node:20-alpine
  healthCheck?: boolean;   // Default: true
  nodeVersion?: string;   // Default: 20
}
```

## Docker Features

- **Multi-stage build** — minimized final image
- **Non-root user** — security hardened
- **Health checks** — Docker HEALTHCHECK included
- **BuildKit** — leverage Docker BuildKit for faster builds
