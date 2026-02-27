---
name: governance
description: Mandatory coding standards, metadata headers, semantic versioning, git conventions, and compliance enforcement
triggers:
  - writing or modifying source files
  - creating git branches
  - writing git commits
  - creating new files
  - reviewing code changes
---

# Governance Skill

## Purpose

Enforce mandatory coding standards on every file written or modified. These rules are non-negotiable and apply to all source, test, and infrastructure-as-code files.

---

## 1. Metadata Headers

**Every source file** (TypeScript, JavaScript, Java, Python, SQL, shell scripts, YAML infrastructure files) **must begin with a metadata header comment**.

Explicit exemption list: 
- globals.css
- turbo.json 
- binary files
- pure config files with no comment syntax
- pom.xml, 
- package.json
- toml files.

2. Metadata fields table with "Required" column (clearer spec)

### TypeScript / JavaScript
```typescript
/**
 * App: {{APPLICATION_NAME}}
 * Package: {{PACKAGE_PATH}}
 * File: {{FILE_NAME}}
 * Version: {{SEMVER}}
 * Turns: {{TURN_NUMBER}}
 * Author: AI Coding Agent ({{MODEL_NAME}})
 * Date: {{UTC_ISO8601}}
 * Exports: {{EXPORTED_SYMBOLS}}
 * Description: {{DESCRIPTION}}
 */
```

### Java
```java
/**
 * App: {{APPLICATION_NAME}}
 * Package: {{JAVA_PACKAGE}}
 * File: {{FILE_NAME}}
 * Version: {{SEMVER}}
 * Turns: {{TURN_NUMBER}}
 * Author: AI Coding Agent ({{MODEL_NAME}})
 * Date: {{UTC_ISO8601}}
 * Description: {{DESCRIPTION}}
 */
```

### Python
```python
"""
App: {{APPLICATION_NAME}}
File: {{FILE_NAME}}
Version: {{SEMVER}}
Turns: {{TURN_NUMBER}}
Author: AI Coding Agent ({{MODEL_NAME}})
Date: {{UTC_ISO8601}}
Description: {{DESCRIPTION}}
"""
```

### Shell / Bash
```bash
# App: {{APPLICATION_NAME}}
# File: {{FILE_NAME}}
# Version: {{SEMVER}}
# Turns: {{TURN_NUMBER}}
# Author: AI Coding Agent ({{MODEL_NAME}})
# Date: {{UTC_ISO8601}}
# Description: {{DESCRIPTION}}
```

### SQL
```sql
-- App: {{APPLICATION_NAME}}
-- File: {{FILE_NAME}}
-- Version: {{SEMVER}}
-- Turns: {{TURN_NUMBER}}
-- Author: AI Coding Agent ({{MODEL_NAME}})
-- Date: {{UTC_ISO8601}}
-- Description: {{DESCRIPTION}}
```

---

## 2. Semantic Versioning

Every file has its own version tracked in its metadata header.

| Change Type | Version Bump | Example |
|-------------|-------------|---------|
| New file created | Start at `0.1.0` | `0.1.0` |
| Bug fix, refactor, internal change | Increment PATCH | `0.1.0` → `0.1.1` |
| New feature added to file | Increment MINOR | `0.1.1` → `0.2.0` |
| Breaking change to API/contract | Increment MAJOR | `0.2.0` → `1.0.0` |
| No change to file | No bump | stays same |

**Turns field**: Append the current TURN_ID each time the file is modified. Example: `Turns: 1, 3, 7`

---

## 3. Git Branch Naming

Format: `<type>/<short-description>[-<task-id>]`

| Type | Use For |
|------|---------|
| `feat` | New feature |
| `fix` | Bug fix |
| `chore` | Tooling, build, dependencies |
| `docs` | Documentation only |
| `refactor` | Internal change, no behavior change |
| `test` | Adding or improving tests |
| `perf` | Performance improvement |

Examples:
- `feat/task-assignment-service-T42`
- `fix/sprint-status-validation-T99`
- `refactor/user-repository-pattern`

---

## 4. Commit Messages

Format: `AI Coding Agent Change:` followed by 3–5 imperative bullet points.

```
AI Coding Agent Change:
- Implement TaskAssignmentService with validation
- Add TaskAssignedEvent emission on state change
- Write 12 unit tests covering assignment edge cases
- Update TaskController to inject service dependency
- Document architectural decision in ADR turn-3
```

Rules:
- Imperative mood: "Add" not "Added", "Fix" not "Fixed"
- Each bullet describes one logical change
- Reference TURN_ID if an ADR was written

---

## 5. Git Tagging

After every turn completes, tag the commit:
```bash
git tag turn/${TURN_ID}
git push origin turn/${TURN_ID}
```

---

## 6. Code Quality Standards

- **Tests**: Write unit tests for new functionality, bug fixes, and refactoring. Maintain or improve existing coverage.
- **Linting**: All code must pass language-specific linters before committing:
  - TypeScript/JS: ESLint + Prettier
  - Java: Checkstyle
  - Python: Ruff + Black
- **Documentation**: Document **why**, not **what**. Public APIs require JSDoc / Javadoc.
- **No dead code**: Remove commented-out code before committing.

---

## 7. Security

**Never commit**:
- API keys, tokens, passwords, private keys
- Database credentials
- OAuth secrets
- SSH private keys
- `.env` files with real values

Use environment variables or secrets management for all sensitive values.


## 8. Compliance Checklist

Before every commit, verify:

- [ ] Metadata headers present and version incremented on all modified files
- [ ] Turns field updated with current TURN_ID
- [ ] Branch name follows `<type>/<description>` pattern
- [ ] Commit message follows `AI Coding Agent Change:` format
- [ ] Tests written or updated for changed logic
- [ ] Linting passes
- [ ] No sensitive data in committed files
- [ ] ADR written (full or minimal) for this turn

