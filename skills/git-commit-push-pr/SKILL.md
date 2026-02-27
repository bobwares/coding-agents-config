---
name: git-commit-push-pr
description: >-
  Full git workflow: run verification, commit with a conventional message, push, and create a PR.
  Never commits to main.
disable-model-invocation: false
---

# Commit, Push, and Create PR

## Pre-flight Checks

```bash
git branch --show-current
git status --short
```

If on `main` or `master`: STOP. Report: "Cannot commit to main. Create a branch first: `git checkout -b feature/your-work`"

## Run Verification

Invoke `verify-all` skill. If verification fails: STOP and report failures. Do not proceed until verification passes.

## Stage and Commit

```bash
git diff --stat HEAD 2>/dev/null | head -20
```

Generate a conventional commit message from the diff:
- `feat(scope): description` — new feature
- `fix(scope): description` — bug fix
- `chore(scope): description` — maintenance
- `refactor(scope): description` — refactoring
- `test(scope): description` — tests

Stage all relevant files (excluding `.env`, `node_modules`, build artifacts):

```bash
git add -A
git status --short  # Review staged files
```

Commit with Co-Author tag.

## Push

```bash
git push -u origin HEAD
```

## Create PR

```bash
gh pr create \
  --title "<conventional commit title>" \
  --body "<PR body with: What Changed, How to Test, Checklist>"
```

PR body includes:
- **What Changed**: bullets of what was implemented
- **Why**: link to PRD/epic or user story
- **How to Test**: numbered steps
- **Checklist**: TypeScript ✅, Tests ✅, Lint ✅, Manual test [ ]

Report the PR URL when created.
