# Skills Library

Reusable Agent Skills for full-stack application generation, extracted from repository patterns.

## Overview

This skill library enables **DSL-first application generation** for any domain entity. Skills are derived from patterns established in the `base-node-fullstack` repository during turns 1-15.

## Skill Taxonomy

```
skills/
  app-from-dsl/          # Orchestrator - coordinates all skills
  dsl-model-interpreter/ # Foundation - parses YAML specifications
  prisma-persistence/    # Backend - database schema generation
  nestjs-crud-resource/  # Backend - API module generation
  field-mapper-generator/# Cross-cutting - layer transformation code
  react-form-page/       # Frontend - form and page generation
  http-test-artifacts/   # Testing - HTTP request file generation
```

## Skill Boundaries

### Orchestrator: `app-from-dsl`

**Scope**: End-to-end generation workflow coordination
**Responsibilities**:
- Invoke child skills in correct order
- Enforce validation between steps
- Ensure all artifacts are generated

### Foundation: `dsl-model-interpreter`

**Scope**: DSL parsing and validation only
**Responsibilities**:
- Read YAML files from `app-dsl/`
- Resolve cross-file references
- Validate schema structure
**Non-responsibilities**: Code generation, file writing

### Backend: `prisma-persistence`

**Scope**: Database schema only
**Responsibilities**:
- Generate Prisma model definitions
- Create migrations
- Generate Prisma client
**Non-responsibilities**: API code, business logic

### Backend: `nestjs-crud-resource`

**Scope**: NestJS module structure
**Responsibilities**:
- Module, controller, service files
- DTOs with validation decorators
- Module registration in app.module.ts
**Non-responsibilities**: Database operations (uses Prisma), authentication

### Cross-Cutting: `field-mapper-generator`

**Scope**: Data transformation utilities
**Responsibilities**:
- Mapper functions between layers
- Type definitions for source/target
- Transformation logic (hash, flatten, etc.)
**Non-responsibilities**: Business logic, validation

### Frontend: `react-form-page`

**Scope**: React components and pages
**Responsibilities**:
- Form component with fields
- Create/edit/list pages
- Validation logic
- API client functions
**Non-responsibilities**: Backend API, state management libraries

### Testing: `http-test-artifacts`

**Scope**: HTTP request files only
**Responsibilities**:
- `.http` files for REST clients
- Sample payloads
- Error case documentation
**Non-responsibilities**: Test automation, assertions

## Generation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        app-from-dsl                             │
│                       (Orchestrator)                            │
└─────────────────────────┬───────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
    ┌───────────┐   ┌───────────┐   ┌───────────┐
    │ DSL Model │   │ Prisma    │   │ HTTP Test │
    │Interpreter│──▶│Persistence│   │ Artifacts │
    └─────┬─────┘   └─────┬─────┘   └───────────┘
          │               │
          ▼               ▼
    ┌───────────┐   ┌───────────┐
    │ Field     │   │ NestJS    │
    │ Mapper    │◀──│ CRUD      │
    └─────┬─────┘   └───────────┘
          │
          ▼
    ┌───────────┐
    │ React     │
    │ Form Page │
    └───────────┘
