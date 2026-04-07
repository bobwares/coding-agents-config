# ADR — Turn 43

## Title

Hook-to-Skill Architecture for Session and Turn Initialization

## Status

Accepted

## Context

The original architecture had bash hooks doing heavy lifting:
- `session-start.sh` checked for context files and output status
- `turn-init.sh` created turn directories and wrote artifacts

Problem: Hooks can output text but cannot load files into Claude's context. The context file checks were decorative — files weren't actually loaded.

## Decision

Refactor to a two-layer architecture:

1. **Hooks** — minimal bash scripts that output directives
2. **Skills** — Claude-executed procedures that do the actual work

Hooks trigger skill invocation via `<system-reminder>` directives. Skills:
- Read files into Claude's context (something hooks can't do)
- Execute multi-step procedures with Claude's full capabilities
- Make intelligent decisions (e.g., skip turn creation for pure questions)

## Consequences

**Positive:**
- Context files are actually loaded into conversation
- Logic is in SKILL.md (easier to maintain, version, review)
- Skills have access to Claude's reasoning for edge cases

**Negative:**
- Requires Claude to follow directives (soft enforcement)
- Slightly more latency (skill invocation vs. immediate hook output)

**Neutral:**
- Hooks remain as thin directive layers
- Turn creation now depends on Claude executing the skill
