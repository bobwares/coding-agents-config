# af-be-ddd Skill Integration Guide

## Quick Start

### Invoke the Skill

```bash
/af-be-ddd
```

The skill will:
1. Read `CLAUDE.md` and extract `max_ddd_tries`
2. Build initial DDD via `af-be-ddd-build`
3. Run analysis/refactor loop (max `max_ddd_tries` attempts)
4. Generate tests via `af-be-ddd-tests`
5. Report comprehensive results

### Expected Output

```
════════════════════════════════════════════════════════════════════════════════
                          af-be-ddd ORCHESTRATION REPORT
════════════════════════════════════════════════════════════════════════════════

Build Status:
  ✓ Backend DDD built successfully

Analysis & Refactoring Loop:
  - Analysis passes: 2
  - Refactor attempts: 1
  - Loop exit reason: no refactoring required
  - Max attempts allowed: 3

Test Results:
  ✓ Test suite passed

════════════════════════════════════════════════════════════════════════════════
```

## Prerequisites

### Configuration Required

Edit `CLAUDE.md` and add:

```yaml
## Container Constants

max_ddd_tries = 3
```

**Rule:** `max_ddd_tries` must be a positive integer.

### Child Skills Required

Ensure the following skills are available and functional:

- `af-be-ddd-build` — Generate DDD specification
- `af-be-ddd-analysis` — Validate and assess quality
- `af-be-ddd-refactor` — Improve specification
- `af-be-ddd-tests` — Generate test suite

Run the skill with missing child skills will trigger a hard stop.

## Workflow Phases

### Phase 1: Configuration Validation

- Reads `CLAUDE.md`
- Extracts and validates `max_ddd_tries`
- **Hard stop if:** missing, non-integer, or non-positive

### Phase 2: Initial Build

- Invokes `af-be-ddd-build`
- Generates backend DDD specification
- **Hard stop if:** skill fails

### Phase 3: Analyze & Refactor Loop

- **Runs analysis:** `af-be-ddd-analysis`
- **Determines:** whether refactoring needed
- **If no refactoring:** exits loop immediately
- **If refactoring needed:**
  - Invokes `af-be-ddd-refactor`
  - Returns to analysis
  - Repeats until quality gate passed or max attempts reached
- **Hard stop if:** either skill fails

### Phase 4: Test Generation

- Invokes `af-be-ddd-tests`
- Generates test suite and validates
- **Runs regardless of loop outcome** (even if max attempts reached)
- **Hard stop if:** skill fails

### Phase 5: Results Reporting

- Summarizes all metrics
- Reports build status, loop iterations, test results
- Displays comprehensive results

## Loop Behavior

### Termination Conditions

The analyze/refactor loop terminates when:

1. **Quality Gate Passed:**
   - `af-be-ddd-analysis` determines no refactoring needed
   - Loop exits, tests run
   - Result: "no refactoring required"

2. **Max Attempts Reached:**
   - Loop has completed `max_ddd_tries` refactor attempts
   - No more refactoring performed
   - Tests still run to validate final specification
   - Result: "max attempts reached"

### Loop Metrics

The skill tracks:

- **Analysis passes:** Total invocations of `af-be-ddd-analysis`
- **Refactor attempts:** Total invocations of `af-be-ddd-refactor`
- **Loop exit reason:** Why the loop terminated
- **Max attempts allowed:** Configured `max_ddd_tries`

### Example Scenarios

**Scenario A: Quality Gate Passed Early**
```
analysis_passes: 1
refactor_attempts: 0
loop_exit_reason: "no refactoring required"
```

**Scenario B: Multiple Refinements**
```
analysis_passes: 3
refactor_attempts: 2
loop_exit_reason: "no refactoring required"
```

**Scenario C: Max Attempts Hit**
```
analysis_passes: 4
refactor_attempts: 3 (assuming max_ddd_tries = 3)
loop_exit_reason: "max attempts reached"
```

## Hard Stop Conditions

The skill will immediately terminate with an error if:

| Condition | Error Message |
|-----------|---------------|
| CLAUDE.md missing | `CLAUDE.md not found` |
| max_ddd_tries missing | `max_ddd_tries not found in CLAUDE.md` |
| max_ddd_tries invalid | `max_ddd_tries must be a positive integer` |
| af-be-ddd-build fails | `af-be-ddd-build skill failed` |
| af-be-ddd-analysis fails | `af-be-ddd-analysis skill failed` |
| af-be-ddd-refactor fails | `af-be-ddd-refactor skill failed on attempt N` |
| af-be-ddd-tests fails | `af-be-ddd-tests skill failed` |

**Recovery:** Hard stops are fatal. No recovery attempts. Investigate the failed child skill and rerun `/af-be-ddd` after fixing the underlying issue.

## Skill Dependencies

### Invocation Graph

```
af-be-ddd
  ├── Reads: CLAUDE.md (max_ddd_tries)
  ├── Invokes: af-be-ddd-build (1×)
  ├── Invokes: af-be-ddd-analysis (1+ times in loop)
  ├── Invokes: af-be-ddd-refactor (0 to max_ddd_tries times)
  └── Invokes: af-be-ddd-tests (1×)
```

