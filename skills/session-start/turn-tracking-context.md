# Task and Turn Tracking Rules

Every coding task prompt executes within a task branch and produces one turn.

## Every Turn Requires

| Artifact | Path | When |
|---|---|---|
| `turn_context.md` | `./.appfactory/tasks/task-${TASK_ID}/turns/turn-${TURN_ID}/` | Pre-execution |
| `execution_trace.json` | `./.appfactory/tasks/task-${TASK_ID}/turns/turn-${TURN_ID}/` | Pre-execution |
| `adr.md` | `./.appfactory/tasks/task-${TASK_ID}/turns/turn-${TURN_ID}/` | Post-execution |
| `manifest.json` | `./.appfactory/tasks/task-${TASK_ID}/turns/turn-${TURN_ID}/` | Post-execution |

## Every Task Requires

| Artifact | Path |
|---|---|
| `task_context.md` | `./.appfactory/tasks/task-${TASK_ID}/` |
| `task_status.json` | `./.appfactory/tasks/task-${TASK_ID}/` |
| `task_summary.md` | `./.appfactory/tasks/task-${TASK_ID}/` |
| `pull_request.md` | `./.appfactory/tasks/task-${TASK_ID}/` |

## Post-Execution Always Runs

Even if execution fails, complete `/turn-end`.
A turn without all required artifacts is incomplete.

## Registry

Append one row to `./.appfactory/tasks_index.csv` when a new task is created.
Update that row as the task status changes.

## Full Spec

- Invoke `/session-start` once per session
- Invoke `/task-init` when current branch is `main` or `master`
- Invoke `/turn-init` when already on a task branch
- Invoke `/turn-end` after every coding prompt
- Invoke `/task-close` when the user declares the task branch ready for review
