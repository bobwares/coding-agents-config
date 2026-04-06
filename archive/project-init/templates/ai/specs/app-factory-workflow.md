# App Factory Workflow v1

## Metadata Header

| Field                 | Value                                                                                                      |
| --------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Document Name**     | `app-factory-workflow.md`                                                                                  |
| **Title**             | **App Factory Workflow**                                                                                   |
| **Version**           | `1.0.0`                                                                                                    |
| **Status**            | `Draft`                                                                                                    |
| **Owner**             | **Architecture / Product / App Factory**                                                                   |
| **Scope**             | **Generic workflow for any application domain**                                                            |
| **Primary Use**       | **Define the end-to-end documentation-to-implementation workflow for App Factory projects**                |
| **Location**          | `ai/specs/app-factory-workflow.md`                                                                             |
| **Last Updated**      | `{{CURRENT_DATE}}`                                                                                         |
| **Related Artifacts** | **PRD**, **DDD**, **API Specs**, **Wireframes**, **DSL**, **Implementation Plan**, **Traceability Matrix** |

## Purpose

This document defines the standard workflow used by the **App Factory** to move from business concept to implementation-ready application artifacts.

The workflow is intentionally **domain-agnostic**. It can be used for customer maintenance, order entry, billing, inventory, case management, scheduling, onboarding, or any other application domain.

The goal is to produce a repeatable process that keeps **product requirements**, **domain design**, **UI design**, **technical contracts**, and **implementation planning** aligned so coding agents can generate consistent, traceable outputs.

## Design Principles

### Canonical Domain First

Every application must establish a shared business language before frontend and backend artifacts diverge. The domain vocabulary, field names, identifiers, rules, and lifecycle concepts should be defined once and then reused everywhere.

### Separate Product Concerns by Layer

Frontend and backend requirements should be written separately because they solve different problems.

The backend focuses on business behavior, data ownership, integrations, validation ownership, security, persistence, and contracts.

The frontend focuses on screens, user tasks, display logic, interaction rules, states, accessibility, and layout.

### Traceability Across the Whole Chain

Each downstream artifact must reference its upstream sources. A screen should trace back to a frontend requirement. A DSL file should trace back to a wireframe, screen definition, shared domain language, and API contract.

### Implementation-Oriented Outputs

All workflow outputs should be designed so they can be used by coding agents or implementation teams with minimal reinterpretation.

## Workflow Overview

### End-to-End Flow

The App Factory workflow follows this path:

1. **Business Scope Definition**
2. **Shared Glossary**
3. **Shared Domain Foundation**
4. **Backend PRD**
5. **Backend DDD**
6. **API / Service Contracts**
7. **Frontend PRD**
8. **Screen Catalog**
9. **Wireframes**
10. **UI DSL**
11. **Implementation Plan**
12. **Traceability Matrix**
13. **Code Generation / Implementation**
14. **Validation, Testing, and Review**

### Why This Order Works

This order establishes stable business language first, then defines backend behavior, then defines frontend interaction, then converts those specifications into implementation-ready artifacts.

That prevents the common failure modes where:

* frontend invents field names that do not match the domain
* backend APIs are designed without regard for screen workflows
* wireframes drift from business rules
* generated UI cannot be traced back to requirements

## Artifact Model

### Shared Artifacts

Shared artifacts define concepts that apply across the entire application.

| Artifact                     | Purpose                                                                              |
| ---------------------------- | ------------------------------------------------------------------------------------ |
| **Shared Glossary**          | Canonical business terms and definitions                                             |
| **Shared Domain Foundation** | Core entities, value objects, invariants, identifiers, code sets, lifecycle concepts |

### Backend Artifacts

Backend artifacts define business behavior and technical service boundaries.

| Artifact                   | Purpose                                                                  |
| -------------------------- | ------------------------------------------------------------------------ |
| **Backend PRD**            | Backend-focused requirements and service expectations                    |
| **Backend DDD**            | Domain structure, aggregates, repositories, invariants, services, events |
| **API / Service Contract** | Request/response contracts, validation boundaries, integration surfaces  |

