# Task Summary — Task 004

## Objective

Bring `README.md` back in sync with the current state of the repository,
which had drifted significantly from the documented skill set, directory
layout, and execution model.

## Work Completed

- Audited the actual `skills/` tree (including the hidden `.system/` and
  `.nestjs/` groups), `agents/`, `archive/`, `docs/`, `hooks/`, `scripts/`,
  and `.appfactory/` directories against the README's claims.
- Rewrote the **Structure** section to match the real top-level layout.
- Rewrote the **Setup** section to match `scripts/setup.sh`'s actual symlink
  targets (skills, agents, hooks, scripts, CLAUDE.md, settings.json, plus
  optional rules/context/plugins).
- Replaced the outdated turn-only/`branch-guard`-centric execution flow
  diagram with a description of the current task/turn model
  (`session-start` → `task-init`/`turn-init` → execute → `turn-end` →
  `task-close`), matching `CLAUDE.md` and the actual `SKILL.md` files.
- Replaced the stale "Skills (9)" table (which listed skills that no longer
  exist, e.g. `schema-to-database`, `helloworld`) with an accurate inventory
  covering governance skills, the `af-*` App Factory backend SDLC pipeline,
  utility skill groups, meta-skills, and the hidden NestJS/Prisma group.
- Corrected the **Templates** section: templates now live per-skill
  (`skills/<skill>/templates/`) rather than in a shared top-level
  `templates/` directory.

## Result

`README.md` now reflects the repository's current App Factory / task-turn
pipeline rather than the earlier turn-only prototype.
