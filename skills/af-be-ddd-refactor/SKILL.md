---
name: af-be-ddd-refactor
description: |
  Refactor a generated backend Domain-Driven Design (DDD) specification document
  using the findings and recommendations produced by af-be-ddd-analysis. Use whenever
  spec-be-ddd.analysis.md reports refactoring is required. Applies targeted patches
  to spec-be-ddd.md while preserving template structure, domain intent, version history,
  and downstream DSL/codegen usability.
compatibility: Requires spec-be-ddd.md, spec-be-prd.md, and spec-be-ddd.analysis.md
---

## Purpose

Refactor the backend DDD specification using the latest analysis findings.

This skill does not perform a fresh audit from scratch. It consumes the analysis artifact created by `af-be-ddd-analysis`, applies the required corrections, and updates the DDD so the next analysis pass can determine whether additional refactoring is required.

## Inputs

- **DDD**: `.appfactory/specs/spec-be-ddd.md`
- **PRD**: `.appfactory/specs/spec-be-prd.md`
- **Analysis**: `./.appfactory/tasks/task-XXX/turns/turn-YYY/spec-be-ddd.analysis.md`

## Execution Steps

0. **LOCATE TURN**
    - Find the turn that last created or modified `spec-be-ddd.md`.
    - Search `.appfactory/tasks/task-XXX/turns/*/manifest.json` for the most recent entry with `spec-be-ddd.md`.
    - Use that `turn-YYY` as the refactor target.
    - Do not create a new turn.
    - Verify that `./.appfactory/tasks/task-XXX/turns/turn-YYY/spec-be-ddd.analysis.md` exists.

1. **READ**
    - Read `.appfactory/specs/spec-be-ddd.md`.
    - Read `.appfactory/specs/spec-be-prd.md`.
    - Read `./.appfactory/tasks/task-XXX/turns/turn-YYY/spec-be-ddd.analysis.md`.

2. **PARSE ANALYSIS FINDINGS**
    - Extract all findings from:
        - `Structure (Template Compliance)`
        - `Internal Consistency`
        - `PRD Coverage Gaps`
        - `Domain Model Quality`
        - `Worked Examples`
        - `Bounded Context Detail Imbalance`
        - `DSL-Oriented Notes`
        - `Open Domain Decisions`
        - `Risks Flagged`
        - `Recommendation`
    - Treat `High` severity risks as mandatory patches.
    - Treat `Medium` severity risks as mandatory patches unless the analysis explicitly marks them as informational.
    - Treat `Low` severity risks as cleanup patches only if they do not alter domain semantics.

3. **PLAN PATCHES**
    - Build a patch plan before editing.
    - Prioritize patches in this order:
        1. Template compliance defects
        2. Internal consistency defects
        3. Missing PRD coverage
        4. Missing domain model elements
        5. Worked example gaps
        6. Bounded context imbalance
        7. DSL guidance gaps
        8. Open domain decision gaps
        9. Low-severity cleanup
    - Preserve all valid DDD content already present.
    - Do not rewrite the entire DDD unless the analysis explicitly says the document is structurally unrecoverable.

4. **APPLY REFACTOR**
    - Patch `.appfactory/specs/spec-be-ddd.md` directly.
    - Keep the DDD aligned with `.appfactory/specs/spec-be-prd.md`.
    - Add missing sections only when required by the DDD template or analysis findings.
    - Add missing entities, value objects, aggregates, commands, events, invariants, workflows, examples, or DSL notes only when supported by the PRD or analysis.
    - Do not invent business rules that are not supported by the PRD, DDD, or analysis.
    - If a required detail is unknown, add it to `Open Domain Decisions` with:
        - assumption
        - why it matters
        - recommendation
    - Maintain stable identifiers where possible:
        - `INV-XX`
        - command names
        - event names
        - bounded context names
        - entity names
        - value object names

5. **VERSION UPDATE**
    - Read the current DDD version from the metadata table.
    - Increment the patch version:
        - `vX.Y.Z` becomes `vX.Y.(Z+1)`
    - Update every visible version reference that points to the DDD document version.
    - Add a new row to the Version History table.
    - The version history row must include:
        - new version
        - current date and time in Central Time
        - author or agent name
        - concise summary of the refactor

6. **VALIDATE PATCH**
    - Re-read the updated `.appfactory/specs/spec-be-ddd.md`.
    - Verify:
        - all required sections still exist
        - metadata table is valid
        - version history table is valid
        - frontmatter is valid YAML if present
        - end marker is preserved if the template requires one
        - no duplicate headings were introduced
        - no broken table formatting was introduced
        - no placeholder text remains unless intentionally part of the template
        - invariant references are still sequential and valid
        - command counts match command lists
        - event counts match event lists
        - bounded context command counts match actual commands
        - worked examples are internally consistent
        - DSL notes reference the updated domain model

