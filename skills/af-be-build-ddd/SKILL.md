---
name: af-be-build-ddd
description: Generate a human-readable backend Domain-Driven Design document from an approved PRD. The output must translate business requirements into a backend application domain design optimized for downstream DSL generation, backend planning workflows, and AI coding agents.
context: project
memory-integration:
  reads_from:
    - project.name
    - artifacts.prd.path
    - artifacts.prd.status
  writes_to:
    - artifacts.ddd.status
    - artifacts.ddd.updated_at
    - artifacts.ddd.generated_by
    - progress.current_phase
  requires:
    - artifacts.prd.status: completed
---

# af-be-build-ddd

## Purpose

Use this skill to create a **backend-focused Domain-Driven Design (DDD) document** from a completed **Product Requirements Document (PRD)**.

The generated DDD is still a **human-readable design artifact**, but it must be written with a second purpose in mind:

1. it must define the domain clearly enough for human review;
2. it must provide structured design inputs for later **DSL generation**;
3. it must support downstream **backend planner** workflows and **AI coding agent** execution.

This skill is not for writing business requirements. It assumes the PRD already exists and has been reviewed as the business-facing requirements document.

## When To Use

Use this skill when:

1. a PRD exists and has enough clarity to support domain modeling;
2. the next step is to derive a backend domain design from business requirements;
3. the team needs a backend-oriented design artifact that is readable by humans and useful for structured generation;
4. the resulting document will later drive DSL design, planning, implementation, and validation.

Do **not** use this skill when the requirements are still vague enough that a PRD should be revised first.

## Required Input

You must be given one of the following:

1. a completed PRD in Markdown;
2. a PRD plus supporting business notes;
3. a PRD plus a domain schema or object list if available.

The PRD is the primary source of truth.

## Output Files

By default, write the following file:

1. `.appfactory/specs/spec-be-ddd.md`

If the repo already uses a different `.appfactory/specs` convention, preserve local project conventions.

## Output Goals

The generated DDD must:

1. remain human-readable;
2. stay focused on business-domain structure rather than low-level implementation;
3. define enough structure to support later **DSL authoring**;
4. identify what the backend planner and AI coding agent will need to know;
5. separate confirmed domain facts from assumptions and unresolved items.

## Non-Goals

Do **not** turn the DDD into:

1. a raw API spec;
2. a transport contract inventory;
3. an implementation plan;
4. a sprint backlog;
5. a database DDL document;
6. a client interaction specification;
7. a code-generation prompt.

Those artifacts may be derived later.

## DDD Writing Rules

The DDD must be written as a structured domain-design document using clear headings and tables where useful.

The DDD should focus on the information needed to create a future **system DSL**. That means the document should emphasize:

1. bounded contexts;
2. domain capabilities;
3. aggregates and entities;
4. value objects;
5. invariants;
6. lifecycle/state rules;
7. commands and outcomes;
8. domain events;
9. policies and configuration boundaries;
10. authorization-relevant business rules;
11. external-system boundaries;
12. ownership and source-of-truth assignments;
13. open domain decisions;
14. service boundaries, transport boundaries, persistence responsibilities, and asynchronous backend workflows where relevant.

## Required DDD Structure

The generated DDD should follow this structure unless the project has a stronger established standard.

### 1. Document Control

Include:

1. title;
2. version;
3. status;
4. author/prepared by;
5. source PRD reference;
6. created date;
7. last updated date.

### 2. Domain Summary

Explain:

1. what domain capability is being designed;
2. why it exists;
3. what core business responsibility it owns.

### 3. Scope of the Domain Model

List:

1. what is inside the domain design;
2. what is explicitly outside;
3. what is deferred.

### 4. Ubiquitous Language

Create a glossary of domain terms that the planner, DSL author, and AI coding agents must use consistently.

Explicitly distinguish commonly confused terms.

### 5. Domain Capabilities

Summarize the key capabilities the domain must support.

These should be domain-oriented, not client-interaction-oriented.

### 6. Bounded Contexts

For each bounded context, define:

1. purpose;
2. owned data;
3. owned behavior;
4. upstream dependencies;
5. downstream consumers;
6. notes for DSL generation.

### 7. Context Relationships

Describe the context map at a practical level.

Include:

1. upstream/downstream relationships;
2. external systems;
3. anti-corruption boundaries where applicable;
4. source-of-truth implications.

### 8. Domain Model

Define likely:

1. aggregate roots;
2. entities;
3. value objects.

For each aggregate, identify the business responsibility and invariants it protects.

### 9. Business Invariants

List explicit invariants in testable language.

