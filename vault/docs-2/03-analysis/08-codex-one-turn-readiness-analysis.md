# Codex Analysis: One-Turn App Generation Readiness

Generated: 2026-02-28
Repository: `coding-agents-config`
Scope: Assess whether this repository can reliably support the flow: create a new repo -> add specs (PRD, DDD, tech stack, wireframe) -> run `/project-execute` once -> get a working app.

## Executive Verdict

**Short answer: no, not in its current state.**

The current implementation is not yet one-turn reliable. There are multiple hard blockers that will stop execution before code generation completes, plus several design gaps that make success in a fresh repo unlikely.

## High-Level Readiness Score

- **Current branch readiness (`feature/config-init-setup`, working tree as-is): 10/100**
- **If deleted agent/hook files were restored but logic stayed the same: 35/100**

## Why It Fails Today (Critical Path)

### 1) Agent/hook runtime is missing in the current working tree

The pipeline depends on orchestrator + specialist agents and hook scripts, but the directories are currently empty in the working tree:

- `find agents -maxdepth 1 -type f | wc -l` -> `0`
- `find hooks -maxdepth 1 -type f | wc -l` -> `0`

Git still tracks these paths (`git ls-files` shows 13 agent files and 5 hook files), but they are currently deleted locally. With no agent definitions present, steps that require spawning `orchestrator`, `git-guardian`, `verify-app`, etc. are blocked.

## Pipeline Logic Blockers (Even If Files Are Restored)

### 2) `/project-execute` is not actually self-contained end-to-end

`skills/project-execute/SKILL.md` claims one-command full build (`skills/project-execute/SKILL.md:2-10`), but Step 5 requires pre-existing epics:

- Expects `.claude/epics/<app-name>/epic.md` and tells user to run `/project-plan` if missing (`skills/project-execute/SKILL.md:159-162`)
- `skills/project-plan/` exists but contains no `SKILL.md` (empty directory), so that fallback command is unavailable

Result: in a brand-new repo with only specs, `/project-execute` stops before implementation.

### 3) Execute flow does not call required planning/epic generation steps

`docs/README-skills.md` says `project-execute` should run:

- `/spec-planning` (`docs/README-skills.md:447`)
- `/spec-prd-parse` (`docs/README-skills.md:448`)

But current `skills/project-execute/SKILL.md` does neither. It jumps from DDD parse to "execute existing epics" (`skills/project-execute/SKILL.md:144-173`).

Result: docs promise one-turn automation, but skill behavior requires manual pre-work.

### 4) Command and skill-name mismatches

There are invocation mismatches that can break routing:

- `project-execute` examples use `/execute` instead of `/project-execute` (`skills/project-execute/SKILL.md:19`, `skills/project-execute/SKILL.md:435`)
- `spec-parse-ddd` directory name does not match frontmatter `name` (`skills/spec-parse-ddd/SKILL.md:2` is `ddd-parse`)
- `github-issue` directory name does not match frontmatter `name` (`skills/github-issue/SKILL.md:2` is `fix-issue`)

Result: command dispatch can fail or behave inconsistently across environments.

### 5) `.claude` path assumptions conflict with repo layout/setup

Many skills/settings reference project-local `.claude/...` paths:

- Hooks in settings call `$(pwd)/.claude/hooks/...` (`settings.json:81`, `settings.json:86`, `settings.json:108`)
- `project-execute` references `.claude/templates/...` (`skills/project-execute/SKILL.md:191`, `skills/project-execute/SKILL.md:205`, `skills/project-execute/SKILL.md:220`)

But this repo stores templates at `templates/...` and setup only symlinks `skills`, `agents`, `rules`, `hooks`, `CLAUDE.md`, `settings.json` to `~/.claude` (`scripts/setup.sh:10`, `scripts/setup.sh:47-49`) - **not** `templates`.

Also, this repository currently has no `.claude` directory at root.

Result: turn artifact templating/hook paths are brittle in new repos unless additional hidden bootstrap steps exist.

### 6) Fresh-repo git assumptions are too strict for one-turn bootstrap

`project-execute` requires:

- `git checkout main`
- `git pull origin main`
- branch push/tag push (`skills/project-execute/SKILL.md:120-125`, `skills/project-execute/SKILL.md:243-245`)

In a newly created repo, `origin` may not exist yet, or `main` may not be initialized remotely.

Result: pipeline can fail before scaffolding in common first-run scenarios.

## Fit Against Your Stated Input Flow

Your flow includes four specs: PRD, DDD, tech stack, wireframe.

Observed support:

- PRD: supported (validated in execute)
- DDD: supported
- Tech stack: supported
- Wireframe: **not treated as required input** in `project-execute` and not parsed as an explicit file input

`spec-planning` can generate wireframes from PRD (`skills/spec-planning/SKILL.md`), but the provided wireframe file is not part of current execute input validation or pipeline handoff.

## Step-by-Step Readiness Matrix

| Flow Step | Expected | Current State | Status |
|---|---|---|---|
| Create new repo | Minimal assumptions | Requires `origin/main` pull + push early | BLOCKED/FRAGILE |
| Copy specs | PRD, DDD, stack, wireframe consumed | Wireframe not explicitly consumed | PARTIAL |
| Run `/project-execute` | One command completes whole build | Requires pre-existing epic + missing `/project-plan` | BLOCKED |
| Parse DDD | Invoke correct parser | Name mismatch (`spec-parse-ddd` vs `ddd-parse`) | FRAGILE |
| Generate epics | Automated inside execute | Not done by current execute flow | BLOCKED |
| Execute epics | Spawn orchestrator/agents | Agents deleted in current tree | BLOCKED |
| Post-turn artifacts | Template-backed outputs | Path assumptions mismatch (`.claude/templates`) | FRAGILE |

## Additional Drift Signals

- README structure advertises populated `agents/` and `hooks/` (`README.md:67-85`), but current working tree has none.
- README says skills/agents are globally available (`README.md:55`), but `setup.sh` links only `agents` into `~/.codex` (`scripts/setup.sh:54`), not skills/rules/hooks for Codex.

## What Must Be Fixed for One-Turn Success

### Priority 0 (must-fix hard blockers)

1. Restore missing runtime files in current branch (`agents/*`, `hooks/*`) or commit/rebase to a state where they exist.
2. Make `project-execute` truly self-contained:
   - run planning + epic generation internally (`spec-planning` + `spec-prd-parse`), or
   - implement `project-plan` skill and ensure it is callable.
3. Fix skill naming and invocation consistency:
   - `spec-parse-ddd` frontmatter name
   - `github-issue` frontmatter name
   - canonicalize `/project-execute` vs `/execute`.

### Priority 1 (stability and first-run UX)

4. Remove hard dependency on `origin/main` for first-run local repos; only push when remote exists.
5. Normalize path model (`.claude/...` vs repo-root paths) and ensure template paths are resolvable in fresh repos.
6. Add explicit wireframe input support (e.g., `wireframe=specs/spec-wireframe.md`) and pass it downstream.

### Priority 2 (confidence and maintainability)

7. Add a preflight command in `project-execute` that checks:
   - required files
   - required skills/agents present
   - remote branch availability
   - path/template availability
   and prints actionable fixes.
8. Add an automated "dry run" integration test on a temp repo that exercises exactly your target flow.

## Recommended Minimal Golden Path (After Fixes)

Target behavior for a true one-turn run:

1. User drops files in `specs/`:
   - `spec-prd.md`
   - `spec-ddd.md`
   - `spec-tech-stack.md`
   - `spec-wireframe.md` (optional but supported)
2. User runs `/project-execute`
3. Skill performs:
   - preflight checks
   - scaffold (`project-init`)
   - parse DDD (`spec-parse-ddd`)
   - planning (`spec-planning`)
   - epic generation (`spec-prd-parse`)
   - orchestrated implementation
   - verify-all
   - commit/PR only if remote exists (otherwise local checkpoint)
4. Final report with explicit pass/fail per phase.

## Bottom Line

You have a strong concept and most building blocks, but the current repo state and execution wiring will not reliably generate a full application in one turn from a fresh repo.

To answer your question directly: **it will not work end-to-end right now** for the flow you described.
