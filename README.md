# coding-agents-config

Shared skills and agent definitions for Claude Code and Codex. Symlinked into `~/.claude/` and `~/.codex/` so every project gets access automatically.

## Setup

### 1. Clone the repo

```sh
git clone <repo-url> ~/coding-agents-config
```

### 2. Create symlinks (automated)

Run the setup script — it creates all symlinks and backs up any existing files:

```sh
bash scripts/setup.sh
```

Or use the `/config-init` skill from within Claude Code.

<details>
<summary>Manual symlink commands</summary>

```sh
# Claude Code
ln -s ~/coding-agents-config/skills ~/.claude/skills
ln -s ~/coding-agents-config/agents ~/.claude/agents
ln -s ~/coding-agents-config/rules ~/.claude/rules
ln -s ~/coding-agents-config/hooks ~/.claude/hooks
ln -s ~/coding-agents-config/templates ~/.claude/templates
ln -s ~/coding-agents-config/scripts ~/.claude/scripts
ln -s ~/coding-agents-config/CLAUDE.md ~/.claude/CLAUDE.md
ln -s ~/coding-agents-config/settings.json ~/.claude/settings.json

# Codex
mkdir -p ~/.codex
ln -s ~/coding-agents-config/agents ~/.codex/agents
```

If any of these already exist, back them up first (`mv <target> <target>.bak`).
</details>

### 3. Verify

```sh
ls -la ~/.claude/skills       # should point to ~/coding-agents-config/skills
ls -la ~/.claude/agents       # should point to ~/coding-agents-config/agents
ls -la ~/.claude/rules        # should point to ~/coding-agents-config/rules
ls -la ~/.claude/hooks        # should point to ~/coding-agents-config/hooks
ls -la ~/.claude/templates    # should point to ~/coding-agents-config/templates
ls -la ~/.claude/scripts      # should point to ~/coding-agents-config/scripts
ls -la ~/.claude/CLAUDE.md    # should point to ~/coding-agents-config/CLAUDE.md
ls -la ~/.claude/settings.json # should point to ~/coding-agents-config/settings.json
ls -la ~/.codex/agents        # should point to ~/coding-agents-config/agents
```

Open any project with Claude Code or Codex — the skills and agents are now available globally.

## Structure

```
coding-agents-config/
├── CLAUDE.md        # Global instructions for all projects
├── settings.json    # Claude Code settings (model, permissions, etc.)
├── rules/           # Contextual rules loaded into every session
│   ├── agent-coordination.md
│   ├── branch-operations.md
│   └── tech-standards.md
├── hooks/           # Shell hooks triggered by Claude Code events
│   ├── audit-log.sh
│   ├── skill-eval.js
│   ├── skill-eval.sh
│   ├── skill-rules.json
│   └── turn-init.sh
├── skills/          # Slash-command skills (each in its own directory)
│   ├── .system/     # Meta-skills (skill-creator, skill-installer)
│   ├── analyze/
│   ├── git-*/       # Git workflow skills
│   ├── pattern-*/   # Framework pattern libraries
│   ├── project-*/   # Project scaffolding & execution
│   ├── spec-*/      # Spec planning & task management
│   └── ...
├── agents/          # Subagent definitions (markdown files)
│   ├── agent-orchestrator.md
│   ├── agent-code-reviewer.md
│   ├── agent-test-writer.md
│   └── ...
├── scripts/         # Automation scripts (setup.sh, project-execute-preflight.sh)
├── templates/       # Turn lifecycle templates
└── docs/            # Reference documentation and analysis
```

## Skills (42)

| Category | Skills |
|---|---|
| **Git** | `git-checkpoint`, `git-commit-push-pr`, `git-quick-commit`, `git-rollback`, `git-status`, `git-undo`, `github-issue` |
| **Patterns** | `pattern-api-design`, `pattern-drizzle`, `pattern-nestjs`, `pattern-nextjs`, `pattern-react-ui`, `pattern-shadcn`, `pattern-spring`, `pattern-testing`, `pattern-vercel-ai` |
| **Project** | `project-create-plan`, `project-execute`, `project-init`, `project-plan` |
| **Specs** | `spec-epic-start`, `spec-parse-ddd`, `spec-planning`, `spec-prd-list`, `spec-prd-new`, `spec-prd-parse`, `spec-task-next` |
| **Governance** | `governance`, `governance-adr` |
| **Session** | `session-start`, `session-end`, `session-context-size` |
| **Quality** | `verify-all`, `test-and-fix`, `security-scan` |
| **Debug** | `systematic-debugging`, `diagnose-issue` |
| **Setup** | `config-init` |
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
