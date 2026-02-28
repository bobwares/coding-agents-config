# CLAUDE.md

## Turn Lifecycle

!MANDATORY: Automatic Turn Tracking

Every coding task is a **turn** — a structured 10-step protocol with full provenance tracking.

```
PRE-EXECUTION                   EXECUTION              POST-EXECUTION
─────────────────────────────   ─────────────────────  ──────────────────────────────────
Step 1: Resolve TURN_ID         Step 5: Execute tasks  Step 6: Record end time
Step 2: Create turn directory                          Step 7: Write pull_request.md
Step 3: Write session_context                          Step 8: Write adr.md (mandatory)
Step 4: Record start time                              Step 9: Write manifest.json
                                                       Step 10: Update turns_index.csv
```

Every turn produces **5 artifacts** in `./ai/agentic-pipeline/turns/turn-${TURN_ID}/`:

| Artifact | Purpose |
|----------|---------|
| `session_context.md` | Table of all loaded context variables |
| `execution_trace.json` | Skills and agents executed during the turn |
| `pull_request.md` | Files changed, tasks executed, compliance checklist |
| `adr.md` | Architecture Decision Record (full or minimal — mandatory) |


### Post-Execution: YOUR Responsibility

**After completing ANY response that modifies files**, you MUST:

1. **Update `execution_trace.json`** to the turn directory:
   - `skillsExecuted` list (actual skills used)
   - `agentsExecuted` list (actual agents used)

2. **Write `pull_request.md`** to the turn directory:
   - Summary of changes (3-5 bullets)
   - Files modified (table with paths)
   - Compliance checklist

3. **Write `adr.md`** to the turn directory:
   - Full ADR if architectural decisions were made
   - Minimal: `No architectural decision made this turn — [description].`

4. **Update `turns_index.csv`**:
   ```bash
   echo "${TURN_ID},${START_TIME},${END_TIME},${ELAPSED},${BRANCH},${COMMIT_SHA},${SUMMARY}" >> ./ai/agentic-pipeline/turns_index.csv
   ```

### Skip Post-Execution ONLY When

- Pure questions with no file changes
- Clarification requests
- Error messages / diagnostics
- Reading files without modification

### Finding Current Turn

The turn directory was created by the hook. To find it:
```bash
ls -td ./ai/agentic-pipeline/turns/turn-* | head -1
```

Or read the most recent `session_context.md` for the TURN_ID.
