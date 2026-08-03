# Pull Request — Task 004

## Title

Update README to match current repository structure and skill catalog

## URL

Not yet opened — no pull request was requested for this task.

## Summary

- Rewrite the `Structure` section to reflect the actual top-level layout and remove references
  to directories that no longer exist (`templates/`, `plugins/`, top-level `prompts/`).
- Correct the `Setup` symlink instructions to match `scripts/setup.sh`.
- Replace the outdated `turn/T{TURN_ID}`-per-turn branch diagram with the current
  `task/TXXX` + nested-turn model implemented by `task-init`/`turn-init`/`turn-end`/`task-close`.
- Replace the `Skills (9)` table with a full, grouped catalog of all 37 skills under `skills/`.

## Testing

- Manual verification of every README claim against the repository contents (`ls`, `find`,
  `SKILL.md` frontmatter) — documentation-only change, no build/test suite applies.
