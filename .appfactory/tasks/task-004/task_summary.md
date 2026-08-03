# Task Summary — Task 004

## Scope

Bring `README.md` back in sync with the actual state of the repository, which had drifted
significantly from the documented structure, skill catalog, and setup instructions.

## Outcome

- Rewrote the `Structure` tree to match the real top-level layout (no `templates/`, `plugins/`,
  or top-level `prompts/`; documented `archive/`, `.appfactory/`, `.github/`, `docs/`).
- Corrected the `Setup` section to match what `scripts/setup.sh` actually symlinks (including
  Codex targets), and noted the `rules`/`context`/`plugins` symlink targets that don't exist yet.
- Replaced the `Execution Flow` mermaid diagram and turn-protocol table: the previous version
  described a `turn/T{TURN_ID}`-per-turn branch model that no longer matches `CLAUDE.md`,
  `task-init`, `turn-init`, or `hooks/branch-guard.sh`, which all implement a `task/TXXX`
  branch with turns nested underneath it.
- Replaced the `Skills (9)` section with a full catalog of all 37 skills found under `skills/`
  (governance, AppFactory backend pipeline, code-gen utilities, NestJS/Prisma, `.system`
  meta-skills, and `eval-labeler`), grouped and described from each `SKILL.md`.
- Noted that the turn-lifecycle templates referenced by the old README now live in
  `archive/templates/`.

## Verification

- Confirmed directory contents with `ls`/`find` against every claim in the rewritten README
  (`skills/`, `archive/`, `.appfactory/`, `docs/`, `.github/`, `scripts/setup.sh`).
- Cross-checked skill descriptions against each `skills/**/SKILL.md` frontmatter.
- Cross-checked the branch/turn model described in the diagram against `CLAUDE.md`,
  `skills/task-init/SKILL.md`, `skills/turn-init/SKILL.md`, `skills/task-close/SKILL.md`, and
  `hooks/branch-guard.sh`.
