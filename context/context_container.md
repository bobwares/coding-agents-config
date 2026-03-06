# Context: Container — Base Directories and Path Configuration

## Variable Syntax

| Syntax | Binding | Resolved |
|--------|---------|---------|
| `${VAR}` | Early-bound | Session start — stable for entire session |
| `{{VAR}}` | Late-bound | Template render time — dynamic per-turn |

## Core Identity

| Variable | Value |
|----------|-------|
| `CODING_AGENT` | `claude` |
| `SANDBOX_BASE_DIRECTORY` | `.` |

## Agentic Pipeline Directories

| Variable | Path |
|----------|------|
| `AGENTIC_PIPELINE_PROJECT` | `./.claude` |
| `CONTAINER_SKILLS` | `./.claude/skills` |
| `CONTAINER_CONTEXT` | `./.claude/context` |
| `CONTAINER_TEMPLATES` | `./.claude/templates` |
| `CONTAINER_MEMORY` | `./.claude/memory` |
| `CONTAINER_AGENTS` | `./.claude/agents` |
| `CONTAINER_HOOKS` | `./.claude/hooks` |
| `CONTAINER_RULES` | `./.claude/rules` |

## Turn Artifact Directories

| Variable | Path |
|----------|------|
| `TURN_ROOT` | `./ai/agentic-pipeline` |
| `TURNS_DIRECTORY` | `./ai/agentic-pipeline/turns` |
| `TURNS_INDEX` | `./ai/agentic-pipeline/turns_index.csv` |

## Template Paths

| Variable | Path |
|----------|------|
| `TEMPLATE_METADATA_HEADER` | `./.claude/templates/governance/metadata_header.txt` |
| `TEMPLATE_BRANCH_NAMING` | `./.claude/templates/governance/branch_naming.md` |
| `TEMPLATE_COMMIT_MESSAGE` | `./.claude/templates/governance/commit_message.md` |
| `TEMPLATE_SESSION_CONTEXT` | `./.claude/templates/contexts/session_context.md` |
| `TEMPLATE_ADR` | `./.claude/templates/adr/adr_template.md` |
| `TEMPLATE_PULL_REQUEST` | `./.claude/templates/pr/pull_request_template.md` |
| `TEMPLATE_MANIFEST_SCHEMA` | `./.claude/templates/turn/manifest.schema.json` |

## Project Source Directories

| Path | Contents |
|------|----------|
| `./apps/web` | Next.js 15 App Router |
| `./apps/api` | NestJS REST API |
| `./services/enterprise` | Java Spring Boot |
| `./packages/database` | Drizzle ORM schema and migrations |
| `./packages/types` | Shared TypeScript types |
| `./e2e` | Playwright end-to-end tests |

## Agent Directory Isolation

Claude writes design documents to `./claude/` only. Never `./codex/`.
Every design document must declare `Agent: claude` in its front matter.
