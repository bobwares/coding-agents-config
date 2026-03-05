# Analysis: spec-prd-parse

## Overview

`spec-prd-parse` is a Claude Code skill that transforms a Product Requirements Document (PRD) into a structured, ordered implementation epic. Its defining feature is **DDD (Domain-Driven Design) awareness**: when a machine-readable domain model exists at `.claude/domain/model.json` (produced by the upstream `spec-parse-ddd` skill), the generated epic aligns all task names, entity names, database table names, and module names with the ubiquitous language defined in that model. Without the domain model, it falls back to generating a standard 4-phase task breakdown from the PRD alone.

The skill sits at the center of the agentic pipeline, acting as the bridge between specification documents and code execution. It is invoked either manually (`/spec-prd-parse <name>`) or automatically by the `/execute` skill as Step 5a of the full one-command build pipeline. Its output — `epic.md` — is the single authoritative task plan consumed by `spec-epic-start`, `spec-task-next`, and the orchestrator agent.

---

## Key Findings

1. **Two-mode operation**: The skill explicitly branches on the presence of `model.json`. With a domain model it performs bounded-context-to-task mapping; without it, it generates generic phase-based tasks. This dual path is clean in design but the fallback path has no detailed guidance compared to the DDD-aligned path.

2. **Rigid 4-phase structure**: All epics are forced into Phase 1 (Foundation), Phase 2 (API), Phase 3 (Frontend), Phase 4 (Quality), regardless of the nature of the PRD. A docs-only or data-migration PRD would produce empty or inappropriate phases.

3. **Fixed agent assignments with no customization hooks**: Agent names (`drizzle-dba`, `nestjs-engineer`, `nextjs-engineer`, `test-writer`, `security-auditor`, `doc-generator`) are hardcoded in the task template. There is no mechanism to inject a different agent roster or skip an agent class for specialized projects.

4. **Spring is conditionally included but lightly specified**: The Phase 2 template mentions Spring (`T4+: spring-engineer`) only as a note with `if spring in stack`. There is no template task body showing what the spring task should contain, unlike the detailed NestJS task template.

5. **Task numbering contains a gap**: The template jumps from T2 to T3, T5, T6, T7, T9, T10, T11, T12 — `T4` and `T8` appear in the phase overview description but are never rendered in the output template. This will confuse agents that reference task IDs.

6. **No turn lifecycle steps**: Unlike `spec-epic-start` and `execute`, `spec-prd-parse` contains zero turn lifecycle (pre/post-execution) steps. It writes `epic.md` but does not write `pull_request.md`, `adr.md`, `manifest.json`, or update `turns_index.csv` — despite CLAUDE.md mandating these artifacts for any task that modifies files.

7. **Output path inconsistency**: The skill's Step 4 says write to `.claude/epics/<prd-name>/epic.md`, but the `/execute` skill (Step 5a) refers to the output as `specs/epics/<app-name>/epic.md`. These paths disagree, which will cause downstream skills to fail to locate the epic.

8. **PRD resolution is ordered but no validation**: Step 1 defines three lookup paths for the PRD file but there is no schema validation of the PRD content (unlike the `/execute` skill which validates for problem statement, user stories, and success criteria before proceeding).

9. **Domain model loading uses raw shell**: `cat .claude/domain/model.json 2>/dev/null || echo "NO_DOMAIN_MODEL"` is a fragile approach. There is no JSON parsing or field validation — the skill trusts the model to be well-formed and complete.

10. **`spec-parse-ddd` naming mismatch**: The skill file found at `.claude/skills/spec-parse-ddd/SKILL.md` has `name: ddd-parse` in its frontmatter, but the `/execute` skill invokes it as `spec-parse-ddd`. The `spec-prd-parse` skill also refers to the domain model produced by this skill without naming it explicitly, creating an implicit dependency on an inconsistently named upstream skill.

---

## Files Examined

| File | Purpose |
|------|---------|
| `.claude/skills/spec-prd-parse/SKILL.md` | Primary skill being analyzed |
| `.claude/skills/spec-parse-ddd/SKILL.md` | Upstream skill that produces `model.json` |
| `.claude/skills/spec-prd-new/SKILL.md` | Upstream skill that creates the PRD file |
| `.claude/skills/spec-prd-list/SKILL.md` | Sibling skill for listing PRDs and epic status |
| `.claude/skills/spec-epic-start/SKILL.md` | Downstream skill that reads epic.md |
| `.claude/skills/spec-task-next/SKILL.md` | Downstream skill for getting next task |
| `.claude/skills/execute/SKILL.md` | Full pipeline skill that invokes spec-prd-parse |
| `.claude/skills/governance/SKILL.md` | Governance rules for compliance |
| `.claude/agents/agent-orchestrator.md` | Orchestrator agent that executes tasks |
| `ai/agentic-pipeline/turns_index.csv` | Turn provenance log |

