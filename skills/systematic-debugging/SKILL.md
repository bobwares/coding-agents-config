---
name: systematic-debugging
description: Four-phase debugging methodology. Activate when investigating bugs, unexpected behavior, or errors. Forces root cause analysis before attempting fixes.
---

# Systematic Debugging

## The Four Phases

Never skip phases. Jumping to fixes without understanding root cause creates new bugs.

### Phase 1: Observe (What exactly is happening?)

```bash
# Capture the exact error
# - Full stack trace (not just the message)
# - Request/response if HTTP
# - Environment (dev vs prod, which browser, which OS)
# - Steps to reproduce
# - What changed recently: git log --oneline -10
```

Deliverable: A precise, reproducible description of the failure.

### Phase 2: Hypothesize (Why might this happen?)

Generate 3-5 hypotheses ranked by probability:
1. [Most likely] — [Evidence supporting it]
2. [Second] — [Evidence]
3. ...

Consider:
- Race conditions / async timing
- Null/undefined values at unexpected paths
- Type mismatches
- Environment differences
- Recent code changes
- Third-party API changes

Deliverable: A ranked list of hypotheses with supporting evidence.

### Phase 3: Test (Prove or disprove each hypothesis)

```typescript
// Add targeted logging — NOT random console.logs everywhere
console.log('[DEBUG users.service.create] input:', JSON.stringify(dto));
console.log('[DEBUG users.service.create] db result:', JSON.stringify(result));
```

Work through hypotheses top-down. For each:
- Write a minimal reproduction (unit test if possible)
- Test the hypothesis
- If disproved: move to next hypothesis
- If proved: proceed to Phase 4

Deliverable: The confirmed root cause.

### Phase 4: Fix (Address root cause, not symptoms)

```
Root cause confirmed: [description]

Fix strategy:
1. [Primary fix — addresses root cause]
2. [Guard — prevents recurrence]
3. [Test — confirms fix and prevents regression]
```

Write a failing test that reproduces the bug BEFORE applying the fix.
Apply the fix, confirm the test passes.

## Common Bug Patterns

### TypeScript "undefined is not an object"
- Check: is the value optional but used without a null check?
- Check: is an async function called without `await`?
- Check: is an array method returning `undefined` (`.find()` not `.findFirst()`)?

### Database Query Returns Nothing
- Verify the WHERE clause with `console.log` or Drizzle Studio
- Check if UUID is a string vs the DB stores it differently
- Check if the record actually exists: run the query in Drizzle Studio

### API Returns 401/403 Unexpectedly
- Check if the auth token is being sent in the request headers
- Check if the guard/middleware is applied at the right level
- Check if the token has expired

### React Component Not Re-rendering
- Check if the state is being mutated directly (should be immutable)
- Check if the key prop is stable (unstable keys cause full re-mounts)
- Check if React Query's `queryKey` is correctly invalidated after mutation

## Anti-Patterns

- Commenting out code until it "works" — find the root cause
- Adding more console.logs without a hypothesis
- Fixing the test instead of the implementation
- Changing multiple things at once — isolate the change
- Assuming the bug is in your code (could be a dependency)
