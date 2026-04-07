# AI to .appfactory Migration Analysis

## Scope Note

- This analysis covers repo-local materials in this repository, including 33 `SKILL.md` files under `skills/` and `archive/`, top-level docs and scripts, archived templates, and the current `ai/` tree.
- It does not include external skills stored outside this repository.
- No migration changes were executed as part of this analysis.

## Section 1: Current `ai/` Assumptions

- The current system treats `ai/` as the umbrella root for multiple artifact types:
  - task and turn tracking under `ai/agentic-pipeline/`
  - authored specifications under `ai/specs/`
  - prompt assets under `ai/prompts/`
  - ad hoc memory and history under `ai/changelog.md`
- Core lifecycle instructions hardcode `ai/agentic-pipeline` as the tracking location:
  - `CLAUDE.md`
  - `agentic-pipeline-config/CLAUDE.md`
  - `skills/session-start/adr-context.md`
  - `skills/session-start/turn-tracking-context.md`
  - `skills/task-init/SKILL.md`
  - `skills/turn-init/SKILL.md`
  - `skills/turn-end/SKILL.md`
  - `skills/task-close/SKILL.md`
  - `skills/session-start/scripts/get-next-task-id.sh`
  - `skills/task-init/scripts/get-next-task-id.sh`
  - `skills/turn-init/scripts/get-next-turn-id.sh`
- AppFactory backend authoring skills assume `ai/specs/*` is the canonical output root:
  - `skills/af-be-build-prd/SKILL.md`
  - `skills/af-be-build-ddd/SKILL.md`
  - `skills/af-be-build-dsl/SKILL.md`
  - `skills/af-be-build-plan/SKILL.md`
  - `skills/af-be-build-implementation/SKILL.md`
- The planner agent searches old locations directly:
  - `agents/agent-architecture-planner.md` looks under `./ai/specs/`, `./ai/dsl/`, and `./ai/prompts/`
- Project scaffolding is currently split between old and new conventions:
  - `skills/af-project-init/SKILL.md` and `skills/af-project-init/scripts/init-appfactory-project.sh` still create `ai/prompts/` and `ai/specs/`
  - the same skill already writes `.appfactory/provenance.json`
- The repository contains both a newer task-based tracking model and an older global-turn model:
  - task-based: `ai/agentic-pipeline/tasks/task-001/`
  - legacy global turns: `ai/agentic-pipeline/turns/`
- Existing registries are tied to the old root:
  - `ai/agentic-pipeline/tasks_index.csv`
  - `ai/agentic-pipeline/turns_index.csv`
  - `ai/agentic-pipeline/turns/turns_index.csv`

## Section 2: Files, Skills, and Workflows Impacted

### A. Lifecycle and Tracking

#### `CLAUDE.md`

- What changes: replace all `./ai/agentic-pipeline/...` references with the finalized `.appfactory/...` equivalents
- Why: this is the primary operational contract for agents in this repo
- Dependencies: the `.appfactory` directory contract must be finalized first

#### `agentic-pipeline-config/CLAUDE.md`

- What changes: same path and registry updates as `CLAUDE.md`
- Why: this is a duplicate policy source and must not diverge
- Dependencies: should be updated in lockstep with `CLAUDE.md`

#### `skills/session-start/adr-context.md`

- What changes: change ADR output path from `./ai/agentic-pipeline/tasks/task-${TASK_ID}/turns/turn-${TURN_ID}/`
- Why: ADR placement is part of the required turn contract
- Dependencies: needs the final turn directory path

#### `skills/session-start/turn-tracking-context.md`

- What changes: update every task artifact path, turn artifact path, and `tasks_index.csv` reference
- Why: this file describes the complete tracking contract consumed by the agent
- Dependencies: requires final decisions for `.appfactory/tasks/`, registry placement, and optional turn index placement

#### `skills/session-start/scripts/get-next-task-id.sh`

