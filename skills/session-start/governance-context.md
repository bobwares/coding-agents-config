# Governance Rules

## Purpose

Enforce mandatory coding standards on every file written or modified. These rules are non-negotiable and apply to source, test, and infrastructure-as-code files.

## 1. Metadata Headers

Every source file (TypeScript, JavaScript, Java, Python, SQL, shell scripts, YAML infrastructure files) must begin with a metadata header comment.

Explicit exemptions:

- `globals.css`
- `turbo.json`
- binary files
- pure config files with no comment syntax
- `pom.xml`
- `package.json`
- `*.toml`

### TypeScript / JavaScript

```typescript
/**
 * App: {{APPLICATION_NAME}}
 * Package: {{PACKAGE_PATH}}
 * File: {{FILE_NAME}}
 * Version: {{SEMVER}}
 * Task: {{TASK_ID}}
 * Turns: {{TURN_IDS}}
 * Author: AI Coding Agent ({{MODEL_NAME}})
 * Date: {{UTC_ISO8601}}
 * Exports: {{EXPORTED_SYMBOLS}}
 * Description: {{DESCRIPTION}}
 * Log:
 * {{TASK_ID}}, {{TURN_ID}}, {{VERSION}}, {{YYYY/MM/DD}}, {{HH:MM AM/PM}}, {{AGENT_AND_MODEL}}
 */
```

### Python

```python
"""
App: {{APPLICATION_NAME}}
File: {{FILE_NAME}}
Version: {{SEMVER}}
Task: {{TASK_ID}}
Turns: {{TURN_IDS}}
Author: AI Coding Agent ({{MODEL_NAME}})
Date: {{UTC_ISO8601}}
Description: {{DESCRIPTION}}
Log:
{{TASK_ID}}, {{TURN_ID}}, {{VERSION}}, {{YYYY/MM/DD}}, {{HH:MM AM/PM}}, {{AGENT_AND_MODEL}}
"""
```

### Shell / Bash

```bash
# App: {{APPLICATION_NAME}}
# File: {{FILE_NAME}}
# Version: {{SEMVER}}
# Task: {{TASK_ID}}
# Turns: {{TURN_IDS}}
# Author: AI Coding Agent ({{MODEL_NAME}})
# Date: {{UTC_ISO8601}}
# Description: {{DESCRIPTION}}
# Log:
# {{TASK_ID}}, {{TURN_ID}}, {{VERSION}}, {{YYYY/MM/DD}}, {{HH:MM AM/PM}}, {{AGENT_AND_MODEL}}
```

### SQL

```sql
-- App: {{APPLICATION_NAME}}
-- File: {{FILE_NAME}}
-- Version: {{SEMVER}}
-- Task: {{TASK_ID}}
-- Turns: {{TURN_IDS}}
-- Author: AI Coding Agent ({{MODEL_NAME}})
-- Date: {{UTC_ISO8601}}
-- Description: {{DESCRIPTION}}
-- Log:
-- {{TASK_ID}}, {{TURN_ID}}, {{VERSION}}, {{YYYY/MM/DD}}, {{HH:MM AM/PM}}, {{AGENT_AND_MODEL}}
```

## 2. Semantic Versioning

Every file has its own version tracked in its metadata header.

| Change Type | Version Bump |
|---|---|
| New file created | `0.1.0` |
| Bug fix, refactor, internal change | PATCH |
| New feature added to file | MINOR |
| Breaking change to API or contract | MAJOR |

Append the current zero-padded turn id to the `Turns` field each time a file is modified.

## 3. Git Branch Naming

Primary format for this pipeline:

- `task/TXXX`


## 4. Commit Messages

Format:

```text
AI Coding Agent Change:
- Implement ...
- Add ...
- Update ...
```

Rules:

- Imperative mood only
- 3–5 bullets preferred
- Reference task and turn in supporting artifacts, not necessarily in commit subject

## 5. Git Tagging

Optional but recommended per task close:

```bash
git tag task/T${TASK_ID}
git push origin task/T${TASK_ID}
```

## 6. Code Quality Standards

- Write tests for new functionality, bug fixes, and refactoring
- TypeScript/JS: ESLint + Prettier
- Java: Checkstyle
- Python: Ruff + Black
- Document why, not what
- Remove dead code before committing

## 7. Security

Never commit:

- API keys, tokens, passwords, private keys
- database credentials
- OAuth secrets
- SSH private keys
- `.env` files with real values

## 8. Compliance Checklist

Before closing a task or committing work, verify:

- metadata headers present where required
- versions incremented on modified files
- task id and turn ids recorded correctly
- branch follows `task/TXXX` format
- tests written or updated
- linting passes
- no sensitive data committed
- ADR written for each turn
