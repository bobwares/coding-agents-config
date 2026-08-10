# Pull Request — Task 004

## Title

Update README to match current repo structure and task/turn workflow

## Summary

The README had drifted from the repository: it described a top-level
`templates/`/`plugins/` directory that no longer exists, a flat 9-skill list
(the repo now has 23 skills plus 5 meta-skills), and a `turn/T{TURN_ID}`
branch model that predates the current `task/TXXX` + `turn-XXX` model defined
in `CLAUDE.md`. This PR brings the README back in sync with the actual repo
layout, skill set, hook behavior, and execution flow.

## Changes

- `README.md`: rewritten Setup, Structure, Execution Flow, Skills, Agents,
  Hooks, and Templates sections (see `task_summary.md` for the full list).

## Test Plan

- Read-only documentation change; no code paths affected.
- Verified every referenced path (`agents/`, `.github/`, `docs/`,
  `archive/templates/`, `hooks/branch-guard.sh`, `scripts/setup.sh`,
  `.appfactory/`) exists in the repo.
- Cross-checked skill names/descriptions against each `skills/*/SKILL.md`
  frontmatter and `docs/skill-summary.md`.
- Cross-checked the task/turn flow against `CLAUDE.md` and the
  `task-init`/`turn-init`/`turn-end`/`task-close` `SKILL.md` files.
