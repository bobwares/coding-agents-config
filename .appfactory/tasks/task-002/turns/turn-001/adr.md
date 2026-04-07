# ADR — Task 002 Turn 001: Convert af-project-init Skill to Subagent

- **Date**: 2026-04-04T00:00:00Z
- **Agent**: AI Coding Agent (claude-opus-4-5-20251101)
- **Status**: Accepted

## Decision

Convert the `af-project-init` skill (`skills/af-project-init/SKILL.md`) into a Claude subagent definition (`~/.claude/agents/af-project-init.md`).

## Context

The `af-project-init` skill is currently a prompt-based skill invoked by the orchestrator. The user wants it promoted to a subagent so it runs as an autonomous agent with its own tool access, turn budget, and isolated execution context.

## Alternatives Considered

| Option | Trade-off |
|--------|-----------|
| Keep as skill only | Simple but no isolated execution, no tool access scoping |
| Subagent only | Clean isolation; skill can remain as trigger/description |
| Both skill + subagent | Skill becomes the description/trigger; subagent does execution |

## Chosen Approach

Create `~/.claude/agents/af-project-init.md` as the authoritative subagent definition. The existing skill (`skills/af-project-init/SKILL.md`) is preserved as a human-readable description and trigger reference. The subagent definition contains the full system prompt with all procedure steps, constants, constraints, and output requirements translated from the skill.

## Tool Set

Granted: `Read`, `Glob`, `Grep`, `Write`, `Edit`, `Bash`
Denied: `WebSearch`, `WebFetch` — project init is a local+GitHub operation, no web access needed.

## Model

`sonnet` — sufficient for deterministic file operations and bash execution within a well-specified procedure.
