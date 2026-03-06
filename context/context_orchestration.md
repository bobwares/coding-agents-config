# Context: Orchestration — The Turn Lifecycle Protocol

> **Load trigger**: Loaded by `/project-execute` and `/spec-epic-start` skills only. Not loaded at session start.

## Purpose

Defines the mandatory 10-step turn lifecycle that governs every coding task executed by the agentic-pipeline. No step may be skipped. Steps execute in sequence: Pre-Execution → Execution → Post-Execution.

---

## Turn Lifecycle Overview

```
┌─────────────────────────────────────────────────────┐
│                  PRE-EXECUTION PHASE                │
│  Step 1: Resolve TURN_ID                           │
│  Step 2: Create turn directory                     │
│  Step 3: Write session_context.md                  │
│  Step 4: Record TURN_START_TIME                    │
├─────────────────────────────────────────────────────┤
│                   EXECUTION PHASE                   │
│  Step 5: Execute assigned tasks                    │
├─────────────────────────────────────────────────────┤
│                 POST-EXECUTION PHASE                │
│  Step 6: Record TURN_END_TIME                      │
│  Step 7: Write pull_request.md                     │
│  Step 8: Write adr.md                              │
│  Step 9: Write manifest.json                       │
│  Step 10: Update turns_index.csv                   │
└─────────────────────────────────────────────────────┘
```

---

## Phase Execution Rules

1. **Sequential phases**: Pre-Execution must complete before Execution; Execution before Post-Execution
2. **Pre-Execution failure**: If any pre-execution step fails, abort the turn and report the error
3. **Execution failure**: Even if execution fails, still complete all Post-Execution steps
4. **Post-Execution failure**: Log the error but continue completing all remaining post-execution steps
5. **No skipping**: Every step is mandatory every turn, regardless of task size or complexity

---

## Step 1: Resolve TURN_ID

```bash
TURNS_INDEX="./ai/agentic-pipeline/turns_index.csv"

if [ -f "$TURNS_INDEX" ]; then
  # Read max turn_id from CSV and add 1
  TURN_ID=$(tail -n +2 "$TURNS_INDEX" | cut -d',' -f1 | sort -n | tail -1)
  TURN_ID=$((TURN_ID + 1))
else
  # First turn — initialize
  TURN_ID=1
  mkdir -p "./ai/agentic-pipeline"
  echo "turn_id,started_at,finished_at,elapsed_seconds,branch,commit_sha,task_summary" > "$TURNS_INDEX"
fi

CURRENT_TURN_DIRECTORY="./ai/agentic-pipeline/turns/turn-${TURN_ID}"
```

---

## Step 2: Create Turn Directory

```bash
mkdir -p "${CURRENT_TURN_DIRECTORY}"
```

The turn directory will contain all four required artifacts.

---

## Step 3: Write session_context.md

Write a markdown table documenting all loaded context values.

File: `${CURRENT_TURN_DIRECTORY}/session_context.md`

Use the template at `.claude/templates/contexts/session_context.md`.

**Required variables to document**:

| Variable | Value |
|----------|-------|
| TURN_ID | (resolved value) |
| TURN_START_TIME | (ISO 8601 UTC) |
| TARGET_PROJECT | (absolute path) |
| CURRENT_TURN_DIRECTORY | (full path) |
| CODING_AGENT | claude |
| Active branch | (git branch --show-current) |
| Loaded context files | (list all context files loaded this session) |
| Loaded skills | (list all skills activated) |
| Task description | (one-sentence summary of the assigned task) |

---

## Step 4: Record TURN_START_TIME

```bash
TURN_START_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
```

Store this value — it is needed for Step 10.

---

## Step 5: Execute Assigned Tasks

Execute the user's assigned task following all governance rules:

- Apply metadata headers to every file created or modified
- Increment semantic versions on modified files
- Follow branch naming and commit conventions
- Write tests for new or changed logic
- Apply linting rules
- Write to the correct agent design directory (`./claude/`)

The orchestrator delegates to specialist agents via the Task tool based on the routing table in `orchestrator.md`.

---

## Step 6: Record TURN_END_TIME

