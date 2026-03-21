# App Generation Pipeline: Next.js + NestJS + Prisma

This document describes the skill orchestration pipeline for generating full-stack applications from DSL specifications.

## Overview

The `app-from-dsl` skill orchestrates a complete code generation pipeline that produces:

- **Backend**: NestJS REST API with Prisma ORM
- **Frontend**: Next.js React application
- **Persistence**: PostgreSQL via Prisma schema
- **Testing**: HTTP test artifacts, unit tests, e2e tests

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        app-from-dsl                             │
│                     (Orchestrator Skill)                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    dsl-model-interpreter                        │
│              Parse & validate DSL YAML files                    │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ prisma-persistence│ │nestjs-crud-resource│ │ react-form-page │
│   (Database)     │ │    (API Layer)    │ │   (Frontend)    │
└──────────────────┘ └──────────────────┘ └──────────────────┘
          │                   │                   │
          │                   ▼                   │
          │          ┌──────────────────┐         │
          │          │observability-nestjs│        │
          │          │   (Logging)      │         │
          │          └──────────────────┘         │
          │                   │                   │
          └─────────┬─────────┴─────────┬─────────┘
                    ▼                   ▼
          ┌──────────────────┐ ┌──────────────────┐
          │field-mapper-generator│ │http-test-artifacts│
          │    (Mappers)    │ │    (Testing)     │
          └──────────────────┘ └──────────────────┘
```

## Skill Dependencies

### Primary Orchestrator

| Skill | Description | Invokes |
|-------|-------------|---------|
| `app-from-dsl` | Full-stack application generator from DSL YAML specs | All skills below |

### Generation Pipeline (Execution Order)

| Order | Skill | Purpose | Inputs | Outputs |
|-------|-------|---------|--------|---------|
| 1 | `dsl-model-interpreter` | Parse and validate DSL YAML files | `dsl_path`, `entity` | Parsed models, mappers, pages, backend specs |
| 2 | `prisma-persistence` | Generate Prisma schema from persistence model | `parsed_model`, `dsl_context` | `schema.prisma`, migrations |
| 3 | `nestjs-crud-resource` | Generate NestJS module, controller, service, DTOs | `parsed_backend`, `parsed_api_model`, `dsl_context` | Module, controller, service, DTOs |
| 4 | `observability-nestjs` | Add structured logging, correlation IDs, tracing | `api_path` | Logger config, middleware, interceptors |
| 5 | `field-mapper-generator` | Generate transformation functions between layers | `parsed_mappers`, `dsl_context` | Mapper utilities |
| 6 | `react-form-page` | Generate React form and list pages | `parsed_pages`, `parsed_ui_model`, `dsl_context` | React components and pages |
| 7 | `http-test-artifacts` | Generate `.http` request files for testing | `parsed_backend`, `dsl_context` | HTTP test files |

### Supporting Skills

| Skill | Purpose | Used By |
|-------|---------|---------|
| `ui-implementation-language` | YAML language standard for UI definitions | `react-form-page` |

## Dependency Matrix

```
                         ┌─────────────────────┐
                         │   dsl-model-        │
                         │   interpreter       │
                         └─────────────────────┘
                                   │
           ┌───────────┬───────────┼───────────┬───────────┐
           │           │           │           │           │
           ▼           ▼           ▼           ▼           ▼
      ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
      │ prisma- │ │ nestjs- │ │ field-  │ │ react-  │ │ http-   │
      │ persist-│ │ crud-   │ │ mapper- │ │ form-   │ │ test-   │
      │ ence    │ │ resource│ │ generator│ │ page    │ │artifacts│
      └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘
```

**Key**: All generation skills depend on `dsl-model-interpreter` for parsed content.

## DSL File Structure

The pipeline expects DSL files organized as:

```
app-dsl/
├── models/
│   ├── api/
│   │   └── {entity}-api.model.yaml
│   ├── persistence/
│   │   └── {entity}.persistence.model.yaml
│   └── ui/
│       └── {entity}-form.model.yaml
├── mappers/
│   └── {entity}-*.mapper.yaml
├── backend/
│   └── {entity}.backend.yaml
├── ui/
│   └── pages/
│       ├── {entity}-create.page.yaml
│       ├── {entity}-list.page.yaml
│       ├── landing.page.yaml
│       └── *.page.yaml
└── lookups/
    └── *.lookup.yaml
```

## Output Structure

Generated code follows monorepo conventions:

```
app/
├── api/                          # NestJS Backend
│   ├── src/
│   │   ├── {entity}/
│   │   │   ├── {entity}.module.ts
│   │   │   ├── {entity}.controller.ts
│   │   │   ├── {entity}.service.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-{entity}.dto.ts
│   │   │   │   └── update-{entity}.dto.ts
│   │   │   └── mappers/
│   │   │       └── *.mapper.ts
│   │   └── prisma/
│   │       └── prisma.service.ts
│   ├── prisma/
│   │   └── schema.prisma
│   └── test/
│       └── {entity}.*.spec.ts
├── web/                          # Next.js Frontend
│   └── src/
│       ├── app/
│       │   └── (dashboard)/
│       │       ├── layout.tsx
│       │       └── {resource}/
│       │           ├── page.tsx
│       │           ├── new/page.tsx
│       │           └── [id]/edit/page.tsx
│       └── components/
│           ├── DashboardShell.tsx
│           └── ui/
│               └── ConfirmDialog.tsx
└── packages/                     # Shared packages
    └── shared/
http/                             # HTTP test files
└── {resource}-*.http
```

## Invocation Example

```yaml
# Invoke the orchestrator
skill: app-from-dsl
inputs:
  dsl_path: ./app-dsl
  entity: Customer
  resource: customers
```

The orchestrator will:

1. Validate the DSL path exists
2. Parse all DSL YAML files via `dsl-model-interpreter`
3. Generate Prisma schema via `prisma-persistence`
4. Generate NestJS backend via `nestjs-crud-resource`
5. Configure observability via `observability-nestjs`
6. Generate mappers via `field-mapper-generator`
7. Generate React frontend via `react-form-page`
8. Generate HTTP tests via `http-test-artifacts`

## Technology Stack

| Layer | Technology | Generated By |
|-------|------------|--------------|
| Frontend | Next.js 14+ (App Router) | `react-form-page` |
| UI Components | React + shadcn/ui | `react-form-page` |
| API | NestJS | `nestjs-crud-resource` |
| ORM | Prisma | `prisma-persistence` |
| Database | PostgreSQL | `prisma-persistence` |
| Validation | class-validator (API), Zod (UI) | Multiple skills |
| Testing | Jest, Supertest | `http-test-artifacts`, skill-generated tests |

## Related Skills

| Skill | Relationship |
|-------|--------------|
| `nestjs-prisma-resource` | Alternative standalone NestJS+Prisma generator (not DSL-driven) |
| `schema-to-database` | Generate from JSON Schema instead of DSL |
| `code-entity-to-crud` | Generate from existing TypeORM/JPA entities |

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-21 | Initial documentation |