- What changes: stop reading `"$repo_root/ai/agentic-pipeline/tasks"`
- Why: task id resolution will fail after the rename if left unchanged
- Dependencies: should ideally support dual-read during migration

#### `skills/task-init/scripts/get-next-task-id.sh`

- What changes: same as above
- Why: task creation depends on this script
- Dependencies: should be migrated together with the session-start version to avoid inconsistent task id resolution

#### `skills/turn-init/scripts/get-next-turn-id.sh`

- What changes: stop reading `"$repo_root/ai/agentic-pipeline/tasks/task-${task_id}/turns"`
- Why: turn id resolution depends on the tracked task path
- Dependencies: requires finalized `.appfactory/tasks/.../turns` convention

#### `skills/task-init/SKILL.md`

- What changes: update `TASK_DIR`, required file paths, and registry path references
- Why: this skill explicitly instructs the agent where to create task and turn artifacts
- Dependencies: depends on final `.appfactory/tasks` layout and registry locations

#### `skills/turn-init/SKILL.md`

- What changes: update `TASK_DIR`, turn directory path, and `task_status.json` path
- Why: this skill initializes the next turn and would recreate the old layout otherwise
- Dependencies: same as `task-init`

#### `skills/turn-end/SKILL.md`

- What changes: update ADR and manifest write locations
- Why: post-execution artifact generation depends on these paths
- Dependencies: depends on final turn directory layout

#### `skills/task-close/SKILL.md`

- What changes: update task-level artifact paths and task registry reference
- Why: PR creation and task state updates currently point to the old root
- Dependencies: depends on final task artifact placement and registry placement

### B. AppFactory Authoring Skills

#### `skills/af-be-build-prd/SKILL.md`

- What changes: replace default output `ai/specs/spec-be-prd.md`
- Why: this is a direct canonical output path
- Dependencies: requires a final decision on whether `.appfactory/specs/` remains flat or is subdivided

#### `skills/af-be-build-ddd/SKILL.md`

- What changes: replace default output `ai/specs/spec-be-ddd.md`
- Why: this is a direct canonical output path
- Dependencies: same as PRD skill

#### `skills/af-be-build-dsl/SKILL.md`

- What changes: replace default output `ai/specs/dls-be-ddd.yaml` and all user-facing references to that path
- Why: the DSL output contract is old-root-specific
- Dependencies: same as PRD and DDD skills

#### `skills/af-be-build-dsl/templates/domain-dsl-template.yaml`

- What changes: update `project.source_document.path` from `ai/specs/spec-be-ddd.md`
- Why: generated DSL provenance will otherwise point to the old root
- Dependencies: should be updated with the DDD skill

#### `skills/af-be-build-plan/SKILL.md`

- What changes: replace default output `ai/specs/spec-be-plan.md`
- Why: direct output path assumption
- Dependencies: depends on final `.appfactory/specs` structure

#### `skills/af-be-build-plan/templates/execution-plan-template.md`

- What changes:
  - replace `./ai/specs/dls-be-ddd.yaml`
  - replace `./ai/specs/project.dsl.yaml`
- Why: the plan template documents the expected inputs for downstream execution
- Dependencies: requires final DSL and project spec locations

#### `skills/af-be-build-implementation/SKILL.md`

- What changes: replace `ai/specs/implementation-manifest.yaml`
- Why: generated implementation manifests should move with the new contract
- Dependencies: depends on final spec layout

### C. Project Scaffolding

#### `skills/af-project-init/SKILL.md`

- What changes:
  - stop listing `ai/prompts/` and `ai/specs/` as created directories
  - align the documented scaffold to `.appfactory/`
  - keep `.appfactory/provenance.json`
- Why: this skill is currently half-migrated and will keep bootstrapping the old structure
- Dependencies: prompt location and spec layout must be resolved first

#### `skills/af-project-init/scripts/init-appfactory-project.sh`

- What changes:
  - replace `PROMPTS_DIR="${PROJECT_ROOT}/ai/prompts"`
  - replace `SPECS_DIR="${PROJECT_ROOT}/ai/specs"`
  - expand `.appfactory/` handling beyond provenance
