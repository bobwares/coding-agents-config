---
name: security-scan
description: >-
  Run a security audit on changed files or the full codebase.
  Spawns the security-auditor agent.
  Arguments: scope (optional, e.g., "auth module" or "full").
disable-model-invocation: false
---

# Security Scan

Scope: $ARGUMENTS

## Determine Scope

If $ARGUMENTS is provided: focus on that scope.
Otherwise: scan all files changed since branching from main.

```bash
git diff --name-only main..HEAD 2>/dev/null || git diff --name-only HEAD~5..HEAD
```

## Quick Automated Checks

Run these before spawning the agent:

```bash
# Check for hardcoded secrets
grep -r "password\s*=\s*['\"']" --include="*.ts" --include="*.java" -l . 2>/dev/null | grep -v ".test." | grep -v node_modules
grep -r "apiKey\s*:\s*['\"']" --include="*.ts" -l . 2>/dev/null | grep -v node_modules
grep -r "Bearer\s\+[A-Za-z0-9]" --include="*.ts" -l . 2>/dev/null | grep -v ".test." | grep -v node_modules

# Check .env is gitignored
grep -q "^\.env" .gitignore 2>/dev/null && echo ".env: gitignored ✅" || echo ".env: NOT gitignored ❌"

# Check for common vulnerabilities
grep -r "dangerouslySetInnerHTML" --include="*.tsx" -l . 2>/dev/null
grep -r "eval(" --include="*.ts" --include="*.js" -l . 2>/dev/null | grep -v node_modules
```

## Spawn Security Auditor

Invoke the `security-auditor` agent with:
- The list of files to review
- Any findings from the automated checks above
- Instruction to apply OWASP Top 10 checklist

## Report

Present the security-auditor's findings with severity levels. For critical findings: "These must be resolved before creating a PR."
