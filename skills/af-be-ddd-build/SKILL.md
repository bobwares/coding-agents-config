---
name: af-be-ddd-build
description: Generate a human-readable backend Domain-Driven Design document from an approved PRD, strictly following the ddd-template.md structure. The output translates business requirements into a backend application domain design optimized for downstream DSL generation, backend planning workflows, and AI coding agents.
context: project
memory-integration:
   reads_from:
      - project.name
      - artifacts.prd.path
      - artifacts.prd.status
      - artifacts.ddd.path
      - artifacts.ddd.version
   writes_to:
      - artifacts.ddd.status
      - artifacts.ddd.updated_at
      - artifacts.ddd.generated_by
      - artifacts.ddd.version
      - artifacts.ddd.archived_path
      - progress.current_phase
   requires:
      - artifacts.prd.status: completed
---

# af-be-ddd-build

## Purpose

Use this skill to create a **backend-focused Domain-Driven Design (DDD) document** from a completed **Product Requirements Document (PRD)**.

The generated DDD is a **human-readable design artifact** that MUST strictly follow the structure, headings, tables, subsections, and formatting of the canonical template in `assets/ddd-template.md`. It serves two purposes:

1. Define the domain clearly enough for human review;
2. Provide structured design inputs for later **DSL generation**, **backend planner** workflows, and **AI coding agent** execution.

This skill assumes the PRD exists and has been reviewed as the business-facing requirements document. It does **not** rewrite the PRD; it translates it into domain model structure using the exact template layout.

## When To Use

Use this skill when:

1. a PRD exists and has enough clarity to support domain modeling;
2. the next step is to derive a backend domain design from business requirements;
3. the team needs a backend-oriented design artifact that is readable by humans and **exactly matches the approved template** for consistency in downstream automation;
4. the resulting document will later drive DSL design, planning, implementation, and validation.

Do **not** use this skill when the requirements are still vague enough that a PRD should be revised first.

## Input

The required PRD input must be resolved from `artifacts.prd.path` in `./.appfactory/memory/state.yml`.

Before generating the DDD, the skill must read the PRD path from state and verify that the file exists.

```bash
prd_path=$(af_state_get "artifacts.prd.path")

if [ -z "$prd_path" ]; then
  echo "ERROR: artifacts.prd.path is not set in state.yml"
  exit 1
fi

if [ ! -f "$prd_path" ]; then
  echo "ERROR: PRD file does not exist: $prd_path"
  exit 1
fi
```

## Output Files

The DDD output file must be resolved from `artifacts.ddd.path` in `state.yml`.

Before generating the DDD, the skill must read the DDD output path from state and verify that it is set.

```bash
ddd_path=$(af_state_get "artifacts.ddd.path")

if [ -z "$ddd_path" ]; then
  echo "ERROR: artifacts.ddd.path is not set in state.yml"
  exit 1
fi
```

The generated DDD must be written to the exact path defined by `artifacts.ddd.path` in the ./.appfactory/memory/state.yml

The skill must not use a hardcoded default output path.

## Repeat Run and Archive Behavior

This skill must support multiple executions for the same project.

If the DDD output file already exists at the path defined by `artifacts.ddd.path`, the skill must not overwrite it directly.

Before creating a new DDD:

1. read the target DDD file path from state using `artifacts.ddd.path`;
2. check whether that file already exists;
3. open the existing DDD file;
4. extract the current document version from the **Document Control** > **Version History** table (first data row, Version column);
5. create an `archive` directory under the same directory as the DDD file;
6. move the existing DDD file into the archive directory;
7. append the extracted version to the archived file name (e.g. `spec-be-ddd-v0.1.0.md`);
8. proceed with generating the new DDD at the original `artifacts.ddd.path`.

### Archive Naming Rule

Given this state value:

```yaml
artifacts:
  ddd:
    path: ai/specs/spec-be-ddd.md
```

And this current DDD version from Version History:

```text
| **0.1.0** | **May 01, 2026, 04:48 PM Central Time** | **af-be-build-ddd AI Agent** | **Initial draft created from PRD worksheet** |
```

Archive the existing file as:

```text
.appfactory/specs/archive/spec-be-ddd-v0.1.0.md
```

