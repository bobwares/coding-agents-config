# Agentic Pipeline — Session Rules

## On Session Start

Run `/session-start` before accepting any task. Do not proceed until it completes.

## Before Every Coding Task

Resolve `TURN_ID`:
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

## Turn Protocol

Every task follows this sequence — no exceptions:

| Phase | Steps |
|-------|-------|
| Pre-Execution | 1. Resolve TURN_ID → 2. Create turn directory → 3. Write `session_context.md` → 4. Record start time |
| Execution | 5. Execute task |
| Post-Execution | 6. Record end time → 7. Write `pull_request.md` → 8. Write `adr.md` → 9. Write `manifest.json` → 10. Update `turns_index.csv` + tag commit |

Invoke `/governance` before writing any source file.
Invoke `/governance-adr` at Step 8 every turn.

## Hard Rules

- Never commit to `main` or `master`
- Never skip post-execution steps, even on failure
- Every turn produces exactly 4 artifacts: `session_context.md`, `pull_request.md`, `adr.md`, `manifest.json`
- Every source file gets a metadata header
- Commit format: `AI Coding Agent Change:` + 3–5 imperative bullets
- Branch format: `<type>/<description>[-T<id>]`
- Tag every turn: `git tag turn/${TURN_ID}`
- ADR is mandatory every turn — full or minimal
