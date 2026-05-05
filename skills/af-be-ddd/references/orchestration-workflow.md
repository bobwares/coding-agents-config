# DDD Orchestration Workflow

## Overview

`af-be-ddd` is an orchestration skill that coordinates a complete backend Domain-Driven Design (DDD) workflow. It does not generate, analyze, refactor, or test content directly. Instead, it invokes child skills in a controlled sequence and loop.

## Workflow Phases

### Phase 1: Configuration Validation

**Objective:** Load and validate configuration parameters

**Actions:**
1. Read `CLAUDE.md` from project root
2. Extract `max_ddd_tries` value
3. Validate that `max_ddd_tries`:
   - Exists in CLAUDE.md
   - Is a positive integer
   - Is parseable as a number

**Hard Stops:**
- CLAUDE.md not found → Error: "CLAUDE.md not found"
- max_ddd_tries missing → Error: "max_ddd_tries not found in CLAUDE.md"
- max_ddd_tries invalid → Error: "max_ddd_tries must be a positive integer"

**Success Condition:** Configuration validated, max_ddd_tries value established

### Phase 2: Initial Build

**Objective:** Generate the initial backend DDD specification

**Actions:**
1. Invoke `af-be-ddd-build` skill
2. Wait for completion
3. Confirm successful build

**Hard Stops:**
- Skill unavailable → Error: "af-be-ddd-build skill unavailable"
- Skill fails → Error: "af-be-ddd-build skill failed"

**Success Condition:** Backend DDD specification generated and persisted

**Output Preservation:** All artifacts produced by `af-be-ddd-build` are preserved for subsequent phases

### Phase 3: Analyze & Refactor Loop

**Objective:** Iteratively improve DDD specification through analysis and refactoring

**Loop Structure:**

```
ddd_try_count = 0
loop_exit_reason = ""

while ddd_try_count < max_ddd_tries:
  1. Invoke af-be-ddd-analysis
  2. Determine if refactoring is needed from analysis output
  3. If no refactoring needed:
     - Set loop_exit_reason = "no refactoring required"
     - Exit loop
  4. If refactoring needed:
     - Increment ddd_try_count
     - If ddd_try_count == max_ddd_tries:
       - Set loop_exit_reason = "max attempts reached"
       - Exit loop
     - Else:
       - Invoke af-be-ddd-refactor
       - Continue loop
```

**Hard Stops:**
- af-be-ddd-analysis skill fails → Error: "af-be-ddd-analysis skill failed"
- af-be-ddd-refactor skill fails → Error: "af-be-ddd-refactor skill failed on attempt N"

**Loop Metrics:**
- `analysis_passes`: Count of `af-be-ddd-analysis` invocations
- `refactor_attempts`: Count of `af-be-ddd-refactor` invocations
- `ddd_try_count`: Current attempt counter (capped at max_ddd_tries)
- `loop_exit_reason`: String describing why loop exited

**Refactoring Decision Logic:**

The orchestrator must determine whether refactoring is required based on the output of `af-be-ddd-analysis`. The analysis skill should produce output that indicates:

- `refactoring_required: true` → Continue loop (invoke refactoring)
- `refactoring_required: false` → Exit loop (no more refactoring needed)

This decision point is critical and must be unambiguous.

**Loop Termination Conditions:**

1. **Quality Gate Passed:** Analysis determines no refactoring needed
   - Result: `loop_exit_reason = "no refactoring required"`
   - Metrics: N analysis passes, M refactor attempts (M < N)

2. **Attempt Limit Reached:** `ddd_try_count` equals `max_ddd_tries`
   - Result: `loop_exit_reason = "max attempts reached"`
   - Metrics: N analysis passes, max_ddd_tries refactor attempts

**Important:** The loop runs AT LEAST once (analysis always runs first). If the initial analysis determines no refactoring is needed, the loop exits after 1 analysis pass and 0 refactor attempts.

### Phase 4: Test Generation

**Objective:** Generate and run test suite for the DDD specification

**Actions:**
1. Invoke `af-be-ddd-tests` skill
2. Wait for completion
3. Confirm test results

**Hard Stops:**
- Skill unavailable → Error: "af-be-ddd-tests skill unavailable"
- Skill fails → Error: "af-be-ddd-tests skill failed"

**Unconditional Execution:** Tests ALWAYS run, regardless of Phase 3 loop exit reason. If the loop exited because max_ddd_tries was reached (potential quality issues), tests still execute to validate the final specification.

**Success Condition:** Test suite generated and passed

**Output Preservation:** All test artifacts are preserved

### Phase 5: Results Reporting

**Objective:** Summarize orchestration results

**Report Contents:**

```
Build Status:
  ✓ Backend DDD built successfully

Analysis & Refactoring Loop:
  - Analysis passes: N
  - Refactor attempts: M
  - Loop exit reason: [reason]
  - Max attempts allowed: max_ddd_tries

Test Results:
  ✓ Test suite [PASSED|FAILED]
```

**Report Fields:**

