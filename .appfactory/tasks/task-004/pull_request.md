# Pull Request — Task 004

## Title

Update README to match current repo state

## Summary

The README's Setup, Structure, Execution Flow, and Skills sections had drifted
from the actual repository — it listed 9 skills that mostly no longer exist
under those names, an outdated manual symlink list, and a top-level
`templates/`/`plugins/` directory that isn't present. This updates it to
reflect the real 37-skill inventory, `scripts/setup.sh` behavior, directory
layout, and task/turn execution flow.

## Changes

- `README.md` rewritten (see `task_summary.md` for the itemized list)
- `.appfactory/tasks/task-004/**` — task/turn governance artifacts for this turn

## Test Plan

- Documentation-only change; no build/test suite applies.
- Verified every skill, directory, and script referenced in the new README
  against the actual filesystem contents.
