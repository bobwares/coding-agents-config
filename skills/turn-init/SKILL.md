---
name: turn-init
description: Initialize the next turn within the active task branch. Run when already on a task branch.
disable-model-invocation: false
---

# Turn Init

## Step 1: Detect Current Branch

Run now:

```bash
ACTIVE_BRANCH="$(git branch --show-current)"
echo "ACTIVE_BRANCH=$ACTIVE_BRANCH"
```

The active branch must match one of:

- `task/TXXX`


If not, stop.

## Step 2: Resolve Task ID from Branch

```bash
TASK_ID="$(echo "$ACTIVE_BRANCH" | sed -E 's#^task/T([0-9]{3})(-.+)?$##')"
echo "TASK_ID=$TASK_ID"
```

Validate that `TASK_ID` matches `^[0-9]{3}$`.

## Step 3: Detect CLI and Capture Model Info

```bash
if [ -n "$ANTHROPIC_MODEL" ]; then
  CLI_NAME="claude-code"
  MODEL_ID="$ANTHROPIC_MODEL"
elif [ -n "$CODEX_MODEL" ]; then
  CLI_NAME="codex"
  MODEL_ID="$CODEX_MODEL"
elif [ -n "$OPENAI_MODEL" ]; then
  CLI_NAME="openai"
  MODEL_ID="$OPENAI_MODEL"
elif [ -n "$AI_MODEL" ]; then
  CLI_NAME="ai-cli"
  MODEL_ID="$AI_MODEL"
else
  CLI_NAME="unknown"
  MODEL_ID="unknown"
fi

MODEL_NAME="$MODEL_ID"
CODING_AGENT="AI Coding Agent ($MODEL_NAME)"
```

## Step 4: Resolve Next Turn ID Within the Active Task

```bash
SKILL_DIR="${CLAUDE_SKILL_DIR:-$HOME/.claude/skills/turn-init}"
TURN_ID="$($SKILL_DIR/scripts/get-next-turn-id.sh . "$TASK_ID")"
echo "TURN_ID=$TURN_ID"
```

## Step 5: Create Turn Directory

```bash
TASK_DIR="./ai/agentic-pipeline/tasks/task-${TASK_ID}"
TURNS_DIR="$TASK_DIR/turns"
TURN_DIR="$TURNS_DIR/turn-${TURN_ID}"
mkdir -p "$TURN_DIR"
```

## Step 6: Initialize Turn Artifacts

Create:

- `turn_context.md`
- `execution_trace.json`

inside `./ai/agentic-pipeline/tasks/task-${TASK_ID}/turns/turn-${TURN_ID}/`

Use `templates/turn_context.md` for `turn_context.md`.

`execution_trace.json` must include at least:

```json
{
  "taskId": "{{TASK_ID}}",
  "turnId": "{{TURN_ID}}",
  "startedAt": "{{ISO_TIMESTAMP}}",
  "skillsExecuted": [],
  "agentsExecuted": [],
  "notes": ""
}
```

## Step 7: Update Task Status

Increment `totalTurns` in:

`./ai/agentic-pipeline/tasks/task-${TASK_ID}/task_status.json`

## Step 8: Display Turn Status

Display a banner showing:

- task id
- turn id
- branch name
- turn directory

## Step 9: Proceed with User Task

After initialization, continue executing the user request.

## Important

After execution completes, `/turn-end` must run.
