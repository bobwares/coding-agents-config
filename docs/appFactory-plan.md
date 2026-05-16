# AppFactory Implementation Plan

**Date:** 2026-05-06  
**Status:** Draft  
**Audience:** AppFactory Architecture Team

---

## Executive Summary

AppFactory is a spec-driven control plane for AI Coding Agents. Current implementation includes 12 active skills covering the software development lifecycle from project initialization through acceptance testing. This plan consolidates findings from a metadata audit, identifies implementation gaps, and provides a sequenced roadmap for completing the orchestrator and normalizing the skill ecosystem.

---

## Part 1: Current State Analysis

### 1.1 Implemented Skills (12/13)

AppFactory currently implements the following skills:

| Phase | Step | Skill Name | Status | Dependencies |
|-------|------|-----------|--------|--------------|
| Initialization | 1 | `af-project-init` | ✅ Complete | None |
| Requirements | 2 | `af-be-prd-build` | ✅ Complete | None |
| Domain Design | 3 | `af-be-ddd-orchestrator` | ✅ Complete | af-be-prd-build |
| Domain Design | 4 | `af-be-ddd-build` | ✅ Complete | af-be-prd-build |
| Domain Design | 5 | `af-be-ddd-analysis` | ✅ Complete | af-be-ddd-build |
| Domain Design | 6 | `af-be-ddd-refactor` | ✅ Complete | af-be-ddd-analysis |
| Testing | 7 | `af-be-ddd-tests` | ✅ Complete | af-be-ddd-build, af-be-prd-build |
| Planning | 8 | `af-be-plan` | ✅ Complete | af-be-ddd-dsl |
| DSL Generation | 9 | `af-be-ddd-dsl` | ✅ Complete | af-be-ddd-build |
| Implementation | 10 | `af-be-implementation` | ✅ Complete | af-be-plan, af-be-ddd-tests |
| Validation | 11 | `af-app-check` | ✅ Complete | af-be-implementation |
| Utility | 12 | `af-memory` | ✅ Complete | N/A (cross-cutting) |
| **Orchestration** | **Master** | **`af-orchestrator`** | **⚠️ Skeleton** | All phases |

### 1.2 Execution Flow

```
af-project-init
    ↓
af-be-prd-build
    ↓
af-be-ddd-orchestrator (controls loop)
    ├─→ af-be-ddd-build
    │   ├─→ af-be-ddd-analysis
    │   └─→ af-be-ddd-refactor (if needed)
    └─→ af-be-ddd-tests
    ↓
af-be-ddd-dsl
    ↓
af-be-plan
    ↓
af-be-implementation
    ├─→ af-be-ddd-dsl (via af-memory)
    └─→ af-be-ddd-tests (via af-memory)
    ↓
af-app-check

Cross-cutting: af-memory (state management throughout)
```

---

## Part 2: Metadata Inconsistency Audit

### 2.1 Findings

Skills have **non-standardized frontmatter**. The following fields appear inconsistently:

| Field | Required | Adopters | Gap |
|-------|----------|----------|-----|
| `name` | ✅ Yes | 12/12 | None |
| `description` | ✅ Yes | 12/12 | None |
| `context` | ❓ Optional | 6/12 (50%) | af-app-check, af-be-ddd-analysis, af-be-ddd-refactor, af-be-prd-build, af-memory, af-project-init |
| `memory-integration` | ❓ Optional | 7/12 (58%) | af-app-check, af-be-ddd-analysis, af-be-ddd-refactor, af-be-prd-build, af-memory, af-project-init |
| `compatibility` | ❓ Optional | 2/12 (17%) | All except af-be-ddd-analysis, af-be-ddd-refactor |
| `triggers` | ❓ Optional | 2/12 (17%) | All except af-be-prd-build, af-memory |

### 2.2 Inconsistency Categories

**Pattern A: Heavy metadata** (6 skills)
- Have: `name`, `description`, `context`, `memory-integration`
- Skills: af-be-ddd-build, af-be-ddd-dsl, af-be-ddd-orchestrator, af-be-ddd-tests, af-be-implementation, af-be-plan
- Include subsections for memory reads/writes

