# ADR 001: Refactor af-be-ddd-tests from JUnit 5 to Gherkin BDD

**Date**: 2026-05-05  
**Status**: Accepted  
**Context**: Turn 006, Task 003  
**Author**: AI Coding Agent (Haiku)  

---

## Problem Statement

The af-be-ddd-tests skill currently generates JUnit 5 test implementations from DDD worked examples. While effective for developers, this approach has limitations:

1. **Non-developer accessibility**: Business stakeholders, product managers, and QA cannot read or understand generated test code
2. **Tight coupling**: Test code couples test logic to specific framework (JUnit 5, Spring Test, database technology)
3. **Missed BDD opportunity**: DDD specifications describe behavior in business terms, but tests are generated in Java
4. **Skill scope creep**: Skill must support entire test infrastructure (Spring Test setup, database configuration, assertions)

**Key Question**: How can we bridge DDD domain models with executable tests while maintaining stakeholder readability?

---

## Solution: Generate Gherkin-Based BDD Scenarios

### Decision

Refactor af-be-ddd-tests to generate Gherkin-style BDD (Behavior-Driven Development) feature files instead of JUnit 5 test code.

### Rationale

1. **Stakeholder Alignment**: Gherkin syntax is human-readable; business experts can understand and validate scenarios without technical knowledge
2. **Framework Agnostic**: Feature files are technology-independent; any BDD framework (Cucumber, Behave, etc.) can implement the scenarios
3. **Separation of Concerns**: Skill focuses on BDD specification; step definition implementation becomes a downstream concern
4. **Natural DDD Mapping**: DDD worked examples (narrative bullet points) map cleanly to Gherkin Given-When-Then structure
5. **Living Documentation**: Feature files serve as both executable tests and documentation for stakeholders
6. **Consistency**: Aligns with broader AppFactory pipeline: PRD → DDD → **Gherkin Features** → Cucumber Step Definitions

### Output Format

Instead of:
```java
@Test
@DisplayName("Approve claim with valid evidence")
void testApproveClaimWithValidEvidence() { ... }
```

Generate:
```gherkin
Feature: Claim adjudication workflow
  Scenario: Approve claim when evidence quality exceeds threshold
    Given a claim in PENDING state with evidence quality score of 8.5
    When the adjudicator approves the claim
    Then the claim status should be APPROVED
```

### Organization Strategy

Feature files organized by **aggregate/bounded context** (from DDD):
- One `.feature` file per aggregate (e.g., `claim-adjudication.feature`, `evidence-processing.feature`)
- Aligns with DDD domain structure
- Improves discoverability and maintainability
- Clear separation by business domain concept

### Specification Summary Document

Generate `.appfactory/specs/gherkin-test-spec.md` providing:
- Feature files index and statistics
- Scenario traceability (each scenario linked to DDD Example N)
- Coverage analysis (scenarios by type, state transitions, invariants)
- Implementation guidance for Cucumber step definition developers

---

## Trade-offs

### Advantages

| Advantage | Impact |
|-----------|--------|
| **Stakeholder readability** | Non-technical stakeholders can understand, validate, and contribute to test scenarios |
| **Framework independence** | Feature files work with any BDD framework (Cucumber, Behave, SpecFlow, etc.) |
| **Reduced scope** | Skill focuses on specification; step definitions are separate concern |
| **Living documentation** | Feature files serve as both tests and documentation for the domain |
| **DDD alignment** | Natural mapping from DDD worked examples to Gherkin scenarios |
| **Domain organization** | Feature files organized by aggregate improve maintainability |

### Disadvantages

| Disadvantage | Mitigation |
|---|---|
| **Requires step definitions** | Step definition development is downstream responsibility; templates/examples provided |
| **Runtime execution separate** | Step definitions and test runner must be implemented in target language |
| **Framework knowledge** | Cucumber step definition developers need BDD framework expertise |
| **Additional tooling** | Cucumber tooling (IDE plugins, runners) must be configured |

---

## Implementation Scope

### Modified Files

1. **`skills/af-be-ddd-tests/SKILL.md`** (version 2.0.0)
   - Refactored description, purpose, input, output, process, dependencies, quality gates
   - Updated to focus on Gherkin feature file generation
   - Changed memory integration (reads PRD, writes to artifacts.features)
   - Bumped version to 2.0.0 (breaking change from v1.0.0)

