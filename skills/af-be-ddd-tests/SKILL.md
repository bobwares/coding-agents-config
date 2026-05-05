---
name: af-ddd-tests
description: Generate test scenarios and JUnit 5 test implementations from a Domain-Driven Design specification's worked examples. Produces unit tests, integration tests, e2e tests, edge cases, performance tests, and data validation tests.
context: project
memory-integration:
   reads_from:
      - project.name
      - artifacts.ddd.path
      - artifacts.ddd.version
      - artifacts.tests.path
   writes_to:
      - artifacts.tests.path
      - artifacts.tests.status
      - artifacts.tests.version
      - artifacts.tests.generated_by
      - artifacts.tests.updated_at
      - progress.current_phase
   requires:
      - artifacts.ddd.status: completed
---

# af-ddd-tests

## Purpose

Generate comprehensive test specification and JUnit 5 test implementations from a Domain-Driven Design (DDD) specification's worked examples.

This skill:
1. Parses a DDD spec (v2.0+) to extract all worked examples
2. Maps each example to test scenarios (unit, integration, e2e, edge case, performance)
3. Generates test specifications (`.appfactory/specs/tests.md`)
4. Generates JUnit 5 test implementations (`.appfactory/tests/...`)

Output aligns with test pyramid: unit tests (mock externals) → integration tests (real DB) → e2e tests (full Spring context) → performance tests (JMH/Gatling).

## When To Use

Use this skill when:

1. A DDD specification exists with worked examples and is marked completed
2. The next step is to generate test coverage for Claims Core implementation
3. You need both test specification (planning) and test code (implementation)
4. You want automated test generation from DDD examples to ensure coverage

Do **not** use this skill if:
- DDD specification is incomplete or not finalized
- Worked examples are insufficient (< 10 scenarios)
- Test framework/database not yet selected (assumes JUnit 5 + Spring Test + PostgreSQL)

## Input

### Required Files

**DDD Specification Path** (from state.yml or parameter):
```bash
ddd_path=$(af_state_get "artifacts.ddd.path")
```

Must contain:
- ≥ 10 worked examples (typically 20 in v2.2.0+)
- Clear example structure: **Scenario**, **Flow**, **Assertions**
- All 9 state machine transitions exercised across examples
- Edge cases (duplicate detection, immutability, failure modes)

### Optional Parameters

- `--test-framework`: Target framework (default: `junit5-spring`)
- `--database`: Database type (default: `postgresql`)
- `--coverage-target`: Line coverage target (default: `90`)
- `--output-format`: `spec-only` | `code-only` | `both` (default: `both`)

## Output Files

### Test Specification

**Path**: `.appfactory/specs/tests.md`

Comprehensive test specification with:
- 6 test categories (unit, integration, e2e, edge case, performance, data validation)
- ≥ 60 test scenarios derived from DDD examples
- Clear test structure: Setup, Action, Assertions
- Coverage matrix (state transitions, invariants, examples)
- Implementation notes (framework, database, coverage target)

### Test Code (JUnit 5)

**Path**: `.appfactory/tests/`

Generated test classes:
```
.appfactory/tests/
  unit/
    StateTransitionTest.java
    BusinessInvariantTest.java
    FieldValidationTest.java
  integration/
    AdjudicationDeterminismTest.java
    AccumulatorIdempotencyTest.java
    AntiCorruptionLayerTest.java
    EventPublishingTest.java
  e2e/
    Example01_HappyPath_ApprovedClaimTest.java
    Example02_PreventiveService_NoDedTest.java
    ... (one per worked example)
  edge/
    ConcurrencyTest.java
    AuthorizationTest.java
    ImmutabilityTest.java
    ValidationTest.java
  performance/
    SubmissionLatencyTest.java
    AdjudicationLatencyTest.java
    ThroughputTest.java
  validation/
    DataValidationTest.java
```

Each test class is runnable via JUnit 5, includes proper Spring Test setup, uses H2 or Testcontainers for DB.

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

### Step 3: Generate Test Specification

1. Create `.appfactory/specs/tests.md`
2. Generate test scenarios for:
   - **Unit Tests**: State transitions (9), invariants (10), validation (4)
   - **Integration Tests**: Determinism (4), accumulators (4), anti-corruption (2), events (8)
   - **E2E Tests**: One per worked example (typically 20)
   - **Edge Cases**: Concurrency, auth, immutability, validation, policy, timeout, amounts
   - **Performance**: Latency (p99), throughput, caching, idempotency
   - **Data Validation**: Precision, uniqueness, format, constraints
3. Organize by category with clear descriptions
4. Include implementation notes and framework guidance

### Step 4: Generate Test Code (Optional)

If `--output-format` is `code-only` or `both`:

1. Generate test class templates for each category
2. Implement test methods with proper:
   - Annotations (@Test, @BeforeEach, @Mock, @Transactional)
   - Spring Test context setup
   - Database initialization (Testcontainers or H2)
   - Assertion methods
3. Include utility methods (claimBuilder, policySnapshotFixture, etc.)
4. Add JavaDoc comments linking to spec scenarios

### Step 5: Update State

1. Write `artifacts.tests.path` in state.yml
2. Set `artifacts.tests.status` = `generated`
3. Record `artifacts.tests.version` = `1.0.0`
4. Set `artifacts.tests.generated_by` = `af-ddd-tests`

## State Management

### Read From State

```yaml
artifacts:
  ddd:
    path: .appfactory/specs/spec-be-ddd.md
    version: 2.2.0
    status: completed
  tests:
    path: .appfactory/specs/tests.md
```

### Write To State

```yaml
artifacts:
  tests:
    path: .appfactory/specs/tests.md
    version: 1.0.0
    status: generated
    generated_by: af-ddd-tests
    updated_at: 2026-05-04T12:00:00Z
```

## Example Invocation

```bash
# Generate both spec and code
/af-ddd-tests

# Generate specification only (for review)
/af-ddd-tests --output-format spec-only

# Generate code with custom coverage target
/af-ddd-tests --output-format code-only --coverage-target 95

# Use alternate database
/af-ddd-tests --database mysql
```

## Dependencies

- DDD specification v2.0+ with worked examples
- JUnit 5 (Jupiter) framework
- Spring Test framework
- Testcontainers (for integration tests)
- PostgreSQL or H2 (in-memory for tests)
- Project POM/Gradle configured with test dependencies

## Implementation Language

- Bash (orchestration, file I/O)
- Python or Bash (parsing DDD, generating test templates)
- Generated output: Java (JUnit 5 test classes)

## Quality Gates

1. **Specification completeness**: ≥ 60 test scenarios derived from ≥ 10 examples
2. **Coverage**: All 9 state transitions, all 10 invariants, all 5 NFRs
3. **Code generation**: All test classes syntactically valid Java
4. **Traceability**: Each test scenario linked to source example
5. **Documentation**: All test methods have clear JavaDoc

## Notes

- Test code generation is optional (spec-only mode available for planning)
- Generated code requires Spring Test context and database setup before running
- E2E tests use Spring Boot test harness; may require `application-test.yml` configuration
- Performance tests use JMH; run separately from unit/integration tests
- All generated code includes TODOs for business logic assertions (to be completed during implementation)

---

**Version**: 1.0.0  
**Created**: 2026-05-04
