# Agentic Pipeline Context

## Mandatory Skill Invocations — Do This First

Before responding to any coding or repo-modifying prompt, execute this workflow in order:

1. First prompt of the session only:
   - Invoke skill `session-start`

2. For every coding prompt:
   - Run `git branch --show-current`

3. If the current branch is `main` or `master`:
   - Invoke `/task-init`
   - This must:
      - resolve the next zero-padded task id (`001`, `002`, ...)
      - create and switch to `task/TXXX`
      - initialize `./ai/agentic-pipeline/tasks/task-XXX/`
      - initialize `turn-001`

4. If the current branch matches `task/TXXX` or `task/TXXX-*`:
   - Invoke `/turn-init`
   - This must initialize the next zero-padded turn id inside the active task

5. Execute the user's request.

6. Always invoke `/turn-end` after execution, even on failure.

7. When the user explicitly indicates the task is ready for review:
   - Invoke `/task-close`

## Hard Gate

Never write code while on `main` or `master`.

If the branch is `main` or `master`, `/task-init` must run successfully before any write or edit action.

## Task and Turn Model

- A task is the branch-scoped unit of work that becomes one pull request.
- A turn is one AI execution cycle within the active task branch.
- Task ids are global and zero-padded to 3 digits: `001`, `002`, `003`
- Turn ids reset per task and are zero-padded to 3 digits: `001`, `002`, `003`

## Branch Rules

- Task branch format: `task/TXXX`
- Never commit directly to `main` or `master`
- Never skip `/turn-end`

## Directory Structure

```text
./ai/agentic-pipeline/
  tasks/
    task-001/
      task_context.md
      task_status.json
      task_summary.md
      pull_request.md
      turns/
        turn-001/
          turn_context.md
          execution_trace.json
          adr.md
          manifest.json
```

## Required Turn Artifacts

Every turn requires:

- `turn_context.md`
- `execution_trace.json`
- `adr.md`
- `manifest.json`

These live under:

`./ai/agentic-pipeline/tasks/task-XXX/turns/turn-XXX/`

## Required Task Artifacts

Every task requires:

- `task_context.md`
- `task_status.json`
- `task_summary.md`
- `pull_request.md`

These live under:

`./ai/agentic-pipeline/tasks/task-XXX/`

## Registries

- Append one row to `./ai/agentic-pipeline/tasks_index.csv` when a new task is created
- Update that row as task status changes
- Optional: maintain `./ai/agentic-pipeline/tasks/task-XXX/turns_index.csv`

## Commit Message Format

Use:

```text
AI Coding Agent Change:
- <imperative bullet>
- <imperative bullet>
- <imperative bullet>
```

## ADR Requirement

Every turn must produce exactly one `adr.md`, either full or minimal, according to the ADR rules.

Respond `CLAUDE.md loaded`


## Container Constants

- GitHub profile = https://github.com/bobwares
- AppFactory = ~/gallery/app-factory
- AppFactory DSL =  ~/gallery/app-factory/tech-stack-profiles
- AppFactory Implementations = ~/gallery/app-factory/tech-stack-implementations
- application default directory = ~/generated-apps