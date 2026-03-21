---
name: app-from-dsl
description: Orchestrates full-stack application generation from app-dsl YAML specifications. Use when generating a new domain (entity, CRUD API, forms, tests) from DSL blueprints.
---

# App From DSL

Generate a complete full-stack CRUD application from DSL YAML specifications.

## Purpose

Orchestrate child skills to produce:
- NestJS backend (module, controller, service, DTOs)
- Prisma persistence layer (schema, migrations)
- React frontend (**ALL pages** in `ui/pages/` including forms, lists, dashboards, and landing pages)
- Field mappers (API-to-persistence, form-to-API)
- HTTP test artifacts (`.http` request files)
- Unit and integration tests

## Use When

- Starting a new domain entity from scratch
- Adding CRUD operations for a new resource
- Generating a complete feature from DSL specification

## Inputs

| Input | Description | Required |
|-------|-------------|----------|
| `dsl_path` | File path to DSL directory or single YAML file | **Yes** |
| `entity` | Primary entity being generated (e.g., `Customer`) | **Yes** |
| `resource` | Plural REST resource (e.g., `customers`) | **Yes** |

### Input Path Specification

The `dsl_path` parameter is the **authoritative source** for locating DSL files. It can be:

1. **Directory path**: Points to a DSL directory containing the standard structure
2. **Single file path**: Points to a specific YAML file (for single-model generation)

**Examples:**
```
# Directory input
dsl_path: ./app-dsl
dsl_path: /Users/dev/project/specs/customer-dsl
dsl_path: ../shared/dsl-definitions

# Single file input
dsl_path: ./specs/customer.model.yaml
dsl_path: /absolute/path/to/customer-api.model.yaml
```

### Path Resolution Contract

Before invoking downstream skills, this orchestrator:

1. **Validates** the path exists
2. **Determines** input type (`directory` or `file`)
3. **Resolves** to absolute path
4. **Discovers** all DSL files (if directory)
5. **Passes** resolved context to downstream skills

**Resolved context structure:**
```json
{
  "originalPath": "./app-dsl",
  "resolvedPath": "/absolute/path/to/app-dsl",
  "inputType": "directory",
  "discoveredFiles": {
    "models": {
      "ui": ["customer-form.model.yaml"],
      "api": ["customer-api.model.yaml"],
      "persistence": ["customer.persistence.model.yaml"]
    },
    "mappers": ["customer-form-to-api.mapper.yaml", "..."],
    "pages": ["customer-create.page.yaml", "landing.page.yaml", "..."],
    "backend": ["customer.backend.yaml"],
    "lookups": ["countries.lookup.yaml", "..."]
  },
  "entity": "Customer",
  "resource": "customers"
}
```

## Outputs

| Output | Location |
|--------|----------|
| NestJS module | `app/api/src/{entity}/` |
| Prisma schema | `app/api/prisma/schema.prisma` |
| Dashboard shell | `app/web/src/components/DashboardShell.tsx` |
| Confirm dialog | `app/web/src/components/ui/ConfirmDialog.tsx` |
| Dashboard layout | `app/web/src/app/(dashboard)/layout.tsx` |
| React pages | `app/web/src/app/(dashboard)/{resource}/` |
| HTTP tests | `http/{resource}-*.http` |
| Unit tests | `app/api/test/`, `app/web/src/**/*.test.tsx` |

## Dependencies

This orchestrator invokes child skills in order:

| Order | Skill | Purpose |
|-------|-------|---------|
| 1 | `dsl-model-interpreter` | Validate and parse DSL YAML files |
| 2 | `prisma-persistence` | Generate Prisma schema from persistence model |
| 3 | `nestjs-crud-resource` | Generate NestJS module, controller, service, DTOs |
| 4 | `observability-nestjs` | Add structured logging, correlation IDs, request tracing |
| 5 | `field-mapper-generator` | Generate mapper utilities |
| 6 | `react-form-page` | Generate React form and list pages |
| 7 | `http-test-artifacts` | Generate HTTP request files |

## Repository Patterns Reproduced

