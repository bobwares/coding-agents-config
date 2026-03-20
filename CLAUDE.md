# Agentic Pipeline Context

## MANDATORY SKILL INVOCATIONS — DO THIS FIRST

**BLOCKING REQUIREMENT: Before responding to ANY user prompt, you MUST invoke skills in this order:**

1. **First prompt of session only:** Invoke skill `session-start`
2. **Every coding task:** Invoke `/turn-init` to resolve TURN_ID
3. **HARD GATE — BRANCH CHECK:** After turn-init, IMMEDIATELY run `git branch --show-current`.
   - If result is `main` or `master`: **HALT. DO NOT WRITE ANY CODE.**
   - You MUST run `/branch-guard` to create and switch to `turn/T<TURN_ID>` branch.
   - Verify switch succeeded by running `git branch --show-current` again.
   - Only proceed when current branch is NOT main/master.

**VIOLATION OF STEP 3 IS A CRITICAL FAILURE.** Writing code while on main/master is never acceptable. This gate cannot be skipped for any reason.

DO NOT skip these steps. DO NOT proceed with the task until ALL skills are invoked and branch is verified. This is non-negotiable.

---

## Turn Protocol

Every coding task follows this sequence — no exceptions:

| Phase          | Steps                                                                                                                                      |
|----------------|--------------------------------------------------------------------------------------------------------------------------------------------|
| Pre-Execution  | 1. Resolve TURN_ID → 2. Create turn directory → 3. Write `turn_context.md` → 4. Record start time                                          |
| Execution      | 5. Execute task  34 l                                                                                                                      |
| Post-Execution | 6. Record end time → 7. Write `pull_request.md` → 8. Write `adr.md` → 9. Write `manifest.json` → 10. Update `turns_index.csv` + tag commit |


## Rules
- **NEVER write code while on `main` or `master`** — verify branch BEFORE any Write/Edit tool use
- Never commit to `main` or `master`
- Never skip post-execution steps, even on failure
- Every source file gets a metadata header
- Commit format: `AI Coding Agent Change:` + 3–5 imperative bullets
- Branch format: `turn/T<TURN_ID>` for all agent-driven work
- Tag every turn: `git tag turn/${TURN_ID}`
- ADR is mandatory every turn — full or minimal

Respond `CLAUDE.md loaded`

