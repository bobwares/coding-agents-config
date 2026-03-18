# Governance Rules

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
 * Log:
 * {{turn_number}}, {{version}}, {{YYYY/MM/DD}}, {{HH:MM AM/PM}}, {{coding_agent_and_model}}
 */
```

**Example:**
```typescript
/**
 * App: base-node-fullstack
 * Package: api
 * File: user.service.ts
 * Version: 0.1.1
 * Turns: 1, 2
 * Author: AI Coding Agent (Claude Opus 4.5)
 * Date: 2026-03-18T14:30:00Z
 * Exports: UserService
 * Description: Service for managing user entities
 * Log:
 * 1, 0.1.0, 2026/03/15, 10:00 AM, Claude Opus 4.5
 * 2, 0.1.1, 2026/03/18, 02:30 PM, Claude Opus 4.5
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
 * Log:
 * {{turn_number}}, {{version}}, {{YYYY/MM/DD}}, {{HH:MM AM/PM}}, {{coding_agent_and_model}}
 */
```

**Example:**
```java
/**
 * App: enterprise-api
 * Package: com.example.service
 * File: TaskService.java
 * Version: 0.2.0
 * Turns: 5, 8, 12
 * Author: AI Coding Agent (Claude Opus 4.5)
 * Date: 2026-03-18T16:45:00Z
 * Description: Service for task management operations
 * Log:
 * 5, 0.1.0, 2026/03/10, 09:15 AM, Claude Opus 4.5
 * 8, 0.1.1, 2026/03/14, 03:20 PM, Codex GPT-5
 * 12, 0.2.0, 2026/03/18, 04:45 PM, Claude Opus 4.5
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
Log:
{{turn_number}}, {{version}}, {{YYYY/MM/DD}}, {{HH:MM AM/PM}}, {{coding_agent_and_model}}
"""
```

**Example:**
```python
"""
App: data-pipeline
File: transform.py
Version: 0.1.2
Turns: 3, 4
Author: AI Coding Agent (Claude Opus 4.5)
Date: 2026-03-18T11:00:00Z
Description: Data transformation utilities
Log:
3, 0.1.0, 2026/03/12, 08:30 AM, Claude Opus 4.5
4, 0.1.2, 2026/03/18, 11:00 AM, Claude Opus 4.5
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
# Log:
# {{turn_number}}, {{version}}, {{YYYY/MM/DD}}, {{HH:MM AM/PM}}, {{coding_agent_and_model}}
```

**Example:**
```bash
# App: base-node-fullstack
# File: deploy.sh
# Version: 0.1.0
# Turns: 7
# Author: AI Coding Agent (Claude Opus 4.5)
# Date: 2026-03-18T09:00:00Z
# Description: Deployment script for production environment
# Log:
# 7, 0.1.0, 2026/03/18, 09:00 AM, Claude Opus 4.5
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
-- Log:
-- {{turn_number}}, {{version}}, {{YYYY/MM/DD}}, {{HH:MM AM/PM}}, {{coding_agent_and_model}}
```

**Example:**
```sql
-- App: base-node-fullstack
-- File: 001_create_users.sql
-- Version: 0.1.1
-- Turns: 2, 6
-- Author: AI Coding Agent (Claude Opus 4.5)
-- Date: 2026-03-18T13:15:00Z
-- Description: Migration to create users table
-- Log:
-- 2, 0.1.0, 2026/03/08, 02:00 PM, Claude Opus 4.5
-- 6, 0.1.1, 2026/03/18, 01:15 PM, Claude Opus 4.5
```

---

## 2. Semantic Versioning

Every file has its own version tracked in its metadata header.

| Change Type                        | Version Bump     | Example           |
|------------------------------------|------------------|-------------------|
| New file created                   | Start at `0.1.0` | `0.1.0`           |
| Bug fix, refactor, internal change | Increment PATCH  | `0.1.0` → `0.1.1` |
| New feature added to file          | Increment MINOR  | `0.1.1` → `0.2.0` |
| Breaking change to API/contract    | Increment MAJOR  | `0.2.0` → `1.0.0` |
| No change to file                  | No bump          | stays same        |

**Turns field**: Append the current TURN_ID each time the file is modified. Example: `Turns: 1, 3, 7`

---

## 3. Git Branch Naming

Format: `<type>/<short-description>[-<task-id>]`

| Type       | Use For                             |
|------------|-------------------------------------|
| `feat`     | New feature                         |
| `fix`      | Bug fix                             |
| `chore`    | Tooling, build, dependencies        |
| `docs`     | Documentation only                  |
| `refactor` | Internal change, no behavior change |
| `test`     | Adding or improving tests           |
| `perf`     | Performance improvement             |

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

---

## 9. Non-Functional Requirements

All production systems must comply with the NFR baseline specification.

**Reference Documents:**
- `docs/NON_FUNCTIONAL_SPEC.md` — Full NFR specification
- `docs/NFR_CHECKLIST.md` — Per-project verification checklist

**Key NFR Categories:**
1. Reliability and Availability (SLOs, resilience patterns)
2. Observability (metrics, logs, traces, health endpoints)
3. Logging (structured JSON, required fields, no secrets)
4. Operations (runbooks, on-call, backups)
5. Security (auth, secrets, encryption, vulnerability management)
6. Performance and Scalability (budgets, capacity, limits)
7. Data Management (classification, retention, migrations)
8. Deployments (CI/CD, release strategies, feature flags)
9. Compliance (documentation, environment separation)
10. UI/Frontend (accessibility, resilience, observability)

**Exception Process:**
Any NFR exception requires an ADR documenting:
- Requirement being waived
- Rationale and risk assessment
- Mitigations
- Review date
