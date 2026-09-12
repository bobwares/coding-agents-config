# Pull Request — Task 004

## Title

Update README to reflect current repository structure and skills

## Summary

The README had drifted from the repository: it referenced directories that
no longer exist (`templates/`, `plugins/`, root-level `prompts/`), was
missing directories that do exist (`agents/`, `archive/`, `docs/`), and
listed only 9 of the 24+ skills now under `skills/`. This updates the
README's setup instructions, structure tree, execution-flow diagram, and
skill tables to match the current state of the repo.

## Changes

- `README.md`: corrected setup/symlink steps to match `scripts/setup.sh`
- `README.md`: corrected the directory structure tree
- `README.md`: replaced the stale skills table with pipeline-lifecycle,
  AppFactory (`af-*`), utility, and archived skill listings
- `README.md`: updated the execution-flow Mermaid diagram to show the
  `/task-init` vs `/turn-init` branch gate

## Test Plan

- Manual review of `README.md` against the actual repository tree and
  `skills/*/SKILL.md` frontmatter
