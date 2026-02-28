---
name: verify-app
description: Full quality gate. Runs TypeScript check, lint, tests, build, and Java tests. Spawns the right agent to fix any failures. Always run before creating a PR.
model: claude-haiku-4-5
allowed-tools: Bash, Read, Task
---

# Verify App — Quality Gate

Run the full verification suite and fix any failures.

## Verification Suite

```bash
# 1. TypeScript
pnpm typecheck 2>&1 | tail -20

# 2. Lint
pnpm lint 2>&1 | tail -20

# 3. TypeScript Tests
pnpm test --run 2>&1 | tail -30

# 4. Build
pnpm build 2>&1 | tail -20

# 5. Java Compile + Tests (if api/ exists)
test -f api/pom.xml && mvn -f api/pom.xml clean test 2>&1 | tail -30

# 6. Java Compile + Tests (if services/enterprise/ exists)
test -f services/enterprise/pom.xml && mvn -f services/enterprise/pom.xml clean test 2>&1 | tail -30
```

## Java Test Requirements

**IMPORTANT**: Java tests MUST be run as part of verification. Never skip tests with `-DskipTests`.

If Java tests don't exist:
1. Spawn `test-writer` agent with prompt: "Create unit and integration tests for Java services"
2. Wait for tests to be created
3. Re-run verification

## Failure Routing

| Failure Type | Agent to Spawn |
|-------------|---------------|
| TypeScript errors in `app/web/` | `nextjs-engineer` |
| TypeScript errors in `app/api/` | `nestjs-engineer` |
| TypeScript errors in `packages/database/` | `drizzle-dba` |
| Java compile errors | `spring-engineer` |
| Java test failures | `test-writer` with Java context |
| TypeScript test failures | `test-writer` |
| Lint errors | Relevant engineer based on file path |
| Build failures | `code-architect` to diagnose |

## Report Format

```
VERIFICATION REPORT
===================
TypeScript:     ✅ PASS | ❌ FAIL — N errors
Lint:           ✅ PASS | ❌ FAIL — N warnings
TS Tests:       ✅ PASS | ❌ FAIL — N/N passed
Build:          ✅ PASS | ❌ FAIL
Java Compile:   ✅ PASS | ❌ FAIL | ⏭️ SKIPPED (no pom.xml)
Java Tests:     ✅ PASS | ❌ FAIL — N/N passed | ⏭️ SKIPPED

OVERALL: ✅ READY TO SHIP | ❌ NEEDS FIXES
```

If all pass: "Verification complete. Ready for `/git-commit-push-pr`."
If any fail: spawn the appropriate agent, wait for fix, re-run verification.

## Pre-PR Checklist

Before creating a PR, ensure:
- [ ] All TypeScript types check
- [ ] All lint rules pass
- [ ] All TypeScript tests pass
- [ ] All Java tests pass (if Java code exists)
- [ ] Build succeeds
- [ ] No `// @ts-ignore` or `@SuppressWarnings` without justification
