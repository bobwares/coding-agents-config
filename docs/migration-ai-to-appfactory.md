# Migration Analysis: `ai/` to `.appfactory/`

**Date:** 2026-04-06  
**Status:** EXECUTED - 2026-04-07  
**Author:** AI Coding Agent (claude-opus-4-5-20251101)

## Execution Summary

Migration executed on 2026-04-07T00:11:18Z in task/T002 turn-004.

### Data Migration
- Moved `ai/agentic-pipeline/tasks/` to `.appfactory/tasks/`
- Moved `ai/agentic-pipeline/tasks_index.csv` to `.appfactory/tasks_index.csv`
- Moved `ai/prompts/` to `.appfactory/prompts/`
- Moved `ai/changelog.md` to `.appfactory/changelog.md`
- Created `.appfactory/specs/` and `.appfactory/memory/`
- Archived legacy turns to `archive/legacy-turns/`
- Removed `ai/` directory

### Files Updated
- `CLAUDE.md` - Updated all path references
- `README.md` - Updated structure documentation
- `skills/task-init/SKILL.md` - Updated paths
- `skills/task-init/scripts/get-next-task-id.sh` - Updated paths
- `skills/turn-init/SKILL.md` - Updated paths
- `skills/turn-init/scripts/get-next-turn-id.sh` - Updated paths
- `skills/turn-end/SKILL.md` - Updated paths
- `skills/task-close/SKILL.md` - Updated paths
- `skills/session-start/turn-tracking-context.md` - Updated paths
- `skills/session-start/adr-context.md` - Updated paths
- `skills/session-start/scripts/get-next-task-id.sh` - Updated paths
- `skills/af-project-init/SKILL.md` - Updated paths
- `skills/af-project-init/scripts/init-appfactory-project.sh` - Updated paths
- `skills/af-be-build-prd/SKILL.md` - Updated paths
- `skills/af-be-build-ddd/SKILL.md` - Updated paths
- `skills/af-be-build-dsl/SKILL.md` - Updated paths
- `skills/af-be-build-dsl/templates/domain-dsl-template.yaml` - Updated paths
- `skills/af-be-build-plan/SKILL.md` - Updated paths
- `skills/af-be-build-plan/templates/execution-plan-template.md` - Updated paths
- `skills/af-be-build-implementation/SKILL.md` - Updated paths
- `agents/agent-architecture-planner.md` - Updated paths
- `memory/MEMORY.md` - Updated paths

---

---

## Section 1: Current `ai/` Assumptions

The system currently uses `ai/` for **two distinct purposes**:

### 1.1 Task/Turn Pipeline Tracking (in this config repo)

| Path | Purpose |
|------|---------|
| `./ai/agentic-pipeline/tasks/` | Task branch tracking (task-001, task-002...) |
| `./ai/agentic-pipeline/tasks/task-XXX/turns/` | Turn artifacts per task |
| `./ai/agentic-pipeline/turns/` | Legacy turns directory (pre-task model) |
| `./ai/agentic-pipeline/tasks_index.csv` | Task registry |
| `./ai/agentic-pipeline/turns_index.csv` | Legacy turn registry |
| `./ai/changelog.md` | Project changelog |

### 1.2 AppFactory Project Specifications (in generated projects)

| Path | Purpose |
|------|---------|
| `ai/specs/` | PRD, DDD, DSL, plan artifacts |
| `ai/specs/spec-be-prd.md` | Backend PRD |
| `ai/specs/spec-be-ddd.md` | Backend DDD |
| `ai/specs/dls-be-ddd.yaml` | Backend DSL |
| `ai/specs/spec-be-plan.md` | Backend execution plan |
| `ai/specs/implementation-manifest.yaml` | Implementation manifest |
| `ai/prompts/` | Prompt templates for spec authoring |
| `ai/dsl/` | Alternative DSL location (mentioned in agent) |

### 1.3 Existing `.appfactory/` Usage

The `af-project-init` skill **already creates** `.appfactory/provenance.json` for tracking AppFactory project origins. This is a partial migration already in progress.

---

## Section 2: Files, Skills, and Workflows Impacted

### 2.1 Core Pipeline Skills (HIGH IMPACT)