**Pattern B: Lightweight metadata** (4 skills)
- Have: `name`, `description` only
- Skills: af-app-check, af-project-init, af-be-ddd-analysis, af-be-ddd-refactor
- Missing: `context`, `memory-integration`, `compatibility`

**Pattern C: Special cases** (2 skills)
- af-be-prd-build: Has `triggers` but missing `context`
- af-memory: Has `triggers` but missing `context`
- af-orchestrator: Template only (SKILLS.md not SKILL.md)

### 2.3 Recommendations

Normalize to a **canonical frontmatter schema**:

```yaml
---
name: {skill-id}
description: |
  {multi-line description}
context: project|none  # execution context
compatibility: |
  {required files, external dependencies}
triggers:
  - {natural language trigger}
memory-integration:
  reads_from:
    - {state.path}
  writes_to:
    - {state.path}
---
```

---

## Part 3: af-orchestrator Implementation

### 3.1 Scope

`af-orchestrator` is the **master orchestration skill**. It:
- Accepts initial AppFactory request
- Routes through phases (PRD → DDD → Tests → Plan → Implementation → Validation)
- Manages state transitions via `af-memory`
- Handles error recovery and loop control
- Invokes sub-orchestrators (e.g., `af-be-ddd-orchestrator` for the DDD phase)

### 3.2 Design

**Inputs (from user):**
- `PROJECT_ID` – unique project identifier
- `BUSINESS_BRIEF` – brief product requirements
- `TECH_STACK_CHOICE` – selected tech stack profile
- `OPTIONS` – optional overrides (skip validation, max DDD iterations, etc.)

**Process:**

1. **Initialize** – Call `af-project-init`, establish `.appfactory/` structure
2. **Discover PRD** – Call `af-be-prd-build` (if no existing spec-be-prd.md)
3. **Design Domain** – Call `af-be-ddd-orchestrator` (orchestrates build→analyze→refactor loop)
4. **Generate Tests** – Call `af-be-ddd-tests`
5. **Generate DSL** – Call `af-be-ddd-dsl`
6. **Plan Implementation** – Call `af-be-plan`
7. **Implement** – Call `af-be-implementation`
8. **Validate** – Call `af-app-check`
9. **Report** – Generate summary, write to task artifacts

**State Management:**
- Read/write via `af-memory` (CRUD on `.appfactory/state.yaml`)
- Track: phase, status, artifacts, errors, iteration count
- Support rollback on failure

**Output:**
- Generated application source code
- All intermediate artifacts (PRD, DDD spec, DSL, plan, tests)
- Execution summary with metrics

### 3.3 Frontmatter Template

```yaml
---
name: af-orchestrator
description: |
  Master orchestration skill for the AppFactory software development lifecycle.
  Routes requests through PRD build, DDD design, test generation, planning, 
  implementation, and validation phases. Manages state via af-memory and 
  invokes phase-specific orchestrators (e.g., af-be-ddd-orchestrator).
context: project
compatibility: |
  Requires: .appfactory/ directory structure, af-memory accessible
  Optional: existing spec-be-prd.md, spec-be-ddd.md
triggers:
  - orchestrate appfactory
  - run appfactory
  - build application
  - appfactory project
memory-integration:
  reads_from:
    - project.id
    - project.name
    - project.brief
    - config.tech_stack
    - phase.current
    - phase.status
  writes_to:
    - project.id
    - phase.current
    - phase.status
    - artifacts.prd.path
    - artifacts.ddd.path
    - artifacts.tests.path
    - artifacts.dsl.path
    - artifacts.plan.path
---
```

---

## Part 4: Missing Skills Analysis

All skills referenced in the SDLC table are implemented. However, **two potential gaps**:

### 4.1 Gap: Architectural Patterns Selection (Step 5)

- **Referenced in SDLC:** Step 5: "Architectural Patterns Selection"
- **Actual implementation:** Implicit in `af-be-plan` (selects patterns based on DSL)
- **Recommendation:** Consider creating `af-be-patterns` skill to make pattern selection explicit and configurable

### 4.2 Gap: Tech Stacks Selection (Step 6)

