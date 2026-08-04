# Turn 001 Context

## Task
task-004: Update README to match current repo structure

## Turn ID
turn-001

## Start Time
2026-08-04T00:00:00Z

## End Time
2026-08-04T00:20:00Z

## Objective
Update the README from the coding-agents-config project so it accurately
reflects the current repository layout and skill set.

## Summary
Surveyed the working tree (`skills/`, `agents/`, `hooks/`, `scripts/`,
`docs/`, `archive/`, `.appfactory/`) and every `skills/*/SKILL.md`
description, then rewrote `README.md`:
- Corrected the Setup section to match `scripts/setup.sh` (links into
  `~/.claude/`, `~/.codex/`, and repo-local `./.claude/`; no `templates/`
  directory exists).
- Replaced the Structure tree with the actual top-level layout.
- Replaced the Execution Flow diagram and Turn Protocol Summary table with
  the `session-start` → `task-init`/`turn-init` → execution → `turn-end` →
  `task-close` flow defined in `CLAUDE.md`.
- Replaced the stale 9-skill table with grouped tables: turn/task pipeline
  skills, the `af-*` App Factory backend DSL pipeline, and grouped utility
  skills (`dsl-utils`, `e2e-tests`, `ui-utils`, `unit-tests`, `eval-labeler`).
- Added Agents, Scripts, `.appfactory/`, and Archive sections that were
  previously undocumented.

## Skills Executed
- (none — session-start-hook skill was invoked but did not apply; no
  matching `/session-start`, `/task-init`, or `/turn-init` skill was run
  since this session works on a fixed harness-assigned branch rather than
  a `task/TXXX` branch)

## Changes Made
1. Modified `README.md` — full rewrite of Setup, Structure, Execution Flow,
   Turn Protocol Summary, Skills, Hooks, and Scripts sections; added Agents,
   `.appfactory/`, and Archive sections.

## Commit
(recorded in execution_trace.json / manifest.json after commit)

## Files Changed
- README.md
