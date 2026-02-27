---
name: git-checkpoint
description: >-
  Create a named save point you can return to.
  Arguments: checkpoint name.
disable-model-invocation: false
---

# Create Checkpoint

Name: $ARGUMENTS

```bash
git status --short
```

Create checkpoint:

1. If uncommitted changes exist:
   ```bash
   git stash push -m "checkpoint: $ARGUMENTS"
   ```

2. Also create a tag:
   ```bash
   git tag "checkpoint-$ARGUMENTS" -m "Checkpoint: $ARGUMENTS"
   ```

Report: "Checkpoint '$ARGUMENTS' saved. Restore with: `/git-rollback $ARGUMENTS`"

List existing checkpoints:
```bash
git tag | grep "checkpoint"
git stash list | grep "checkpoint"
```
