# afGetLayoutPattern

## Purpose

`afGetLayoutPattern` returns layout context for named AppFactory HTML layout patterns.

The skill is intended to be called by other AppFactory skills before they render HTML documents.

## Initial Scope

Planning patterns only:

- Intent Card Layout
- Coding Plan Layout
- Task Breakdown Layout
- Test Plan Layout
- Project Plan Milestone Layout

## Usage

```yaml
layoutName: project milestone
```

Returns the matching YAML context from:

```text
patterns/planning/project-plan-milestone-layout.yml
```

## Rule

The skill returns context only. It does not render HTML.
