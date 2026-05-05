# Turn 006: Refactor af-be-ddd-tests to Gherkin BDD

**Task**: task-003  
**Turn**: turn-006  
**Branch**: task/T003  
**Date**: 2026-05-05  
**Model**: claude-haiku-4-5-20251001  

## Objective

Refactor the af-be-ddd-tests skill to generate Gherkin-style BDD scenarios instead of JUnit 5 test implementations. This aligns the skill with the broader AppFactory pipeline: PRD → DDD → **Gherkin Features** → Cucumber Step Definitions.

## Context

The af-be-ddd-tests skill was originally designed to generate comprehensive JUnit 5 test implementations from DDD worked examples. The refactor goal is to shift to human-readable Gherkin feature files that:

1. **Stakeholder Readability**: Business analysts and product managers can read and understand test scenarios
2. **BDD Alignment**: Creates a clear bridge between DDD domain models and Cucumber/Gherkin testing frameworks
3. **Separation of Concerns**: Skill focuses on specification (feature files); step definitions become downstream responsibility
4. **Domain Organization**: Feature files organized by aggregate/bounded context, improving maintainability

## Scope of Work

### Modified Files

1. **`skills/af-be-ddd-tests/SKILL.md`** (240 lines → refactored 80%)
   - Updated description from "JUnit 5 test implementations" to "Gherkin BDD scenarios"
   - Changed purpose, input, output, and process sections
   - Replaced test framework references with Gherkin/Cucumber references
   - Updated quality gates for Gherkin syntax validation
   - Updated version to 2.0.0 (major refactor)

### Created Files

2. **`skills/af-be-ddd-tests/templates/feature-template.gherkin`** (new)
   - Gherkin feature file template with proper structure
   - Includes Feature header, Background, Scenario blocks, Scenario Outline
   - Demonstrates Given-When-Then syntax with comments linking to DDD examples

3. **`skills/af-be-ddd-tests/templates/gherkin-spec-template.md`** (new)
   - Comprehensive Gherkin specification summary document template
   - Includes feature files index, scenario traceability matrix, coverage analysis
   - Provides implementation guidance for Cucumber step definition developers

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| **Gherkin ONLY** (no JUnit 5) | Cleaner scope, avoids duplication. Step definitions become separate downstream concern. Skill focused on BDD specification. |
| **One feature per aggregate** | Aligns with DDD bounded contexts. Easier to maintain. Clear separation of concerns per domain concept. |
| **Feature file organization** | Organized by aggregate/bounded context from DDD, making domain structure immediately apparent. |
| **Specification summary document** | Provides traceability and coverage analysis. Non-developers can read feature files directly; document provides index and links to source examples. |
| **Template-based approach** | Consistent with other AppFactory generation skills (af-be-ddd-build, af-be-build-dsl, etc.). Templates live in `templates/` directory. |

## Outputs Generated

### Primary Outputs

1. **Refactored SKILL.md**
   - Now describes Gherkin feature file generation instead of JUnit 5 tests
   - Updated all sections: Purpose, Input, Output, Process, Dependencies, Quality Gates
   - Added feature organization strategy (one per aggregate)
   - Added Gherkin-specific parameters and configuration options

2. **Feature File Template** (`feature-template.gherkin`)
   - Canonical Gherkin syntax example
   - Demonstrates Feature header, Background, Scenario, Scenario Outline blocks
   - Shows Given-When-Then structure with business language
   - Includes comments linking scenarios to DDD examples and invariants

3. **Gherkin Specification Template** (`gherkin-spec-template.md`)
   - Document control section (standard format)
   - Feature files index and summary statistics
   - Scenario traceability matrix mapping scenarios to DDD examples
   - Coverage analysis by type (Happy Path, Edge Cases, Error Cases, Data Validation)
   - State transition coverage matrix
   - Invariant verification coverage
   - Implementation guidance for Cucumber step definitions
   - Example DDD-to-Gherkin mapping reference

## Next Steps (Post-Turn Implementation)

1. **Script Development** (if needed): Create Python/Bash scripts to:
   - Parse DDD Markdown documents to extract worked examples
   - Infer aggregate/bounded context from example context
   - Map examples to Gherkin Given-When-Then structure
   - Generate feature files by aggregate