---

## Workflow

1. **Invocation**: User runs `/spec-prd-parse <prd-name>` (directly or via `/execute` Step 5a).

2. **PRD resolution**: The skill checks three paths in order — `.claude/prds/<name>.prd.md`, then `.claude/prds/<name>.md`, then the path directly. If none exists, it lists available PRDs and halts.

3. **Domain model check**: Runs `cat .claude/domain/model.json 2>/dev/null`. If the file exists (created by the prior `/spec-parse-ddd` run), DDD-aligned mode activates. If absent, standard mode proceeds.

4. **Technical scope analysis**: Reads the PRD and identifies which tech layers are needed (Database, NestJS API, Spring API, Next.js Frontend, AI Features, Testing) based on keyword matching against PRD content.

5. **Epic generation — DDD mode**: For each bounded context in `model.json`, it maps user stories to aggregates and generates phase-ordered tasks. Naming follows `model.json` exactly.

6. **Epic generation — standard mode**: Generates a generic 4-phase task breakdown without domain alignment.

7. **Output**: Writes the fully-specified `epic.md` to `.claude/epics/<prd-name>/epic.md`.

8. **Report**: Prints a summary to the user showing domain alignment status, bounded context count, task count by phase, and next-step instructions.

---

## Issues Identified

| # | Severity | Issue |
|---|----------|-------|
| 1 | **HIGH** | Task ID gap (T4 and T8 missing from template) — Spring and AI tasks silently dropped |
| 2 | **HIGH** | Output path disagreement with `/execute` (`.claude/epics/` vs `specs/epics/`) |
| 3 | **HIGH** | No turn lifecycle compliance — missing pull_request.md, adr.md, turns_index.csv |
| 4 | MEDIUM | `spec-parse-ddd` name mismatch (`name: ddd-parse` vs invocation) |
| 5 | MEDIUM | No PRD content validation before epic generation |
| 6 | MEDIUM | Non-DDD fallback path is underspecified |
| 7 | MEDIUM | No multi-epic support for complex PRDs |
| 8 | LOW | Completion criteria section is static |
| 9 | LOW | `createdAt` timestamp not sourced from defined variable |
| 10 | LOW | No idempotency protection — overwrites existing epic without warning |

---

## Recommendations

1. **Fix the T4/T8 task body gap**: Add explicit task templates for T4 (Spring endpoints) and T8 (AI features) within the epic.md template.

2. **Align output paths**: Standardize on `.claude/epics/` everywhere and update `/execute` Step 5a accordingly.

3. **Add minimal turn lifecycle**: Append to `turns_index.csv` and write `adr.md` when creating `epic.md`.

4. **Fix `spec-parse-ddd` name mismatch**: Change `name: ddd-parse` to `name: spec-parse-ddd` in the frontmatter.

5. **Add PRD content validation**: Verify PRD contains problem statement and user stories before generating epic.

6. **Flesh out non-DDD fallback path**: Add explicit guidance for inferring entity names from PRD text.

7. **Add idempotency guard**: Check for existing epic before overwriting.

8. **Inject actual timestamp**: Use `date -u +"%Y-%m-%dT%H:%M:%SZ"` for `createdAt`.

---

## Code Snippets

**Domain model loading (fragile shell):**
```bash
cat .claude/domain/model.json 2>/dev/null || echo "NO_DOMAIN_MODEL"
```

**DDD naming rules:**
```
- Database tables: use `tableName` from `model.json` exactly
- NestJS modules: named after the bounded context
- NestJS services: named after aggregates
- Next.js routes: use plural aggregate names
- TypeScript types: match entity names exactly
```

**Phase overview referencing T4/T8 (never rendered):**
```
Phase 2 — API Layer
- T3+: NestJS modules (nestjs-engineer)
- T4+: Spring endpoints (spring-engineer) — if spring in stack
- T5+: API integration tests (test-writer)

Phase 3 — Frontend
- T6+: Next.js pages (nextjs-engineer)
- T7+: UI components (nextjs-engineer)
- T8+: AI features (ai-engineer) — if AI in scope
```

---
Generated: 2026-02-25
Analyzed by: Explore agent
