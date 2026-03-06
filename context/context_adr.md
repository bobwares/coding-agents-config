# Context: ADR Policy — Architecture Decision Records

> **Load trigger**: Loaded by `/governance-adr` skill only. Not loaded at session start.

## Purpose

Defines the policy for when and how to document Architecture Decision Records. Every turn produces exactly one `adr.md`. The ADR skill implements the format; this context file defines the policy.

---

## Policy Summary

**Every turn must produce an `adr.md`.** There are no exceptions. The content varies:

| Turn type | ADR type | Minimum content |
|-----------|----------|----------------|
| Architectural decision made | Full ADR | Context, Decision, Rationale, Alternatives, Consequences |
| No architectural decision | Minimal ADR | One sentence: what was done and why no decision was needed |

---

## Decision Matrix

### Full ADR Required

| Scenario | Example |
|----------|---------|
| Choosing between design patterns | Repository pattern vs Active Record for Task aggregate |
| Selecting a new library or framework | Chose Drizzle ORM over Prisma for type safety |
| Changing an API contract | Changed task status enum from 3 values to 4 |
| Introducing infrastructure | Added Redis for distributed session storage |
| Modifying a data model with trade-offs | Denormalized sprint summary into tasks table for query performance |
| Changing cross-cutting concerns | Switched from cookie-based to JWT auth |
| Any decision with significant long-term implications | Adopted CQRS for task read/write separation |

### Minimal ADR Acceptable

| Scenario | Example minimal text |
|----------|---------------------|
| Bug fix with no design choices | `No architectural decision made this turn — fixed null pointer in TaskService.findById when sprint is unset.` |
| Following established pattern | `No architectural decision made this turn — implemented SprintService following existing TaskService pattern.` |
| Renaming variables or files | `No architectural decision made this turn — renamed TaskDTO to CreateTaskRequest per naming conventions.` |
| Formatting or style changes | `No architectural decision made this turn — applied Prettier formatting to tasks module.` |
| Adding tests to existing behavior | `No architectural decision made this turn — added 8 unit tests covering TaskAssignmentService edge cases.` |

---

## Timing

ADRs are written in **Step 8** of the turn lifecycle (Post-Execution phase). They are written **after** execution completes, allowing the full turn to inform the decision documentation.

---

## Multiple Decisions in One Turn

If multiple architectural decisions were made in a single turn, document all in one `adr.md` with numbered sections:

```markdown
# ADR - Turn 5: Multiple Decisions

## Decision 1: Repository Pattern for Task Domain
[Full ADR content]

---

## Decision 2: Separate Read/Write Database Users
[Full ADR content]
```

---

## ADR Index

All ADRs are discoverable through the `turns_index.csv`. To find a specific ADR:
1. Find the turn by summary in `turns_index.csv`
2. Navigate to `./ai/agentic-pipeline/turns/turn-${TURN_ID}/adr.md`

Over time, significant ADRs should be referenced in `.claude/memory/decisionLog.md` for long-term memory.

---

## Relationship to decisionLog.md

The memory bank file `.claude/memory/decisionLog.md` captures **key** architectural decisions for long-term reference. Not every minimal ADR needs to go there — only decisions that affect future work:

- Technology choices (Drizzle over Prisma)
- Pattern selections (repository pattern)
- API contract changes
- Infrastructure decisions

Update `decisionLog.md` at the end of every session (session-end skill) when the turn's `adr.md` contains a full ADR.
