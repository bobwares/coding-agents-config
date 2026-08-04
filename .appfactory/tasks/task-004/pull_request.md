# Pull Request — Task 004

## Title

Update README to match current repo structure

## Summary

The README described a repository layout (9 skills, a `templates/` directory,
scaffolding skills like `schema-to-database`) that no longer exists. This
rewrites the README to document the actual `skills/`, `agents/`, `hooks/`,
`scripts/`, `.appfactory/`, `docs/`, and `archive/` contents, and corrects the
setup/verification instructions to match `scripts/setup.sh`.

## Changes

- `README.md`: full rewrite of the Structure, Execution Flow, Skills,
  Hooks, and Scripts sections; added Agents, `.appfactory/`, and Archive
  sections.

## Test Plan

- Manual review: every directory and skill named in the README was verified
  against the working tree (`ls skills/`, `ls agents/`, `ls docs/`, `ls
  archive/`, and each `skills/*/SKILL.md` description).
- No code paths changed; documentation-only update.