- Why: this is the live scaffold writer
- Dependencies: final `.appfactory` layout must be defined before implementation

### D. Planning and Discovery

#### `agents/agent-architecture-planner.md`

- What changes:
  - update PRD, DDD, DSL, and prompt discovery paths away from `./ai/specs/`, `./ai/dsl/`, and `./ai/prompts/`
- Why: planner inputs are explicitly path-driven
- Dependencies: final location of prompts and DSL files must be defined

### E. Supporting Docs and Templates

#### `README.md`

- What changes:
  - update the structure diagram
  - replace `ai/` examples with `.appfactory/`
  - fix any tracking-flow examples tied to the old layout
- Why: this file currently documents `ai/` as the active turn artifact root
- Dependencies: should follow the finalized contract

#### `skills/SUMMARY.md`

- What changes: update references like `./ai/turns`
- Why: this is an informational summary that currently encodes stale analysis assumptions
- Dependencies: none, but should be updated with the rest of the docs

#### `archive/templates/pull_request_template.md`

- What changes:
  - replace the trace path under `./ai/agentic-pipeline/...`
  - replace “Files Added (under `./ai/`)”
- Why: archived templates still encode old provenance paths
- Dependencies: final location of trace artifacts

#### `archive/templates/manifest.schema.json`

- What changes: update the schema description if `agentic-pipeline` is no longer the canonical term
- Why: this is less about file paths and more about terminology and contract clarity
- Dependencies: decision on whether `agentic-pipeline` survives as a term inside `.appfactory`

### F. Archived Project Bootstrap Materials

#### `archive/project-init/SKILL.md`

- What changes: replace the entire `ai/` scaffold description with `.appfactory/` equivalents, or explicitly mark the skill obsolete
- Why: this archived skill still describes the old canonical structure
- Dependencies: final `.appfactory` contract

#### `archive/project-init/scripts/init-appfactory-project.sh`

- What changes: replace all created/copied `ai/specs/*` and `ai/prompts/*` paths
- Why: this script still writes the old scaffold in many places
- Dependencies: same as the live scaffold script

#### `archive/project-init/templates/README.md`

- What changes: replace all references to `ai/specs/*` and `ai/prompts/*`
- Why: generated README content would otherwise perpetuate the old contract
- Dependencies: final location of specs and prompts

#### `archive/project-init/templates/ai/prompts/dsl-prompt.md`

- What changes: replace `./ai/dsl/project.dsl.yaml`
- Why: this is an explicit path contract embedded in a prompt template
- Dependencies: final DSL location

#### `archive/project-init/templates/ai/specs/app-factory-workflow.md`

- What changes: update the documented location `ai/specs/app-factory-workflow.md`
- Why: it encodes the old root in workflow documentation
- Dependencies: final workflow doc placement

#### `archive/project-init/templates/ai/`

- What changes: decide whether this whole template subtree should be renamed to `.appfactory/` or retired
- Why: the path itself encodes the old root
- Dependencies: final scaffold strategy

### G. Existing Data and History Under `ai/`

#### `ai/agentic-pipeline/`

- What changes: migrate, archive, alias, or preserve under a legacy namespace
- Why: it contains the current repository’s operational history
- Dependencies: migration policy for historical artifacts

#### `ai/prompts/`

- What changes: move to the new prompt location or explicitly archive
- Why: the new contract currently names `.appfactory/tasks`, `.appfactory/specs`, and `.appfactory/memory`, but does not name prompts
- Dependencies: open decision on prompt placement

#### `ai/changelog.md`

- What changes: likely move under `.appfactory/memory/` if memory is the intended new home for historical analysis and changelog content
- Why: this is more “memory/history” than spec or task tracking
- Dependencies: final definition of `.appfactory/memory/`

## Section 3: Risks and Ambiguities

