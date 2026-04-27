#!/bin/bash
# Tiểu Mơ Task Runner - Multi-Project Queue & Execution

source /root/.tieu-mo-tokens.env

TASK="${1:-}"
PROJECT="${2:-default}"
CHAT_ID="${3:-}"
REPO_URL="${4:-}"

if [ -z "$TASK" ]; then
    echo "Usage: task-runner.sh <task> [project] [chat_id] [repo_url]"
    exit 1
fi

PROJECT_ROOT="/root/projects/$PROJECT"
CODE_DIR="$PROJECT_ROOT/code"
FORGENEXUS_DB="$PROJECT_ROOT/forgenexus_db"

mkdir -p "$CODE_DIR"
mkdir -p "$FORGENEXUS_DB"
mkdir -p /root/state

LOCKFILE="/root/state/lock_${PROJECT}.lock"
PROGRESS_FILE="/root/state/progress_${PROJECT}.json"

update_progress() {
    local status=$1
    local clarify=$2
    local plan=$3
    local deploy=$4

    if [ -f "$PROGRESS_FILE" ] && jq -e . "$PROGRESS_FILE" >/dev/null 2>&1; then
        jq --arg st "$status" --arg t "$TASK" --arg cl "$clarify" --arg pl "$plan" --arg dp "$deploy" \
        '.status = $st | .task = $t | .clarify = $cl | .plan = $pl | .deploy_url = $dp' "$PROGRESS_FILE" > "${PROGRESS_FILE}.tmp" && mv "${PROGRESS_FILE}.tmp" "$PROGRESS_FILE"
    else
        jq -n --arg st "$status" --arg t "$TASK" --arg cl "$clarify" --arg pl "$plan" --arg dp "$deploy" \
        '{status: $st, task: $t, clarify: $cl, plan: $pl, deploy_url: $dp}' > "$PROGRESS_FILE"
    fi
}

send_telegram() {
    if [ -n "$CHAT_ID" ]; then
        JSON_PAYLOAD=$(jq -n --arg chat "$CHAT_ID" --arg text "$1" '{chat_id: $chat, text: $text}')
        curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" -H "Content-Type: application/json" -d "$JSON_PAYLOAD" > /dev/null
    fi
}

update_progress "QUEUED" "" "" ""

(
    flock -w 300 200 || {
        update_progress "TIMEOUT" "" "" ""
        send_telegram "❌ Sếp ơi, tiểu dự án đang chịu tải bởi luồng khác!"
        exit 1;
    }

    update_progress "CLARIFY" "" "" ""

    SYSTEM_RULES="[QUY TẮC: TUYỆT ĐỐI KHÔNG TỰ Ý thay đổi kiến trúc]"
    CLARIFY_PROMPT="$SYSTEM_RULES Bạn là Tiểu Mơ. Sếp yêu cầu: $TASK. Hỏi 1-2 câu."
    CLARIFY_OUT=$(python3 /root/llm/cli.py MiniMax-M2.7 "$CLARIFY_PROMPT")
    send_telegram "$CLARIFY_OUT"
    update_progress "PLAN" "$CLARIFY_OUT" "" ""

    PLAN_PROMPT="$SYSTEM_RULES Lên plan cho: $TASK"
    PLAN_OUT=$(python3 /root/llm/cli.py MiniMax-M2.1 "$PLAN_PROMPT")
    send_telegram "📝 Plan:\n$PLAN_OUT"
    update_progress "EXECUTE" "$CLARIFY_OUT" "$PLAN_OUT" ""

    send_telegram "🔄 Đang code..."

    EXEC_LOG="/root/state/orchestrator_${PROJECT}.log"
    python3 /root/scripts/forgewright-orchestrator.py "$PROJECT" "$TASK" "$CODE_DIR" 2>&1 | tee "$EXEC_LOG"
    ORCH_EXIT=${PIPESTATUS[0]}

    if [ $ORCH_EXIT -ne 0 ]; then
        send_telegram "❌ Lỗi. Check: $EXEC_LOG"
        update_progress "ERROR" "$CLARIFY_OUT" "$PLAN_OUT" ""
        exit 1
    fi

    update_progress "DEPLOY" "$CLARIFY_OUT" "$PLAN_OUT" ""
    send_telegram "🚀 Deploying..."

    cd "$CODE_DIR"

    # Create vercel.json to skip build
    cat > vercel.json << 'VERCELEOF'
{
  "framework": null,
  "buildCommand": "echo done",
  "outputDirectory": "."
}
VERCELEOF

    # Git
    if [ -d ".git" ]; then
        git add . && git commit -m "Update: $TASK" && git push
    else
        git init && git add . && git commit -m "Init: $TASK"
        if [ -n "$GH_TOKEN" ]; then
            git remote add origin "https://${GH_TOKEN}@github.com/aicode82-sketch/${PROJECT}.git"
            curl -s -H "Authorization: token $GH_TOKEN" -d '{"name":"'"$PROJECT"'","private":true}' https://api.github.com/user/repos
        fi
        git push -u origin master -f
    fi

    # Vercel
    if [ -n "$VERCEL_TOKEN" ]; then
        DEPLOY_OUT=$(vercel --prod --yes --token "$VERCEL_TOKEN" 2>&1)
        if echo "$DEPLOY_OUT" | grep -q "https://"; then
            SUBDOMAIN=$(echo "$PROJECT" | tr "[:upper:]" "[:lower:]" | sed "s/[^a-z0-9]/-/g")
            DEPLOY_URL="https://${SUBDOMAIN}.hethongdoanhnghiep.com"
            vercel domains add "${SUBDOMAIN}.hethongdoanhnghiep.com" "$PROJECT" --token "$VERCEL_TOKEN" 2>/dev/null || true
        else
            DEPLOY_URL="Deploy failed"
        fi
    else
        DEPLOY_URL="No Vercel token"
    fi

    update_progress "READY" "$CLARIFY_OUT" "$PLAN_OUT" "$DEPLOY_URL"
    send_telegram "🎉 Done! 🌐 $DEPLOY_URL"

) 200> "$LOCKFILE"
