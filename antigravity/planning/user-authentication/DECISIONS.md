# Architecture Decisions: User Authentication System

> Log tất cả architecture decisions cho authentication system.

## ADRs (Architecture Decision Records)

### ADR-001: JWT over Sessions for API Authentication

**Date:** 2026-04-10
**Status:** Accepted
**Context:** Need to protect API endpoints. Considering JWT tokens vs server-side sessions.

**Decision:** Use JWT tokens for API authentication

**Alternatives Considered:**

| Alternative | Pros | Cons |
|-------------|------|------|
| Server-side sessions | Easy to invalidate, less client code | Requires session store, not scalable |
| JWT (chosen) | Stateless, scalable, no server storage | Harder to invalidate, larger request size |
| API keys | Simple, persistent | No user context, security risk if leaked |

**Consequences:**
- **Positive:** Scalable, no session store needed for API auth
- **Negative:** Cannot invalidate individual tokens without blacklist

**Rationale:** Microservices architecture requires stateless auth. JWT tokens can be validated by any service without calling auth server. Token refresh provides re-authentication opportunity.

---

### ADR-002: OAuth2 Providers (Google + GitHub)

**Date:** 2026-04-10
**Status:** Accepted
**Context:** Need social login options. Which OAuth providers to support?

**Decision:** Support Google and GitHub OAuth2

**Alternatives Considered:**

| Alternative | Pros | Cons |
|-------------|------|------|
| Google only | Simple, high adoption | Single point of failure |
| Google + GitHub (chosen) | Good coverage, common for developers | Extra integration work |
| Multiple (FB, Twitter, etc.) | Maximum reach | Complexity, maintenance burden |

**Consequences:**
- **Positive:** Covers majority of users, familiar for developers
- **Negative:** Need to maintain two OAuth integrations

**Rationale:** Google and GitHub cover both general users and developers. Easy to add more providers later if needed.

---

### ADR-003: HTTP-only Cookies for Web Sessions

**Date:** 2026-04-10
**Status:** Accepted
**Context:** Need to store session tokens securely in browser.

**Decision:** Use HTTP-only, Secure, SameSite=Strict cookies

**Alternatives Considered:**

| Alternative | Pros | Cons |
|-------------|------|------|
| LocalStorage | Easy to access, persist across tabs | Vulnerable to XSS |
| SessionStorage | Isolated per tab | Lost on tab close |
| HTTP-only cookies (chosen) | XSS protected, automatic | Requires CSRF protection |

**Consequences:**
- **Positive:** Protected from XSS, browser handles security
- **Negative:** Need CSRF token for state-changing requests

**Rationale:** HTTP-only cookies are the standard for web authentication. Browser provides built-in XSS protection. Will implement CSRF tokens via double-submit cookie pattern.

---

### ADR-004: Argon2id for Password Hashing

**Date:** 2026-04-10
**Status:** Accepted
**Context:** Need to securely hash user passwords before storage.

**Decision:** Use Argon2id algorithm

**Alternatives Considered:**

| Alternative | Pros | Cons |
|-------------|------|------|
| bcrypt | Widely used, battle-tested | GPU-acceleratable |
| scrypt | Memory-hard | Higher resource usage |
| Argon2id (chosen) | Memory-hard, side-channel resistant | Newer, less adoption |
| PBKDF2 | Standard, widely supported | Configurable, can be weak |

**Consequences:**
- **Positive:** Best available password hashing, resistant to GPU/ASIC attacks
- **Negative:** Higher CPU/memory usage, need tuning

**Rationale:** Argon2id is the winner of PHC (Password Hashing Competition). Provides best balance of security and performance. Will configure with memory=64MB, iterations=3.

---

### ADR-005: Refresh Token Rotation

**Date:** 2026-04-10
**Status:** Accepted
**Context:** Need to balance security (short-lived tokens) with UX (not re-login often).

**Decision:** Implement refresh token rotation with reuse detection

**Decision Details:**
- Access token: 15 minutes expiry
- Refresh token: 7 days expiry
- On refresh: issue new access + new refresh token
- Detect token reuse: invalidate all user sessions if detected

**Consequences:**
- **Positive:** Limits exposure window, detects stolen tokens
- **Negative:** Requires session storage (Redis), more complexity

**Rationale:** Refresh token rotation is security best practice. Detects stolen tokens when attacker tries to reuse. Trade-off: requires session state but Redis is fast and scalable.

---

### ADR-006: RS256 JWT Algorithm

**Date:** 2026-04-10
**Status:** Accepted
**Context:** Need to choose JWT signing algorithm.

**Decision:** Use RS256 (RSA + SHA-256) asymmetric algorithm

**Alternatives Considered:**

| Alternative | Pros | Cons |
|-------------|------|------|
| HS256 (chosen) | Faster, symmetric | Shared secret risk |
| RS256 (chosen) | Private key only on server | Slower verification |
| ES256 | Smaller tokens, fast | Complex key management |

**Consequences:**
- **Positive:** Private key never exposed to clients, easier key rotation
- **Negative:** Slower verification, larger tokens

**Rationale:** Asymmetric algorithms are safer for distributed systems. Even if a service is compromised, they can only verify tokens, not forge new ones. Key rotation is simpler.

---

## Decision Summary

| Category | Decision | Choice |
|----------|----------|--------|
| API Auth | JWT vs Sessions | **JWT** |
| Social Login | OAuth2 Providers | **Google + GitHub** |
| Web Storage | Session Tokens | **HTTP-only cookies** |
| Password Hash | Algorithm | **Argon2id** |
| Token Refresh | Strategy | **Rotation + reuse detection** |
| JWT Algorithm | Signing | **RS256** |

## Deprecated Decisions

None yet.

## Superseded Decisions

None yet.
