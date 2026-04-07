# Wireframe

## Metadata

| Field             | Value                                            |
| ----------------- | ------------------------------------------------ |
| **Document Name** | `wire-ux-{{DOMAIN}}-{{CAPABILITY}}-v1.0.md`      |
| **Title**         | **Wireframe: {{CAPABILITY_TITLE}}**              |
| **Version**       | `1.0.0`                                          |
| **Status**        | `Draft`                                          |
| **Domain**        | `{{DOMAIN}}`                                     |
| **Capability**    | `{{CAPABILITY}}`                                 |
| **Scope**         | `ux`                                             |
| **Last Updated**  | `{{CURRENT_DATE}}`                               |
| **References**    | `prd-fe-{{DOMAIN}}-ui-v1.0.md`, `screen-fe-{{DOMAIN}}-catalog-v1.0.md`, `ddd-shared-{{DOMAIN}}-core-v1.0.md` |

## Purpose

This wireframe defines the visual and structural design for the **{{CAPABILITY_TITLE}}** screen in the **{{DOMAIN_TITLE}}** domain.

## Screen Overview

| Attribute | Value |
| --------- | ----- |
| **Screen ID** | [SCR-XXX] |
| **Route** | `/[route]` |
| **Purpose** | [What users accomplish] |
| **Primary Domain Objects** | [Entities] |

## Layout Structure

```
+--------------------------------------------------+
|                    HEADER                         |
|  [Logo]  [Navigation]            [User Menu]     |
+--------------------------------------------------+
|  BREADCRUMB: Home > [Section] > [Screen]         |
+--------------------------------------------------+
|                                                   |
|  PAGE TITLE                          [Actions]   |
|                                                   |
+--------------------------------------------------+
|                                                   |
|  +---------------------------------------------+ |
|  |              SECTION 1                      | |
|  |                                             | |
|  |  [Content / Form / Table]                   | |
|  |                                             | |
|  +---------------------------------------------+ |
|                                                   |
|  +---------------------------------------------+ |
|  |              SECTION 2                      | |
|  |                                             | |
|  |  [Content / Form / Table]                   | |
|  |                                             | |
|  +---------------------------------------------+ |
|                                                   |
+--------------------------------------------------+
|                    FOOTER                         |
+--------------------------------------------------+
```

## Sections

### Section 1: [Section Name]

| Attribute | Value |
| --------- | ----- |
| **Purpose** | [What this section shows/does] |
| **Position** | [Where in layout] |
| **Visibility** | [Always/Conditional] |

**Components:**

| Component | Type | Purpose | Binding |
| --------- | ---- | ------- | ------- |
| [Field/Control] | [Input/Display/Action] | [Purpose] | [Data source] |

### Section 2: [Section Name]

| Attribute | Value |
| --------- | ----- |
| **Purpose** | [What this section shows/does] |
| **Position** | [Where in layout] |
| **Visibility** | [Always/Conditional] |

**Components:**

| Component | Type | Purpose | Binding |
| --------- | ---- | ------- | ------- |
| [Field/Control] | [Input/Display/Action] | [Purpose] | [Data source] |

## Field Groupings

### Group: [Group Name]

| Field | Label | Type | Required | Validation | Notes |
| ----- | ----- | ---- | -------- | ---------- | ----- |
| `fieldName` | [Label] | [Type] | [Yes/No] | [Rules] | [Notes] |

## Action Controls

| Action | Label | Type | Position | Behavior | Permission |
| ------ | ----- | ---- | -------- | -------- | ---------- |
| Submit | [Label] | Primary Button | [Position] | [What happens] | [Permission] |
| Cancel | [Label] | Secondary Button | [Position] | [What happens] | [Permission] |

## State Behavior

### Default State

[Description of initial state when screen loads]

### Loading State

[Description of loading indicators]

### Empty State

[Description of what shows when no data]

### Error State

[Description of error display]

### Success State

[Description of success feedback]

## Conditional Visibility

| Element | Condition | Behavior |
| ------- | --------- | -------- |
| [Element] | [When condition is true] | [Show/Hide/Disable] |

## Business Rules Notes

- [Rule 1 that affects this screen]
- [Rule 2 that affects this screen]

## Permission Notes

| Permission | Effect |
| ---------- | ------ |
| [Permission] | [How it affects this screen] |

## Responsive Notes

| Breakpoint | Changes |
| ---------- | ------- |
| Mobile | [Layout changes] |
| Tablet | [Layout changes] |

## DSL Reference

This wireframe translates to: `dsl-fe-{{DOMAIN}}-{{CAPABILITY}}-v1.0.yaml`

## Open Questions

- [Question 1]
- [Question 2]
