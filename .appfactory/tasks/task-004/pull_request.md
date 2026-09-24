# Pull Request — Task 004

## Title

Update README to match current repository state

## Summary

`README.md` had drifted since task-001: it still listed archived scaffolding
skills, a removed `.system/` skill directory, and a root `templates/`
directory that has since moved to `archive/templates/`. This rewrites the
README from a fresh audit of the repository so the Setup instructions,
directory structure, execution-flow diagram, and skills tables all match
what's actually on disk today.

## Changes

- [x] `README.md` — full rewrite: corrected setup/symlink steps, corrected
      structure tree, replaced the execution-flow diagram with the real
      `task-init`/`turn-init`/`turn-end`/`task-close` flow, replaced the
      stale skills table with the current 24-skill breakdown, added an
      Archive section.
- [x] `.appfactory/tasks/task-004/` — task and turn-001 tracking artifacts
      for this change.

## Status

Active — not yet opened as a pull request.
