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

Check if the turn index exists:
```bash
TURNS_INDEX="./ai/agentic-pipeline/turns_index.csv"
if [ -f "$TURNS_INDEX" ]; then
  LAST_TURN=$(tail -n 1 "$TURNS_INDEX")
  NEXT_TURN_ID=$(tail -n +2 "$TURNS_INDEX" | cut -d',' -f1 | sort -n | tail -1)
  NEXT_TURN_ID=$((NEXT_TURN_ID + 1))
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

