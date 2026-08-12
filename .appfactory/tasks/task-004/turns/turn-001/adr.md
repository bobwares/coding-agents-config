# ADR: Resync README.md with Current Repository State

## Status
Accepted

## Context
`README.md` had drifted from the repository it describes:
- It documented top-level `templates/`, `plugins/`, and `prompts/`
  directories that do not exist.
- Its "Skills (9)" table listed skills that were removed or renamed
  (`schema-to-database`, `nestjs-prisma-resource`,
  `nestjs-customer-crud-scaffold`, `code-entity-to-crud`, `helloworld`,
  `.system/skill-creator`, `.system/skill-installer`) and omitted the 13
  `af-*` AppFactory pipeline skills, `task-init`, and `task-close`, which
  are the skills actually present under `skills/`.
- Its execution-flow diagram described a turn-only, `branch-guard`-driven
  protocol, whereas `CLAUDE.md` now defines a task/turn protocol
  (`task-init` → `turn-init` → `turn-end` → `task-close`).

## Decision
Rewrite `README.md` in place, minimally but thoroughly: correct the setup
instructions to match `scripts/setup.sh`, regenerate the `Structure` tree
from the actual filesystem, replace the execution-flow diagram with the
current task/turn protocol, and replace the skills/agents/hooks tables
with an accurate accounting of what is in the repository today. No source
code, skills, or hooks were modified — this is a documentation-only
change.

## Consequences
- New contributors following the README's setup steps will get symlinks
  that match what `scripts/setup.sh` actually creates.
- The skill listing is now a reliable index into `skills/`.
- Future drift is still possible; there is no automated check tying
  `README.md` to the contents of `skills/`, `agents/`, or `hooks/`.
