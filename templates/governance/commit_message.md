# Commit Message Convention

## Format

```
AI Coding Agent Change:
- <imperative verb> <object> <context>
- <imperative verb> <object> <context>
- <imperative verb> <object> <context>
```

## Rules

- Always start with `AI Coding Agent Change:`
- 3–5 bullet points (not fewer, not more)
- Imperative mood: "Add", "Fix", "Refactor", "Implement" — never past tense
- Each bullet describes one logical, independent change
- If an ADR was written: last bullet should be `- Document <decision> in ADR turn-${TURN_ID}`
- No period at end of bullets
- No emoji

## Examples

### Feature commit with ADR

```
AI Coding Agent Change:
- Implement TaskAssignmentService with domain validation
- Emit TaskAssigned event when assignee changes
- Write 14 unit tests for assignment rules and edge cases
- Add integration test for concurrent assignment scenario
- Document repository pattern decision in ADR turn-3
```

### Bug fix

```
AI Coding Agent Change:
- Fix null pointer exception in TaskService.findById
- Add null guard for optional sprint association
- Add regression test covering null sprint case
```

### Refactor

```
AI Coding Agent Change:
- Extract TaskRepository interface from TaskService
- Implement DrizzleTaskRepository with 5 query methods
- Update TaskService to depend on interface not implementation
- Migrate 18 existing unit tests to use repository mocks
- Document repository pattern decision in ADR turn-7
```

### Chore

```
AI Coding Agent Change:
- Update Drizzle ORM from 0.30 to 0.32
- Update Drizzle Kit to matching version
- Run migration diff to verify schema unchanged
```
