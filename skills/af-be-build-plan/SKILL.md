---
name: af-be-build-plan
description: Generate a backend application execution plan from a domain DSL YAML and a selected tech stack profile. Produces a step-by-step backend implementation plan optimized for single-turn execution when feasible, with explicit multi-turn recommendations when warranted.
context: project
---

# AppFactory Backend App Build Plan

## Purpose

Use this skill to transform a completed backend application DSL YAML plus a selected tech stack profile into an execution-ready orchestration plan for an AI coding agent.

This skill is the planning layer between:

1. the domain DSL YAML,
2. the selected technology stack profile,
3. the execution step that will actually generate code.

The output must be a human-readable but agent-actionable backend execution plan that can be consumed by a follow-on execution skill or agent.

## Inputs

The skill expects these inputs:

1. A completed domain DSL YAML document.
2. A selected backend tech stack definition or stack profile.
3. Optional implementation constraints such as repo conventions, required skills, governance requirements, testing requirements, or deployment constraints.

## Required Outputs

Generate this file by default:

1. `ai/specs/spec-be-plan.md`

If the caller provides different output paths, use those paths.

## Output Intent

The execution plan must:

1. interpret the DSL and stack together,
2. determine a practical build order,
3. identify task dependencies,
4. identify required skill invocations,
5. define expected outputs per task,
6. define verification and quality gates,
7. classify whether execution should be single-turn or multi-turn.

## Planning Rules

### 1. Treat the DSL as the primary build definition

The DSL is the source of truth for the domain/application structure to be implemented.

### 2. Treat the tech stack profile as the implementation constraint set

The tech stack determines:

1. scaffolding approach,
2. package/module layout,
3. persistence strategy,
4. API implementation style,
5. integration and background-processing strategy,
6. testing strategy,
7. deployment and runtime assumptions.

### 3. Prefer build order that reduces rework

A typical order may include:

1. initialize/scaffold,
2. core domain/data types,
3. persistence models,
4. services/use cases,
5. API contracts/endpoints,
6. integration wiring and background jobs,
7. tests,
8. observability/security hardening,
9. final validation.

But do not force this order if the stack or DSL suggests a better sequence.

### 4. Tasks must be AI-agent executable

Each task must be explicit enough that a coding agent can perform it with minimal interpretation.

### 5. Plans should favor one-turn execution when safe

Classify the plan as exactly one of:

1. `single_turn_recommended`
2. `single_turn_possible_but_risky`
3. `multi_turn_recommended`

### 6. Flag ambiguity instead of inventing unsupported assumptions

If the DSL or stack is missing key details, record them in the plan itself under risks, open questions, and executor handoff notes.

## Required Plan Structure

Use the template in `templates/execution-plan-template.md`.

## Task Authoring Rules

Each task must include:

1. `Task ID`
2. `Title`
3. `Objective`
4. `Rationale`
5. `Inputs`
6. `Dependencies`
7. `Recommended Skill / Command / Method`
8. `Expected Files or Modules Changed`
9. `Expected Outputs`
10. `Completion Criteria`
11. `Verification Steps`

## Required Planning Content

The final plan must include:

1. document control,
2. inputs used,
3. stack interpretation,
4. planning summary,
5. execution strategy,
6. turn recommendation,
7. ordered phases,
8. ordered task plan,
9. dependency summary,
10. validation and quality gates,
11. risks,
12. open questions,
13. executor handoff notes.

## Inline Follow-Up Requirements

The plan itself must capture:

1. ambiguous DSL sections,
2. ambiguous stack assumptions,
3. missing prerequisites,
4. likely split points for multi-turn execution,
5. tasks with elevated implementation risk,
6. recommended prerequisite skills or setup tasks.

## Forbidden Shortcuts

Do not:

1. output only a vague narrative,
2. output only phases without executable tasks,
3. collapse all work into one generic “implement app” task,
4. ignore the selected tech stack,
5. output implementation code,
6. rewrite the DSL instead of planning from it,
7. omit testing, validation, or quality gates.

## Quality Bar

A valid output must make it possible for a downstream execution agent to:

1. understand what to do first,
2. know which tasks depend on others,
3. know which skills or commands to invoke,
4. know what artifacts to produce,
5. know how completion will be verified.
6. stay focused on backend modules, APIs, persistence, integrations, and operational concerns rather than client interaction work.
