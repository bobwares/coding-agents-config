# Skills Reference

Detailed documentation for all 42 skills. Each skill is a `SKILL.md` file in its own directory under `skills/`. Skills are invoked as slash commands (e.g., `/verify-all`) in Claude Code or Codex.

---

## Table of Contents

- [Git Skills](#git-skills)
- [Session Skills](#session-skills)
- [Quality Skills](#quality-skills)
- [Debug Skills](#debug-skills)
- [Mode](#mode)
- [Governance Skills](#governance-skills)
- [Spec Skills](#spec-skills)
- [Project Skills](#project-skills)
- [Pattern Skills](#pattern-skills)
- [Analysis & Utility Skills](#analysis--utility-skills)
- [System Skills](#system-skills)

---

## Git Skills

### git-status

**Command**: `/git-status`
**Description**: Load project context into the current conversation for maximum effectiveness.

Captures the current git branch, recent commits, active epic (if any), and stack summary from `package.json` and `CLAUDE.md`. Presents a structured context summary so the agent is oriented before starting work. Run at the start of a focused work session.

**Output**: A `CONTEXT LOADED` report with project name, stack, branch, active work, and recent commits.

---

### git-undo

**Command**: `/git-undo`
**Description**: Undo the last Claude Code commit (soft reset — keeps files staged).

Checks if the most recent commit was made by Claude (looks for "Co-Authored-By: Claude" in the commit message). If so, performs `git reset --soft HEAD^`. If the last commit was not by Claude, refuses to undo automatically to protect user work.

**Safety**: Only undoes Claude-authored commits. Files remain staged after undo.

---

### git-checkpoint

**Command**: `/git-checkpoint <name>`
**Description**: Create a named save point you can return to.

Creates both a git stash (if uncommitted changes exist) and a git tag named `checkpoint-<name>`. Lists existing checkpoints after creation.

**Restore with**: `/git-rollback <name>`

---

### git-rollback

**Command**: `/git-rollback <target>`
**Description**: Restore from a named checkpoint or undo N commits.

Supports multiple rollback strategies:
- **Checkpoint name**: Pops the matching stash or checks out the matching tag
- **Number N**: Performs `git reset --soft HEAD~N` (keeps files staged)
- **Git hash**: Checks out the specific commit

**Safety**: Always confirms with the user before executing, describing the action and its consequences.

---

### git-quick-commit

**Command**: `/git-quick-commit [message]`
**Description**: Fast local commit without full verification. Use for work-in-progress saves.

Stages all modified tracked files (excluding `.env`) and creates a commit. If a message is provided, uses it (with `wip:` prefix if needed). Otherwise, generates a conventional commit message from the diff summary.

**Safety**: Refuses to commit if on `main` or `master`. Skips verification — run `/verify-all` before creating a PR.

---

### git-commit-push-pr

**Command**: `/git-commit-push-pr`
**Description**: Full git workflow: run verification, commit with a conventional message, push, and create a PR.

Complete workflow:
1. **Pre-flight** — Checks branch (refuses `main`/`master`) and status
2. **Verify** — Runs `/verify-all`; stops if verification fails
3. **Stage & Commit** — Generates conventional commit message from diff, adds Co-Author tag
4. **Push** — Pushes to remote with `-u` flag
5. **Create PR** — Uses `gh pr create` with What Changed, How to Test, and Checklist sections

**Output**: Reports the PR URL when created.

---

### github-issue

**Command**: `/github-issue <issue-number>`
**Description**: End-to-end GitHub issue resolution: read the issue, create a branch, fix, verify, and create a PR.

Workflow:
1. Reads the GitHub issue with `gh issue view`
2. Creates a branch: `fix/issue-<number>` from latest `main`
3. Spawns the `orchestrator` agent with issue context
4. Orchestrator handles diagnosis, fix, verification, and PR creation
5. PR body includes "Closes #<number>"

---

## Session Skills

### session-start

**Command**: `/session-start`
**Description**: Initialize turn lifecycle and orient to current project state.

Run at the start of every Claude Code session. Loads git state, resolves the next turn ID from `turns_index.csv`, and displays a session orientation banner with branch, uncommitted files, next turn ID, and governance status.

**Output**: An `AGENTIC-PIPELINE SESSION START` banner. Does not accept tasks until confirmation is displayed.

---

### session-end

**Command**: `/session-end`
**Description**: Complete turn lifecycle post-execution artifacts and save session state.

Run at the end of every session. Performs:
1. Captures git state
2. Completes turn artifacts (if a turn was executed):
   - Updates `execution_trace.json`
   - Writes `pull_request.md` from template
   - Writes `adr.md` (full or minimal)
   - Writes `manifest.json` with SHA-256 hashes
   - Updates `turns_index.csv`
   - Tags the commit with `turn/<ID>`
3. Handles uncommitted work (prompts to commit)
4. Displays a `SESSION END` confirmation banner

---

### session-context-size

**Command**: `/session-context-size`
**Description**: Capture current context window usage and save a report to `./logs` directory.

Generates a numbered context report (`context-N.md`) containing loaded rules files, skills count, CLAUDE.md size, MCP tools, and custom agents. Useful for monitoring token consumption during sessions.

---

## Quality Skills

### verify-all

**Command**: `/verify-all`
**Description**: Run the full quality gate. Required before every PR.

Runs in order:
1. `pnpm typecheck` — TypeScript type checking
2. `pnpm lint` — ESLint
3. `pnpm test --run` — TypeScript tests
4. `pnpm build` — Production build
5. `mvn clean package` — Java build (if `pom.xml` exists)

Produces a `VERIFICATION REPORT` with pass/fail for each step and an overall verdict. On failure, spawns the appropriate specialist agent to fix the issue, then re-runs verification.

**Failure routing**:
| Failure | Agent |
|---------|-------|
| TS errors in `app/web/` | `nextjs-engineer` |
| TS errors in `app/api/` | `nestjs-engineer` |
| TS errors in `packages/database/` | `drizzle-dba` |
| Java errors | `spring-engineer` |
| Test failures | `test-writer` |
| Build failures | `code-architect` |

---

### test-and-fix

**Command**: `/test-and-fix`
**Description**: Run tests, identify failures, and iteratively fix them until all pass. Max 5 fix iterations.

For each failing test:
1. Reads the failing test to understand expectations
2. Reads the implementation to understand behavior
3. Identifies root cause (TypeScript error, import error, assertion failure, mock issue)
4. Fixes the **implementation** (never the test)
5. Re-runs affected tests

**Fix priority**: TypeScript/import errors first (cascading), then mock/setup errors, then logic errors.

**Rule**: Never deletes or skips tests. Never changes an assertion to match broken behavior.

---

### security-scan

**Command**: `/security-scan [scope]`
**Description**: Run a security audit on changed files or the full codebase.

If no scope provided, scans all files changed since branching from main. Runs automated checks for hardcoded secrets, missing `.env` gitignore, `dangerouslySetInnerHTML`, and `eval()`. Then spawns the `security-auditor` agent with the OWASP Top 10 checklist.

**Output**: Tiered findings report (Critical, High, Medium, Passing).

---

## Debug Skills

### systematic-debugging

**Command**: `/systematic-debugging`
**Description**: Four-phase debugging methodology. Forces root cause analysis before attempting fixes.

### The Four Phases

1. **Observe** — Capture the exact error: full stack trace, request/response, environment, steps to reproduce, recent changes
2. **Hypothesize** — Generate 3-5 ranked hypotheses with supporting evidence. Consider: race conditions, null/undefined, type mismatches, environment differences, recent changes, third-party API changes
3. **Test** — Work through hypotheses top-down with targeted logging and minimal reproductions. Prove or disprove each hypothesis
4. **Fix** — Address root cause, not symptoms. Write a failing test before applying the fix

### Common Bug Patterns

- **"undefined is not an object"**: Optional value without null check, missing `await`, `.find()` returning undefined
- **Database returns nothing**: Wrong WHERE clause, UUID format mismatch, record doesn't exist
- **401/403 unexpectedly**: Missing auth header, wrong guard level, expired token
- **React not re-rendering**: Direct state mutation, unstable key prop, stale query cache

---

### diagnose-issue

**Command**: `/diagnose-issue`
**Description**: Diagnose a problem, generate a structured `issue.md` in the current turn directory, and optionally proceed to resolution.

Workflow:
1. Gathers evidence (error messages, stack traces, reproduction steps, recent changes)
2. Generates 3-5 ranked hypotheses with evidence and likelihood
3. Develops a resolution plan (verification, fix, prevention, test coverage)
4. Writes a comprehensive `issue.md` report
5. Asks user whether to proceed with resolution, review first, modify plan, or defer

If approved, spawns the appropriate specialist agent based on affected file patterns.

---

## Mode

### mode

**Command**: `/mode <architect|code|debug|review|test>`
**Description**: Switch Claude's operating mode to change behavior.

| Mode | Behavior |
|------|----------|
| `architect` | Read-only. Design and document only. No code changes. Produces design docs, ADRs, interfaces, directory trees |
| `code` | Default. Full implementation mode |
| `debug` | Investigation first. Must state root cause hypothesis with evidence before making any fixes |
| `review` | Read-only. Review and comment only. Produces structured review reports |
| `test` | TDD mode. Must write a failing test before any implementation code |

---

## Governance Skills

### governance

**Command**: `/governance`
**Description**: Mandatory coding standards, metadata headers, semantic versioning, git conventions, and compliance enforcement.

Enforces non-negotiable rules on every file written or modified:

**Metadata Headers**: Every source file must begin with a metadata comment containing App, Package, File, Version, Turns, Author, Date, and Description. Supports TypeScript, Java, Python, Shell, and SQL formats. Exempt: `globals.css`, `turbo.json`, `pom.xml`, `package.json`, binaries, pure config files.

**Semantic Versioning**: Each file tracks its own version in the metadata header. New files start at `0.1.0`. Patch for fixes/refactors, minor for new features, major for breaking changes.

**Git Branch Naming**: `<type>/<short-description>[-<task-id>]` (e.g., `feat/task-assignment-service-T42`)

**Commit Messages**: Format `AI Coding Agent Change:` followed by 3-5 imperative bullet points.

**Compliance Checklist**: Metadata headers present, versions incremented, turns updated, branch naming correct, commit format correct, tests written, linting passes, no secrets committed, ADR written.

---

### governance-adr

**Command**: `/governance-adr`
**Description**: Architecture Decision Record creation policy.

**When to write a Full ADR**: Choosing design patterns, selecting libraries, changing API contracts, introducing infrastructure, modifying data models, changing cross-cutting concerns.

**When to write a Minimal ADR**: Renaming variables, bug fixes with no design choices, following established patterns, simple refactoring, formatting changes. Minimal content: one line explaining what was done.

**Full ADR format**: Context, Decision, Rationale (numbered reasons), Alternatives Considered (with pros/cons/rejection reasons), Consequences (positive, negative, mitigations).

**Storage**: One `adr.md` per turn in `./ai/agentic-pipeline/turns/turn-<ID>/adr.md`. Multiple decisions in one turn go in the same file as separate sections.

---

## Spec Skills

### spec-prd-new

**Command**: `/spec-prd-new <feature-name>`
**Description**: Create a new Product Requirements Document through guided discovery.

Asks 6 discovery questions one at a time:
1. What is this feature?
2. Who uses it?
3. What problem does it solve?
4. What does success look like?
5. What's out of scope?
6. Any technical constraints?

Writes the PRD to `.claude/prds/<feature-name>.md` with sections: Problem Statement, Goals, Non-Goals, User Stories (with acceptance criteria), Technical Requirements, Out of Scope, Success Metrics.

**Next step**: `/spec-prd-parse <feature-name>` to break into epics and tasks.

---

### spec-prd-parse

**Command**: `/spec-prd-parse <prd-name>`
**Description**: Parse a PRD into a DDD-aware epic with ordered tasks assigned to specialist agents.

Reads `.claude/domain/model.json` (if available) for domain alignment. Analyzes the PRD to determine which tech layers are needed, then generates a complete epic with tasks organized into 4 phases:

1. **Foundation** — Database schema, shared types
2. **API Layer** — NestJS/Spring modules, API integration tests
3. **Frontend** — Next.js pages, UI components, AI features
4. **Quality** — Unit tests, E2E tests, security scan, documentation

Each task specifies: agent, pattern skills to invoke, files to create, dependencies, and blocking relationships.

**Output**: `.claude/epics/<prd-name>/epic.md`

---

### spec-prd-list

**Command**: `/spec-prd-list`
**Description**: List all PRDs and epics with their current status.

Scans `.claude/prds/` for PRD files and `.claude/epics/` for epic directories. Shows status, creation date, and task completion counts. Suggests the next action based on current state.

---

### spec-parse-ddd

**Command**: `/spec-parse-ddd <ddd-document-path>`
**Description**: Parse a Domain-Driven Design document into a structured domain model.

Reads a natural-language DDD document and extracts:
- **Bounded Contexts** with aggregates, entities, value objects, domain events, and domain services
- **Relationships** between contexts (upstream-downstream, shared kernel, anti-corruption layer)
- **Ubiquitous Language** glossary

Produces two files:
- `.claude/domain/model.json` — Machine-readable domain model for agent consumption
- `.claude/domain/model.md` — Human-readable summary

**Validation**: Ensures every aggregate has one root entity, all foreign keys reference existing entities, no circular aggregate dependencies, and all entities have `id`/`createdAt`/`updatedAt` fields.

---

### spec-planning

**Command**: `/spec-planning`
**Description**: Generate comprehensive implementation plan from PRD, DDD, and tech stack.

Reads all three specification documents and generates 6 planning documents in `specs/plan/`:

| Document | Content |
|----------|---------|
| `00-understanding.md` | Problem statement, domain model summary, tech stack, success criteria |
| `01-patterns.md` | Skill patterns selected based on tech stack |
| `02-tasks.md` | Task breakdown with agents, dependencies, estimates, and dependency graph |
| `03-wireframes.md` | ASCII wireframes for layout, dashboard, list, detail, and form views |
| `04-api-contract.md` | REST API specification with endpoints, request/response shapes, error model |
| `05-checklist.md` | Implementation progress checklist organized by phase |

---

### spec-epic-start

**Command**: `/spec-epic-start <epic-name>`
**Description**: Begin implementing an epic. Creates the branch and spawns the orchestrator.

Workflow:
1. Reads the epic file from `.claude/epics/<name>/epic.md`
2. Checks for uncommitted changes
3. Creates branch `epic/<name>` from latest `main`
4. Initializes the turn lifecycle (turn directory, session context, start time)
5. Updates epic status to `in_progress`
6. Spawns the `orchestrator` agent to execute all tasks in phase order
7. Completes post-execution artifacts (pull_request.md, adr.md, manifest.json, turns_index.csv, git tag)

---

### spec-task-next

**Command**: `/spec-task-next [epic-name]`
**Description**: Get the next uncompleted task in the current epic.

Auto-detects the epic from the current branch (expects `epic/<name>` format) or accepts an explicit argument. Finds the first unchecked task in the epic file and reports the task ID, description, agent, and dependency status.

Shows a progress bar: `Epic Progress: ██████░░░░ 6/10 tasks complete`

---

## Project Skills

### project-init

**Command**: `/project-init`
**Description**: Scaffold a new full-stack monorepo from a tech stack selection.

Creates the complete directory structure under `app/` with workspace configuration:

| Stack Component | Directory | What's Created |
|----------------|-----------|---------------|
| Always | `app/` | `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`, `docker-compose.yml`, `.env.example` |
| Always | `app/packages/types/` | Shared TypeScript types (`UUID`, `ISODate`, `PaginatedResponse`, `ApiError`) |
| Next.js | `app/web/` | Next.js 15 App Router with layout, page, health route, Tailwind (if shadcn), Vitest |
| NestJS | `app/api/` | NestJS with Swagger, global exception filter, Zod validation pipe, health module |
| Spring | `app/services/enterprise/` | Spring Boot with WebFlux, R2DBC, OpenAPI, exception handling, health controller |
| Drizzle | `app/packages/database/` | Drizzle ORM with PostgreSQL config, schema directory, migrations directory |

Post-scaffold runs `pnpm install`, starts Docker, and verifies the workspace builds.

---

### project-execute

**Command**: `/project-execute`
**Description**: One-command full app build. Provide PRD, DDD, and tech stack files — the pipeline does the rest.

The complete automated pipeline:

1. **Preflight validate** — Runs `project-execute-preflight.sh` for inputs, skills, agents, and templates
2. **Parse arguments** — Reads PRD, DDD, and tech stack from `specs/` directory
3. **Initialize turn lifecycle** — Creates turn directory, session context, turn branch
4. **Scaffold project** — Invokes `/project-init`
5. **Parse DDD** — Invokes `/spec-parse-ddd` to produce domain model
6. **Generate plan** — Invokes `/spec-planning` to produce planning documents
7. **Parse PRD into epics** — Invokes `/spec-prd-parse` with domain model
8. **Execute epics** — Creates branches, spawns orchestrator for each epic, runs verification
9. **Complete turn lifecycle** — Writes all post-execution artifacts, tags commit

**Rules**: Never stops to ask questions (all inputs provided upfront), never skips verification, never commits to main, auto-fixes failures using specialist agents.

**Input files**: `specs/spec-prd.md`, `specs/spec-ddd.md`, `specs/spec-tech-stack.md` (optional: `specs/spec-wireframe.md`)

---

### project-create-plan

**Command**: `/project-create-plan`
**Description**: Create a human-readable implementation plan from PRD, DDD, and tech stack inputs. Planning only — no code or config implementation.

Generates versioned planning documents in `specs/plan/version-<N>/`:

| Document | Content |
|----------|---------|
| `00-summary.md` | Project overview, goals, constraints, assumptions |
| `01-architecture-plan.md` | Bounded contexts, module boundaries, data flow |
| `02-implementation-phases.md` | Phased rollout, milestones, dependencies |
| `03-work-breakdown.md` | Task list by phase with owner-role suggestions and estimates |
| `04-risk-register.md` | Technical/product risks, impact, mitigation |
| `05-validation-strategy.md` | Test strategy, quality gates, acceptance criteria |
| `06-delivery-checklist.md` | Implementation readiness checklist |
| `manifest.md` | Version metadata, source inputs, timestamp |

Conditional outputs: `07-wireframes.md` (if UI), `08-selected-patterns.md`, `09-api-contracts.md` (if API).

**Hard constraints**: No source code, no config files, no writes to `.claude/`. All output under `specs/plan/version-<N>/`.

---

### project-plan

**Command**: `/project-plan`
**Description**: Compatibility planner entry point. Generates planning docs and epic files without implementation.

Workflow:
1. Validates PRD/DDD/stack inputs
2. Runs `/spec-planning`
3. Runs `/spec-prd-parse`
4. Reports generated plan + epic paths

**Output**: Planning docs under `specs/plan/` and epic files under `.claude/epics/`.

---

## Pattern Skills

Pattern skills are reference libraries loaded by specialist agents before implementation. They provide code patterns, conventions, and examples for specific frameworks.

### pattern-api-design

**Command**: `/pattern-api-design`
**Description**: REST API design patterns for consistent endpoints, pagination, error responses, and versioning.

Covers: URL conventions (plural nouns, nested resources), HTTP methods (GET/POST/PATCH/DELETE), cursor-based pagination, RFC 7807 error responses, API versioning, query parameter filtering, and sorting.

---

### pattern-nextjs

**Command**: `/pattern-nextjs`
**Description**: Next.js 15 App Router patterns.

Covers: Server Components by default, async params (`await params`), data fetching in Server Components, Server Actions with Zod validation, file conventions (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`), metadata, caching, and revalidation patterns.

---

### pattern-react-ui

**Command**: `/pattern-react-ui`
**Description**: React UI patterns for loading states, error handling, empty states, and custom hooks.

Covers: The Four States Rule (error, loading with no data, empty, success), custom hooks for data fetching, optimistic updates, debounced inputs, and component composition patterns.

---

### pattern-shadcn

**Command**: `/pattern-shadcn`
**Description**: shadcn/ui component patterns with Tailwind CSS.

Covers: Installing components (`npx shadcn@latest add`), the `cn()` helper for conditional classes, form patterns with React Hook Form + Zod, dialog patterns, data table patterns, toast notifications, and CVA (class-variance-authority) for variant styling.

---

### pattern-nestjs

**Command**: `/pattern-nestjs`
**Description**: NestJS patterns for modules, controllers, services, DTOs, guards, and pipes.

Covers: Feature module structure, controller with Swagger decorators, service with Drizzle queries, DTOs with `nestjs-zod`, global exception filter, Zod validation pipe, response interceptor, and module registration.

---

### pattern-spring

**Command**: `/pattern-spring`
**Description**: Spring WebFlux + R2DBC reactive patterns.

Covers: Reactive controllers returning `Mono<T>`/`Flux<T>`, R2DBC entities and repositories, `WebClient` for HTTP calls, `StepVerifier` testing, reactive operators (`map`, `flatMap`, `switchIfEmpty`, `onErrorResume`), error handling with `@RestControllerAdvice`, and transaction management.

---

### pattern-drizzle

**Command**: `/pattern-drizzle`
**Description**: Drizzle ORM patterns for PostgreSQL.

Covers: Schema design (UUID primary keys, timezone timestamps, enums, indexes), relational queries, transactions, type exports (`$inferSelect`/`$inferInsert`), migration generation and safety, and query builder patterns.

---

### pattern-testing

**Command**: `/pattern-testing`
**Description**: Testing patterns for Vitest, JUnit 5 + Mockito, and Playwright.

Covers: Vitest configuration, describe/it/arrange-act-assert pattern, factory functions, mocking with `vi.mock()`, JUnit 5 with `@Nested` and `@DisplayName`, Mockito mocking, MockMvc controller tests, StepVerifier for reactive streams, Playwright E2E patterns, and TDD workflow.

---

### pattern-vercel-ai

**Command**: `/pattern-vercel-ai`
**Description**: Vercel AI SDK patterns for streaming text, structured output, tool calls, and chat UIs.

Covers: `streamText` + `toDataStreamResponse()` route handlers, `useChat` client hook, `generateObject` with Zod schemas, `tool()` definitions with parameters and execute functions, `embed()`/`embedMany()` for vector search, error handling, and rate limiting.

---

## Analysis & Utility Skills

### analyze

**Command**: `/analyze <subject>`
**Description**: Analyze code, architecture, or documents and produce a markdown report.

Spawns an isolated Explore agent (Sonnet model) to minimize token usage in the main conversation. The agent searches the codebase, reads key files, and produces a structured report saved to `docs/analysis-<subject-slug>.md`.

Adapts focus based on subject keywords:
| Subject Contains | Focus |
|-----------------|-------|
| auth, login, security | Security patterns, auth flows, vulnerabilities |
| database, schema, query | Data models, indexes, query patterns |
| api, endpoint, route | REST design, error handling, validation |
| performance, slow | Bottlenecks, caching, async patterns |
| test, coverage | Test patterns, gaps, coverage analysis |

---

### makefile-gen

**Command**: `/makefile-gen`
**Description**: Generate a Makefile with targets for tests, Docker, and local dev.

Auto-detects the project stack and generates a Makefile at project root with targets organized by category:

- **Setup**: `install`, `clean`, `setup`, `fresh`
- **Development**: `dev`, `dev-web`, `dev-api`, `dev-enterprise`
- **Docker**: `docker-up`, `docker-down`, `docker-logs`, `docker-ps`, `docker-reset`
- **Database** (if Drizzle): `db-generate`, `db-migrate`, `db-studio`, `db-push`, `db-reset`
- **Quality**: `test`, `lint`, `typecheck`, `verify`
- **Build**: `build`, `build-web`, `build-api`, `build-enterprise`

All targets include `## Help text` for `make help` display.

---

### recreation.gov

**Command**: `/recreation.gov <campground-name>`
**Description**: Search for campgrounds on recreation.gov with automated browser navigation and GIF recording.

Three modes of operation:

**Search Mode** (`/recreation.gov Upper Pines`): Navigates to recreation.gov, searches for campgrounds, and displays results with map view and listings. Records interactions as GIF.

**Registry Mode** (`add campsite <url>`): Opens a recreation.gov campground URL, extracts the authoritative name from the page, normalizes it, and persists it to a local registry (`recreation_gov_registry.json`). Supports batch registration with comma-separated URLs.

**Availability Mode** (`check campsite "Upper Pines" from 2026-05-01 to 2026-05-07`): Looks up a registered campground by name, navigates to its availability page, and returns available sites with type, occupancy, and price.

---

## System Skills

Located in `skills/.system/`, these are meta-skills for managing the skill system itself.

### skill-creator

**Command**: `/skill-creator`
**Description**: Guide for creating effective skills that extend Claude Code/Codex capabilities.

Provides guidance on skill structure, SKILL.md format, metadata fields, triggers, and best practices for creating new skills.

---

### skill-installer

**Command**: `/skill-installer`
**Description**: Install skills from the curated OpenAI skills repo or other GitHub repositories.

Lists available skills from `github.com/openai/skills` (curated and experimental) and installs them into the skills directory. Supports installation from private repos.
