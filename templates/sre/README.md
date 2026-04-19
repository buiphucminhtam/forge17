# SRE Templates

Site Reliability Engineering templates for incident management, on-call, and operations.

## Templates

| Template | Description |
|----------|-------------|
| `war-room-checklist.hbs` | Incident response checklist for war room |
| `incident-comms.hbs` | Status page and stakeholder communications |
| `on-call-rotation.yaml.hbs` | On-call rotation schedule |
| `escalation-policy.hbs` | Escalation matrix (SEV levels) |
| `incident-report.hbs` | Post-incident report |
| `rca.hbs` | Root Cause Analysis template |

## Usage

```bash
# Generate incident report
npx ts-node scripts/generate-template.ts \
  --template sre/incident-report \
  --output ./docs/incidents/INC-001.md \
  --data '{"incidentId": "INC-001", "severity": "SEV2", "date": "2026-04-20"}'

# Generate on-call rotation
npx ts-node scripts/generate-template.ts \
  --template sre/on-call-rotation \
  --output ./docs/sre/on-call-rotation.yaml \
  --data '{"team": "platform", "rotationLength": "weekly"}'
```

## Context Variables

```typescript
{
  incidentId?: string;       // e.g., "INC-001"
  severity?: string;         // SEV1 | SEV2 | SEV3 | SEV4
  date?: string;             // ISO date
  team?: string;             // Team name (e.g., "platform")
  rotationLength?: string;   // "weekly" | "biweekly" | "monthly"
  primaryOnCall?: string;    // Primary on-call name
  secondaryOnCall?: string; // Secondary on-call name
  affectedService?: string;  // Affected service name
  impactDuration?: string;   // e.g., "2h 30m"
}
```

## Severity Levels

| Level | Description | Response Time | Example |
|-------|-------------|---------------|---------|
| SEV1 | Complete outage | 15 min | Production down |
| SEV2 | Major degradation | 30 min | Feature broken |
| SEV3 | Minor degradation | 2 hours | Non-critical issue |
| SEV4 | Low impact | Next business day | Cosmetic issue |
