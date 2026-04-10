# Security Documentation Template

> Template cho security documentation. Sử dụng khi document security practices và checklist.

## Overview

[Brief description of security practices]

## Security Principles

### Core Principles

1. **Defense in Depth** — Multiple layers of security
2. **Least Privilege** — Minimum necessary permissions
3. **Secure by Default** — Security enabled out of the box
4. **Fail Securely** — Fail in a secure manner

## Authentication & Authorization

### Authentication Methods

| Method | Use Case | Implementation |
|--------|----------|----------------|
| JWT | API authentication | Bearer token |
| OAuth2 | Third-party login | Social login providers |
| Session | Web app | HTTP-only cookies |
| API Key | Service-to-service | Header authentication |

### Authorization

| Pattern | Implementation |
|---------|----------------|
| RBAC | Role-based access control |
| ABAC | Attribute-based access control |
| Policy-based | OPA/ Casbin |

### Password Requirements

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character
- Not in common password list
- Not reused from other sites

## Data Protection

### Encryption

| Data State | Encryption | Algorithm |
|------------|------------|-----------|
| At rest | Required | AES-256-GCM |
| In transit | Required | TLS 1.3 |
| In memory | Recommended | Application-level |

### Sensitive Data Handling

- [ ] PII encrypted at rest
- [ ] Secrets in environment variables
- [ ] No secrets in code
- [ ] No secrets in logs
- [ ] No secrets in error messages
- [ ] Secrets rotated regularly

### Data Retention

| Data Type | Retention | Disposal |
|-----------|----------|----------|
| User data | Per user request | Secure deletion |
| Logs | 90 days | Automatic deletion |
| Backups | 30 days | Automatic deletion |
| Audit logs | 1 year | Secure deletion |

## API Security

### Authentication

```bash
# JWT Bearer Token
curl -H "Authorization: Bearer <token>" https://api.example.com/v1/resource

# API Key
curl -H "X-API-Key: <key>" https://api.example.com/v1/resource
```

### Rate Limiting

| Tier | Limit | Window |
|------|-------|--------|
| Anonymous | 20 requests | 1 minute |
| Authenticated | 100 requests | 1 minute |
| Premium | 1000 requests | 1 minute |

### Input Validation

- [ ] All inputs validated
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Request size limits
- [ ] Content-type validation

## Common Vulnerabilities

### OWASP Top 10

| # | Vulnerability | Prevention |
|---|---------------|------------|
| 1 | Injection | Parameterized queries, input validation |
| 2 | Broken Auth | Strong auth, session management |
| 3 | Sensitive Data Exposure | Encryption, secure storage |
| 4 | XML External Entities | Disable XXE, use JSON |
| 5 | Broken Access Control | Authorization checks, least privilege |
| 6 | Security Misconfiguration | Hardened configs, regular audits |
| 7 | XSS | Output encoding, CSP |
| 8 | Insecure Deserialization | Type checking, signature validation |
| 9 | Using Components with Vulnerabilities | Dependency scanning, updates |
| 10 | Insufficient Logging | Centralized logging, alerting |

### Security Headers

| Header | Value | Purpose |
|--------|-------|---------|
| Content-Security-Policy | default-src 'self' | Prevent XSS |
| X-Content-Type-Options | nosniff | Prevent MIME sniffing |
| X-Frame-Options | DENY | Prevent clickjacking |
| X-XSS-Protection | 1; mode=block | XSS filter (legacy) |
| Strict-Transport-Security | max-age=31536000 | Enforce HTTPS |
| Referrer-Policy | strict-origin-when-cross-origin | Control referrer |

## Secrets Management

### Environment Variables

```bash
# ❌ Bad - secrets in code
const apiKey = "sk-1234567890abcdef";

# ✅ Good - secrets from environment
const apiKey = process.env.API_KEY;
```

### Secret Storage

| Environment | Storage |
|-------------|---------|
| Development | .env file (not committed) |
| Staging | Secrets manager |
| Production | Vault / AWS Secrets Manager |

### Rotation Policy

| Secret Type | Rotation Interval |
|-------------|-------------------|
| API Keys | 90 days |
| JWT Secrets | 30 days |
| Database Passwords | 30 days |
| Encryption Keys | 365 days |

## Incident Response

### Severity Levels

| Level | Response Time | Example |
|-------|---------------|---------|
| Critical | 15 minutes | Data breach, system compromise |
| High | 1 hour | Vulnerability exploited |
| Medium | 4 hours | Suspicious activity |
| Low | 24 hours | Minor security issue |

### Response Process

1. **Detect** — Identify the security incident
2. **Contain** — Limit the damage
3. **Eradicate** — Remove the threat
4. **Recover** — Restore normal operations
5. **Post-mortem** — Document and learn

### Contact Information

| Role | Contact | Availability |
|------|---------|--------------|
| Security Team | security@example.com | 24/7 |
| DevOps On-call | oncall@example.com | 24/7 |
| CTO | cto@example.com | Business hours |

## Security Checklist

### Pre-Development

- [ ] Security requirements defined
- [ ] Threat model created
- [ ] Security architecture reviewed
- [ ] Dependencies vetted

### During Development

- [ ] Secure coding standards followed
- [ ] Code reviewed for security
- [ ] Security testing integrated
- [ ] Secrets not committed

### Pre-Deployment

- [ ] Penetration testing completed
- [ ] Security review passed
- [ ] Configuration hardened
- [ ] Monitoring configured

### Post-Deployment

- [ ] Security monitoring active
- [ ] Incident response plan ready
- [ ] Regular security audits scheduled
- [ ] Dependency updates automated

## Tools & Automation

### Security Scanning

| Tool | Purpose | Integration |
|------|---------|-------------|
| SAST | Static analysis | CI/CD |
| DAST | Dynamic analysis | CI/CD |
| SCA | Dependency scanning | CI/CD |
| Secrets scanning | Detect secrets | CI/CD |

### Monitoring

| Tool | Purpose | Alerts |
|------|---------|--------|
| SIEM | Centralized logging | Yes |
| WAF | Web application firewall | Yes |
| IDS/IPS | Intrusion detection | Yes |
| APM | Application monitoring | Yes |

## Compliance

### Standards

| Standard | Requirement | Status |
|----------|-------------|--------|
| GDPR | Data protection | [✅/❌] |
| SOC 2 | Security controls | [✅/❌] |
| PCI DSS | Payment security | [✅/❌] |
| HIPAA | Health data | [✅/❌] |

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-01-01 | Initial security docs |
| 1.1.0 | 2024-02-01 | Added incident response |
