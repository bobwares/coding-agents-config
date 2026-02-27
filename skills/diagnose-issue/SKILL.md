---
name: diagnose-issue
description: Diagnose a problem, generate a structured issue.md in the current turn directory, and optionally proceed to resolution.
triggers:
  - when the user reports a bug or error
  - when investigating unexpected behavior
  - when asked to diagnose or analyze a problem
---

# Diagnose Issue

Input: Problem description via $ARGUMENTS

Output: `issue.md` in current turn directory (`./ai/agentic-pipeline/turns/turn-${TURN_ID}/issue.md`)

---

## Step 1: Identify Current Turn Directory

```bash
TURN_DIR=$(ls -td ./ai/agentic-pipeline/turns/turn-* | head -1)
echo "Turn directory: $TURN_DIR"
```

---

## Step 2: Gather Evidence

Before diagnosing, collect all relevant information:

### Observe the Problem

1. **Capture exact error messages** — full stack traces, not summaries
2. **Identify reproduction steps** — what triggers the issue?
3. **Note environment context** — dev/prod, browser, OS, Node version
4. **Check recent changes** — `git log --oneline -10`
5. **Search for related patterns** — grep for error messages in codebase

### Collect Context

- Related source files
- Configuration that may be involved
- Dependencies that interact with the affected area
- Logs, network responses, or database state if relevant

---

## Step 3: Generate Hypotheses

Develop 3-5 ranked hypotheses for the root cause:

| Rank | Hypothesis | Evidence | Likelihood |
|------|------------|----------|------------|
| 1 | Most likely cause | What points to this? | High / Medium / Low |
| 2 | Second possibility | What points to this? | High / Medium / Low |
| 3 | Alternative | What points to this? | High / Medium / Low |

Consider common patterns:
- **Async/timing issues** — race conditions, missing `await`
- **Null/undefined** — optional values used without guards
- **Type mismatches** — string vs number, wrong schema
- **Environment** — missing env vars, config differences
- **State management** — stale state, incorrect cache invalidation
- **API contracts** — request/response shape changes
- **Dependencies** — version conflicts, breaking changes

---

## Step 4: Develop Resolution Plan

For the most likely hypothesis, create a concrete fix plan:

1. **Verification step** — how to confirm this is the root cause
2. **Primary fix** — the code change that addresses root cause
3. **Guard/prevention** — changes to prevent recurrence
4. **Test coverage** — tests that catch this regression

---

## Step 5: Write issue.md

Create the diagnostic report in the turn directory:

```markdown
# Issue: [Brief Title]

**Reported**: [timestamp]
**Turn**: [TURN_ID]
**Status**: Diagnosed — Awaiting Resolution Approval

---

## Problem Statement

[The original problem description from the user]

## Observed Symptoms

- [Symptom 1 — exact error message or behavior]
- [Symptom 2]
- [Symptom 3]

## Environment

| Attribute | Value |
|-----------|-------|
| Branch | [current branch] |
| Node | [version] |
| OS | [darwin/linux/windows] |
| Last commit | [sha + message] |

## Evidence Collected

### Error Details
[Full stack trace or error output]

### Related Files
| File | Relevance |
|------|-----------|
| [path] | [why this file matters] |

### Recent Changes
```
[git log output]
```

---

## Diagnosis

### Root Cause Analysis

**Primary hypothesis**: [Most likely cause]

[Detailed explanation of why this is the likely root cause, with supporting evidence]

### Alternative Hypotheses

| Rank | Hypothesis | Evidence | Likelihood |
|------|------------|----------|------------|
| 2 | [Alternative cause] | [Evidence] | [Likelihood] |
| 3 | [Alternative cause] | [Evidence] | [Likelihood] |

---

## Resolution Plan

### Verification

- [ ] [How to confirm the root cause before fixing]

### Fix Steps

1. **[Step 1]** — [Description]
   - File: `[path]`
   - Change: [What to modify]

2. **[Step 2]** — [Description]
   - File: `[path]`
   - Change: [What to modify]

### Prevention

- [ ] [Guard or validation to prevent recurrence]
- [ ] [Test to catch regression]

### Affected Files

| File | Change Type |
|------|-------------|
| [path] | modify / create / delete |

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| [Potential risk of the fix] | [How to mitigate] |

---

## Estimated Effort

| Phase | Effort |
|-------|--------|
| Verification | [time estimate] |
| Implementation | [time estimate] |
| Testing | [time estimate] |
```

---

## Step 6: Ask for Resolution Approval

After writing `issue.md`, use AskUserQuestion:

```
The issue has been diagnosed and documented in:
  ${TURN_DIR}/issue.md

Summary:
- **Problem**: [one-line summary]
- **Root Cause**: [one-line diagnosis]
- **Files to change**: [count] files

Would you like to proceed with the resolution plan?
```

Options:
1. **Yes, proceed** — Execute the resolution plan
2. **Review first** — I'll examine the issue.md before deciding
3. **Modify plan** — Adjust the approach before proceeding
4. **Not now** — Save the diagnosis for later

---

## If User Approves Resolution

Spawn the appropriate specialist agent(s) based on the affected files:

| File Pattern | Agent |
|--------------|-------|
| `app/web/**` | `nextjs-engineer` |
| `app/api/**` | `nestjs-engineer` |
| `services/enterprise/**` | `spring-engineer` |
| `packages/database/**` | `drizzle-dba` |
| `*.test.ts`, `*.spec.ts` | `test-writer` |

After fix:
1. Run `verify-app` agent
2. Update issue.md status to "Resolved"
3. Complete turn post-execution artifacts
