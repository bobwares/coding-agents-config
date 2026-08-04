# ADR: Rewrite README to Match Current Repository State

**Date:** 2026-08-04
**Status:** Accepted
**Decision ID:** T004-001-001

## Problem

`README.md` described a repository layout that no longer matches the
working tree: it referenced a `templates/` directory that does not exist,
listed 9 skills (`session-start`, `turn-init`, `turn-end`, `branch-guard`,
`schema-to-database`, `nestjs-prisma-resource`,
`nestjs-customer-crud-scaffold`, `code-entity-to-crud`, `helloworld`) most
of which have since moved to `archive/` or been superseded by the `af-*`
App Factory skill suite, and omitted `agents/`, `docs/`, `archive/`, and
`.appfactory/` entirely.

## Decision

Rewrite `README.md` end to end from a direct survey of the working tree
(`skills/*/SKILL.md`, `agents/`, `hooks/`, `scripts/`, `docs/`, `archive/`,
`.appfactory/`, `scripts/setup.sh`) rather than patching individual stale
lines, since the drift spanned nearly every section.

## Rationale

1. **Accuracy over minimal diff:** the old content was wrong in enough
   places (directory list, skill count, setup script targets) that a
   line-by-line patch would still leave gaps.
2. **Single source of truth:** `scripts/setup.sh` defines the actual
   symlink targets (`skills agents rules hooks context scripts plugins
   CLAUDE.md settings.json` into `~/.claude/`; `agents AGENTS.md` into
   `~/.codex/`), so the Setup section now mirrors that script instead of a
   hand-maintained list.
3. **No source changes:** this is a documentation-only turn; no skill,
   hook, or script behavior was modified.

## Consequences

**Positive:**
- README now matches `ls skills/`, `ls agents/`, `ls docs/`, `ls archive/`.
- New contributors can find the `af-*` App Factory pipeline and the
  turn/task governance model documented in `CLAUDE.md`.

**Negative:**
- None identified; documentation-only change.

## Related Files

- `README.md`
- `CLAUDE.md` (source of truth for the turn/task protocol described)
- `scripts/setup.sh` (source of truth for symlink targets)

## Open Questions

None.
