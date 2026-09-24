# ADR: Resync README.md with Current Repository State

**Date:** 2026-09-24
**Status:** Accepted
**Decision ID:** T004-001-001

## Problem

`README.md` still described the repository as it looked after task-001: a
"Skills (9)" table listing scaffolding skills (`schema-to-database`,
`nestjs-prisma-resource`, `nestjs-customer-crud-scaffold`,
`code-entity-to-crud`, `helloworld`) and a `.system/` meta-skill directory
that were archived in task-002, plus a root `templates/` directory that was
later moved to `archive/templates/`. The Setup section's symlink list and
the Execution Flow mermaid diagram (branch-per-turn via `branch-guard`
creating `turn/T{ID}`) also no longer matched `scripts/setup.sh` or the
`task-init`/`turn-init`/`turn-end`/`task-close` skills that actually
implement `CLAUDE.md`'s task/turn protocol today.

## Decision

**Rewrite `README.md` from a fresh audit of the repository rather than
patch individual stale sections.**

Specifically:
- Enumerate the real contents of `skills/` (24 directories) and group them
  as Pipeline Governance, App Factory SDLC (`af-*`), Quality & Ops, and
  unimplemented stubs (no `SKILL.md`).
- Match the Setup/symlink instructions to `scripts/setup.sh`'s actual
  `CLAUDE_TARGETS`/`CODEX_TARGETS` arrays.
- Correct the Structure tree: `archive/templates/` in place of a root
  `templates/`; no root `plugins/`/`prompts/`; `.appfactory/` subdirs as
  they exist on disk.
- Replace the Execution Flow diagram with the actual
  `task-init` → `turn-init` → (execute) → `turn-end` → `task-close` flow
  read from each skill's `SKILL.md`, and describe
  `hooks/branch-guard.sh` as the `PreToolUse` safety net it is, not the
  primary branch-creation path.
- Add an Archive section pointing readers to `archive/README.md` for the
  retired skills' history instead of silently dropping that context.

## Rationale

1. **Accuracy over patch:** the previous README had drifted across three
   completed tasks; a full rewrite from a direct repo audit was faster and
   less error-prone than reconciling incremental patches.
2. **Single source of truth:** each `SKILL.md`'s frontmatter `description`
   was used verbatim (or lightly trimmed) so the README stays consistent
   with the skills it documents.
3. **No behavior change:** this is a documentation-only turn — no skill,
   hook, or script logic was modified.

## Consequences

**Positive:**
- New contributors and future agent sessions get an accurate map of the
  repository instead of one describing an earlier iteration.
- Reduces the chance a future task references directories/skills that no
  longer exist (`templates/`, `.system/`, `helloworld`, etc.).

**Negative:**
- None identified; this turn only edits `README.md`.

## Implementation Details

Updated sections in `README.md`:
1. Overview — now describes the App Factory SDLC plus the governance
   layer, rather than only the governance layer.
2. Setup — symlink list matches `scripts/setup.sh`.
3. Structure — corrected tree (`archive/templates/`, `.appfactory/`
   subdirectories, no root `templates/`/`plugins/`/`prompts/`).
4. Execution Flow — new mermaid diagram matching
   `task-init`/`turn-init`/`turn-end`/`task-close`/`branch-guard.sh`.
5. Skills — full 24-skill table replacing the stale 9-skill table and
   `.system/` section.
6. Added an Archive section.

## Related Skills

- **session-start, task-init, turn-init, turn-end, task-close,
  branch-guard:** governance skills documented in the rewritten README.
- **af-orchestrator and the af-be-\* family:** App Factory SDLC skills now
  documented for the first time in the README.

## Open Questions

None. The rewrite reflects the repository as observed at the time of this
turn; it should be revisited whenever skills are added, archived, or
renamed.