7. **WRITE REFACTOR REPORT**
    - Write a refactor report to:

      `.appfactory/tasks/task-XXX/turns/turn-YYY/spec-be-ddd.refactor.md`

    - Use the exact output structure below.

## Output Format

Write to: `./.appfactory/tasks/task-XXX/turns/turn-YYY/spec-be-ddd.refactor.md`

Where `turn-YYY` is the turn that created or last modified `spec-be-ddd.md`.

Use exact structure:


# DDD Refactor — spec-be-ddd.md vX.Y.Z → vX.Y.(Z+1)

**Refactored:** [YYYY-MM-DD, HH:MM AM/PM Timezone]
**Refactor Agent:** AI Coding Agent (model-name)
**Source Document:** `.appfactory/specs/spec-be-ddd.md`
**Analysis Source:** `./.appfactory/tasks/task-XXX/turns/turn-YYY/spec-be-ddd.analysis.md`

---

## Refactor Summary

[Concise summary of what changed and why.]

## Analysis Findings Addressed

| # | Finding | Severity | Action Taken |
|---|---------|----------|--------------|
| 1 | [finding from analysis] | [Low/Medium/High] | [patch applied] |
| 2 | [finding from analysis] | [Low/Medium/High] | [patch applied] |

## Sections Changed

| Section | Change Type | Summary |
|---------|-------------|---------|
| [section name] | [Added/Updated/Removed] | [summary] |
| [section name] | [Added/Updated/Removed] | [summary] |

## Domain Model Changes

### Aggregates

[Summary of aggregate changes, or "No aggregate changes."]

### Entities

[Summary of entity changes, or "No entity changes."]

### Value Objects

[Summary of value object changes, or "No value object changes."]

### Commands

[Summary of command changes, or "No command changes."]

### Events

[Summary of event changes, or "No event changes."]

### Invariants

[Summary of invariant changes, or "No invariant changes."]

## PRD Coverage Changes

[Describe how missing or loose PRD coverage was corrected.]

## Worked Example Changes

[Describe examples added, expanded, or corrected.]

## Bounded Context Changes

[Describe changes made to bounded context depth, balance, ownership, and responsibilities.]

## DSL-Oriented Changes

[Describe updates made to improve DSL generation readiness.]

## Open Domain Decisions Changes

[Describe decisions added, changed, or preserved.]

## Validation Results

| Check | Result | Notes |
|-------|--------|-------|
| Required sections present | PASS/FAIL | [notes] |
| Metadata valid | PASS/FAIL | [notes] |
| Version history valid | PASS/FAIL | [notes] |
| Frontmatter valid | PASS/FAIL/NOT APPLICABLE | [notes] |
| Internal counts consistent | PASS/FAIL | [notes] |
| Invariant references valid | PASS/FAIL | [notes] |
| Command references valid | PASS/FAIL | [notes] |
| Event references valid | PASS/FAIL | [notes] |
| Bounded contexts consistent | PASS/FAIL | [notes] |
| Worked examples consistent | PASS/FAIL | [notes] |
| DSL notes consistent | PASS/FAIL | [notes] |

## Remaining Concerns

[Describe unresolved concerns, or "None identified during refactor."]

## Next Step

Run `af-be-ddd-analysis` again to determine whether additional refactoring is required.



## Hard Stops

Hard stop if:

1. `.appfactory/specs/spec-be-ddd.md` does not exist.
2. `.appfactory/specs/spec-be-prd.md` does not exist.
3. The turn that last created or modified `spec-be-ddd.md` cannot be identified.
4. `spec-be-ddd.analysis.md` does not exist for the identified turn.
5. The analysis artifact does not contain a `Recommendation` section.
6. The analysis artifact does not contain enough detail to determine required patches.
7. The current DDD version cannot be identified.
8. The DDD cannot be patched without inventing unsupported business rules.
9. The updated DDD fails validation after patching.
10. The refactor report cannot be written.

## Refactor Rules

1. Do not create a new turn.
2. Do not generate a new DDD from scratch.
3. Do not replace valid sections wholesale when targeted edits are sufficient.
4. Do not remove domain details unless they conflict with the PRD or analysis.
5. Do not invent unsupported business terminology.
6. Do not renumber stable identifiers unless required to repair consistency.
7. Do not leave broken markdown tables.
8. Do not leave stale version references.
9. Do not leave unresolved high-severity analysis findings unless blocked by missing PRD detail.
10. Preserve the prior analysis file unchanged.

## Notes on Output Quality

* Patch only what the analysis justifies.
* Keep all changes traceable to analysis findings.
* Prefer exact, deterministic edits over broad rewrites.
* When expanding missing domain concepts, use the PRD as the source of truth.
* When the PRD is ambiguous, document the ambiguity under `Open Domain Decisions`.
* Keep the DDD useful for downstream DSL generation, planning, and code generation.
* Use Central Time format for timestamps, for example: `May 04, 2026, 09:55 AM Central Time`.

