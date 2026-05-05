# af-ddd-tests Skill

Generate comprehensive test specifications and JUnit 5 test implementations from Domain-Driven Design (DDD) specification worked examples.

## What It Does

1. **Parses DDD Specification**: Extracts all worked examples (typically 20+ scenarios)
2. **Maps to Test Scenarios**: Creates unit, integration, e2e, edge case, performance, and data validation tests
3. **Generates Test Specification**: Creates `.appfactory/specs/tests.md` with 60+ test scenarios
4. **Generates Test Code** (optional): Creates JUnit 5 test classes with boilerplate and TODOs

## Files

- **SKILL.md** — Skill definition, usage, inputs/outputs, state management
- **af-ddd-tests.py** — Python implementation (parser, generators)
- **README.md** — This file

## Usage

### As a Claude Skill

```bash
# Generate both specification and test code
/af-ddd-tests

# Generate specification only (for review/planning)
/af-ddd-tests --output-format spec-only

# Generate test code only (with 95% coverage target)
/af-ddd-tests --output-format code-only --coverage-target 95
```

### Direct Python

```bash
python3 af-ddd-tests.py \
  --ddd-path /path/to/spec-be-ddd.md \
  --output-spec .appfactory/specs/tests.md \
  --output-code .appfactory/tests \
  --output-format both
```

## Input

**Required**: DDD specification (v2.0+) with worked examples at:
- `.appfactory/specs/spec-be-ddd.md` (default)
- Or path specified via `--ddd-path`

Examples must follow structure:
```markdown
### Example N: Title

**Scenario**: Description...

**Flow**: Steps...

**Assertions**: Expected outcomes...
```

## Output

### Test Specification (specs/tests.md)

600+ lines with:
- **25 Unit Tests**: State transitions, invariants, validation
- **18 Integration Tests**: Determinism, accumulators, events
- **20 E2E Tests**: One per worked example
- **10 Edge Case Tests**: Concurrency, auth, immutability
- **5 Performance Tests**: Latency, throughput, caching
- **5 Data Validation Tests**: Precision, uniqueness, format

### Test Code (tests/ directory)

JUnit 5 test classes organized by category:
```
tests/
  unit/
    StateTransitionTest.java
  integration/
    AdjudicationIntegrationTest.java
  e2e/
    Example01Test.java
    Example02Test.java
    ...
  edge/
    EdgeCaseTest.java
  performance/
    PerformanceTest.java
  validation/
    DataValidationTest.java
```

Each class includes:
- Spring Test annotations
- Testcontainers setup (embedded PostgreSQL)
- Test method stubs with TODOs
- Clear JavaDoc linking to spec scenarios

## Test Coverage

| Category | Count | Details |
|----------|-------|---------|
| Unit | 25 | 9 state transitions, 10 invariants, 4 validation |
| Integration | 18 | 4 determinism, 4 accumulators, 2 anti-corruption, 8 events |
| E2E | 20 | 1:1 mapping to worked examples |
| Edge Case | 10 | Concurrency, auth, immutability, validation |
| Performance | 5 | Latency p99, throughput, caching |
| Validation | 5 | Data precision, uniqueness, format |
| **Total** | **83** | All scenarios tested |

## Implementation Status

- ✓ Specification generation (complete)
- ✓ Test code boilerplate generation (complete)
- ⚠️ Test implementations (TODOs in generated code — to be completed during implementation phase)

## Example Output

### Test Specification (tests.md)

```markdown
# Healthcare Claim Processing System — Test Specification

## Test Strategy Overview

Test pyramid: Unit → Integration → E2E → Performance.

20 worked examples mapped to 83 test scenarios.

## Unit Tests

**UT-001: Valid Transition — Draft → Submitted**
- Setup: Claim in Draft, all required fields
- Action: SubmitClaim(claimId)
- Assert: State → Submitted, event published

...
```

### Test Code (Example01Test.java)

```java
@SpringBootTest
@ActiveProfiles("test")
public class Example01Test {
    
    @Test
    void testExample1() {
        // TODO: Implement full scenario
        // Scenario: Routine office visit, $150, deductible $500
        
        // Flow: Draft → Submit → Adjudicate → Approved → Paid
        
        // Assertions: All states transition correctly, events published
    }
}
```

## Dependencies

- Python 3.7+
- DDD specification v2.0+ with examples
- JUnit 5 (Jupiter) — for generated code
- Spring Test framework — for generated code
- Testcontainers — for integration tests

## Quality Gates

- ✓ Parse all worked examples (≥ 10)
- ✓ Generate ≥ 60 test scenarios
- ✓ Cover all 9 state transitions
- ✓ Cover all 10 business invariants
- ✓ Map to all 5 NFR targets
- ✓ Syntactically valid generated code

## Notes

- Test code is generated with boilerplate only; business logic assertions are TODOs
- Requires Spring context for integration tests (configure in `application-test.yml`)
- Performance tests should run separately from unit/integration tests
- Generated code assumes JUnit 5 + Spring Test + PostgreSQL (testcontainers)

---

**Version**: 1.0.0  
**Created**: 2026-05-04
