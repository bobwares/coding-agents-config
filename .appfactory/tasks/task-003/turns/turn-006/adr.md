# ADR: af-be-build-implementation Skill Refactor to Use Plan + BDD Specs

**Date:** 2026-05-05  
**Status:** Accepted  
**Decision ID:** T003-006-001

## Problem

The af-be-build-implementation skill was designed to consume `dsl-be-ddd.yaml` as its primary input for generating backend domain code. However, the AppFactory pipeline has evolved:

1. DSL generation step is no longer part of the primary workflow
2. BDD feature specifications (from af-be-ddd-tests) are now the primary source of truth for domain behavior
3. Execution plan (from af-be-build-plan) already contains task sequencing and implementation guidance
4. Implementation should be driven by concrete scenarios and explicit plan rather than abstract DSL

The skill needed alignment with this evolved pipeline to avoid confusion and unused dependencies.

## Decision

**Refactor af-be-build-implementation to use Plan + BDD Feature Specs as primary inputs instead of DSL.**

Specifically:
- Remove `artifacts.dsl.path` from required inputs
- Add `artifacts.features.path` (Gherkin feature files from af-be-ddd-tests)
- Add `artifacts.gherkin_spec.path` (specification summary from af-be-ddd-tests)
- Keep `artifacts.plan.path` as required (it already was)
- Update all domain code generation phases to consume plan tasks and feature scenarios
- Map entity/service/API generation directly to scenario Given-When-Then structure
- Add step definition generation for Gherkin scenarios

## Rationale

1. **Source of Truth Clarity:** BDD specs explicitly define domain behavior via scenarios; DSL was an intermediate representation
2. **Plan-Driven Execution:** The plan already contains task sequencing, module structure, and dependencies—no need to re-interpret DSL
3. **Scenario-Based Code Gen:** Gherkin scenarios directly map to service methods, DTOs, validation rules, and API endpoints
4. **Test Coverage Alignment:** Generated code explicitly implements feature scenarios; step definitions make testing concrete
5. **Pipeline Coherence:** Skills now flow naturally: PRD → DDD → BDD Features + Plan → Implementation

## Consequences

**Positive:**
- Clearer input contract: plan + features replace opaque DSL
- Direct mapping from scenarios to generated code
- Test scaffolding auto-aligned to BDD features
- No intermediate DSL interpretation needed

**Negative:**
- Existing projects using DSL-based generation must update their workflows
- Requires plan + features to be generated before implementation

## Implementation Details

Updated sections in SKILL.md:
1. Memory-integration reads: Remove dsl.path, add features.path and gherkin_spec.path
2. Purpose: Plan + Features instead of DSL
3. When to Use: Require BDD specs instead of DSL approval
4. Inputs: Plan + Features descriptions replace DSL description
5. Phase 2 Domain Code Gen: Follow plan tasks; map entities/services/APIs to scenarios
6. Validation: Check for feature files instead of DSL
7. Memory Integration Pre-Exec: Verify features.status == generated
8. Test Scaffold: Step definitions aligned to Gherkin
9. Quality Bar: Include feature coverage and step definitions

## Related Skills

- **af-be-ddd-tests:** Generates Gherkin features (output used by this skill)
- **af-be-build-plan:** Generates execution plan (input already required)
- **af-be-ddd:** Orchestrator that runs DDD workflow
- **af-be-build-dsl:** No longer in the primary path for this skill

## Open Questions

None. Refactor is complete and unambiguous.
