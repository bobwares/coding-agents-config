# Agents Reference

This document describes all specialist agents in the `.claude/agents/` directory.

## Agent Table

| Name | Purpose | Triggers | Hooks |
|------|---------|----------|-------|
| `orchestrator` | Master coordinator for full-stack app development. Delegates to specialist agents. Follows a strict 5-phase workflow. | `/execute`, `/spec-epic-start`, manual invocation | Spawns all other agents via Task tool |
| `code-architect` | System design specialist. Designs API contracts, database schemas, module boundaries, and writes ADRs. | Spawned by `orchestrator` for design tasks | Outputs to `.claude/memory/decisionLog.md` |
| `nextjs-engineer` | Next.js 15 App Router specialist. Builds pages, layouts, server/client components, server actions, route handlers. | Spawned by `orchestrator` for frontend tasks | Invokes `pattern-nextjs` skill |
| `nestjs-engineer` | NestJS specialist. Builds modules, controllers, services, DTOs, guards, interceptors, pipes. | Spawned by `orchestrator` for API tasks | Invokes `pattern-nestjs` skill |
| `spring-engineer` | Spring WebFlux + R2DBC specialist. Builds reactive REST controllers, R2DBC entities, reactive repositories, WebClient integrations. | Spawned by `orchestrator` for Java/enterprise tasks | Invokes `pattern-spring` skill |
| `drizzle-dba` | Database specialist for Drizzle ORM + PostgreSQL. Handles schema design, complex queries, migrations, indexes, relations, transactions. | Spawned by `orchestrator` for database tasks | Invokes `pattern-drizzle` skill |
| `ai-engineer` | AI integration specialist for Vercel AI SDK. Implements chat UIs, streaming text, structured output, tool calls, embeddings, RAG pipelines. | Spawned by `orchestrator` for AI features | Invokes `pattern-vercel-ai` skill |
| `test-writer` | TDD specialist. Writes unit tests (Vitest/JUnit 5), integration tests (MockMvc/WebTestClient), E2E tests (Playwright/.http files). | Spawned by `orchestrator` or `verify-app` for test writing | Invokes `pattern-testing` skill |
| `code-reviewer` | Senior engineer code reviewer. Provides thorough, opinionated review with structured checklist. | Spawned by `orchestrator` before PR, or manual `/review` | None |
| `security-auditor` | Security specialist. Reviews for OWASP Top 10 vulnerabilities, secrets exposure, auth gaps, injection risks. | Spawned by `orchestrator` or manual `/security-scan` | Runs secrets scanning bash commands |
| `verify-app` | Full quality gate. Runs TypeScript check, lint, tests, build, Java tests. Spawns agents to fix failures. | Spawned by `orchestrator` Phase 4, or manual `/verify-all` | Spawns engineer agents on failure |
| `git-guardian` | Git workflow specialist. Handles conventional commits, push, PR creation. Never commits to main. | Spawned by `orchestrator` Phase 5, or manual `/git-commit-push-pr` | None |
| `doc-generator` | Documentation specialist. Generates JSDoc comments, README updates, OpenAPI/Swagger docs, CHANGELOG entries. | Spawned by `orchestrator` for documentation | None |
| `memory-bank` | Memory bank manager. Updates session state, progress, session history at session start/end. | `/session-start`, `/session-end` skills | Updates `.claude/memory/` files |

## Model Assignment

| Agent | Default Model | Rationale |
|-------|---------------|-----------|
| `orchestrator` | haiku | Standardized model assignment |
| `code-architect` | haiku | Standardized model assignment |
| `code-reviewer` | haiku | Standardized model assignment |
| `security-auditor` | haiku | Standardized model assignment |
| `nextjs-engineer` | haiku | Standardized model assignment |
| `nestjs-engineer` | haiku | Standardized model assignment |
| `spring-engineer` | haiku | Standardized model assignment |
| `drizzle-dba` | haiku | Standardized model assignment |
| `ai-engineer` | haiku | Standardized model assignment |
| `test-writer` | haiku | Standardized model assignment |
| `verify-app` | haiku | Standardized model assignment |
| `git-guardian` | haiku | Standardized model assignment |
| `doc-generator` | haiku | Standardized model assignment |
| `memory-bank` | haiku | Standardized model assignment |

## File Scope Ownership

Each agent owns specific directories to avoid conflicts during parallel execution:

| Agent | Owned Directories |
|-------|-------------------|
| `drizzle-dba` | `packages/database/schema/`, `packages/database/migrations/` |
| `nestjs-engineer` | `apps/api/src/modules/<feature>/` |
| `spring-engineer` | `services/enterprise/src/main/java/` |
| `nextjs-engineer` | `apps/web/app/<route>/`, `apps/web/components/` |
| `test-writer` | `**/*.test.ts`, `**/*.spec.ts`, `e2e/` |
| `doc-generator` | `**/*.md`, JSDoc in any file |
