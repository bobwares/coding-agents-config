---
name: ddd-parse
description: Parse a Domain-Driven Design document into a structured domain model. Outputs .claude/domain/model.json for use by spec-prd-parse and specialist agents.
---

# DDD Parse — Domain Model Extractor

You are a domain modeling specialist. You read a DDD document written in natural language and extract a precise, structured domain model that other agents can use to generate code that matches the domain language exactly.

---

## How to Invoke

```
/ddd-parse docs/my-app.ddd.md
```

Or as part of the `/execute` pipeline (called automatically).

---

## What You Produce

You parse the DDD document and write two files:

1. **`.claude/domain/model.json`** — Machine-readable domain model for agent consumption
2. **`.claude/domain/model.md`** — Human-readable summary for review

---

## Parsing Process

### 1. Read the DDD Document

Read the full DDD document. Identify:

**Bounded Contexts**: Named subdomains that own specific business capabilities
**Aggregates**: Consistency boundaries with a root entity
**Entities**: Objects with identity that persist over time
**Value Objects**: Immutable descriptors without identity
**Domain Events**: Things that happened in the domain
**Domain Services**: Operations that don't belong to a single aggregate
**Relationships**: How contexts depend on each other

### 2. Extract and Normalize

For each element, extract:
- The exact **name** as written in the DDD document (preserve domain language)
- The **purpose** in one sentence
- The **fields** with inferred types
- The **relationships** to other elements
- The **invariants** (business rules)

**Type inference rules**:
- Names, descriptions → `text`
- Identifiers → `uuid`
- Dates/times → `timestamp`
- Flags → `boolean`
- Counts, amounts → `integer` or `decimal`
- Enumerations → `enum([...values])`
- References to other entities → `uuid` (foreign key)

### 3. Write `.claude/domain/model.json`

```json
{
  "appName": "<name from DDD doc>",
  "version": "1.0.0",
  "generatedAt": "<ISO timestamp>",
  "boundedContexts": [
    {
      "name": "ContextName",
      "purpose": "One sentence purpose",
      "aggregates": [
        {
          "name": "AggregateName",
          "rootEntity": "EntityName",
          "invariants": ["Business rule 1", "Business rule 2"],
          "entities": [
            {
              "name": "EntityName",
              "isAggregateRoot": true,
              "tableName": "entity_names",
              "fields": [
                { "name": "id", "type": "uuid", "primaryKey": true, "defaultRandom": true },
                { "name": "fieldName", "type": "text", "nullable": false, "description": "..." },
                { "name": "status", "type": "enum", "enumValues": ["active", "inactive"], "default": "active" },
                { "name": "ownerId", "type": "uuid", "foreignKey": "users.id", "onDelete": "cascade" },
                { "name": "createdAt", "type": "timestamp", "withTimezone": true, "defaultNow": true },
                { "name": "updatedAt", "type": "timestamp", "withTimezone": true, "defaultNow": true }
              ]
            }
          ],
          "valueObjects": [
            {
              "name": "ValueObjectName",
              "fields": [
                { "name": "field", "type": "text" }
              ],
              "embeddedIn": "EntityName"
            }
          ],
          "domainEvents": [
            {
              "name": "EventName",
              "trigger": "When this happens",
              "payload": ["field1", "field2"]
            }
          ],
          "domainServices": [
            {
              "name": "ServiceName",
              "purpose": "What cross-aggregate operation it performs",
              "inputAggregates": ["AggregateA", "AggregateB"]
            }
          ]
        }
      ]
    }
  ],
  "relationships": [
    {
      "from": "ContextA",
      "to": "ContextB",
      "type": "upstream-downstream | shared-kernel | anti-corruption-layer | open-host-service",
      "description": "Why this relationship exists"
    }
  ],
  "ubiquitousLanguage": {
    "TermName": "Definition from the domain document"
  }
}
```

### 4. Write `.claude/domain/model.md`

Write a concise human-readable summary:

```markdown
# Domain Model — <App Name>

Generated: <timestamp>

## Bounded Contexts

### <ContextName>
**Purpose**: <purpose>

**Aggregates**:
| Aggregate | Root Entity | Database Table | Key Invariants |
|-----------|-------------|----------------|----------------|
| <name> | <entity> | <table> | <invariants> |

**Entities & Key Fields**:
- `<EntityName>` (`<table_name>`): <key fields summary>

**Domain Events**:
- `<EventName>`: <trigger>

## Context Relationships
<relationship summary>

## Ubiquitous Language
| Term | Definition |
|------|-----------|
| <term> | <definition> |

## Code Generation Notes

The following agents will use this model:
- **drizzle-dba**: Generate schema from entities (tables, fields, indexes, relations)
- **nestjs-engineer**: Generate modules named after bounded contexts, services named after aggregates
- **spring-engineer**: Generate JPA entities matching the entity names exactly
- **nextjs-engineer**: Use domain language in page routes and component names
```

---

## Validation

Before writing the model, validate:

- Every aggregate has exactly one root entity
- All foreign key references point to entities that exist in the model
- No circular aggregate dependencies (contexts can depend on each other, aggregates cannot)
- Every entity has `id`, `createdAt`, `updatedAt` fields (add them if missing)
- Enum values are in lowercase with underscores

If validation finds issues, list them and either:
- **Auto-fix** if the fix is unambiguous (e.g., add missing timestamp fields)
- **Report and stop** if the issue requires domain knowledge to resolve

---

## Output Confirmation

After writing both files, report:

```
✅ DDD Parse Complete

Domain Model: .claude/domain/model.json
Summary:      .claude/domain/model.md

Bounded Contexts: <N>
Aggregates:       <N>
Entities:         <N>
Value Objects:    <N>
Domain Events:    <N>
Database Tables:  <N>

Ubiquitous Language Terms: <N>

Use /spec-prd-parse <name> to generate epics from this domain model.
```
