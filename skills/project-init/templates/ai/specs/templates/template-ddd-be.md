# Backend DDD

## Metadata

| Field             | Value                                                                                                                 |
| ----------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Document Name** | `ddd-be-{{DOMAIN}}-core-v1.1.md`                                                                                      |
| **Title**         | **Backend DDD: {{DOMAIN_TITLE}}**                                                                                     |
| **Version**       | `1.1.0`                                                                                                               |
| **Status**        | `Draft`                                                                                                               |
| **Domain**        | `{{DOMAIN}}`                                                                                                          |
| **Scope**         | `be`                                                                                                                  |
| **Last Updated**  | `{{CURRENT_DATE}}`                                                                                                    |
| **References**    | `glossary-shared-{{DOMAIN}}-core-v1.0.md`, `ddd-shared-{{DOMAIN}}-core-v1.0.md`, `prd-be-{{DOMAIN}}-services-v1.0.md` |

## Purpose

This document defines the backend domain-driven design for the **{{DOMAIN_TITLE}}** domain, including bounded contexts, aggregates, entities, value objects, invariants, repository contracts, domain services, application services, commands, queries, events, errors, and integration boundaries. It is intended to drive backend implementation and API design that will later supply downstream UI and DSL design.

## Scope and Assumptions

### In Scope

* Domain model structure
* Aggregate boundaries and consistency rules
* Business invariants
* Commands and queries exposed through application services
* Repository contracts
* Domain and integration events
* Authorization and tenancy constraints where they affect backend behavior
* Error semantics
* Audit, lifecycle, and concurrency rules

### Out of Scope

* UI layout and visual design
* Screen composition
* Form rendering behavior
* Conditional field visibility
* Front-end widget selection
* Client-side interaction design

## Ubiquitous Language

| Term   | Definition   | Notes            |
| ------ | ------------ | ---------------- |
| [Term] | [Definition] | [Optional notes] |

## Bounded Contexts

### Context: [Context Name]

**Purpose:**
[Describe what this context owns and why it exists.]

**Owns:**

* [Capability 1]
* [Capability 2]

**Does Not Own:**

* [Capability 1]
* [Capability 2]

### Context Map

| Context         | Relationship               | Integration Pattern               | Notes   |
| --------------- | -------------------------- | --------------------------------- | ------- |
| [Other Context] | [Upstream/Downstream/Peer] | [ACL/OHS/Published Language/etc.] | [Notes] |

## Actors and Access Boundaries

### Actor: [Actor Name]

| Field       | Value                          |
| ----------- | ------------------------------ |
| Type        | [Human/System/External System] |
| Description | [Description]                  |

### Access Rules

| Action   | Allowed Actors | Notes         |
| -------- | -------------- | ------------- |
| [Action] | [Actors]       | [Constraints] |

## Enumerations

### Enum: [Enum Name]

| Value   | Meaning   | Terminal | Notes   |
| ------- | --------- | -------- | ------- |
| [VALUE] | [Meaning] | [Yes/No] | [Notes] |

## Value Objects

### Value Object: [Value Object Name]

**Description:**
[Describe the concept and why it is a value object.]

| Field   | Type   | Required | Validation | Notes   |
| ------- | ------ | -------- | ---------- | ------- |
| [field] | [type] | [Yes/No] | [Rule]     | [Notes] |

**Invariants:**

* [Invariant 1]
* [Invariant 2]

## Entities

### Entity: [Entity Name]

**Description:**
[Describe the entity.]

| Field   | Type   | Required | Mutable  | Validation | Notes   |
| ------- | ------ | -------- | -------- | ---------- | ------- |
| [field] | [type] | [Yes/No] | [Yes/No] | [Rule]     | [Notes] |

**Identity:**

* [Identity definition]

**Rules:**

* [Rule 1]
* [Rule 2]

## Aggregates

### Aggregate: [Aggregate Name]

```text
Aggregate Root: [Entity Name]
├── [Child Entity 1]
├── [Child Entity 2]
└── [Value Object 1]
```

**Purpose:**
[Describe the aggregate responsibility.]

**Aggregate Root:**
[Entity Name]

**Consistency Boundary:**
[Describe what must remain consistent within a single transaction.]

### Aggregate Invariants

| Invariant ID | Rule   | Enforcement Point              | Error Code   | Notes   |
| ------------ | ------ | ------------------------------ | ------------ | ------- |
| [INV-001]    | [Rule] | [Constructor/Method/Save/etc.] | [ERROR_CODE] | [Notes] |

### Factory Methods

| Method                   | Parameters | Returns       | Description   |
| ------------------------ | ---------- | ------------- | ------------- |
| `create([params])`       | `[params]` | `[Aggregate]` | [Description] |
| `reconstitute([params])` | `[params]` | `[Aggregate]` | [Description] |

### Behaviors

| Method     | Description   | Preconditions | Postconditions |
| ---------- | ------------- | ------------- | -------------- |
| `[method]` | [Description] | [Conditions]  | [Result]       |

## Validation Rules

### Input Validation

| Rule ID   | Field / Payload | Rule              | Error Code   | Notes   |
| --------- | --------------- | ----------------- | ------------ | ------- |
| [VAL-001] | [Field]         | [Validation rule] | [ERROR_CODE] | [Notes] |

### Business Validation

| Rule ID   | Operation          | Rule            | Error Code   | Notes   |
| --------- | ------------------ | --------------- | ------------ | ------- |
| [BUS-001] | [Command / action] | [Business rule] | [ERROR_CODE] | [Notes] |

## State Transitions

### Entity / Aggregate: [Name]

