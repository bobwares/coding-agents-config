# Architecture Decision Record (ADR)

**Decision ID:** T003-ADR-003  
**Title:** AppFactory Orchestrator Design & Metadata Normalization Strategy  
**Date:** 2026-05-06  
**Status:** DRAFT (pending review)  
**Turn:** 003

## Context

AppFactory is a spec-driven control plane for AI Coding Agents. Current implementation includes 12 active skills covering SDLC phases (project init → PRD → DDD → tests → planning → implementation → validation). An orchestrator skill (af-orchestrator) is partially implemented but needs completion. Metadata frontmatters across skills lack consistency, creating maintenance and discovery issues.

## Decision

1. **Implement af-orchestrator as master orchestration skill** that:
   - Routes requests through all SDLC phases sequentially
   - Manages state via af-memory CRUD operations
   - Invokes phase-specific orchestrators (e.g., af-be-ddd-orchestrator)
   - Handles error recovery and rollback
   - Reports execution summary

2. **Adopt canonical metadata schema** for all 12 skills:
   ```yaml
   ---
   name, description (REQUIRED)
   context, compatibility, triggers, memory-integration (OPTIONAL)
   ---
   ```

3. **Normalize 6 non-compliant skills** to canonical schema

## Alternatives Considered

### Alt A: Distributed orchestration (no master skill)
- Pro: Less centralized failure point
- Con: State management more complex, user must wire skills manually
- **Rejected:** AppFactory value is end-to-end automation

### Alt B: Metadata as separate file (vs. frontmatter)
- Pro: Separates metadata from narrative docs
- Con: Adds file burden, increases discovery friction
- **Rejected:** Frontmatter (SKILL.md header) is standard in Claude ecosystem

### Alt C: Strict enforcement vs. gradual migration
- Enforce all fields: Pro clear contract, Con hard break
- Gradual: Pro backwards compatible, Con technical debt accumulates
- **Decision:** Normalize all 12 skills in one pass (minimal codebase; easier to audit)

## Rationale

- **Single source of truth:** af-orchestrator is the entry point; users and downstream agents always start here
- **State consistency:** af-memory becomes central ledger for phase tracking, artifact paths, errors
- **Discoverability:** Canonical metadata enables CLI help, LLM prompting, skill catalogs
- **Maintainability:** Consistent schema = fewer bugs in SKILL.md parsing

## Implications

- **Tasks created:** 
  - Implement af-orchestrator (SKILL.md + prompts)
  - Normalize 6 non-compliant skills
  - Create metadata-schema.md reference
- **Risk:** Metadata changes could break downstream CLI parsing (mitigated: test parsing before production)
- **Extensibility:** New skills must follow canonical schema from day one

## Follow-ups

- Phase 2: Create af-be-patterns, af-tech-stack-catalog skills to make steps 5–6 explicit
- Phase 3: End-to-end integration testing (project-init → validation in single orchestrator call)
