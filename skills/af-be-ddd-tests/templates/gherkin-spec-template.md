# Gherkin Test Specification

## Document Control

### Document Metadata

| Field | Value |
|-------|-------|
| **Document Title** | **[Project Name] Gherkin BDD Specification** |
| **Version** | **1.0.0** |
| **Status** | **Generated** |
| **Author** | **AI Code Generation** |
| **Prepared By** | **af-be-ddd-tests Skill v2.0.0** |
| **Document Type** | **Gherkin BDD Specification** |
| **Path/File Name** | `.appfactory/specs/gherkin-test-spec.md` |
| **Created Date** | **[ISO Timestamp]** |
| **Last Updated** | **[ISO Timestamp]** |

### Version History

| Version | Date | Author | Summary |
|---------|------|--------|---------|
| 1.0.0 | [ISO Timestamp] | AI Code Generation | Initial Gherkin specification generated from DDD and PRD |

---

## Overview

### Generation Source

Generated from:
- **DDD Specification**: [Path] (v[Version]) - [Status]
- **PRD Specification**: [Path] (v[Version]) - [Status] (optional)
- **Generation Date**: [ISO Timestamp]
- **Generator**: af-be-ddd-tests Skill v2.0.0

### Purpose

This document provides:
1. **Feature Files Summary**: Index and organization of all generated `.feature` files
2. **Scenario Traceability**: Complete mapping from Gherkin scenarios to DDD worked examples
3. **Coverage Analysis**: Distribution of scenarios by type and aggregate
4. **BDD Specification Details**: Narrative descriptions of features and scenarios
5. **Implementation Guidance**: Notes for Cucumber step definition developers

---

## Feature Files Summary

### Overview Statistics

- **Total Feature Files**: [N]
- **Total Scenarios**: [M]
- **Aggregates Covered**: [Count]
- **Average Scenarios per Feature**: [X]
- **Scenario Types**: Happy Path: [X], Edge Cases: [Y], Error Cases: [Z], Data Validation: [W]

### Feature Files Index

| Feature File | Aggregate | Bounded Context | Scenarios | Coverage | Status |
|---|---|---|---|---|---|
| [name].feature | [Aggregate Root] | [Context] | N | [Scope Description] | Generated |

---

## Scenario Traceability Matrix

Complete mapping from generated scenarios to DDD worked examples:

| Feature | Scenario | DDD Example | Type | Aggregates Involved | Invariants Verified | Events Emitted | Downstream Systems |
|---|---|---|---|---|---|---|---|
| [feature-name] | [Scenario Name] | Example N | Happy Path/Edge/Error/Validation | [List] | INV-01, INV-02 | EventType1, EventType2 | System1, System2 |

---

## BDD Specification Details

### Feature: [Aggregate Name] - [Business Capability]

**Aggregate Root**: [Aggregate Class/Name]