```text
[INITIAL] --create--> [PENDING]
[PENDING] --approve--> [ACTIVE]
[PENDING] --reject--> [REJECTED]
[ACTIVE] --deactivate--> [INACTIVE]
[INACTIVE] --reactivate--> [ACTIVE]
```

### Transition Rules

| From    | To      | Trigger   | Condition   | Side Effects     | Error Code   |
| ------- | ------- | --------- | ----------- | ---------------- | ------------ |
| [State] | [State] | [Command] | [Condition] | [Events/Actions] | [ERROR_CODE] |

## Commands

### Command: [Command Name]

**Purpose:**
[Describe the intent of the command.]

| Field   | Type   | Required | Source       | Notes   |
| ------- | ------ | -------- | ------------ | ------- |
| [field] | [type] | [Yes/No] | [API/System] | [Notes] |

**Preconditions:**

* [Precondition 1]
* [Precondition 2]

**Postconditions:**

* [Postcondition 1]
* [Postcondition 2]

**Emits Events:**

* [Event 1]
* [Event 2]

**Errors:**

* [Error 1]
* [Error 2]

## Queries

### Query: [Query Name]

**Purpose:**
[Describe what this query returns and why.]

| Parameter | Type   | Required | Notes   |
| --------- | ------ | -------- | ------- |
| [param]   | [type] | [Yes/No] | [Notes] |

### Result Contract

| Field   | Type   | Source                           | Notes   |
| ------- | ------ | -------------------------------- | ------- |
| [field] | [type] | [Entity / Projection / External] | [Notes] |

**Constraints:**

* [Constraint 1]
* [Constraint 2]

## Repository Contracts

### Repository: [Repository Name]

**Aggregate Owned:**
[Aggregate Name]

| Method           | Parameters         | Returns            | Description   |
| ---------------- | ------------------ | ------------------ | ------------- |
| `findById`       | `id: [Type]`       | `[Entity] \| null` | [Description] |
| `save`           | `entity: [Entity]` | `void`             | [Description] |
| `delete`         | `id: [Type]`       | `void`             | [Description] |
| `[customMethod]` | `[params]`         | `[return]`         | [Description] |

**Persistence Guarantees:**

* [Guarantee 1]
* [Guarantee 2]

## Domain Services

### Service: [Service Name]

**Purpose:**
[Describe why this logic belongs in a domain service.]

| Method     | Parameters | Returns    | Description                  |
| ---------- | ---------- | ---------- | ---------------------------- |
| `[method]` | `[params]` | `[return]` | [Business logic description] |

**Invariants Enforced:**

* [Invariant 1]
* [Invariant 2]

## Application Services

### Service: [Application Service Name]

**Purpose:**
[Describe orchestration responsibilities.]

| Use Case   | Method     | Description           |
| ---------- | ---------- | --------------------- |
| [Use case] | `[method]` | [Orchestration logic] |

**Coordinates:**

* [Repository / service / integration dependency 1]
* [Dependency 2]

## Domain Events

### Event: [Event Name]

**Description:**
[Describe what occurred in domain terms.]

| Field        | Type     | Description             |
| ------------ | -------- | ----------------------- |
| `eventId`    | UUID     | Unique event identifier |
| `occurredAt` | DateTime | When the event occurred |
| `[field]`    | [Type]   | [Description]           |

**Triggered By:**

* [Aggregate method / command / service]

**Subscribers:**

* [Subscriber 1] - [What it does]
* [Subscriber 2] - [What it does]

## Integration Events

### Event: [Integration Event Name]

**Description:**
[Describe what is published externally.]

| Field     | Type   | Description   |
| --------- | ------ | ------------- |
| `[field]` | [Type] | [Description] |

**Published To:**

* [External system / topic / bus]

**Delivery Semantics:**

* [At least once / exactly once / best effort]

## Integration Boundaries

### Anti-Corruption Layer: [Name]

| External Concept | Internal Concept | Translation        | Notes   |
| ---------------- | ---------------- | ------------------ | ------- |
| [External]       | [Internal]       | [How to translate] | [Notes] |

### External Dependencies

| Dependency | Type                | Purpose   | Failure Mode       |
| ---------- | ------------------- | --------- | ------------------ |
| [System]   | [API/DB/Queue/etc.] | [Purpose] | [Failure behavior] |

## Domain Error Model

### Error: [Error Code]

| Field            | Value                                                         |
| ---------------- | ------------------------------------------------------------- |
| Category         | [Validation / Conflict / State / Authorization / Integration] |
| Message          | [Canonical meaning]                                           |
| Retryable        | [Yes/No]                                                      |
| User Displayable | [Yes/No]                                                      |

## Audit, Lifecycle, and Concurrency Rules

### Audit Rules

* [Audit rule 1]
* [Audit rule 2]

### Lifecycle Rules

* [Retention / archival / deletion rule 1]
* [Rule 2]

### Concurrency Rules

* [Optimistic locking / version check / idempotency rule 1]
* [Rule 2]

## Tenant and Identity Boundaries

| Rule ID   | Rule                       | Notes   |
| --------- | -------------------------- | ------- |
| [TEN-001] | [Tenant boundary rule]     | [Notes] |
| [ID-001]  | [Identity uniqueness rule] | [Notes] |

## Traceability

| Artifact ID | Artifact Type | Description   | PRD Reference   |
| ----------- | ------------- | ------------- | --------------- |
| [CMD-001]   | Command       | [Description] | [PRD reference] |
| [INV-001]   | Invariant     | [Description] | [PRD reference] |

## Open Questions

* [Question 1]
* [Question 2]
