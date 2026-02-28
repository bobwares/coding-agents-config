# Branch Operations

All agents follow these branch rules without exception.

## Creating Branches

Always create branches from an up-to-date main:

```bash
git checkout main
git pull origin main
git checkout -b epic/<name>        # For multi-task epics
git checkout -b feature/<name>     # For single features
git checkout -b fix/<issue-number> # For bug fixes
git push -u origin HEAD
```

## Branch Naming

| Prefix | Use Case |
|--------|----------|
| `epic/` | Multi-task implementation epics from a PRD |
| `feature/` | Standalone feature additions |
| `fix/` | Bug fixes (include issue number: fix/123-user-login) |
| `chore/` | Maintenance, deps, config updates |
| `docs/` | Documentation only |
| `refactor/` | Code restructuring without behavior change |

## Protection Rules

- `main` is protected — **no direct commits, ever**
- All changes go through PRs with passing CI
- Force push is never permitted on `main`
- Always run the verify-app agent before creating a PR
- Delete merged branches after the PR closes

## Commit Message Format (Conventional Commits)

```
type(scope): short description (max 72 chars)

Optional body: explain WHY, not what.
Reference issues or PRDs here.

Closes #123
Co-Authored-By: Claude <noreply@anthropic.com>
```

### Types

| Type | Use |
|------|-----|
| `feat` | New user-facing feature |
| `fix` | Bug fix |
| `chore` | Non-code changes (deps, config, CI) |
| `docs` | Documentation only |
| `refactor` | Code restructuring, no behavior change |
| `test` | Adding or fixing tests |
| `perf` | Performance improvement |

## Best Practices

- Small, focused commits (one logical change per commit)
- Pull before push on shared branches: `git pull --rebase`
- Commit early and often during implementation
- Reference PRD/epic in the PR body
