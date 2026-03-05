---
name: session-start
description: Initialize turn lifecycle and orient to current project state. Run at the start of every Claude Code session.
disable-model-invocation: false
---

# Session Start

## Step 1: Load Git State

Run:
- `git branch --show-current`
- `git status --short`
- `git log --oneline -5`

## Step 2: Resolve Turn State

Resolve `NEXT_TURN_ID` with shared script (preferred), fallback to `1`:
```bash
if [ -x "./scripts/get-next-turn-id.sh" ]; then
  NEXT_TURN_ID=$(./scripts/get-next-turn-id.sh .)
elif [ -x "$HOME/.claude/scripts/get-next-turn-id.sh" ]; then
  NEXT_TURN_ID=$($HOME/.claude/scripts/get-next-turn-id.sh .)
else
  NEXT_TURN_ID=1
fi
```

## Step 3: Display Session Status

Present a session orientation table:

```
═══════════════════════════════════════════════════════════
  AGENTIC-PIPELINE SESSION START
═══════════════════════════════════════════════════════════
  BRANCH       │ [current branch]
  UNCOMMITTED  │ [N files changed]
  NEXT TURN ID │ [NEXT_TURN_ID]
  GOVERNANCE   │ Active — metadata headers + ADR required
  CONTEXT      │ 7 context files loaded
═══════════════════════════════════════════════════════════
```

## Step 4: Confirm Readiness

End with: "Context loaded. Governance active. Turn {{NEXT_TURN_ID}} ready. What would you like to work on?"

Do not accept any task until this confirmation is displayed.
