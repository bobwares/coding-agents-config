# Shared Domain Foundation

## Metadata

| Field             | Value                                            |
| ----------------- | ------------------------------------------------ |
| **Document Name** | `ddd-shared-{{DOMAIN}}-core-v1.0.md`             |
| **Title**         | **Shared Domain Foundation: {{DOMAIN_TITLE}}**   |
| **Version**       | `1.0.0`                                          |
| **Status**        | `Draft`                                          |
| **Domain**        | `{{DOMAIN}}`                                     |
| **Scope**         | `shared`                                         |
| **Last Updated**  | `{{CURRENT_DATE}}`                               |
| **References**    | `glossary-shared-{{DOMAIN}}-core-v1.0.md`        |

## Purpose

This document defines the canonical domain model used across the **{{DOMAIN_TITLE}}** domain. It establishes bounded contexts, entities, value objects, and invariants that both backend and frontend must respect.

## Bounded Contexts

### Context: [Context Name]

| Attribute | Value |
| --------- | ----- |
| **Name** | [Context Name] |
| **Responsibility** | [What this context owns] |
| **Key Entities** | [List of entities] |
| **Integration Points** | [How it connects to other contexts] |

## Entities

### Entity: [Entity Name]

| Attribute | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `id` | [Type] | Yes | [Description] |
| `[field]` | [Type] | [Yes/No] | [Description] |

**Invariants:**
- [Invariant 1]
- [Invariant 2]

**Lifecycle States:**
- [State 1] -> [State 2] -> [State 3]

## Value Objects

### Value Object: [Name]

| Field | Type | Constraints |
| ----- | ---- | ----------- |
| `[field]` | [Type] | [Constraints] |

**Validation Rules:**
- [Rule 1]
- [Rule 2]

## Aggregates

### Aggregate: [Name]

| Component | Role |
| --------- | ---- |
| **Root** | [Entity name] |
| **Children** | [List of contained entities/value objects] |

**Consistency Boundary:**
- [What must be consistent within this aggregate]

## Domain Services

| Service | Responsibility | Inputs | Outputs |
| ------- | -------------- | ------ | ------- |
| [Service Name] | [What it does] | [Input types] | [Output types] |

## Domain Events

| Event | Trigger | Payload |
| ----- | ------- | ------- |
| [Event Name] | [What causes it] | [Data included] |

## Canonical Field Names

| Concept | Field Name | Type | Notes |
| ------- | ---------- | ---- | ----- |
| [Concept] | `fieldName` | [Type] | [Must be used everywhere] |

## Integration Boundaries

| Boundary | Direction | Contract |
| -------- | --------- | -------- |
| [System/Context] | [Inbound/Outbound] | [Contract reference] |

## Open Questions

- [Question 1]
- [Question 2]