2. **Testing**: 
   - Test with sample DDD spec from previous task
   - Verify feature file syntax is valid Gherkin
   - Verify traceability to DDD examples
   - Validate specification summary document

3. **Integration**:
   - Integrate with af-memory state management
   - Update artifacts.features state in project memory
   - Ensure compatibility with downstream Cucumber step definition generation

## Quality Assurance

### Validation Checks

- [x] SKILL.md refactored with Gherkin focus
- [x] Feature file template created with valid Gherkin syntax
- [x] Specification template created with comprehensive structure
- [x] Memory integration updated (reads PRD, writes to artifacts.features)
- [x] Quality gates defined for Gherkin syntax and scenario completeness
- [ ] Scripts for parsing/generation (deferred to future turn)
- [ ] End-to-end testing with sample DDD spec (deferred to future turn)

## Design Approach

### Input Processing

The refactored skill will:
1. Read DDD spec from `artifacts.ddd.path`
2. Read PRD from `artifacts.prd.path` (optional)
3. Parse DDD "Worked Examples" section (regex: `### Example \d+:`)
4. Parse DDD "Bounded Contexts" section to identify aggregates
5. For each worked example, extract:
   - Title and example number
   - Input/preconditions → Given steps
   - Business process → When step
   - Outcomes/assertions → Then steps
6. Group scenarios by aggregate (from Bounded Contexts mapping)
7. Classify by type (Happy Path, Edge Case, Error Case, Data Validation)

### Output Generation

1. For each aggregate, create one `.feature` file in `src/test/features/`
2. Feature file contains:
   - Feature header with business capability description
   - Background section (shared preconditions)
   - Multiple Scenario blocks (each from DDD example)
   - Scenario Outline blocks (for parameterized variations)
   - Comments linking to DDD Example numbers
3. Generate `.appfactory/specs/gherkin-test-spec.md` with:
   - Feature index and summary statistics
   - Scenario traceability matrix
   - Coverage analysis
   - Implementation guidance

### State Management

Update in state.yml:
```yaml
artifacts:
  features:
    path: src/test/features/
    version: 1.0.0
    status: generated
    generated_by: af-be-ddd-tests
    scenario_count: [N]
    feature_count: [M]
    coverage:
      aggregates_covered: [List]
      state_transitions: [Count]
      invariants_verified: [Count]
```

## Gherkin Syntax Primer

### Feature Files Structure

```gherkin
Feature: [Aggregate Name] - [Business Capability]
  As a [Actor]
  I want to [Goal]
  So that [Value]

  Background:
    Given [shared precondition]

  Scenario: [Scenario Name - Business Outcome]
    Given [precondition]
    When [action]
    Then [outcome]
    And [additional assertion]

  Scenario Outline: [Parameterized Scenario]
    Given [precondition with <parameter>]
    When [action]
    Then [outcome <expected>]
    Examples:
      | parameter | expected |
      | value1    | result1  |
```

### Given-When-Then Mapping from DDD

| DDD Section | Gherkin Keyword | Purpose |
|---|---|---|
| Input, Preconditions | Given | Establish system state and context |
| Business Process, Trigger | When | Describe the action or trigger |
| State Change, Outcomes, Events | Then | Assert expected results and side effects |
| Invariants, Rules | And | Additional assertions or conditions |

## Success Criteria

✓ SKILL.md refactored with Gherkin focus  
✓ Feature file template created and matches Gherkin syntax  
✓ Specification template created with comprehensive structure  
✓ Memory integration updated (reads PRD, writes features path)  
✓ Parameters updated for Gherkin generation (aggregate-filter, scenario-type, etc.)  
✓ Quality gates updated for Gherkin-specific validation  
✓ Documentation updated with Gherkin examples  
✓ Version bumped to 2.0.0 (major change)  

---

**Turn Status**: Complete  
**Files Modified**: 1  
**Files Created**: 2  
**Artifacts**: SKILL.md refactor, templates/feature-template.gherkin, templates/gherkin-spec-template.md
