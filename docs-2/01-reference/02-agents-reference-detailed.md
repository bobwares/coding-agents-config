# Agent Reference

Detailed documentation for all 13 specialist agents. Each agent is a markdown file in the `agents/` directory that defines a subagent's role, tools, and behavior when spawned by Claude Code or Codex.

---

## Orchestrator

**File**: `agent-orchestrator.md`
**Model**: `claude-haiku-4-5`
**Tools**: Task, Read, Bash, Glob, Grep

Master coordinator for full-stack app development. The orchestrator never writes code itself — it delegates to specialist agents using the Task tool.

### 5-Phase Workflow

1. **Understand** — Clarify scope, inspect files, state understanding
2. **Plan** — Write a numbered implementation plan with agent assignments; wait for user approval
3. **Execute** — Spawn specialist agents via the Task tool (one per logical unit of work)
4. **Verify** — Spawn `verify-app`; if it fails, spawn the relevant engineer to fix, then re-verify
5. **Ship** — Spawn `git-guardian` to commit, push, and create a PR

### Agent Routing Table

| Task Type | Agent |
|-----------|-------|
| System design, API contracts | `code-architect` |
| Next.js pages/components/actions | `nextjs-engineer` |
| NestJS modules/services/controllers | `nestjs-engineer` |
| Java/Spring REST/R2DBC | `spring-engineer` |
| Database schema/queries/migrations | `drizzle-dba` |
| AI/LLM/streaming features | `ai-engineer` |
| Code review | `code-reviewer` |
| Tests (unit/integration/E2E) | `test-writer` |
| Full quality gate | `verify-app` |
| Security review | `security-auditor` |
| Documentation | `doc-generator` |
| Git/PR workflow | `git-guardian` |

### Rules

- Never bypass verification before shipping
- Never commit directly to `main`
- Always get plan approval before executing
- Never make assumptions about requirements — ask

---

## Code Reviewer

**File**: `agent-code-reviewer.md`
**Model**: `claude-haiku-4-5`
**Tools**: Read, Glob, Grep, Bash

Senior engineer code reviewer. Invoke after implementing a feature or before creating a PR. Produces a structured review with a checklist-based assessment.

### Review Checklist Categories

- **Correctness** — Happy path logic, edge cases, async/await, error states
- **TypeScript** — No `any`, explicit return types, no unexplained `@ts-ignore`, types derived from source of truth
- **Security** — No hardcoded secrets, input validation, authorization checks, parameterized queries
- **React/Next.js** — Loading/empty states, disabled buttons during pending ops, no `useEffect` for data fetching
- **Database** — Transactions for multi-step ops, N+1 avoidance, appropriate indexes
- **Testing** — New functionality covered, behavior-based tests, no deleted tests

### Output Format

Produces a markdown report with sections: Summary, Strengths, Critical Issues (must fix), Warnings (should fix), Suggestions (nice to have), and a final Verdict of `APPROVE`, `REQUEST CHANGES`, or `NEEDS DISCUSSION`.

---

## Code Architect

**File**: `agent-code-architect.md`
**Model**: `claude-haiku-4-5`
**Tools**: Read, Bash, Glob, Grep, Write, Edit

System design specialist. Designs API contracts, database schemas, module boundaries, and writes Architecture Decision Records (ADRs) before implementation begins.

### Design Process

1. Read existing codebase structure
2. Understand requirements from the PRD/epic
3. Design the data model first (schema drives everything)
4. Design the API contract second
5. Define module/service boundaries
6. Document in ADR format

### Outputs

Every design produces four artifacts:

1. **Data model** — Drizzle schema snippet or ERD description
2. **API contract** — TypeScript interfaces or OpenAPI summary
3. **File/module structure** — Directory tree
4. **ADR entry** — Context, decision, and consequences (positive, negative, risks)

### Standards

- Design for the happy path first, then edge cases
- Prefer simple over clever
- UUIDs everywhere, no auto-increment integers exposed
- Foreign keys with cascade on delete where appropriate
- Every API has a typed error response

---

## Test Writer

**File**: `agent-test-writer.md`
**Model**: `claude-haiku-4-5`
**Tools**: Read, Write, Edit, Bash, Glob, Grep