- The new contract does not define where prompt assets should live.
  - Current live convention: `ai/prompts/`
  - Archived scaffold convention: `ai/prompts/`
  - Current top-level README mentions `prompts/` at the repo root
- The spec layout is inconsistent today.
  - Live `af-be-*` skills assume flat files like `ai/specs/spec-be-prd.md`
  - Archived `project-init` assumes nested folders under `ai/specs/`
- The tracking layout is inconsistent today.
  - Newer model: `ai/agentic-pipeline/tasks/task-XXX/turns/turn-YYY/`
  - Older model: `ai/agentic-pipeline/turns/turn-N/`
- Registry placement is not defined for the new contract.
  - `tasks_index.csv` and `turns_index.csv` need explicit homes under `.appfactory/`
- Historical provenance integrity is at risk.
  - Existing manifests, PR files, summaries, and traces embed literal `ai/...` paths
  - Moving them without rewriting leaves stale references
  - Rewriting them changes historical records
- `af-project-init` is already mixed between old and new conventions, which increases migration risk if implementation starts before the contract is frozen.
- There are adjacent convention conflicts that are not strictly part of the directory rename but should be called out before implementation:
  - `skills/branch-guard/SKILL.md` and `README.md` still reference `turn/T*` branches while lifecycle docs use `task/T*`
  - turn context templates still say “finalize at session-end” even though the active skill is `turn-end`
  - `af-be-build-dsl` uses `dls-be-ddd.yaml` while `af-be-build-implementation` refers to `dsl-be-ddd.yaml`

## Section 4: Recommended Migration Plan

### Step 1: Freeze the `.appfactory/` Contract

- Affected files:
  - `CLAUDE.md`
  - `agentic-pipeline-config/CLAUDE.md`
- What changes:
  - define canonical locations for tasks, specs, memory, prompts, provenance, and registries
  - decide whether `agentic-pipeline` remains as a subdirectory name or disappears
- Why:
  - every downstream skill and script depends on this contract
- Dependencies:
  - none

### Step 2: Add Dual-Read Compatibility Before Changing Writers

- Affected files:
  - `skills/session-start/scripts/get-next-task-id.sh`
  - `skills/task-init/scripts/get-next-task-id.sh`
  - `skills/turn-init/scripts/get-next-turn-id.sh`
- What changes:
  - read `.appfactory/...` first
  - optionally fall back to legacy `ai/...` during migration
- Why:
  - this is the safest way to avoid breaking active workflows mid-cutover
- Dependencies:
  - final `.appfactory` layout decisions

### Step 3: Update Lifecycle Instructions and Tracking Skills

- Affected files:
  - `skills/session-start/adr-context.md`
  - `skills/session-start/turn-tracking-context.md`
  - `skills/task-init/SKILL.md`
  - `skills/turn-init/SKILL.md`
  - `skills/turn-end/SKILL.md`
  - `skills/task-close/SKILL.md`
  - `CLAUDE.md`
  - `agentic-pipeline-config/CLAUDE.md`
- What changes:
  - replace all `./ai/agentic-pipeline/...` references
  - update registry paths
- Why:
  - these files define the active operational behavior of the agent
- Dependencies:
  - Step 2 recommended first

### Step 4: Update AppFactory Authoring and Planner Defaults

- Affected files:
  - `skills/af-be-build-prd/SKILL.md`
  - `skills/af-be-build-ddd/SKILL.md`
  - `skills/af-be-build-dsl/SKILL.md`
  - `skills/af-be-build-dsl/templates/domain-dsl-template.yaml`
  - `skills/af-be-build-plan/SKILL.md`
  - `skills/af-be-build-plan/templates/execution-plan-template.md`
  - `skills/af-be-build-implementation/SKILL.md`
  - `agents/agent-architecture-planner.md`
- What changes:
  - replace `ai/specs/*`, `ai/dsl/*`, and `ai/prompts/*` defaults with the new `.appfactory` equivalents
- Why:
  - otherwise new outputs will keep regenerating the old layout
- Dependencies:
  - final decisions on specs, DSL, and prompt placement

