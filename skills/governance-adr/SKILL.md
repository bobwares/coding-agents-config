---
name: governance-adr
description: Architecture Decision Record creation policy — when to write full ADRs vs minimal ADRs, and the required format
triggers:
  - making architecture decisions
  - selecting technologies or libraries
  - changing API contracts
  - introducing infrastructure components
  - modifying data models
  - end of every turn (minimal ADR required)
---

# ADR Skill — Architecture Decision Records

## Purpose

Document every architectural and technology decision made during a turn. An ADR is written **once per turn, minimum**. If no architectural decision was made, write a minimal one-line ADR.

ADRs are stored at: `./ai/agentic-pipeline/turns/turn-${TURN_ID}/adr.md`

---

## When to Write a Full ADR

| Scenario | Full ADR Required |
|----------|:-----------------:|
| Choosing between design patterns (e.g. repository vs active record) | ✅ |
| Selecting a new library or framework | ✅ |
| Changing an API contract or interface | ✅ |
| Introducing infrastructure (queues, caches, storage) | ✅ |
| Modifying a data model with trade-offs | ✅ |
| Changing cross-cutting concerns (auth, logging, error handling) | ✅ |
| Any decision with significant long-term implications | ✅ |

## When to Write a Minimal ADR

| Scenario | Minimal ADR |
|----------|:-----------:|
| Renaming variables or files | ✅ |
| Bug fix with no design choices | ✅ |
| Following an already-established pattern | ✅ |
| Simple refactoring within existing conventions | ✅ |
| Formatting or style changes | ✅ |

**Minimal ADR content** (single line):
```
No architectural decision made this turn — [brief description of what was done instead].
```

---

## Full ADR Format

```markdown
# ADR - Turn {{TURN_ID}}: {{DECISION_TITLE}}

**Date**: {{YYYY-MM-DDTHH:MM:SSZ}}
**Agent**: AI Coding Agent ({{MODEL_NAME}})
**Status**: Accepted

## Context
[Why was this decision needed? What problem does it solve? What constraints apply?]

## Decision
[State the decision clearly and concisely. Describe how it was implemented.]

## Rationale
1. **Reason 1**: [Why this approach was chosen]
2. **Reason 2**: [Additional justification]
3. **Reason 3**: [Technical or business reason]

## Alternatives Considered

### Option 1: {{ALTERNATIVE_NAME}}
- **Pros**: [Benefits of this option]
- **Cons**: [Drawbacks]
- **Rejected because**: [Specific reason it wasn't chosen]

### Option 2: {{ALTERNATIVE_NAME}}
- **Pros**: [Benefits]
- **Cons**: [Drawbacks]
- **Rejected because**: [Reason]

## Consequences

### Positive
- ✅ [Benefit 1]
- ✅ [Benefit 2]

### Negative
- ⚠️ [Trade-off or cost 1]
- ⚠️ [Trade-off or cost 2]

### Mitigations
- [How to address the negative consequences]
```

---

## ADR Naming and Storage

ADRs live in the turn directory:
```
./ai/agentic-pipeline/turns/turn-${TURN_ID}/adr.md
```

One `adr.md` per turn. If multiple architectural decisions were made in a single turn, document all of them in the same file with separate `##` sections numbered sequentially:

```markdown
# ADR - Turn 5: Multiple Decisions

## Decision 1: Repository Pattern for Task Domain
...

## Decision 2: Redis for Session Storage
...
```

---

## Integration with Orchestration

The orchestration skill calls this skill at **Step 8** of the turn lifecycle (Post-Execution phase). It runs after execution completes, regardless of success or failure. A turn is not complete without an `adr.md`.
