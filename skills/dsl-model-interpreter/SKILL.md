---
name: dsl-model-interpreter
description: Parse and validate app-dsl YAML specifications. Use when reading DSL models, mappers, pages, backends, or lookups before code generation.
---

# DSL Model Interpreter

Parse, validate, and interpret DSL YAML files from a provided path for downstream generation skills.

## Purpose

Read the multi-layer DSL specification and provide:
- Validated model definitions (UI, API, persistence)
- Mapper transformation rules
- Page layout and field definitions
- Backend endpoint specifications
- Lookup data for dropdowns
- Path metadata for downstream skills

## Use When

- Before invoking any generation skill
- Validating DSL syntax and references
- Resolving cross-file references (e.g., `modelRef`)

## Inputs

| Input | Description | Required |
|-------|-------------|----------|
| `dsl_path` | Path to DSL file or directory | **Yes** |
| `entity` | Primary entity to interpret (PascalCase) | **Yes** |

### Path Input Specification

The `dsl_path` parameter accepts:

1. **Directory path**: Path to a DSL directory with standard structure
2. **Single file path**: Path to a specific YAML file

**Examples:**
```
# Directory inputs
dsl_path: ./app-dsl
dsl_path: /absolute/path/to/dsl-specs
dsl_path: ../shared/customer-dsl

# Single file inputs
dsl_path: ./specs/customer-api.model.yaml
dsl_path: /absolute/path/to/customer.persistence.model.yaml
```

### Path Resolution Rules

1. **Relative paths**: Resolved from the current working directory
2. **Absolute paths**: Used as-is
3. **Home directory (`~`)**: Expanded to user home
4. **Symlinks**: Resolved to actual path

## Outputs

| Output | Description |
|--------|-------------|
| `pathMetadata` | Original path, resolved path, input type, discovered files |
| `models` | Parsed UI, API, persistence model objects |
| `mappers` | Mapper definitions with resolved references |
| `pages` | Page layout definitions |
| `backend` | Backend endpoint specifications |
| `lookups` | Lookup data for dropdowns |
| `validationErrors` | List of schema violations (empty if valid) |

### Output Structure

```json
{
  "pathMetadata": {
    "originalPath": "./app-dsl",
    "resolvedPath": "/absolute/path/to/app-dsl",
    "inputType": "directory",
    "discoveredFiles": {
      "models": {
        "ui": ["customer-form.model.yaml"],
        "api": ["customer-api.model.yaml"],
        "persistence": ["customer.persistence.model.yaml"]
      },
      "mappers": ["customer-form-to-api.mapper.yaml"],
      "pages": ["customer-create.page.yaml"],
      "backend": ["customer.backend.yaml"],
      "lookups": ["countries.lookup.yaml"]
    }
  },
  "entity": "Customer",
  "models": {
    "ui": { ... },
    "api": { ... },
    "persistence": { ... }
  },
  "mappers": [ ... ],
  "pages": [ ... ],
  "backend": { ... },
  "lookups": { ... },
  "validationErrors": []
}
```

## Dependencies

None - this is a foundational skill.

## Error Handling

### Path Errors

| Error Condition | Message | Action |
|-----------------|---------|--------|
| Path does not exist | `Error: DSL path not found: {path}` | Halt with error |
| Path not readable | `Error: Cannot read path: {path}` | Halt with error |
| Empty directory | `Error: No YAML files found in: {path}` | Halt with error |
| Unsupported extension | `Error: Unsupported file type: {ext}. Expected .yaml or .yml` | Halt with error |

### YAML Errors

| Error Condition | Message | Action |
|-----------------|---------|--------|
| Invalid YAML syntax | `Error: YAML parse error in {file}: {details}` | Halt with error |
| Missing required key | `Error: Missing required key '{key}' in {file}` | Add to validationErrors |
| Invalid version | `Error: Unsupported DSL version '{version}' in {file}` | Halt with error |

### Reference Errors

| Error Condition | Message | Action |
|-----------------|---------|--------|
| Broken reference | `Error: Cannot resolve reference '{ref}' in {file}` | Add to validationErrors |
| Circular reference | `Error: Circular reference detected: {chain}` | Halt with error |
| Referenced file missing | `Error: Referenced file not found: {ref_path}` | Add to validationErrors |

