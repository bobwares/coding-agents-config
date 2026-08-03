# ADR — Task 004 Turn 001: Realign README with Actual Repository State

- **Date**: 2026-08-03T14:15:00Z
- **Agent**: AI Coding Agent (claude-sonnet-5)
- **Status**: Accepted

No architectural decision made this turn — documentation-only change. `README.md` had drifted
from the repository: it described a `turn/T{TURN_ID}`-per-turn branch model that contradicts
the current `task/TXXX`-branch-with-nested-turns model in `CLAUDE.md`, `task-init`, `turn-init`,
and `hooks/branch-guard.sh`; listed 9 skills when 37 exist; and referenced `templates/`,
`plugins/`, and top-level `prompts/` directories that no longer exist (templates now live in
`archive/templates/`). Corrected all of these to match the repository as inspected.