| File | References | Impact |
|------|------------|--------|
| `CLAUDE.md:18,54-67,80,93,97,99` | Defines `./ai/agentic-pipeline/` structure | **Critical** - master contract |
| `skills/task-init/SKILL.md:70,81-84,127` | Creates `./ai/agentic-pipeline/tasks/task-${TASK_ID}/` | **Critical** |
| `skills/turn-init/SKILL.md:68-72,82` | Creates `./ai/agentic-pipeline/tasks/.../turns/` | **Critical** |
| `skills/turn-end/SKILL.md:30,46` | Writes to `./ai/agentic-pipeline/tasks/.../turns/` | **Critical** |
| `skills/task-close/SKILL.md:18` | Updates `./ai/agentic-pipeline/tasks/` | **Critical** |
| `skills/session-start/turn-tracking-context.md:9-21,30` | Documents paths | **Critical** |
| `skills/session-start/adr-context.md:5` | ADR path reference | **Critical** |

### 2.2 Shell Scripts (HIGH IMPACT)

| File | Line | Reference |
|------|------|-----------|
| `skills/task-init/scripts/get-next-task-id.sh:15` | `tasks_root="$repo_root/ai/agentic-pipeline/tasks"` |
| `skills/turn-init/scripts/get-next-turn-id.sh:21` | `turns_root="$repo_root/ai/agentic-pipeline/tasks/task-${task_id}/turns"` |
| `skills/session-start/scripts/get-next-task-id.sh` | Same as task-init script |

### 2.3 AppFactory Build Skills (MEDIUM IMPACT)

| File | References | Impact |
|------|------------|--------|
| `skills/af-be-build-prd/SKILL.md:24,204,207` | Output to `ai/specs/spec-be-prd.md` | Medium |
| `skills/af-be-build-ddd/SKILL.md:44,48` | Output to `ai/specs/spec-be-ddd.md` | Medium |
| `skills/af-be-build-dsl/SKILL.md:63,65` | Output to `ai/specs/dls-be-ddd.yaml` | Medium |
| `skills/af-be-build-plan/SKILL.md:35` | Output to `ai/specs/spec-be-plan.md` | Medium |
| `skills/af-be-build-implementation/SKILL.md:59,192` | Generates `ai/specs/implementation-manifest.yaml` | Medium |
| `skills/af-project-init/SKILL.md:20-21,36-49,96-98` | Creates `ai/prompts/`, `ai/specs/` directories | Medium |
| `skills/af-project-init/scripts/init-appfactory-project.sh:26-28,32` | Creates `ai/` structure | Medium |

### 2.4 Agent Definitions (MEDIUM IMPACT)

| File | References | Impact |
|------|------------|--------|
| `agents/agent-architecture-planner.md:50-55` | Expects `./ai/specs/`, `./ai/dsl/`, `./ai/prompts/` | Medium |

### 2.5 Documentation and Memory (LOW IMPACT)

| File | References | Impact |
|------|------------|--------|
| `README.md:69-70` | Documents `ai/` structure | Low |
| `memory/MEMORY.md:16,50` | References `ai/agentic-pipeline/turns/` | Low |
| `archive/project-init/SKILL.md` | Archived, references old structure | Low |
| `archive/project-init/templates/README.md` | Templates with `ai/` paths | Low |

### 2.6 Existing Turn/Task Artifacts (DATA MIGRATION)

| Path | Count | Impact |
|------|-------|--------|
| `ai/agentic-pipeline/turns/turn-*` | 55+ directories | Historical data |
| `ai/agentic-pipeline/tasks/task-001/` | 1 task with 8 turns | Active data |
| `ai/agentic-pipeline/tasks_index.csv` | Task registry | Registry |
| `ai/agentic-pipeline/turns_index.csv` | Turn registry | Registry |

---

## Section 3: Risks and Ambiguities

### 3.1 Ambiguous Directory Contract

**Issue:** The new `.appfactory/` directory serves multiple purposes:
- `.appfactory/tasks/` - task/turn tracking
- `.appfactory/specs/` - specification documents
- `.appfactory/memory/` - project memory

**Decision Required:** Should `.appfactory/` completely replace `ai/`, or should it only contain pipeline tracking while specs remain in a different location?

### 3.2 Two Different Contexts

**Issue:** The `ai/` convention is used differently in:
1. **This config repo** - for tracking pipeline turns/tasks
2. **Generated AppFactory projects** - for specs and prompts

**Decision Required:** Should both contexts migrate to `.appfactory/`, or should generated projects use a different convention?

### 3.3 Legacy Turn Data

**Issue:** There are 55+ legacy turn directories under `ai/agentic-pipeline/turns/` using the old flat turn model, plus 1 task with 8 turns using the new task/turn model.

**Decision Required:**
- Migrate existing data or archive it?
- If migrate, update all internal references within those artifacts?

### 3.4 Hidden Dot Directory