```

## Repository Areas Informing Each Skill

| Skill | Primary Sources | Turn Origins |
|-------|-----------------|--------------|
| `app-from-dsl` | `app-dsl/`, workflow patterns | Turn 16 (this turn) |
| `dsl-model-interpreter` | `app-dsl/**/*.yaml` | Turn 8, 16 |
| `prisma-persistence` | `app/api/prisma/`, persistence models | Turn 1, 12 |
| `nestjs-crud-resource` | `app/api/src/customer/` | Turn 1, 6 |
| `field-mapper-generator` | `app-dsl/mappers/` | Turn 6, 8 |
| `react-form-page` | `app/web/src/app/customers/` | Turn 2, 7, 8, 10 |
| `http-test-artifacts` | `http/*.http` | Turn 5 |

## Discovered Patterns

### Stable Conventions (Turns 1-15)

1. **Monorepo structure**: `app/api/` (NestJS), `app/web/` (Next.js), `app/packages/` (shared)
2. **Module-per-entity**: Each domain entity gets its own NestJS module
3. **Metadata headers**: All source files have version/turn tracking
4. **Schema-driven validation**: DTOs use class-validator, forms use custom validation
5. **Three-layer models**: UI, API, and persistence models are distinct
6. **Explicit mappers**: No implicit field mapping between layers

### Experimental/Iterative (Changed Multiple Times)

1. **Logging format**: Iterated across turns 9, 11, 13-15
2. **Validation rules**: Evolved from basic to conditional (turns 6-8)
3. **Documentation style**: Multiple rewrites (turns 13-14)

### One-Off Fixes (Not Generalized)

1. ESLint Jest configuration (turns 3-4)
2. Prisma email field sync (turn 12)
3. Form autofill issues (turn 10)

## Mismatches Discovered

### DSL vs Implementation

| Area | DSL Definition | Actual Implementation |
|------|----------------|----------------------|
| State field | `stateCode` / `provinceText` | `state` (single field) |
| Validation timing | Declarative in DSL | Imperative in React |
| Mapper execution | Referenced by ID | Inline transformation |

### Prompts vs Final Code

| Prompt Intent | Actual Result |
|---------------|---------------|
| "Generate from schema" | Hybrid: schema + manual DSL |
| "End-to-end validation" | Per-layer validation (no shared) |
| "Reusable patterns" | Entity-specific implementations |

## Incomplete Areas

### Not Covered by Skills

1. **Authentication/Authorization**: No auth patterns extracted
2. **Complex queries**: Filtering, pagination, sorting
3. **File uploads**: No upload handling patterns
4. **Real-time features**: WebSockets, SSE
5. **Environment configuration**: Dev/staging/prod setup
6. **Deployment**: CI/CD, Docker, cloud deployment

### DSL Gaps

1. **Relationships**: No entity relationships defined
2. **Computed fields**: No derived/computed field support
3. **List/table pages**: No DSL for data tables
4. **Search/filter**: No query DSL

## How to Use

### Generate a New Domain Entity

1. Create DSL files in `app-dsl/`:
   - `models/ui/{entity}-form.model.yaml`
   - `models/api/{entity}-api.model.yaml`
   - `models/persistence/{entity}.persistence.model.yaml`
   - `mappers/{entity}-*.mapper.yaml`
   - `backend/{entity}.backend.yaml`
   - `ui/pages/{entity}-*.page.yaml`

2. Invoke the orchestrator:
   ```
   Invoke: app-from-dsl
   Entity: {Entity}
   Resource: {resources}
   ```

3. Validate all tests pass:
   ```bash
   pnpm run test
   ```

### Add Endpoints to Existing Entity

1. Update `app-dsl/backend/{entity}.backend.yaml`
2. Add new API models if needed
3. Re-invoke `nestjs-crud-resource`

### Modify Form Fields

1. Update `app-dsl/models/ui/{entity}-form.model.yaml`
2. Update `app-dsl/ui/pages/{entity}-*.page.yaml`
3. Re-invoke `react-form-page`

## Validation Checklist

Before considering generation complete:

- [ ] All YAML files in `app-dsl/` are valid
- [ ] `prisma validate` passes
- [ ] `pnpm run build` succeeds in `app/api/`
- [ ] `pnpm run build` succeeds in `app/web/`
- [ ] `pnpm run test` passes in `app/api/`
- [ ] `pnpm run test` passes in `app/web/`
- [ ] HTTP requests execute successfully
- [ ] All generated files have metadata headers

## Extending the Skills

### Adding a New Skill

1. Create directory: `skills/{skill-name}/`
2. Create `SKILL.md` with required sections
3. Add to orchestrator dependency list if needed
4. Document in this README

### Modifying Existing Skills

1. Update `SKILL.md` with new patterns
2. Add reference files if needed
3. Test with sample generation
4. Update version in metadata
