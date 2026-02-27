---
name: git-rollback
description: >-
  Restore from a named checkpoint or undo N commits.
  Arguments: checkpoint name or number of commits.
disable-model-invocation: false
---

# Rollback

Target: $ARGUMENTS

## Find Target

```bash
git stash list | grep "checkpoint"
git tag | grep "checkpoint"
git log --oneline -10
```

## Determine Strategy

- If $ARGUMENTS matches a stash entry: `git stash pop stash@{N}`
- If $ARGUMENTS matches a git tag: `git checkout "checkpoint-$ARGUMENTS"`
- If $ARGUMENTS is a number N: `git reset --soft HEAD~N` (keeps files staged)
- If $ARGUMENTS is a git hash: `git checkout $ARGUMENTS`

**Always confirm with user before executing:**

"I'm about to: [describe the rollback action]. This will: [consequence]. Proceed? (yes/no)"

Only execute after user confirms.
