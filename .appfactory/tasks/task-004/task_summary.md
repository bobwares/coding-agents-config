# Task Summary — Task 004

## Objective

Update the top-level README.md so it accurately reflects the current state of
the coding-agents-config repository.

## Status

Active

## Changes

- Rewrote `README.md`: replaced the stale skills/templates description with
  an accurate inventory of `skills/` (turn/task pipeline skills, the `af-*`
  App Factory backend DSL pipeline, and grouped utility skills), `agents/`,
  `hooks/`, `scripts/`, `.appfactory/`, `docs/`, and `archive/`.
- Removed references to a `templates/` directory and a 9-skill count that no
  longer match the repository; corrected the setup/symlink instructions to
  match `scripts/setup.sh` (`~/.claude/`, `~/.codex/`, and repo-local
  `./.claude/`).
- Updated the execution-flow diagram and turn protocol table to match the
  actual `session-start` → `task-init`/`turn-init` → execution → `turn-end`
  → `task-close` flow defined in `CLAUDE.md`.
