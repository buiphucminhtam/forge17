# Detailed Tasks: Fix Top 3 P0 Findings

> **Plan:** `P0-fix-plan.md` — Iteration 2 Score: 10.00/10 ✅
> **Execution Strategy:** Dependency-ordered, parallel where possible

---

## Phase 3: Documentation Consistency (Quick Wins — Do First)

**Lý do:** Không có dependency, low-risk, verify được ngay bằng command.

### Task 3.1: Update README.md Mode Count

**File:** `README.md`

| Line | Current | Change To |
|------|---------|-----------|
| 7 | `modes-22` | `modes-23` |
| 8 | `protocols-15` | `protocols-27` |

**Action:**
```bash
# Verify current state
rg "modes-22" README.md
rg "protocols-15" README.md

# Edit line 7: modes-22 → modes-23
# Edit line 8: protocols-15 → protocols-27

# Verify after change
rg "modes-22" README.md  # should return nothing
rg "protocols-15" README.md  # should return nothing
```

**Test:** `rg "modes-22" --glob "*.md" .` → 0 matches

---

### Task 3.2: Update AGENTS.md Mode Count

**File:** `AGENTS.md`

| Line | Current | Change To |
|------|---------|-----------|
| ~5 | `22 modes` | `23 modes` |

**Action:**
```bash
# Verify current state
rg "22 mode" AGENTS.md

# Edit line 5: 22 modes → 23 modes

# Verify after change
rg "22 mode" AGENTS.md  # should return nothing
```

**Test:** `rg "22 mode" --glob "*.md" .` → 0 matches

---

### Task 3.3: Full Verification

**Action:**
```bash
# Verify all counts are consistent
echo "=== Mode Count Verification ==="
rg "modes-22" --glob "*.md" .
rg "22 mode" --glob "*.md" .
echo "Expected: 0 matches"

echo ""
echo "=== Protocol Count Verification ==="
rg "protocols-15" --glob "*.md" .
echo "Expected: 0 matches"

echo ""
echo "=== Protocol Files Count ==="
ls skills/_shared/protocols/*.md | wc -l
echo "Expected: 27"
```

**Acceptance Criteria:**
- `rg "modes-22" --glob "*.md" .` → 0 matches
- `rg "22 mode" --glob "*.md" .` → 0 matches
- `rg "protocols-15" --glob "*.md" .` → 0 matches
- `ls skills/_shared/protocols/*.md | wc -l` → 27

---

## Phase 1: Circuit Breaker Pattern

**Lý do:** Cần protocol file mới trước khi integrate vào các skill khác.

### Task 1.1: Create Circuit Breaker Protocol

**File:** `skills/_shared/protocols/circuit-breaker.md`

**Content:**
```markdown
# Circuit Breaker Protocol

> **Purpose:** Prevent cascading failures in parallel execution by stopping requests to failing workers.
> **Pattern:** Inspired by Michael Nygard's Circuit Breaker pattern (Release It! 2nd Edition).

## States

```
CLOSED ──(failure_threshold)──► OPEN
  ▲                              │
  │                         (timeout)
  │                              ▼
  └──(success)──── HALF_OPEN ──(failure)
```

| State | Behavior | Next Transition |
|-------|----------|-----------------|
| **CLOSED** | Normal operation, requests pass through | After `failure_threshold` failures → OPEN |
| **OPEN** | All requests fail immediately | After `timeout_duration` seconds → HALF_OPEN |
| **HALF_OPEN** | Limited requests allowed to test recovery | Success → CLOSED; Failure → OPEN |

## Configuration

Add to `.production-grade.yaml`:

```yaml
circuitBreaker:
  failure_threshold: 3      # failures before OPEN
  timeout_duration: 60      # seconds OPEN before HALF_OPEN
  recovery_timeout: 120     # seconds in HALF_OPEN before CLOSED
```

## When to Apply

- Parallel dispatch workers in `parallel-dispatch/SKILL.md`
- External API calls in skills
- Any skill with retry logic

## Implementation

### State Machine

```typescript
interface CircuitBreaker {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failure_count: number;
  last_failure_time: number;
  success_count: number;
}

