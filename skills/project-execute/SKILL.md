---
name: project-execute
description: "One-command full app build. Provide PRD path, DDD path, and tech stack file; optional wireframe supported. Usage: /project-execute"
---

# Project Execute - One-Turn App Build

You are the entry point for the one-command build pipeline.

The goal is strict one-turn execution from specs to verified implementation with no manual intermediate commands.

## Golden Path Contract

### Input Contract

Accepted invocations:

```text
/project-execute
/project-execute prd=specs/spec-prd.md ddd=specs/spec-ddd.md stack=specs/spec-tech-stack.md
/project-execute prd=specs/spec-prd.md ddd=specs/spec-ddd.md stack=specs/spec-tech-stack.md wireframe=specs/spec-wireframe.md
```

Defaults:

- PRD: `specs/spec-prd.md`
- DDD: `specs/spec-ddd.md`
- Tech stack: `specs/spec-tech-stack.md`
- Wireframe (optional): `specs/spec-wireframe.md` if present

### Execution Contract

A successful run MUST do all of the following in one command:

1. Validate inputs and environment using preflight.
2. Scaffold foundation (`project-init`).
3. Parse DDD (`spec-parse-ddd`).
4. Generate planning docs (`spec-planning`).
5. Generate epic(s) from PRD (`spec-prd-parse`).
6. Execute epic tasks via orchestrator and specialists.
7. Run verification gates.
8. Write turn artifacts and final report.

Do not require `/project-plan` or any other intermediate user command.

---

## Step 0: Resolve Inputs

Parse arguments and resolve `PRD_PATH`, `DDD_PATH`, `STACK_PATH`, and optional `WIREFRAME_PATH`.

If any required file is missing, stop with a precise error.

---

## Step 1: Run Preflight Validator (Mandatory)

Run the preflight validator before any implementation work:

```bash
if [ -x "./scripts/project-execute-preflight.sh" ]; then
  PREFLIGHT_SCRIPT="./scripts/project-execute-preflight.sh"
elif [ -x "$HOME/.claude/scripts/project-execute-preflight.sh" ]; then
  PREFLIGHT_SCRIPT="$HOME/.claude/scripts/project-execute-preflight.sh"
else
  echo "Preflight script not found. Expected ./scripts/project-execute-preflight.sh or $HOME/.claude/scripts/project-execute-preflight.sh"
  exit 1
fi

if [ -n "$WIREFRAME_PATH" ]; then
  bash "$PREFLIGHT_SCRIPT" --prd "$PRD_PATH" --ddd "$DDD_PATH" --stack "$STACK_PATH" --wireframe "$WIREFRAME_PATH"
else
  bash "$PREFLIGHT_SCRIPT" --prd "$PRD_PATH" --ddd "$DDD_PATH" --stack "$STACK_PATH"
fi
```

If preflight fails, stop and report all failures.

---

## Step 2: Validate Spec Content

Read required files fully and validate minimum content:

- PRD: problem statement, user story/goal, success criteria
- DDD: bounded context plus entities or aggregates
- Tech stack: one or more valid tokens
- Wireframe (if provided): at least one screen/view section

If any are incomplete, stop with exact missing sections.

Print a concise validation summary before proceeding.

---

## Step 3: Initialize Turn Lifecycle (Pre-Execution)

Before code execution:

1. Resolve `TURN_ID` using `get-next-turn-id.sh` (initialize `turns_index.csv` if missing).
2. Create `./ai/agentic-pipeline/turns/turn-${TURN_ID}/`.
3. Record `TURN_START_TIME` in UTC.
4. Write `session_context.md` with inputs, branch, turn path, and task description.

---

## Step 4: Prepare Branch Safely for Fresh Repos

Use a branch strategy that works for both local-only and remote repos:

```bash
# Determine base branch
if git show-ref --verify --quiet refs/heads/main; then
  BASE_BRANCH="main"
elif git show-ref --verify --quiet refs/heads/master; then
  BASE_BRANCH="master"
else
  BASE_BRANCH=""
fi

if [ -n "$BASE_BRANCH" ]; then
  git checkout "$BASE_BRANCH"
fi

# Only pull/push if origin exists
if git remote get-url origin >/dev/null 2>&1 && [ -n "$BASE_BRANCH" ]; then
  git pull origin "$BASE_BRANCH"
fi

git checkout -b "turn-${TURN_ID}"

if git remote get-url origin >/dev/null 2>&1; then
  git push -u origin "turn-${TURN_ID}"
fi
```

---

## Step 5: Scaffold Project Foundation

Invoke `project-init` with the resolved stack.

Wait for completion.

---

## Step 6: Parse DDD

Invoke `spec-parse-ddd` with `DDD_PATH`.

Expected outputs:

- `.claude/domain/model.json`
- `.claude/domain/model.md`

Wait for completion.

---

## Step 7: Generate Plan and Epic(s)

1. Invoke `spec-planning` using PRD/DDD/stack paths.
2. Invoke `spec-prd-parse` using PRD input.

If `WIREFRAME_PATH` is present, include it in downstream context for planning and implementation.

After generation, verify at least one epic exists under `.claude/epics/*/epic.md`.

If none exist, stop and report failure.

---

## Step 8: Execute Epics

For each epic file found:

1. Create `epic/<epic-name>` branch from `turn-${TURN_ID}`.
2. Spawn `orchestrator` with:
   - epic file contents
   - `.claude/domain/model.json`
   - relevant plan docs under `specs/plan/`
   - wireframe file path when provided
3. Wait for orchestrator completion.
4. Run `verify-all`.
5. Spawn `git-guardian` to commit and create PR (when remote exists).

Do not skip verification.

---

## Step 9: Complete Turn Lifecycle (Post-Execution)

Always run post-execution steps, including on failure.

### Template Path Resolution

Resolve templates in this order:

1. `./.claude/templates/...`
2. `./templates/...`
3. `$HOME/.claude/templates/...`

Use resolved templates for:

- `pull_request.md`
- `adr.md`
- `manifest.json` schema validation

Then:

1. Record `TURN_END_TIME`.
2. Write `pull_request.md`, `adr.md`, and `manifest.json` to the turn directory.
3. Update `turns_index.csv`.
4. Tag `turn/${TURN_ID}`.
5. Push tag only if remote exists.
6. Verify artifact presence before final success report.

Required artifacts:

- `session_context.md`
- `pull_request.md`
- `adr.md`
- `manifest.json`
- updated `turns_index.csv`

---

## Step 10: Final Report

Report:

- input files used
- epics executed
- verification results
- branch/tag/PR status
- turn artifact locations
- any manual follow-up needed

---

## Execution Rules

- Never commit directly to `main` or `master`.
- Never require `/project-plan` as a prerequisite.
- Never skip `verify-all` after implementation.
- On failure, report exactly what failed and what was attempted.
- Keep the run deterministic and one-command complete.

---

## Example

```text
/project-execute prd=specs/taskflow.prd.md ddd=specs/taskflow.ddd.md stack=specs/taskflow.tech-stack.md wireframe=specs/taskflow.wireframe.md
```
