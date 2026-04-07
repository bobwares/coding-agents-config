---
name: turn-end
description: Finalize the active turn after execution. Run after every coding prompt, even on failure.
disable-model-invocation: false
---

# Turn End

## Step 1: Resolve Active Task and Turn

Determine the active branch and extract `TASK_ID`.
Determine the most recent turn directory inside the active task and resolve `TURN_ID`.

## Step 2: Finalize `turn_context.md`

Update:

- `TURN_END_TIME`
- `TURN_ELAPSED_TIME`
- `SKILLS_EXECUTED`
- `AGENTS_EXECUTED`

## Step 3: Write `adr.md`

Write exactly one ADR for the turn.
Use the ADR rules to choose full or minimal format.

Path:

`./.appfactory/tasks/task-${TASK_ID}/turns/turn-${TURN_ID}/adr.md`

## Step 4: Write `manifest.json`

Write a manifest that records at least:

- task id
- turn id
- branch
- started at
- ended at
- status
- files changed if available

Path:

`./.appfactory/tasks/task-${TASK_ID}/turns/turn-${TURN_ID}/manifest.json`

## Step 5: Update `execution_trace.json`

Ensure `execution_trace.json` reflects the skills and agents that actually ran.

## Step 6: Leave Task Open

Do not create a PR here.
Do not switch branches here.
This skill closes the turn, not the task.

## Step 7: Confirm Completion

End with a status line that confirms task id, turn id, and turn finalization complete.
