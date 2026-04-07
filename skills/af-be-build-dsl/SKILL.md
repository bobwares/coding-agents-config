---
name: af-be-build-dsl
description: Generate a backend application DSL YAML document from a human-readable Domain-Driven Design document. The output DSL is intended to be consumed by backend planning and backend code generation skills.
context: project
memory-integration:
  reads_from:
    - project.name
    - artifacts.ddd.path
    - artifacts.ddd.status
  writes_to:
    - artifacts.dsl.status
    - artifacts.dsl.updated_at
    - artifacts.dsl.generated_by
    - progress.current_phase
  requires:
    - artifacts.ddd.status: completed
---

# af-be-build-dsl

## Purpose

Use this skill to convert an approved human-readable **Domain-Driven Design (DDD)** document into a structured **backend application DSL YAML** representation.

The DSL produced by this skill is not a prose summary. It is a structured planning and generation input that captures the domain, bounded contexts, entities, workflows, rules, API implications, persistence implications, integration boundaries, and implementation-driving metadata needed by downstream skills.

This skill exists because the DSL YAML is used as input to:

1. the **AI coding agent planning skill**;
2. the **AI coding agent code generation skill**.

The DSL must therefore be:

1. consistent;
2. explicit;
3. deterministic where possible;
4. traceable back to the DDD;
5. safe for downstream automation.

## When to Use

Use this skill when:

1. a DDD document has been completed and reviewed;
2. the next step is to generate the domain/application DSL for planner and coding-agent workflows;
3. the project needs a machine-usable YAML representation of the domain model;
4. the planner or code generator expects YAML input rather than prose documents.

Do not use this skill when:

1. only a business PRD exists and no domain analysis has been performed;
2. the user is asking for an implementation plan rather than a DSL;
3. the user is asking for code, schema DDL, or API implementation directly.

## Inputs

The required input is:

1. a human-readable **DDD document**.

Optional supporting inputs may include:

1. the original **PRD**;
2. API or service notes;
3. schema notes;
4. policy or compliance notes;
5. existing DSL conventions from the repository.

If supporting inputs are available, use them only to clarify the DDD. The DDD remains the primary source for the DSL produced by this skill.

## Required Output

Generate the following file unless the user explicitly requests a different path:

1. `.appfactory/specs/dls-be-ddd.yaml`

The YAML file must be the canonical output. Keep unresolved items and assumptions inside the YAML under `planner_hints.unresolved_items` and `planner_hints.assumptions` instead of creating a default sidecar notes file.

## Output Goals

The generated YAML must be suitable for downstream planner/code-generator consumption and should include, where supported by the DDD:

1. project metadata;
2. domain summary;
3. ubiquitous language terms;
4. bounded contexts;
5. aggregates;
6. entities;
7. value objects;
8. enums/state models;
9. invariants/business rules;
10. commands/use cases;
11. domain events;
12. policies/configuration boundaries;
13. roles/authorization rules;
14. integrations/external systems;
15. API-driving operation hints;
16. persistence and data access hints;
17. integration and background-processing hints;
18. planner notes for implementation sequencing.

## Constraints

You must follow these constraints:

1. Keep the DSL human-readable but machine-structured.
2. Prefer explicit keys over dense freeform text.
3. Do not silently invent domain facts missing from the DDD.
4. If the DDD is ambiguous, preserve ambiguity in `planner_hints.unresolved_items` or `planner_hints.assumptions` instead of forcing false precision.
5. Preserve the DDD's business vocabulary.
6. Do not collapse multiple bounded contexts into a single structure unless the DDD clearly supports that.
7. Distinguish clearly between:
   1. domain rules;
   2. API hints;
   3. persistence hints;
   4. implementation notes.
8. The YAML must optimize for downstream planning and code generation, not for stakeholder prose readability.
9. Keep identifiers stable and normalized.
10. Do not embed executable code in the DSL.

## Generation Procedure

### Step 1. Read the DDD

Extract from the DDD:

1. domain summary;
2. domain scope;
3. bounded contexts;
4. ubiquitous language;
5. aggregates and entities;
6. business invariants;
7. lifecycle/state models;
8. commands and workflows;
9. domain events;
10. policies and variability points;
11. integration boundaries;
12. authorization-relevant rules.

