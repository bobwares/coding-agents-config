---
name: list
description: List available resources in this coding-agents-config repository. Shows skills, rules, hooks, and recent turns. Use when you need to discover available capabilities or check session history.
---

# List Resources

Display a summary of available resources in the coding-agents-config repository.

## Skills

List all skill directories in `skills/` (excluding `.system/`):

```bash
ls -1 skills/ | grep -v '^\.' | sort
```

Group by category prefix and display as a table:

| Category | Skills |
|----------|--------|
| **git-*** | git-checkpoint, git-commit-push-pr, git-quick-commit, etc. |
| **spec-*** | spec-epic-start, spec-prd-list, spec-prd-new, etc. |
| **project-*** | project-create-plan, project-execute, project-init, etc. |
| **session-*** | session-start, session-end, session-context-size |
| **Other** | analyze, diagnose-issue, makefile-gen, etc. |

## Rules

List all rule files in `rules/`:

```bash
ls -1 rules/*.md 2>/dev/null || echo "No rules found"
```

## Hooks

List all hook scripts in `hooks/`:

```bash
ls -1 hooks/ 2>/dev/null || echo "No hooks found"
```

## Recent Turns

List the 5 most recent turns from `ai/agentic-pipeline/turns/`:

```bash
ls -1dt ai/agentic-pipeline/turns/turn-* 2>/dev/null | head -5
```

For each turn, show:
- Turn ID
- Session context summary (first 2 lines of session_context.md if exists)

## Quick Actions

Suggest available actions based on the listing:

- **Start a new feature**: `/spec-prd-new <feature-name>`
- **Check project status**: `/git-status`
- **List PRDs and epics**: `/spec-prd-list`
- **Create a commit**: `/git-quick-commit`

## Output Format

Present the information in a clear, scannable format:

```
RESOURCES
=========

Skills (X total):
  git-*: git-checkpoint, git-commit-push-pr, ...
  spec-*: spec-epic-start, spec-prd-list, ...
  project-*: project-create-plan, ...
  session-*: session-start, session-end, ...
  other: analyze, diagnose-issue, ...

Rules (X total):
  - agent-coordination.md
  - branch-operations.md
  - ...

Hooks (X total):
  - audit-log.sh
  - skill-eval.sh
  - ...

Recent Turns:
  turn-XX: [summary]
  turn-YY: [summary]
  ...

Quick Actions:
  /spec-prd-new   - Start a new feature
  /git-status     - Check project status
  /spec-prd-list  - List PRDs and epics
```
