# Skills Reference

This document catalogs all skills defined under the `.claude/skills/` directory. Skills provide specialized capabilities that can be invoked manually via `/skill-name` or auto-suggested by the `skill-eval` hook.

## Skills Summary Table

| Name | Purpose | Triggers | Used By |
|------|---------|----------|---------|
| **execute** | One-command full app build from PRD + DDD + tech stack | Manual: `/execute prd=... ddd=... stack=...` | Spawns: `project-init`, `ddd-parse`, `spec-prd-parse`, `orchestrator`, `verify-app`, `git-guardian` |
| **project-init** | Scaffold monorepo structure from tech stack selection | Called by `/execute` or manual | None (creates foundation) |
| **ddd-parse** | Parse DDD document into structured domain model | Called by `/execute` or manual | Produces `model.json` for `spec-prd-parse` |
| **spec-prd-new** | Create new PRD through guided discovery | Manual: `/spec-prd-new <name>` | None |
| **spec-prd-list** | List all PRDs and epics with status | Manual: `/spec-prd-list` | None |
| **spec-prd-parse** | Parse PRD into DDD-aware epic with tasks | Called by `/execute` or manual | Reads domain model, creates epics for `orchestrator` |
| **spec-epic-start** | Begin epic implementation, spawn orchestrator | Manual: `/spec-epic-start <name>` | Spawns: `orchestrator` |
| **spec-task-next** | Get next uncompleted task in current epic | Manual: `/spec-task-next` | None |
| **session-start** | Load memory bank and initialize session | Manual: `/session-start` | Used by `memory-bank` agent |
| **session-end** | Complete turn artifacts and update memory | Manual: `/session-end` | Used by `memory-bank` agent |
| **git-status** | Load project context (git state, stack, active epic) | Manual: `/git-status` | None |
| **session-context-size** | Capture context window usage to logs directory | Manual: `/session-context-size` | None |
| **makefile-gen** | Generate stack-aware Makefile for dev/test/docker | Manual: `/makefile-gen` or after `/project-init` | None |
| **verify-all** | Run full quality gate (TS + lint + test + build) | Before every PR, called by `/execute` | Spawns: `nextjs-engineer`, `nestjs-engineer`, `drizzle-dba`, `spring-engineer`, `test-writer`, `code-architect` |
| **test-and-fix** | Run tests and iteratively fix failures | Manual: `/test-and-fix` | None |
| **security-scan** | Security audit on changed files | Manual: `/security-scan` | Spawns: `security-auditor` |
| **git-commit-push-pr** | Full git workflow: verify, commit, push, PR | Manual: `/git-commit-push-pr` | Uses: `verify-all` skill |
| **git-quick-commit** | Fast local commit without verification | Manual: `/git-quick-commit` | None |
| **git-checkpoint** | Create named save point | Manual: `/git-checkpoint <name>` | None |
| **git-rollback** | Restore from checkpoint or undo commits | Manual: `/git-rollback <target>` | None |
| **git-undo** | Undo last Claude Code commit | Manual: `/git-undo` | None |
| **mode** | Switch Claude operating mode | Manual: `/mode <mode>` | None |
| **fix-issue** | End-to-end GitHub issue resolution | Manual: `/fix-issue <issue-number>` | Spawns: `orchestrator`, `verify-app`, `git-guardian` |
| **diagnose-issue** | Diagnose problem and create structured issue.md | When investigating bugs | Spawns appropriate specialist agent |
| **governance** | Enforce metadata headers, versioning, git conventions | Always active on file writes | Used by all agents |
| **adr** | Architecture Decision Record creation policy | End of every turn, architectural decisions | Used by `session-end`, `orchestrator` |
| **pattern-nextjs** | Next.js 15 App Router patterns | Working in `apps/web/`, building pages/layouts | Used by `nextjs-engineer` |
| **pattern-nestjs** | NestJS modules, controllers, services, DTOs | Working in `apps/api/`, building API endpoints | Used by `nestjs-engineer` |
| **pattern-spring** | Spring WebFlux + R2DBC reactive patterns | Working in `services/enterprise/`, Java APIs | Used by `spring-engineer` |
| **pattern-drizzle** | Drizzle ORM + PostgreSQL patterns | Working in `packages/database/`, schema design | Used by `drizzle-dba` |
| **pattern-shadcn** | shadcn/ui + Tailwind CSS patterns | Building UI components, forms, dialogs | Used by `nextjs-engineer` |
| **pattern-vercel-ai** | Vercel AI SDK streaming and tool patterns | Building AI features, chat UIs | Used by `ai-engineer` |
| **pattern-react-ui** | Loading/error/empty states, custom hooks | React components with async data | Used by `nextjs-engineer` |
| **pattern-api-design** | REST API design, pagination, error responses | Designing or reviewing API endpoints | Used by `nestjs-engineer`, `spring-engineer` |
| **pattern-testing** | Vitest, JUnit 5, Playwright testing patterns | Writing or fixing tests | Used by `test-writer` |
| **systematic-debugging** | Four-phase debugging methodology | Investigating bugs, unexpected behavior | Used by all agents when debugging |