- **Referenced in SDLC:** Step 6: "Tech Stacks Selection"
- **Actual implementation:** Implicit in `af-orchestrator` (user provides `TECH_STACK_CHOICE`)
- **Recommendation:** Consider creating `af-tech-stack-catalog` skill for discovery/selection of available stacks

### 4.3 Recommendation

These gaps are **non-blocking** for MVP. Current implementation handles them via configuration/input. Defer skill creation to Phase 2.

---

## Part 5: Implementation Roadmap

### Phase 1: Orchestrator & Normalization (Current Turn)

**Deliverables:**
1. Implement `af-orchestrator` skill (full spec)
2. Normalize metadata across all 12 skills to canonical schema
3. Update af-orchestrator SKILLS.md → SKILL.md
4. Update this plan with final schema decisions

**Effort:** 2 turns (orchestrator design + implementation, metadata harmonization)

**Files to create/modify:**
- `skills/af-orchestrator/SKILL.md` (create; replace SKILLS.md)
- `skills/af-orchestrator/prompts/orchestrator.md` (create; execution logic)
- `skills/af-*/SKILL.md` (normalize; 12 files)
- `.appfactory/metadata-schema.md` (create; canonical reference)

### Phase 2: Skill Enhancements (Post-MVP)

**Priorities:**
1. `af-be-patterns` – Explicit architecture pattern selection
2. `af-tech-stack-catalog` – Tech stack discovery and comparison
3. `af-orchestrator-resume` – Resume interrupted projects
4. Enhanced error recovery in orchestrator

**Effort:** 3–4 turns depending on scope

### Phase 3: Integration & Testing (Post-MVP)

**Goals:**
1. End-to-end workflow testing (project-init → validation)
2. State management stress tests
3. Error recovery scenario testing
4. Performance benchmarking

**Effort:** 2–3 turns

---

## Part 6: Metadata Normalization Details

### 6.1 Canonical Schema

```yaml
---
name: {skill-id}
                      # REQUIRED: Lowercase, hyphens, af-* or task-* prefix

description: |
  {1-2 line summary}
  {detailed description if needed}
                      # REQUIRED: Supports multi-line with | YAML operator

context: project|none
                      # OPTIONAL: execution context
                      # project = operates within a project directory
                      # none = stateless/utility

compatibility: |
  {list required files, external dependencies, environment}
                      # OPTIONAL: preconditions for execution

triggers:
  - {natural language trigger 1}
  - {natural language trigger 2}
                      # OPTIONAL: user phrases that invoke this skill

memory-integration:
  reads_from:
    - {state.path.example}
  writes_to:
    - {state.path.example}
                      # OPTIONAL: for skills that touch af-memory state
                      # omit section if no memory interaction
---
```

### 6.2 Normalization Tasks

| Skill | Current State | Action |
|-------|---------------|--------|
| af-app-check | Missing context, memory | Add context: none; add compatibility section |
| af-be-ddd-analysis | Missing context; has compatibility | Add context: project; restructure compatibility as YAML |
| af-be-ddd-build | ✅ Compliant | No change |
| af-be-ddd-dsl | ✅ Compliant | No change |
| af-be-ddd-orchestrator | ✅ Compliant | No change |
| af-be-ddd-refactor | Missing context, memory | Add context: project; add memory-integration section |
| af-be-ddd-tests | ✅ Compliant | No change |
| af-be-implementation | ✅ Compliant | No change |
| af-be-plan | ✅ Compliant | No change |
| af-be-prd-build | Missing context | Add context: project; move triggers to YAML list |
| af-memory | Missing context | Add context: none |
| af-project-init | Missing context, memory | Add context: project; add memory-integration section |
| af-orchestrator | Template + wrong filename | Implement full spec; rename SKILLS.md → SKILL.md |

---

## Part 7: Success Criteria

### Phase 1 Success

- [ ] `af-orchestrator` SKILL.md implements full specification
- [ ] All 12 skills conform to canonical metadata schema
- [ ] Schema document committed and documented
- [ ] Zero inconsistencies in frontmatter across all skills
- [ ] Execution flow diagram updated and validated

