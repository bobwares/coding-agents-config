# [Project Name] Domain-Driven Design

## Document Control

### Document Metadata

| Field              | Value                                          |
|--------------------|------------------------------------------------|
| **Document Title** | **[Project Name] Domain-Driven Design**        |
| **Version**        | **0.1.0**                                      |
| **Status**         | **Draft**                                      |
| **Author**         | **[Author Name]**                              |
| **Prepared By**    | **[AI / Team Name]**                           |
| **Document Type**  | **Domain-Driven Design Document**              |
| **Path/File Name** | `[ddd-file-name.md]`                           |
| **Created Date**   | **[Month DD, YYYY, HH:MM AM/PM Central Time]** |
| **Last Updated**   | **[Month DD, YYYY, HH:MM AM/PM Central Time]** |


### Version History


| Version | Date                                       | Author        | Summary       |
|---------|--------------------------------------------|---------------|---------------|
| 0.1.0   | [Month DD, YYYY, HH:MM AM/PM Central Time] | [Author Name] | Initial draft |


---

## Domain Summary

### Purpose

[Describe the domain capability, business responsibility, lifecycle, auditability needs, and downstream workflow responsibilities.]

### Design Goal

The design clarifies the business objects, decision boundaries, state transitions, invariants, and integration responsibilities required to:

1. [Design clarification goal. Add as many additional numbered items as needed.]

### Core Business Responsibility

[Describe the authoritative business responsibility owned by this domain, including primary lifecycle ownership, decision ownership, durable records, and business-significant events.]

## Scope of the Domain Model

### In Scope

1. [In-scope domain responsibility. Add as many additional numbered items as needed.]

### Out of Scope

1. [Out-of-scope responsibility. Add as many additional numbered items as needed.]

### Deferred

1. [Deferred capability. Add as many additional numbered items as needed.]

## Ubiquitous Language

| Term | Definition | Notes |
|------|------------|-------|
| **[Domain Term]** | [Business definition of the term.] | [System-specific rule, lifecycle meaning, ownership detail, or modeling implication.] |

### Key Distinctions

1. **[Term A]** [meaning]; **[Term B]** [meaning]. Add as many additional numbered items as needed.

## Domain Capabilities

| Capability | Description | Notes |
|------------|-------------|-------|
| [Capability] | [Business capability description.] | [Capability notes, constraints, or modeling implications.] |

## Bounded Contexts

| Context | Purpose | Owned Data | Owned Behavior | Upstream Dependencies | Downstream Consumers | DSL Notes |
|---------|---------|------------|----------------|------------------------|----------------------|-----------|
| **[Bounded Context]** | [Purpose of the context.] | [Data owned by the context.] | [Behavior owned by the context.] | [Upstream dependencies.] | [Downstream consumers.] | [DSL modeling notes.] |

## Context Relationships

| Source | Target | Relationship | Notes |
|--------|--------|--------------|-------|
| [Source context or external system] | [Target context or external system] | [Relationship type] | [Relationship notes.] |

### Source-of-Truth Implications

1. `[Domain Object]` lifecycle and `[business outcome]` are source-of-truth data in `[Bounded Context]`. Add as many additional numbered items as needed.

## Domain Model

### Aggregate Roots

| Aggregate | Purpose | Invariants Protected | Notes |
|-----------|---------|----------------------|-------|
| **[Aggregate Root]** | [Purpose of the aggregate.] | [Invariants protected by the aggregate.] | [Aggregate notes.] |

### Entities

| Entity | Parent Aggregate | Purpose | Notes |
|--------|------------------|---------|-------|
| **[Entity]** | [Parent aggregate] | [Purpose of the entity.] | [Entity notes.] |

### Value Objects

| Value Object | Used By | Purpose | Notes |
|--------------|---------|---------|-------|
| **[ValueObject]** | [Aggregate, entity, command, or event] | [Purpose of the value object.] | [Value object notes.] |

## Business Invariants

| Invariant ID | Statement | Notes |
|--------------|-----------|-------|
| **[INV-01]** | [Business rule that must always be true.] | [Invariant notes.] |

## Lifecycle and State Models

### [Primary Object] Lifecycle

**States**: `[StateA]`, `[StateB]`, `[StateC]`

**Initial State**: `[InitialState]`  
**Terminal States**: `[TerminalState]`

### Allowed Transitions

| From | To | Conditions | Notes |
|------|----|------------|-------|
| [FromState] | [ToState] | [Transition guard or condition.] | [Transition notes.] |

## Commands and Business Outcomes

| Command | Actor | Preconditions | Postconditions | Failure Conditions | Notes |
|---------|-------|---------------|----------------|--------------------|-------|
| `[CommandName]` | [Actor or system role] | [Preconditions.] | [Postconditions.] | [Failure conditions.] | [Command notes.] |

## Domain Events

| Event | Meaning | Trigger | Potential Consumers | Notes |
|-------|---------|---------|---------------------|-------|
| `[DomainEventName]` | [Business fact represented by the event.] | [Command, transition, or domain action that emits the event.] | [Consumers, projections, workflows, or integrations.] | [Event notes.] |

## Policies and Configuration Boundaries

| Policy / Configuration Area | Scope | Effect on Domain Behavior | Notes |
|-----------------------------|-------|---------------------------|-------|
| [Policy or configuration area] | [Global, tenant-specific, environment-specific, product-configurable, etc.] | [How this changes domain behavior.] | [Policy notes.] |

## Authorization-Relevant Domain Rules

| Rule | Applies To | Notes |
|------|------------|-------|
| [Authorization-relevant business rule.] | [Aggregate, command, context, or workflow.] | [Authorization notes.] |

## External Systems and Integration Boundaries

| External System | Role | Boundary Type | Notes |
|-----------------|------|---------------|-------|
| [External system] | [Role in the domain.] | [Source system, downstream consumer, delegated capability provider, anti-corruption boundary, etc.] | [Integration notes.] |

## DSL-Oriented Modeling Notes

### Objects the DSL Will Need

1. `[Object]`. Add as many additional numbered items as needed.

### Field Groups the DSL Will Need

1. [Field group. Add as many additional numbered items as needed.]

### Required Fields the DSL Will Need to Mark Explicitly

1. [Required field. Add as many additional numbered items as needed.]

### State and Lifecycle Rules the DSL Will Need

1. [State machine or lifecycle rule. Add as many additional numbered items as needed.]

### Actions the DSL Will Need to Represent

1. [Action. Add as many additional numbered items as needed.]

### Validation and Policy Hooks the DSL Will Need

1. [Validation or policy hook. Add as many additional numbered items as needed.]

### Relationships and Projections the DSL Will Need

1. `[Object]` to `[Object]`. Add as many additional numbered items as needed.

### Planner / AI Coding Agent Notes

1. [Important downstream implementation note. Add as many additional numbered items as needed.]

## Open Domain Decisions

| Decision Area | Current Assumption | Why It Matters | Recommended Resolution |
|---------------|--------------------|----------------|------------------------|
| [Decision area] | [Current assumption.] | [Why it matters to modeling, DSL generation, planning, or implementation.] | [Recommended resolution.] |

## Worked Examples

### [Example Number] [Example Name]

1. [Input, scenario fact, business result, state impact, event, or downstream outcome. Add as many additional numbered items as needed.]

---

**End of DDD Document**