### Step 5: Update Project Scaffolding

- Affected files:
  - `skills/af-project-init/SKILL.md`
  - `skills/af-project-init/scripts/init-appfactory-project.sh`
  - `archive/project-init/SKILL.md`
  - `archive/project-init/scripts/init-appfactory-project.sh`
  - `archive/project-init/templates/README.md`
  - `archive/project-init/templates/ai/`
- What changes:
  - scaffold `.appfactory/...` directly
  - stop creating `ai/prompts/` and `ai/specs/`
  - preserve `.appfactory/provenance.json`
- Why:
  - new repositories should not start on the legacy convention
- Dependencies:
  - Steps 1 and 4

### Step 6: Update Supporting Docs and Archived Templates

- Affected files:
  - `README.md`
  - `skills/SUMMARY.md`
  - `archive/templates/pull_request_template.md`
  - `archive/templates/manifest.schema.json`
- What changes:
  - update path examples, diagrams, trace references, and terminology
- Why:
  - these files currently reinforce the old contract
- Dependencies:
  - should follow the finalized implementation paths

### Step 7: Migrate or Archive Existing `ai/` Data

- Affected files and directories:
  - `ai/agentic-pipeline/`
  - `ai/prompts/`
  - `ai/changelog.md`
- What changes:
  - move, copy, archive, alias, or preserve under a legacy namespace inside `.appfactory`
- Why:
  - the repository’s historical records currently live under `ai/`
- Dependencies:
  - complete reader and writer migration first

### Step 8: Fix Adjacent Convention Drift

- Affected files:
  - `skills/branch-guard/SKILL.md`
  - `README.md`
  - `skills/task-init/templates/turn_context.md`
  - `skills/turn-init/templates/turn_context.md`
  - `skills/af-be-build-dsl/SKILL.md`
  - `skills/af-be-build-implementation/SKILL.md`
- What changes:
  - align `turn/T*` vs `task/T*`
  - align `session-end` language with `turn-end`
  - align `dls-be-ddd.yaml` vs `dsl-be-ddd.yaml`
- Why:
  - these conflicts will create noise and confusion during the migration if left unresolved
- Dependencies:
  - none, but best handled in the same cleanup window

## Recommended Additions to the New `.appfactory/` Contract

- Define an explicit prompt location.
  - Recommended: `.appfactory/prompts/`
- Keep `.appfactory/provenance.json` as an explicit top-level contract file.
- Define explicit registry locations for:
  - task registry
  - turn registry
  - optional per-task turn index
- Define the legacy-history policy explicitly.
  - Recommended: move old historical analysis and legacy turn archives under `.appfactory/memory/legacy/`
- Define whether `.appfactory/specs/` is flat or subdivided.
- Define whether `agentic-pipeline` remains as an internal term or is retired fully.

## Section 5: Open Questions Before Execution

- Should prompt templates live in `.appfactory/prompts/`, `.appfactory/memory/prompts/`, or outside `.appfactory` entirely?
- Should `.appfactory/specs/` be flat, or should it preserve subfolders like `shared/`, `backend/`, `frontend/`, `plans/`, and `templates/`?
- Does the new layout flatten `ai/agentic-pipeline/*` into `.appfactory/tasks/*`, `.appfactory/specs/*`, and `.appfactory/memory/*`, or should `.appfactory/agentic-pipeline/` still exist?
- Where should `tasks_index.csv` and any `turns_index.csv` live under the new contract?
- What should happen to legacy global-turn history now stored under `ai/agentic-pipeline/turns/`?
- Are historical manifests and PR artifacts allowed to be rewritten to new paths, or must they remain immutable even if they continue to reference `ai/...`?
- Should `.appfactory/provenance.json` remain canonical for bootstrap provenance?
- Should the same implementation pass also fix adjacent branch, session, and filename inconsistencies, or should those be split into separate work?
- Is repo-local scope sufficient for the migration, or should external shared skills and plugins be analyzed separately before implementation?