function shouldAllowRequest(cb: CircuitBreaker): boolean {
  switch (cb.state) {
    case 'CLOSED':
      return true;
    case 'OPEN':
      if (Date.now() - cb.last_failure_time > cb.config.timeout_duration) {
        cb.state = 'HALF_OPEN';
        return true;
      }
      return false;
    case 'HALF_OPEN':
      return true;
  }
}

function recordSuccess(cb: CircuitBreaker): void {
  cb.failure_count = 0;
  cb.success_count++;
  if (cb.state === 'HALF_OPEN' && cb.success_count >= 2) {
    cb.state = 'CLOSED';
    cb.success_count = 0;
  }
}

function recordFailure(cb: CircuitBreaker): void {
  cb.failure_count++;
  cb.last_failure_time = Date.now();
  if (cb.state === 'HALF_OPEN') {
    cb.state = 'OPEN';
  } else if (cb.failure_count >= cb.config.failure_threshold) {
    cb.state = 'OPEN';
  }
}
```

## Test Scenarios

| # | Scenario | Expected Result |
|---|----------|-----------------|
| 1 | 3 failures in CLOSED | State → OPEN |
| 2 | Request in OPEN | Fail immediately |
| 3 | After 60s in OPEN | State → HALF_OPEN |
| 4 | Success in HALF_OPEN | State → CLOSED after 2 successes |
| 5 | Failure in HALF_OPEN | State → OPEN |

## Integration Points

1. **parallel-dispatch/SKILL.md** — Add circuit breaker check in worker dispatch
2. **graceful-failure.md** — Reference circuit breaker in retry logic
3. **middleware-chain.md** — Add CircuitBreaker middleware (optional)
```

**Test:** Manual review of protocol completeness

---

### Task 1.2: Integrate Circuit Breaker into Parallel Dispatch

**File:** `skills/parallel-dispatch/SKILL.md`

**Action:** Add circuit breaker check in Phase 4 (Worker Dispatch)

**Location:** After "Spawn Gemini CLI instances for each worktree" (line ~199)

**Add:**
```markdown
### Phase 4.1 — Circuit Breaker Check

Before dispatching workers, check circuit breaker state:

```
For each worker:
1. Check circuit breaker for this task type
2. If CLOSED: proceed with dispatch
3. If OPEN: check timeout
   - If timeout elapsed: transition to HALF_OPEN, proceed
   - If timeout not elapsed: skip worker, log "circuit open"
4. If HALF_OPEN: allow limited requests (max 1 concurrent)
```

**Circuit Breaker per Worker Type:**

| Worker | Circuit Key | Config |
|--------|-------------|--------|
| T3a (Backend) | `backend` | Use global config |
| T3b (Frontend) | `frontend` | Use global config |
| T3c (Mobile) | `mobile` | Use global config |
| T4 (DevOps) | `devops` | Use global config |
| T5 (QA) | `qa` | Use global config |
| T6a/6b (Review) | `review` | Use global config |

**Example State Tracking:**

```json
{
  "circuits": {
    "backend": { "state": "CLOSED", "failure_count": 0, "last_failure": null },
    "frontend": { "state": "CLOSED", "failure_count": 0, "last_failure": null },
    "devops": { "state": "OPEN", "failure_count": 5, "last_failure": "2026-04-12T10:30:00Z" }
  }
}
```
```

**Test:** Worker failure test — verify circuit opens after repeated failures

---

### Task 1.3: Reference Circuit Breaker in Graceful Failure

**File:** `skills/_shared/protocols/graceful-failure.md`

**Location:** Add to "Integration with Existing Protocols" section (line ~118)

**Add:**
```markdown
- **circuit-breaker.md:** Circuit Breaker complements Graceful Failure by providing
  a stateful, system-wide mechanism to stop requests to failing components. Graceful
  Failure handles individual action retries; Circuit Breaker handles systemic failures.
  When a circuit opens → Graceful Failure sees a "circuit open" error → skips retry,
  logs the event, and moves to next task.
```

**Test:** Integration test — circuit open prevents infinite retry

---