**Business Context**: [One-paragraph description of what this feature covers, why it's important, and what business value it delivers]

**Bounded Context Relationship**: [How this aggregate relates to other bounded contexts and external systems]

#### Scenario: [Scenario Name]

**Source**: DDD Example N: "[Example Title]"

**Type**: Happy Path / Edge Case / Error Case / Data Validation

**Business Goal**: [What business behavior or requirement this scenario validates]

**Aggregates Involved**: [List of aggregate roots interacting in this scenario]

**State Transitions**: [Which state machine transitions this scenario exercises]

**Invariants Verified**:
- INV-[N]: [Invariant description] ✓
- INV-[M]: [Invariant description] ✓

**Events Emitted**:
- [EventType1]: [When emitted, impact on downstream systems]
- [EventType2]: [When emitted, impact on downstream systems]

**Given-When-Then Structure**:

```gherkin
Given [precondition 1]
  And [precondition 2]
When [action]
Then [outcome 1]
  And [outcome 2]
  And [outcome 3]
```

**Business Rules Enforced**:
- [Business Rule 1 - mapped to Then assertion]
- [Business Rule 2 - mapped to Then assertion]

**Related PRD Requirements**: [References to specific PRD sections if applicable]

---

## Coverage Analysis

### By Scenario Type

| Type | Count | % | Coverage | Notes |
|------|-------|---|----------|-------|
| Happy Path | X | Y% | Standard success flows | Represents primary use cases |
| Edge Cases | X | Y% | Boundary conditions, threshold testing | Validates constraint handling |
| Error Cases | X | Y% | Failure modes, validation errors | Ensures robustness |
| Data Validation | X | Y% | Format, uniqueness, constraint verification | Tests data integrity |
| **Total** | **M** | **100%** | | |

### By Aggregate/Bounded Context

| Aggregate | Feature File | Scenarios | State Transitions | Invariants | Notes |
|-----------|---|---|---|---|---|
| [Aggregate1] | [name].feature | N | [Subset of 9] | [Count] | Primary aggregate |
| [Aggregate2] | [name].feature | N | [Subset of 9] | [Count] | Supporting aggregate |
| **Total** | [Count] | **M** | 9 | [Count] | |

### State Transition Coverage

Representation of all possible state transitions:

| Transition | Source State | Target State | Scenario | Covered |
|---|---|---|---|---|
| ST-01 | INITIAL | SUBMITTED | [Scenario Name] | ✓ |
| ST-02 | SUBMITTED | ACKNOWLEDGED | [Scenario Name] | ✓ |
| ST-03 | ACKNOWLEDGED | IN_REVIEW | [Scenario Name] | ✓ |
| ST-04 | IN_REVIEW | APPROVED | [Scenario Name] | ✓ |
| ST-05 | IN_REVIEW | DENIED | [Scenario Name] | ✓ |
| ST-06 | APPROVED | PAID | [Scenario Name] | ✓ |
| ST-07 | DENIED | APPEALED | [Scenario Name] | ✓ |
| ST-08 | APPEALED | FINAL | [Scenario Name] | ✓ |
| ST-09 | [ANY] | ARCHIVED | [Scenario Name] | ✓ |

**Coverage**: 100% of state transitions represented

### Invariant Verification Coverage

| Invariant | ID | Description | Verified In Scenario(s) | Enforcement | Coverage |
|---|---|---|---|---|---|
| [Invariant Name] | INV-01 | [Description] | [Scenario A], [Scenario B] | Precondition, Assertion | ✓ |
| [Invariant Name] | INV-02 | [Description] | [Scenario C] | Precondition, Assertion | ✓ |

**Total Invariants Verified**: [Count] / [Total]

---

## Implementation Guidance for Cucumber Step Definitions

### Step Definition Language Recommendations

Generated feature files are language-agnostic. Common implementations:
- **Java**: Cucumber JVM with Spring annotations for dependency injection
- **Python**: Behave framework for behavior-driven development
- **Ruby**: Cucumber with step definitions in `features/step_definitions/`
- **JavaScript**: Cypress-Cucumber with TypeScript support

### Step Definition Pattern Template

For each Given/When/Then step in feature files, implement a step definition:

```java
@Given("^[regex pattern from given step]$")
public void givenPrecondition(String parameter) {
  // Setup: Initialize domain object, database state, or system context
  // Reference: DDD Example N - [Example Title]
}

@When("^[regex pattern from when step]$")
public void whenAction(String parameter) {
  // Execute: Call domain service or aggregate command
  // Ensure: All preconditions established in Given steps
}

@Then("^[regex pattern from then step]$")
public void thenOutcome(String parameter) {
  // Assert: Verify state change, invariants, event emission
  // Reference: Invariants INV-01, INV-02
}
```

### Testing Best Practices

1. **One Scenario = One Behavior**: Each scenario tests exactly one thing
2. **Business Language First**: Steps describe WHAT the system does, not HOW
3. **No Implementation Details**: Steps never reference code, classes, or databases
4. **Step Reusability**: Write steps generically to be reused across scenarios
5. **Database State Management**: Use Background for shared preconditions; avoid test interdependence
6. **Assertion Clarity**: Then steps assert specific, testable outcomes
7. **Event Verification**: When scenarios emit events, assert the events are published

### Recommended Test Data Fixtures

From DDD worked examples:
- [Fixture 1]: [Description] - Used in [Scenario A], [Scenario B]
- [Fixture 2]: [Description] - Used in [Scenario C]

---

## Appendix: DDD-to-Gherkin Mapping Reference

### Example Mapping Pattern

**DDD Worked Example**:
```
### Example 5: Approve claim with valid evidence

1. Input: Claim in PENDING state, evidence quality = 8.5/10, adjudicator role
2. Business Process: Adjudicator reviews claim; quality exceeds threshold
3. State Change: Claim transitions from PENDING → APPROVED
4. Invariant INV-02 Verified: Only approved by authorized adjudicator
5. Event Emitted: ClaimApprovedEvent with timestamp and adjudicator ID
6. Downstream: Claims billing system notified; customer receives approval notice
```

**↓ Converts To ↓**

**Gherkin Scenario**:
```gherkin
Scenario: Approve claim when evidence quality exceeds threshold
  # From DDD Example 5
  # Verifies: INV-02, State Transition PENDING→APPROVED
  Given a claim in PENDING state with evidence quality score of 8.5
    And the user has ADJUDICATOR role
  When the adjudicator approves the claim
  Then the claim status should be APPROVED
    And INV-02 invariant is satisfied (authorized role approval)
    And a ClaimApprovedEvent should be published
    And the billing system should be notified
    And the customer should receive an approval notice
```

---

**End of Gherkin Test Specification**