TDD specialist supporting both TypeScript (Vitest) and Java (JUnit 5 + Mockito). Always writes the test before asking for implementation changes.

### TDD Process

1. Read the feature specification or failing behavior
2. Write a failing test that describes the expected behavior
3. Report that the test is ready to confirm failure
4. After implementation, run tests and confirm they pass

### Supported Test Types

| Stack | Framework | Pattern |
|-------|-----------|---------|
| TypeScript unit | Vitest | `describe` / `it` / arrange-act-assert |
| TypeScript factories | Vitest | `getMockEntity()` with selective overrides |
| Java unit (services) | JUnit 5 + Mockito | `@ExtendWith(MockitoExtension)`, `@Nested` classes |
| Java integration (controllers) | MockMvc | `@WebMvcTest` with `@MockBean` |
| Java reactive | StepVerifier | `StepVerifier.create()` for Mono/Flux assertions |

### Coverage Targets

| Stack | Target |
|-------|--------|
| TypeScript Services | >= 80% lines |
| TypeScript Utils | >= 90% lines |
| Java Services | >= 80% lines |
| Java Controllers | All endpoints covered |
| React Components | Render + primary interactions |
| E2E | Critical user journeys only |

### Anti-Patterns

- Testing implementation details (private methods, internal state)
- Deleting tests to fix coverage
- `Thread.sleep()` in tests (use StepVerifier or Awaitility)
- Shared mutable state between tests
- Tests that call real external services
- Missing `@DisplayName` annotations in Java tests

---

## Verify App

**File**: `agent-verify-app.md`
**Model**: `claude-haiku-4-5`
**Tools**: Bash, Read, Task

Full quality gate. Runs the complete verification suite and spawns agents to fix any failures. Always run before creating a PR.

### Verification Suite

1. `pnpm typecheck` — TypeScript type checking
2. `pnpm lint` — Lint rules
3. `pnpm test --run` — TypeScript tests
4. `pnpm build` — Production build
5. `mvn clean test` — Java compile and tests (if `pom.xml` exists)

### Failure Routing

| Failure Type | Agent Spawned |
|-------------|---------------|
| TS errors in `app/web/` | `nextjs-engineer` |
| TS errors in `app/api/` | `nestjs-engineer` |
| TS errors in `packages/database/` | `drizzle-dba` |
| Java compile errors | `spring-engineer` |
| Java test failures | `test-writer` |
| TypeScript test failures | `test-writer` |
| Lint errors | Relevant engineer by file path |
| Build failures | `code-architect` |

### Report Format

Produces a verification report with pass/fail status for each step and an overall verdict of `READY TO SHIP` or `NEEDS FIXES`.

---

## Git Guardian

**File**: `agent-git-guardian.md`
**Model**: `claude-haiku-4-5`
**Tools**: Bash, Read

Git workflow specialist. Writes clean conventional commit messages and creates well-described PRs.

### Rules

- Never commits directly to `main` or `master`
- Always uses conventional commits: `type(scope): description`
- Always verifies (typecheck) before committing
- Always includes `Co-Authored-By: Claude` in commits

### Conventional Commit Types

| Type | Use |
|------|-----|
| `feat` | New feature |
| `fix` | Bug fix |
| `chore` | Maintenance, deps, config |
| `docs` | Documentation only |
| `refactor` | Code restructuring |
| `test` | Adding/fixing tests |
| `perf` | Performance improvement |
| `ci` | CI/CD changes |

### PR Creation

Creates PRs with `gh pr create` including a "What Changed" summary, "How to Test" instructions, and a checklist of verification steps.

---

## Security Auditor

**File**: `agent-security-auditor.md`
**Model**: `claude-haiku-4-5`
**Tools**: Read, Bash, Glob, Grep

Security specialist. Reviews code for OWASP Top 10 vulnerabilities, secrets exposure, authentication/authorization gaps, and injection risks.

### OWASP Top 10 Checklist

