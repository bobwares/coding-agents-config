---
name: turn-init
description: Initialize a new turn directory and session context. Run at the start of every coding task.
disable-model-invocation: false
---

# Turn Init

Initialize the turn directory and artifacts for provenance tracking.

## Step 1: Resolve Turn ID

Get the next turn ID:
```bash
if [ -x "./scripts/get-next-turn-id.sh" ]; then
  TURN_ID=$(./scripts/get-next-turn-id.sh .)
elif [ -x "$HOME/.claude/scripts/get-next-turn-id.sh" ]; then
  TURN_ID=$($HOME/.claude/scripts/get-next-turn-id.sh .)
else
  TURN_ID=1
fi
```

## Step 2: Create Turn Directory

```bash
TURN_DIR="./ai/agentic-pipeline/turns/turn-${TURN_ID}"
mkdir -p "$TURN_DIR"
```

## Step 3: Initialize session_context.md

**MANDATORY**: Read the template file first, then fill in all placeholders.

1. **Read template**: `${HOME}/.claude/templates/session_context.md`
2. **Replace ALL placeholders** with actual values:

| Placeholder                                          | Value                                                 |
|------------------------------------------------------|-------------------------------------------------------|
| `{{TURN_ID}}`                                        | Resolved turn number                                  |
| `{{TURN_START_TIME}}`                                | Current UTC timestamp (ISO 8601)                      |
| `{{TURN_END_TIME}}`                                  | Leave as `[pending]`                                  |
| `{{TURN_ELAPSED_TIME}}`                              | Leave as `[pending]`                                  |
| `{{TARGET_PROJECT}}`                                 | Absolute path to project root                         |
| `{{CURRENT_TURN_DIRECTORY}}`                         | `./ai/agentic-pipeline/turns/turn-${TURN_ID}`         |
| `{{CODING_AGENT}}`                                   | `Claude Opus 4.5` (or current model)                  |
| `{{ACTIVE_BRANCH}}`                                  | Current git branch                                    |
| `{{TASK_DESCRIPTION}}`                               | First 500 chars of user prompt                        |
| `{{respond with the first 50 lines of the prompt.}}` | The user's full prompt (up to 50 lines)               |
| `{{DOMAIN_SKILL}}`                                   | Primary skill being used, or `none`                   |
| `{{SKILLS_REQUESTED_FROM_PROMPT}}`                   | Skills explicitly requested, or `none`                |
| `{{SKILLS_EXECUTED}}`                                | `[pending - finalize at session-end]`                 |
| `{{AGENTS_EXECUTED}}`                                | `[pending - finalize at session-end]`                 |
| `{{TASK_TYPE}}`                                      | Type of task (e.g., `bug-fix`, `feature`, `refactor`) |
| `{{ASSIGNED_AGENT}}`                                 | Agent handling the task, or `claude`                  |

3. **Write filled template** to: `./ai/agentic-pipeline/turns/turn-${TURN_ID}/session_context.md`

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

**After completing the user's task, you MUST run `/session-end` to:**
- Update `session_context.md` with TURN_END_TIME and TURN_ELAPSED_TIME
- Create `pull_request.md`
- Create `adr.md`
- Create `manifest.json`
- Update `turns_index.csv`
- Tag the commit

A turn is incomplete without these artifacts. Do not end the conversation until `/session-end` has been executed.
