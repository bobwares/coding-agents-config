# Agent Coordination

Rules for multiple agents working in parallel within the same epic.

## Model Selection — Standardized

All agents default to `haiku`.

| Task Complexity | Model | Use Cases |
|----------------|-------|-----------|
| **Simple** | `haiku` | File operations, simple edits, git operations, doc generation |
| **Medium** | `haiku` | Feature implementation, test writing, API development, refactoring |
| **Complex** | `haiku` | Architecture decisions, code review, security audits, orchestration |

### Examples

```typescript
// Simple task — use haiku
Task(agent: "doc-generator", model: "haiku", prompt: "Add JSDoc to utils.ts")
Task(agent: "git-guardian", model: "haiku", prompt: "Create commit")

// Medium task — still haiku
Task(agent: "nextjs-engineer", model: "haiku", prompt: "Implement dashboard page")
Task(agent: "test-writer", model: "haiku", prompt: "Write unit tests for UserService")

// Complex task — still haiku
Task(agent: "code-architect", model: "haiku", prompt: "Design API schema")
Task(agent: "code-reviewer", model: "haiku", prompt: "Review PR for security")
```

### Default Model by Agent

| Agent | Default Model | Rationale |
|-------|---------------|-----------|
| `orchestrator` | haiku | Standardized model assignment |
| `code-architect` | haiku | Standardized model assignment |
| `code-reviewer` | haiku | Standardized model assignment |
| `security-auditor` | haiku | Standardized model assignment |
| `git-guardian` | haiku | Standardized model assignment |
| `doc-generator` | haiku | Standardized model assignment |
| All others | haiku | Standardized model assignment |

---

## Parallelism Principle

Agents working on **different file scopes** never conflict. Assign each agent a clear ownership.

## Default File Scope Assignments

| Agent | Owns |
|-------|------|
| `drizzle-dba` | `app/packages/database/schema/`, `app/packages/database/migrations/` |
| `nestjs-engineer` | `app/api/src/modules/<feature>/` |
| `spring-engineer` | `app/services/enterprise/src/main/java/` |
| `nextjs-engineer` | `app/web/src/app/<route>/`, `app/web/src/components/` |
| `test-writer` | `**/*.test.ts`, `**/*.spec.ts`, `app/e2e/` |
| `doc-generator` | `**/*.md`, JSDoc in any file |

## Coordination Rules

1. Each agent only modifies files within its assigned scope
2. Shared types (`packages/types/`) — one agent creates, others import
3. If a shared file needs updating: **one agent handles it, others wait**
4. Each agent commits after each logical unit of work

## Sync Protocol

```bash
# Before starting work on a shared branch
git pull --rebase origin epic/<name>

# After completing a logical unit
git add <files-in-my-scope>
git commit -m "feat(scope): description"
git pull --rebase origin epic/<name>
git push
```

## Conflict Resolution

- Agents **never auto-resolve conflicts**
- On conflict: stop work, report the conflict to the orchestrator
- Human reviews and resolves; agent continues after resolution
