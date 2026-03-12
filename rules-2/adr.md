# ADR Rules — Architecture Decision Records

Every turn produces exactly one `adr.md` in `./ai/agentic-pipeline/turns/turn-${TURN_ID}/`.

## Full ADR Format

Use template: `${HOME}/.claude/templates/adr_template.md`

## When to Write a Full ADR

| Scenario                                        | Full ADR |
|-------------------------------------------------|:--------:|
| Choosing between design patterns                |   Yes    |
| Selecting a new library or framework            |   Yes    |
| Changing an API contract                        |   Yes    |
| Introducing infrastructure (queues, caches)     |   Yes    |
| Modifying data model with trade-offs            |   Yes    |
| Changing cross-cutting concerns (auth, logging) |   Yes    |

---

## When a Minimal ADR is Acceptable

| Scenario                          | Minimal |
|-----------------------------------|:-------:|
| Bug fix with no design choices    |   Yes   |
| Following established pattern     |   Yes   |
| Renaming variables or files       |   Yes   |
| Formatting or style changes       |   Yes   |
| Adding tests to existing behavior |   Yes   |

**Minimal ADR format** :
```
# ADR - Turn {{TURN_ID}}: {{DECISION_TITLE}}

- **Date**: {{UTC_ISO8601}}
- **Time**: 
- **Agent**: AI Coding Agent ({{MODEL_NAME}})
- **Status**: Accepted

---No architectural decision made this turn — [brief description of what was done].

```

## Multiple Decisions

If multiple architectural decisions in one turn, document all in one `adr.md` with numbered sections:

```markdown
# ADR - Turn 5: Multiple Decisions

## Decision 1: Repository Pattern
...

## Decision 2: Redis for Sessions
...
```

---

## Timing

ADRs are written in **Step 8** of the turn lifecycle (Post-Execution), after execution completes.
