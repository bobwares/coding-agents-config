# Screen Catalog

## Metadata

| Field             | Value                                            |
| ----------------- | ------------------------------------------------ |
| **Document Name** | `screen-fe-{{DOMAIN}}-catalog-v1.0.md`           |
| **Title**         | **Screen Catalog: {{DOMAIN_TITLE}}**             |
| **Version**       | `1.0.0`                                          |
| **Status**        | `Draft`                                          |
| **Domain**        | `{{DOMAIN}}`                                     |
| **Scope**         | `fe`                                             |
| **Last Updated**  | `{{CURRENT_DATE}}`                               |
| **References**    | `prd-fe-{{DOMAIN}}-ui-v1.0.md`                   |

## Purpose

This document provides a complete inventory of screens in the **{{DOMAIN_TITLE}}** domain, serving as the control point between requirements and design.

## Screen Inventory

| Screen ID | Capability | Screen Name | Purpose | Primary Domain Objects | Primary Actions | Status |
| --------- | ---------- | ----------- | ------- | ---------------------- | --------------- | ------ |
| SCR-001 | [capability] | [Name] | [Purpose] | [Objects] | [Actions] | Draft |
| SCR-002 | [capability] | [Name] | [Purpose] | [Objects] | [Actions] | Draft |

## Screen Definitions

### SCR-001: [Screen Name]

| Attribute | Value |
| --------- | ----- |
| **Screen ID** | SCR-001 |
| **Capability** | [capability] |
| **Screen Name** | [Name] |
| **Purpose** | [What users accomplish here] |
| **Route** | `/[route]` |
| **Primary Domain Objects** | [Entity 1], [Entity 2] |
| **Primary Actions** | [Create], [Edit], [Delete] |
| **Secondary Actions** | [Export], [Filter] |
| **Upstream Dependencies** | [Other screens, APIs] |
| **Downstream Screens** | [Screens navigable from here] |

**User Entry Points:**
- [How users arrive at this screen]

**Success Criteria:**
- [What indicates successful use]

**Wireframe Reference:** `wire-ux-{{DOMAIN}}-[capability]-v1.0.md`

**DSL Reference:** `dsl-fe-{{DOMAIN}}-[capability]-v1.0.yaml`

---

### SCR-002: [Screen Name]

| Attribute | Value |
| --------- | ----- |
| **Screen ID** | SCR-002 |
| **Capability** | [capability] |
| **Screen Name** | [Name] |
| **Purpose** | [What users accomplish here] |
| **Route** | `/[route]` |
| **Primary Domain Objects** | [Entity 1] |
| **Primary Actions** | [View], [Update] |
| **Secondary Actions** | [Navigate back] |
| **Upstream Dependencies** | SCR-001 |
| **Downstream Screens** | [Screens navigable from here] |

**User Entry Points:**
- [How users arrive at this screen]

**Success Criteria:**
- [What indicates successful use]

**Wireframe Reference:** `wire-ux-{{DOMAIN}}-[capability]-v1.0.md`

**DSL Reference:** `dsl-fe-{{DOMAIN}}-[capability]-v1.0.yaml`

## Screen Flow Diagram

```
[Entry Point]
     |
     v
[SCR-001: List]
     |
     +---> [SCR-002: Detail]
     |          |
     |          +---> [SCR-003: Edit]
     |
     +---> [SCR-004: Create]
```

## Permission Matrix

| Screen ID | View | Create | Edit | Delete |
| --------- | ---- | ------ | ---- | ------ |
| SCR-001 | [Role] | [Role] | [Role] | [Role] |
| SCR-002 | [Role] | N/A | [Role] | [Role] |

## Open Questions

- [Question 1]
- [Question 2]
