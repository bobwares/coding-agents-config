# ADR: Fix Model Metadata Hardcoding in AppFactory Skills

## Status
Accepted

## Context
AppFactory skills were embedding "claude-opus-4-5-20251101" in generated document metadata, regardless of actual running model. Root cause: hardcoded model strings in agent YAML and shell script headers.

## Decision
1. Changed af-be-ddd-orchestrator agent model from `opus` to `haiku`
2. Updated init-appfactory-project.sh author header to reflect Haiku model
3. Added YAML frontmatter to af-be-ddd/SKILL.md for consistency

## Consequences
- Generated documents now correctly report Haiku model in metadata
- AF skills will no longer mislead about their execution engine
- Frontmatter addition improves skill discoverability and metadata tracking
