---
name: session-start
description: Load repository state and core pipeline context. Run at the start of every Claude Code session.
---

# Session Start

Auto-execute the shell commands in this skill without asking for confirmation.

## Step 1: Load Git State and Resolve Next Task ID

Run now:

```bash
git branch --show-current
git status --short
git log --oneline -5

SKILL_DIR="${CLAUDE_SKILL_DIR:-$HOME/.claude/skills/session-start}"
NEXT_TASK_ID="$($SKILL_DIR/scripts/get-next-task-id.sh .)"
echo "BRANCH=$(git branch --show-current)"
echo "NEXT_TASK_ID=$NEXT_TASK_ID"
```

## Step 2: Load Agentic Pipeline Context Documents

Load these files from the skill directory:

- `adr-context.md`
- `governance-context.md`
- `tech-standards-context.md`
- `turn-tracking-context.md`

If `CLAUDE_DEBUG=1` is set, display a load report for each file.

If a file fails to load:

1. Display `WARNING: <filename> failed to load`
2. Continue loading the remaining files
3. Report the missing file in the session banner

## Step 3: Display Session Status

Display a banner that includes:

- current branch
- count of uncommitted files
- next task id
- ADR context loaded yes/no
- governance context loaded yes/no
- tech standards loaded yes/no
- turn tracking loaded yes/no

## Step 4: Confirm Readiness

End with one of the following:

- `Context loaded. Governance active. Next task T{{NEXT_TASK_ID}} ready. What would you like to work on?`
- `Context partially loaded (N/4 files). Next task T{{NEXT_TASK_ID}} ready. What would you like to work on?`

Do not accept a coding task before the readiness message is displayed.
