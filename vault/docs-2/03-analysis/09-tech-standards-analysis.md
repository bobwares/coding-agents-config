# Tech Standards Analysis

Analysis of `.claude/rules/tech-standards.md` to identify content that should be moved to pattern skills.

---

## Current State

| tech-standards Section | Pattern Skill | Duplication Level |
|------------------------|---------------|-------------------|
| TypeScript | *None* | Keep - cross-cutting |
| React / Next.js | `pattern-nextjs`, `pattern-react-ui` | **HIGH** - skills have 3x more detail |
| NestJS API | `pattern-nestjs` | **HIGH** - skill has full examples |
| Spring Boot API | `pattern-spring` | **HIGH** - skill has 450 lines of patterns |
| Database (Drizzle) | `pattern-drizzle` | **HIGH** - skill has complete examples |
| Security | *None* | Keep - cross-cutting |
| Testing | `pattern-testing` | **HIGH** - skill has 424 lines |
| Git / Collaboration | *None* | Keep - cross-cutting |

---

## Problem

`tech-standards.md` is loaded into **every conversation** via rules. At ~150 lines, it duplicates content already available in on-demand pattern skills. This wastes context tokens and creates maintenance burden (two places to update).

---

## Recommendation

### KEEP in tech-standards.md (cross-cutting)

These apply to ALL code regardless of framework:

1. **TypeScript** — strict mode, no `any`, interfaces vs types
2. **Security** — env vars, validation, parameterized queries
3. **Git / Collaboration** — conventional commits, PR flow

### REMOVE from tech-standards.md (move to skills)

These are framework-specific and already thoroughly covered:

| Section | Covered By | Lines in Skill |
|---------|------------|----------------|
| React / Next.js | `pattern-nextjs` + `pattern-react-ui` | 183 + 143 |
| NestJS API | `pattern-nestjs` | 175 |
| Spring Boot API | `pattern-spring` | 453 |
| Database (Drizzle) | `pattern-drizzle` | 145 |
| Testing | `pattern-testing` | 424 |

---

## Proposed Slim tech-standards.md

```markdown
# Tech Standards

Non-negotiable standards for all agents.

---

## TypeScript (All Projects)

- `"strict": true` in all tsconfig.json files
- No `any` — use `unknown` + type guards
- No `// @ts-ignore` without explanatory comment
- Interfaces for object shapes; types for unions/intersections/mapped
- Explicit return types on all exported functions
- Types derived from source: `typeof table.$inferSelect`, `z.infer<typeof schema>`

---

## Security (All Layers)

- No secrets or credentials in source code — use environment variables
- `.env*` files are gitignored — never committed
- Validate user input at every entry point (DTO, Zod schema, Bean Validation)
- Authorization checked in service layer (not just route-level guard)
- Parameterized queries always (Drizzle and JPA handle this automatically)

---

## Git / Collaboration

- Conventional commits: `type(scope): description`
- All Claude commits include `Co-Authored-By: Claude <noreply@anthropic.com>`
- No commits directly to `main` — always via PR
- PR description includes: what changed, why, how to test

---

## Framework Patterns → Activate Skills

For detailed patterns, activate the appropriate skill:

| Domain | Skill |
|--------|-------|
| Next.js 15 App Router | `/pattern-nextjs` |
| React loading/error/empty states | `/pattern-react-ui` |
| NestJS modules, controllers, DTOs | `/pattern-nestjs` |
| Spring WebFlux + R2DBC | `/pattern-spring` |
| Drizzle ORM + PostgreSQL | `/pattern-drizzle` |
| Testing (Vitest, JUnit 5, Playwright) | `/pattern-testing` |
| shadcn/ui + Tailwind CSS | `/pattern-shadcn` |
| Vercel AI SDK | `/pattern-vercel-ai` |
| REST API design | `/pattern-api-design` |
```

---

## Benefits

| Metric | Before | After |
|--------|--------|-------|
| tech-standards.md lines | ~150 | ~60 |
| Token cost per conversation | Higher | Lower |
| Duplication | High | None |
| Maintenance burden | Two places | One place |

---

## Gaps Identified in Skills

| Missing Content | Recommended Location |
|-----------------|---------------------|
| Test coverage thresholds (80% services, 90% utils) | `pattern-testing` |
| Java `@Table` vs `@Entity` distinction | Already in `pattern-spring` |
| Loading pattern: `if (loading && !data)` | Already in `pattern-react-ui` |

The pattern skills are comprehensive. No major gaps exist.

---

## Action Items

1. [ ] Refactor `tech-standards.md` to slim version (~60 lines)
2. [ ] Verify all removed content exists in corresponding skills
3. [ ] Add test coverage thresholds to `pattern-testing` if missing
4. [ ] Update any agents that reference tech-standards for framework patterns

---

## File References

- `.claude/rules/tech-standards.md` — current (to be slimmed)
- `.claude/skills/pattern-nextjs/SKILL.md` — Next.js patterns
- `.claude/skills/pattern-react-ui/SKILL.md` — React UI patterns
- `.claude/skills/pattern-nestjs/SKILL.md` — NestJS patterns
- `.claude/skills/pattern-spring/SKILL.md` — Spring WebFlux patterns
- `.claude/skills/pattern-drizzle/SKILL.md` — Drizzle ORM patterns
- `.claude/skills/pattern-testing/SKILL.md` — Testing patterns
