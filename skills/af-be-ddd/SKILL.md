---
name: af-be-ddd
description: Orchestrate backend Domain-Driven Design workflow through build, analyze, refactor loop, and test phases
context: project
memory-integration:
   reads_from:
      - project.name
      - artifacts.prd.path
      - artifacts.ddd.path
      - artifacts.ddd.status
   writes_to:
      - artifacts.ddd.status
      - artifacts.ddd.updated_at
      - progress.current_phase
   requires:
      - artifacts.prd.status: completed
---

# af-be-ddd

Orchestrate backend Domain-Driven Design (DDD) workflow through controlled analysis and refactoring loops.

## Purpose

`af-be-ddd` coordinates the complete backend DDD pipeline:

1. **Build** — Generate initial DDD specification via `af-be-ddd-build`
2. **Analyze** — Validate DDD quality via `af-be-ddd-analysis`
3. **Refactor Loop** — Iteratively improve via `af-be-ddd-refactor` (bounded by `max_ddd_tries`)
4. **Test** — Run test generation via `af-be-ddd-tests`
5. **Report** — Summarize build results, loop iterations, and test outcomes

## Usage

```
/af-be-ddd
```

## Workflow

### Phase 1: Read Configuration
- Extract `max_ddd_tries` (positive integer, required)
- Hard stop if missing or invalid

### Phase 2: Initial Build
- Invoke `af-be-ddd-build`
- Hard stop if build fails

### Phase 3: Analyze & Refactor Loop
- Initialize `ddd_try_count = 0`
- **While** `ddd_try_count < max_ddd_tries`:
  1. Invoke `af-be-ddd-analysis`
  2. If no refactoring needed → exit loop
  3. If refactoring needed:
     - Increment `ddd_try_count`
     - If `ddd_try_count == max_ddd_tries` → exit loop (report max reached)
     - Else invoke `af-be-ddd-refactor`
     - Continue loop

### Phase 4: Test Generation
- Invoke `af-be-ddd-tests` (runs regardless of loop outcome)


### Phase 5: Report Results
write results to current turn directory.  doc: ddd-build-summary.md:
- ✓ Backend DDD built
- Analysis passes: N
- Refactor attempts: N
- Loop exit reason: "no refactoring required" OR "max attempts reached"
- Tests: {created y/n}

## Hard Stops

Skill terminates immediately and reports error if:


- `max_ddd_tries` missing
- `max_ddd_tries` not a positive integer
- Any required child skill unavailable
- `af-be-ddd-build` fails
- `af-be-ddd-analysis` fails
- `af-be-ddd-refactor` fails (when refactoring required)
- `af-be-ddd-tests` fails

## Constraints

1. **No Direct DDD Work** — Only orchestrate; do not generate, analyze, refactor, or test content
2. **Child Skill Autonomy** — Preserve all outputs from invoked skills
3. **Loop Termination** — Guaranteed exit via iteration limit or analysis decision
4. **Failure Fast** — Hard stops on any child skill failure or config error