```bash
TURN_END_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
TURN_ELAPSED_SECONDS=$(( $(date -d "$TURN_END_TIME" +%s 2>/dev/null || date -j -f "%Y-%m-%dT%H:%M:%SZ" "$TURN_END_TIME" +%s) - $(date -d "$TURN_START_TIME" +%s 2>/dev/null || date -j -f "%Y-%m-%dT%H:%M:%SZ" "$TURN_START_TIME" +%s) ))
```

---

## Step 7: Write pull_request.md

File: `${CURRENT_TURN_DIRECTORY}/pull_request.md`

Use the template at `.claude/templates/pr/pull_request_template.md`.

**Required sections**:
- Turn summary (3–5 bullet points)
- Turn duration (`TURN_ELAPSED_TIME`)
- Input prompt summary
- Tasks executed (table: task name | tools/agents used)
- Files added under `./ai/` (table)
- Files added outside `./ai/` (table: task | description from metadata header | file path)
- Files modified outside `./ai/` (table: task | description | file path)
- Compliance checklist

---

## Step 8: Write adr.md

File: `${CURRENT_TURN_DIRECTORY}/adr.md`

Use the ADR skill to determine whether a full ADR or minimal ADR is required.

- If **architectural decisions were made**: Write a full ADR using `.claude/templates/adr/adr_template.md`
- If **no architectural decisions were made**: Write: `No architectural decision made this turn — [brief description of what was done].`

**This step is mandatory every turn.** A turn without an `adr.md` is incomplete.

---

## Step 9: Write manifest.json

File: `${CURRENT_TURN_DIRECTORY}/manifest.json`

Validate against `.claude/templates/turn/manifest.schema.json`.

**Required fields**:

```json
{
  "turnId": 42,
  "tasks": [
    {
      "taskId": "T42-1",
      "agent": "nestjs-engineer",
      "inputs": ["docs/taskflow.prd.md", ".claude/domain/model.json"],
      "outputs": [
        {
          "path": "apps/api/src/modules/tasks/tasks.service.ts",
          "sha256": "abc123..."
        }
      ],
      "validations": [
        { "rule": "tests-pass", "status": "pass", "detailsPath": "" },
        { "rule": "lint-clean", "status": "pass", "detailsPath": "" },
        { "rule": "typecheck", "status": "pass", "detailsPath": "" }
      ]
    }
  ],
  "provenance": {
    "promptHash": "sha256 of the input prompt",
    "tools": ["Read", "Write", "Edit", "Bash", "Task"],
    "startedAt": "2026-02-22T14:35:00Z",
    "finishedAt": "2026-02-22T15:02:47Z",
    "activePatternName": "",
    "activePatternPath": ""
  },
  "outputs": [
    {
      "path": "apps/api/src/modules/tasks/tasks.service.ts",
      "sha256": "abc123..."
    }
  ]
}
```

**SHA-256 computation**:
```bash
sha256sum <file> | cut -d' ' -f1
# macOS: shasum -a 256 <file> | cut -d' ' -f1
```

---

## Step 10: Update turns_index.csv

Append a new row to `./ai/agentic-pipeline/turns_index.csv`:

```bash
BRANCH=$(git branch --show-current)
COMMIT_SHA=$(git rev-parse --short HEAD)
TASK_SUMMARY="[one-line summary of what was accomplished]"

echo "${TURN_ID},${TURN_START_TIME},${TURN_END_TIME},${TURN_ELAPSED_SECONDS},${BRANCH},${COMMIT_SHA},${TASK_SUMMARY}" >> "./ai/agentic-pipeline/turns_index.csv"

# Tag the commit
git tag "turn/${TURN_ID}"
git push origin "turn/${TURN_ID}"
```

---

## Turn Completion Verification

Before declaring a turn complete, verify:

| Check | Required |
|-------|----------|
| `session_context.md` exists in turn directory | ✅ |
| `pull_request.md` exists in turn directory | ✅ |
| `adr.md` exists in turn directory | ✅ |
| `manifest.json` exists and validates against schema | ✅ |
| `turns_index.csv` has new row for this turn | ✅ |
| Git commit tagged `turn/${TURN_ID}` | ✅ |
| All tests pass | ✅ |
| Lint clean | ✅ |