## Repository Patterns Reproduced

### DSL Directory Structure

```
app-dsl/
  README.md
  models/
    ui/{entity}-form.model.yaml
    api/{entity}-api.model.yaml
    persistence/{entity}.persistence.model.yaml
  mappers/
    {entity}-form-to-api.mapper.yaml
    {entity}-api-to-persistence.mapper.yaml
    {entity}-persistence-to-api.mapper.yaml
  lookups/
    {lookup-name}.lookup.yaml
  ui/
    pages/{entity}-create.page.yaml
    pages/{entity}-edit.page.yaml
  backend/
    {entity}.backend.yaml
```

### Model Kinds

| Kind | File Pattern | Purpose |
|------|--------------|---------|
| `ui-model` | `models/ui/*.yaml` | Form state, UI-only fields |
| `api-model` | `models/api/*.yaml` | Request/response contracts |
| `persistence-model` | `models/persistence/*.yaml` | Database schema |

### Reference Syntax

```yaml
# Within same file
modelRef: '#/models/AddressDto'

# Cross-file reference
modelRef: ../models/api/customer-api.model.yaml#/models/CreateCustomerRequest
optionsRef: ../../lookups/countries.lookup.yaml#/lookup/items
```

## Instructions

### Step 1: Validate and Resolve Path

**First, validate the provided `dsl_path`:**

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
  # Validate file extension
  case "$DSL_PATH" in
    *.yaml|*.yml) ;;
    *) echo "Error: Unsupported file type. Expected .yaml or .yml"; exit 1 ;;
  esac
else
  echo "Error: Invalid path type: $DSL_PATH"
  exit 1
fi

# Resolve to absolute path
RESOLVED_PATH=$(cd "$(dirname "$DSL_PATH")" && pwd)/$(basename "$DSL_PATH")
```

### Step 2: Discover DSL Files

**For directory input**, discover all entity-related files:

```bash
# Find all YAML files
find "$RESOLVED_PATH" -name "*.yaml" -o -name "*.yml" | sort

# For entity-specific files
find "$RESOLVED_PATH" -name "*${ENTITY}*" \( -name "*.yaml" -o -name "*.yml" \) | sort
```

Build the `discoveredFiles` structure:
- `models/ui/` → UI model files
- `models/api/` → API model files
- `models/persistence/` → Persistence model files
- `mappers/` → Mapper files
- `ui/pages/` → Page definitions
- `backend/` → Backend specifications
- `lookups/` → Lookup data

**For single file input**, use only that file.

### Step 3: Read Model Files

For the target entity, read these files from the resolved path:

```
{resolved_path}/models/ui/{entity}-form.model.yaml
{resolved_path}/models/api/{entity}-api.model.yaml
{resolved_path}/models/persistence/{entity}.persistence.model.yaml
```

Validate each has:
- `version: 1` header
- `models:` root key
- At least one model definition with `kind:` field

### Step 2: Validate Field Definitions

For each model, validate fields have:

| Field Attribute | Required | Valid Values |
|-----------------|----------|--------------|
| `type` | Yes | `string`, `number`, `boolean`, `object`, `ref`, `array`, `uuid`, `varchar(n)`, `jsonb`, etc. |
| `required` | No | `true`, `false` |
| `nullable` | Persistence only | `true`, `false` |
| `primaryKey` | Persistence only | `true` |

### Step 3: Resolve References

For each `modelRef`, `optionsRef`, or `mapperRef`:

1. Parse the reference: `{file-path}#{json-pointer}`
2. If relative, resolve from current file location
3. Read referenced file
4. Navigate JSON pointer to extract definition
5. Cache resolved reference for reuse

**Gotcha**: References use JSON Pointer syntax (`#/models/Name`), not JSONPath.

### Step 5: Read Mapper Files

From the resolved path:
```
{resolved_path}/mappers/{entity}-form-to-api.mapper.yaml
{resolved_path}/mappers/{entity}-api-to-persistence.mapper.yaml
{resolved_path}/mappers/{entity}-persistence-to-api.mapper.yaml
```

Validate each mapper has:
- `fromModelRef` and `toModelRef`
- `rules:` with field mappings

### Mapper Rule Types

