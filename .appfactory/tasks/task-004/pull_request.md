# Task 004 — Update README

## Summary

- Rewrote `README.md` to match the current repository structure and workflow.

## Details

The README had drifted from the actual repository: it listed 9 skills where
there are now 24+ (grouped under `.nestjs/`, `.system/`, `dsl-utils/`,
`e2e-tests/`, `ui-utils/`, `unit-tests/`), described a `turn/T{ID}` branch
model where the repo now runs a `task/TXXX` + turn model (`task-init`,
`turn-init`, `turn-end`, `task-close`), and referenced a shared top-level
`templates/` directory that has since moved into per-skill `templates/`
folders (with the old shared set archived under `archive/templates/`). It
also omitted `agents/`, `archive/`, `.github/`, and `package.json`
(the `caveman` plugin dependency).

This turn brings the README's structure diagram, execution-flow diagram,
protocol summary, skills table, and hooks/templates sections in line with
what is actually in the repo today.

## Files Changed

- `README.md`
