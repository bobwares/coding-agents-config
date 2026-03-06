---
name: session-start
description: Initialize turn lifecycle and orient to current project state. Run at the start of every Claude Code session.
---

# Session Start

Initialize the agentic-pipeline session. This skill MUST complete before accepting any user task.

## Step 1: Load Core Context Files

Read these three files only — in order:

1. `.claude/context/context_container.md` — path variables and directory layout
2. `.claude/context/context_session.md` — TURN_ID resolution and timing
3. `.claude/context/context_skills.md` — available skills and invocation guide

Note any missing files but do not abort.

## Step 2: Load Git State

```bash
git branch --show-current
git status --short
git log --oneline -5
```

## Step 3: Resolve Next Turn ID

```bash
if [ -x "./scripts/get-next-turn-id.sh" ]; then
  NEXT_TURN_ID=$(./scripts/get-next-turn-id.sh .)
elif [ -x "$HOME/.claude/scripts/get-next-turn-id.sh" ]; then
  NEXT_TURN_ID=$($HOME/.claude/scripts/get-next-turn-id.sh .)
else
  TURNS_INDEX="./ai/agentic-pipeline/turns_index.csv"
  if [ -f "$TURNS_INDEX" ]; then
    NEXT_TURN_ID=$(tail -n +2 "$TURNS_INDEX" | cut -d',' -f1 | sort -n | tail -1)
    NEXT_TURN_ID=$((NEXT_TURN_ID + 1))
  else
    NEXT_TURN_ID=1
  fi
fi
```

## Step 4: Display Session Status

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

## Step 5: Confirm Readiness

End with: "Context loaded. Governance active. Turn [NEXT_TURN_ID] ready. What would you like to work on?"

Do not accept any task until this confirmation is displayed.