The archived version must preserve the full previous DDD content exactly as it existed before the new DDD is generated. Update the new document's Version History with the next minor version (e.g. 0.2.0) and current date/time in US Central Time.

## Output Goals

The generated DDD must:

1. **Strictly follow the exact template structure** in `assets/ddd-template.md` — every heading, subheading, table column, list style, and placeholder replacement rule must be preserved. No extra top-level sections, no re-ordered tables, no omitted subsections.
2. remain human-readable;
3. stay focused on business-domain structure rather than low-level implementation;
4. define enough structure to support later **DSL authoring** (see the dedicated "DSL-Oriented Modeling Notes" section in the template);
5. identify what the backend planner and AI coding agent will need to know;
6. separate confirmed domain facts from assumptions and unresolved items (captured in "Open Domain Decisions" table and "Worked Examples").

## Non-Goals

Do **not** turn the DDD into:

1. a raw API spec;
2. a transport contract inventory;
3. an implementation plan;
4. a sprint backlog;
5. a database DDL document;
6. a client interaction specification;
7. a code-generation prompt.

Those artifacts may be derived later from this DDD + DSL.

## DDD Writing Rules

**The single most important rule:** Populate the template in `assets/ddd-template.md` exactly. Use its precise:

- Document Control with **Document Metadata** table (Created Date and Last Updated **must include the full readable time in US Central Time**) + **Version History** table (exactly as shown, with **bold** on version row)
- Domain Summary with Purpose / Design Goal (numbered list) / Core Business Responsibility
- Ubiquitous Language table (exactly 3 columns: Term | Definition | Notes) + Key Distinctions list
- Domain Capabilities table (3 columns)
- Bounded Contexts table (exactly 7 columns)
- Context Relationships table + Source-of-Truth Implications list
- Domain Model with three separate tables (Aggregate Roots, Entities, Value Objects)
- Business Invariants table with INV- IDs
- Lifecycle and State Models with specific bold **States** / **Initial State** / **Terminal States** formatting + Allowed Transitions table
- Commands and Business Outcomes table (6 columns)
- Domain Events table (5 columns)
- Policies and Configuration Boundaries table
- Authorization-Relevant Domain Rules table
- External Systems and Integration Boundaries table
- DSL-Oriented Modeling Notes with all 7 specific subsections (Objects, Field Groups, Required Fields, State and Lifecycle Rules, Actions, Validation and Policy Hooks, Relationships and Projections, Planner / AI Coding Agent Notes)
- Open Domain Decisions table (4 columns)
- Worked Examples section (even if only one placeholder example)
- Exact closing `**End of DDD Document**`

**Date & Time Rules (US Central Time required):**
- All date fields in Document Metadata (**Created Date** and **Last Updated**) must use the full format: **May 01, 2026, 04:48 PM Central Time** (include both date and readable 12-hour time with AM/PM, labeled as Central Time).
- In Version History, replace the Date cell with the exact current timestamp in US Central Time using the format `May 01, 2026, 04:48 PM Central Time`.
- Always use the current system time converted to US Central Time (CDT / CST as applicable). Never use UTC or omit the time component.

**Version History population rule:**
- Replace the Date column with current US Central Time in the exact format above.
- Replace Author with the name of the generating agent (e.g. "af-be-build-ddd AI Agent").
- Keep the summary exactly: **Initial draft created from PRD worksheet** for v0.1.0 (update summary appropriately for later versions).
- Always bold the entire data row as shown in the template.

Derive all content from the PRD while preserving business intent. Do not invent detailed behavior where the PRD is silent — record lightest reasonable assumptions in Open Domain Decisions.

## Template

The canonical output template is located at:

`assets/ddd-template.md` (relative to this skill directory)

**Always** read this template first, then generate the DDD as a filled instance of it. The template is the single source of truth for document shape. Never hard-code a different structure. The Version History table must appear exactly as:


### Version History

| Version   | Date                                    | Author                       | Summary                                      |
|-----------|-----------------------------------------|------------------------------|----------------------------------------------|
| **0.1.0** | **May 01, 2026, 04:48 PM Central Time** | **af-be-build-ddd AI Agent** | **Initial draft created from PRD worksheet** |


(with Date replaced by current US Central Time including readable time).

## Process

Follow this process **exactly**.

### Step 1. Read the PRD

Extract:

