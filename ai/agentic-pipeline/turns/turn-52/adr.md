# ADR - Turn 52: DSL Path Input Contract

- **Date**: 2026-03-19T22:11:14Z
- **Agent**: AI Coding Agent (Claude Opus 4.5)
- **Status**: Accepted

---

## Context

The DSL-driven skill system previously assumed DSL files were located in a fixed `app-dsl/` directory. This limited flexibility and prevented skills from being used with DSL specifications in arbitrary locations.

## Decision

Update the skill pipeline so that:

1. **`app-from-dsl`** accepts `dsl_path` as an explicit required input
2. **`dsl-model-interpreter`** reads from the provided path instead of a hardcoded location
3. **Downstream skills** receive parsed content from the interpreter rather than reading files directly

### Input Contract

The orchestrator validates and resolves the path before passing to downstream skills:
- Directory input → discovers all DSL files
- Single file input → uses that file as source
- Absolute paths used as-is; relative paths resolved from CWD

### Data Flow

```
User → app-from-dsl(dsl_path) → dsl-model-interpreter(dsl_path)
                                      ↓
                            parsed content + pathMetadata
                                      ↓
        prisma-persistence, nestjs-crud-resource, field-mapper-generator,
        react-form-page, http-test-artifacts
```

## Consequences

**Positive:**
- Skills can operate on DSL files in any location
- Path validation happens once at orchestrator level
- Downstream skills receive pre-parsed content (no duplicate file reads)
- Clear contract between skills

**Negative:**
- Breaking change for any direct skill invocation (must now provide dsl_path)
- Slightly more complex orchestrator logic

## Alternatives Considered

1. **Environment variable**: Rejected - not explicit enough, harder to debug
2. **Default path with override**: Rejected - implicit defaults cause confusion
3. **Each skill reads independently**: Rejected - duplicates path validation logic
