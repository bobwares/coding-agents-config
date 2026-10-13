# coding-agents-config

Agentic pipeline configuration for Claude Code. Enforces a task/turn-based workflow with provenance tracking, branch protection, and governance rules, plus the App Factory (`af-*`) skills for spec-driven backend generation.

## Setup

### 1. Clone the repo

```sh
git clone <repo-url> ~/coding-agents-config
```

### 2. Create symlinks (automated)

Run the setup script — it creates symlinks in `~/.claude/` (skills, agents, hooks, scripts, CLAUDE.md, settings.json), `~/.codex/` (agents, AGENTS.md) and the repo-local `.claude/`, backing up any existing files:

```sh
bash scripts/setup.sh
```

<details>
<summary>Manual symlink commands</summary>

```sh
for name in skills agents hooks scripts CLAUDE.md settings.json; do
  ln -s ~/coding-agents-config/$name ~/.claude/$name
done
# Codex: agents and AGENTS.md go to ~/.codex/
```

If any of these already exist, back them up first (`mv <target> <target>.bak`).
</details>

### 3. Verify

```sh
ls -la ~/.claude/skills        # should point to ~/coding-agents-config/skills
ls -la ~/.claude/hooks         # should point to ~/coding-agents-config/hooks
ls -la ~/.claude/agents        # should point to ~/coding-agents-config/agents
ls -la ~/.claude/CLAUDE.md     # should point to ~/coding-agents-config/CLAUDE.md
ls -la ~/.claude/settings.json # should point to ~/coding-agents-config/settings.json
```

## Structure

```
coding-agents-config/
├── CLAUDE.md           # Global instructions — task/turn protocol, branch rules
├── AGENTS.md           # Agent loader directive
├── settings.json       # Claude Code settings (model, permissions, hooks)
├── agents/             # Subagent definitions (agent-architecture-planner)
├── hooks/
│   └── branch-guard.sh # Prevents writes on main/master
├── skills/             # Slash-command skills (see below)
├── scripts/
│   ├── setup.sh        # Symlink installer
│   └── af-state.sh     # AppFactory state.yaml helpers
├── .appfactory/        # Task/turn tracking, specs, prompts, memory
│   ├── tasks/          # task-XXX/ with turns/turn-XXX/
│   └── tasks_index.csv # Task registry
├── archive/            # Retired skills and the turn/task templates
└── docs/               # Reference documentation
```

## Execution Flow

Every coding prompt follows the task/turn protocol defined in `CLAUDE.md`:

1. **First prompt of the session** — run `/session-start`.
2. Check `git branch --show-current`.
   - On `main`/`master` — `/task-init` resolves the next task id, creates and switches to `task/TXXX`, and initializes `.appfactory/tasks/task-XXX/` with `turn-001`.
   - On `task/TXXX[-*]` — `/turn-init` initializes the next turn.
3. Execute the request (no code is written on `main`/`master`; `hooks/branch-guard.sh` enforces this).
4. Always run `/turn-end` afterwards, even on failure.
5. When the task is ready for review, run `/task-close` to push the branch and open a pull request.

A **task** is a branch-scoped unit of work that becomes one pull request; a **turn** is one AI execution cycle within it. Task ids are global and turn ids reset per task, both zero-padded to 3 digits.

### Artifacts

```
.appfactory/tasks/task-XXX/
├── task_context.md
├── task_status.json
├── task_summary.md
├── pull_request.md
└── turns/turn-XXX/
    ├── turn_context.md
    ├── execution_trace.json
    ├── adr.md
    └── manifest.json
```

Task creation appends a row to `.appfactory/tasks_index.csv`, updated as status changes. Commits use the format `AI Coding Agent Change:` followed by imperative bullets.

## Skills

### Pipeline

| Skill | Description |
|-------|-------------|
| `session-start` | Load repository state and core pipeline context |
| `task-init` | Create task branch plus task and turn-001 artifacts (from main/master) |
| `turn-init` | Initialize the next turn on a task branch |
| `turn-end` | Finalize the turn: ADR, manifest, trace, index, commit |
| `task-close` | Push the task branch and open a pull request |
| `branch-guard` | Create a turn-scoped branch if on main/master |

### App Factory (`af-*`)

| Skill | Description |
|-------|-------------|
| `af-orchestrator` | Orchestrate the App Factory SDLC |
| `af-project-init` | Initialize an AppFactory project |
| `af-memory` | Read/write pipeline state in `.appfactory/memory/state.yaml` |
| `af-be-prd-build` | Build a business-facing PRD |
| `af-be-ddd-build` | Generate a Domain-Driven Design document from a PRD |
| `af-be-ddd-analysis` | Analyze a DDD document |
| `af-be-ddd-refactor` | Refactor a DDD document from analysis findings |
| `af-be-ddd-tests` | Generate Gherkin BDD feature files from DDD and PRD |
| `af-be-ddd-dsl` | Generate a backend application DSL YAML from a DDD |
| `af-be-ddd-orchestrator` | Run the DDD build → analyze → refactor → test workflow |
| `af-be-plan` | Create a backend execution plan from a DSL and tech stack profile |
| `af-be-implementation` | Generate the backend from a tech stack implementation |
| `af-app-check` | Audit production readiness |

### Utilities

| Skill | Description |
|-------|-------------|
| `dsl-utils` | DSL model interpretation (`dsl-model-interpreter`) |
| `ui-utils` | UI implementation language |
| `unit-tests` | Test/implementation sync |
| `e2e-tests` | HTTP test artifacts |
| `eval-labeler` | Label model-response evaluation files |

### Meta-Skills (`.system`)

`skill-creator`, `skill-installer`, `plugin-creator`, `imagegen`, `openai-docs`.

## Templates

Turn/task templates (ADR, PR, manifest schema, metadata header, branch naming, commit message, tech stack) now live in `archive/templates/`.

## Hooks

| Hook | Trigger | Purpose |
|------|---------|---------|
| `branch-guard.sh` | PreToolUse(Bash) | Guard against writes on main/master |

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