### Frontend Artifacts

Frontend artifacts define user interaction and implementation-ready UI structure.

| Artifact           | Purpose                                                       |
| ------------------ | ------------------------------------------------------------- |
| **Frontend PRD**   | UI requirements, journeys, states, permissions, accessibility |
| **Screen Catalog** | Inventory of screens and capabilities                         |
| **Wireframes**     | Visual and structural screen definitions                      |
| **UI DSL**         | YAML specifications used by coding agents to build screens    |

### Delivery Artifacts

Delivery artifacts turn the specifications into an executable plan.

| Artifact                | Purpose                                                                   |
| ----------------------- | ------------------------------------------------------------------------- |
| **Implementation Plan** | Phased task plan, dependencies, milestones, acceptance criteria           |
| **Traceability Matrix** | Maps requirements to domain, screens, DSL, APIs, and implementation tasks |

## Standard Workflow Phases

### Phase 1: Business Scope Definition

#### Objective

Define what the application is, what problem it solves, who uses it, and what capabilities are in scope.

#### Outputs

* domain name
* capability list
* user types
* business goals
* initial constraints
* assumptions
* non-goals

#### Notes

This is the entry point. It is not detailed design. It establishes the problem space.

### Phase 2: Shared Domain Foundation

#### Objective

Create the canonical domain language used across the application.

#### Required Contents

* ubiquitous language
* bounded contexts
* entities
* value objects
* invariants
* canonical field names
* identifiers
* code sets and enums
* lifecycle states
* ownership rules

#### Outcome

All later documents should reuse this vocabulary.

### Phase 3: Backend Definition

#### Objective

Define the backend as the owner of business behavior and service contracts.

#### Backend PRD Must Cover

* backend capabilities
* service responsibilities
* validation ownership
* persistence needs
* integration requirements
* security and authorization
* audit requirements
* non-functional requirements

#### Backend DDD Must Cover

* bounded contexts
* aggregates
* entities
* value objects
* repository contracts
* domain services
* invariants
* state transitions
* events
* integration boundaries

#### Outcome

The backend becomes the authoritative owner of domain behavior and service contracts.

### Phase 4: Frontend Definition

#### Objective

Translate domain and service capabilities into user-facing behavior.

#### Frontend PRD Must Cover

* personas
* user journeys
* screen goals
* field presentation rules
* input behavior
* validation messages visible to users
* empty states
* error states
* loading states
* accessibility
* responsive behavior
* permissions by action

#### Outcome

The frontend becomes the authoritative owner of screen behavior and interaction flow.

### Phase 5: Screen Design

#### Objective

Identify the full screen inventory and define each screen clearly enough for design and implementation.

#### Screen Catalog Must Cover

* screen ID
* capability
* screen name
* purpose
* primary domain objects
* primary actions
* upstream dependencies

#### Outcome

The screen catalog becomes the control point between requirements and design.

### Phase 6: Wireframes

#### Objective

Convert screen definitions into visual and structural designs.

#### Each Wireframe Must Include

* screen ID
* route or entry point
* layout regions
* sections
* components
* field groupings
* action controls
* state behavior
* conditional visibility
* notes about permissions or business rules

#### Outcome

The wireframe becomes the source for the UI DSL.

### Phase 7: UI DSL

#### Objective

Convert each approved wireframe into a machine-consumable YAML DSL specification.

#### Each DSL Must Include

* metadata
* screen ID
* capability
* route
* layout
* sections
* widgets
* field bindings
* validation rules
* visibility rules
* action bindings
* API mappings
* references to upstream artifacts

#### Outcome

The DSL becomes the direct input for coding agents.

### Phase 8: Execution Planning

#### Objective

Break the solution into atomic implementation tasks in the correct build order.

#### Implementation Plan Must Include

* phases
* milestones
* dependencies
* tasks
* outputs
* acceptance criteria
* test tasks
* review tasks
* risks
* sequencing

#### Outcome