**Issue:** `.appfactory/` starts with a dot, making it hidden by default on Unix systems.

**Implication:** Users running `ls` won't see tracking data without `-a` flag. This may be intentional (cleaner project root) or problematic (users forget it exists).

### 3.5 Conflicting Provenance Already Using `.appfactory/`

**Issue:** `af-project-init` already creates `.appfactory/provenance.json` - this is good (migration already started) but means any migration needs to coexist with existing provenance files.

### 3.6 Downstream Agent Expectations

**Issue:** The `agent-architecture-planner` expects to find:
- PRD under `./ai/specs/`
- DDD under `./ai/specs/`
- DSL under `./ai/specs/`, `./ai/dsl/`, or project root

All agents consuming these artifacts must be updated atomically.

### 3.7 User's Global CLAUDE.md

**Issue:** The user has a global `~/.claude/CLAUDE.md` that hardcodes `./ai/agentic-pipeline/`. This is the **authoritative contract** loaded into every session.

**Decision Required:** Should the project-level CLAUDE.md take precedence, or should there be a migration path for the global one?

---

## Section 4: Recommended Migration Plan

### Phase 1: Contract Definition (No Code Changes)

| Step | Action | Rationale |
|------|--------|-----------|
| 1.1 | Decide `.appfactory/` internal structure | Must be explicit before implementation |
| 1.2 | Decide if `ai/specs/` moves inside `.appfactory/` or to a separate location | Affects all build skills |
| 1.3 | Decide historical data migration strategy | Archive vs. migrate vs. symlink |
| 1.4 | Update MEMORY.md with migration note | Prevent memory drift during migration |

### Phase 2: Update Contract Documents (Foundation)

| Step | File | Change |
|------|------|--------|
| 2.1 | `CLAUDE.md` | Replace all `./ai/agentic-pipeline/` with `.appfactory/` |
| 2.2 | `skills/session-start/turn-tracking-context.md` | Update all path references |
| 2.3 | `skills/session-start/adr-context.md` | Update ADR path |
| 2.4 | `README.md` | Update structure documentation |

**Sequencing:** These must be updated together as a single atomic commit.

### Phase 3: Update Shell Scripts

| Step | File | Change |
|------|------|--------|
| 3.1 | `skills/task-init/scripts/get-next-task-id.sh` | Change `ai/agentic-pipeline/tasks` to `.appfactory/tasks` |
| 3.2 | `skills/turn-init/scripts/get-next-turn-id.sh` | Change `ai/agentic-pipeline/tasks` to `.appfactory/tasks` |
| 3.3 | `skills/session-start/scripts/get-next-task-id.sh` | Same change |

### Phase 4: Update Task/Turn Skills

| Step | File | Change |
|------|------|--------|
| 4.1 | `skills/task-init/SKILL.md` | All `./ai/agentic-pipeline/` to `.appfactory/` |
| 4.2 | `skills/turn-init/SKILL.md` | All `./ai/agentic-pipeline/` to `.appfactory/` |
| 4.3 | `skills/turn-end/SKILL.md` | All `./ai/agentic-pipeline/` to `.appfactory/` |
| 4.4 | `skills/task-close/SKILL.md` | All `./ai/agentic-pipeline/` to `.appfactory/` |

### Phase 5: Update AppFactory Build Skills

| Step | File | Change |
|------|------|--------|
| 5.1 | `skills/af-project-init/SKILL.md` | `ai/prompts/` to `.appfactory/prompts/`, `ai/specs/` to `.appfactory/specs/` |
| 5.2 | `skills/af-project-init/scripts/init-appfactory-project.sh` | Update directory creation |
| 5.3 | `skills/af-be-build-prd/SKILL.md` | Update output paths |
| 5.4 | `skills/af-be-build-ddd/SKILL.md` | Update output paths |
| 5.5 | `skills/af-be-build-dsl/SKILL.md` | Update output paths |
| 5.6 | `skills/af-be-build-plan/SKILL.md` | Update output paths |
| 5.7 | `skills/af-be-build-implementation/SKILL.md` | Update output paths |

### Phase 6: Update Agent Definitions

| Step | File | Change |
|------|------|--------|
| 6.1 | `agents/agent-architecture-planner.md` | Update input path expectations |

### Phase 7: Data Migration

