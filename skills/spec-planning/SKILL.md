---
name: spec-planning
description: Generate comprehensive implementation plan from PRD, DDD, and tech stack. Outputs planning documents to specs/plan/ for use by implementation agents.
triggers:
  - after reading PRD, DDD, and tech stack
  - before epic generation
  - when user asks for implementation plan
---

# Spec Planning — Implementation Blueprint Generator

You transform specification documents into a comprehensive implementation plan that guides all downstream agents. This is the bridge between "what to build" and "how to build it".

---

## How to Invoke

```
/spec-planning
/spec-planning prd=specs/prd.md ddd=specs/ddd.md stack=specs/tech-stack.md
```

Or called automatically by `/execute` after Step 4 (Parse DDD).

---

## Step 1: Load and Validate Inputs

Read all three specification documents:

```bash
# Defaults to specs/ directory
PRD_PATH="${1:-specs/prd.md}"
DDD_PATH="${2:-specs/ddd.md}"
STACK_PATH="${3:-specs/tech-stack.md}"
```

Validate each document exists and contains required content.

---

## Step 2: Create Plan Directory

```bash
mkdir -p specs/plan
```

---

## Step 3: Generate Understanding Summary

Write `specs/plan/00-understanding.md`:

```markdown
# Implementation Understanding

Generated: <timestamp>
PRD: <path>
DDD: <path>
Stack: <path>

---

## Problem Statement

<Extracted from PRD — what problem are we solving?>

## Target Users

<Extracted from PRD — who are we building for?>

## Core Value Proposition

<1-2 sentences — why does this matter?>

---

## Domain Model Summary

### Bounded Contexts

| Context | Purpose | Aggregates |
|---------|---------|------------|
| <name> | <purpose> | <list> |

### Key Entities

| Entity | Context | Fields | Relations |
|--------|---------|--------|-----------|
| <name> | <context> | <key fields> | <fks/refs> |

### Domain Events

| Event | Trigger | Consumers |
|-------|---------|-----------|
| <name> | <when emitted> | <who listens> |

---

## Technical Stack

| Layer | Technology | Directory |
|-------|------------|-----------|
| Frontend | <tech> | <path> |
| Backend | <tech> | <path> |
| Database | <tech> | <path> |
| AI | <tech or N/A> | <path> |

---

## Success Criteria

<Extracted from PRD — how do we know we're done?>

---

## Constraints & Assumptions

<Extracted from PRD and DDD — what limits us?>
```

---

## Step 4: Select Skill Patterns

Write `specs/plan/01-patterns.md`:

```markdown
# Skill Patterns Selected

Based on the tech stack and domain requirements, these patterns will guide implementation.

---

## Frontend Patterns

### pattern-nextjs
- **When**: Building pages, layouts, server components
- **Key Rules**:
  - Server Components by default
  - Async params in Next.js 15: `await params`
  - Loading state: `if (isLoading && !data)`

### pattern-react-ui
- **When**: Components with async data, loading states
- **Key Rules**:
  - Always handle: loading, error, empty, success states
  - Use custom hooks for data fetching

### pattern-shadcn
- **When**: Building UI components, forms, dialogs
- **Key Rules**:
  - Use Radix primitives via shadcn
  - Tailwind CSS for styling
  - CVA for variant styling

---

## Backend Patterns

### pattern-nestjs (if NestJS selected)
- **When**: Building API endpoints
- **Key Rules**:
  - Module structure: module.ts, controller.ts, service.ts, dto/
  - DTOs with nestjs-zod
  - Swagger decorators on all endpoints

### pattern-spring (if Spring selected)
- **When**: Building reactive APIs
- **Key Rules**:
  - Controllers return Mono<T> or Flux<T>
  - Never use .block() in production
  - WebClient for HTTP calls

---

## Database Patterns

### pattern-drizzle (if Drizzle selected)
- **When**: Schema design, queries, migrations
- **Key Rules**:
  - UUID primary keys: .primaryKey().defaultRandom()
  - Timestamps with timezone
  - Export $inferSelect and $inferInsert types

---

## API Patterns

### pattern-api-design
- **When**: Designing REST endpoints
- **Key Rules**:
  - Resource naming: plural nouns
  - Pagination: cursor-based preferred
  - Error responses: RFC 7807 Problem Details

---

## Testing Patterns

### pattern-testing
- **When**: Writing any tests
- **Key Rules**:
  - TDD workflow: red → green → refactor
  - Factory functions for test data
  - Coverage ≥ 80% on services

---

## AI Patterns (if applicable)

### pattern-vercel-ai
- **When**: Building AI features
- **Key Rules**:
  - Streaming by default
  - Structured output with Zod schemas
  - Tool calls for agent capabilities
```

