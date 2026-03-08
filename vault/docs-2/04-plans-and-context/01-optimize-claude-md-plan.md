# Optimize `CLAUDE.md` Without Breaking Behavior

## Goal

Reduce `CLAUDE.md` token size while preserving all required workflow, governance, and automation behavior.

## Step-by-step plan

1. **Create a baseline snapshot.**
   - Record current file size and line count:
   - `wc -lc CLAUDE.md`
   - Keep a copy for rollback: `cp CLAUDE.md docs/CLAUDE.backup.md`

2. **Define what must stay in `CLAUDE.md`.**
   - Keep only high-priority directives needed every turn:
   - Turn lifecycle requirement
   - Post-execution artifact requirement
   - Hard safety constraints
   - Pointer links to deeper docs

3. **Extract verbose reference tables.**
   - Move large static sections into dedicated docs (or existing `.claude/context/*` files):
   - Agent catalog
   - Skills quick reference
   - Command catalog
   - Long project structure block

4. **Replace moved blocks with short pointers.**
   - In `CLAUDE.md`, replace each long section with 1-3 bullets and a path reference.
   - Example pattern: “See `.claude/context/context_skills.md` for full skill registry.”

5. **Deduplicate mirrored content.**
   - Remove repeated content that already exists in:
   - `.claude/context/*.md`
   - `.claude/rules/*.md`
   - `AGENTS.md`
   - Keep one canonical source per topic.

6. **Convert prose to compact policy bullets.**
   - Rewrite long explanatory paragraphs as imperative bullets.
   - Keep examples only when behavior would be ambiguous without them.

7. **Preserve exact paths and command names.**
   - Do not change file paths, hook names, skill names, or command syntax during compaction.
   - Run search checks after edits:
   - `rg -n "turn-init\.sh|session_context\.md|turns_index\.csv|/session-start|/session-end" CLAUDE.md`

8. **Add a “Minimum Runtime Contract” section.**
   - Include a short checklist of non-negotiables that must always remain loaded.
   - This protects behavior even if references move elsewhere.

9. **Validate cross-file consistency.**
   - Ensure `CLAUDE.md` pointers resolve to existing files:
   - `rg --files .claude docs | sort`
   - Fix any stale references immediately.

10. **Run functional smoke checks.**
    - Confirm critical docs still exist and are readable:
    - `test -f .claude/context/context_orchestration.md`
    - `test -f .claude/context/context_governance.md`
    - `test -f .claude/templates/turn/manifest.schema.json`

11. **Measure reduction and set a guardrail.**
    - Re-measure size and line count:
    - `wc -lc CLAUDE.md`
    - Target: reduce by 30-60% while keeping all hard requirements intact.

12. **Document the compaction decision.**
    - Add a short ADR entry summarizing what was moved and why.
    - Include rollback note pointing to `docs/CLAUDE.backup.md`.

## Recommended target layout

- `CLAUDE.md` (short operational contract + pointers)
- `.claude/context/*` (full runtime references)
- `.claude/rules/*` (normative policy)
- `docs/` (human-facing long-form docs)

## Acceptance criteria

- `CLAUDE.md` is materially smaller (target 30-60% reduction).
- All required workflow steps remain enforceable.
- No broken path references.
- Turn artifacts and governance behavior remain unchanged.
