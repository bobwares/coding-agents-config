# ADR: Create af-be-build-implementation Skill

## Status

Accepted

## Context

The App Factory backend pipeline requires a skill to execute backend application generation. The workflow involves:

1. PRD → DDD → DSL → Plan → **Implementation**

The `af-be-build-implementation` skill is the execution layer that:
- Copies a selected tech stack implementation scaffold from the App Factory
- Generates domain code based on the `dsl-be-ddd.yaml` specification

## Decision

Created `skills/af-be-build-implementation/` with:

1. **SKILL.md** — Defines the skill with:
   - Input requirements (tech stack implementation, DSL, target project)
   - Five-phase execution procedure (scaffold, domain code, integration, validation, manifest)
   - Tech stack specific patterns for NestJS, FastAPI, Spring Boot, and Lambda
   - Constraints and quality bar

2. **templates/implementation-manifest-template.yaml** — Template for tracking:
   - Source stack and DSL used
   - Generated modules and files
   - Bounded context summaries
   - Validation results
   - TODOs for business logic

## Consequences

- Completes the App Factory backend pipeline skill chain
- Enables automated backend scaffolding and code generation
- Provides traceability via implementation manifest
- Follows established skill patterns from `af-be-build-dsl` and `af-be-build-plan`
