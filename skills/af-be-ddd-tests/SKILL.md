---
name: af-ddd-tests
description: Generate Gherkin-style BDD scenarios from Domain-Driven Design and PRD specifications. Produces human-readable feature files organized by aggregate/bounded context for use with Cucumber and other BDD testing frameworks.
context: project
memory-integration:
   reads_from:
      - project.name
      - artifacts.ddd.path
      - artifacts.ddd.version
      - artifacts.prd.path
      - artifacts.features.path
   writes_to:
      - artifacts.features.path
      - artifacts.features.status
      - artifacts.features.version
      - artifacts.features.generated_by
      - artifacts.features.updated_at
      - progress.current_phase
   requires:
      - artifacts.ddd.status: completed
---

# af-ddd-tests

## Purpose

Generate comprehensive Gherkin-style BDD (Behavior-Driven Development) scenarios from a Domain-Driven Design (DDD) specification's worked examples and Product Requirements Document (PRD).

This skill:
1. Parses a DDD spec to extract all worked examples and aggregates
2. Parses PRD to extract functional requirements and business rules
3. Maps examples and requirements to Gherkin scenarios grouped by aggregate/bounded context
4. Generates human-readable feature files (`.feature`) organized by domain concept
5. Generates a Gherkin specification summary (`.appfactory/specs/gherkin-test-spec.md`)

Output is fully compatible with Cucumber, Behave, and other Gherkin-based BDD frameworks.

## When To Use

Use this skill when:

1. A DDD specification exists with worked examples and is marked completed
2. A PRD exists defining functional requirements and business rules
3. You want to create human-readable BDD scenarios for stakeholder review and team alignment
4. You want to bridge domain models (DDD) with automated testing via Gherkin
5. You plan to implement step definitions in Cucumber, Behave, or similar BDD framework

Do **not** use this skill if:
- DDD specification is incomplete or not finalized
- Worked examples are insufficient (< 10 scenarios)
- You only need implementation-focused test code (in that case, use traditional test generation tools)

## Input

### Required Files

**DDD Specification Path** (from state.yml or parameter):
```bash
ddd_path=$(af_state_get "artifacts.ddd.path")
```

Must contain:
- ≥ 10 worked examples 
- Clear example structure with: Input, Business Process, State Change, Invariants, Events, Downstream
- Bounded Contexts section defining aggregates/domain concepts
- All major state transitions and invariants represented in examples
- Edge cases, error scenarios, and data validation examples

**PRD (Optional but Recommended)**:
```bash
prd_path=$(af_state_get "artifacts.prd.path")
```

Provides:
- Functional requirements that map to scenarios
- Business rules and policy constraints (become Then assertions)
- Role definitions (actors in Given context)
- Use cases and workflows

### Optional Parameters

- `--output-location`: Target directory for feature files (default: `src/test/features/`)
- `--aggregate-filter`: Generate feature files only for specific aggregates (comma-separated)
- `--scenario-type`: Filter scenarios (default: `all`; options: `happy-path`, `edge-case`, `error-case`, `data-validation`)
- `--include-spec-summary`: Generate Gherkin specification summary document (default: `true`)

## Output Files

### Gherkin Feature Files

**Path**: `.appfactory/specs/test-features/` 

One `.feature` file per aggregate/bounded context:
```
.appfactory/specs/test-features/
  claim-adjudication.feature         [Claim aggregate scenarios: approval, denial, review]
  claim-submission.feature           [Claim submission: intake, validation, routing]
  evidence-processing.feature        [Evidence aggregate: collection, quality assessment, storage]
  policy-lookup.feature              [Policy aggregate: retrieval, caching, versioning]
  event-publishing.feature           [Domain events: publishing, ordering, retry]
  authorization.feature              [Access control: role verification, permissions]
  data-validation.feature            [Field validation: formats, constraints, uniqueness]
```

Each feature file contains:
- Feature header: Business capability description + aggregate name
- Background: Shared preconditions (system initialization, standard context)
- Multiple Scenario blocks: Each from a DDD worked example or PRD requirement
- Given/When/Then steps: Extracted from DDD example structure, business-readable language
- Scenario Outline: For parameterized testing of variations and edge cases
- Comments: Cross-references to DDD Example N and invariants verified

### Gherkin Specification Summary

**Path**: `.appfactory/specs/gherkin-test-spec.md`

Comprehensive specification document with:
- Document control metadata (title, version, author, dates)
- Feature files summary table (file name, aggregate, scenario count, coverage scope)
- Scenario traceability matrix (feature, scenario name, source DDD example, scenario type, verified invariants/events)
- Detailed BDD specification sections for each feature (description, scenarios, assertions, business rules)
- Coverage analysis (total scenarios, distribution by type, aggregates covered, state transitions, invariants verified)
- Implementation guidance for Cucumber step definitions

## Process

### Step 1: Input Validation

1. Read DDD path from state.yml
2. Verify DDD file exists and has worked examples
3. Extract example count and validate ≥ 10

### Step 2: Parse Worked Examples

1. Extract all examples from DDD (regex: `### Example \d+:`)
2. Parse each example structure: Scenario, Flow, Assertions
3. Categorize by type: happy path, manual review, edge case, failure, etc.
4. Build example-to-test mapping