These must be phrased so they can later become DSL constraints, validation rules, or planner rules.

### 10. Lifecycle and State Models

Describe lifecycle states and allowed transitions for relevant domain objects.

### 11. Commands and Business Outcomes

List major business actions and their expected outcomes.

Where possible, include:

1. actor;
2. preconditions;
3. postconditions;
4. failure conditions.

### 12. Domain Events

List meaningful domain events and what business fact each event communicates.

Also note which downstream systems or processes may consume them.

### 13. Policies and Configuration Boundaries

Explain what is:

1. globally fixed;
2. tenant-configurable;
3. product-configurable;
4. policy-driven;
5. environment-specific.

This section is important for future DSL generation.

### 14. Authorization-Relevant Domain Rules

Define business-facing access and scope rules that materially affect the domain design.

### 15. External Systems and Integration Boundaries

Identify external systems and clarify whether they are:

1. source systems;
2. downstream consumers;
3. delegated capability providers.

### 16. DSL-Oriented Modeling Notes

This section is required.

Summarize the domain information that should later appear in the DSL, such as:

1. core objects;
2. field groups;
3. required fields;
4. state machines;
5. commands/actions;
6. validation and policy hooks;
7. relationships;
8. projections/views needed by planners or generators.

Do not write the DSL itself. Only describe what the DSL will need to represent.

### 17. Open Domain Decisions

List unresolved domain-model issues, ambiguities, and explicit assumptions that must be clarified before implementation or DSL finalization.

## Important Interpretation Rules

### Treat the PRD Correctly

The PRD is a business-facing source document. Do not rewrite it as if it were already a DDD.

Instead:

1. preserve business intent;
2. translate business requirements into domain structure;
3. identify where the PRD is specific enough to support domain design;
4. identify where business ambiguity prevents clean modeling.

### Avoid Over-Invention

Do not invent detailed domain behavior when the PRD is silent.

If something is unclear:

1. make the lightest reasonable assumption;
2. record it explicitly in the DDD;
3. add it to the DDD's open decisions or assumptions-oriented sections.

### Keep It Backend-Focused

Prefer modeling concerns that affect backend application design, including:

1. service boundaries;
2. persistence and data ownership;
3. API and integration responsibilities;
4. event publication and asynchronous processing;
5. authorization, audit, retention, and operational policies.

### Optimize for Downstream DSL Design

The DDD should make it easier to later define a DSL. That means the output must help answer questions like:

1. what are the main business objects;
2. which fields belong together;
3. which fields are required versus configurable;
4. what lifecycle states exist;
5. what actions cause state changes;
6. what invariants or validation rules exist;
7. what roles and policies affect behavior;
8. what events and integrations matter;
9. what information the planner and coding agents must preserve.

## Process

Follow this process.

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

### Step 2. Normalize Business Language

Create a consistent ubiquitous language section.

### Step 3. Derive Domain Structure

Infer:

1. bounded contexts;
2. domain capabilities;
3. aggregate candidates;
4. ownership boundaries.

### Step 4. Identify DSL-Shaping Information

Call out:

1. object structures;
2. configurable attributes;
3. state transitions;
4. validation and policy constraints;
5. action model;
6. projection or view needs.

### Step 5. Write the DDD

Write the domain document in clean Markdown.

### Step 6. Write Review Notes

Write the companion notes file containing unresolved or risky items.

## Output Quality Bar

A good output from this skill should let a reviewer answer:

1. what are the major domain boundaries;
2. what is the language of the domain;
3. what business objects and rules matter;
4. what later DSL sections will likely be needed;
5. what assumptions remain open.

## Template

Use the included template as the default output shape unless the repo already has a stricter DDD template.

`templates/ddd-template.md`

## Memory Integration

This skill integrates with the AppFactory memory system via `af-memory`.

### Pre-Execution

Before generating the DDD:

1. Verify PRD dependency is met:
   ```
   prd_status = af-memory read artifacts.prd.status
   if prd_status != "completed":
     ERROR: PRD must be completed before generating DDD
   ```

2. Read PRD path from memory:
   ```
   prd_path = af-memory read artifacts.prd.path
   ```

3. Update artifact status to in_progress:
   ```
   af-memory update-artifact ddd in_progress af-be-build-ddd
   ```

### Post-Execution

After successfully generating the DDD:

1. Update artifact status to completed:
   ```
   af-memory update-artifact ddd completed af-be-build-ddd
   ```

2. Advance pipeline phase:
   ```
   af-memory advance-phase dsl
   ```

3. Verify state update:
   ```
   af-memory status
   ```