### Task 1.4: Add Circuit Breaker to Middleware Chain (Optional)

**File:** `skills/_shared/protocols/middleware-chain.md`

**Location:** Add to Post-Skill Middleware section (after ⑩ GracefulFailure)

**Add:**

```markdown
| ⑪ | **CircuitBreaker** | circuit-breaker.md | `after_skill()` | Update circuit state, transition based on outcome |
```

**Configuration section:**

```yaml
- name: circuit-breaker
  enabled: true
  failure_threshold: 3
  timeout_duration: 60
  recovery_timeout: 120
```

**Test:** Load test — verify circuit behavior under sustained load

---

## Phase 2: Bulkhead Isolation

**Lý do:** Cần thêm resource limits vào worktree manager và parallel dispatch.

### Task 2.1: Create Bulkhead Protocol

**File:** `skills/_shared/protocols/bulkhead.md`

**Content:**
```markdown
# Bulkhead Isolation Protocol

> **Purpose:** Isolate worker failures to prevent cascading crashes. Inspired by
> the Bulkhead pattern from Release It! (Michael Nygard) — named after watertight
> compartments in ships that prevent flooding from spreading.

## Concept

A bulkhead divides a system into isolated compartments. If one compartment floods,
the others remain intact. In Forgewright:

- Each parallel worker is a **compartment**
- Worker failure is **flooding**
- Main process and other workers are **protected compartments**

## Isolation Levels

| Level | Isolation | Performance Cost | Use Case |
|-------|-----------|-----------------|----------|
| **process** | Separate bash process | Low | Default, git worktrees |
| **container** | Docker/container | Medium | Full isolation needed |
| **vm** | Virtual machine | High | Untrusted code |

## Configuration

Add to `parallel-dispatch` section:

```yaml
bulkhead:
  max_memory_mb: 512       # Max memory per worker
  max_cpu_percent: 80     # Max CPU usage per worker
  max_duration_minutes: 30 # Max execution time
  isolation_level: process # process | container | vm
  auto_cleanup: true       # Cleanup on timeout
```

## Resource Limits Implementation

### Process Level (Default)

```bash
# Worker process with resource limits
ulimit -v $((512 * 1024))  # 512MB virtual memory
ulimit -m $((512 * 1024))  # 512MB physical memory
ulimit -t 1800             # 30 minutes CPU time

# Monitor worker
(
  worker_pid=$!
  while kill -0 $worker_pid 2>/dev/null; do
    # Check memory
    mem=$(ps -o rss= -p $worker_pid 2>/dev/null || echo 0)
    if [ $mem -gt $((512 * 1024)) ]; then
      kill -9 $worker_pid
      echo "Worker exceeded memory limit"
    fi
    sleep 5
  done
) &
```

### Container Level (Optional)

```bash
# Docker container with resource limits
docker run \
  --memory=512m \
  --cpus=0.8 \
  --memory-swap=512m \
  worktree-worker
```

## Failure Containment

| Scenario | Behavior |
|----------|----------|
| Worker OOM | Kill worker, log event, continue other workers |
| Worker timeout | Kill worker, mark as FAILED, continue other workers |
| Worker segfault | Catch signal, cleanup, mark as FAILED |
| Worker infinite loop | Timeout watchdog kills worker |

## Integration Points

1. **scripts/worktree-manager.sh** — Add resource limit flags to worker processes
2. **parallel-dispatch/SKILL.md** — Add bulkhead checks in worker dispatch

## Test Scenarios

| # | Scenario | Expected Result |
|---|----------|-----------------|
| 1 | Worker OOM | Worker killed, main process alive, other workers continue |
| 2 | Worker timeout | Worker killed after 30min, marked FAILED |
| 3 | Worker segfault | Signal caught, cleanup executed, FAILED logged |
| 4 | Memory leak | Watchdog kills worker at limit |
| 5 | CPU spin | Timeout watchdog kills worker |

## Monitoring

Log bulkhead events:

```markdown
## Bulkhead Events Log

