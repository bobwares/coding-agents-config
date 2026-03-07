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

### Step 2a: Update session_context.md

File: `./ai/agentic-pipeline/turns/turn-${TURN_ID}/session_context.md`

**MANDATORY**: Update the pending fields with actual values:

1. Calculate end time: `TURN_END_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")`
2. Calculate elapsed time from TURN_START_TIME to TURN_END_TIME (format: `Xh Ym Zs` or `Ym Zs`)
3. Replace `[pending]` values:

| Field | Replace With |
|-------|--------------|
| `TURN_END_TIME` | Current UTC timestamp (ISO 8601) |
| `TURN_ELAPSED_TIME` | Calculated duration |
| `{{SKILLS_EXECUTED}}` | Comma-separated list of skills actually executed |
| `{{AGENTS_EXECUTED}}` | Comma-separated list of agents actually executed |

4. Also replace any remaining `[pending - finalize at session-end]` placeholders with actual values.

### Step 2b: Update execution_trace.json

File: `./ai/agentic-pipeline/turns/turn-${TURN_ID}/execution_trace.json`

Update and save:
- `skillsExecuted`: all skills actually executed in this turn
- `agentsExecuted`: all agents actually executed in this turn
- `finishedAt`: ISO UTC timestamp when work completed

Rules:
- Do not infer from available skills; record only what was actually used
- Include `claude` in `agentsExecuted` when no specialist agent was spawned
- Keep values unique and sorted for diff stability

### Step 2c: Write pull_request.md

**MANDATORY**: Read the template file first, then fill in all placeholders.

1. **Read template**: `${HOME}/.claude/templates/pull_request_template.md`
2. **Replace ALL placeholders** with actual values:

| Placeholder | Value |
|-------------|-------|
| `{{TURN_ID}}` | Current turn number |
| `{{DATE}}` | Today's date (YYYY-MM-DD) |
| `{{TASK_SUMMARY}}` | One-line summary of what was done |
| `{{SUMMARY_BULLET_1}}` | First accomplishment |
| `{{SUMMARY_BULLET_2}}` | Second accomplishment |
| `{{SUMMARY_BULLET_3}}` | Third accomplishment |
| `{{TURN_START_TIME}}` | From session_context.md |
| `{{TURN_END_TIME}}` | Current UTC timestamp |
| `{{TURN_ELAPSED_TIME}}` | Calculated duration |
| `{{INPUT_PROMPT_SUMMARY}}` | Summary of user's request |
| `{{ACTIVE_PATTERN_NAME}}` | Pattern used, or `N/A` |
| `{{ACTIVE_PATTERN_PATH}}` | Pattern path, or `N/A` |
| `{{TASK_N}}` / `{{AGENTS_N}}` | Tasks and agents for each row |
| `{{SKILLS_EXECUTED_LIST}}` | Comma-separated list |
| `{{AGENTS_EXECUTED_LIST}}` | Comma-separated list |
| `{{AI_FILE_N}}` | Files added under `./ai/` |
| `{{TASK}}`, `{{DESCRIPTION_FROM_METADATA}}`, `{{FILE_PATH}}` | Source files added |
| `{{OLD_VERSION}}`, `{{NEW_VERSION}}` | Version changes for modified files |

3. **Write filled template** to: `./ai/agentic-pipeline/turns/turn-${TURN_ID}/pull_request.md`

### Step 2d: Write adr.md

File: `./ai/agentic-pipeline/turns/turn-${TURN_ID}/adr.md`

Apply ADR policy from `rules/adr.md`:
- If architectural decisions were made → Full ADR using template: `${HOME}/.claude/templates/adr_template.md`
- If no architectural decisions → Minimal one-liner: `No architectural decision made this turn — [brief description].`

### Step 2e: Write manifest.json

File: `./ai/agentic-pipeline/turns/turn-${TURN_ID}/manifest.json`

Compute SHA-256 for each output file:
```bash
# macOS
shasum -a 256 <file> | cut -d' ' -f1
# Linux
sha256sum <file> | cut -d' ' -f1
```

Validate against schema: `${HOME}/.claude/templates/manifest.schema.json`

Include execution summary:
- `execution.tracePath`
- `execution.skillsExecuted`
- `execution.agentsExecuted`

### Step 2f: Update turns_index.csv

Append row:
```
${TURN_ID},${TURN_START_TIME},${TURN_END_TIME},${ELAPSED_SECONDS},${BRANCH},${COMMIT_SHA},${TASK_SUMMARY}
```

### Step 2g: Tag the commit

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