- **Monorepo structure**: `app/api/` (NestJS), `app/web/` (Next.js), `app/packages/` (shared)
- **Root repo ownership**: Generated code under `app/api/src/`, `app/web/src/`, `app/web/tests/`, and `app/packages/` must remain tracked by the root repo. If a scaffold creates `app/web/.git` or another nested `.git`, remove or relocate it before final Git staging.
- **Module-per-entity**: Each entity gets its own NestJS module directory
- **Schema-driven validation**: DTOs use class-validator decorators
- **Prisma as ORM**: Single `schema.prisma` with all models
- **Metadata headers**: Every source file has version/turn metadata
- **Test co-location**: API tests in `app/api/test/`, UI tests alongside components

## Error Handling

### Path Validation Errors

| Error Condition | Message | Action |
|-----------------|---------|--------|
| Path does not exist | `Error: DSL path not found: {path}` | Halt - user must provide valid path |
| Path is neither file nor directory | `Error: Invalid path type: {path}` | Halt - unexpected filesystem state |
| Empty directory | `Error: No DSL files found in: {path}` | Halt - directory contains no YAML files |
| Missing required files | `Warning: Missing {file} for entity {entity}` | Continue with available files, log warning |
| Unsupported file extension | `Error: Unsupported file type: {ext}` | Halt - only `.yaml` and `.yml` supported |
| Malformed YAML | `Error: YAML parse error in {file}: {details}` | Halt - fix YAML syntax first |

### Recovery Guidance

If path validation fails:
1. Verify the path exists: `ls -la {dsl_path}`
2. Check file permissions: `stat {dsl_path}`
3. For directories, verify expected structure exists
4. For single files, verify `.yaml` or `.yml` extension

## Instructions

### Step 1: Validate DSL Path

**Before any generation, validate the input path:**

```bash
# Check path exists
if [ ! -e "$DSL_PATH" ]; then
  echo "Error: DSL path not found: $DSL_PATH"
  exit 1
fi

# Determine input type
if [ -d "$DSL_PATH" ]; then
  INPUT_TYPE="directory"
elif [ -f "$DSL_PATH" ]; then
  INPUT_TYPE="file"
else
  echo "Error: Invalid path type: $DSL_PATH"
  exit 1
fi

# Resolve to absolute path
RESOLVED_PATH=$(cd "$(dirname "$DSL_PATH")" && pwd)/$(basename "$DSL_PATH")
```

### Step 2: Discover DSL Files

**For directory input**, discover all DSL files:

```bash
# Find all YAML files
find "$RESOLVED_PATH" -name "*.yaml" -o -name "*.yml" | sort
```

**For file input**, use the single file as the model source.

### Step 3: Parse DSL Structure

```
Invoke: dsl-model-interpreter
Input:
  dsl_path: {RESOLVED_PATH}
  entity: {entity}
Expected: Parsed models object with validation errors (if any)
```

The interpreter will verify these DSL files exist (for directory input):
- `models/api/{entity}-api.model.yaml`
- `models/persistence/{entity}.persistence.model.yaml`
- `models/ui/{entity}-form.model.yaml`
- `backend/{entity}.backend.yaml`
- `ui/pages/*.page.yaml` — **ALL pages**, not just entity-specific ones (includes landing, dashboard, navigation pages)
- `mappers/{entity}-*.mapper.yaml`

**IMPORTANT**: Process ALL `.page.yaml` files in `ui/pages/`, regardless of naming convention. This includes:
- Entity CRUD pages (`{entity}-create.page.yaml`, `{entity}-list.page.yaml`, etc.)
- Dashboard/landing pages (`landing.page.yaml`, `home.page.yaml`)
- Navigation pages, settings pages, or any other application pages

### Step 4: Generate Persistence Layer

```
Invoke: prisma-persistence
Input:
  parsed_model: {interpreter_output.models.persistence}
  dsl_context: {resolved_context}
Output: Updated schema.prisma, migration files
```

Run validation:
```bash
cd app/api && npx prisma validate && npx prisma generate
```

### Step 5: Generate NestJS Backend

```
Invoke: nestjs-crud-resource
Input:
  parsed_backend: {interpreter_output.backend}
  parsed_api_model: {interpreter_output.models.api}
  dsl_context: {resolved_context}
Output: Module, controller, service, DTOs
```