---

## Step 5: Generate Task Breakdown

Write `specs/plan/02-tasks.md`:

```markdown
# Task Breakdown

Ordered tasks for implementation. Each task maps to a specialist agent.

---

## Phase 1: Foundation

| ID | Task | Agent | Inputs | Outputs | Est. |
|----|------|-------|--------|---------|------|
| T1 | Database schema | drizzle-dba | DDD entities | schema/*.ts | 30m |
| T2 | Shared types | nextjs-engineer | Schema types | packages/types/ | 15m |

### T1: Database Schema

**Agent**: `drizzle-dba`
**Pattern**: `pattern-drizzle`

**Requirements**:
- Create table per aggregate root
- UUID primary keys
- Timestamps (createdAt, updatedAt)
- Soft delete where specified

**Tables to Create**:
| Table | Fields | Indexes | Relations |
|-------|--------|---------|-----------|
| <name> | <fields> | <indexes> | <fks> |

---

## Phase 2: API Layer

| ID | Task | Agent | Inputs | Outputs | Est. |
|----|------|-------|--------|---------|------|
| T3 | <Context> module | nestjs-engineer | Schema, Types | app/api/src/modules/<context>/ | 1h |
| T4 | API integration tests | test-writer | Controllers | *.spec.ts | 30m |

### T3: <Context> Module

**Agent**: `nestjs-engineer`
**Pattern**: `pattern-nestjs`, `pattern-api-design`

**Endpoints**:
| Method | Path | Purpose | Request | Response |
|--------|------|---------|---------|----------|
| GET | /<resources> | List all | Query params | Array |
| GET | /<resources>/:id | Get one | Path param | Object |
| POST | /<resources> | Create | Body | Object |
| PATCH | /<resources>/:id | Update | Body | Object |
| DELETE | /<resources>/:id | Delete | Path param | 204 |

---

## Phase 3: Frontend

| ID | Task | Agent | Inputs | Outputs | Est. |
|----|------|-------|--------|---------|------|
| T5 | API client + hooks | nextjs-engineer | API endpoints | lib/, hooks/ | 30m |
| T6 | <Route> page | nextjs-engineer | Wireframe | app/<route>/ | 1h |

---

## Phase 4: Quality

| ID | Task | Agent | Inputs | Outputs | Est. |
|----|------|-------|--------|---------|------|
| T7 | Unit tests | test-writer | Services | *.test.ts | 1h |
| T8 | E2E tests | test-writer | User journeys | e2e/*.spec.ts | 1h |
| T9 | Security scan | security-auditor | All code | Report | 30m |
| T10 | Documentation | doc-generator | Code | JSDoc, README | 30m |

---

## Dependency Graph

```
T1 (schema) ──┬──> T3 (API module)
              │
T2 (types) ───┤
              │
              └──> T5 (API client) ──> T6 (pages)
                        │
T3 ───────────────────> T4 (API tests)
                        │
T6 ─────────────────────┴──> T7 (unit tests)
                              │
                              └──> T8 (E2E tests) ──> T9 (security) ──> T10 (docs)
```
```

---

## Step 6: Generate UI Wireframes

Write `specs/plan/03-wireframes.md`:

```markdown
# UI Wireframes

ASCII wireframes for each major view. These guide the `nextjs-engineer` implementation.

---

## Layout Shell

```
┌─────────────────────────────────────────────────────────────────┐
│  Logo    [Nav Item 1]  [Nav Item 2]  [Nav Item 3]      [User] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │                     Page Content                         │   │
│  │                                                          │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Dashboard (if applicable)

