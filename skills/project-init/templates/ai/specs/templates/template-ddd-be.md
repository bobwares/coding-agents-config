# Backend DDD

## Metadata

| Field             | Value                                            |
| ----------------- | ------------------------------------------------ |
| **Document Name** | `ddd-be-{{DOMAIN}}-core-v1.0.md`                 |
| **Title**         | **Backend DDD: {{DOMAIN_TITLE}}**                |
| **Version**       | `1.0.0`                                          |
| **Status**        | `Draft`                                          |
| **Domain**        | `{{DOMAIN}}`                                     |
| **Scope**         | `be`                                             |
| **Last Updated**  | `{{CURRENT_DATE}}`                               |
| **References**    | `glossary-shared-{{DOMAIN}}-core-v1.0.md`, `ddd-shared-{{DOMAIN}}-core-v1.0.md`, `prd-be-{{DOMAIN}}-services-v1.0.md` |

## Purpose

This document defines the backend domain-driven design for the **{{DOMAIN_TITLE}}** domain, including aggregates, repositories, domain services, events, and implementation-specific invariants.

## Bounded Context: [Context Name]

### Context Map

| Context | Relationship | Integration Pattern |
| ------- | ------------ | ------------------- |
| [Other Context] | [Upstream/Downstream] | [ACL/OHS/etc] |

## Aggregates

### Aggregate: [Aggregate Name]

```
Aggregate Root: [Entity Name]
├── [Child Entity 1]
├── [Child Entity 2]
└── [Value Object 1]
```

**Consistency Rules:**
- [Rule 1]
- [Rule 2]

**Factory Methods:**
- `create([params])` - [Description]
- `reconstitute([params])` - [Description]

## Repository Contracts

### Repository: [Repository Name]

| Method | Parameters | Returns | Description |
| ------ | ---------- | ------- | ----------- |
| `findById` | `id: [Type]` | `[Entity] \| null` | [Description] |
| `save` | `entity: [Entity]` | `void` | [Description] |
| `delete` | `id: [Type]` | `void` | [Description] |

## Domain Services

### Service: [Service Name]

| Method | Parameters | Returns | Description |
| ------ | ---------- | ------- | ----------- |
| `[method]` | `[params]` | `[return]` | [Business logic description] |

**Invariants Enforced:**
- [Invariant 1]
- [Invariant 2]

## State Transitions

### Entity: [Entity Name]

```
[INITIAL] --create--> [PENDING]
[PENDING] --approve--> [ACTIVE]
[PENDING] --reject--> [REJECTED]
[ACTIVE] --deactivate--> [INACTIVE]
[INACTIVE] --reactivate--> [ACTIVE]
```

**Transition Rules:**
| From | To | Condition | Side Effects |
| ---- | -- | --------- | ------------ |
| [State] | [State] | [Condition] | [Events/Actions] |

## Domain Events

### Event: [Event Name]

| Field | Type | Description |
| ----- | ---- | ----------- |
| `eventId` | UUID | Unique event identifier |
| `occurredAt` | DateTime | When the event occurred |
| `[field]` | [Type] | [Description] |

**Subscribers:**
- [Subscriber 1] - [What it does]
- [Subscriber 2] - [What it does]

## Application Services

### Service: [Application Service Name]

| Use Case | Method | Description |
| -------- | ------ | ----------- |
| [Use case] | `[method]` | [Orchestration logic] |

## Integration Boundaries

### Anti-Corruption Layer: [Name]

| External Concept | Internal Concept | Translation |
| ---------------- | ---------------- | ----------- |
| [External] | [Internal] | [How to translate] |

## Open Questions

- [Question 1]
- [Question 2]
