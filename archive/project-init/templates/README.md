# {{PROJECT_NAME}}

This repository is an **App Factory** project following the standard workflow from business concept to implementation-ready artifacts.

## Project Purpose

This project is scaffolded to support the App Factory workflow, ensuring aligned documentation, consistent naming, and traceable artifacts from requirements through implementation.

## App Factory Workflow

The workflow follows this sequence:

1. **Business Scope Definition** - Define what the application is and what it solves
2. **Shared Glossary** - Establish canonical business terms
3. **Shared Domain Foundation** - Define entities, value objects, invariants
4. **Backend PRD** - Backend-focused requirements and service expectations
5. **Backend DDD** - Domain structure, aggregates, repositories, services
6. **API / Service Contracts** - Request/response contracts
7. **Frontend PRD** - UI requirements, journeys, states
8. **Screen Catalog** - Inventory of screens and capabilities
9. **Wireframes** - Visual and structural screen definitions
10. **UI DSL** - YAML specifications for coding agents
11. **Implementation Plan** - Phased task plan with dependencies
12. **Traceability Matrix** - Map requirements to implementation
13. **Code Generation / Implementation**
14. **Validation, Testing, and Review**

See `ai/specs/app-factory-workflow.md` for the complete workflow documentation.

## Folder Structure

```text
/ai
  /prompts                     # AI prompt templates
  /specs
    app-factory-workflow.md    # Workflow documentation
    /shared                    # Cross-layer canonical artifacts
    /backend                   # Backend PRD, DDD, API contracts
    /frontend                  # Frontend PRD, screen catalog
      /wireframes              # Wireframe definitions
      /dsl                     # UI DSL specifications
    /plans                     # Implementation plans, traceability
    /templates                 # Reusable artifact templates
```

## Naming Conventions

Use this pattern: `<artifact-type>-<scope>-<domain>-<capability>-v<major>.<minor>.<ext>`

| Scope | Meaning |
| ----- | ------- |
| `shared` | Cross-layer canonical artifact |
| `be` | Backend artifact |
| `fe` | Frontend artifact |
| `ux` | UX or wireframe artifact |
| `fullstack` | Cross-layer delivery artifact |

## Getting Started

1. Read `ai/specs/app-factory-workflow.md` to understand the workflow
2. Start with the business scope definition
3. Use templates in `ai/specs/templates/` as starting points
4. Follow the recommended authoring sequence
5. Maintain traceability between artifacts

## Templates Available

- `template-glossary-shared.md` - Shared business terminology
- `template-ddd-shared.md` - Shared domain foundation
- `template-prd-be.md` - Backend requirements
- `template-ddd-be.md` - Backend domain design
- `template-api-be.yaml` - API contract (OpenAPI)
- `template-prd-fe.md` - Frontend requirements
- `template-screen-fe.md` - Screen catalog
- `template-wire-ux.md` - Wireframe definition
- `template-dsl-fe.yaml` - UI DSL specification
- `template-plan-fullstack.md` - Implementation plan
- `template-trace-fullstack.md` - Traceability matrix

## AI Prompts

Use the prompts in `ai/prompts/` to drive each stage of the workflow with AI assistance.