- `analysis_passes`: Total count of analysis invocations
- `refactor_attempts`: Total count of refactoring invocations
- `loop_exit_reason`: Human-readable reason for loop exit
  - "no refactoring required" → Quality gate passed
  - "max attempts reached" → Hit iteration limit
- `test_status`: PASSED or FAILED

## Child Skill Invocation Sequence

```
[Start]
   ↓
[Phase 1: Validate Config]
   ↓
[Phase 2: Build]
   ├→ af-be-ddd-build (1 invocation)
   ↓
[Phase 3: Loop]
   ├→ af-be-ddd-analysis (1+ invocations)
   ├→ af-be-ddd-refactor (0 to max_ddd_tries invocations)
   ↓
[Phase 4: Test]
   ├→ af-be-ddd-tests (1 invocation)
   ↓
[Phase 5: Report]
   ↓
[Complete]
```

## Output Preservation

The orchestrator must preserve all outputs from child skills:

- **af-be-ddd-build**: Generated DDD specification, analysis results
- **af-be-ddd-analysis**: Quality assessment, refactoring recommendations
- **af-be-ddd-refactor**: Updated DDD specification
- **af-be-ddd-tests**: Test suite, test results

All artifacts remain accessible for post-execution review and debugging.

## Error Handling Strategy

**Immediate Failure:**
- Configuration validation fails → Hard stop, report error
- Build phase fails → Hard stop, report error
- Analysis fails → Hard stop, report error during loop iteration N
- Refactoring fails → Hard stop, report error at attempt M
- Tests fail → Hard stop, report error

**No Fallback:** The orchestrator does not attempt recovery. All failures are fatal and halt execution.

## Loop Behavior Examples

### Example 1: Quality Gate Passed on First Analysis

```
max_ddd_tries = 3

[Build]
  ✓ DDD built

[Analysis Pass 1]
  Result: No refactoring needed
  
[Loop Exit]
  Reason: "no refactoring required"
  Analysis passes: 1
  Refactor attempts: 0

[Tests]
  ✓ Passed
```

### Example 2: Multiple Refinements, Quality Gate Passed

```
max_ddd_tries = 3

[Build]
  ✓ DDD built

[Analysis Pass 1]
  Result: Refactoring needed
  
[Refactor Attempt 1]
  ✓ Complete

[Analysis Pass 2]
  Result: Refactoring needed
  
[Refactor Attempt 2]
  ✓ Complete

[Analysis Pass 3]
  Result: No refactoring needed
  
[Loop Exit]
  Reason: "no refactoring required"
  Analysis passes: 3
  Refactor attempts: 2

[Tests]
  ✓ Passed
```

### Example 3: Max Attempts Reached

```
max_ddd_tries = 3

[Build]
  ✓ DDD built

[Analysis Pass 1]
  Result: Refactoring needed
  
[Refactor Attempt 1]
  ✓ Complete

[Analysis Pass 2]
  Result: Refactoring needed
  
[Refactor Attempt 2]
  ✓ Complete

[Analysis Pass 3]
  Result: Refactoring needed
  
[Refactor Attempt 3]
  ✓ Complete

[Analysis Pass 4]
  Result: Refactoring needed
  ddd_try_count now equals max_ddd_tries (3)
  
[Loop Exit]
  Reason: "max attempts reached"
  Analysis passes: 4
  Refactor attempts: 3

[Tests]
  ✓ Passed (or failed, but tests always run)
```

## Integration Points

### CLAUDE.md Configuration

```yaml
## Container Constants

max_ddd_tries = 3
```

### Child Skill Dependencies

- **af-be-ddd-build** (required)
  - Input: DDD specification from PRD/DSL
  - Output: Generated DDD document

- **af-be-ddd-analysis** (required)
  - Input: Generated DDD document
  - Output: Quality assessment, refactoring decision

- **af-be-ddd-refactor** (required, conditionally invoked)
  - Input: DDD document + analysis recommendations
  - Output: Improved DDD document

- **af-be-ddd-tests** (required)
  - Input: Final DDD document
  - Output: Test suite, test results

## Constraints & Design Principles

1. **Pure Orchestration:** Skill invokes child skills but performs no DDD work itself
2. **Controlled Iteration:** Loop bounded by max_ddd_tries configuration
3. **Quality Gate:** Analysis skill determines when quality is sufficient
4. **Unconditional Testing:** Tests always run to validate final specification
5. **Immediate Failure:** Any child skill failure halts orchestration
6. **Comprehensive Reporting:** Final report includes all phase metrics
7. **Output Preservation:** All child skill artifacts are preserved

## Configuration Best Practices

### Setting max_ddd_tries

```yaml
# Conservative: Small DDD or time-constrained projects
max_ddd_tries = 1

# Balanced: Standard backend applications
max_ddd_tries = 3

# Exhaustive: Complex domains or quality-critical systems
max_ddd_tries = 5
```

The value should balance:
- **Quality expectations:** How refined should the DDD be?
- **Time budget:** How much iteration time is available?
- **Complexity:** How complex is the domain?
