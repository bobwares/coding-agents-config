# Branch Naming Convention

## Format

```
<type>/<short-description>[-<task-id>]
```

## Types

| Type | Use For |
|------|---------|
| `feat` | New feature |
| `fix` | Bug fix |
| `chore` | Tooling, build, dependencies, config |
| `docs` | Documentation only |
| `refactor` | Internal restructuring, no behavior change |
| `test` | Adding or improving tests |
| `perf` | Performance improvement |

## Rules

- All lowercase
- Hyphens only (no underscores, no spaces, no slashes except the type separator)
- Short description: 3–5 words maximum
- Optional task ID suffix: `-T<number>` (e.g. `-T42`)
- Never `main`, `master`, `develop` — always a feature branch

## Examples

```
feat/task-assignment-service-T42
feat/sprint-lifecycle-management
fix/null-pointer-in-task-find-by-id
fix/sprint-date-validation-T99
refactor/user-repository-pattern
chore/update-drizzle-to-0-32
docs/api-openapi-specification
test/task-integration-edge-cases
perf/task-query-pagination-index
```