The implementation plan becomes the execution contract for agentic delivery.

### Phase 9: Traceability and Governance

#### Objective

Ensure every important artifact can be traced backward and forward.

#### Traceability Must Cover

* requirements to domain concepts
* domain concepts to APIs
* requirements to screens
* screens to wireframes
* wireframes to DSL
* DSL to implementation tasks
* implementation tasks to test cases

#### Outcome

The project remains auditable and maintainable.

## Naming Conventions

### Core Pattern

Use this naming structure:

`<artifact-type>-<scope>-<domain>-<capability>-v<major>.<minor>.<ext>`

### Scope Values

| Scope       | Meaning                        |
| ----------- | ------------------------------ |
| `shared`    | Cross-layer canonical artifact |
| `be`        | Backend artifact               |
| `fe`        | Frontend artifact              |
| `ux`        | UX or wireframe artifact       |
| `int`       | Integration-specific artifact  |
| `fullstack` | Cross-layer delivery artifact  |

### Artifact Type Values

| Artifact Type | Meaning                             |
| ------------- | ----------------------------------- |
| `glossary`    | Business terminology                |
| `prd`         | Product requirements document       |
| `ddd`         | Domain-driven design document       |
| `api`         | API or service contract             |
| `screen`      | Screen catalog or screen definition |
| `wire`        | Wireframe                           |
| `dsl`         | YAML DSL                            |
| `plan`        | Implementation plan                 |
| `trace`       | Traceability matrix                 |

### Naming Rules

#### Domain Segment

The domain segment should represent the business area, such as:

* `customer-maintenance`
* `order-management`
* `billing`
* `inventory`
* `case-management`

#### Capability Segment

The capability segment should represent the feature slice, such as:

* `registration`
* `profile`
* `addresses`
* `preferences`
* `integrations`
* `audit`
* `search`
* `notifications`

#### Examples

| Artifact                 | Example Filename                                    |
| ------------------------ | --------------------------------------------------- |
| Shared glossary          | `glossary-shared-customer-maintenance-core-v1.0.md` |
| Shared domain foundation | `ddd-shared-customer-maintenance-core-v1.0.md`      |
| Backend PRD              | `prd-be-customer-maintenance-services-v1.0.md`      |
| Backend DDD              | `ddd-be-customer-maintenance-core-v1.0.md`          |
| API contract             | `api-be-customer-maintenance-rest-v1.0.yaml`        |
| Frontend PRD             | `prd-fe-customer-maintenance-ui-v1.0.md`            |
| Screen catalog           | `screen-fe-customer-maintenance-catalog-v1.0.md`    |
| Wireframe                | `wire-ux-customer-registration-v1.0.md`             |
| DSL                      | `dsl-fe-customer-registration-v1.0.yaml`            |
| Implementation plan      | `plan-fullstack-customer-maintenance-v1.0.md`       |
| Traceability matrix      | `trace-fullstack-customer-maintenance-v1.0.md`      |

## Standard Folder Structure

### Recommended Layout

```text
/ai
  /prompts
  /specs
    /shared
    /backend
    /frontend
      /wireframes
      /dsl
    /plans
    /templates
```

### Expanded Example

```text
/ai
  /prompts
    prompt-template.md
    prd-prompt.md
    ddd-prompt.md
    ...

  /specs
    app-factory-workflow.md

    /shared
      glossary-shared-<domain>-core-v1.0.md
      ddd-shared-<domain>-core-v1.0.md

    /backend
      prd-be-<domain>-services-v1.0.md
      ddd-be-<domain>-core-v1.0.md
      api-be-<domain>-rest-v1.0.yaml

    /frontend
      prd-fe-<domain>-ui-v1.0.md
      screen-fe-<domain>-catalog-v1.0.md

      /wireframes
        wire-ux-<domain>-<capability>-v1.0.md

      /dsl
        dsl-fe-<domain>-<capability>-v1.0.yaml

    /plans
      plan-fullstack-<domain>-v1.0.md
      trace-fullstack-<domain>-v1.0.md

    /templates
      template-glossary-shared.md
      template-ddd-shared.md
      template-prd-be.md
      template-ddd-be.md
      template-prd-fe.md
      template-screen-fe.md
      template-wire-ux.md
      template-dsl-fe.yaml
      template-plan-fullstack.md
      template-trace-fullstack.md
```