1. business goals;
2. scope;
3. actors;
4. policies;
5. business rules;
6. lifecycle expectations;
7. integration points;
8. open questions.

Also read `project.name` from state for the title.

### Step 2. Normalize Business Language

Create consistent terms for the Ubiquitous Language table (3-column format) and Key Distinctions.

### Step 3. Derive Domain Structure

Infer:

1. bounded contexts (for the 7-column table);
2. domain capabilities (for the 3-column table);
3. aggregate roots, entities, value objects (separate tables);
4. ownership boundaries, source-of-truth, external systems.

### Step 4. Identify DSL-Shaping Information

Populate the entire "DSL-Oriented Modeling Notes" section with concrete items the future DSL, planner, and coding agents will need (objects, fields, states, actions, validations, relationships, planner notes).

### Step 5. Populate the DDD Template

1. Read `assets/ddd-template.md` into memory.
2. Replace `[Project Name]` with the actual project name from state or PRD.
3. **Critical Date/Time Step**:
   - Set **Created Date** and **Last Updated** in Document Metadata to the current timestamp in US Central Time using format **May 01, 2026, 04:48 PM Central Time**.
   - In Version History, set the Date cell to the same current US Central Time value (include readable time).
4. Fill **every** section and table row with derived content. Use "TBD" or "None" sparingly — prefer concrete, PRD-backed statements.
5. Set initial Version to 0.1.0 and populate Version History accordingly (bold entire row).
6. Write the complete populated Markdown to the `artifacts.ddd.path` location.
7. Ensure the document ends exactly with `**End of DDD Document**`.

### Step 6. Handle Archive (if re-run)

If an existing DDD was archived in Step 0 (pre-check), record the archived path in state under `artifacts.ddd.archived_path`.

### Step 7. Write Review Notes (optional companion)

If there are high-risk or ambiguous items not fully captured in "Open Domain Decisions", create a companion `review-notes.md` in the same directory as the DDD summarizing them for human reviewers. This is secondary to the main DDD.

## Output Quality Bar

A good output from this skill lets a reviewer answer **immediately** from the document:

1. What are the major domain boundaries? (Bounded Contexts table + Context Relationships)
2. What is the language of the domain? (Ubiquitous Language + Key Distinctions)
3. What business objects and rules matter? (Domain Model + Business Invariants + Lifecycle)
4. What later DSL sections will likely be needed? (DSL-Oriented Modeling Notes — all subsections)
5. What assumptions remain open? (Open Domain Decisions table + Worked Examples)

**The document must be 100% template-compliant** — any deviation in structure (especially missing/malformed dates with time in US Central Time, or Version History table), missing subsection, or wrong table columns fails the quality bar.

## State Integration

This skill uses `scripts/af-state.sh` for state management.

### Pre-Execution

Before generating the DDD:

1. Source the state script:
   ```bash
   source "$HOME/coding-agents-config/scripts/af-state.sh"
   ```

2. Verify PRD dependency is met:
   ```bash
   if ! af_state_stage_complete "prd"; then
     echo "ERROR: PRD stage must be complete before generating DDD"
     exit 1
   fi
   ```

3. Read PRD input path from state:
   ```bash
   prd_path=$(af_state_get "artifacts.prd.path")
   # Returns: ai/specs/spec-be-prd.md
   ```

4. Read DDD output path from state:
   ```bash
   ddd_path=$(af_state_get "artifacts.ddd.path")
   # Returns: ai/specs/spec-be-ddd.md
   ```

5. Update artifact status to in_progress:
   ```bash
   af_state_artifact_update "ddd" "in_progress"
   ```

### Post-Execution

After successfully generating the DDD:

1. Approve the artifact:
   ```bash
   af_state_artifact_approve "ddd"
   ```

2. Complete the DDD stage and start DSL:
   ```bash
   af_state_stage_done "ddd"
   af_state_stage_start "dsl"
   ```

3. Verify state update:
   ```bash
   af_state_summary
   ```

### File Paths

| Artifact | State Path | Default Value |
|----------|------------|---------------|
| PRD (input) | `artifacts.prd.path` | `ai/specs/spec-be-prd.md` |
| DDD (output) | `artifacts.ddd.path` | `ai/specs/spec-be-ddd.md` |

---

**End of Skill Definition**
