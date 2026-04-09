#!/usr/bin/env bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Integration Test Suite — ForgeNexus CLI
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Run: bash scripts/test-cli.sh [--verbose]
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -uo pipefail

VERBOSE=""
if [ "${1:-}" = "--verbose" ] || [ "${1:-}" = "-v" ]; then
  VERBOSE=1
fi

REPO="$(pwd)"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASSED=0
FAILED=0
TOTAL=0

test_pass() { echo -e "  ${GREEN}✓ PASS${NC} $*"; ((PASSED++)); ((TOTAL++)); }
test_fail() { echo -e "  ${RED}✗ FAIL${NC} $*"; ((FAILED++)); ((TOTAL++)); }
test_skip() { echo -e "  ${YELLOW}⊘ SKIP${NC} $*"; ((TOTAL++)); }

section() { echo ""; echo "━━━ $* ━━━"; }

# ── Helper ──────────────────────────────────────────────
run_cmd() {
  local cmd="$1"
  local desc="$2"
  if [ -n "$VERBOSE" ]; then
    echo "    CMD: $cmd"
  fi
  local out
  out=$(eval "$cmd" 2>&1)
  local rc=$?
  echo "$out"
  return $rc
}

# ════════════════════════════════════════════════════════
section "CLI Basic Commands"
# ════════════════════════════════════════════════════════

# Test 1: forgenexus --version
if forgenexus --version >/dev/null 2>&1; then
  test_pass "forgenexus --version exits 0"
else
  test_fail "forgenexus --version exits non-zero"
fi

# Test 2: forgenexus analyze --help
if npx forgenexus analyze --help >/dev/null 2>&1; then
  test_pass "forgenexus analyze --help exits 0"
else
  test_fail "forgenexus analyze --help exits non-zero"
fi

# Test 3: forgenexus status (no index needed)
if npx forgenexus status "$REPO" >/dev/null 2>&1; then
  test_pass "forgenexus status exits 0"
else
  test_fail "forgenexus status exits non-zero"
fi

# ════════════════════════════════════════════════════════
section "Index Operations"
# ════════════════════════════════════════════════════════

INDEX_DIR="$REPO/.forgenexus"
INDEX_DB="$INDEX_DIR/codebase.db"

# Test 4: Index exists
if [ -f "$INDEX_DB" ] || [ -d "$INDEX_DIR" ]; then
  test_pass "ForgeNexus index directory exists"
else
  test_fail "ForgeNexus index directory missing (run: npx forgenexus analyze --force)"
fi

# Test 5: No lock files
LOCK_COUNT=$(find "$INDEX_DIR" -name "*.lock" 2>/dev/null | wc -l | tr -d ' ')
if [ "$LOCK_COUNT" -eq 0 ]; then
  test_pass "No stale lock files in index"
else
  test_fail "Found $LOCK_COUNT stale lock files"
fi

# Test 6: mcp-generate.sh runs
if bash scripts/mcp-generate.sh --help >/dev/null 2>&1; then
  test_pass "mcp-generate.sh --help exits 0"
else
  test_fail "mcp-generate.sh --help exits non-zero"
fi

# ════════════════════════════════════════════════════════
section "Skills System"
# ════════════════════════════════════════════════════════

# Test 7: Skills count
if bash scripts/verify-skill-count.sh >/dev/null 2>&1; then
  test_pass "Skills count matches expected (52)"
else
  test_fail "Skills count mismatch"
fi

# Test 8: SKILL.md exists
if [ -f "skills/production-grade/SKILL.md" ]; then
  test_pass "SKILL.md exists"
else
  test_fail "SKILL.md missing"
fi

# Test 9: phases/ extracted
PHASE_COUNT=$(ls skills/production-grade/phases/*.md 2>/dev/null | wc -l | tr -d ' ')
if [ "$PHASE_COUNT" -ge 5 ]; then
  test_pass "Phase dispatchers exist ($PHASE_COUNT files)"
else
  test_fail "Phase dispatchers missing (found $PHASE_COUNT, expected 5)"
fi

# Test 10: middleware/ extracted
MIDDLEWARE_COUNT=$(ls skills/production-grade/middleware/*.md 2>/dev/null | wc -l | tr -d ' ')
if [ "$MIDDLEWARE_COUNT" -ge 10 ]; then
  test_pass "Middleware chain extracted ($MIDDLEWARE_COUNT files)"
else
  test_fail "Middleware chain incomplete (found $MIDDLEWARE_COUNT, expected 10)"
fi

# ════════════════════════════════════════════════════════
section "CI/CD"
# ════════════════════════════════════════════════════════

# Test 11: Pre-commit hook exists and is executable
if [ -x ".husky/pre-commit" ]; then
  test_pass "Pre-commit hook is executable"
else
  test_fail "Pre-commit hook missing or not executable"
fi

# Test 12: husky version
HUSKY_VER=$(npx husky --version 2>/dev/null | head -1)
if [ -n "$HUSKY_VER" ]; then
  test_pass "Husky installed ($HUSKY_VER)"
else
  test_fail "Husky not installed"
fi

# Test 13: GitHub Actions CI workflow
if [ -f ".github/workflows/ci.yml" ]; then
  test_pass "GitHub Actions CI workflow exists"
else
  test_fail "GitHub Actions CI workflow missing"
fi

# Test 14: Worktree manager
if bash scripts/worktree-manager.sh --help >/dev/null 2>&1; then
  test_pass "worktree-manager.sh --help exits 0"
else
  test_fail "worktree-manager.sh --help exits non-zero"
fi

# ════════════════════════════════════════════════════════
section "Version Consistency"
# ════════════════════════════════════════════════════════

# Test 15: VERSION matches package.json
PKG_VER=$(node -e "console.log(require('./package.json').version)" 2>/dev/null)
FILE_VER=$(cat VERSION 2>/dev/null)
if [ "$PKG_VER" = "$FILE_VER" ]; then
  test_pass "Version consistent ($PKG_VER)"
else
  test_fail "Version mismatch: package.json=$PKG_VER vs VERSION=$FILE_VER"
fi

# ════════════════════════════════════════════════════════
section "Health Check"
# ════════════════════════════════════════════════════════

# Test 16: forgeNexus-health.sh
if bash scripts/forgeNexus-health.sh "$REPO" >/dev/null 2>&1; then
  test_pass "forgeNexus-health.sh passes"
else
  test_fail "forgeNexus-health.sh fails"
fi

# ════════════════════════════════════════════════════════
# Summary
# ════════════════════════════════════════════════════════
section "Summary"

echo ""
echo -e "  ${GREEN}✓ Passed: $PASSED${NC}"
echo -e "  ${RED}✗ Failed: $FAILED${NC}"
echo -e "  Total:  $TOTAL"
echo ""

if [ "$FAILED" -eq 0 ]; then
  echo -e "${GREEN}All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}Some tests failed.${NC}"
  exit 1
fi
