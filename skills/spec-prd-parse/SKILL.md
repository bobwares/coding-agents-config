---
name: spec-prd-parse
description: Parse a PRD into a DDD-aware epic with ordered tasks assigned to specialist agents. Reads .claude/domain/model.json if available for domain-aligned task generation.
---

# Spec PRD Parse — DDD-Aware Epic Generator

You transform a PRD into a complete, ordered epic with tasks assigned to the right specialist agents. When a domain model exists (`.claude/domain/model.json`), you use it to ensure all generated code will match the domain language exactly.

---

## How to Invoke

```
/spec-prd-parse <prd-name>
/spec-prd-parse my-app          # reads .claude/prds/my-app.prd.md
/spec-prd-parse docs/my-app.prd.md
```

---

## Step 1: Load Inputs

**Load the PRD**:
- Check `.claude/prds/<name>.prd.md`, then `.claude/prds/<name>.md`, then the path directly
- If not found: list available PRDs in `.claude/prds/` and stop

**Load the domain model** (if available):
```bash
cat .claude/domain/model.json 2>/dev/null || echo "NO_DOMAIN_MODEL"
```

If the domain model exists, use it to align all task names, entity names, table names, and module names with the ubiquitous language defined in the DDD document.

If no domain model: proceed with standard task generation based on the PRD alone.

---

## Step 2: Analyze Technical Scope

Read the PRD and identify which tech layers are needed:

| Layer | Needed if PRD mentions... |
|-------|--------------------------|
| Database (Drizzle) | data persistence, users, records, storage |
| NestJS API | backend logic, REST endpoints, business rules |
| Spring API | enterprise integration, LDAP, legacy systems |
| Next.js Frontend | UI, pages, forms, user interaction |
| AI Features | LLM, chat, generation, summarization, embeddings |
| Testing | always — every epic has a testing phase |

---

## Step 3: Generate the Epic

### With Domain Model

When `.claude/domain/model.json` is available, map each PRD user story to domain aggregates:

For each bounded context in the domain model:
1. Generate a **Database task** per aggregate (Drizzle schema matching entity fields exactly)
2. Generate **API tasks** per aggregate's domain service or controller
3. Generate **Frontend tasks** per major user story, using domain entity names in routes

**Naming rules when domain model is present**:
- Database tables: use `tableName` from `model.json` exactly
- NestJS modules: named after the bounded context (e.g., `TasksModule` for a `Tasks` context)
- NestJS services: named after aggregates (e.g., `TaskAggregateService`)
- Next.js routes: use plural aggregate names (`/tasks`, `/projects`)
- TypeScript types: match entity names from `model.json` exactly

### Task Breakdown Structure

Always organize tasks into 4 phases:

**Phase 1 — Foundation** (must complete before Phase 2)
- T1: Database schema (drizzle-dba) — one task per aggregate
- T2: Shared types (nextjs-engineer or nestjs-engineer)

**Phase 2 — API Layer** (must complete before Phase 3)
- T3+: NestJS modules (nestjs-engineer) — one per bounded context
- T4+: Spring endpoints (spring-engineer) — if spring in stack
- T5+: API integration tests (test-writer)

**Phase 3 — Frontend** (can run parallel with Phase 2 testing)
- T6+: Next.js pages (nextjs-engineer) — one per major user story
- T7+: UI components (nextjs-engineer) — shared components needed across pages
- T8+: AI features (ai-engineer) — if AI in scope

**Phase 4 — Quality**
- T9: Unit test suite (test-writer)
- T10: E2E tests (test-writer)
- T11: Security scan (security-auditor)
- T12: Documentation (doc-generator)

---

## Step 4: Write the Epic File

Write to `.claude/epics/<prd-name>/epic.md`:

```markdown
---
name: <prd-name>
status: planned
prdPath: <path to PRD>
dddModel: <path to model.json, or "none">
createdAt: <ISO timestamp>
stack: <layers used>
---

# Epic: <Feature Name>

## Source Documents
- **PRD**: <path>
- **Domain Model**: <path or "Not used">

## Bounded Contexts Covered
<List contexts from domain model that this epic touches, or "N/A">

## Domain Entities Being Implemented
<Table of entity → table → agent assignments from model.json>

| Entity | Table | Bounded Context | Implementing Agent |
|--------|-------|-----------------|-------------------|
| <EntityName> | <table_name> | <ContextName> | drizzle-dba + nestjs-engineer |

## Task Breakdown

### Phase 1 — Foundation

- [ ] **T1** `drizzle-dba` — Create Drizzle schema for `<entities>`
  - Tables: `<table_names from model.json>`
  - Fields: match `model.json` field definitions exactly
  - Relations: `<foreign keys from model.json>`
  - File: `packages/database/src/schema/<context>.ts`
  - _Blocks_: T3, T4, T5, T6

- [ ] **T2** `nestjs-engineer` — Create shared TypeScript types
  - Export types matching `$inferSelect` / `$inferInsert` from schema
  - File: `packages/types/src/<context>.ts`
  - _Blocks_: T3, T6

### Phase 2 — API Layer

- [ ] **T3** `nestjs-engineer` — Create `<ContextName>` NestJS module
  - Module: `<ContextName>Module`
  - Controller: `<Entity>Controller` (CRUD endpoints)
  - Service: `<Entity>Service` (business logic + Drizzle queries)
  - DTOs: `Create<Entity>Dto`, `<Entity>ResponseDto` using nestjs-zod
  - Swagger docs on all endpoints
  - File: `app/api/src/modules/<context-name>/`
  - _Depends on_: T1, T2
  - _Blocks_: T6

- [ ] **T5** `test-writer` — API integration tests
  - Test all CRUD endpoints
  - Test validation errors (400s)
  - Test not-found cases (404s)
  - File: `app/api/src/modules/<context-name>/<entity>.controller.spec.ts`
  - _Depends on_: T3

### Phase 3 — Frontend

- [ ] **T6** `nextjs-engineer` — Create `/<entities>` page (list + detail)
  - Route: `app/web/src/app/<entities>/page.tsx`
  - Server Component fetching from NestJS API
  - Loading skeleton, empty state, error state
  - _Depends on_: T1, T3

- [ ] **T7** `nextjs-engineer` — Create create/edit form
  - Route: `app/web/src/app/<entities>/new/page.tsx`
  - Server Action calling NestJS API
  - Zod validation, error display
  - _Depends on_: T6

### Phase 4 — Quality

- [ ] **T9** `test-writer` — Complete unit test suite
  - Service unit tests with factory functions
  - Coverage ≥ 80% on all services
  - _Depends on_: T3

- [ ] **T10** `test-writer` — E2E tests
  - Critical user journey: create → list → view → delete
  - File: `e2e/<entity>.spec.ts`
  - _Depends on_: T6, T7

- [ ] **T11** `security-auditor` — Security scan
  - OWASP check on new endpoints
  - Auth/authz validation
  - _Depends on_: T3

- [ ] **T12** `doc-generator` — Documentation
  - JSDoc on all service methods
  - Update README with new routes
  - _Depends on_: T3, T6

## Completion Criteria

- [ ] All tasks checked
- [ ] `/verify-all` passes (TypeScript + lint + tests + build)
- [ ] Security scan clean
- [ ] E2E tests pass
- [ ] PR created and linked
```

---

## Step 5: Report

After writing the epic:

```
✅ Epic Generated: <feature-name>

Domain alignment:     <YES — using model.json / NO — no domain model>
Bounded contexts:     <N>
Tasks generated:      <N> across 4 phases
Estimated agents:     <list of unique agents needed>

Phases:
  Phase 1 (Foundation):  <N> tasks
  Phase 2 (API):         <N> tasks
  Phase 3 (Frontend):    <N> tasks
  Phase 4 (Quality):     <N> tasks

Epic file: .claude/epics/<name>/epic.md

Run /spec-epic-start <name> to begin implementation.
Or run /execute — the pipeline continues automatically.
```