---

## Skills by Category

### Pipeline Skills

Core skills that drive the agentic-pipeline workflow.

| Skill | Invocation | Purpose |
|-------|------------|---------|
| `execute` | `/execute prd=... ddd=... stack=...` | Full pipeline from spec to working app |
| `project-init` | `/project-init <stack>` | Scaffold monorepo structure |
| `makefile-gen` | `/makefile-gen [stack=...]` | Generate Makefile for dev/test/docker |
| `ddd-parse` | `/ddd-parse <path>` | Parse DDD to `model.json` |
| `spec-prd-new` | `/spec-prd-new <name>` | Create new PRD via discovery |
| `spec-prd-list` | `/spec-prd-list` | List PRDs and epics |
| `spec-prd-parse` | `/spec-prd-parse <name>` | Generate epic from PRD |
| `spec-epic-start` | `/spec-epic-start <name>` | Begin epic implementation |
| `spec-task-next` | `/spec-task-next [epic]` | Get next task in epic |

### Session Skills

Skills for managing session state and context.

| Skill | Invocation | Purpose |
|-------|------------|---------|
| `session-start` | `/session-start` | Load context and orient |
| `session-end` | `/session-end` | Complete turn artifacts |
| `git-status` | `/git-status` | Load project context for deep work |
| `session-context-size` | `/session-context-size` | Capture context window usage to logs |

### Git Skills

Skills for git operations and version control.

| Skill | Invocation | Purpose |
|-------|------------|---------|
| `git-commit-push-pr` | `/git-commit-push-pr` | Full workflow: verify → commit → push → PR |
| `git-quick-commit` | `/git-quick-commit [msg]` | Fast local commit |
| `git-checkpoint` | `/git-checkpoint <name>` | Create named save point |
| `git-rollback` | `/git-rollback <target>` | Restore from checkpoint |
| `git-undo` | `/git-undo` | Undo last Claude commit |

### Quality Skills

Skills for verification, testing, and security.

| Skill | Invocation | Purpose |
|-------|------------|---------|
| `verify-all` | `/verify-all` | TypeScript + lint + test + build |
| `test-and-fix` | `/test-and-fix` | Run tests, auto-fix failures |
| `security-scan` | `/security-scan [scope]` | OWASP security audit |

### Governance Skills

Skills that enforce coding standards (always active).

| Skill | Invocation | Purpose |
|-------|------------|---------|
| `governance` | Always active | Metadata headers, versioning, git conventions |
| `adr` | Every turn | Architecture Decision Record policy |

### Domain Pattern Skills

Skills auto-suggested by the `skill-eval` hook based on file paths and keywords.

| Skill | Triggers On | Agent |
|-------|-------------|-------|
| `pattern-nextjs` | `apps/web/**`, Next.js keywords | `nextjs-engineer` |
| `pattern-nestjs` | `apps/api/**`, NestJS decorators | `nestjs-engineer` |
| `pattern-spring` | `services/enterprise/**`, Spring annotations | `spring-engineer` |
| `pattern-drizzle` | `packages/database/**`, Drizzle keywords | `drizzle-dba` |
| `pattern-shadcn` | `packages/ui/**`, shadcn/ui components | `nextjs-engineer` |
| `pattern-vercel-ai` | AI SDK functions, `useChat` | `ai-engineer` |
| `pattern-react-ui` | Custom hooks, state patterns | `nextjs-engineer` |
| `pattern-api-design` | REST API design keywords | `nestjs-engineer`, `spring-engineer` |
| `pattern-testing` | `*.test.ts`, test keywords | `test-writer` |
| `systematic-debugging` | Bug, error, broken, crash | All agents |

### Utility Skills

General-purpose utility skills.