### Child Skill Responsibilities

**af-be-ddd-build**
- Input: PRD, DSL specification
- Output: DDD document with domain model, entities, aggregates, services
- Responsibility: Initial DDD generation

**af-be-ddd-analysis**
- Input: DDD document
- Output: Quality assessment, refactoring recommendations, binary decision (refactor yes/no)
- Responsibility: Quality evaluation and gate decision

**af-be-ddd-refactor**
- Input: DDD document + analysis recommendations
- Output: Improved DDD document
- Responsibility: Specification refinement

**af-be-ddd-tests**
- Input: Final DDD document
- Output: Test suite (JUnit 5), test results
- Responsibility: Test generation and validation

## Configuration Examples

### Conservative Setup (Few Iterations)

```yaml
## Container Constants

max_ddd_tries = 1
```

Use when:
- Small, simple domains
- Time-constrained projects
- Initial prototyping

Result: Maximum 1 analysis pass, 0 refactor attempts

### Balanced Setup (Standard)

```yaml
## Container Constants

max_ddd_tries = 3
```

Use when:
- Standard backend applications
- Medium complexity
- Good balance of quality/time

Result: Maximum 4 analysis passes (if max hits), 3 refactor attempts

### Exhaustive Setup (High Quality)

```yaml
## Container Constants

max_ddd_tries = 5
```

Use when:
- Complex domains
- Quality-critical systems
- Sufficient time/resources available

Result: Maximum 6 analysis passes (if max hits), 5 refactor attempts

## Troubleshooting

### "CLAUDE.md not found"

**Fix:** Ensure CLAUDE.md exists in project root.

```bash
ls -la CLAUDE.md
```

### "max_ddd_tries not found in CLAUDE.md"

**Fix:** Add `max_ddd_tries` to CLAUDE.md:

```yaml
## Container Constants

max_ddd_tries = 3
```

### "max_ddd_tries must be a positive integer"

**Fix:** Verify `max_ddd_tries` in CLAUDE.md:

```yaml
# Wrong:
max_ddd_tries = 0
max_ddd_tries = -1
max_ddd_tries = abc

# Correct:
max_ddd_tries = 1
max_ddd_tries = 3
max_ddd_tries = 5
```

### Child Skill Fails

**af-be-ddd-build failed:**
- Check DDD generation inputs (PRD, DSL)
- Verify build skill configuration
- Review build skill error logs

**af-be-ddd-analysis failed:**
- Check DDD document integrity
- Verify analysis skill has required references
- Review analysis skill error logs

**af-be-ddd-refactor failed:**
- Check DDD and analysis output
- Verify refactor skill configuration
- Review refactor skill error logs

**af-be-ddd-tests failed:**
- Check final DDD document integrity
- Verify test skill configuration
- Review test skill error logs

## Integration with Other Skills

### Sequential Workflow

Typical usage pattern:

```
/af-be-prd          # Generate PRD
/af-be-build-dsl    # Generate DSL
/af-be-ddd          # Generate and refine DDD (THIS SKILL)
/af-be-build-plan   # Generate implementation plan
/af-be-build-impl   # Generate implementation
```

### Parallel Workflows

`af-be-ddd` does not conflict with other backend skills. It can be invoked:
- After DSL generation (typical)
- As needed for DDD refinement
- Multiple times to iterate further

## Output Artifacts

The skill preserves all outputs from child skills:

- **DDD Document** (from af-be-ddd-build, af-be-ddd-refactor)
- **Analysis Results** (from af-be-ddd-analysis)
- **Test Suite** (from af-be-ddd-tests)

All artifacts remain accessible for downstream use.

## Performance Considerations

### Loop Iteration Time

Each iteration includes:
- 1× af-be-ddd-analysis invocation
- 1× af-be-ddd-refactor invocation (if needed)

Time scales with:
- Complexity of DDD document
- Analysis model capability
- Refactoring depth

### Max Attempts Impact

- `max_ddd_tries = 1`: Fastest, potentially lowest quality
- `max_ddd_tries = 3`: Balanced
- `max_ddd_tries = 5+`: Slowest, highest quality potential

## Best Practices

1. **Start Conservative:** Use `max_ddd_tries = 1` initially
2. **Observe Quality:** Review analysis and refactoring results
3. **Increase Gradually:** Raise `max_ddd_tries` if needed
4. **Monitor Metrics:** Track analysis_passes vs refactor_attempts
5. **Preserve Outputs:** Keep DDD documents for review and versioning
6. **Test First:** Verify child skills work before running orchestration

## See Also

- [orchestration-workflow.md](orchestration-workflow.md) — Detailed workflow specification
- `af-be-ddd-build` — Build skill documentation
- `af-be-ddd-analysis` — Analysis skill documentation
- `af-be-ddd-refactor` — Refactor skill documentation
- `af-be-ddd-tests` — Test skill documentation