Run validation:
```bash
cd app/api && pnpm run build && pnpm run test
```

### Step 6: Configure Observability

```
Invoke: observability-nestjs
Input:
  api_path: app/api
Output: Logger configuration, middleware, interceptors
```

This step runs once per app (not per entity). Skip if observability is already configured.

### Step 8: Generate Mappers

```
Invoke: field-mapper-generator
Input:
  parsed_mappers: {interpreter_output.mappers}
  dsl_context: {resolved_context}
Output: Mapper utility functions
```

### Step 9: Generate Shell Components

If DSL includes a shell definition (in `landing.page.yaml` or similar):

**Generate shared shell components:**
```
Output:
  - app/web/src/components/DashboardShell.tsx
  - app/web/src/components/ui/ConfirmDialog.tsx
  - app/web/src/app/(dashboard)/layout.tsx
```

**Shell includes:**
- Collapsible left sidebar navigation
- Top navigation bar
- Main content area slot
- State management for sidebar collapse

**ConfirmDialog includes:**
- Centered modal positioning
- Danger variant for delete confirmations
- Keyboard escape handling
- Focus management

### Step 10: Generate Frontend

```
Invoke: react-form-page
Input:
  parsed_pages: {interpreter_output.pages}
  parsed_ui_model: {interpreter_output.models.ui}
  parsed_shell: {interpreter_output.shell}
  dsl_context: {resolved_context}
Output: React components and pages inside route group
```

**When pages specify `shell` and `renderIn`:**
- Generate pages inside `(dashboard)` route group
- Pages render content only (no standalone page structure)
- Content appears in shell's main content area
- Use ConfirmDialog instead of window.confirm for delete actions

Run validation:
```bash
cd app/web && pnpm run build && pnpm run test
```

### Step 10: Generate HTTP Tests

```
Invoke: http-test-artifacts
Input:
  parsed_backend: {interpreter_output.backend}
  dsl_context: {resolved_context}
Output: http/{resource}-*.http files
```

### Step 11: Final Validation Loop

1. Run full test suite: `pnpm run test` (root)
2. Start API and verify health: `curl http://localhost:3001/health`
3. Run HTTP smoke tests manually or via REST client
4. Fix any failures before completing

## Usage Examples

### Example 1: Directory Input
```
Invoke: app-from-dsl
Input:
  dsl_path: ./app-dsl
  entity: Customer
  resource: customers
```

### Example 2: Absolute Path
```
Invoke: app-from-dsl
Input:
  dsl_path: /Users/dev/my-project/dsl-specs
  entity: Order
  resource: orders
```

### Example 3: Relative Path
```
Invoke: app-from-dsl
Input:
  dsl_path: ../shared/domain-specs/invoice-dsl
  entity: Invoice
  resource: invoices
```

### Example 4: Single Model File
```
Invoke: app-from-dsl
Input:
  dsl_path: ./specs/product.model.yaml
  entity: Product
  resource: products
```

**Note:** Single file input generates only the components derivable from that file. A complete DSL directory is recommended for full-stack generation.

## Required Tests

| Test Type | Location | Minimum Coverage |
|-----------|----------|------------------|
| Controller spec | `app/api/test/{entity}.controller.spec.ts` | CRUD operations |
| Service spec | `app/api/test/{entity}.service.spec.ts` | Business logic |
| DTO validation | `app/api/test/{entity}.dto.spec.ts` | Validation rules |
| Form component | `app/web/src/**/{entity}-form.test.tsx` | Field rendering, validation |
| HTTP requests | `http/{resource}-*.http` | Happy path, error cases |

## Constraints

- **DSL-first**: All generation derives from the provided DSL path
- **Explicit path required**: The `dsl_path` input must be provided — no default location assumed
- **No manual schema edits**: Persistence model drives Prisma schema
- **Metadata headers required**: Every generated file must have App/File/Version/Turn header
- **Tests mandatory**: Generation without tests is incomplete
- **Path validation first**: Always validate the input path before any generation

## Non-Goals

- Database migrations (handled by `prisma-persistence`)
- Authentication/authorization (separate concern)
- Deployment configuration
- Environment-specific settings