| ID | Category | What to Check |
|----|----------|---------------|
| A01 | Broken Access Control | Authorization in service layer, not just route guards |
| A02 | Cryptographic Failures | No plaintext secrets, HTTPS enforced, strong hashing |
| A03 | Injection | Parameterized queries only, no string concatenation in SQL |
| A04 | Insecure Design | Business logic enforces constraints, not just UI |
| A05 | Security Misconfiguration | No debug endpoints in prod, security headers set |
| A06 | Vulnerable Components | `pnpm audit`, `mvn dependency-check` |
| A07 | Auth Failures | JWT validated server-side, sessions invalidated on logout |
| A08 | Data Integrity | Input validated at entry points, no mass assignment |
| A09 | Logging Failures | Security events logged (auth failures, unauthorized access) |
| A10 | SSRF | External URLs validated, internal network unreachable from user input |

### Secrets Scanning

Scans for accidentally committed passwords, API keys, and secret tokens across TypeScript and Java files.

### Report Format

Produces a tiered report: Critical (fix before merge), High (fix before production), Medium (fix in next sprint), and Passing Checks.

---

## Doc Generator

**File**: `agent-doc-generator.md`
**Model**: `claude-haiku-4-5`
**Tools**: Read, Write, Edit, Bash, Glob, Grep

Documentation specialist. Generates JSDoc comments, README updates, OpenAPI/Swagger documentation, and CHANGELOG entries.

### Standards

- Reads all relevant source files before writing any documentation
- Documents WHY, not what the code obviously does
- JSDoc includes `@param`, `@returns`, `@throws`, and `@example`
- README follows a standard structure: description, prerequisites, setup, architecture, development
- Updates CHANGELOG.md with recent changes

---

## AI Engineer

**File**: `agent-ai-engineer.md`
**Model**: `claude-haiku-4-5`
**Tools**: Read, Write, Edit, Bash, Glob, Grep

AI integration specialist for the Vercel AI SDK. Handles chat UIs, streaming text, structured output, tool calls, embeddings, and RAG pipelines.

### Core Rules

- API keys server-side only — never in client components
- Always handle streaming errors in `onError` callback
- Use `generateObject` with Zod schemas for structured output
- Tool execute functions must handle errors gracefully
- Rate limit expensive LLM calls at the route handler level

### Common Patterns

| Pattern | Server | Client |
|---------|--------|--------|
| Chat | `streamText` + `toDataStreamResponse()` | `useChat` |
| Structured output | `generateObject` with Zod schema | — |
| Tool calls | `tool()` with Zod params + `execute` | — |
| Embeddings | `embed()` or `embedMany()` | — |

### Work Process

1. Invoke `pattern-vercel-ai` skill for reference
2. Read existing AI routes in `app/web/src/app/api/`
3. Implement route handler (server-side)
4. Implement client component if needed
5. Add error handling and loading states
6. Test streaming end-to-end

---

## Next.js Engineer

**File**: `agent-nextjs-engineer.md`
**Model**: `claude-haiku-4-5`
**Tools**: Read, Write, Edit, Bash, Glob, Grep

Next.js 15 App Router specialist. Builds pages, layouts, server components, client components, server actions, and route handlers.

### Core Rules

- Server Components by default — add `'use client'` only when needed
- Always `await params` in Next.js 15
- Data fetching directly in Server Components, never `useEffect`
- Mutations via Server Actions with Zod validation
- `useActionState` for form state, `useState` for local UI only
- Loading pattern: `if (loading && !data)` — never `if (loading)`

### File Structure Convention

```
app/web/src/app/[route]/
  page.tsx            # Server Component
  layout.tsx          # Persistent wrapper
  loading.tsx         # Suspense boundary fallback
  error.tsx           # Error boundary ('use client')
  _components/        # Route-specific components
  actions.ts          # Server Actions
```

### Quality Checklist

- No `any` types
- `await params` used in pages
- Error, loading, and empty states handled
- Server Actions validate with Zod
- `revalidatePath` called after mutations

---

## NestJS Engineer

**File**: `agent-nestjs-engineer.md`
**Model**: `claude-haiku-4-5`
**Tools**: Read, Write, Edit, Bash, Glob, Grep

NestJS specialist for modules, controllers, services, DTOs, guards, interceptors, and pipes in the `app/api` directory.

### Core Rules

