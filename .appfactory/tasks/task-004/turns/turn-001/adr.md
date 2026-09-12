# ADR: Refresh README to Match Current Repository State

## Status
Accepted

## Context
`README.md` had drifted from the repository: its setup section symlinked a
subset of directories that no longer matches `scripts/setup.sh`, its
structure tree omitted `agents/`, `archive/`, and `docs/` while referencing
nonexistent `templates/`, `plugins/`, and root-level `prompts/` directories,
and its skills table listed 9 skills (several no longer present) against
the 24+ skill directories actually under `skills/`.

## Decision
Rewrite `README.md` in place: align the setup instructions with
`scripts/setup.sh`'s real `CLAUDE_TARGETS`/`CODEX_TARGETS`/
`LOCAL_CLAUDE_TARGETS`, correct the directory tree, update the Mermaid
execution-flow diagram to show the `/task-init` vs `/turn-init` branch gate
per `CLAUDE.md`, and regroup the skills table into pipeline-lifecycle,
AppFactory (`af-*`), utility, and archived categories sourced from each
skill's `SKILL.md` frontmatter.

## Consequences
- README setup instructions now match what `scripts/setup.sh` actually does
- New contributors get an accurate picture of available skills and where
  archived/superseded skills live
- No functional/code changes; documentation-only turn
