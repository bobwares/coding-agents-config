---
name: afGetLayoutPattern
description: Return AppFactory HTML layout pattern context for a requested layout name. The skill is a lookup/context provider used by other AppFactory skills before they render HTML documents.
version: 1.0.0
category: appfactory-layouts
scope:
  initial_categories:
    - Planning Patterns
supported_layouts:
  - Intent Card Layout
  - Coding Plan Layout
  - Task Breakdown Layout
  - Test Plan Layout
  - Project Plan Milestone Layout
---

# afGetLayoutPattern

## Purpose

Return the AppFactory HTML layout pattern context for a requested layout name.

This skill is a lookup/context skill. It does not generate the final HTML document. The calling AppFactory skill uses the returned context to render an HTML artifact with the correct layout, required sections, navigation structure, and metadata behavior.

## Inputs

| Input | Required | Description |
|---|---:|---|
| `layoutName` | Yes | Name or alias of the requested AppFactory layout pattern. |

## Output

Return YAML context only. The returned YAML must describe:

- Layout identity
- Category
- Purpose
- Source paths
- Rendering rules
- Required sections
- Optional sections
- Calling-skill instructions

## Supported Layouts: Planning Patterns

| Layout | Aliases |
|---|---|
| Intent Card Layout | `intent-card`, `intent`, `intent card`, `intent-card-layout` |
| Coding Plan Layout | `coding-plan`, `coding plan`, `implementation plan`, `coding-plan-layout` |
| Task Breakdown Layout | `task-breakdown`, `task breakdown`, `tasks`, `task-breakdown-layout` |
| Test Plan Layout | `test-plan`, `test plan`, `testing plan`, `test-plan-layout` |
| Project Plan Milestone Layout | `project-plan-milestone`, `milestone plan`, `project milestone`, `project-plan-milestone-layout` |

## Normalization Rules

Normalize `layoutName` before matching:

1. Trim leading and trailing whitespace.
2. Convert to lowercase.
3. Replace `_` with `
4. Collapse repeated spaces.
5. Match against canonical layout names and aliases.

## Rules

- Normalize layoutName by lowercasing, trimming whitespace, replacing underscores with hyphens, and matching known aliases.
- Return only the matched layout context.
- Do not generate the final HTML document.
- Do not invent unknown layout patterns.
- All planning layouts use TOC Layout as their base layout.
- HTML output created by the calling skill must use the AppFactory Document Metadata header already defined in Claude context.
- Do not create menu.md.
- Return error object if no match found.

## Output Shape

```yaml
layout:
  id: project-plan-milestone-layout
  name: Project Plan Milestone Layout
  category: Planning Patterns
  purpose: >
    Documents project phases, milestones, deliverables, dependencies,
    acceptance criteria, and completion state.
  source:
    markdown: layout-patterns/project-plan-milestone-layout/README.md
    html: layout-patterns/project-plan-milestone-layout/project-plan-milestone-layout.html
  rendering:
    base_layout: toc-layout
    requires_document_metadata_header: true
    navigation: table-of-contents
    output_type: html
  required_sections:
    - Document Metadata
    - Purpose
    - Scope
    - Milestone Summary
    - Milestones
    - Dependencies
    - Risks
    - Acceptance Criteria
    - Completion Status
  optional_sections:
    - Assumptions
    - Open Questions
    - Next Actions
  calling_skill_instructions:
    - Use this context before rendering the final HTML document.
    - Preserve the section order unless the user explicitly requests otherwise.
    - Use the TOC layout for navigation.
    - Use the existing AppFactory Document Metadata header standard.
```

## Error Response

```yaml
error:
  code: unsupported_layout_pattern
  message: Requested layout pattern is not supported by AF-GetLayoutPattern.
  supported_layouts:
    - Intent Card Layout
    - Coding Plan Layout
    - Task Breakdown Layout
    - Test Plan Layout
    - Project Plan Milestone Layout
```

## Behavior

When called with `layoutName`, identify the matching file under `patterns/planning/` and return that YAML content.

Examples:

- `layoutName: "intent"` returns `patterns/planning/intent-card-layout.yml`
- `layoutName: "coding plan"` returns `patterns/planning/coding-plan-layout.yml`
- `layoutName: "project milestone"` returns `patterns/planning/project-plan-milestone-layout.yml`
