# Scope Definition: User Authentication System

## Feature Overview

Secure authentication system với OAuth2 (Google, GitHub) và JWT tokens. Support cả web session-based auth và API token-based auth.

## Goals

1. Enable users to authenticate via OAuth2 providers (Google, GitHub)
2. Protect API endpoints with JWT Bearer tokens
3. Provide secure session management for web clients
4. Allow password reset via email verification

## ✅ In Scope

### Core Features

- [ ] **OAuth2 Login**
  - Google OAuth2 flow (authorization code grant)
  - GitHub OAuth2 flow (authorization code grant)
  - User profile sync from OAuth providers
  - OAuth callback handling

- [ ] **JWT Authentication**
  - Access token generation (15 min expiry)
  - Refresh token generation (7 day expiry)
  - Token validation middleware
  - Token refresh endpoint

- [ ] **Session Management**
  - HTTP-only secure cookies for web
  - Redis session store
  - Session invalidation on logout
  - Session expiry (7 days)

- [ ] **User Registration**
  - Email/password registration
  - Email verification link
  - Unique email constraint
  - Password strength validation

- [ ] **Password Reset**
  - Forgot password flow
  - Email with reset link
  - Reset token validation (1 hour expiry)
  - New password entry

- [ ] **Security Features**
  - Rate limiting (5 attempts/minute per IP)
  - Password hashing with Argon2
  - CORS configuration
  - Security headers

### User Stories

| ID | User Story | Acceptance Criteria |
|----|------------|---------------------|
| US-01 | As a user, I want to login with Google | Then I'm redirected to Google, authenticate, and return logged in |
| US-02 | As a user, I want to login with GitHub | Then I'm redirected to GitHub, authenticate, and return logged in |
| US-03 | As a user, I want to login with email/password | Then I receive JWT tokens and am logged in |
| US-04 | As a user, I want to logout | Then my session is invalidated and I'm redirected to home |
| US-05 | As a user, I want to reset my password | Then I receive email with reset link and can set new password |
| US-06 | As an API client, I want to authenticate with JWT | Then I can access protected endpoints |

## ❌ Out of Scope

### Not Included (v1.0)

- [ ] Social account linking (multiple OAuth providers per user)
- [ ] Two-factor authentication (TOTP)
- [ ] SSO enterprise features
- [ ] Biometric authentication
- [ ] Magic links (email-only login)
- [ ] Remember me functionality
- [ ] Login with Apple ID

### Future Phases (v2.0)

- [ ] Two-factor authentication (TOTP/SMS)
- [ ] Single Sign-On (SAML/OIDC for enterprise)
- [ ] Account locking after failed attempts
- [ ] Session monitoring dashboard
- [ ] OAuth provider account linking

## Constraints

### Technical Constraints

| Constraint | Description |
|------------|-------------|
| Tech Stack | Node.js 18+, Express, TypeScript |
| Database | PostgreSQL 14+ |
| Cache | Redis 7+ |
| OAuth | OAuth2 with PKCE (security best practice) |
| JWT | RS256 algorithm (asymmetric) |
| Password Hash | Argon2id |

### Browser Support

| Browser | Version |
|---------|---------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

### Performance

| Metric | Target |
|--------|--------|
| Auth latency | < 100ms (p95) |
| Token validation | < 10ms |
| Concurrent sessions | 10,000+ |

## Assumptions

| # | Assumption | Impact if Wrong |
|---|------------|-----------------|
| 1 | Google/GitHub OAuth apps will be approved | Delays launch |
| 2 | Email service (SendGrid) will be available | Need fallback |
| 3 | Redis will be available in production | Need session fallback to DB |
| 4 | Users have HTTPS-capable browsers | OAuth redirect issues |

## Dependencies

### Internal Dependencies

| Dependency | Team/Component | Status | Notes |
|------------|----------------|--------|-------|
| Database schema | DBA | ✅ Ready | User, Session tables |
| Redis setup | DevOps | ✅ Ready | Session store |
| Config management | DevOps | ✅ Ready | env variables |

### External Dependencies

| Dependency | Service | Status | Notes |
|------------|---------|--------|-------|
| Google OAuth | Google Cloud | ✅ Available | Need client credentials |
| GitHub OAuth | GitHub | ✅ Available | Need client credentials |
| Email service | SendGrid | 🔄 Pending | API key needed |
| Domain SSL | Let's Encrypt | ✅ Available | Auto-renew |

## Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| OAuth provider downtime | Low | High | Email/password fallback |
| Token leakage via XSS | Low | High | HTTP-only cookies, short expiry |
| Brute force attacks | Medium | Medium | Rate limiting + captcha |
| Database password breach | Low | Critical | Argon2 + encrypted backup |
| OAuth callback hijacking | Low | High | PKCE + state parameter |

## Acceptance Criteria

| # | Criteria | Test Method |
|---|----------|-------------|
| AC-01 | User can login with Google OAuth | E2E test: click Google btn → Google auth → logged in |
| AC-02 | User can login with GitHub OAuth | E2E test: click GitHub btn → GitHub auth → logged in |
| AC-03 | User can register with email | Unit test: POST /auth/register → email sent |
| AC-04 | User can login with email/password | Integration test: POST /auth/login → JWT tokens returned |
| AC-05 | Protected endpoint rejects invalid token | Unit test: GET /api/user with bad token → 401 |
| AC-06 | Refresh token rotates on use | Integration test: POST /auth/refresh → new refresh token |
| AC-07 | Rate limiting blocks after 5 attempts | Integration test: 6 POST /auth/login → 429 |
| AC-08 | Password reset works | E2E test: forgot password → email → reset password → login |

## Definition of Done

- [ ] All 6 user stories implemented
- [ ] All 8 acceptance criteria passing
- [ ] Code reviewed and approved
- [ ] Unit test coverage > 80%
- [ ] Integration tests for all auth flows
- [ ] Security audit completed (no Critical/High issues)
- [ ] Documentation updated (API docs, README)
- [ ] OAuth apps registered with Google/GitHub
- [ ] Email templates created
- [ ] Deployed to staging and tested
