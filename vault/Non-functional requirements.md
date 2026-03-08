https://chatgpt.com/c/69a777f1-5eac-8330-8e6f-b525518c24a5


Put it in your Claude Code workflow by treating it as (1) a canonical policy doc, (2) an always-on instruction in CLAUDE.md, and (3) one or more “verification” skills/agents that produce enforceable artifacts (checklists, acceptance gates, ADR exceptions).

1. Make it a canonical policy document in every repo

Add a stable path that agents can always find:

* docs/standards/NFR_BASELINE.md  (the spec you wrote)
* docs/standards/NFR_CHECKLIST.md  (a short, testable checklist derived from the spec)
* docs/standards/NFR_EXCEPTIONS.md  (optional index of ADR links that waive MUST items)

Reason: Claude can reliably reference these paths across projects, and you can diff/track changes.

2. Wire it into CLAUDE.md as a non-optional gate

In your repo root CLAUDE.md, add a small “Global Non-Functional Requirements” section that does three things:

* Declares NFR_BASELINE.md as authoritative.
* Requires the agent to apply it to every plan and implementation.
* Requires concrete outputs (dashboards/runbooks/checklist) or an ADR exception.

Example wording you can paste into CLAUDE.md (adjust paths to your repo):

Global Non-Functional Requirements (Mandatory)

* Authoritative spec: docs/standards/NFR_BASELINE.md
* For every new service/app/job/UI, you must:

    * Implement or explicitly waive each MUST via an ADR.
    * Produce docs/ops/runbook.md and docs/ops/slo.md (or equivalent) before declaring “production-ready”.
    * Maintain docs/standards/NFR_CHECKLIST.md status for the project (pass/fail with notes).
* If a requirement is not implemented: create docs/adrs/ADR-####-nfr-exception-<topic>.md with rationale, risk, mitigations, and review/sunset date.

3. Convert the spec into “skills” that Claude can run repeatedly

Create two skills: one to generate the project-specific NFR plan, and one to verify compliance before merge/release.

Skill A: nfr-plan
Purpose: Turn NFR_BASELINE.md into project-specific deliverables and tasks.
Inputs:

* app type (api, worker, ui, monolith), deployment target (k8s, serverless, vm), envs
  Outputs (files the skill writes/updates):
* docs/ops/slo.md (SLIs/SLOs, error budget policy)
* docs/ops/runbook.md (alerts, remediation, deploy/rollback)
* docs/ops/observability.md (metrics/logging/tracing implementation notes)
* docs/standards/NFR_CHECKLIST.md (populated with project evidence links)

Skill B: nfr-verify
Purpose: Enforce that the repo contains evidence for each MUST item.
Inputs:

* repo tree + config files + docs
  Outputs:
* A short “NFR Compliance Report” (pass/fail per section)
* A list of required changes (code + config + docs)
* ADR prompts for anything missing but intentionally deferred

How this maps to Claude Code: skills are best when they always emit the same artifacts and are easy to diff. The checklist becomes your enforcement mechanism.

4. Introduce lightweight “agents” (roles) that run in a fixed order

You can keep it simple with 3 roles, even if it’s the same model:

* Architect/Planner: runs nfr-plan during initial design and whenever scope changes.
* Implementer: builds features but must not merge without nfr-verify passing.
* Ops/Reviewer: runs nfr-verify and blocks if any MUST items lack evidence or ADR.

In your workflow, this becomes a repeatable gate:

* Turn start: nfr-plan (if new app or major change)
* Before PR: nfr-verify
* If fail: either implement missing items or write ADR exception

5. Make the NFR checklist machine-usable (so agents can be strict)

Format NFR_CHECKLIST.md as a table with columns like:

* Requirement ID (e.g., OBS-1, LOG-3, OPS-2)
* Requirement (short)
* Evidence (file/link/metric name)
* Status (PASS/FAIL/WAIVED)
* Notes
* ADR Link (if WAIVED)

This lets Claude verify quickly and consistently. It also makes “definition of done” unambiguous.

6. Add “default deliverable paths” so every project looks the same

Standardize the outputs across projects so your agents don’t have to guess:

* docs/ops/slo.md
* docs/ops/runbook.md
* docs/ops/alerts.md (optional if separated)
* docs/ops/dashboards.md (links + what panels exist)
* docs/ops/oncall.md (ownership/escalation)
* docs/standards/NFR_CHECKLIST.md
* docs/adrs/ADR-####-nfr-exception-*.md (only when needed)

7. Add enforcement rules to your PR workflow

Even without custom tooling, you can make Claude treat these as hard gates:

* “No production-ready claim unless nfr-verify passes or items are waived by ADR.”
* “Any new dependency requires: timeouts, retries policy, tracing spans, and metrics.”
* “Any new API route must have: golden-signal metrics + structured logs + trace propagation.”

If you do have CI, you can later add a simple script to assert the presence of required files, but even purely agent-driven enforcement works if CLAUDE.md is explicit.

If you want, paste your current CLAUDE.md (or the relevant sections) and I’ll rewrite it to incorporate this NFR policy, plus draft the two skill definitions (nfr-plan, nfr-verify) in the exact structure your Claude Code setup expects.
