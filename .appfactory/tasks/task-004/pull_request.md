# Pull Request — Task 004

## Title

Update README to match current repository state

## Summary

`README.md` had drifted from the actual repository: it referenced
directories that no longer exist (`templates/`, `plugins/`, `prompts/`),
listed skills that were removed or renamed (`schema-to-database`,
`nestjs-prisma-resource`, `helloworld`, etc.), and documented an older
turn-only branch protocol instead of the current `task-init` /
`turn-init` / `turn-end` / `task-close` workflow defined in `CLAUDE.md`.
This change brings the README back in sync with the repo.

## Changes

- Corrected setup/symlink instructions to match `scripts/setup.sh`.
- Rewrote the `Structure` tree to reflect the real directory layout.
- Replaced the execution-flow diagram with the current task/turn protocol.
- Replaced the skills table with an accurate, categorized list of all
  governance and `af-*` AppFactory pipeline skills, plus utility skills.
- Added an `Agents` section for `agent-architecture-planner`.
- Removed the stale `Templates` section; added a `Registries` section.

## Test Plan

- Manual review: cross-checked every path and skill name mentioned in the
  README against `ls`/`find` output of the actual repository tree.
- No executable code changed; documentation-only update.
