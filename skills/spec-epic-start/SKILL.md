---
name: spec-epic-start
description: >-
  Begin implementing an epic.
  Creates the branch and spawns the orchestrator to execute all tasks.
  Arguments: epic name.
disable-model-invocation: false
---

# Start Epic Implementation

Epic: $ARGUMENTS

## Pre-flight

1. Read `.claude/epics/$ARGUMENTS/epic.md` — if not found, suggest running `/spec-prd-parse` first
2. Check current git state:
   - Run: `git status --short`
   - If uncommitted changes: ask user to commit or stash before starting

## Create Branch

```bash
git checkout main && git pull origin main
git checkout -b epic/$ARGUMENTS
git push -u origin HEAD
```

## Initialize Turn Lifecycle (Pre-Execution) — MANDATORY

Before any code execution, complete all pre-execution steps:

### Step A: Resolve TURN_ID

```bash
TURNS_INDEX="./ai/agentic-pipeline/turns_index.csv"

if [ -f "$TURNS_INDEX" ]; then
  TURN_ID=$(tail -n +2 "$TURNS_INDEX" | cut -d',' -f1 | sort -n | tail -1)
  TURN_ID=$((TURN_ID + 1))
else
  TURN_ID=1
  mkdir -p "./ai/agentic-pipeline"
  echo "turn_id,started_at,finished_at,elapsed_seconds,branch,commit_sha,task_summary" > "$TURNS_INDEX"
fi

CURRENT_TURN_DIRECTORY="./ai/agentic-pipeline/turns/turn-${TURN_ID}"
```

### Step B: Create Turn Directory

```bash
mkdir -p "${CURRENT_TURN_DIRECTORY}"
```

### Step C: Record TURN_START_TIME

```bash
TURN_START_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
```

### Step D: Write session_context.md

Create file: `${CURRENT_TURN_DIRECTORY}/session_context.md`

Document:
- TURN_ID
- TURN_START_TIME
- Epic name: $ARGUMENTS
- Branch: epic/$ARGUMENTS
- Task description

**Do not proceed to spawning the orchestrator until this file exists.**

## Update Epic Status

Edit `.claude/epics/$ARGUMENTS/epic.md`: change `status: planned` to `status: in_progress`

## Spawn Orchestrator

Invoke the `orchestrator` agent with this context:

"Start implementing epic '$ARGUMENTS'. The epic specification is in `.claude/epics/$ARGUMENTS/epic.md`. Follow the task breakdown in the Phase 1 → 2 → 3 → 4 order. Spawn the appropriate specialist agent for each task. After all phases complete, run verify-all and then spawn git-guardian to create a PR."

## Complete Turn Lifecycle (Post-Execution) — MANDATORY

After orchestrator completes (success or failure), complete all post-execution steps:

### Step E: Record TURN_END_TIME

```bash
TURN_END_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
```

### Step F: Write pull_request.md

Create file: `${CURRENT_TURN_DIRECTORY}/pull_request.md`
- Turn summary (what was accomplished)
- Start and end timestamps
- Tasks executed
- Files changed

### Step G: Write adr.md

Create file: `${CURRENT_TURN_DIRECTORY}/adr.md`
- Full ADR if architectural decisions were made
- Minimal ADR if no decisions: `No architectural decision made this turn — [description].`

### Step H: Write manifest.json

Create file: `${CURRENT_TURN_DIRECTORY}/manifest.json`
- turnId, tasks, provenance, outputs with SHA-256 hashes

### Step I: Update turns_index.csv

```bash
BRANCH=$(git branch --show-current)
COMMIT_SHA=$(git rev-parse --short HEAD)
echo "${TURN_ID},${TURN_START_TIME},${TURN_END_TIME},${TURN_ELAPSED_SECONDS},${BRANCH},${COMMIT_SHA},Epic: $ARGUMENTS" >> "./ai/agentic-pipeline/turns_index.csv"
```

### Step J: Tag the Commit

```bash
git tag "turn/${TURN_ID}"
git push origin "turn/${TURN_ID}"
```

### Step K: Verify Turn Completion

All 4 artifacts must exist:
- [ ] session_context.md
- [ ] pull_request.md
- [ ] adr.md
- [ ] manifest.json

**Do not report completion until all artifacts exist.**

## Report

Confirm to the user:
- Branch created: `epic/$ARGUMENTS`
- Turn: ${TURN_ID}
- Turn artifacts created in: `${CURRENT_TURN_DIRECTORY}/`
- Check progress with: `/spec-task-next $ARGUMENTS`
