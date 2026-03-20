---
name: prisma-persistence
description: Generate Prisma schema and migrations from DSL persistence model. Use when creating or updating database schema for an entity.
---

# Prisma Persistence

Generate Prisma schema definitions from `app-dsl/models/persistence/` specifications.

## Purpose

Create:
- Prisma model in `schema.prisma`
- Database migration (optional)
- Prisma client types via `prisma generate`

## Use When

- Adding a new entity to the database
- Modifying entity fields
- Adding indexes or constraints

## Inputs

| Input | Description | Required |
|-------|-------------|----------|
| `parsed_model` | Parsed persistence model object from `dsl-model-interpreter` | **Yes** |
| `dsl_context` | DSL context with path metadata from orchestrator | **Yes** |
| `entity` | PascalCase model name | **Yes** |

### Input Contract

This skill receives **parsed content** from the `dsl-model-interpreter`, not raw file paths.

**Expected `parsed_model` structure:**
```json
{
  "kind": "persistence-model",
  "storage": {
    "table": "customers"
  },
  "fields": {
    "customer_id": { "type": "uuid", "primaryKey": true },
    "first_name": { "type": "varchar(50)", "nullable": false }
  },
  "indexes": [...]
}
```

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

**Deprecated:** Direct file path input (`app-dsl/models/persistence/{entity}.persistence.model.yaml`) is deprecated. Use the orchestrator's parsed content instead.

## Outputs

| Output | Location |
|--------|----------|
| Prisma model | `app/api/prisma/schema.prisma` (appended or updated) |
| Migration | `app/api/prisma/migrations/{timestamp}_{name}/` |
| Client types | `node_modules/.prisma/client/` |

## Dependencies

| Skill | Purpose |
|-------|---------|
| `dsl-model-interpreter` | Parse persistence model YAML |

## Repository Patterns Reproduced

### Prisma Schema Location

```
app/api/prisma/schema.prisma
```

### Model Definition Pattern

```prisma
model Customer {
  id              String   @id @default(uuid())
  firstName       String   @map("first_name")
  middleInitial   String?  @map("middle_initial")
  lastName        String   @map("last_name")
  age             Int
  passwordHash    String   @map("password_hash")
  phone           String?
  email           String?  @unique
  preferencesJson Json?    @map("preferences_json")

  // Embedded address fields (flattened)
  homeLine1       String   @map("home_line1")
  homeLine2       String?  @map("home_line2")
  homeCity        String   @map("home_city")
  homeCountry     String   @map("home_country")
  homeRegion      String?  @map("home_region")
  homePostalCode  String?  @map("home_postal_code")

  billingLine1    String   @map("billing_line1")
  billingLine2    String?  @map("billing_line2")
  billingCity     String   @map("billing_city")
  billingCountry  String   @map("billing_country")
  billingRegion   String?  @map("billing_region")
  billingPostalCode String? @map("billing_postal_code")

  @@map("customers")
}
```

### DSL to Prisma Type Mapping

| DSL Type | Prisma Type |
|----------|-------------|
| `uuid` | `String @id @default(uuid())` |
| `varchar(n)` | `String` |
| `char(n)` | `String` |
| `integer` | `Int` |
| `boolean` | `Boolean` |
| `jsonb` | `Json` |
| `timestamp` | `DateTime` |
| `text` | `String` |

### Nullability Mapping

| DSL `nullable` | Prisma Suffix |
|----------------|---------------|
| `false` | (none) |
| `true` | `?` |

## Instructions

### Step 1: Use Parsed Persistence Model

**Receive the parsed model from the orchestrator** (via `dsl-model-interpreter` output):

```json
{
  "kind": "persistence-model",
  "storage": {
    "table": "customers"
  },
  "fields": {
    "customer_id": {
      "type": "uuid",
      "primaryKey": true
    },
    "first_name": {
      "type": "varchar(50)",
      "nullable": false
    }
  },
  "indexes": [
    {
      "name": "idx_customers_email",
      "fields": ["email"],
      "unique": true
    }
  ]
}
```

**Note:** Do NOT read the DSL file directly. The orchestrator provides pre-parsed content.

### Step 2: Generate Prisma Model

Transform DSL fields to Prisma format:

1. **Field name**: Convert `snake_case` to `camelCase`
2. **Type**: Map DSL type to Prisma type
3. **Nullable**: Add `?` suffix if `nullable: true`
4. **Primary key**: Add `@id @default(uuid())`
5. **Column mapping**: Add `@map("snake_case_name")` for snake_case columns
6. **Table mapping**: Add `@@map("table_name")` at model end

### Step 3: Handle Indexes

```prisma
// Unique index
@@unique([email])

// Non-unique index
@@index([lastName, firstName])

// Conditional unique (requires raw SQL or Prisma preview)
// For partial unique index, document as comment
```

### Step 4: Update schema.prisma

Read existing `schema.prisma`, find or add model:

- If model exists: Replace model block
- If model new: Append after last model

**Gotcha**: Preserve existing generator and datasource blocks.

### Step 5: Validate Schema

```bash
cd app/api
npx prisma validate
```

Fix any errors before proceeding.

### Step 6: Generate Client

```bash
cd app/api
npx prisma generate
```

This creates TypeScript types for the model.

### Step 7: Create Migration (Optional)

For production, create a migration:

```bash
cd app/api
npx prisma migrate dev --name add_{entity}_table
```

For development, use push:

```bash
cd app/api
npx prisma db push
```

### Step 8: Add Metadata Header

Add comment header to schema.prisma if not present:

```prisma
// App: base-node-fullstack
// Package: api
// File: prisma/schema.prisma
// Version: {version}
// Turns: {turn_ids}
// Description: Prisma schema for database models
```

### Step 9: Validation Loop

```bash
cd app/api
npx prisma validate
npx prisma generate
pnpm run build
```

## Required Tests

Prisma schema changes don't require unit tests, but verify:

1. `prisma validate` passes
2. `prisma generate` succeeds
3. Application builds without type errors
4. Service can perform CRUD operations (integration test)

## Constraints

- **Single schema file**: All models in one `schema.prisma`
- **SQLite for dev**: Default datasource is SQLite (`file:./dev.db`)
- **Snake case columns**: Use `@map()` for database column names
- **CamelCase fields**: Prisma field names use camelCase

## Non-Goals

- Multi-database configurations
- Advanced Prisma features (composite keys, relations)
- Production migration strategy
- Seed data generation
