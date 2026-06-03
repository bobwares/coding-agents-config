---
name: af-be-ddd-analysis
description: |
  Analyze a generated Domain-Driven Design (DDD) specification document for quality,
  completeness, and alignment with PRD requirements. Use whenever a spec-be-ddd.md
  file has been generated and you need a comprehensive audit of its structure,
  internal consistency, domain model coverage, and gaps. Outputs a detailed analysis
  listing risks, missing elements, and recommendations for patching.
compatibility: Requires spec-be-ddd.md (YAML/Markdown), access to PRD spec-be-prd.md for comparison
---

## Purpose

Audit DDD spec document systematically. Report actionable findings that prevent downstream implementation blockers.

## Inputs

- **DDD**: `.appfactory/specs/spec-be-ddd.md`
- **PRD**: `.appfactory/specs/spec-be-prd.md` (for coverage comparison)

## Execution Steps

0. **LOCATE TURN**
   - Find turn that last created/modified spec-be-ddd.md
   - Search `.appfactory/tasks/task-XXX/turns/*/manifest.json` for most recent entry with `spec-be-ddd.md`
   - Use that turn-YYY as analysis target (do NOT create new turn)

1. **READ**
   - DDD
   - PRD

2. **Run structural checks**
   - Template Compliance: All 15 required sections present, metadata format, end marker
   - Version History table formatting correct
   - Frontmatter valid YAML

3. **Run consistency checks**
   - State/transition counts match everywhere (scope, lifecycle, DSL notes)
   - Invariant refs (INV-01 through INV-XX) used correctly in Aggregate Roots table
   - Event count matches PRD
   - Command count matches PRD
   - Bounded Contexts table command counts match actual command list

4. **Run PRD coverage checks**
   - Architecture patterns table from PRD §5 reflected in Planner Notes
   - NFRs (submit < 2s, adjudication < 8s, 10K claims/day, 99.9% uptime) present in Open Domain Decisions or Planner Notes
   - Performance constraints documented in DSL guidance
   - All workflows from PRD covered in Lifecycle or worked examples

5. **Run domain model checks**
   - Single aggregate (Claim) clean boundary
   - All entities owned by Claim aggregate
   - Value objects model financial, snapshot, audit dimensions
   - Identify missing entities (Policy, PaymentInstruction, etc.) per bounded context
   - Check all three contexts (Claims Core, Coverage & Eligibility, Settlement & Communication) are modeled

6. **Run worked examples check**
   - Count examples vs. PRD coverage (PRD v1.2.0 has ~20 worked examples)
   - List missing scenarios: manual review, denial, override, payment failure, idempotency, policy timeout, multi-line adjudication, negative deductible edge case

7. **Run bounded context balance check**
   - Claims Core: rich detail check
   - Coverage & Eligibility Reference: shallow entities/VOs/invariants/commands?
   - Settlement & Communication: PaymentInstruction/EOBRequest mentioned but not elaborated?

8. **Flag risks**
   - Severity: Low (cosmetic), Medium (loses validation), High (blocks implementation)
   - Impact: Confuses planner, context can't be implemented, perf/scale targets missing

9. **Generate recommendation**
   - Numbered patch list (vX.Y.Z → vX.Y.(Z+1))
   - Specific line numbers, field names, exact rewording where applicable
   - Prioritize High-severity risks first

## Output Format

Write to: `./.appfactory/tasks/task-XXX/turns/turn-YYY/spec-be-ddd.analysis.md`

Where `turn-YYY` is the turn that created/last modified spec-be-ddd.md (identified in step 0 above). Do NOT create a new turn.

Use exact structure (copy the template below):

```markdown
# DDD Analysis — spec-be-ddd.md vX.Y.Z

**Analyzed:** [ISO timestamp, UTC]
**Reviewer:** AI Coding Agent (model-name)
**Source Document:** `.appfactory/specs/spec-be-ddd.md` (vX.Y.Z)

---

## Structure (Template Compliance)

✓/⚠/✗ [check description]
✓/⚠/✗ [check description]

[bullets for each check]

## Internal Consistency

✓/⚠/✗ [state count consistency check]
✓/⚠/✗ [transition count check]
[etc.]

## PRD Coverage Gaps

✗ **Missing PRD elements**:
- [element from PRD]
- [element from PRD]

⚠ **Loose coverage**:
- [element that's vague or incomplete]

## Domain Model Quality

✓ [entity design check]
✓ [VO coverage check]

⚠ **Missing entities**:
- **[Entity Name]** [description of gap]

## Worked Examples — [Thin/Adequate/Comprehensive]

⚠ **Only N example(s)**. PRD has ~20. Major regression.

Missing scenarios from PRD:
- [scenario]
- [scenario]

## Bounded Context Detail Imbalance

✓ [context]: rich detail
⚠ [context]: shallow — [what's missing]
⚠ [context]: shallow — [what's missing]

**Verdict**: DDD reads as **[context]-only DDD**. Other contexts are stubs.

## DSL-Oriented Notes — [Assessment]

✓ [check]
✓ [check]
⚠ [issue]

## Open Domain Decisions — [Assessment]

✓ [count] areas documented
✓ Each has assumption + why-it-matters + recommendation

## Risks Flagged

| # | Risk | Severity | Impact |
|---|------|----------|--------|
| 1 | [risk description] | [Low/Medium/High] | [impact] |
| 2 | [risk description] | [Low/Medium/High] | [impact] |

## Recommendation

Patch vX.Y.Z → vX.Y.(Z+1):

1. [Fix description, line numbers if applicable]
2. [Fix description, line numbers if applicable]
3. [Fix description, line numbers if applicable]

## Verdict

[One-sentence judgment: template-compliant? actionable? blockers?]
```

## Notes on Output Quality

- Be specific: cite line numbers, exact field names, counts
- Distinguish ✓ (met) from ⚠ (minor issue) from ✗ (blocking)
- Risks section: severity + impact on implementation clarity
- Recommendation must be actionable (exact line numbers, exact rewording if applicable)
- Match tone and structure of prior analyses in the project
- ISO timestamp format: `YYYY-MM-DD, HH:MM AM/PM Timezone` (e.g., "May 04, 2026, 09:55 AM Central Time")

## Bundled Resources

None (analysis runs inline using the instructions above).