## Recommended Authoring Sequence

1. Create the **business scope**.
2. Create the **shared glossary**.
3. Create the **shared domain foundation**.
4. Create the **backend PRD**.
5. Create the **backend DDD**.
6. Create the **API / service contract**.
7. Create the **frontend PRD**.
8. Create the **screen catalog**.
9. Create the **wireframes**.
10. Create the **UI DSL** files.
11. Create the **implementation plan**.
12. Create the **traceability matrix**.
13. Start implementation and testing.

## Traceability Model

### Reference Rules

Each artifact must reference the artifacts it depends on.

| Artifact                     | Must Reference                                                       |
| ---------------------------- | -------------------------------------------------------------------- |
| **Shared Domain Foundation** | Shared glossary                                                      |
| **Backend PRD**              | Shared glossary, shared domain foundation                            |
| **Backend DDD**              | Shared glossary, shared domain foundation, backend PRD               |
| **API Contract**             | Shared domain foundation, backend PRD, backend DDD                   |
| **Frontend PRD**             | Shared glossary, shared domain foundation, backend PRD, API contract |
| **Screen Catalog**           | Frontend PRD                                                         |
| **Wireframe**                | Frontend PRD, screen catalog, shared domain foundation               |
| **UI DSL**                   | Wireframe, screen catalog, shared domain foundation, API contract    |
| **Implementation Plan**      | All major upstream artifacts                                         |
| **Traceability Matrix**      | All major upstream artifacts                                         |

### Practical Rule

No screen, DSL, or implementation task should introduce business terms or field names that are not defined upstream.

## Template Set Required by This Workflow

### Minimum Templates

The App Factory should maintain reusable templates for:

* shared glossary
* shared domain foundation
* backend PRD
* backend DDD
* frontend PRD
* screen catalog
* wireframe
* DSL metadata skeleton
* implementation plan
* traceability matrix

### Template Rule

Templates must remain generic and reusable. Domain-specific values should be filled in by project-specific prompts or workflow execution.

## Implementation Expectations

### What This Workflow Produces

This workflow produces a specification chain that is ready for code generation or manual implementation.

The intended outputs are:

* aligned documentation
* consistent naming
* implementation-ready UI specifications
* traceable API contracts
* task-ready execution planning

### What This Workflow Does Not Replace

This workflow does not replace:

* detailed technical architecture decisions for specific stacks
* runtime infrastructure design
* security reviews
* domain-specific compliance requirements
* implementation-level code reviews

Those are downstream activities that consume the outputs of this workflow.

## Acceptance Criteria

This workflow is considered correctly applied when:

1. A shared domain language exists and is reused consistently.
2. Backend and frontend PRDs are separate and aligned.
3. No separate frontend domain model is invented.
4. Every screen maps to a capability and domain objects.
5. Every DSL file maps to a wireframe and service contract.
6. The implementation plan breaks work into atomic execution tasks.
7. The traceability matrix can connect requirements to implementation artifacts.
8. The naming convention and folder structure are applied consistently.

## Future Extensions

### Additional Artifact Types

This workflow can later be extended with:

* ADRs
* test plans
* security requirements
* data migration plans
* environment profiles
* deployment runbooks
* observability specifications
* seed data definitions

### Reuse Across Domains

This document is intended to be reused unchanged across domains. Only the domain-specific artifacts created under the workflow should vary.

## Summary

The **App Factory Workflow** defines a standard, reusable path from business scope to implementation-ready artifacts.

It ensures that:

* the domain is defined once
* backend and frontend responsibilities stay distinct
* wireframes and DSLs remain grounded in shared language and contracts
* implementation planning is traceable and executable
* the process can scale across many domains without redesigning the workflow each time
