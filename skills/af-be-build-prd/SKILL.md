---
name: af-be-build-prd
description: Build a business-facing Product Requirements Document for a backend application, backend service, or backend platform module from a completed PRD worksheet. Use this skill when the user provides a PRD intake worksheet, questionnaire, discovery notes, or structured business answers and wants a polished backend-focused PRD draft.
triggers:
  - build prd
  - create prd
  - draft prd
  - generate prd from worksheet
  - turn worksheet into prd
  - convert intake worksheet to prd
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
input-hints:
  - worksheet markdown
  - worksheet docx converted to text
  - discovery notes
  - stakeholder answers
output-artifacts:
  - .appfactory/specs/spec-be-prd.md
memory-integration:
  reads_from:
    - project.name
    - config.target_project
  writes_to:
    - artifacts.prd.status
    - artifacts.prd.updated_at
    - artifacts.prd.generated_by
    - progress.current_phase
---

# af-be-build-prd

## Purpose

Use this skill to transform a completed **PRD Build Worksheet** into a clean, business-facing **Product Requirements Document** for a **backend application**, **backend service**, or **backend platform module**. The output must remain a PRD for business and development alignment. It must not drift into a DDD, architecture spec, implementation plan, aggregate model, repository design document, or client interaction specification.

## When to Use

Use this skill when the user:

1. Provides a completed PRD worksheet.
2. Provides structured answers to PRD intake questions.
3. Wants a first-draft PRD for a new backend module, backend platform capability, service, or application.
4. Wants business-facing requirements organized into a consistent house style.

Do not use this skill when the user is asking for:

1. A DDD or bounded context design.
2. A technical architecture document.
3. An implementation plan or task breakdown.
4. API-only design documentation.
5. Client interaction mockups, page-by-page specs, or interaction design.

## Inputs

The skill expects one or more of the following:

1. A completed PRD worksheet.
2. Discovery notes.
3. Stakeholder interview notes.
4. A business glossary.
5. Policy, compliance, or operational constraints.
6. Existing product/module context.

If the worksheet is incomplete, do not invent missing business facts. Keep the draft useful, but mark unresolved items under **Open Questions**, **Assumptions**, or **Pending Business Confirmation**.

## Required Output Qualities

The PRD must be:

1. **Business-facing**
2. **Structured**
3. **Precise**
4. **Consistent in terminology**
5. **Clear about scope**
6. **Clear about what is required vs optional**
7. **Clear about open decisions**
8. **Focused on backend behavior, integrations, data handling, security, and operations**

The PRD must not:

1. Introduce bounded contexts.
2. Introduce aggregates or entities.
3. Introduce repository contracts.
4. Introduce domain services.
5. Introduce infrastructure design unless explicitly required as a product constraint.
6. Invent exact technical solutions where the worksheet does not provide them.
7. Turn into a page catalog, mockup set, or interaction specification.

## Output Structure

Generate the PRD using this section hierarchy unless the user explicitly requests a different format:

1. `# <Project Name> PRD`
2. `## Document Control`
3. `## Executive Summary`
4. `## Business Context`
5. `## Problem Statement`
6. `## Users and Stakeholders`
7. `## Goals and Non-Goals`
8. `## Scope`
9. `## Business Glossary`
10. `## Functional Requirements`
11. `## Business Rules and Policies`
12. `## Lifecycle Expectations` (if relevant)
13. `## Role and Action Matrix` (if relevant)
14. `## Data and Content Requirements` (if relevant)
15. `## Configuration and Variability` (if relevant)
16. `## External Systems and Integrations`
17. `## Non-Functional Requirements`
18. `## Productization and Operational Requirements`
19. `## Assumptions`
20. `## Remaining Open Questions`
21. `## Approval`
22. `## Appendix` (optional)

## Writing Rules

1. Write in business language first.
2. Keep the document suitable for business, product, engineering, security, and compliance review.
3. Convert rough notes into polished requirement statements.
4. Preserve important business distinctions such as:
   1. goal vs non-goal
   2. in scope vs out of scope
   3. business rule vs implementation detail
   4. consent vs preference
   5. deletion vs purge
