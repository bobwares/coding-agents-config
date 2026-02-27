---
name: git-status
description: Load project context into the current conversation for maximum effectiveness. Run at start of a focused work session.
disable-model-invocation: false
---
# Project State

```bash
git branch --show-current
git status --short
git log --oneline -10
```

## Active Epic (if any)

If there's an in-progress epic in `.claude/epics/`:
- Read `.claude/epics/<epic-name>/epic.md`

## Stack Summary

Read:
- `package.json` (root)
- `CLAUDE.md`

## Synthesize

Present a comprehensive context summary:

```
CONTEXT LOADED
==============
Project: [name from package.json or CLAUDE.md]
Stack: [summary]
Branch: [branch]
Active Work: [epic/task if any]
Recent: [last 3 commits]

Ready for deep work.
```
