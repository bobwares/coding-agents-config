# ADR — Task 002 Turn 004: Migrate ai/ Directory to .appfactory/

- **Date**: 2026-04-07T00:15:22Z
- **Agent**: AI Coding Agent (claude-opus-4-5-20251101)
- **Status**: Accepted

## Context

The codebase used `ai/` as the root directory for:
1. Task/turn tracking (`ai/agentic-pipeline/tasks/`)
2. Legacy turn tracking (`ai/agentic-pipeline/turns/`)
3. Prompt templates (`ai/prompts/`)
4. Project changelog (`ai/changelog.md`)

Additionally, AppFactory skills referenced `ai/specs/` and `ai/prompts/` for generated projects.

The new convention consolidates all agentic pipeline artifacts under `.appfactory/`.

## Decision

Migrate from `ai/` to `.appfactory/` with this structure:

```
.appfactory/
  tasks/           # Task branches with turn subdirectories
  specs/           # Specification artifacts
  prompts/         # Prompt templates
  memory/          # Project memory
  changelog.md     # Project changelog
  tasks_index.csv  # Task registry
```

## Rationale

1. **Single hidden directory** - Keeps project root clean while preserving all tracking
2. **Unified convention** - One directory for all AppFactory/agentic pipeline concerns
3. **Consistent with provenance** - `af-project-init` already creates `.appfactory/provenance.json`
4. **Clear ownership** - All AI-generated tracking in one place

## Consequences

### Positive
- Cleaner project root
- Consistent convention across all AppFactory projects
- Single location for all tracking artifacts

### Negative
- Hidden directory may be overlooked by users
- Requires updating 22+ files across skills, scripts, agents, and documentation
- Historical turn data archived to `archive/legacy-turns/`

## Implementation Notes

- 55+ legacy turns archived (not migrated)
- Active tasks (task-001, task-002) fully migrated
- All skill paths updated atomically
- Global CLAUDE.md and memory files updated
