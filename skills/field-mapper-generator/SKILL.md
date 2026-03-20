---
name: field-mapper-generator
description: Generate field mapper/converter utilities from DSL mapper specifications. Use when creating transformation code between UI, API, and persistence layers.
---

# Field Mapper Generator

Generate TypeScript mapper utilities from `app-dsl/mappers/` specifications.

## Purpose

Create transformation functions for:
- Form data to API request (UI -> API)
- API request to persistence (API -> DB)
- Persistence to API response (DB -> API)

## Use When

- Different field names between layers
- Type transformations needed (password -> hash)
- Nested object flattening (address -> address_line1, etc.)

## Inputs

| Input | Description | Required |
|-------|-------------|----------|
| `parsed_mappers` | Array of parsed mapper specifications from `dsl-model-interpreter` | **Yes** |
| `dsl_context` | DSL context with path metadata from orchestrator | **Yes** |

### Input Contract

This skill receives **parsed content** from the `dsl-model-interpreter`, not raw file paths.

**Expected `parsed_mappers` structure:**
```json
[
  {
    "name": "CreateCustomerRequestToCustomerRecord",
    "fromModelRef": "...",
    "toModelRef": "...",
    "fromModel": { ... },
    "toModel": { ... },
    "rules": {
      "customer_id": { "generated": "uuid" },
      "first_name": { "from": "firstName" }
    }
  }
]
```

The `fromModel` and `toModel` fields contain **resolved** model definitions (the interpreter resolves references before passing to this skill).

**Expected `dsl_context` structure:**
```json
{
  "originalPath": "./app-dsl",
  "resolvedPath": "/absolute/path/to/app-dsl",
  "inputType": "directory",
  "entity": "Customer",
  "resource": "customers"
}
```

### Legacy Compatibility

**Deprecated:** Direct file path inputs are deprecated. Use the orchestrator's parsed content instead.

## Outputs

| Output | Location |
|--------|----------|
| Mapper utilities | `app/api/src/{entity}/mappers/{mapper-name}.mapper.ts` |
| Mapper tests | `app/api/test/{entity}/mappers/{mapper-name}.mapper.spec.ts` |

## Dependencies

| Skill | Purpose |
|-------|---------|
| `dsl-model-interpreter` | Parse mapper and model YAML |

## Repository Patterns Reproduced

### Mapper File Structure

```
app/api/src/{entity}/mappers/
  form-to-api.mapper.ts
  api-to-persistence.mapper.ts
  persistence-to-api.mapper.ts
  index.ts  # Re-exports
```

### DSL Mapper Format

```yaml
mappers:
  CreateCustomerRequestToCustomerRecord:
    fromModelRef: ../models/api/customer-api.model.yaml#/models/CreateCustomerRequest
    toModelRef: ../models/persistence/customer.persistence.model.yaml#/models/CustomerRecord
    rules:
      customer_id:
        generated: uuid
      first_name:
        from: firstName
      password_hash:
        fromExpr: hash(password)
      home_line1:
        from: homeAddress.line1
```

### Mapper Function Pattern

```typescript
import { v4 as uuidv4 } from 'uuid';
import { hash } from '../utils/hash';

export interface CreateCustomerRequest {
  firstName: string;
  lastName: string;
  password: string;
  homeAddress: {
    line1: string;
    city: string;
    // ...
  };
}

export interface CustomerRecord {
  customer_id: string;
  first_name: string;
  last_name: string;
  password_hash: string;
  home_line1: string;
  home_city: string;
  // ...
}

export function mapCreateCustomerRequestToCustomerRecord(
  source: CreateCustomerRequest
): CustomerRecord {
  return {
    customer_id: uuidv4(),
    first_name: source.firstName,
    last_name: source.lastName,
    password_hash: hash(source.password),
    home_line1: source.homeAddress.line1,
    home_city: source.homeAddress.city,
    // ...
  };
}
```

### Rule Type Implementations

| Rule Type | DSL Syntax | TypeScript Output |
|-----------|------------|-------------------|
| Direct copy | `from: fieldName` | `target = source.fieldName` |
| Nested access | `from: parent.child` | `target = source.parent?.child` |
| Generated UUID | `generated: uuid` | `target = uuidv4()` |
| Generated timestamp | `generated: timestamp` | `target = new Date().toISOString()` |
| Hash expression | `fromExpr: hash(password)` | `target = hash(source.password)` |
| Conditional | `fromExpr: a ? b : c` | `target = source.a ? source.b : source.c` |
| Preserve existing | `fromExpr: preserveExisting()` | Handled in update mapper |

## Instructions

### Step 1: Use Parsed Mapper Specifications

**Receive parsed mappers from the orchestrator** (via `dsl-model-interpreter` output):

