# Task Breakdown: User Authentication System

## Summary

| Metric | Value |
|--------|-------|
| **Total Tasks** | 18 |
| **Total Estimate** | 35 hours |
| **P0 Tasks** | 8 tasks |
| **P1 Tasks** | 6 tasks |
| **P2 Tasks** | 4 tasks |

## Task List

### P0 — Critical (Must Complete First)

| # | Task | Estimate | Dependencies | Status |
|---|------|----------|--------------|--------|
| P0-01 | Database schema & migrations | 2h | - | Not Started |
| P0-02 | User model & Prisma setup | 2h | P0-01 | Not Started |
| P0-03 | JWT service (generate/validate) | 3h | P0-02 | Not Started |
| P0-04 | OAuth2 Google integration | 4h | P0-02 | Not Started |
| P0-05 | OAuth2 GitHub integration | 4h | P0-02 | Not Started |
| P0-06 | Login/Logout endpoints | 2h | P0-03 | Not Started |
| P0-07 | Auth middleware (protect routes) | 2h | P0-03 | Not Started |
| P0-08 | Unit tests (core auth) | 4h | P0-06 | Not Started |

### P1 — High Priority

| # | Task | Estimate | Dependencies | Status |
|---|------|----------|--------------|--------|
| P1-01 | User registration endpoint | 3h | P0-02 | Not Started |
| P1-02 | Email verification flow | 4h | P1-01 | Not Started |
| P1-03 | Password reset flow | 4h | P1-02 | Not Started |
| P1-04 | Rate limiting middleware | 2h | P0-06 | Not Started |
| P1-05 | Session management (Redis) | 3h | P0-06 | Not Started |
| P1-06 | Integration tests (auth flows) | 4h | P1-05 | Not Started |

### P2 — Medium Priority

| # | Task | Estimate | Dependencies | Status |
|---|------|----------|--------------|--------|
| P2-01 | Refresh token rotation | 2h | P0-03 | Not Started |
| P2-02 | Logout all devices | 2h | P2-01 | Not Started |
| P2-03 | Security headers middleware | 1h | P0-06 | Not Started |
| P2-04 | API documentation (OpenAPI) | 2h | P0-06 | Not Started |

## Task Details

### P0-01: Database schema & migrations

**Description:** Create database schema for users, sessions, email_verifications, password_resets tables. Write migration files.

**Acceptance Criteria:**
- [ ] Users table created with all fields
- [ ] Sessions table with foreign key
- [ ] Email verification table
- [ ] Password reset table
- [ ] All required indexes created
- [ ] Migration is reversible

**Files to Modify:**
- `prisma/migrations/`
- `prisma/schema.prisma`

---

### P0-02: User model & Prisma setup

**Description:** Set up Prisma client, create user repository with CRUD operations.

**Acceptance Criteria:**
- [ ] Prisma client initialized
- [ ] User repository with findByEmail, findById, create, update
- [ ] OAuth user creation (no password)
- [ ] Email user creation (with hashed password)

**Files to Modify:**
- `src/repositories/user.ts`
- `src/services/password.ts` (Argon2)

---

### P0-03: JWT service (generate/validate)

**Description:** Create JWT service for access token and refresh token generation/validation.

**Acceptance Criteria:**
- [ ] Access token generation (15 min, RS256)
- [ ] Refresh token generation (7 days)
- [ ] Token validation middleware
- [ ] Token refresh endpoint
- [ ] Token blacklist (for logout)

**Files to Modify:**
- `src/services/jwt.ts`
- `src/middleware/auth.ts`

---

### P0-04: OAuth2 Google integration

**Description:** Implement Google OAuth2 flow (authorization code grant with PKCE).

**Acceptance Criteria:**
- [ ] /auth/google redirect endpoint
- [ ] /auth/google/callback handler
- [ ] User creation/lookup from Google profile
- [ ] Session creation after OAuth success

**Files to Modify:**
- `src/services/oauth/google.ts`
- `src/controllers/auth.ts`

---

### P0-05: OAuth2 GitHub integration

**Description:** Implement GitHub OAuth2 flow.

**Acceptance Criteria:**
- [ ] /auth/github redirect endpoint
- [ ] /auth/github/callback handler
- [ ] User creation/lookup from GitHub profile
- [ ] GitHub email handling (may need additional request)

**Files to Modify:**
- `src/services/oauth/github.ts`
- `src/controllers/auth.ts`

---

### P0-06: Login/Logout endpoints

**Description:** Create POST /auth/login and POST /auth/logout endpoints.

**Acceptance Criteria:**
- [ ] Login validates email/password
- [ ] Login returns JWT tokens
- [ ] Login sets HTTP-only session cookie
- [ ] Logout invalidates session
- [ ] Logout clears cookies

**Files to Modify:**
- `src/controllers/auth.ts`
- `src/routes/auth.ts`

---

### P0-07: Auth middleware (protect routes)

**Description:** Create middleware to protect routes requiring authentication.

**Acceptance Criteria:**
- [ ] Middleware extracts token from header/cookie
- [ ] Validates token and attaches user to request
- [ ] Returns 401 for invalid/expired tokens
- [ ] Works with both Bearer token and session cookie

**Files to Modify:**
- `src/middleware/auth.ts`

---

### P0-08: Unit tests (core auth)

**Description:** Write unit tests for JWT service, password hashing, auth middleware.

**Acceptance Criteria:**
- [ ] JWT generation/validation tests
- [ ] Password hashing tests (Argon2)
- [ ] Auth middleware tests
- [ ] > 80% coverage on auth code

**Files to Create:**
- `tests/unit/auth/`

---

## Sprint Planning

### Sprint 1: Foundation (8h)

| Task | Estimate | Days |
|------|----------|------|
| P0-01 | 2h | 0.25 |
| P0-02 | 2h | 0.25 |
| P0-03 | 3h | 0.375 |
| P0-07 | 2h | 0.25 |
| **Total** | **9h** | **~1.125 days** |

### Sprint 2: OAuth2 (8h)

| Task | Estimate | Days |
|------|----------|------|
| P0-04 | 4h | 0.5 |
| P0-05 | 4h | 0.5 |
| **Total** | **8h** | **1 day** |

### Sprint 3: Core Auth Flows (8h)

| Task | Estimate | Days |
|------|----------|------|
| P0-06 | 2h | 0.25 |
| P1-01 | 3h | 0.375 |
| P2-03 | 1h | 0.125 |
| P2-04 | 2h | 0.25 |
| **Total** | **8h** | **1 day** |

### Sprint 4: Advanced Features (11h)

| Task | Estimate | Days |
|------|----------|------|
| P1-02 | 4h | 0.5 |
| P1-03 | 4h | 0.5 |
| P1-04 | 2h | 0.25 |
| P2-01 | 2h | 0.25 |
| P2-02 | 2h | 0.25 |
| **Total** | **14h** | **~1.75 days** |

### Sprint 5: Testing & Polish (6h)

| Task | Estimate | Days |
|------|----------|------|
| P0-08 | 4h | 0.5 |
| P1-05 | 3h | 0.375 |
| P1-06 | 4h | 0.5 |
| **Total** | **11h** | **~1.375 days** |

**Total: 50 hours / ~6.3 days**

## Definition of Done

- [ ] Code implemented
- [ ] Code reviewed (PR approved)
- [ ] Unit tests written and passing (>80% coverage)
- [ ] Integration tests written for all auth flows
- [ ] Security considerations met
- [ ] Documentation updated
