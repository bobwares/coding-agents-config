---
name: project-create-plan
description: "Create a human-readable implementation plan from PRD, DDD, and tech stack inputs. Planning only; no code/config implementation."
---

# Project Create Plan

You create a planning package for implementing a project from:
- PRD
- DDD
- Tech stack

This skill is planning-only.

## Hard Constraints

- Do not implement source code.
- Do not create or modify runtime/build/test configuration.
- Do not write any file under `.claude/`.
- Write all outputs only under `specs/plan/version-{{#}}/`.
- Every run must create a new version directory.

## Inputs

Resolve inputs from either explicit arguments or defaults:
- PRD: `specs/spec-prd.md`
- DDD: `specs/spec-ddd.md`
- Tech stack: `specs/spec-tech-stack.md`

If any input file is missing, stop and report exactly what is missing.

## Step 1: Validate Inputs

Read all input files and validate minimum content:
- PRD has problem, users/use-cases, success criteria.
- DDD has bounded contexts, entities/aggregates, relationships.
- Tech stack has frontend/backend/data/infrastructure choices.

If validation fails, stop and return a concise validation report.

## Step 2: Create New Plan Version

Create a new output directory with monotonic versioning.

Algorithm:
1. Ensure `specs/plan/` exists.
2. Find existing directories matching `version-*`.
3. Parse numeric suffixes.
4. New version = max(existing) + 1; if none, start at `1`.
5. Create `specs/plan/version-{{new_version}}/`.

## Step 3: Generate Human-Readable Plan Docs

Write only these files under the new version directory:
- `00-summary.md`: project overview, goals, constraints, assumptions.
- `01-architecture-plan.md`: bounded contexts, module boundaries, data flow, integration points.
- `02-implementation-phases.md`: phased rollout plan, milestones, dependencies.
- `03-work-breakdown.md`: concrete task list by phase with owner-role suggestions and estimates.
- `04-risk-register.md`: technical/product risks, impact, mitigation, contingency.
- `05-validation-strategy.md`: test strategy, quality gates, acceptance criteria.
- `06-delivery-checklist.md`: executable checklist for implementation readiness.
- `manifest.md`: version metadata, source inputs used, generation timestamp, file inventory.

Conditional outputs:
- If the app has a UI, include `07-wireframes.md` with human-readable page/screen wireframes.
- Include `08-selected-patterns.md` with architecture/design patterns selected from the PRD, DDD, and tech stack.
- If the app has an API, include `09-api-contracts.md` with human-readable API contracts (endpoints, request/response shapes, error model).

All documents must be actionable and readable by humans; avoid tool-specific internal jargon where possible.

## Step 4: Output Contract

Return:
- Created version directory path.
- List of files written.
- One-paragraph summary of the plan.
- Explicit statement: "No source code/configuration files were created or modified."

## Refusal Conditions

Refuse and stop if the request asks for any of:
- code generation,
- configuration edits,
- writing outside `specs/plan/version-{{#}}/`,
- writing to `.claude/`.