| Skill | Invocation | Purpose |
|-------|------------|---------|
| `mode` | `/mode <mode>` | Switch operating mode (architect\|code\|debug\|review\|test) |
| `fix-issue` | `/fix-issue <number>` | End-to-end GitHub issue resolution |
| `diagnose-issue` | `/diagnose-issue <desc>` | Diagnose problem, create issue.md |

---

## Detailed Skill Descriptions

### execute

**File:** `.claude/skills/execute/SKILL.md`
**Purpose:** One-command full app build from PRD + DDD + tech stack to working, verified, committed codebase.

**Pipeline Steps:**
1. Parse arguments (prd, ddd, stack paths)
2. Initialize turn lifecycle (pre-execution)
3. Scaffold project with `project-init`
4. Parse DDD with `ddd-parse`
5. Generate epics with `spec-prd-parse`
6. Execute epics with `orchestrator`
7. Complete turn lifecycle (post-execution)

**Spawns:** `project-init`, `ddd-parse`, `spec-prd-parse`, `orchestrator`, `verify-app`, `git-guardian`

---

### verify-all

**File:** `.claude/skills/verify-all/SKILL.md`
**Purpose:** Full quality gate required before every PR.

**Checks:**
1. TypeScript: `pnpm typecheck`
2. Lint: `pnpm lint`
3. Tests: `pnpm test --run`
4. Build: `pnpm build`
5. Java (if exists): `mvn clean package`

**Spawns Agents on Failure:**
| Failure Type | Agent |
|--------------|-------|
| TypeScript in `apps/web/` | `nextjs-engineer` |
| TypeScript in `apps/api/` | `nestjs-engineer` |
| TypeScript in `packages/database/` | `drizzle-dba` |
| Java errors | `spring-engineer` |
| Test failures | `test-writer` |
| Build failures | `code-architect` |

---

### governance

**File:** `.claude/skills/governance/SKILL.md`
**Purpose:** Enforce mandatory coding standards on every file.

**Enforces:**
- Metadata headers on all source files
- Semantic versioning per file (new files start at 0.1.0)
- Git branch naming: `<type>/<description>[-<task-id>]`
- Commit format: `AI Coding Agent Change:` + bullets
- Turn artifacts: session_context.md, pull_request.md, adr.md, manifest.json
- Git tags: `turn/${TURN_ID}`

---

### pattern-nextjs

**File:** `.claude/skills/pattern-nextjs/SKILL.md`
**Purpose:** Next.js 15 App Router patterns for server components, server actions, and route handlers.

**Key Patterns:**
- Server Components by default
- Async params in Next.js 15: `await params`
- Server Actions with Zod validation
- Loading state: `if (isLoading && !data)` (not just `if (isLoading)`)
- `useActionState` for form handling

**Triggers:** `apps/web/app/**`, `page.tsx`, `layout.tsx`, Next.js keywords

---

### pattern-nestjs

**File:** `.claude/skills/pattern-nestjs/SKILL.md`
**Purpose:** NestJS patterns for modules, controllers, services, and DTOs.

**Key Patterns:**
- Module structure: `module.ts`, `controller.ts`, `service.ts`, `dto/`
- DTOs with `nestjs-zod` (not class-validator)
- Swagger decorators: `@ApiOperation`, `@ApiResponse`
- NestJS exceptions: `NotFoundException`, `ConflictException`

**Triggers:** `apps/api/src/**`, NestJS decorators

---

### pattern-drizzle

**File:** `.claude/skills/pattern-drizzle/SKILL.md`
**Purpose:** Drizzle ORM patterns for PostgreSQL schema and queries.

**Key Patterns:**
- UUID primary keys: `.primaryKey().defaultRandom()`
- Timestamps with timezone: `{ withTimezone: true }`
- Transactions for multi-step mutations
- Export `$inferSelect` and `$inferInsert` types

**Triggers:** `packages/database/**`, Drizzle keywords

---

### pattern-spring

**File:** `.claude/skills/pattern-spring/SKILL.md`
**Purpose:** Spring WebFlux + R2DBC reactive patterns.

**Key Patterns:**
- Controllers return `Mono<T>` or `Flux<T>`
- R2DBC entities with `@Table` (not JPA `@Entity`)
- `WebClient` for HTTP calls (not `RestTemplate`)
- `StepVerifier` for testing reactive streams
- Never use `.block()` in production

**Triggers:** `services/enterprise/**`, Spring annotations

---

### pattern-testing