5. Normalize terminology across the document.
6. Resolve duplicate content by consolidating it into the strongest section.
7. Turn vague bullets into explicit requirement language where the business meaning is clear.
8. When the meaning is not clear, do not guess. Capture it as an open question.
9. Favor backend responsibilities such as APIs, integrations, lifecycle operations, data retention, authorization, auditability, and operational constraints over screen-by-screen behavior.

## Requirement Style Rules

Use these conventions:

1. Use **shall** for mandatory requirements.
2. Use **should** for recommended capabilities.
3. Use **may** only for optional or future-consideration language.
4. Put future-phase or deferred items under **Non-Goals**, **Out of Scope**, or **Future Considerations**.
5. Keep policy language explicit.

## Transformation Procedure

Follow this procedure exactly.

### Step 1. Read the worksheet fully

Extract:

1. Project/module name
2. Business purpose
3. User groups
4. Stakeholders
5. Goals
6. Non-goals
7. Scope items
8. Business rules
9. Compliance/security constraints
10. Integration expectations
11. Open questions

### Step 2. Normalize terminology

Create an internal normalized vocabulary for repeated terms. Prefer the terms used by the worksheet author unless they are clearly inconsistent.

### Step 3. Build the PRD outline

Create only the sections that are materially relevant. Do not force empty sections with filler text.

### Step 4. Translate notes into requirements

Turn worksheet statements into clear requirements. Examples:

1. `Need email login only for v1` becomes `The module shall support email/password authentication in version 1.`
2. `Admins need to unlock accounts` becomes `The administrative console shall support account unlock operations for authorized roles.`

### Step 5. Separate concerns

Place content in the right section:

1. goals and business value into **Goals**
2. exclusions into **Non-Goals** or **Out of Scope**
3. policy constraints into **Business Rules and Policies**
4. unresolved decisions into **Remaining Open Questions**

### Step 6. Add assumptions carefully

Only add assumptions when they are necessary to make the PRD readable and the assumption is strongly implied by the worksheet. Label assumptions clearly.

### Step 7. Capture gaps inline

Record missing information, ambiguities, and assumptions directly inside the PRD under:

1. `## Assumptions`
2. `## Remaining Open Questions`
3. any relevant scope or policy section where the gap materially changes interpretation

## Output Template

Use the template at `templates/prd-template.md` as the baseline output format.

## File Placement

Unless the user specifies otherwise:

1. Write the canonical backend PRD to `.appfactory/specs/spec-be-prd.md`
2. Keep unresolved items inside that file instead of creating a default sidecar notes file

If the repo already uses a different `.appfactory/specs` naming convention, preserve it.

## Quality Checklist

Before finalizing, confirm that the PRD:

1. reads as a business requirements document
2. does not drift into architecture or DDD
3. has clear goals, non-goals, scope, and open questions
4. uses consistent terminology
5. captures policy constraints explicitly
6. identifies missing decisions cleanly
7. is usable as upstream input for DDD and implementation planning

## Example Invocation

### Example 1

User intent:

`Build a PRD from this completed worksheet for a customer maintenance platform module.`

Expected result:

1. Read worksheet content.
2. Produce `.appfactory/specs/spec-be-prd.md`.
3. Capture assumptions and open questions inline in the PRD.

### Example 2

User intent:

`Convert these discovery notes into a first-draft PRD.`

Expected result:

1. Organize notes into PRD sections.
2. Identify missing business decisions.
3. Avoid technical design speculation.

## Refusal and Boundary Behavior

If the input is too sparse to support a PRD, do not fabricate content. Instead:

1. produce a skeletal PRD with only supported sections
2. place unresolved topics in **Remaining Open Questions**
3. explain the major gaps in **Assumptions** and **Remaining Open Questions**

## Memory Integration

This skill integrates with the AppFactory memory system via `af-memory`.

### Pre-Execution

Before generating the PRD:

1. Read project context from memory:
   ```
   project_name = af-memory read project.name
   target_project = af-memory read config.target_project
   ```

2. Update artifact status to in_progress:
   ```
   af-memory update-artifact prd in_progress af-be-build-prd
   ```

### Post-Execution

After successfully generating the PRD:

1. Update artifact status to completed:
   ```
   af-memory update-artifact prd completed af-be-build-prd
   ```

2. Advance pipeline phase:
   ```
   af-memory advance-phase ddd
   ```

3. Verify state update:
   ```
   af-memory status
   ```
