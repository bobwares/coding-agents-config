# Task Summary — Task 004

## Objective

Update `README.md` so it accurately reflects the current state of the
coding-agents-config repository.

## Status

Active

## Changes

- Rewrote `README.md`:
  - Corrected the setup/symlink instructions to match `scripts/setup.sh`
    (`skills`, `agents`, `hooks`, `scripts`, `CLAUDE.md`, `settings.json`
    into `~/.claude/`; `agents`, `AGENTS.md` into `~/.codex/`).
  - Rewrote the `Structure` tree to match the actual repository layout,
    removing references to non-existent `templates/`, `plugins/`, and
    `prompts/` top-level directories and adding `agents/`, `archive/`,
    and the real `skills/` contents.
  - Replaced the outdated turn-only execution-flow diagram with one
    matching the current `task-init` → `turn-init` → `turn-end` →
    `task-close` protocol defined in `CLAUDE.md`.
  - Replaced the stale "Skills (9)" table (which listed skills that no
    longer exist, such as `schema-to-database` and `helloworld`) with an
    accurate, categorized listing of the governance skills and the 13
    `af-*` AppFactory pipeline skills, plus the nested utility skills
    (`dsl-utils`, `ui-utils`, `unit-tests`, `e2e-tests`, `eval-labeler`).
  - Added an `Agents` section documenting `agent-architecture-planner`.
  - Removed the `Templates` section (the `templates/` directory does not
    exist in this repository) and added a `Registries` section
    documenting `tasks_index.csv`.
