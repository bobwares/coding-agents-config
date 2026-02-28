# coding-agents-config

Shared skills and agent definitions for Claude Code. Symlinked into `~/.claude/` so every project gets access automatically.

## Setup

### 1. Clone the repo

```sh
git clone <repo-url> ~/coding-agents-config
```

### 2. Create symlinks

```sh
ln -s ~/coding-agents-config/skills ~/.claude/skills
ln -s ~/coding-agents-config/agents ~/.claude/agents
```

If `~/.claude/skills` or `~/.claude/agents` already exist, back them up or remove them first:

```sh
mv ~/.claude/skills ~/.claude/skills.bak
mv ~/.claude/agents ~/.claude/agents.bak
```

### 3. Verify

```sh
ls -la ~/.claude/skills  # should point to ~/coding-agents-config/skills
ls -la ~/.claude/agents  # should point to ~/coding-agents-config/agents
```

Open any project with Claude Code — the skills and agents are now available globally.

## Structure

```
coding-agents-config/
├── skills/          # Slash-command skills (each in its own directory)
│   ├── .system/     # Meta-skills (skill-creator, skill-installer)
│   ├── analyze/
│   ├── git-*/       # Git workflow skills
│   ├── pattern-*/   # Framework pattern libraries
│   ├── project-*/   # Project scaffolding & execution
│   ├── spec-*/      # Spec planning & task management
│   └── ...
└── agents/          # Subagent definitions (markdown files)
    ├── agent-orchestrator.md
    ├── agent-code-reviewer.md
    ├── agent-test-writer.md
    └── ...
```

## Skills (40)

| Category | Skills |
|---|---|
| **Git** | `git-checkpoint`, `git-commit-push-pr`, `git-quick-commit`, `git-rollback`, `git-status`, `git-undo`, `github-issue` |
| **Patterns** | `pattern-api-design`, `pattern-drizzle`, `pattern-nestjs`, `pattern-nextjs`, `pattern-react-ui`, `pattern-shadcn`, `pattern-spring`, `pattern-testing`, `pattern-vercel-ai` |
| **Project** | `project-create-plan`, `project-execute`, `project-init` |
| **Specs** | `spec-epic-start`, `spec-parse-ddd`, `spec-planning`, `spec-prd-list`, `spec-prd-new`, `spec-prd-parse`, `spec-task-next` |
| **Governance** | `governance`, `governance-adr` |
| **Session** | `session-start`, `session-end`, `session-context-size` |
| **Quality** | `verify-all`, `test-and-fix`, `security-scan` |
| **Debug** | `systematic-debugging`, `diagnose-issue` |
| **Other** | `analyze`, `makefile-gen`, `mode`, `recreation.gov` |

## Agents (13)

| Agent | Role |
|---|---|
| `orchestrator` | Master coordinator for multi-step tasks |
| `code-reviewer` | Senior engineer code review |
| `code-architect` | System design and architecture |
| `test-writer` | TDD specialist (Vitest, JUnit 5, Playwright) |
| `verify-app` | Full quality gate (typecheck, lint, test, build) |
| `git-guardian` | Git workflow (commits, push, PRs) |
| `security-auditor` | OWASP Top 10 and secrets scanning |
| `doc-generator` | JSDoc, README, OpenAPI, CHANGELOG |
| `ai-engineer` | Vercel AI SDK integration |
| `nextjs-engineer` | Next.js 15 App Router specialist |
| `nestjs-engineer` | NestJS modules, controllers, services |
| `spring-engineer` | Spring WebFlux + R2DBC reactive APIs |
| `drizzle-dba` | Drizzle ORM + PostgreSQL schemas and queries |

## Adding a new skill

Each skill lives in its own directory under `skills/` with a `SKILL.md` file:

```
skills/my-skill/
└── SKILL.md
```

The `.system/skill-creator` meta-skill can guide you through creating one — invoke it from Claude Code.

## Syncing across machines

Since this is a standard git repo, pull on any machine to stay current:

```sh
cd ~/coding-agents-config && git pull
```

The symlinks mean changes are picked up immediately — no reinstall needed.
