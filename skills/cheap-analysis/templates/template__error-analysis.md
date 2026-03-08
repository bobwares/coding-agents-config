Title: Error Analysis — <topic>

Generated: <YYYY-MM-DD>
Turn: <turn-number-or-N/A>
Branch: <branch-name-or-N/A>

---

1. Classification
Primary: ERROR/STACKTRACE
Secondary: <optional>

2. Executive Summary
- What is failing:
- Where it fails (component/file):
- Why it fails (most likely cause):
- Immediate next actions (top 1–3):

3. Error Signature
- Error code / status:
- Canonical message:
- Exception type:
- Stack trace present: true|false
- Affected surface area (endpoint/job/cli):

4. Reproduction (if applicable)
- Preconditions:
- Steps:
- Expected:
- Actual:

5. Failure Point and Call Chain
- Top failing frame:
- First application-owned frame:
- Call path (short):

6. Evidence
Files and references:
- <path>:<line-range> — <what it shows>
- <path>:<line-range> — <what it shows>

Searches performed:
Glob patterns:
- <pattern>

Grep queries:
- <query>

7. Likely Root Cause
- Direct cause:
- Contributing factors:
- Why it was not caught earlier (tests/validation/monitoring):

8. Fix Options (conceptual, no patch here)
Option A (minimal):
- Change summary:
- Risk:

Option B (robust):
- Change summary:
- Risk:

9. Validation Plan
- Tests to add/update:
- Observability checks:
- Rollout notes:

10. Open Questions / Missing Info
- <only if needed>
