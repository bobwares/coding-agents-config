# ADR — Task 004 Turn 001: Resync README with current repo state

- **Date**: 2026-09-25
- **Status**: Accepted
- **Type**: Minimal (documentation update following established structure, no design trade-offs)

## Decision

Rewrite `README.md`'s Setup, Structure, Execution Flow, Skills, Templates,
and Hooks sections to describe the repository as it exists today (the
`af-*` App Factory pipeline, the task/turn governance model, and the real
`skills/`/`agents/`/`archive/`/`docs/` layout), replacing content that
described an earlier turn-only prototype and a skill set that no longer
exists.

## Rationale

The README had drifted from the codebase: it listed skills that were
removed or archived, a shared `templates/` directory that no longer exists,
and an execution flow (`turn/T{ID}` branches, no task concept) superseded by
the task/turn model documented in `CLAUDE.md` and implemented in
`task-init`/`turn-init`/`turn-end`/`task-close`. No code behavior changed;
this is a documentation-accuracy fix.
