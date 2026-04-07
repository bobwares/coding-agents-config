# Backend PRD

## Metadata

| Field             | Value                                            |
| ----------------- | ------------------------------------------------ |
| **Document Name** | `prd-be-{{DOMAIN}}-services-v1.0.md`             |
| **Title**         | **Backend PRD: {{DOMAIN_TITLE}}**                |
| **Version**       | `1.0.0`                                          |
| **Status**        | `Draft`                                          |
| **Domain**        | `{{DOMAIN}}`                                     |
| **Scope**         | `be`                                             |
| **Last Updated**  | `{{CURRENT_DATE}}`                               |
| **References**    | `glossary-shared-{{DOMAIN}}-core-v1.0.md`, `ddd-shared-{{DOMAIN}}-core-v1.0.md` |

## Purpose

This document defines backend-focused requirements for the **{{DOMAIN_TITLE}}** domain, including service responsibilities, validation ownership, persistence, integrations, and non-functional requirements.

## Backend Capabilities

| Capability ID | Name | Description | Priority |
| ------------- | ---- | ----------- | -------- |
| BE-CAP-001 | [Capability Name] | [Description] | High |
| BE-CAP-002 | [Capability Name] | [Description] | Medium |

## Service Responsibilities

### Service: [Service Name]

| Attribute | Value |
| --------- | ----- |
| **Name** | [Service Name] |
| **Responsibility** | [What this service owns] |
| **Domain Objects** | [Entities/aggregates it manages] |
| **Operations** | [CRUD + domain operations] |

## Validation Ownership

| Validation | Owner | Notes |
| ---------- | ----- | ----- |
| [Business rule validation] | Backend | [Why backend owns this] |
| [Format validation] | Frontend | [Why frontend owns this] |
| [Cross-field validation] | Backend | [Why backend owns this] |

## Persistence Requirements

| Entity | Storage | Retention | Notes |
| ------ | ------- | --------- | ----- |
| [Entity Name] | [Database type] | [Retention policy] | [Special requirements] |

## Integration Requirements

| Integration | Direction | Protocol | Notes |
| ----------- | --------- | -------- | ----- |
| [System Name] | Inbound/Outbound | REST/Events/etc | [Purpose and constraints] |

## Security and Authorization

| Resource | Action | Required Permission | Notes |
| -------- | ------ | ------------------- | ----- |
| [Resource] | [Action] | [Permission] | [Additional rules] |

## Audit Requirements

| Event | Data Captured | Retention |
| ----- | ------------- | --------- |
| [Event type] | [Fields to capture] | [How long to keep] |

## Non-Functional Requirements

| ID | Requirement | Target | Notes |
| -- | ----------- | ------ | ----- |
| NFR-BE-001 | Response time | < 200ms p95 | [Context] |
| NFR-BE-002 | Throughput | [TPS] | [Context] |
| NFR-BE-003 | Availability | [SLA] | [Context] |

## Error Handling

| Error Type | HTTP Status | Response Format | Notes |
| ---------- | ----------- | --------------- | ----- |
| Validation | 400 | [Format] | [Details] |
| Not Found | 404 | [Format] | [Details] |
| Business Rule | 422 | [Format] | [Details] |

## Open Questions

- [Question 1]
- [Question 2]
