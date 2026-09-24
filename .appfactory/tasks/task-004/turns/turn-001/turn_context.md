# Turn 001 Context

## Task
task-004: Update the coding-agents-config README

## Turn ID
turn-001

## Start Time
2026-09-24T14:16:45Z

## End Time
2026-09-24T14:40:00Z

## Objective
Bring `README.md` back in sync with the current state of the repository — the
active App Factory (`af-*`) skills, the task/turn governance skills, the
retired scaffolding skills now under `archive/`, and the real directory
layout — after it had drifted through tasks 001-003.

## Summary
Audited the repository (skills/, agents/, docs/, archive/, scripts/, hooks/,
.appfactory/, settings.json, package.json) and rewrote `README.md`:
- Replaced the stale "Skills (9)" table (referencing archived skills like
  `helloworld`, `schema-to-database`, `nestjs-prisma-resource`, and a
  `.system/` meta-skill dir that no longer exists) with an accurate
  24-skill breakdown grouped as Pipeline Governance, App Factory SDLC
  (`af-*`), Quality & Ops, and unimplemented stub skills.
- Corrected the Setup section's symlink targets to match
  `scripts/setup.sh` (adds `agents`, drops the now-nonexistent root
  `templates/` symlink, adds the Codex `AGENTS.md` link).
- Corrected the Structure diagram: `templates/` moved to
  `archive/templates/`; there is no root `plugins/` or `prompts/`
  directory; `.appfactory/` holds `tasks/`, `specs/`, `prompts/`, and
  `memory/`.
- Replaced the outdated `turn/T{TURN_ID}` branch-per-turn mermaid diagram
  with the actual `task/TXXX` + `turn-XXX` flow driven by
  `task-init`/`turn-init`/`turn-end`/`task-close`, and documented
  `hooks/branch-guard.sh` as the auto-branch safety net rather than the
  primary mechanism.
- Added an Archive section pointing to `archive/README.md` /
  `archive/SUMMARY.md`.

## Skills Executed
- turn-init: Initialize turn-001 (bookkeeping only — session's git branch
  was pre-assigned by the host environment rather than created by
  `task-init`)
- turn-end: Finalize turn-001

## Changes Made
1. Rewrote `/home/user/coding-agents-config/README.md` in full.

## Commit
(recorded in manifest.json / execution_trace.json after commit)

## Files Changed
- README.md (full rewrite)