### Step 2. Normalize for DSL Use

Convert the human-readable model into normalized YAML-ready structures:

1. identifiers in `snake_case` or repository-preferred naming;
2. lists for repeated structured items;
3. maps for named domain objects;
4. explicit fields for required vs optional behavior;
5. structured references rather than repeated prose.

### Step 3. Add Planning-Relevant Hints

Where supported by the DDD, include fields useful for planner/codegen stages such as:

1. `priority`;
2. `depends_on`;
3. `source_refs`;
4. `api_operations`;
5. `events_emitted`;
6. `validation_rules`;
7. `state_transitions`;
8. `acceptance_notes`;
9. `persistence_models`;
10. `integration_points`;
11. `background_jobs`.

Do not fabricate these when the DDD provides no basis.

### Step 4. Produce the YAML

Use the template in `templates/domain-dsl-template.yaml` as the default structure.

The YAML should be valid and consistently indented. Keep comments minimal and purposeful.

### Step 5. Embed unresolved items in the YAML

Populate `planner_hints.unresolved_items` and `planner_hints.assumptions` with:

1. assumptions;
2. ambiguities;
3. unresolved decisions;
4. sections that still need business or architecture review before implementation.

## YAML Structure Requirements

At minimum, the YAML should attempt to include these top-level sections when supported:

1. `dsl_version`
2. `project`
3. `domain`
4. `ubiquitous_language`
5. `bounded_contexts`
6. `shared_types`
7. `workflows`
8. `policies`
9. `roles`
10. `integrations`
11. `planner_hints`

Within bounded contexts, prefer structured subsections such as:

1. `purpose`
2. `aggregates`
3. `entities`
4. `value_objects`
5. `enums`
6. `commands`
7. `events`
8. `rules`
9. `read_models`
10. `service_hints`
11. `api_hints`
12. `persistence_hints`

## Important Distinctions

Preserve these distinctions in the DSL when present in the DDD:

1. **Account** vs **Profile**
2. **Consent** vs **Preference**
3. **Deletion** vs **Purge**
4. **Tenant** vs **Product**
5. **Support/Admin actions** vs **End-user self-service actions**

## Quality Checks

Before finalizing, verify that:

1. the YAML is syntactically valid;
2. every major bounded context from the DDD is represented or explicitly omitted with reason;
3. commands/events/rules are placed in the correct context;
4. state transitions are not contradictory;
5. planner/codegen relevant structures are represented consistently;
6. ambiguous items are documented in `planner_hints.unresolved_items` or `planner_hints.assumptions`.

## Forbidden Shortcuts

Do not:

1. turn the DDD into a flat CRUD list;
2. output only prose instead of structured YAML;
3. replace bounded-context structure with generic modules without evidence;
4. mix implementation code into the DSL;
5. invent transport contracts, persistence structures, or integration jobs unless the DDD clearly implies them.

## Expected Response Style

When running this skill:

1. state what input document is being used;
2. state that the YAML will be written to `.appfactory/specs/dls-be-ddd.yaml`;
3. summarize key assumptions briefly;
4. then generate the artifacts.

## Memory Integration

This skill integrates with the AppFactory memory system via `af-memory`.

### Pre-Execution

Before generating the DSL:

1. Verify DDD dependency is met:
   ```
   ddd_status = af-memory read artifacts.ddd.status
   if ddd_status != "completed":
     ERROR: DDD must be completed before generating DSL
   ```

2. Read DDD path from memory:
   ```
   ddd_path = af-memory read artifacts.ddd.path
   ```

3. Update artifact status to in_progress:
   ```
   af-memory update-artifact dsl in_progress af-be-build-dsl
   ```

### Post-Execution

After successfully generating the DSL:

1. Update artifact status to completed:
   ```
   af-memory update-artifact dsl completed af-be-build-dsl
   ```

2. Advance pipeline phase:
   ```
   af-memory advance-phase plan
   ```

3. Verify state update:
   ```
   af-memory status
   ```