### Step 3: Group Scenarios by Aggregate/Bounded Context

1. Parse DDD Bounded Contexts section to identify aggregates
2. For each aggregate, collect all relevant worked examples and PRD requirements
3. Classify scenarios by type:
   - **Happy Path**: Success cases with valid inputs and expected outcomes
   - **Edge Cases**: Boundary conditions, maximum/minimum values, threshold crossing
   - **Error Cases**: Validation failures, authorization denials, exception handling
   - **Data Validation**: Format verification, constraint checking, uniqueness rules
4. Organize scenarios logically within each aggregate's feature file

### Step 4: Generate Gherkin Feature Files

1. For each aggregate, create one `.feature` file in `.appfactory/specs/test-features/`
2. Populate with:
   - **Feature header**: Business capability description referencing aggregate name
   - **Background section**: Shared preconditions (system state, standard context)
   - **Scenario blocks**: Each mapped from a DDD worked example
     - Extract **Given** steps from DDD example's "Input" and context
     - Extract **When** step from DDD example's "Business Process"
     - Extract **Then** steps from DDD example's "State Change", "Invariants", "Events", "Downstream"
   - **Scenario Outline blocks** (optional): For parameterized test variations
   - **Comments**: Reference DDD Example numbers and invariant IDs
3. Ensure all steps use business language (no implementation details)
4. Verify Gherkin syntax is valid (can be parsed by Cucumber)

### Step 5: Generate Gherkin Specification Summary

1. Create `.appfactory/specs/gherkin-test-spec.md`
2. Include:
   - Document control metadata
   - Feature files summary table (file, aggregate, scenario count)
   - Scenario traceability matrix (feature → scenario → DDD Example source → verified invariants)
   - Detailed scenario descriptions (Given-When-Then with business context)
   - Coverage analysis (scenario distribution, aggregates covered, state transitions, invariants verified)
3. Link each scenario to its source DDD Example

### Step 6: Update State

1. Write `artifacts.features.path` = `.appfactory/specs/test-features/` in state.yml
2. Set `artifacts.features.status` = `generated`
3. Record `artifacts.features.version` = `1.0.0`
4. Set `artifacts.features.generated_by` = `af-ddd-tests`
5. Record `artifacts.features.scenario_count` = total number of scenarios generated
6. Record `artifacts.features.feature_count` = number of feature files generated

## State Management

### Read From State

```yaml
artifacts:
  ddd:
    path: .appfactory/specs/spec-be-ddd.md
    version: 2.2.0
    status: completed
    bounded_contexts: [List]
  prd:
    path: .appfactory/specs/prd.md
    version: 1.0.0
    status: completed
```

### Write To State

```yaml
artifacts:
  features:
    path: src/test/features/
    version: 1.0.0
    status: generated
    generated_by: af-ddd-tests
    updated_at: 2026-05-04T12:00:00Z
    scenario_count: 68
    feature_count: 7
    coverage:
      aggregates_covered: [Claim, Policy, Evidence, Event]
      state_transitions_represented: 9
      invariants_verified: 10
```

## Example Invocation

```bash
# Generate feature files and specification summary (default)
/af-be-ddd-tests

# Generate feature files only for specific aggregates
/af-be-ddd-tests --aggregate-filter Claim,Evidence

# Generate only happy path scenarios
/af-be-ddd-tests --scenario-type happy-path

# Generate feature files to custom location
/af-be-ddd-tests --output-location features/

# Generate without specification summary (feature files only)
/af-be-ddd-tests --include-spec-summary false
```

## Dependencies

- DDD specification v2.0+ with worked examples
- PRD (optional) with functional requirements and business rules
- Cucumber (for running feature files)
- Gherkin parser/validator (built into most IDEs and CI tools)
- Python (for parsing Markdown and generating files)
- Bash (for orchestration and state management)

## Implementation Language

- Bash (orchestration, file I/O)
- Python or Bash (parsing DDD, generating test templates)
- Generated output: Java (JUnit 5 test classes)

## Quality Gates

1. **Specification completeness**: ≥ 50 scenarios derived from ≥ 10 DDD examples
2. **Gherkin syntax validation**: All `.feature` files valid Gherkin (parseable by Cucumber)
3. **Scenario structure**: Every scenario has Given-When-Then steps
4. **Business language**: All steps use domain terms, no implementation details
5. **Traceability**: Each scenario linked to DDD Example N or PRD requirement
6. **Coverage**: ≥ 1 feature file per major aggregate/bounded context
7. **State transitions**: All 9 state transitions represented across scenarios
8. **Invariants**: All domain invariants verified in at least one scenario
9. **Readability**: Non-technical stakeholders can understand scenarios without code knowledge

## Notes

- Feature files are human-readable specifications, not executable code
- Cucumber step definitions (Ruby, Python, Java, etc.) must be implemented separately to automate scenarios
- Gherkin feature files serve as "living documentation" for stakeholders and developers
- Specification summary document (gherkin-test-spec.md) provides traceability and coverage analysis
- All generated feature files follow standard Gherkin conventions (Given-When-Then-And-But)
- Feature organization by aggregate aligns with DDD bounded contexts and improves maintainability
- Background sections reduce duplication of preconditions across scenarios within a feature
- Scenario Outline enables parameterized testing of data variations and edge cases

