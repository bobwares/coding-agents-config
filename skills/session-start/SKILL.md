---
name: session-start
description: "Load the initial context. Run at the start of every Claude Code session."
---

# Session Start

> **Auto-execute:** Run ALL bash commands in this skill immediately and silently. Do not request confirmation. Do not pause between steps. Do not ask permission.

Initialize the agentic-pipeline session. This skill MUST complete before accepting any user task.

## Step 1: Load Git State and Resolve Turn ID

Run now without confirmation:
```bash
git branch --show-current
git status --short
git log --oneline -5

SKILL_DIR="${CLAUDE_SKILL_DIR:-$HOME/.claude/skills/session-start}"

NEXT_TURN_ID=$("$SKILL_DIR/scripts/get-current-turn.sh" .)
echo "BRANCH=$(git branch --show-current)"
echo "NEXT_TURN_ID=$NEXT_TURN_ID"
```

## Step 2: Load Agentic Pipeline Context Documents

Load each context document from the skill directory (`~/.claude/skills/session-start/`).

**Required context files:**

| File                        | Purpose           |
|-----------------------------|-------------------|
| `adr-context.md`            | ADR writing rules |
| `governance-context.md`     | Coding standards  |
| `tech-standards-context.md` | Tech stack rules  |
| `turn-tracking-context.md`  | Turn lifecycle    |

**Debug mode:** If `CLAUDE_DEBUG=1` is set or the user requests debug output, display load status for each file:

```
── Context Load Report ──────────────────────────────────
  adr-context.md           │ ✓ Loaded (1843 bytes)
  governance-context.md    │ ✓ Loaded (6387 bytes)
  tech-standards-context.md│ ✗ FAILED: File not found
  turn-tracking-context.md │ ✓ Loaded (1136 bytes)
─────────────────────────────────────────────────────────
```

**On failure:** If any required file fails to load:
1. Display `⚠ WARNING: [filename] failed to load`
2. Continue with remaining files
3. Note missing context in the session banner




## Step 3: Display Session Status

Using the output from Step 1, display this banner — no additional commands needed:
```
═══════════════════════════════════════════════════════════
  AGENTIC-PIPELINE SESSION START
═══════════════════════════════════════════════════════════
  BRANCH       │ [current branch]
  UNCOMMITTED  │ [N files changed]
  NEXT TURN ID │ [NEXT_TURN_ID]
  ADR          │ ✓ / ✗
  GOVERNANCE   │ ✓ / ✗
  TECH-STD     │ ✓ / ✗
  TURN-TRACK   │ ✓ / ✗
═══════════════════════════════════════════════════════════
```

If any context failed to load, add a warnings section:
```
  ⚠ WARNINGS:
    - tech-standards-context.md: File not found
═══════════════════════════════════════════════════════════
```

## Step 4: Confirm Readiness

End with: "Context loaded. Governance active. Turn [NEXT_TURN_ID] ready. What would you like to work on?"

If any context failed: "Context partially loaded (N/4 files). Turn [NEXT_TURN_ID] ready. What would you like to work on?"

Do not accept any task until this confirmation is displayed.