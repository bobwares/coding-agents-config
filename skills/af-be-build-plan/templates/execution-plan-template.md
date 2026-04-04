# Backend Execution Plan

## Document Control

### Metadata

| Field              | Value                            |
|--------------------|----------------------------------|
| **Document Title** | **<Project Name> Backend Execution Plan** |
| **Version**        | **0.1.0**                        |
| **Status**         | **Draft**                        |
| **Prepared By**    | **Claude via af-be-build-plan skill**  |
| **Document Type**  | **Backend Execution Plan**       |
| **Date**           | **<YYYY-MM-DD>**                 |
| **Coding Agent **  | **<coding agent>**              |

## Inputs

### Source Inputs

| Input                      | Path / Reference               | Notes |
|----------------------------|--------------------------------|-------|
| **DDD DSL YAML**           | ./ai/specs/dls-be-ddd.yaml |       |
| **Project DSL / Tech Stack Profile** | ./ai/specs/project.dsl.yaml | Selected stack profile comes from `application.tech_stack_profiles` |


## Planning Summary

### Objective

State the overall implementation objective.

### Scope Summary

Summarize the backend application or backend module to be built from the DSL representation of the Domain Driven Design and the selected technology stack DSL.

## Stack Interpretation

### Selected Stack

Summarize the selected implementation stack.

### Stack Implications

| Area            | Stack Decision | Planning Impact |
|-----------------|----------------|-----------------|
| **Scaffolding** |                |                 |
| **Backend**     |                |                 |
| **API / Transport** |            |                 |
| **Persistence** |                |                 |
| **Integrations / Jobs** |         |                 |
| **Testing**     |                |                 |
| **Deployment**  |                |                 |

## Execution Strategy

### Strategy Summary

Explain the chosen build strategy and ordering logic.

## Recommended Turn Strategy

### Classification

One of:

- `single_turn_recommended`
- `single_turn_possible_but_risky`
- `multi_turn_recommended`

### Rationale

Explain why this classification was selected.

## Phases

### Ordered Phases

| Phase | Name | Objective | Notes |
|-------|------|-----------|-------|
| 1     |      |           |       |

## Ordered Task Plan

### Task Format

Repeat this structure for each task.

#### Task <ID>: <Title>

**Objective**  

**Rationale**  

**Inputs**  

**Dependencies**  

**Recommended Skill / Command / Method**  

**Expected Files or Modules Changed**  

**Expected Outputs**  

**Completion Criteria**  

**Verification Steps**  

## Dependency Graph Summary

### Dependency Notes

Summarize key dependencies and critical path items.

## Validation and Quality Gates

### Required Checks

| Check Type            | Requirement | When Applied |
|-----------------------|-------------|--------------|
| **Build**             |             |              |
| **Tests**             |             |              |
| **Lint / Format**     |             |              |
| **Type Checks**       |             |              |
| **Security / Policy** |             |              |
| **Observability**     |             |              |

## Risks and Open Questions

### Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
|      |        |            |

### Open Questions

| Question | Why It Matters | Recommended Resolution |
|----------|----------------|------------------------|
|          |                |                        |

## Executor Handoff

### Execution Notes

Provide concise instructions for the coding agent that will execute this backend plan.
