# Pull Request — Task 004

**Draft — not yet opened.** Per session policy, a PR is only opened when the
user explicitly requests it. This file is prepared so `task-close` (or a
maintainer) can open the PR later without redrafting.

## Title

docs: sync README with current skills, structure, and task/turn pipeline

## Summary

- Rewrote `README.md`'s Structure section to match the actual repo layout
  (`agents/`, `archive/`, `docs/`, `.appfactory/`, plus the real `skills/`
  tree including the hidden `.system/` and `.nestjs/` groups).
- Replaced the stale turn-only execution-flow diagram with the current
  task/turn model (`session-start` → `task-init`/`turn-init` → execute →
  `turn-end` → `task-close`), matching `CLAUDE.md`.
- Replaced the outdated "Skills (9)" table (several listed skills no longer
  exist) with an accurate inventory: governance skills, the `af-*` App
  Factory backend SDLC pipeline, utility skill groups, meta-skills, and the
  NestJS/Prisma scaffolding group.
- Corrected the Setup section to match `scripts/setup.sh`'s real symlink
  targets, and the Templates section to reflect per-skill `templates/`
  directories instead of a shared top-level one.

## Test Plan

- [x] Manually diffed the new README against `skills/`, `agents/`, `docs/`,
      `archive/`, `hooks/`, `scripts/`, and `.appfactory/` to confirm every
      claim matches what's on disk.
- [ ] Maintainer review for tone/omissions.
