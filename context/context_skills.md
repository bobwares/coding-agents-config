# Context: Skills — Available Capabilities

## Workflow Skills (invoke manually)

| Command | Description |
|---------|-------------|
| `/session-start` | Initialize session, load context, resolve TURN_ID |
| `/session-end` | Wrap up session, update memory |
| `/governance` | Full metadata, versioning, git standards |
| `/governance-adr` | ADR policy and format |
| `/project-execute` | One-command: PRD + DDD + stack → working app |
| `/project-init` | Scaffold monorepo |
| `/spec-prd-new` | Start a new PRD |
| `/spec-prd-parse` | Generate epics from PRD |
| `/spec-epic-start` | Launch epic execution |
| `/spec-task-next` | Advance to next task |
| `/ddd-parse` | Parse DDD doc into model.json |
| `/verify-all` | typecheck + lint + test + build |
| `/test-and-fix` | Run tests, auto-fix failures |
| `/security-scan` | OWASP security review |
| `/git-commit-push-pr` | Commit + push + open PR |
| `/git-quick-commit` | Fast checkpoint commit |
| `/git-checkpoint` | Save state |
| `/git-rollback` | Rollback to checkpoint |
| `/git-undo` | Undo last commit |
| `/context-prime` | Load full project context |
| `/fix-issue` | Fix a specific issue |
| `/memory-init` | Initialize memory bank |

## Domain Skills (auto-activated by directory)

| Directory | Skill |
|-----------|-------|
| `apps/web/app` | nextjs-patterns |
| `apps/api/src/modules` | nestjs-patterns |
| `services/enterprise/src` | spring-patterns |
| `packages/database/src/schema` | drizzle-patterns |
| `packages/ui/src/components` | shadcn-patterns |
| `apps/web/src/ai` | vercel-ai-patterns |
| `*.test.ts`, `*.spec.ts` | testing-patterns |

## Always-Active Skills

`/governance` and `/governance-adr` apply globally.
They are called automatically by CLAUDE.md at the appropriate turn steps.
