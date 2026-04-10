# Documentation Guidelines

> Hướng dẫn cách viết documentation cho Forgewright.

## Documentation Types

| Type | Purpose | Template |
|------|---------|----------|
| **API Docs** | API endpoints, schemas, authentication | `API.md` |
| **Database Docs** | Schema, migrations, data dictionary | `DATABASE.md` |
| **UI Docs** | Design system, components, UX patterns | `UI.md` |
| **Security Docs** | Security checklist, practices | `SECURITY.md` |

## Writing Standards

### ✅ Good Documentation

- Clear, concise language
- Code examples that actually work
- Real-world use cases
- Cross-references between docs
- Version history

### ❌ Bad Documentation

- Outdated information
- Incomplete code examples
- No context
- Walls of text
- Missing error handling examples

## Code Examples

### Always Include

```javascript
// ❌ Bad - incomplete
const result = api.getData();

// ✅ Good - complete with error handling
try {
  const result = await api.getData();
  console.log(result);
} catch (error) {
  console.error('Failed to fetch data:', error.message);
}
```

### Structure

1. **Introduction** — What is this?
2. **Prerequisites** — What do you need?
3. **Quick Start** — Minimal working example
4. **Detailed Guide** — Full reference
5. **API Reference** — Complete API docs
6. **Examples** — Real-world use cases
7. **Troubleshooting** — Common issues

## Versioning

Maintain version history at top of each doc:

```markdown
## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-01-01 | Initial release |
| 1.1.0 | 2024-02-01 | Added X |
```
