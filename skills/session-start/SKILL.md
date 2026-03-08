---
name: session-start
description: Initialize turn lifecycle and orient to current project state. Run at the start of every Claude Code session.
---

# Session Start

Initialize the agentic-pipeline session. This skill MUST complete before accepting any user task.


## Step 1: Load Git State

```bash
git branch --show-current
git status --short
git log --oneline -5
```

## Step 2: Resolve Next Turn ID

```bash
NEXT_TURN_ID=$($HOME/.claude/scripts/get-next-turn-id.sh .)
echo $NEXT_TURN_ID
```

## Step 3: Display Session Status

```
═══════════════════════════════════════════════════════════
  AGENTIC-PIPELINE SESSION START
═══════════════════════════════════════════════════════════
  BRANCH       │ [current branch]
  UNCOMMITTED  │ [N files changed]
  NEXT TURN ID │ [NEXT_TURN_ID]
  GOVERNANCE   │ Active — metadata headers + ADR required
  CONTEXT      │ [N] context files loaded, [M] missing
═══════════════════════════════════════════════════════════
```

## Step 4: Confirm Readiness

End with: "Context loaded. Governance active. Turn [NEXT_TURN_ID] ready. What would you like to work on?"

Do not accept any task until this confirmation is displayed.
