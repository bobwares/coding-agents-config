# ADR: Resync README.md with Current Repository State

**Date:** 2026-08-10
**Status:** Accepted
**Decision ID:** T004-001-001

## Problem

`README.md` had drifted significantly from the repository it describes:

1. It referenced a top-level `templates/` and `plugins/` directory that no
   longer exist — templates were relocated to `archive/templates/` as part
   of the migration to the AppFactory (`af-*`) pipeline.
2. It listed only 9 skills (`session-start`, `turn-init`, `turn-end`,
   `branch-guard`, plus 5 old scaffolding skills like
   `nestjs-prisma-resource`), while the repo now has 23 skills including the
   full `af-*` backend pipeline, `task-init`/`task-close`, and several
   utility wrapper skills.
3. Its Execution Flow diagram described a flat `turn/T{TURN_ID}` branch
   model, superseded by the `task/TXXX` + `turn-XXX` model that `CLAUDE.md`
   and the `task-init`/`turn-init` skills actually implement.
4. It didn't mention `agents/`, `.github/`, `docs/`, or `package.json`.

An out-of-date README misleads anyone (human or agent) trying to understand
how to set up or extend this repo.

## Decision

**Rewrite README.md to describe the repository as it exists today**, sourced
from a direct survey of the filesystem (`skills/*/SKILL.md` frontmatter,
`scripts/setup.sh`, `hooks/branch-guard.sh`, `CLAUDE.md`, `docs/skill-summary.md`)
rather than incremental edits to the stale content.

Specifically:
- Setup section's manual symlink list now matches `scripts/setup.sh`'s
  `CLAUDE_TARGETS`/`CODEX_TARGETS` arrays exactly, with a note that
  `rules/`, `context/`, and `plugins/` are script targets with no
  corresponding source directory yet.
- Structure tree reflects the actual top-level layout.
- Execution Flow diagram and protocol table describe the `task/TXXX` +
  `turn-XXX` model, matching `CLAUDE.md`.
- Skills table lists all 23 skills grouped as Lifecycle / AppFactory (`af-*`)
  / Utility, plus the 5 `.system/` meta-skills, with descriptions pulled
  from each skill's own frontmatter where available.
- New Agents section documents `agents/agent-architecture-planner.md`.
- Templates section repointed to `archive/templates/`, clarifying these are
  historical/reference rather than in active use.

## Rationale

1. **Accuracy over incremental patching:** the drift was broad enough
   (branch model, skill count, directory layout) that a full resync was
   clearer than patching individual stale lines.
2. **Source of truth:** `CLAUDE.md` and the skills' own `SKILL.md` files are
   the authoritative description of current behavior; the README should
   summarize them, not an earlier snapshot.
3. **No functional changes:** this is a documentation-only change — no
   skill, hook, or script behavior was modified.

## Consequences

**Positive:**
- New contributors (human or AI) get an accurate map of the repo.
- Setup instructions match what `scripts/setup.sh` actually does.
- Execution flow diagram matches the governance rules Claude Code sessions
  are actually required to follow per `CLAUDE.md`.

**Negative:**
- None identified; this is a documentation-only change.

## Related Files

- `CLAUDE.md` — source of truth for the task/turn protocol
- `docs/skill-summary.md` — source of truth for the `af-*` pipeline phases
- `scripts/setup.sh` — source of truth for symlink targets
- `hooks/branch-guard.sh` — source of truth for branch-guard behavior

## Open Questions

None. The change is complete and self-contained.