**File:** `.claude/skills/pattern-testing/SKILL.md`
**Purpose:** Testing patterns for Vitest, JUnit 5, and Playwright.

**Covers:**
- TypeScript: Vitest configuration, factory functions, mocking
- Java: JUnit 5 + Mockito, `@Nested` + `@DisplayName`
- Reactive: `StepVerifier` patterns
- E2E: Playwright selectors and assertions
- TDD workflow: red → green → refactor

**Triggers:** `*.test.ts`, `*.spec.ts`, test keywords

---

### systematic-debugging

**File:** `.claude/skills/systematic-debugging/SKILL.md`
**Purpose:** Four-phase debugging methodology.

**Phases:**
1. **Observe:** Capture exact error, reproduction steps
2. **Hypothesize:** Generate 3-5 ranked root cause hypotheses
3. **Test:** Prove/disprove each hypothesis
4. **Fix:** Address root cause with guard and test

**Triggers:** Bug, broken, not working, crash, error keywords

---

### adr

**File:** `.claude/skills/adr/SKILL.md`
**Purpose:** Architecture Decision Record policy.

**When to Write Full ADR:**
- Choosing design patterns
- Selecting libraries/frameworks
- Changing API contracts
- Introducing infrastructure
- Modifying data models

**Minimal ADR:** `No architectural decision made this turn — [description].`

**Location:** `./ai/agentic-pipeline/turns/turn-${TURN_ID}/adr.md`

---

### git-status

**File:** `.claude/skills/git-status/SKILL.md`
**Purpose:** Load project context for focused work sessions.

**Gathers:**
- Current branch and git status
- Recent commits (last 10)
- Active epic (if any in `.claude/epics/`)
- Stack summary from package.json and CLAUDE.md

**Output:** Formatted context summary showing project, stack, branch, active work, and recent commits.

**Use:** Run at start of focused work session to orient quickly.

---

### makefile-gen

**File:** `.claude/skills/makefile-gen/SKILL.md`
**Purpose:** Generate a stack-aware Makefile for development, testing, and Docker.

**Detects:**
- Next.js (`app/web/`)
- NestJS (`app/api/`)
- Spring Boot (`app/services/enterprise/`)
- Drizzle (`app/packages/database/`)

**Generated Targets:**
| Category | Targets |
|----------|---------|
| Setup | `install`, `setup`, `fresh`, `clean` |
| Dev | `dev`, `dev-web`, `dev-api`, `dev-enterprise` |
| Docker | `docker-up`, `docker-down`, `docker-logs`, `docker-reset` |
| Database | `db-generate`, `db-migrate`, `db-studio`, `db-reset` |
| Quality | `test`, `lint`, `typecheck`, `verify`, `build` |

**Triggers:** After `/project-init` or manual invocation.

---

### session-context-size

**File:** `.claude/skills/session-context-size/SKILL.md`
**Purpose:** Capture and save context window usage report.

**Output Location:** `./logs/context-<N>.md` (auto-incremented)

**Report Includes:**
- Loaded rules files and sizes
- Skills count
- CLAUDE.md size
- MCP tools (if any)
- Custom agents (if visible)

**Use:** Monitor token consumption during long sessions.

---

## Skill Invocation

Skills can be invoked in three ways:

### 1. Manual Invocation

```
/skill-name [arguments]
```

Example:
```
/execute prd=specs/app.prd.md ddd=specs/app.ddd.md stack=specs/tech-stack.md
/mode debug
/verify-all
```

### 2. Auto-Suggestion by skill-eval Hook

The `skill-eval` hook analyzes user prompts and suggests relevant skills based on:
- Keywords (e.g., "next.js", "drizzle", "test")
- File paths (e.g., `apps/web/app/page.tsx`)
- Intent patterns (e.g., "fix the bug", "add a page")

### 3. Agent Activation

Specialist agents automatically activate their domain skill:
- `nextjs-engineer` → `pattern-nextjs`
- `nestjs-engineer` → `pattern-nestjs`
- `test-writer` → `pattern-testing`

---

## Adding New Skills

1. Create directory: `.claude/skills/<skill-name>/`
2. Create `SKILL.md` with required YAML frontmatter:

```yaml
---
name: skill-name
description: One-sentence description
triggers:
  - when condition 1
  - when condition 2
---
```

3. Write skill instructions in markdown below the frontmatter
4. If auto-suggestion desired, add to `.claude/hooks/skill-rules.json`
