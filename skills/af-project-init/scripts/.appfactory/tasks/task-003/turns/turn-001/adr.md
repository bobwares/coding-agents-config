# Architecture Decision Record — af-be-ddd Orchestration Skill

**Date:** 2026-05-04  
**Status:** Accepted  
**Turn:** task-003 / turn-001

## Context

Create an orchestration skill `af-be-ddd` that coordinates the backend Domain-Driven Design (DDD) pipeline. The skill must:

1. Read configuration from CLAUDE.md (`max_ddd_tries`)
2. Invoke child skills in controlled sequence:
   - `af-be-ddd-build` (initial generation)
   - `af-be-ddd-analysis` (quality assessment)
   - `af-be-ddd-refactor` (iterative improvement)
   - `af-be-ddd-tests` (test generation and validation)
3. Implement analyze/refactor loop bounded by iteration limit
4. Report comprehensive results

## Decision

### D1: Pure Orchestration Architecture

**Decision:** `af-be-ddd` is a pure orchestration skill that invokes child skills without performing DDD work directly.

**Rationale:**
- Separation of concerns: Each skill has single responsibility
- Composability: Child skills can be reused independently
- Debuggability: Failures isolated to specific skill
- Maintainability: Logic changes isolated to relevant skill

**Consequences:**
- No direct DDD generation, analysis, refactoring, or testing code
- All outputs preserved from child skills
- Orchestration logic centralized and auditable

### D2: Configuration-Driven Loop Termination

**Decision:** Loop iteration count bounded by `max_ddd_tries` from CLAUDE.md.

**Rationale:**
- Explicit configuration prevents runaway loops
- Single source of truth for iteration budget
- Flexibility: Different projects can set different limits
- Predictability: Maximum execution time bounded

**Consequences:**
- CLAUDE.md must include `max_ddd_tries` (hard requirement)
- Loop may exit with "max attempts reached" before quality gate satisfied
- Tests always run to validate final specification

### D3: Refactoring Decision Logic

**Decision:** `af-be-ddd-analysis` determines whether refactoring is needed. Orchestrator checks analysis output for binary decision.

**Rationale:**
- Analysis skill has domain knowledge to assess quality
- Clear, binary decision point prevents ambiguity
- Decouples quality judgment from orchestration
- Allows analysis skill to evolve independently

**Consequences:**
- Analysis skill must produce unambiguous refactoring decision
- Orchestrator depends on analysis output format/semantics
- Analysis failures cause orchestrator hard stop

### D4: Unconditional Test Execution

**Decision:** Tests always run, regardless of loop exit reason.

**Rationale:**
- Validation critical even if max attempts reached
- Tests catch issues analysis may have missed
- Provides confidence in final specification
- Ensures quality assurance step always occurs

**Consequences:**
- Test suite runs even if specification may be incomplete
- Test failures cause hard stop (cannot proceed with incomplete spec)
- Additional execution time, but necessary

### D5: Hard Stop on Failure

**Decision:** Any child skill failure causes immediate termination with error.

**Rationale:**
- No recovery possible for skill failures
- Early detection prevents cascading errors
- Clear error reporting aids debugging
- Simplifies error handling (fail fast)

**Consequences:**
- No fallback behavior
- No retry logic
- Manual intervention required to fix and rerun

### D6: Multi-Implementation Support

**Decision:** Provide both shell script and Python implementations of orchestration logic.

**Rationale:**
- Shell (orchestrate-ddd.sh): Simple, direct, readable
- Python (af-be-ddd-orchestrate.py): Structured, maintainable, extensible
- Different environments may prefer different approach
- Future integration with Claude Code API benefits from Python

**Consequences:**
- Maintenance burden for dual implementations
- Consistency important between versions
- Python version more suitable for SDK-based execution

### D7: Comprehensive Documentation

**Decision:** Provide detailed reference documentation for skill integration and workflow.

**Rationale:**
- Orchestration logic non-obvious without documentation
- Integration guide helps users invoke skill correctly
- Workflow guide explains loop behavior and metrics
- Examples and troubleshooting reduce support burden

**Consequences:**
- Documentation maintenance required
- Documentation must be kept in sync with implementation
- Users should reference docs before running skill

## Implementation

### File Structure

```
skills/af-be-ddd/
  SKILL.md                           # Skill definition
  agents/
    orchestrator.yaml               # Agent definition
  scripts/
    orchestrate-ddd.sh              # Shell implementation
    af-be-ddd-orchestrate.py        # Python implementation
  references/
    orchestration-workflow.md       # Detailed workflow spec
    skill-integration.md            # Integration guide
```

### Key Components

**SKILL.md:**
- Purpose and usage
- Workflow phases
- Hard stop conditions
- Configuration requirements

**orchestrator.yaml:**
- Agent definition
- Tool access
- Instruction set
- Responsibility description

**orchestrate-ddd.sh:**
- Executable shell script
- CLAUDE.md parsing
- Skill invocation
- Result reporting

**af-be-ddd-orchestrate.py:**
- Python implementation
- Structured error handling
- Configuration validation
- Metric tracking

**References:**
- orchestration-workflow.md: Complete workflow specification with examples
- skill-integration.md: User guide, troubleshooting, best practices

## Validation

### Configuration Validation

```python
if not claude_md.exists():
    raise FileNotFoundError("CLAUDE.md not found")
if max_ddd_tries is None:
    raise ValueError("max_ddd_tries not found")
if not isinstance(max_ddd_tries, int) or max_ddd_tries <= 0:
    raise ValueError("max_ddd_tries must be positive integer")
```

### Loop Termination Logic

```
while ddd_try_count < max_ddd_tries:
    analysis_result = invoke_skill(af-be-ddd-analysis)
    if analysis_result.refactoring_required == False:
        exit_loop("no refactoring required")
    
    ddd_try_count += 1
    if ddd_try_count >= max_ddd_tries:
        exit_loop("max attempts reached")
    
    invoke_skill(af-be-ddd-refactor)
```

## Testing Strategy

1. **Unit Tests:** Each skill component tested independently
2. **Integration Tests:** Skills work together in loop
3. **Configuration Tests:** Various max_ddd_tries values
4. **Error Cases:** Missing config, skill failures
5. **Example Scenarios:** Different loop exit reasons

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Analysis output format ambiguity | Document expected output format, validate format |
| Skill unavailability | Check skill existence before invocation, clear error message |
| Configuration missing | Validate CLAUDE.md early, hard stop if invalid |
| Infinite loop | Bounded by max_ddd_tries, unconditional loop exit |
| Test suite takes long | Time tests separately, document expected duration |

## Future Enhancements

1. **Parallel Analysis/Refactor:** Invoke analysis while refactoring previous results
2. **Intermediate Checkpoints:** Save DDD state between iterations
3. **Metrics Collection:** Track quality improvements over iterations
4. **Configuration Profiles:** Predefined max_ddd_tries templates (conservative/balanced/exhaustive)
5. **Integration with Managed Agents:** Use Claude API for orchestration
6. **Retry Logic:** Optional retry on transient failures

## Approval

- **Architect:** AI Coding Agent
- **Reviewed:** CLAUDE.md configuration requirements verified
- **Status:** Ready for implementation and integration
