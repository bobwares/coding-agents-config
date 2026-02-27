---
name: spec-task-next
description: >-
  Get the next uncompleted task in the current epic.
  Arguments: epic name (optional — auto-detects from branch).
disable-model-invocation: false
---

# Get Next Task

## Detect Epic

If $ARGUMENTS is provided: use it.
Otherwise: get current branch with `git branch --show-current` and extract epic name (branch format: `epic/<name>`).

## Find Next Task

Read `.claude/epics/<epic-name>/epic.md`

Find the first unchecked task: `- [ ] **T[N]**`

Report:
```
Epic: <epic-name>
Next Task: T[N] — [description]
Agent: <agent name>
Dependencies: T[prev] (status: done/pending)
```

## Suggest Action

- If the task depends on an incomplete task: "T[prev] must complete first. Run `/spec-task-next` again after T[prev] is done."
- If no dependencies: "Spawn `<agent>` with: [task description and relevant context]"
- If all tasks complete: "Epic complete! Run `/verify-all` then `/git-commit-push-pr`"

## Progress Summary

Show quick progress bar:
```
Epic Progress: ██████░░░░ 6/10 tasks complete
```