```json
[
  {
    "name": "CreateCustomerRequestToCustomerRecord",
    "fromModel": { ... },
    "toModel": { ... },
    "rules": {
      "customer_id": { "generated": "uuid" },
      "first_name": { "from": "firstName" }
    }
  },
  {
    "name": "CustomerRecordToCustomerResponse",
    "fromModel": { ... },
    "toModel": { ... },
    "rules": { ... }
  }
]
```

**Note:** Do NOT read DSL files directly. The orchestrator provides pre-parsed content with resolved model references.

### Step 2: Resolve Model References

For each `fromModelRef` and `toModelRef`:

1. Parse file path and JSON pointer
2. Load referenced model
3. Extract field definitions

### Step 3: Generate Type Interfaces

From source and target models, create TypeScript interfaces:

```typescript
// Source type
export interface CreateCustomerRequest {
  firstName: string;
  middleInitial?: string;
  homeAddress: AddressDto;
}

// Target type
export interface CustomerRecord {
  customer_id: string;
  first_name: string;
  middle_initial: string | null;
  home_line1: string;
}
```

### Step 4: Generate Mapper Function

For each mapper definition:

```typescript
export function map{SourceType}To{TargetType}(
  source: {SourceType}
): {TargetType} {
  return {
    // Generate each field from rules
  };
}
```

### Step 5: Implement Rule Transformations

**Direct copy (`from`):**
```typescript
first_name: source.firstName,
```

**Nested access (`from: parent.child`):**
```typescript
home_line1: source.homeAddress?.line1 ?? '',
```

**Generated UUID:**
```typescript
import { v4 as uuidv4 } from 'uuid';
customer_id: uuidv4(),
```

**Hash expression:**
```typescript
import { hashPassword } from '../utils/hash';
password_hash: hashPassword(source.password),
```

**Conditional expression:**
```typescript
// fromExpr: password != null ? hash(password) : preserveExisting()
password_hash: source.password
  ? hashPassword(source.password)
  : existingRecord.password_hash,
```

### Step 6: Handle Nullable Fields

Map DSL nullability to TypeScript:

| DSL | TypeScript |
|-----|------------|
| `required: true` | `string` |
| `required: false` | `string \| undefined` |
| `nullable: true` | `string \| null` |

For nullable target fields with non-nullable source:
```typescript
middle_initial: source.middleInitial ?? null,
```

### Step 7: Generate Update Mapper

Update mappers handle partial updates:

```typescript
export function mapUpdateCustomerRequestToCustomerRecord(
  source: UpdateCustomerRequest,
  existing: CustomerRecord
): CustomerRecord {
  return {
    ...existing,
    first_name: source.firstName ?? existing.first_name,
    // Only update password if provided
    password_hash: source.password
      ? hashPassword(source.password)
      : existing.password_hash,
  };
}
```

### Step 8: Generate Index File

Create re-export file:

```typescript
// app/api/src/{entity}/mappers/index.ts
export * from './form-to-api.mapper';
export * from './api-to-persistence.mapper';
export * from './persistence-to-api.mapper';
```

### Step 9: Add Metadata Headers

```typescript
/**
 * App: base-node-fullstack
 * Package: api
 * File: mappers/{mapper-name}.mapper.ts
 * Version: 0.1.0
 * Turns: {TURN_ID}
 * Author: AI Coding Agent ({MODEL_NAME})
 * Date: {ISO8601_DATE}
 * Exports: map{Source}To{Target}
 * Description: Maps {SourceType} to {TargetType}
 */
```

### Step 10: Validation Loop

```bash
cd app/api
pnpm run build
pnpm run test
```

## Required Tests

| Test Case | Coverage |
|-----------|----------|
| All required fields | Source with all required fields maps correctly |
| Optional fields present | Optional fields pass through |
| Optional fields missing | Missing optional fields become null/undefined |
| Nested objects | Nested object fields flatten correctly |
| Generated fields | UUID/timestamp generated each call |
| Hash transformation | Password hashes correctly |
| Update partial | Partial update preserves unmodified fields |

**Minimum test scenarios per mapper:**

```typescript
describe('mapCreateCustomerRequestToCustomerRecord', () => {
  it('maps all required fields', () => { ... });
  it('generates new UUID', () => { ... });
  it('hashes password', () => { ... });
  it('flattens nested address', () => { ... });
  it('handles optional fields as null', () => { ... });
});
```

## Constraints

- **Pure functions**: Mappers are stateless transformations
- **Type safety**: Input and output types must be defined
- **No side effects**: Mappers don't call APIs or DB
- **Null safety**: Handle undefined/null gracefully

## Non-Goals

- Async transformations
- API calls within mappers
- Complex business logic (belongs in service)
- Validation (handled by DTOs)
