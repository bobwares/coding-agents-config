---
name: git-undo
description: Undo the last Claude Code commit (soft reset — keeps files staged). Only works if the last commit was made by Claude.
disable-model-invocation: false
---

# Undo Last Claude Commit

```bash
git log -3 --pretty=format:"%h %s %an"
```

Check if the most recent commit was by Claude (look for "Co-Authored-By: Claude" in the commit).

```bash
git log -1 --format="%B" | grep -i "co-authored-by.*claude"
```

**If last commit was by Claude:**
```bash
git reset --soft HEAD^
```
Report: "Undone. Files are staged and ready to re-commit."

**If last commit was NOT by Claude:**
Report: "The last commit was not made by Claude. I won't undo it automatically to protect your work. Review the git log and use `git reset --soft HEAD^` manually if you're sure."

Show current state after operation:
```bash
git status --short
```
