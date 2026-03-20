---
name: branch-guard
description: Check current git branch and create a turn-scoped branch if on main or master. Requires TURN_ID to be set in session context by turn-init.
disable-model-invocation: true
---

# Branch Guard

## Purpose
Prevent direct work on `main` or `master` by creating a `turn/T<TURN_ID>` branch
before any code changes begin. TURN_ID must already be set by the `turn-init` skill.

## Steps

1. Run: `git branch --show-current`
2. If result is `main` or `master`:
   a. Read `TURN_ID` from session context.
    - If `TURN_ID` is not set, HALT and instruct: "Run `/turn-init` before `/branch-guard`."
      b. Run: `git checkout -b turn/T${TURN_ID}`
      c. Confirm: "✓ Created and switched to branch `turn/T${TURN_ID}`"
3. If already on a `turn/T*` branch:
    - Confirm: "✓ Already on turn branch `<branch-name>` — proceeding."
4. If on any other non-main branch:
    - Warn: "⚠️ On branch `<branch-name>` which is not a turn branch. Confirm this is intentional before proceeding."

## Post-Branch
Proceed with the original task without re-prompting the user.