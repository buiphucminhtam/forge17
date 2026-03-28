#!/usr/bin/env bash
# scripts/optimization-runner.sh
# A wrapper to run an evaluation command with a fixed time budget.
# Usage: ./optimization-runner.sh "npm run benchmark" [TIMEOUT_SECONDS]

EVAL_CMD=$1
TIMEOUT_SEC=${2:-300} # Default 5 minutes

if [ -z "$EVAL_CMD" ]; then
    echo "Usage: $0 '<evaluation command>' [timeout_seconds]"
    exit 1
fi

LOG_FILE="autoresearch.log"
echo "--- Starting evaluation ---" > "$LOG_FILE"
echo "Command: $EVAL_CMD" >> "$LOG_FILE"
echo "Timeout: ${TIMEOUT_SEC}s" >> "$LOG_FILE"

# Cross-platform timeout implementation
(
  bash -c "$EVAL_CMD" >> "$LOG_FILE" 2>&1
) &
PID=$!

# Run a watchdog in the background
(
  sleep "$TIMEOUT_SEC"
  if kill -0 $PID 2>/dev/null; then
      kill -9 $PID 2>/dev/null
  fi
) &
WATCHDOG_PID=$!

wait $PID
EXIT_CODE=$?

# Stop the watchdog cleanly
kill $WATCHDOG_PID 2>/dev/null

# Exit code 137 typically means killed by signal 9 (KILL)
if [ $EXIT_CODE -eq 137 ] || [ $EXIT_CODE -eq 143 ]; then
    echo "STATUS: TIMEOUT (Run exceeded ${TIMEOUT_SEC}s)" >> "$LOG_FILE"
    echo "STATUS: TIMEOUT"
    exit 124
elif [ $EXIT_CODE -ne 0 ]; then
    echo "STATUS: CRASHED (Exit code $EXIT_CODE)" >> "$LOG_FILE"
    echo "STATUS: CRASHED"
    exit $EXIT_CODE
else
    echo "STATUS: SUCCESS" >> "$LOG_FILE"
    echo "STATUS: SUCCESS"
fi

echo "--- Evaluation complete ---" >> "$LOG_FILE"
echo "Evaluation output has been saved to $LOG_FILE. Please read it to extract your metric."
exit 0
