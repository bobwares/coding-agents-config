---
name: test-and-fix
description: Run tests, identify failures, and iteratively fix them until all pass. Max 5 fix iterations.
disable-model-invocation: false
---

# Test and Fix

## Initial Run

```bash
pnpm test --run 2>&1 | tail -50
```

## Fix Loop (max 5 iterations)

For each failing test:

1. **Read the failing test** — understand what it expects
2. **Read the implementation** — understand what it does
3. **Identify root cause**:
   - TypeScript error? Fix types first
   - Import error? Fix path/module
   - Assertion failure? Fix the implementation logic
   - Mock not working? Fix the mock setup

4. **Fix the implementation** (never fix the test to match broken behavior)

5. **Re-run affected tests**:
```bash
pnpm test --run <test-file-path> 2>&1 | tail -20
```

6. If still failing: repeat from step 1 with new information

## Stop Conditions

- ✅ All tests pass → report success
- ❌ After 5 iterations, still failing → report:
  - What was tried
  - Current failure output
  - Hypothesis for why it's still failing
  - Ask user for guidance

## Fix Priority

1. TypeScript/import errors (cause cascading failures)
2. Mock/setup errors (affect multiple tests)
3. Logic errors (specific to one test)

## Rule

Never delete or skip tests. Never change an assertion to match broken behavior. Tests define the contract — the implementation must satisfy the contract.
