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

