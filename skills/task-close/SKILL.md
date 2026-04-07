---
name: task-close
description: Finalize the active task branch, push it, and open a pull request against main.
disable-model-invocation: false
---

# Task Close

## Step 1: Validate Task State

Resolve the active branch and extract `TASK_ID`.
Verify the active branch is a task branch.
Verify required task artifacts exist.
Verify the most recent turn has been finalized.

## Step 2: Update Task-Level Artifacts

Update these files under `./.appfactory/tasks/task-${TASK_ID}/`:

- `task_status.json`
- `task_summary.md`
- `pull_request.md`

At minimum:

- set task status to `candidate` before PR creation
- summarize completed work in `task_summary.md`
- prepare PR content in `pull_request.md`

## Step 3: Stage and Commit

Stage the relevant task and code changes.
Create a commit with this format:

```text
AI Coding Agent Change:
- <imperative bullet>
- <imperative bullet>
- <imperative bullet>
```

## Step 4: Push Branch

Push the current task branch to origin.

## Step 5: Create Pull Request Against `main`

Create the PR against `main`.
Record the PR URL in:

- `task_status.json`
- `pull_request.md`
- `tasks_index.csv`

Set task status to `pr-open` after PR creation.

## Step 6: Return Local Repository to `main`

After successful push and PR creation:

1. switch to `main`
2. pull latest `main`

## Step 7: Confirm Completion

End with a status message that includes:

- task id
- branch name
- PR URL
- confirmation that local branch has returned to `main`