| Rule Type | Syntax | Example |
|-----------|--------|---------|
| Direct copy | `from: fieldName` | `first_name: { from: firstName }` |
| Nested access | `from: parent.child` | `home_city: { from: homeAddress.city }` |
| Generated | `generated: uuid` | `customer_id: { generated: uuid }` |
| Expression | `fromExpr: expression` | `password_hash: { fromExpr: hash(password) }` |
| Conditional | `fromExpr: cond ? a : b` | Preserve existing if null |

### Step 6: Read Page Definitions

From the resolved path:
```
{resolved_path}/ui/pages/{entity}-create.page.yaml
{resolved_path}/ui/pages/{entity}-edit.page.yaml
```

Validate page structure:

```yaml
page:
  id: {entity}-create
  route: /{resources}/new
  title: Create {Entity}
  mode: create | edit
  layout:
    type: single-column
  form:
    modelRef: ../../models/ui/{entity}-form.model.yaml#/models/{Entity}Form
    stateAlias: {entity}
    submitAction: create{Entity}
  sections:
    - id: section-name
      type: form-section
      title: Section Title
      fields:
        - id: fieldId
          type: text-field | select | checkbox | button
          label: Field Label
          bind: {alias}.{field}
```

### Step 7: Read Backend Definition

From the resolved path:
```
{resolved_path}/backend/{entity}.backend.yaml
```

Validate endpoint structure:

```yaml
service:
  id: {entity}-service
  namespace: {entity}
endpoints:
  create{Entity}:
    method: POST
    path: /api/{resources}
    requestModelRef: ...
    responseModelRef: ...
    persistenceMapperRef: ...
```

### Step 8: Read Lookups

From the resolved path:
```
{resolved_path}/lookups/{lookup-name}.lookup.yaml
```

Expected format:

```yaml
lookup:
  id: countries
  items:
    - label: USA
      value: USA
    - label: Canada
      value: Canada
```

### Step 9: Output Parsed Data

Return structured object with path metadata and all parsed/resolved definitions:

```json
{
  "pathMetadata": {
    "originalPath": "./app-dsl",
    "resolvedPath": "/absolute/path/to/app-dsl",
    "inputType": "directory",
    "discoveredFiles": {
      "models": {
        "ui": ["customer-form.model.yaml"],
        "api": ["customer-api.model.yaml"],
        "persistence": ["customer.persistence.model.yaml"]
      },
      "mappers": ["customer-form-to-api.mapper.yaml"],
      "pages": ["customer-create.page.yaml", "customer-edit.page.yaml"],
      "backend": ["customer.backend.yaml"],
      "lookups": ["countries.lookup.yaml", "us-states.lookup.yaml"]
    }
  },
  "entity": "Customer",
  "models": {
    "ui": { ... },
    "api": { ... },
    "persistence": { ... }
  },
  "mappers": [ ... ],
  "pages": [ ... ],
  "backend": { ... },
  "lookups": { ... },
  "validationErrors": []
}
```

**Note**: This output is passed to downstream skills. The `pathMetadata` allows downstream skills to locate additional files if needed, while parsed content (`models`, `mappers`, etc.) provides ready-to-use data for code generation.

## Required Tests

Not applicable - this is a read-only interpretation skill.

## Constraints

- **YAML only**: DSL files must be valid YAML (`.yaml` or `.yml` extension)
- **Version 1**: Only `version: 1` DSL format supported
- **Explicit path required**: The `dsl_path` input must be provided — no default location assumed
- **Relative references**: All internal references (`modelRef`, etc.) are relative to file location
- **No circular references**: References must not form cycles
- **Path validation first**: Always validate the input path before reading any files

## Usage Examples

### Example 1: Directory Input
```
Invoke: dsl-model-interpreter
Input:
  dsl_path: ./app-dsl
  entity: Customer
```

### Example 2: Absolute Path
```
Invoke: dsl-model-interpreter
Input:
  dsl_path: /Users/dev/project/specs/dsl
  entity: Order
```

### Example 3: Single File
```
Invoke: dsl-model-interpreter
Input:
  dsl_path: ./specs/customer-api.model.yaml
  entity: Customer
```

**Note:** Single file input returns only the parsed content of that file. Full pipeline generation requires directory input with complete DSL structure.

## Non-Goals

- Code generation (delegated to other skills)
- DSL schema enforcement (assumes valid DSL)
- DSL creation or editing