### Overall AppFactory Success

- [ ] End-to-end project generation (init → validation) completes in 1–2 turns
- [ ] State management (af-memory) tracks full lifecycle correctly
- [ ] Error recovery and rollback work as designed
- [ ] Documentation complete and consumable by downstream users
- [ ] Extensibility model clear for future skills

---

## Part 8: Risk & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Metadata changes break existing skills | High | Create schema in draft; test parsing before production |
| Orchestrator state management complexity | High | Use `af-memory` tests; add audit trail to execution_trace.json |
| Circular dependencies between skills | Medium | Validate DAG before orchestrator invocation |
| Phase-specific orchestrators (e.g., DDD) not compatible with master | Medium | Define orchestrator interface explicitly; test integration |

---

## Appendix A: File Structure

```
coding-agents-config/
├── skills/
│   ├── af-project-init/
│   │   ├── SKILL.md
│   │   ├── scripts/
│   │   └── templates/
│   ├── af-be-prd-build/
│   │   ├── SKILL.md
│   │   ├── prompts/
│   │   └── templates/
│   ├── af-be-ddd-orchestrator/
│   │   ├── SKILL.md
│   │   └── prompts/
│   ├── af-be-ddd-build/
│   │   ├── SKILL.md
│   │   ├── prompts/
│   │   └── templates/
│   ├── af-be-ddd-analysis/
│   │   ├── SKILL.md
│   │   └── prompts/
│   ├── af-be-ddd-refactor/
│   │   ├── SKILL.md
│   │   └── prompts/
│   ├── af-be-ddd-tests/
│   │   ├── SKILL.md
│   │   ├── prompts/
│   │   └── templates/
│   ├── af-be-ddd-dsl/
│   │   ├── SKILL.md
│   │   ├── prompts/
│   │   └── templates/
│   ├── af-be-plan/
│   │   ├── SKILL.md
│   │   ├── prompts/
│   │   └── templates/
│   ├── af-be-implementation/
│   │   ├── SKILL.md
│   │   ├── prompts/
│   │   └── templates/
│   ├── af-app-check/
│   │   ├── SKILL.md
│   │   └── prompts/
│   ├── af-memory/
│   │   ├── SKILL.md
│   │   └── prompts/
│   └── af-orchestrator/
│       ├── SKILL.md (to be created)
│       ├── prompts/
│       │   └── orchestrator.md (to be created)
│       └── templates/
├── docs/
│   ├── appFactory-plan.md (this file)
│   └── metadata-schema.md (to be created)
└── .appfactory/
    ├── tasks/
    ├── specs/
    ├── prompts/
    └── memory/
```

---

## Appendix B: Canonical Frontmatter Examples

**Example 1: Heavy metadata (orchestrator)**
```yaml
---
name: af-orchestrator
description: |
  Master orchestration skill for AppFactory SDLC.
context: project
memory-integration:
  reads_from:
    - project.id
  writes_to:
    - phase.current
triggers:
  - orchestrate appfactory
---
```

**Example 2: Lightweight (utility)**
```yaml
---
name: af-memory
description: CRUD operations for AppFactory state management.
context: none
triggers:
  - memory read
---
```

**Example 3: Compatibility-focused (analysis)**
```yaml
---
name: af-be-ddd-analysis
description: Analyze DDD spec for completeness and PRD alignment.
context: project
compatibility: |
  Requires: spec-be-ddd.md, spec-be-prd.md
  Outputs: spec-be-ddd.analysis.md
---
```

---

## Next Steps

1. **Turn 003 (current):** Generate this plan, audit metadata, design af-orchestrator
2. **Turn 004:** Implement af-orchestrator SKILL.md + prompts
3. **Turn 005:** Normalize metadata across all 12 skills
4. **Turn 006:** Create metadata-schema.md, validate all changes
5. **Turn 007+:** Phase 2 & 3 work (patterns skill, integration tests, etc.)

---

**Document Version:** 1.0  
**Last Updated:** 2026-05-06  
**Author:** AI Coding Agent (Claude Haiku 4.5)  
**Status:** DRAFT (pending review and approval)
