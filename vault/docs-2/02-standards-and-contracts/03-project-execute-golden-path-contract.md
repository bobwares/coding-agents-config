# Project Execute Golden Path Contract

Generated: 2026-02-28
Status: Active

## Purpose

Define a strict, deterministic contract for `/project-execute` so a new repository can be generated from specs in one command.

## Required Inputs

- `specs/spec-prd.md`
- `specs/spec-ddd.md`
- `specs/spec-tech-stack.md`

Optional input:

- `specs/spec-wireframe.md`

Equivalent explicit invocation:

```text
/project-execute prd=specs/spec-prd.md ddd=specs/spec-ddd.md stack=specs/spec-tech-stack.md wireframe=specs/spec-wireframe.md
```

## One-Turn Success Criteria

A run is successful only if all are true:

1. Preflight passes.
2. `project-init` completes.
3. `spec-parse-ddd` outputs `.claude/domain/model.json`.
4. `spec-planning` writes plan docs under `specs/plan/`.
5. `spec-prd-parse` writes at least one epic under `.claude/epics/`.
6. At least one epic executes via orchestrator.
7. `verify-all` passes after implementation.
8. Turn artifacts exist:
   - `session_context.md`
   - `pull_request.md`
   - `adr.md`
   - `manifest.json`
   - updated `turns_index.csv`

## Preflight Contract

`project-execute-preflight.sh` MUST validate:

- Required files exist and are non-empty.
- PRD/DDD/stack minimum sections are present.
- Tech stack tokens are valid.
- Required skills and agents are available.
- Required templates are resolvable.
- Git state supports branch workflow (remote optional).

## Environment Resolution Rules

- Skills path: `./skills` first, then `$HOME/.claude/skills`
- Agents path: `./agents` first, then `$HOME/.claude/agents`
- Templates path order:
  1. `./.claude/templates`
  2. `./templates`
  3. `$HOME/.claude/templates`

## Fresh-Repo Git Rules

`/project-execute` must work when:

- no `origin` exists yet
- only local branches exist

In local-only runs:

- create local turn/epic branches
- skip push/tag push steps gracefully
- still complete turn artifacts and local verification

## Failure Contract

On failure, the command must return:

- exact failing step
- exact command/check that failed
- exact file/path involved
- next manual fix action

No vague "execution failed" responses.
