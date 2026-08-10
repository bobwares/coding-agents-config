# Task Summary — Task 004

## Objective

Update the top-level README.md so it accurately reflects the current state of the
coding-agents-config repository.

## Status

Active

## Changes

- Rewrote `README.md`:
  - Corrected the Setup section's manual symlink instructions to match
    `scripts/setup.sh` (added `agents/`, removed the now-nonexistent
    `templates/` symlink, added the `~/.codex/` targets).
  - Rewrote the Structure tree to match the actual top-level layout
    (`agents/`, `.github/`, `docs/`, `package.json`, `archive/`, and the
    current `skills/` contents) instead of the stale one referencing a
    top-level `templates/`/`plugins/` directory.
  - Replaced the stale "turn/T{TURN_ID}"-branch Execution Flow diagram with
    one matching the current `task/TXXX` + `turn-XXX` model described in
    `CLAUDE.md` (`session-start` → `task-init`/`turn-init` → execution →
    `turn-end` → optional `task-close`).
  - Replaced the 9-skill table with a 23-skill table grouped into
    Lifecycle, AppFactory (`af-*`) pipeline, and Utility categories, plus
    an updated `.system/` meta-skills table (5 skills).
  - Added an `Agents` section documenting `agents/agent-architecture-planner.md`.
  - Updated the Hooks section to describe the actual `branch-guard.sh`
    behavior (auto-creates `task/TXXX` on main/master).
  - Replaced the stale `Templates` section (which pointed at a
    non-existent top-level `templates/` dir) with a `Templates & archive`
    section pointing at `archive/templates/`.
