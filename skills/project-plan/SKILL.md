---
name: project-plan
description: Compatibility planner entry point. Generates planning docs and epic(s) from PRD + DDD + stack without implementation.
---

# Project Plan

Use this command to generate planning artifacts and epic definitions without executing implementation.

## Inputs

Defaults:

- PRD: `specs/spec-prd.md`
- DDD: `specs/spec-ddd.md`
- Stack: `specs/spec-tech-stack.md`

Accepted invocation:

```text
/project-plan
/project-plan prd=specs/spec-prd.md ddd=specs/spec-ddd.md stack=specs/spec-tech-stack.md
```

## Workflow

1. Validate input files exist.
2. Run `/spec-planning` with the resolved paths.
3. Run `/spec-prd-parse` to produce epic file(s).
4. Report generated plan and epic paths.

## Output

- Planning docs under `specs/plan/`
- Epic file(s) under `.claude/epics/`

This skill does not execute implementation tasks.
