---
name: git-quick-commit
description: >-
  Fast local commit without full verification.
  Use for work-in-progress saves.
  Arguments: optional commit message.
disable-model-invocation: false
---

# Quick Commit

Note: This skips full verification. Run `/verify-all` before creating a PR.

## Check Branch

```bash
git branch --show-current
git status --short
```

If on `main` or `master`: STOP. Report branch protection error.

## Commit

```bash
git diff --stat HEAD | head -15
```

If $ARGUMENTS is provided: use as commit message (with `wip:` prefix if needed).
Otherwise: generate a short conventional commit from the diff summary.

Stage all modified tracked files (excluding .env):

```bash
git add -u
```

Create commit. Report what was committed.
