# Task Summary — Task 004

## Objective

Update the README from the coding-agents-config project so it reflects the
repository's current state.

## Status

Active (single-turn scheduled task; branch not yet merged)

## Changes

- Rewrote `README.md`:
  - Corrected `scripts/setup.sh` description (real symlink targets, `~/.codex/` links)
  - Rebuilt the repo structure tree to match what's actually on disk
  - Replaced the stale "Skills (9)" table with a categorized table of all 37
    skills (`af-*` App Factory pipeline, `.nestjs/` scaffolding, pipeline
    lifecycle, utility skills, `.system/` meta-skills)
  - Redrew the execution-flow Mermaid diagram to match the actual
    `task-init` → `turn-init` → `turn-end` → `task-close` model in `CLAUDE.md`,
    including the `branch-guard.sh` safety net
  - Removed references to a top-level `templates/`/`plugins/` directory and
    skills that no longer exist (`helloworld`, `schema-to-database`, etc.)
- Added task/turn governance artifacts for this turn under
  `.appfactory/tasks/task-004/`