- Every DTO uses `nestjs-zod` (not `class-validator`)
- Every endpoint has `@ApiOperation` and `@ApiResponse` decorators
- No business logic in controllers — controllers route, services act
- No raw DB queries in services — use injected Drizzle DB
- Use NestJS exceptions (`NotFoundException`, `ConflictException`, etc.)

### Module Checklist

For every new feature module:

- `feature.module.ts` — imports and exports
- `feature.controller.ts` — HTTP handlers with Swagger docs
- `feature.service.ts` — business logic with Drizzle queries
- `dto/create-feature.dto.ts` — Zod-based input DTO
- `dto/feature-response.dto.ts` — response shape
- `feature.controller.spec.ts` — unit tests
- Register in `app.module.ts`

---

## Spring Engineer

**File**: `agent-spring-engineer.md`
**Model**: `claude-haiku-4-5`
**Tools**: Read, Write, Edit, Bash, Glob, Grep

Spring WebFlux + R2DBC specialist for building reactive REST controllers, R2DBC entities, reactive repositories, and services with Mono/Flux in the `services/enterprise` directory.

### Core Stack

- **Web Layer**: Spring WebFlux
- **Data Access**: R2DBC (reactive, non-blocking)
- **HTTP Client**: WebClient (never RestTemplate)
- **Testing**: StepVerifier (reactor-test)

### Core Rules

- All controller methods return `Mono<T>` or `Flux<T>` — never blocking types
- All repository methods return `Mono<T>` or `Flux<T>` via `ReactiveCrudRepository`
- Never call `.block()` in production code
- DTOs must be Java Records — never expose R2DBC entities directly
- `@Valid` on every controller input
- `@Transactional` on mutation service methods
- Test reactive streams with `StepVerifier` — never `Thread.sleep()`

### Key Reactive Operators

| Operator | Use Case |
|----------|----------|
| `map` | Synchronous transformation |
| `flatMap` | Async transformation to another Mono/Flux |
| `switchIfEmpty` | Fallback when empty (404 scenarios) |
| `onErrorResume` | Handle errors with fallback |
| `onErrorMap` | Transform error type |
| `zip` | Combine multiple publishers |
| `doOnSuccess` / `doOnError` | Side effects (logging) |
| `timeout` | Add timeout to operation |

### Feature Checklist

- R2DBC entity with `@Table`, `@Id`, `@Column`
- Repository extending `ReactiveCrudRepository<T, UUID>`
- Request/Response Record DTOs
- Service returning `Mono<T>` / `Flux<T>` with error handling
- Controller with Swagger annotations
- Unit tests (StepVerifier) — mandatory
- Integration tests (WebTestClient) — mandatory

### Completion Criteria

A feature is not complete until: `mvn compile` passes, `mvn test` passes, service has >= 80% coverage, and all controller endpoints have tests.

---

## Drizzle DBA

**File**: `agent-drizzle-dba.md`
**Model**: `claude-haiku-4-5`
**Tools**: Read, Write, Edit, Bash, Glob, Grep

Database specialist for Drizzle ORM + PostgreSQL. Handles schema design, complex queries, migrations, indexes, relations, and transactions.

### Core Rules

- UUID primary keys: `.primaryKey().defaultRandom()`
- All timestamps: `{ withTimezone: true }`
- All multistep mutations in `db.transaction()`
- Define indexes in schema (not migrations)
- Export `type T = typeof table.$inferSelect` for every table
- Export `type NewT = typeof table.$inferInsert` for every table

### Schema Design Checklist

- Primary key: `uuid().defaultRandom()`
- Foreign keys with `references()` + `onDelete` strategy
- Indexes for all foreign key columns
- Unique indexes for natural keys (email, slug)
- `createdAt` and `updatedAt` timestamps on every table
- Types exported (`$inferSelect` + `$inferInsert`)

### Migration Safety

- Check that existing data won't be lost
- New NOT NULL columns must have a `default` or use a two-stage migration
- Renaming columns requires a two-stage migration (add new, copy data, drop old)

### Work Process

1. Invoke `pattern-drizzle` skill
2. Read `packages/database/schema/` for existing patterns
3. Design schema changes
4. Run `pnpm db:generate` to generate migration
5. Inspect generated migration SQL for correctness
6. Run `pnpm db:migrate` to apply