| Timestamp | Worker | Event | Memory | CPU | Duration |
|-----------|--------|-------|--------|-----|----------|
| 2026-04-12T10:30:00Z | T3a | OOM_KILLED | 513MB | 95% | 5m |
| 2026-04-12T10:35:00Z | T3b | TIMEOUT | 128MB | 10% | 30m |
```
```

**Test:** Manual review of protocol completeness

---

### Task 2.2: Add Bulkhead to Worktree Manager

**File:** `scripts/worktree-manager.sh`

**Location:** Add new function after `cmd_resume()` (line ~289)

**Add:**
```bash
# ━━━ Bulkhead helpers ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

cmd_bulkhead_limits() {
  # Apply resource limits to current shell
  local max_memory_mb="${1:-512}"
  local max_cpu_percent="${2:-80}"
  local max_duration_minutes="${3:-30}"

  # Memory limits
  ulimit -v $((max_memory_mb * 1024))
  ulimit -m $((max_memory_mb * 1024))

  # CPU time limit (in seconds)
  ulimit -t $((max_duration_minutes * 60))

  log "Bulkhead limits applied: memory=${max_memory_mb}MB, cpu=${max_cpu_percent}%, duration=${max_duration_minutes}m"
}

cmd_bulkhead_status() {
  # Show resource usage for all workers
  echo ""
  echo "━━━ Bulkhead Status ━━━━━━━━━━━━━━━━━━━━━━━━━━"

  if ! [ -d "$WORKTREE_BASE" ]; then
    log "No worktrees found."
    return
  fi

  for wt_dir in "${WORKTREE_BASE}"/*/; do
    [ -d "$wt_dir" ] || continue
    local task_id
    task_id=$(basename "$wt_dir")

    # Find worker PID (if running)
    local pid
    pid=$(pgrep -f "worktree.*${task_id}" 2>/dev/null | head -1 || echo "")

    if [ -n "$pid" ]; then
      local mem cpu
      mem=$(ps -o rss= -p "$pid" 2>/dev/null || echo "0")
      cpu=$(ps -o %cpu= -p "$pid" 2>/dev/null || echo "0")
      mem=$((mem / 1024))  # Convert KB to MB
      printf "  %-12s PID:%-8s Memory:%sMB CPU:%s%%\n" "$task_id" "$pid" "$mem" "$cpu"
    else
      printf "  %-12s (idle)\n" "$task_id"
    fi
  done

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}
```

**Add to usage function (line ~314):**
```bash
  Commands:
    ...
    bulkhead-limits [mem_mb] [cpu_%] [duration_min]  Apply resource limits
    bulkhead-status                            Show resource usage
```

**Add to main dispatch (line ~346):**
```bash
    bulkhead-limits) shift; cmd_bulkhead_limits "$@" ;;
    bulkhead-status) cmd_bulkhead_status ;;
```

**Test:** Resource test — verify limits applied correctly

---

### Task 2.3: Integrate Bulkhead into Parallel Dispatch

**File:** `skills/parallel-dispatch/SKILL.md`

**Location:** Add to Phase 4 (Worker Dispatch) before spawning workers

**Add:**
```markdown
### Phase 4 — Bulkhead Resource Limits

Before spawning workers, apply bulkhead limits:

```bash
# Load bulkhead config
BULKHEAD_MEMORY="${BULKHEAD_MEMORY_MB:-512}"
BULKHEAD_CPU="${BULKHEAD_CPU_PERCENT:-80}"
BULKHEAD_DURATION="${BULKHEAD_DURATION_MINUTES:-30}"

# Apply limits to this shell (will apply to all child processes)
scripts/worktree-manager.sh bulkhead-limits $BULKHEAD_MEMORY $BULKHEAD_CPU $BULKHEAD_DURATION
```

**Worker Process Isolation:**

Each worker is spawned in a **separate shell process** with:
- Independent memory namespace (via worktree)
- Resource limits inherited from parent shell
- Timeout watchdog for runaway processes

```bash
# Worker dispatch with bulkhead
for task in T3a T3b T3c; do
  worktree_path=".worktrees/${task}"

  # Spawn worker with timeout watchdog
  (
    # Set up resource limits
    ulimit -v $((BULKHEAD_MEMORY * 1024))
    ulimit -t $((BULKHEAD_DURATION * 60))

    # Start watchdog
    (
      sleep $((BULKHEAD_DURATION * 60))
      echo "Worker ${task} exceeded time limit"
      kill -9 $$ 2>/dev/null
    ) &
    watchdog_pid=$!

    # Run worker
    cd "${worktree_path}"
    gemini -p "..." 2>&1 | tee "worker-${task}.log"

    # Cleanup watchdog
    kill $watchdog_pid 2>/dev/null
  ) &

  echo "Worker ${task} dispatched with bulkhead"
