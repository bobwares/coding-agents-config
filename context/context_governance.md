# Context: Governance — Mandatory Coding Standards

> **Load trigger**: Loaded by `/governance` skill only. Not loaded at session start.

## Purpose

Defines the mandatory coding standards, versioning rules, git workflow conventions, code quality requirements, and security policies that apply to **every file written or modified** during a turn. These rules are enforced by the governance skill and audited via the PostToolUse hook.

---

## Metadata Headers

**Required in every**: TypeScript, JavaScript, Java, Python, SQL, shell script, YAML infrastructure file.

**Exempt**: `pom.xml`, `package.json`, `turbo.json`, generated files, binary files, Markdown documentation.

### Fields

| Field         | Required        | Value                                                       |
|---------------|-----------------|-------------------------------------------------------------|
| `App`         | ✅               | Application name from `project_context.md`                  |
| `Package`     | ✅               | Package or module path (e.g. `apps/api/src/modules/tasks`)  |
| `File`        | ✅               | Filename with extension                                     |
| `Version`     | ✅               | Semantic version (start at `0.1.0` for new files)           |
| `Turns`       | ✅               | Comma-separated list of TURN_IDs when file was modified     |
| `Author`      | ✅               | `AI Coding Agent ({{MODEL_NAME}})`                          |
| `Date`        | ✅               | ISO 8601 UTC: `YYYY-MM-DDTHH:MM:SSZ`                        |
| `Exports`     | TypeScript only | Exported symbols (functions, classes, types)                |
| `Description` | ✅               | What the file does — *why* it exists, not just *what* it is |

---

## Semantic Versioning (Per File)

Each file tracks its own semantic version independently.

```
MAJOR.MINOR.PATCH
```

| Change | Rule | Example |
|--------|------|---------|
| New file | Start at `0.1.0` | `0.1.0` |
| Bug fix, refactor, internal | Increment PATCH | `0.1.2` → `0.1.3` |
| New feature, new public method | Increment MINOR | `0.1.3` → `0.2.0` |
| Breaking API change | Increment MAJOR | `0.2.0` → `1.0.0` |
| No changes to file | No change | stays same |

**Turns Field**: Each time a file is modified, append the `TURN_ID` to the Turns list.
- Created in turn 1: `Turns: 1`
- Modified in turns 1, 3, 7: `Turns: 1, 3, 7`

---

## Git Branch Naming

Format: `<type>/<short-description>[-<task-id>]`

```
feat/task-assignment-service-T42
fix/sprint-date-validation
refactor/user-repository-pattern
chore/update-drizzle-to-0-32
docs/api-openapi-spec
test/task-integration-coverage
perf/task-query-indexing
```

**Rules**:
- All lowercase
- Hyphens only (no underscores, no spaces)
- Short description: 3–5 words max
- Optional task ID suffix (T<number>)
- Never commit directly to `main` or `master`

---

## Commit Message Format

```
AI Coding Agent Change:
- <imperative verb> <object> <context>
- <imperative verb> <object> <context>
- <imperative verb> <object> <context>
```

**Rules**:
- Exactly 3–5 bullet points
- Imperative mood: "Add", "Fix", "Refactor" — not "Added", "Fixed"
- Each bullet = one logical change
- If ADR was written: `- Document <decision> in ADR turn-${TURN_ID}`

**Example**:
```
AI Coding Agent Change:
- Implement repository pattern for Task aggregate
- Add TaskRepository interface with 5 query methods
- Write 18 unit tests with factory fixtures
- Remove direct Drizzle calls from TaskService
- Document repository pattern decision in ADR turn-4
```

---

## Git Tagging

After every turn commit:
```bash
git tag turn/${TURN_ID}
git push origin turn/${TURN_ID}
```

---

## Code Quality Standards

### Testing

| Rule | Requirement |
|------|------------|
| New functionality | Unit tests required |
| Bug fixes | Regression test required |
| Refactoring | Existing tests must still pass |
| Coverage | Maintain or improve existing coverage |
| Test style | Factory functions for fixtures; no hardcoded data |

### Linting

| Language | Linter | Formatter |
|----------|--------|-----------|
| TypeScript/JS | ESLint | Prettier (auto-applied via PostToolUse hook) |
| Java | Checkstyle | Google Java Format |
| Python | Ruff | Black |
| SQL | sqlfluff | — |

### Documentation

- Document **why**, not **what**
- Public APIs require JSDoc (TS/JS) or Javadoc (Java)
- Complex business logic requires inline comments explaining the business rule
- No commented-out code in committed files

---

## Security Standards

**Never commit**:
- API keys, tokens, bearer tokens
- Passwords or password hashes
- Database connection strings with credentials
- Private keys (RSA, EC, SSH)
- OAuth secrets or client secrets
- `.env` files containing real values

**Always use**:
- Environment variables for configuration
- Secret managers (AWS Secrets Manager, Vault) for production secrets
- `.env.example` with placeholder values only

**Pre-commit check**: If any staged file contains patterns matching `API_KEY=`, `PASSWORD=`, `SECRET=`, `PRIVATE_KEY`, or `-----BEGIN`, reject the commit and alert the user.

---

## Compliance Checklist

The governance skill verifies this checklist before every commit:

- [ ] Metadata header present on all modified source files
- [ ] Version incremented correctly (PATCH/MINOR/MAJOR)
- [ ] Turns field updated with current `TURN_ID`
- [ ] Branch name follows `<type>/<description>` format
- [ ] Branch is not `main` or `master`
- [ ] Commit message follows `AI Coding Agent Change:` format with 3–5 bullets
- [ ] Unit tests written for new or changed logic
- [ ] All tests pass (`pnpm test` or equivalent)
- [ ] Linting passes (`pnpm lint` or equivalent)
- [ ] No sensitive data in any staged file
- [ ] ADR written (full or minimal) for this turn
- [ ] Turn tagged: `git tag turn/${TURN_ID}`
