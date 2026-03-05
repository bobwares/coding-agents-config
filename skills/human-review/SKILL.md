---
name: human-review
description: Human review workflow for the latest completed turn. Reviews turn artifacts before creating/updating human-review.md and next-turn-plan.md.
version: 1.1.1
author: bobwares
---

# Human Review Skill

## Invocations

Resolve the current turn id by calling `get-current-turn-id.sh`:

```bash
if [ -x "./scripts/get-current-turn-id.sh" ]; then
  CURRENT_TURN_ID="$(./scripts/get-current-turn-id.sh .)"
elif [ -x "$HOME/.claude/scripts/get-current-turn-id.sh" ]; then
  CURRENT_TURN_ID="$("$HOME/.claude/scripts/get-current-turn-id.sh" .)"
else
  CURRENT_TURN_ID="$("$HOME/coding-agents-config/scripts/get-current-turn-id.sh" .)"
fi
echo "Invoke Turn: ai/agentic-pipeline/turn-${CURRENT_TURN_ID}"
```

## Critical Operating Rules

- Never create a new `turn-*` directory.
- Always operate on the latest existing turn directory.
- Before creating or updating `human-review.md` or `next-turn-plan.md`, read required artifacts from:
  - the latest executed turn
  - all previous turns
- Required artifacts per turn (read if present, record missing if absent):
  - `adr.md`
  - `pull_request.md`
  - `session_context.md`
  - `execution_trace.json`
- `human-review.md` must include a metadata header at the top with:
  - `Turn`
  - `Review Date/Time (UTC)`
  - `Reviewer`
- If that metadata header already exists, do not add a duplicate header.

## What this skill does

This skill determines workflow state based on the filesystem.

State machine (derived, not stored):

- **STATE A: Needs template**
  - Latest turn exists
  - `human-review.md` does not exist in latest turn
- **STATE B: Needs plan**
  - `human-review.md` exists
  - `next-turn-plan.md` does not exist (or is behind the latest `human-review.md` version)
- **STATE C: Iteration**
  - `human-review.md` exists
  - `next-turn-plan.md` exists
  - Human has not accepted the plan (no explicit acceptance marker)
- **STATE D: Ready to start**
  - Human accepted the plan explicitly (acceptance marker present)
  - Skill outputs "ready" and the final plan path

## Turn discovery rules

1. Identify the "turns root" by searching upward from the current working directory for one of:
   - `./turns`
   - `./ai/turns`
   - `./ai/agentic-pipeline/turns`
2. The "latest turn directory" is determined by:
   - Prefer directories matching `turn-*` or `turn/*`
   - Sort by a parsed numeric id if present; otherwise sort by modified time (descending)
3. Do not create any new turn directory. If no turn directory exists, report the missing turns root/turn folder and stop.
4. The latest turn directory is printed as part of the response ("invoke turn").

## Files this skill manages (within latest turn directory)

- `human-review.md`
- `next-turn-plan.md`

Optional support files (do not require):

- `artifacts/` (links to outputs under review)
- `notes/`

## Step 0: Load historical review context (mandatory)

Before creating or updating managed files:

1. Read `adr.md`, `pull_request.md`, `session_context.md`, and `execution_trace.json` from the latest turn first.
2. Read the same files for all previous turns.
3. For each missing file, note it explicitly.
4. Build a concise context summary used for the current review and next-turn plan.

## Step 1: Ensure human-review.md exists

If `human-review.md` does not exist:

1. Create it from `templates/human-review.template.md`.
2. The template uses a turn-results format with sections for `Positive`, `Negative`, `Main Layout`, `Left Nav Bar`, `Browse Media View`, `Dashboard`, `Storage Drives`, `Tags View`, `Settings`, `Backend`, and `Plan`.
3. Fill in/update metadata header fields:
   - `Turn`: current latest turn id/path
   - `Review Date/Time (UTC)`: current UTC timestamp in ISO-8601
   - `Reviewer`: `TBD` (or known reviewer if provided)
4. Stop after reporting:
   - invoke turn directory
   - created file path
   - instructions for the human to complete the file

If `human-review.md` already exists:

- Do not recreate the file.
- If metadata header already exists, leave it unchanged.
- If metadata header is missing, add it once at the top.

## Step 2: Read human-review.md and produce next-turn-plan.md

If `human-review.md` exists and the human has completed it (see required sections), generate or update `next-turn-plan.md`.

Plan rules:

- Plan MUST reflect human constraints and acceptance criteria.
- Plan MUST reflect relevant findings from latest and previous turn artifacts.
- Plan MAY include questions for the human (explicitly listed).
- Plan MUST include a `Plan Version` string and increment on each update.
- Plan MUST include a `Ready Gate` section with an explicit acceptance marker.

## Step 3: Iteration loop

- Human answers questions in `human-review.md` (or in the `Answers` section in `next-turn-plan.md`, per plan).
- Next invocation updates `next-turn-plan.md` (new version).
- Continue until human accepts.

Acceptance marker (human must add):

- In `next-turn-plan.md`, set `Human Acceptance: ACCEPTED`.

When accepted, the skill outputs:

- invoke turn directory
- final `next-turn-plan.md` path
- confirmation that the next turn may begin

## Output format (required)

Always start with:

- `Invoke Turn: <absolute-or-relative-path>`
- `State: <STATE A|B|C|D>`

Then provide next actions, file paths created/updated, and artifact review coverage (latest turn + previous turns, including missing files).
