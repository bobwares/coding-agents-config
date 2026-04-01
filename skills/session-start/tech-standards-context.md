# Tech Standards

Non-negotiable standards for all agents.

## TypeScript (All Projects)

- `"strict": true` in all `tsconfig.json` files
- No `any` — use `unknown` plus type guards
- No `// @ts-ignore` without explanatory comment
- Interfaces for object shapes; types for unions, intersections, and mapped types
- Explicit return types on all exported functions
- Types derived from source where possible: `typeof table.$inferSelect`, `z.infer<typeof schema>`

## Security (All Layers)

- No secrets or credentials in source code — use environment variables
- `.env*` files are gitignored and never committed
- Validate user input at every entry point
- Authorization checked in service layer, not only route-level guard
- Parameterized queries always
