# ADR Rules — Architecture Decision Records

Every turn produces exactly one `adr.md` in:

`./.appfactory/tasks/task-${TASK_ID}/turns/turn-${TURN_ID}/`

## Full ADR Format

Use template:

`${HOME}/.claude/templates/adr_template.md`

## When to Write a Full ADR

| Scenario | Full ADR |
|---|:---:|
| Choosing between design patterns | Yes |
| Selecting a new library or framework | Yes |
| Changing an API contract | Yes |
| Introducing infrastructure (queues, caches) | Yes |
| Modifying data model with trade-offs | Yes |
| Changing cross-cutting concerns (auth, logging) | Yes |

## When a Minimal ADR is Acceptable

| Scenario | Minimal |
|---|:---:|
| Bug fix with no design choices | Yes |
| Following established pattern | Yes |
| Renaming variables or files | Yes |
| Formatting or style changes | Yes |
| Adding tests to existing behavior | Yes |

## Minimal ADR Format

```md
# ADR — Task {{TASK_ID}} Turn {{TURN_ID}}: {{DECISION_TITLE}}

- **Date**: {{UTC_ISO8601}}
- **Agent**: AI Coding Agent ({{MODEL_NAME}})
- **Status**: Accepted

No architectural decision made this turn — {{BRIEF_DESCRIPTION}}.
```

## Multiple Decisions

If multiple architectural decisions occur in one turn, document them in one `adr.md` using numbered sections.

## Timing

`adr.md` is written during `/turn-end` after execution completes.
