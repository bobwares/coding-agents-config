---
name: analyze
description: >-
  Analyze code, architecture, repos, repositories, apps, applications or documents and produce a markdown report in the docs directory.
  Runs in isolation to minimize token usage.
triggers:
  - "when user asks for analysis of code, architecture, repos, repositories, apps, applications or documents"
  - "analyze"
  - "review"
  - "audit"
  - "examine"
---

# Analyze

Produce a structured markdown analysis document in the `docs/` directory.

## How to Invoke

```
/analyze <subject>
/analyze authentication flow
/analyze database schema
/analyze api error handling
/analyze specs/prd.md
```

## Execution Strategy

**IMPORTANT**: This skill spawns an isolated agent to minimize token consumption.

Do NOT perform the analysis in the main conversation. Instead:

```
Task(
  subagent_type: "Explore",
  model: "sonnet",
  prompt: "<analysis prompt constructed below>"
)
```

## Step 1: Construct Analysis Prompt

Build a focused prompt for the subagent:

```
Analyze: <SUBJECT>

Instructions:
1. Search the codebase for relevant files using Glob and Grep
2. Read key files to understand the implementation
3. Identify patterns, issues, and recommendations
4. Output a structured markdown report

Report Structure:
# Analysis: <SUBJECT>

## Overview
<1-2 paragraph summary>

## Key Findings
<Numbered list of discoveries>

## Files Examined
| File | Purpose |
|------|---------|
<table of files read>

## Issues Identified
<Numbered list with severity: HIGH/MEDIUM/LOW>

## Recommendations
<Actionable next steps>

## Appendix
<Code snippets or diagrams if relevant>

---
Generated: <timestamp>
Analyzed by: Explore agent
```

## Step 2: Spawn Explore Agent

```typescript
Task(
  description: "Analyze <subject>",
  subagent_type: "Explore",
  model: "sonnet",
  prompt: "<constructed prompt from Step 1>"
)
```

Wait for the agent to complete.

## Step 3: Save Report

Write the agent's output to `docs/analysis-<subject-slug>.md`:

```bash
# Generate filename from subject
SLUG=$(echo "<subject>" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd '[:alnum:]-')
FILE="docs/analysis-${SLUG}.md"
```

Use the Write tool to save the report.

## Step 4: Report

After saving:

```
✅ Analysis Complete

Subject:  <subject>
Report:   docs/analysis-<slug>.md
Agent:    Explore (sonnet)

Key findings:
  • <top 3 findings from the report>

Run `cat docs/analysis-<slug>.md` to view full report.
```

## Analysis Types

The skill adapts based on subject keywords:

| Subject Contains | Focus Areas |
|-----------------|-------------|
| "auth", "login", "security" | Security patterns, auth flows, vulnerabilities |
| "database", "schema", "query" | Data models, indexes, query patterns |
| "api", "endpoint", "route" | REST design, error handling, validation |
| "performance", "slow", "optimize" | Bottlenecks, caching, async patterns |
| "test", "coverage" | Test patterns, gaps, coverage analysis |
| "dependency", "package" | Outdated deps, security issues, bloat |
| File path (e.g., `src/...`) | Deep dive on specific file/directory |

## Example Usage

```
User: /analyze authentication flow

Claude: Spawning Explore agent to analyze authentication flow...

<agent runs, searches for auth-related files, reads implementations>

✅ Analysis Complete

Subject:  authentication flow
Report:   docs/analysis-authentication-flow.md
Agent:    Explore (sonnet)

Key findings:
  • No JWT refresh token implementation found
  • Session stored in memory (not Redis) — won't scale
  • Missing rate limiting on login endpoint

Run `cat docs/analysis-authentication-flow.md` to view full report.
```

## Token Efficiency

This skill is designed for minimal token usage:
- Spawns isolated agent (no conversation history)
- Uses Explore agent (optimized for search + read)
- Produces static markdown (no follow-up required)
- Model: sonnet (balanced capability/cost)