done
```

**Failure Containment Matrix:**

| Worker | Memory | CPU | Time | On Limit |
|--------|--------|-----|------|----------|
| T3a (Backend) | 512MB | 80% | 30min | Kill + Skip |
| T3b (Frontend) | 512MB | 80% | 30min | Kill + Skip |
| T3c (Mobile) | 512MB | 80% | 30min | Kill + Skip |
| T4 (DevOps) | 768MB | 80% | 45min | Kill + Skip |
| T5 (QA) | 512MB | 80% | 30min | Kill + Skip |
| T6 (Review) | 256MB | 40% | 20min | Kill + Skip |
```

**Test:** Isolation test — verify one worker failure doesn't affect others

---

## Execution Summary

### Task Dependencies

```
Phase 3 (Documentation) ─────┐
  ├── 3.1 README.md         │ No dependencies
  ├── 3.2 AGENTS.md         │ No dependencies
  └── 3.3 Verification       │ After 3.1, 3.2

Phase 1 (Circuit Breaker) ───┐
  ├── 1.1 Create protocol   │ No dependencies
  ├── 1.2 Parallel dispatch  │ After 1.1
  ├── 1.3 Graceful failure   │ After 1.1
  └── 1.4 Middleware chain   │ After 1.1

Phase 2 (Bulkhead) ──────────┐
  ├── 2.1 Create protocol   │ No dependencies
  ├── 2.2 Worktree manager  │ After 2.1
  └── 2.3 Parallel dispatch  │ After 2.1, 2.2

Parallel execution possible:
  - Phase 3 tasks (3.1, 3.2) can run in parallel
  - Phase 1 tasks (1.1, 2.1) can run in parallel
  - Phase 2 tasks (2.2) depends on 2.1
```

### Task Summary Table

| # | Task | File | Type | Dependency | Time |
|---|------|------|------|------------|------|
| 3.1 | README.md mode count | README.md | Edit | None | 2min |
| 3.2 | AGENTS.md mode count | AGENTS.md | Edit | None | 2min |
| 3.3 | Verify consistency | All | Verify | After 3.1, 3.2 | 1min |
| 1.1 | Circuit breaker protocol | circuit-breaker.md | Create | None | 10min |
| 1.2 | CB in parallel dispatch | parallel-dispatch.md | Edit | After 1.1 | 5min |
| 1.3 | CB in graceful failure | graceful-failure.md | Edit | After 1.1 | 3min |
| 1.4 | CB in middleware chain | middleware-chain.md | Edit | After 1.1 | 3min |
| 2.1 | Bulkhead protocol | bulkhead.md | Create | None | 10min |
| 2.2 | Bulkhead in worktree mgr | worktree-manager.sh | Edit | After 2.1 | 8min |
| 2.3 | Bulkhead in dispatch | parallel-dispatch.md | Edit | After 2.1, 2.2 | 5min |

**Total: 10 tasks, ~49 minutes estimated**

### Recommended Execution Order

```
Parallel Batch 1 (fast wins):
  ├── 3.1 Update README.md
  ├── 3.2 Update AGENTS.md
  ├── 1.1 Create circuit-breaker.md
  └── 2.1 Create bulkhead.md

Sequential (depends on protocols):
  ├── 3.3 Verify documentation
  ├── 1.2 Integrate CB in parallel dispatch
  ├── 1.3 Reference CB in graceful failure
  ├── 1.4 Add CB to middleware chain
  ├── 2.2 Add bulkhead to worktree manager
  └── 2.3 Integrate bulkhead in dispatch
```