| Step | Action | Rationale |
|------|--------|-----------|
| 7.1 | Create `.appfactory/tasks/` directory | New location |
| 7.2 | Move `ai/agentic-pipeline/tasks/` to `.appfactory/tasks/` | Active task data |
| 7.3 | Move `ai/agentic-pipeline/tasks_index.csv` to `.appfactory/tasks_index.csv` | Registry |
| 7.4 | Archive `ai/agentic-pipeline/turns/` to `archive/legacy-turns/` | Historical preservation |
| 7.5 | Archive `ai/agentic-pipeline/turns_index.csv` | Historical preservation |
| 7.6 | Remove or archive `ai/` directory | Cleanup |

### Phase 8: Update Memory and Documentation

| Step | File | Change |
|------|------|--------|
| 8.1 | `memory/MEMORY.md` | Update path references |
| 8.2 | Create migration ADR | Document the decision |

---

## Section 5: Open Questions Before Execution

### Critical Decisions

1. **Unified vs. Split Structure**
   - Should `.appfactory/` contain both tracking AND specs?
   - Or should specs stay in a visible `specs/` directory at project root?

2. **Subdirectory Naming**
   - Proposed: `.appfactory/tasks/`, `.appfactory/specs/`, `.appfactory/memory/`
   - Alternative: `.appfactory/pipeline/`, `.appfactory/artifacts/`
   - What about prompts? `.appfactory/prompts/`?

3. **Historical Data Handling**
   - Archive the 55 legacy turns (recommended) or migrate them?
   - Update internal references in artifacts, or leave as historical record?

4. **Global CLAUDE.md Synchronization**
   - The user's `~/.claude/CLAUDE.md` contains hardcoded paths
   - Should this be updated simultaneously with the repo?

5. **Generated Project Convention**
   - Should AppFactory-generated projects use `.appfactory/` for specs?
   - This affects downstream developers who expect visible directories

6. **Backward Compatibility Period**
   - Should skills check for BOTH `ai/` and `.appfactory/` during transition?
   - If so, for how long?

7. **Registry Format**
   - Should `tasks_index.csv` remain CSV or become JSON/YAML?
   - This is an opportunity to normalize the format

### Recommended Clarifications Before Implementation

| Question | Why It Matters |
|----------|----------------|
| Is `.appfactory/` for this config repo only, or for all generated projects? | Determines scope of build skill changes |
| Should specs be visible (`specs/`) or hidden (`.appfactory/specs/`)? | Developer experience trade-off |
| What happens to `ai/prompts/` in generated projects? | It's distinct from tracking |
| Should the migration be atomic or gradual with fallback? | Risk vs. complexity trade-off |

---

## Summary

| Metric | Value |
|--------|-------|
| **Files requiring modification** | 28+ files across skills, scripts, agents, and documentation |
| **Data requiring migration** | 56+ turn directories, 1 task directory, 2 CSV registries |
| **Skills affected** | 10 skills directly, plus agent-architecture-planner |
| **Risk level** | Medium-high (affects every coding session's workflow) |
| **Recommended approach** | Atomic migration with archive of historical data |

---

## Appendix A: Complete File Reference List

### Files with `ai/agentic-pipeline` references

```
CLAUDE.md
README.md
skills/task-init/SKILL.md
skills/task-init/scripts/get-next-task-id.sh
skills/turn-init/SKILL.md
skills/turn-init/scripts/get-next-turn-id.sh
skills/turn-end/SKILL.md
skills/task-close/SKILL.md
skills/session-start/scripts/get-next-task-id.sh
skills/session-start/turn-tracking-context.md
skills/session-start/adr-context.md
agentic-pipeline-config/CLAUDE.md
archive/templates/pull_request_template.md
```

### Files with `ai/specs` references

```
skills/af-project-init/SKILL.md
skills/af-project-init/scripts/init-appfactory-project.sh
skills/af-be-build-prd/SKILL.md
skills/af-be-build-ddd/SKILL.md
skills/af-be-build-dsl/SKILL.md
skills/af-be-build-plan/SKILL.md
skills/af-be-build-plan/templates/execution-plan-template.md
skills/af-be-build-implementation/SKILL.md
agents/agent-architecture-planner.md
archive/project-init/SKILL.md
archive/project-init/scripts/init-appfactory-project.sh
archive/project-init/templates/README.md
archive/project-init/templates/ai/specs/app-factory-workflow.md
```

### Files with `ai/prompts` references

```
skills/af-project-init/SKILL.md
skills/af-project-init/scripts/init-appfactory-project.sh
agents/agent-architecture-planner.md
archive/project-init/scripts/init-appfactory-project.sh
archive/project-init/templates/README.md
```

### Files already using `.appfactory/`

```
skills/af-project-init/SKILL.md
skills/af-project-init/scripts/init-appfactory-project.sh
```
