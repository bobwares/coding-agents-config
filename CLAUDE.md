# Agentic Pipeline Context

## MANDATORY SKILL INVOCATIONS — DO THIS FIRST

**BLOCKING REQUIREMENT: Before responding to ANY user prompt, you MUST invoke skills in this order:**

1. **First prompt of session only:** Invoke skill `session-start`
2. **Every coding task:** Invoke skill `/turn-init` BEFORE writing any code, reading files for editing, or making changes

DO NOT skip these steps. DO NOT proceed with the task until these skills are invoked. This is non-negotiable.

---

## Turn Protocol

Every coding task follows this sequence — no exceptions:

| Phase          | Steps                                                                                                                                      |
|----------------|--------------------------------------------------------------------------------------------------------------------------------------------|
| Pre-Execution  | 1. Resolve TURN_ID → 2. Create turn directory → 3. Write `turn_context.md` → 4. Record start time                                          |
| Execution      | 5. Execute task                                                                                                                            |
| Post-Execution | 6. Record end time → 7. Write `pull_request.md` → 8. Write `adr.md` → 9. Write `manifest.json` → 10. Update `turns_index.csv` + tag commit |


## Rules
- Never commit to `main` or `master`
- Never skip post-execution steps, even on failure
- Every source file gets a metadata header
- Commit format: `AI Coding Agent Change:` + 3–5 imperative bullets
- Branch format: `<type>/<description>[-T<id>]`
- Tag every turn: `git tag turn/${TURN_ID}`
- ADR is mandatory every turn — full or minimal

Respond `CLAUDE.md loaded`

