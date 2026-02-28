#!/bin/bash
# Turn Initialization Hook — agentic-pipeline
# Runs on UserPromptSubmit — creates turn directory + session_context.md
# Ensures every prompt gets a turn entry for full provenance tracking.

set -e

PROJECT_ROOT="$(pwd)"
TURNS_INDEX="${PROJECT_ROOT}/ai/agentic-pipeline/turns_index.csv"

# Resolve TURN_ID
if [ -f "$TURNS_INDEX" ]; then
  LAST_TURN=$(tail -n +2 "$TURNS_INDEX" 2>/dev/null | cut -d',' -f1 | sort -n | tail -1)
  if [ -z "$LAST_TURN" ]; then
    TURN_ID=1
  else
    TURN_ID=$((LAST_TURN + 1))
  fi
else
  TURN_ID=1
  mkdir -p "${PROJECT_ROOT}/ai/agentic-pipeline"
  echo "turn_id,started_at,finished_at,elapsed_seconds,branch,commit_sha,task_summary" > "$TURNS_INDEX"
fi

# Create turn directory
TURN_DIR="${PROJECT_ROOT}/ai/agentic-pipeline/turns/turn-${TURN_ID}"
mkdir -p "$TURN_DIR"

# Capture metadata
TURN_START=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")

# Truncate prompt for preview (first 500 chars, escape for markdown)
PROMPT_PREVIEW=$(echo "$CLAUDE_USER_PROMPT" | head -c 500 | tr '\n' ' ' | sed 's/|/\\|/g' | sed 's/`/\\`/g')

# Detect explicitly requested skills from slash commands, e.g. /session-start
REQUESTED_SKILLS=$(echo "$CLAUDE_USER_PROMPT" | tr ' ' '\n' | grep -oE '^/[a-z0-9-]+' | sed 's#^/##' | sort -u || true)
if [ -n "$REQUESTED_SKILLS" ]; then
  REQUESTED_SKILLS_LIST=$(echo "$REQUESTED_SKILLS" | tr '\n' ',' | sed 's/,$//')
  if command -v jq >/dev/null 2>&1; then
    REQUESTED_SKILLS_JSON=$(printf '%s\n' "$REQUESTED_SKILLS" | jq -R . | jq -s .)
  else
    REQUESTED_SKILLS_JSON=$(printf '%s\n' "$REQUESTED_SKILLS" | awk 'BEGIN { printf "[" } { if (NR>1) printf ","; printf "\"%s\"", $0 } END { printf "]" }')
  fi
else
  REQUESTED_SKILLS_LIST="none"
  REQUESTED_SKILLS_JSON="[]"
fi

# Initialize execution trace for this turn. session-end must finalize executed skills/agents.
cat > "$TURN_DIR/execution_trace.json" << EOF
{
  "turnId": ${TURN_ID},
  "startedAt": "${TURN_START}",
  "requestedSkillsFromPrompt": ${REQUESTED_SKILLS_JSON},
  "skillsExecuted": [],
  "agentsExecuted": [],
  "notes": "Finalize skillsExecuted and agentsExecuted during session-end."
}
EOF

# Write session_context.md
cat > "$TURN_DIR/session_context.md" << EOF
# Session Context — Turn ${TURN_ID}

| Variable | Value |
|----------|-------|
| TURN_ID | ${TURN_ID} |
| TURN_START_TIME | ${TURN_START} |
| TARGET_PROJECT | ${PROJECT_ROOT} |
| CURRENT_TURN_DIRECTORY | ${TURN_DIR} |
| EXECUTION_TRACE_FILE | ${TURN_DIR}/execution_trace.json |
| SKILLS_REQUESTED_FROM_PROMPT | ${REQUESTED_SKILLS_LIST} |
| Branch | ${BRANCH} |

## User Prompt

\`\`\`
${PROMPT_PREVIEW}
\`\`\`

---

## Post-Execution Checklist

- [ ] pull_request.md written
- [ ] adr.md written (full or minimal)
- [ ] execution_trace.json updated with skills/agents executed
- [ ] manifest.json written with SHA-256 hashes
- [ ] turns_index.csv updated
- [ ] git tag turn/${TURN_ID} created (if committed)
EOF

# Output for Claude to see
echo ""
echo "╔════════════════════════════════════════╗"
echo "║  TURN ${TURN_ID} INITIALIZED            "
echo "╠════════════════════════════════════════╣"
echo "║  Directory: turn-${TURN_ID}/           "
echo "║  Started: ${TURN_START}                "
echo "║  Branch: ${BRANCH}                     "
echo "╚════════════════════════════════════════╝"
echo ""
echo "Post-execution: update execution_trace.json and write pull_request.md, adr.md, manifest.json to ${TURN_DIR}/"

exit 0
