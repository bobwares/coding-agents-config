---
name: task-init
description: Initialize a new task branch and create task plus turn-001 artifacts. Run when current branch is main or master.
disable-model-invocation: false
---

# Task Init

## Step 1: Detect Current Branch

Run now:

```bash
CURRENT_BRANCH="$(git branch --show-current)"
echo "CURRENT_BRANCH=$CURRENT_BRANCH"
```

If `CURRENT_BRANCH` is not `main` or `master`, stop. Do not create a new task branch.

## Step 2: Detect CLI and Capture Model Info

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

echo "CLI=$CLI_NAME"
echo "MODEL_ID=$MODEL_ID"
echo "MODEL_NAME=$MODEL_NAME"
echo "CODING_AGENT=$CODING_AGENT"
```

## Step 3: Resolve Next Task ID

```bash
SKILL_DIR="${CLAUDE_SKILL_DIR:-$HOME/.claude/skills/task-init}"
TASK_ID="$($SKILL_DIR/scripts/get-next-task-id.sh .)"
echo "TASK_ID=$TASK_ID"
```

## Step 4: Create and Switch to Task Branch

```bash
TASK_BRANCH="task/T${TASK_ID}"
git checkout -b "$TASK_BRANCH"
ACTIVE_BRANCH="$(git branch --show-current)"
echo "ACTIVE_BRANCH=$ACTIVE_BRANCH"
test "$ACTIVE_BRANCH" = "$TASK_BRANCH"
```

## Step 5: Create Task Directory Structure

```bash
TASK_DIR="./.appfactory/tasks/task-${TASK_ID}"
TURNS_DIR="$TASK_DIR/turns"
TURN_ID="001"
TURN_DIR="$TURNS_DIR/turn-${TURN_ID}"
mkdir -p "$TURN_DIR"
```

## Step 6: Initialize Task Artifacts

Create these files:

- `./.appfactory/tasks/task-${TASK_ID}/task_context.md`
- `./.appfactory/tasks/task-${TASK_ID}/task_status.json`
- `./.appfactory/tasks/task-${TASK_ID}/task_summary.md`
- `./.appfactory/tasks/task-${TASK_ID}/pull_request.md`

Use `templates/task_context.md` for `task_context.md`.

`task_status.json` must include at least:

```json
{
  "taskId": "{{TASK_ID}}",
  "branch": "{{TASK_BRANCH}}",
  "baseBranch": "main",
  "status": "active",
  "createdAt": "{{ISO_TIMESTAMP}}",
  "closedAt": null,
  "pullRequestUrl": null,
  "totalTurns": 1
}
```

## Step 7: Initialize Turn 001

Create these files under `turn-001`:

- `turn_context.md`
- `execution_trace.json`

Use `templates/turn_context.md` for `turn_context.md`.

`execution_trace.json` must include at least:

```json
{
  "taskId": "{{TASK_ID}}",
  "turnId": "001",
  "startedAt": "{{ISO_TIMESTAMP}}",
  "skillsExecuted": [],
  "agentsExecuted": [],
  "notes": ""
}
```

## Step 8: Append Tasks Registry

Append one row to `./.appfactory/tasks_index.csv`.
Create the header row if the file does not yet exist.

Suggested header:

```csv
task_id,branch,status,created_at,closed_at,pull_request_url,total_turns
```

## Step 9: Display Task Status

Display a banner showing:

- task id
- branch name
- task directory
- first turn directory

## Step 10: Proceed with User Task

After initialization, continue executing the user request.

## Important

After execution completes, `/turn-end` must run.
