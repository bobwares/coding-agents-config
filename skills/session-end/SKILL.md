---
name: session-end
description: Complete turn lifecycle post-execution artifacts and save session state. Run at the end of every session or after completing a turn.
disable-model-invocation: false
---

# Session End

## Step 1: Capture Git State

Run:
- `git status --short`
- `git log --oneline --since="8 hours ago"`
- `git branch --show-current`
- `git rev-parse --short HEAD`

## Step 2: Complete Turn Artifacts (if turn was executed)

If a turn was executed this session (TURN_ID is set), complete all Post-Execution artifacts:

### Step 2a: Update execution_trace.json

File: `./ai/agentic-pipeline/turns/turn-${TURN_ID}/execution_trace.json`

Update and save:
- `skillsExecuted`: all skills actually executed in this turn
- `agentsExecuted`: all agents actually executed in this turn
- `finishedAt`: ISO UTC timestamp when work completed

Rules:
- Do not infer from available skills; record only what was actually used
- Include `claude` in `agentsExecuted` when no specialist agent was spawned
- Keep values unique and sorted for diff stability

### Step 2b: Write pull_request.md

File: `./ai/agentic-pipeline/turns/turn-${TURN_ID}/pull_request.md`

Use template: `.claude/templates/pr/pull_request_template.md`

Fill in:
- Turn summary (3–5 bullets of what was accomplished)
- Start and end timestamps
- Tasks executed (table)
- Files added/modified (tables with metadata header descriptions)
- Execution trace summary (skills and agents executed)
- Compliance checklist (check all boxes that apply)

### Step 2c: Write adr.md

File: `./ai/agentic-pipeline/turns/turn-${TURN_ID}/adr.md`

Apply ADR policy from `.claude/context/context_adr.md`:
- If architectural decisions were made → Full ADR using `.claude/templates/adr/adr_template.md`
- If no architectural decisions → Minimal one-liner

### Step 2d: Write manifest.json

File: `./ai/agentic-pipeline/turns/turn-${TURN_ID}/manifest.json`

Compute SHA-256 for each output file:
```bash
# macOS
shasum -a 256 <file> | cut -d' ' -f1
# Linux
sha256sum <file> | cut -d' ' -f1
```

Validate against: `.claude/templates/turn/manifest.schema.json`

Include execution summary:
- `execution.tracePath`
- `execution.skillsExecuted`
- `execution.agentsExecuted`

### Step 2e: Update turns_index.csv

Append row:
```
${TURN_ID},${TURN_START_TIME},${TURN_END_TIME},${ELAPSED_SECONDS},${BRANCH},${COMMIT_SHA},${TASK_SUMMARY}
```

### Step 2f: Tag the commit

```bash
git tag turn/${TURN_ID}
git push origin turn/${TURN_ID}
```

---

## Step 3: Handle Uncommitted Work

If there are uncommitted changes:
Ask: "There are uncommitted changes. Would you like to commit before ending? (yes/no)"
If yes: spawn `git-guardian` to create a commit following the `AI Coding Agent Change:` format.

---

## Step 4: Confirm Completion

Report:

```
═══════════════════════════════════════════════════════════
  SESSION END — Turn ${TURN_ID} Complete
═══════════════════════════════════════════════════════════
  ARTIFACTS    │ session_context.md ✓
               │ pull_request.md ✓
               │ adr.md ✓
               │ manifest.json ✓
               │ turns_index.csv updated ✓
               │ git tag turn/${TURN_ID} ✓
═══════════════════════════════════════════════════════════
Session saved. See you next time!
```
