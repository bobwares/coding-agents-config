---
name: turn-init
description: "Initialize a new turn directory and turn context. Run at the start of every coding task."
disable-model-invocation: false
---

# Turn Init

Initialize the turn directory and artifacts for provenance tracking.

## Step 1: Detect CLI and Capture Model Info

Different AI coding CLIs expose model information via environment variables. Use fallback detection:

```bash
# Detect which CLI is running and get model ID
if [ -n "$ANTHROPIC_MODEL" ]; then
  # Claude Code
  CLI_NAME="claude-code"
  MODEL_ID="$ANTHROPIC_MODEL"
elif [ -n "$CODEX_MODEL" ]; then
  # OpenAI Codex CLI
  CLI_NAME="codex"
  MODEL_ID="$CODEX_MODEL"
elif [ -n "$OPENAI_MODEL" ]; then
  # OpenAI generic
  CLI_NAME="openai"
  MODEL_ID="$OPENAI_MODEL"
elif [ -n "$AI_MODEL" ]; then
  # Generic AI CLI
  CLI_NAME="ai-cli"
  MODEL_ID="$AI_MODEL"
else
  # Unknown - use fallback
  CLI_NAME="unknown"
  MODEL_ID="unknown"
fi

# Derive friendly name from model ID
# "claude-opus-4-5" → "Claude Opus 4.5"
# "gpt-4o" → "Gpt 4o"
MODEL_NAME=$(echo "$MODEL_ID" | sed 's/-/ /g' | sed 's/4 5/4.5/g' | sed 's/\b\(.\)/\u\1/g')

# Coding agent label for artifacts
CODING_AGENT="AI Coding Agent ($MODEL_NAME)"

echo "CLI: $CLI_NAME"
echo "Model ID: $MODEL_ID"
echo "Model Name: $MODEL_NAME"
echo "Coding Agent: $CODING_AGENT"
```

**Environment Variables by CLI:**

| CLI         | Model Variable    | Detection Variable     |
|-------------|-------------------|------------------------|
| Claude Code | `ANTHROPIC_MODEL` | `INSIDE_CLAUDE_CODE=1` |
| Codex       | `CODEX_MODEL`     | `INSIDE_CODEX=1`       |
| OpenAI      | `OPENAI_MODEL`    | -                      |
| Generic     | `AI_MODEL`        | -                      |

**Extending for new CLIs:** Add an `elif` branch checking for that CLI's model environment variable.

## Step 2: Resolve Turn ID

Get the next turn ID:
```bash
TURN_ID=$(./skills/turn-init/scripts/get-next-turn-id.sh .)
echo $TURN_ID
```

## Step 2: Create Turn Directory

```bash
TURN_DIR="./ai/agentic-pipeline/turns/turn-${TURN_ID}"
mkdir -p "$TURN_DIR"
echo $TURN_DIR
```

## Step 3: Initialize turn_context.md

**MANDATORY**: Read the template file first, then fill in all placeholders.

1. **Read template**: `./turn_context.md`
2. **Replace ALL placeholders** with actual values:

| Placeholder                                          | Value                                                 |
|------------------------------------------------------|-------------------------------------------------------|
| `{{TURN_ID}}`                                        | Resolved turn number                                  |
| `{{TURN_START_TIME}}`                                | Current UTC timestamp (ISO 8601)                      |
| `{{TURN_END_TIME}}`                                  | Leave as `[pending]`                                  |
| `{{TURN_ELAPSED_TIME}}`                              | Leave as `[pending]`                                  |
| `{{TARGET_PROJECT}}`                                 | Absolute path to project root                         |
| `{{CURRENT_TURN_DIRECTORY}}`                         | `./ai/agentic-pipeline/turns/turn-${TURN_ID}`         |
| `{{CLI_NAME}}`                                       | Value of `$CLI_NAME` from Step 1                      |
| `{{MODEL_ID}}`                                       | Value of `$MODEL_ID` from Step 1                      |
| `{{CODING_AGENT}}`                                   | Value of `$CODING_AGENT` from Step 1                  |
| `{{ACTIVE_BRANCH}}`                                  | Current git branch                                    |
| `{{TASK_DESCRIPTION}}`                               | First 500 chars of user prompt                        |
| `{{respond with the first 50 lines of the prompt.}}` | The user's full prompt (up to 50 lines)               |
| `{{DOMAIN_SKILL}}`                                   | List of skills used during turn or `none`             |
| `{{SKILLS_REQUESTED_FROM_PROMPT}}`                   | Skills explicitly requested, or `none`                |
| `{{SKILLS_EXECUTED}}`                                | `[pending - finalize at session-end]`                 |
| `{{AGENTS_EXECUTED}}`                                | `[pending - finalize at session-end]`                 |
| `{{TASK_TYPE}}`                                      | Type of task (e.g., `bug-fix`, `feature`, `refactor`) |
| `{{ASSIGNED_AGENT}}`                                 | Agent handling the task, or `claude`                  |

3. **Write filled template** to: `./ai/agentic-pipeline/turns/turn-${TURN_ID}/turn_context.md`

## Step 4: Initialize execution_trace.json

Write to `./ai/agentic-pipeline/turns/turn-${TURN_ID}/execution_trace.json`:
```json
{
  "turnId": "${TURN_ID}",
  "startedAt": "[ISO timestamp]",
  "skillsExecuted": [],
  "agentsExecuted": [],
  "notes": ""
}
```

## Step 5: Display Turn Status

```
╔════════════════════════════════════════╗
║  TURN ${TURN_ID} INITIALIZED
╠════════════════════════════════════════╣
║  Directory: turn-${TURN_ID}/
║  Started: [timestamp]
║  Branch: [branch]
╚════════════════════════════════════════╝
```

## Step 6: Proceed with User Task

After displaying status, proceed to execute the user's original request.

---

## IMPORTANT: Post-Execution Requirement

**After completing the user's task, you MUST run `/turn-end` to:**
- Update `turn_context.md` with TURN_END_TIME and TURN_ELAPSED_TIME
- Create `pull_request.md`
- Create `adr.md`
- Create `manifest.json`
- Update `turns_index.csv`
- Tag the commit

A turn is incomplete without these artifacts. Do not end the conversation until `/turn-end` has been executed.
