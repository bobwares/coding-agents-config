# Frontend PRD

## Metadata

| Field             | Value                                            |
| ----------------- | ------------------------------------------------ |
| **Document Name** | `prd-fe-{{DOMAIN}}-ui-v1.0.md`                   |
| **Title**         | **Frontend PRD: {{DOMAIN_TITLE}}**               |
| **Version**       | `1.0.0`                                          |
| **Status**        | `Draft`                                          |
| **Domain**        | `{{DOMAIN}}`                                     |
| **Scope**         | `fe`                                             |
| **Last Updated**  | `{{CURRENT_DATE}}`                               |
| **References**    | `glossary-shared-{{DOMAIN}}-core-v1.0.md`, `ddd-shared-{{DOMAIN}}-core-v1.0.md`, `prd-be-{{DOMAIN}}-services-v1.0.md`, `api-be-{{DOMAIN}}-rest-v1.0.yaml` |

## Purpose

This document defines frontend-focused requirements for the **{{DOMAIN_TITLE}}** domain, including personas, user journeys, screen goals, interaction rules, and accessibility requirements.

## Personas

### Persona: [Persona Name]

| Attribute | Value |
| --------- | ----- |
| **Role** | [Role description] |
| **Goals** | [What they want to accomplish] |
| **Pain Points** | [Current frustrations] |
| **Technical Proficiency** | [Low/Medium/High] |
| **Usage Frequency** | [Daily/Weekly/Monthly] |

## User Journeys

### Journey: [Journey Name]

| Step | Action | Screen | Outcome |
| ---- | ------ | ------ | ------- |
| 1 | [User action] | [Screen name] | [Result] |
| 2 | [User action] | [Screen name] | [Result] |

**Entry Points:**
- [How users enter this journey]

**Exit Points:**
- [How users complete or abandon this journey]

## Screen Goals

| Screen ID | Screen Name | Primary Goal | Success Criteria |
| --------- | ----------- | ------------ | ---------------- |
| SCR-001 | [Name] | [Goal] | [How to measure success] |

## Field Presentation Rules

| Field | Display Format | Edit Format | Notes |
| ----- | -------------- | ----------- | ----- |
| [Field Name] | [How to display] | [How to edit] | [Special rules] |

## Input Behavior

| Input Type | Behavior | Validation Feedback |
| ---------- | -------- | ------------------- |
| [Input] | [On blur/on change/on submit] | [How to show errors] |

## Validation Messages

| Validation | Message | Display Location |
| ---------- | ------- | ---------------- |
| [Rule] | [User-friendly message] | [Inline/Toast/Summary] |

## State Definitions

### Empty States

| Screen | Condition | Display |
| ------ | --------- | ------- |
| [Screen] | [When empty] | [What to show] |

### Error States

| Error Type | Display | Recovery Action |
| ---------- | ------- | --------------- |
| [Error] | [How to show] | [What user can do] |

### Loading States

| Operation | Display | Duration Threshold |
| --------- | ------- | ------------------ |
| [Operation] | [Skeleton/Spinner/etc] | [When to show] |

## Accessibility Requirements

| Requirement | Target | Notes |
| ----------- | ------ | ----- |
| WCAG Level | AA | [Specific requirements] |
| Keyboard Navigation | Full | [Focus order, shortcuts] |
| Screen Reader | Full | [ARIA requirements] |
| Color Contrast | 4.5:1 minimum | [Exception cases] |

## Responsive Behavior

| Breakpoint | Layout Changes |
| ---------- | -------------- |
| Mobile (< 768px) | [Changes] |
| Tablet (768-1024px) | [Changes] |
| Desktop (> 1024px) | [Changes] |

## Permissions by Action

| Action | Required Permission | UI Behavior When Denied |
| ------ | ------------------- | ----------------------- |
| [Action] | [Permission] | [Hidden/Disabled/Message] |

## Open Questions

- [Question 1]
- [Question 2]
