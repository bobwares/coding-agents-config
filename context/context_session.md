# Context: Session — Turn-Specific Variables

## Turn Identity

| Variable | How Resolved |
|----------|-------------|
| `TURN_ID` | `max(turn_id) + 1` from `turns_index.csv`. If absent: `1`. |
| `CURRENT_TURN_DIRECTORY` | `./ai/agentic-pipeline/turns/turn-${TURN_ID}` |

## turns_index.csv Format

```csv
turn_id,started_at,finished_at,elapsed_seconds,branch,commit_sha,task_summary
1,2026-01-15T09:00:00Z,2026-01-15T09:23:14Z,1394,feat/task-service-T1,abc1234,Implement TaskService
```

## Turn Timing

| Variable | How Resolved |
|----------|-------------|
| `TURN_START_TIME` | `date -u +"%Y-%m-%dT%H:%M:%SZ"` at turn start |
| `TURN_END_TIME` | `date -u +"%Y-%m-%dT%H:%M:%SZ"` at turn end |
| `TURN_ELAPSED_TIME` | `TURN_END_TIME - TURN_START_TIME` in seconds |

## Turn Artifact Paths

All artifacts live in `CURRENT_TURN_DIRECTORY`:

| Artifact | Written By |
|----------|-----------|
| `session_context.md` | Step 3 — Pre-Execution |
| `pull_request.md` | Step 7 — Post-Execution |
| `adr.md` | Step 8 — Post-Execution |
| `manifest.json` | Step 9 — Post-Execution |

## Initialization Order

1. `TARGET_PROJECT` ← `$(pwd)`
2. `TURN_START_TIME` ← current UTC timestamp
3. `TURN_ID` ← read `turns_index.csv`
4. `CURRENT_TURN_DIRECTORY` ← computed
5. Create `CURRENT_TURN_DIRECTORY`
6. Write `session_context.md`
