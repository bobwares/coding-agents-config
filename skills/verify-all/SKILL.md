---
name: verify-all
description: >-
  Run the full quality gate: TypeScript, lint, tests, and build. Required before every PR.
  Spawns the right agent to fix failures.
disable-model-invocation: false
---

# Verify All — Quality Gate

## Run Verification Suite

Execute in order (stop and report each result before continuing):

### 1. TypeScript
```bash
pnpm typecheck 2>&1 | tail -30
```

### 2. Lint
```bash
pnpm lint 2>&1 | tail -20
```

### 3. Tests
```bash
pnpm test --run 2>&1 | tail -40
```

### 4. Build
```bash
pnpm build 2>&1 | tail -20
```

### 5. Java Build (if services/enterprise exists)
```bash
test -f services/enterprise/pom.xml && mvn -f services/enterprise/pom.xml clean package -DskipTests -q 2>&1 | tail -10 || echo "No Java project found"
```

## Report

```
VERIFICATION REPORT
===================
TypeScript:  ✅ PASS | ❌ FAIL (N errors)
Lint:        ✅ PASS | ❌ FAIL (N issues)
Tests:       ✅ PASS | ❌ FAIL (N/N)
Build:       ✅ PASS | ❌ FAIL
Java Build:  ✅ PASS | ❌ FAIL | ⏭️ SKIPPED

OVERALL: ✅ READY TO SHIP | ❌ NEEDS FIXES
```

## Fix Failures

Route failures to the right agent:
- TypeScript errors in `app/web/` → spawn `nextjs-engineer`
- TypeScript errors in `app/api/` → spawn `nestjs-engineer`
- TypeScript errors in `app/packages/database/` → spawn `drizzle-dba`
- Java errors → spawn `spring-engineer`
- Test failures → spawn `test-writer`
- Lint errors → spawn the engineer matching the failing file path
- Build failures → spawn `code-architect` to diagnose

After fixing, re-run verification until all pass.

When all pass: "Verification complete. Ready for `/git-commit-push-pr`."