```
┌─────────────────────────────────────────────────────────────────┐
│  Dashboard                                            [+ New]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Metric 1   │  │   Metric 2   │  │   Metric 3   │          │
│  │    ###       │  │    ###       │  │    ###       │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Recent Items                                    [See All] │  │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  Item 1                                        [Action]  │   │
│  │  Item 2                                        [Action]  │   │
│  │  Item 3                                        [Action]  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## List View

```
┌─────────────────────────────────────────────────────────────────┐
│  <Resource Name>                                      [+ New]   │
├─────────────────────────────────────────────────────────────────┤
│  [Search...                    ]  [Filter ▼]  [Sort ▼]         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ □  Name          | Status   | Created    | Actions      │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ □  Item Alpha    | Active   | 2026-01-01 | [Edit] [Del] │   │
│  │ □  Item Beta     | Pending  | 2026-01-02 | [Edit] [Del] │   │
│  │ □  Item Gamma    | Active   | 2026-01-03 | [Edit] [Del] │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [<< Prev]  Page 1 of 10  [Next >>]                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Detail View

```
┌─────────────────────────────────────────────────────────────────┐
│  [← Back]  <Item Name>                         [Edit] [Delete]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────┐  ┌──────────────────────────────────┐  │
│  │                    │  │  Field 1:  Value                 │  │
│  │   [Image/Avatar]   │  │  Field 2:  Value                 │  │
│  │                    │  │  Field 3:  Value                 │  │
│  └────────────────────┘  │  Status:   [Badge]               │  │
│                          └──────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  [Tab 1]  [Tab 2]  [Tab 3]                              │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                          │   │
│  │  Tab content goes here...                                │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Create/Edit Form

```
┌─────────────────────────────────────────────────────────────────┐
│  [← Back]  Create/Edit <Resource>                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Field 1 *                                               │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │ Input value                                         │ │   │
│  │  └─────────────────────────────────────────────────────┘ │   │
│  │  Helper text or error message                            │   │
│  │                                                          │   │
│  │  Field 2                                                 │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │ Select option ▼                                     │ │   │
│  │  └─────────────────────────────────────────────────────┘ │   │
│  │                                                          │   │
│  │  Field 3                                                 │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │ Textarea...                                         │ │   │
│  │  │                                                     │ │   │
│  │  └─────────────────────────────────────────────────────┘ │   │
│  │                                                          │   │
│  │                              [Cancel]  [Save Changes]    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Custom Wireframes

<Generate specific wireframes based on PRD user stories>

For each major user story in the PRD, create a wireframe showing:
- Page layout
- Key UI elements
- Data displayed
- Available actions
```

---

## Step 7: Generate API Contract

Write `specs/plan/04-api-contract.md`:

```markdown
# API Contract

REST API specification for implementation.

---

## Base Configuration

| Setting | Value |
|---------|-------|
| Base URL | `/api` |
| Content-Type | `application/json` |
| Auth | <method or "None"> |
| Pagination | Cursor-based |

---

## Endpoints by Resource

### <Resource Name>

#### List <Resources>

```
GET /api/<resources>?cursor=<string>&limit=<number>&sort=<field>&order=asc|desc
```

**Query Parameters**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| cursor | string | - | Pagination cursor |
| limit | number | 20 | Items per page (max 100) |
| sort | string | createdAt | Sort field |
| order | string | desc | Sort order |

**Response 200**:
```json
{
  "data": [
    {
      "id": "uuid",
      "field1": "value",
      "field2": "value",
      "createdAt": "2026-01-01T00:00:00Z",
      "updatedAt": "2026-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "total": 100,
    "cursor": "next_cursor_token"
  }
}
```

#### Get <Resource>

```
GET /api/<resources>/:id
```

**Response 200**: Single resource object
**Response 404**: Resource not found

#### Create <Resource>

```
POST /api/<resources>
```

**Request Body**:
```json
{
  "field1": "value",
  "field2": "value"
}
```

**Response 201**: Created resource with ID
**Response 400**: Validation error

#### Update <Resource>

```
PATCH /api/<resources>/:id
```

**Request Body**: Partial resource object
**Response 200**: Updated resource
**Response 404**: Resource not found

#### Delete <Resource>

```
DELETE /api/<resources>/:id
```

