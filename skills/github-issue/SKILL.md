---
name: github-issue
description: >-
  End-to-end GitHub issue resolution: read the issue, create a branch, fix, verify, and create a PR.
  Arguments: GitHub issue number.
disable-model-invocation: false
---

# Fix GitHub Issue

Issue: $ARGUMENTS

## Read Issue

```bash
gh issue view $ARGUMENTS
```

If this fails: "Provide a valid GitHub issue number. Run `gh issue list` to see open issues."

Extract:
- Issue title
- Issue body (requirements)
- Labels (bug/feature/etc.)
- Any linked PRs

## Create Branch

```bash
git checkout main
git pull origin main
git checkout -b fix/issue-$ARGUMENTS
git push -u origin HEAD
```

## Spawn Orchestrator

Invoke `orchestrator` agent with:
- Issue title and body
- Current codebase context
- Instruction: "Diagnose and fix the issue described. Use the systematic-debugging skill if it's a bug. After fixing, spawn verify-app and git-guardian."

## After Fix

The orchestrator will handle verification and PR creation.

Confirm PR links to issue:
```bash
gh pr view --json url,title,body
```

The PR body should include: "Closes #$ARGUMENTS"
