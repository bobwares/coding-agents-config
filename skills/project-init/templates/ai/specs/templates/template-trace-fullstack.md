# Traceability Matrix

## Metadata

| Field             | Value                                            |
| ----------------- | ------------------------------------------------ |
| **Document Name** | `trace-fullstack-{{DOMAIN}}-v1.0.md`             |
| **Title**         | **Traceability Matrix: {{DOMAIN_TITLE}}**        |
| **Version**       | `1.0.0`                                          |
| **Status**        | `Draft`                                          |
| **Domain**        | `{{DOMAIN}}`                                     |
| **Scope**         | `fullstack`                                      |
| **Last Updated**  | `{{CURRENT_DATE}}`                               |
| **References**    | All upstream artifacts                           |

## Purpose

This document maps all requirements, domain concepts, screens, and implementation artifacts for the **{{DOMAIN_TITLE}}** domain to ensure full traceability and governance.

## Requirements to Domain Concepts

| Requirement ID | Requirement | Domain Concept | Entity/VO | Notes |
| -------------- | ----------- | -------------- | --------- | ----- |
| REQ-001 | [Requirement] | [Concept] | [Entity] | [Notes] |
| REQ-002 | [Requirement] | [Concept] | [Entity] | [Notes] |

## Domain Concepts to APIs

| Domain Concept | Entity | API Endpoint | Method | Contract |
| -------------- | ------ | ------------ | ------ | -------- |
| [Concept] | [Entity] | `/api/[resource]` | GET | `api-be-{{DOMAIN}}-rest-v1.0.yaml` |
| [Concept] | [Entity] | `/api/[resource]` | POST | `api-be-{{DOMAIN}}-rest-v1.0.yaml` |

## Requirements to Screens

| Requirement ID | Requirement | Screen ID | Screen Name | Capability |
| -------------- | ----------- | --------- | ----------- | ---------- |
| REQ-001 | [Requirement] | SCR-001 | [Screen Name] | [capability] |
| REQ-002 | [Requirement] | SCR-002 | [Screen Name] | [capability] |

## Screens to Wireframes

| Screen ID | Screen Name | Wireframe Document | Status |
| --------- | ----------- | ------------------ | ------ |
| SCR-001 | [Screen Name] | `wire-ux-{{DOMAIN}}-[capability]-v1.0.md` | Draft |
| SCR-002 | [Screen Name] | `wire-ux-{{DOMAIN}}-[capability]-v1.0.md` | Draft |

## Wireframes to DSL

| Wireframe | DSL Document | Status | Notes |
| --------- | ------------ | ------ | ----- |
| `wire-ux-{{DOMAIN}}-[capability]-v1.0.md` | `dsl-fe-{{DOMAIN}}-[capability]-v1.0.yaml` | Draft | [Notes] |

## DSL to Implementation Tasks

| DSL Document | Task ID | Task Description | Status |
| ------------ | ------- | ---------------- | ------ |
| `dsl-fe-{{DOMAIN}}-[capability]-v1.0.yaml` | T3.1 | [Task] | Pending |
| `dsl-fe-{{DOMAIN}}-[capability]-v1.0.yaml` | T3.2 | [Task] | Pending |

## Implementation Tasks to Test Cases

| Task ID | Task | Test ID | Test Type | Test Description |
| ------- | ---- | ------- | --------- | ---------------- |
| T2.1 | [Task] | TEST-001 | Unit | [Test description] |
| T3.1 | [Task] | TEST-002 | Integration | [Test description] |
| T4.1 | [Task] | TEST-003 | E2E | [Test description] |

## Full Traceability Chain

### Feature: [Feature Name]

```
REQ-001: [Requirement]
    |
    +---> Domain: [Entity]
    |         |
    |         +---> API: POST /api/[resource]
    |         +---> API: GET /api/[resource]/{id}
    |
    +---> Screen: SCR-001 [Screen Name]
              |
              +---> Wireframe: wire-ux-{{DOMAIN}}-[capability]-v1.0.md
                        |
                        +---> DSL: dsl-fe-{{DOMAIN}}-[capability]-v1.0.yaml
                                  |
                                  +---> Task: T3.1
                                  |         |
                                  |         +---> Test: TEST-001
                                  |
                                  +---> Task: T3.2
                                            |
                                            +---> Test: TEST-002
```

## Orphan Analysis

### Untraced Requirements

| Requirement ID | Requirement | Issue |
| -------------- | ----------- | ----- |
| [None expected] | | |

### Untraced Screens

| Screen ID | Screen Name | Issue |
| --------- | ----------- | ----- |
| [None expected] | | |

### Untraced DSL

| DSL Document | Issue |
| ------------ | ----- |
| [None expected] | |

## Coverage Summary

| Artifact Type | Total | Traced | Coverage |
| ------------- | ----- | ------ | -------- |
| Requirements | [N] | [N] | [%] |
| Domain Concepts | [N] | [N] | [%] |
| API Endpoints | [N] | [N] | [%] |
| Screens | [N] | [N] | [%] |
| Wireframes | [N] | [N] | [%] |
| DSL Files | [N] | [N] | [%] |
| Tasks | [N] | [N] | [%] |
| Tests | [N] | [N] | [%] |

## Governance Notes

- All new requirements must be traced to domain concepts before implementation
- All new screens must have corresponding wireframes before DSL creation
- All DSL files must reference their upstream wireframe
- All tasks must have at least one associated test case

## Open Questions

- [Question 1]
- [Question 2]