### Created Templates

2. **`templates/feature-template.gherkin`**
   - Canonical Gherkin feature file template
   - Demonstrates Feature, Background, Scenario, Scenario Outline syntax
   - Includes comments linking scenarios to DDD examples

3. **`templates/gherkin-spec-template.md`**
   - Comprehensive specification summary template
   - Provides structure for documentation, traceability, coverage analysis
   - Includes implementation guidance for step definitions

### Future Implementation (Next Turns)

Scripts to be developed:
- Parse DDD Markdown to extract worked examples
- Parse Bounded Contexts to infer aggregate grouping
- Map examples to Gherkin Given-When-Then structure
- Generate feature files organized by aggregate
- Generate specification summary document

---

## Quality Gates

### Gherkin-Specific Validation

1. **Syntax Validation**: All `.feature` files valid Gherkin (parseable by Cucumber)
2. **Scenario Completeness**: Every scenario has Given-When-Then steps
3. **Business Language**: All steps use domain terms, no implementation details
4. **Traceability**: Each scenario linked to DDD Example N or PRD requirement
5. **Coverage**: ≥ 50% of DDD worked examples converted to scenarios
6. **Readability**: Non-technical stakeholders can understand scenarios

---

## Alternatives Considered

### 1. Generate Both Gherkin AND JUnit 5

**Rejected because**: Duplicates test logic (specification vs implementation). Increases maintenance burden. Violates DRY principle. Larger skill scope.

**Decision**: Gherkin ONLY. Step definitions are downstream responsibility.

### 2. Keep JUnit 5, Add Gherkin as Optional Format

**Rejected because**: Complicates skill implementation. Creates multiple code paths. Unclear default behavior. Users must choose format explicitly.

**Decision**: Replace with Gherkin. Cleaner, simpler, more focused.

### 3. Generate Gherkin in Single Feature File

**Rejected because**: All scenarios in one file limits organization. Harder to navigate. Doesn't reflect DDD bounded context structure.

**Decision**: One feature file per aggregate/bounded context. Aligns with DDD organization. Improves discoverability.

### 4. Feature Files in `.appfactory/specs/`

**Rejected because**: Specs are planning/design artifacts. Feature files should be co-located with test code (project root). Standard Java project structure puts features in `src/test/features/`.

**Decision**: Feature files in `src/test/features/`. Specification summary in `.appfactory/specs/gherkin-test-spec.md`.

---

## Acceptance Criteria

- [x] SKILL.md refactored with Gherkin focus
- [x] Feature file template created with valid Gherkin syntax
- [x] Specification template created with comprehensive structure
- [x] Memory integration updated (reads PRD, writes artifacts.features)
- [x] Quality gates defined for Gherkin-specific validation
- [x] Version bumped to 2.0.0
- [ ] Python/Bash scripts implemented for parsing and generation (future)
- [ ] End-to-end testing with sample DDD spec (future)

---

## Consequences

### Immediate

1. **Skill refactor complete**: SKILL.md and templates ready for implementation
2. **API change**: Parameters changed from test-framework/database to aggregate-filter/scenario-type
3. **Output change**: Feature files (`.feature`) instead of Java test classes

### Short-term

1. **Script development**: Python/Bash scripts needed to parse DDD and generate feature files
2. **Testing phase**: Validate with sample DDD spec from previous tasks
3. **Documentation**: Step definition templates/examples needed for downstream teams

### Long-term

1. **Ecosystem alignment**: Encourages adoption of Cucumber/Gherkin across organization
2. **Stakeholder engagement**: Non-developers can review and validate test scenarios
3. **Maintenance efficiency**: Feature files easier to update than Java test code
4. **Framework flexibility**: Easy to switch BDD frameworks (Cucumber → Behave, etc.)

---

## Related Decisions

- **ADR 002** (future): DDD-to-Gherkin mapping algorithm and parser implementation
- **ADR 003** (future): Aggregate grouping strategy and feature file organization rules
- **Design Pattern**: Repository pattern for DDD example extraction

---

## Sign-Off

**Decision Maker**: User (confirmed preference for Gherkin ONLY + one feature per aggregate)  
**Architect**: AI Coding Agent  
**Status**: Accepted and implemented in turn-006  

---

**End of ADR**