**Response 204**: No content
**Response 404**: Resource not found

---

## Error Responses

All errors follow RFC 7807 Problem Details:

```json
{
  "type": "https://api.example.com/errors/validation",
  "title": "Validation Error",
  "status": 400,
  "detail": "Field 'email' must be a valid email address",
  "instance": "/api/users",
  "errors": [
    {
      "field": "email",
      "message": "Must be a valid email address"
    }
  ]
}
```

| Status | Type | When |
|--------|------|------|
| 400 | validation | Invalid request body |
| 401 | unauthorized | Missing/invalid auth |
| 403 | forbidden | Insufficient permissions |
| 404 | not-found | Resource doesn't exist |
| 409 | conflict | Duplicate/constraint violation |
| 500 | internal | Server error |
```

---

## Step 8: Generate Implementation Checklist

Write `specs/plan/05-checklist.md`:

```markdown
# Implementation Checklist

Use this checklist to track progress through the implementation.

---

## Pre-Implementation

- [ ] All planning documents reviewed
- [ ] Domain model understood
- [ ] Tech stack confirmed
- [ ] Development environment ready

---

## Phase 1: Foundation

- [ ] **T1**: Database schema created
  - [ ] All tables defined
  - [ ] Indexes created
  - [ ] Relations established
  - [ ] Migrations generated
  - [ ] Types exported

- [ ] **T2**: Shared types created
  - [ ] Request/Response types
  - [ ] Inferred types from schema

---

## Phase 2: API Layer

- [ ] **T3**: API modules created
  - [ ] Controller with all endpoints
  - [ ] Service with business logic
  - [ ] DTOs with validation
  - [ ] Swagger documentation

- [ ] **T4**: API tests written
  - [ ] Happy path tests
  - [ ] Validation error tests
  - [ ] Not found tests
  - [ ] All tests passing

---

## Phase 3: Frontend

- [ ] **T5**: API client created
  - [ ] Fetch wrapper configured
  - [ ] React Query hooks
  - [ ] Error handling

- [ ] **T6**: Pages implemented
  - [ ] List view
  - [ ] Detail view
  - [ ] Create/Edit form
  - [ ] Delete confirmation
  - [ ] Loading states
  - [ ] Error states
  - [ ] Empty states

---

## Phase 4: Quality

- [ ] **T7**: Unit tests complete
  - [ ] Service tests
  - [ ] Hook tests
  - [ ] Component tests
  - [ ] Coverage ≥ 80%

- [ ] **T8**: E2E tests complete
  - [ ] Critical user journeys
  - [ ] All tests passing

- [ ] **T9**: Security scan clean
  - [ ] No OWASP issues
  - [ ] Auth/authz verified

- [ ] **T10**: Documentation complete
  - [ ] JSDoc on services
  - [ ] README updated
  - [ ] API docs generated

---

## Final Verification

- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm test` passes
- [ ] `pnpm build` passes
- [ ] E2E tests pass
- [ ] PR created and reviewed
```

---

## Step 9: Report

After generating all planning documents:

```
✅ Planning Complete

Output Directory: specs/plan/

Documents Generated:
  ✅ 00-understanding.md  — Problem and domain summary
  ✅ 01-patterns.md       — Skill patterns selected
  ✅ 02-tasks.md          — Task breakdown with dependencies
  ✅ 03-wireframes.md     — UI wireframes (ASCII)
  ✅ 04-api-contract.md   — REST API specification
  ✅ 05-checklist.md      — Implementation checklist

Summary:
  Bounded Contexts: <N>
  Total Tasks: <N>
  Patterns Selected: <list>
  Estimated Time: <sum of task estimates>

Next: Run /spec-prd-parse to generate the epic, or /execute to continue the pipeline.
```

---

## Integration with /execute

When called from `/execute`, this skill:
1. Reads inputs already validated in Step 1
2. Generates all planning documents
3. Returns control to `/execute` for epic generation

The planning documents are available to all downstream agents:
- `orchestrator` reads task breakdown and dependencies
- `nextjs-engineer` reads wireframes and patterns
- `nestjs-engineer` reads API contract and patterns
- `test-writer` reads checklist for test coverage
