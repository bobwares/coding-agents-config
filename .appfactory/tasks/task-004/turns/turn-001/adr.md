# ADR — Task 004 Turn 001: Update README.md; track task under current session branch

- **Date**: 2026-07-26T14:07:34Z
- **Agent**: AI Coding Agent (claude-sonnet-5)
- **Status**: Accepted

## 1. README content refresh

No architectural decision made this turn — rewrote `README.md` (Setup, Structure,
Execution Flow, Skills, Hooks, Archive sections) to match the repository's current
state: the two-level task/turn workflow (`task-init`/`turn-init`/`turn-end`/
`task-close`), the 37 skills actually present under `skills/` (App Factory
pipeline, `.nestjs/` scaffolding, DSL/UI/test utilities, `.system/` meta-skills),
the `agents/` directory, and the `archive/` directory for superseded skills. No
files, skills, or behavior were changed — documentation only.

## 2. Task/turn artifact branch tracking

Decision: track this turn's task/turn artifacts under `.appfactory/tasks/task-004`
without creating a new `task/T004` git branch.

- **Context**: `CLAUDE.md`'s hard gate and `skills/task-init/SKILL.md` only create
  a new task branch when the current branch is `main` or `master`. This session's
  hosting harness pins work to a pre-assigned branch, `claude/awesome-turing-c12zhh`
  (not `main`, not `task/TXXX`), and explicitly forbids pushing to a different
  branch without permission.
- **Decision**: Since the branch-creation precondition (`main`/`master`) is not
  met, no new task branch was created; `task-004`'s `task_status.json` records
  `branch: claude/awesome-turing-c12zhh` instead of `task/T004`. Turn artifacts
  are still fully tracked for provenance.
- **Consequence**: `tasks_index.csv`/`task_status.json` for task 004 will show a
  non-standard branch name. This is a one-off accommodation for the hosting
  harness's branch pinning, not a change to the `task-init` skill itself.
