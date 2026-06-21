# coding-agents-config

Agentic pipeline configuration for Claude Code (and Codex). Enforces a task/turn-based workflow with provenance tracking, branch protection, and governance rules, plus a library of AppFactory (`af-*`) skills for spec-driven application generation.

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

<details>
<summary>Manual symlink commands</summary>

```sh
# Into ~/.claude/
ln -s ~/coding-agents-config/skills    ~/.claude/skills
ln -s ~/coding-agents-config/agents    ~/.claude/agents
ln -s ~/coding-agents-config/hooks     ~/.claude/hooks
ln -s ~/coding-agents-config/scripts   ~/.claude/scripts
ln -s ~/coding-agents-config/CLAUDE.md ~/.claude/CLAUDE.md
ln -s ~/coding-agents-config/settings.json ~/.claude/settings.json

# Into ~/.codex/
ln -s ~/coding-agents-config/agents    ~/.codex/agents
ln -s ~/coding-agents-config/AGENTS.md ~/.codex/AGENTS.md

# Repo-local
ln -s ~/coding-agents-config/CLAUDE.md ~/coding-agents-config/.claude/CLAUDE.md
```

If any of these already exist, back them up first (`mv <target> <target>.bak`). `scripts/setup.sh` also attempts to link `rules/`, `context/`, and `plugins/` into `~/.claude/` for future use, even though those directories don't exist in this repo yet.
</details>

### 3. Verify

```sh
ls -la ~/.claude/skills        # should point to ~/coding-agents-config/skills
ls -la ~/.claude/hooks         # should point to ~/coding-agents-config/hooks
ls -la ~/.claude/CLAUDE.md     # should point to ~/coding-agents-config/CLAUDE.md
ls -la ~/.claude/settings.json # should point to ~/coding-agents-config/settings.json
ls -la ~/.codex/AGENTS.md      # should point to ~/coding-agents-config/AGENTS.md
```

## Structure

```
coding-agents-config/
├── CLAUDE.md           # Global instructions — task/turn protocol, branch rules
├── AGENTS.md           # Codex loader directive (points at ~/.claude/CLAUDE.md)
├── settings.json        # Claude Code settings (model, permissions, hooks, plugins)
├── package.json         # npm dependency on the `caveman` plugin
├── hooks/               # Shell hooks triggered by Claude Code events
│   └── branch-guard.sh  # PreToolUse hook — auto-creates a task branch if on main/master
├── scripts/              # Repo-level automation
│   ├── setup.sh          # Creates the ~/.claude and ~/.codex symlinks
│   └── af-state.sh       # Helpers for reading/writing .appfactory/memory/state.yaml
├── agents/               # Standalone agent definitions
│   └── agent-architecture-planner.md
├── skills/                # Slash-command skills (see tables below)
│   ├── session-start/, task-init/, turn-init/, branch-guard/, turn-end/, task-close/
│   ├── af-orchestrator/, af-memory/, af-project-init/, af-app-check/
│   ├── af-be-prd-build/, af-be-ddd-build/, af-be-ddd-dsl/, af-be-ddd-analysis/,
│   │   af-be-ddd-refactor/, af-be-ddd-tests/, af-be-ddd-orchestrator/,
│   │   af-be-plan/, af-be-implementation/
│   └── dsl-utils/, e2e-tests/, ui-utils/, unit-tests/, eval-labeler/
├── .appfactory/           # Task/turn tracking and pipeline state
│   ├── tasks/              # task-XXX directories with turns/
│   ├── tasks_index.csv     # Registry of all tasks
│   ├── specs/, prompts/, memory/
│   └── changelog.md        # Reconstructed history of past turns
├── .github/                # Issue/PR templates
├── archive/                # Retired skills and templates kept for reference
└── docs/                   # Reference and migration documentation
```

## Task/Turn Workflow

`CLAUDE.md` enforces this protocol for every coding prompt:

1. **First prompt of a session** → run `session-start` to load git state and pipeline context docs (`adr-context.md`, `governance-context.md`, `tech-standards-context.md`, `turn-tracking-context.md`).
2. **On `main`/`master`** → run `task-init`, which resolves the next zero-padded task id, creates `task/TXXX`, and scaffolds `.appfactory/tasks/task-XXX/` plus `turn-001`.
3. **On a `task/TXXX` branch** → run `turn-init` to scaffold the next turn directory and its initial artifacts.
4. **Execute the user's request.**
5. **Always** run `turn-end` to finalize the turn — updates `turn_context.md`, writes `adr.md` and `manifest.json`.
6. **When the task is ready for review** → run `task-close`, which updates task-level artifacts, commits, pushes the branch, and opens a PR against `main`.

`hooks/branch-guard.sh` backs this up at the tool level: a `PreToolUse(Bash)` hook that auto-creates a `task/TXXX` branch if a write/bash tool is invoked while on `main` or `master`.

### Required artifacts

| Scope | Files | Location |
|-------|-------|----------|
| Task | `task_context.md`, `task_status.json`, `task_summary.md`, `pull_request.md` | `.appfactory/tasks/task-XXX/` |
| Turn | `turn_context.md`, `execution_trace.json`, `adr.md`, `manifest.json` | `.appfactory/tasks/task-XXX/turns/turn-XXX/` |

## Skills

### Lifecycle (task/turn protocol)

| Skill | Description |
|-------|-------------|
| `session-start` | Load repository state and core pipeline context. Run at the start of every session. |
| `task-init` | Initialize a new task branch and create task plus turn-001 artifacts. Run when on `main`/`master`. |
| `turn-init` | Initialize the next turn within the active task branch. |
| `branch-guard` | Create a turn/task branch if currently on `main` or `master`. |
| `turn-end` | Finalize the active turn after execution, even on failure. |
| `task-close` | Finalize the active task branch, push it, and open a pull request against `main`. |

### AppFactory (`af-*`) — spec-driven backend generation

| Skill | Description |
|-------|-------------|
| `af-orchestrator` | Orchestrates the App Factory software development lifecycle end-to-end. |
| `af-project-init` | Exports required environment variables and bootstraps a new AppFactory project. |
| `af-memory` | CRUD operations for `.appfactory/memory/state.yaml` pipeline state. |
| `af-app-check` | Audits an application for production readiness (security, database, deployment, code quality). |
| `af-be-prd-build` | Builds a business-facing backend PRD from an intake worksheet or discovery notes. |
| `af-be-ddd-build` | Generates a backend Domain-Driven Design document from an approved PRD. |
| `af-be-ddd-analysis` | Audits a generated DDD spec for quality, completeness, and PRD alignment. |
| `af-be-ddd-refactor` | Applies targeted patches to a DDD spec using `af-be-ddd-analysis` findings. |
| `af-be-ddd-dsl` | Generates a backend application DSL YAML from a DDD document. |
| `af-be-ddd-tests` | Generates Gherkin BDD feature files from DDD and PRD specs. |
| `af-be-ddd-orchestrator` | Orchestrates the DDD build → analyze → refactor → test loop. |
| `af-be-plan` | Generates a step-by-step backend execution plan from a domain DSL and tech-stack profile. |
| `af-be-implementation` | Executes backend code generation from the execution plan and BDD specs into the target project. |

### Utility

| Skill | Description |
|-------|-------------|
| `dsl-utils/dsl-model-interpreter` | Parses and validates `app-dsl` YAML specifications before code generation. |
| `e2e-tests/http-test-artifacts` | Generates `.http` request files for REST endpoint testing. |
| `ui-utils/ui-implementation-language` | Declarative YAML standard for framework-neutral UI page/widget definitions. |
| `unit-tests/test-implementation-sync` | Keeps unit tests synchronized with actual service/DTO implementations. |
| `eval-labeler` | Processes `Eval.md` files to label and compare model responses for coding tasks. |

Each skill lives in its own directory under `skills/` with a `SKILL.md` file (and, where needed, `templates/` or `scripts/` subdirectories):

```
skills/my-skill/
├── SKILL.md
├── templates/
└── scripts/
```

## Hooks

| Hook | Trigger | Purpose |
|------|---------|---------|
| `branch-guard.sh` | `PreToolUse(Bash)` | Auto-creates `task/TXXX` if a write/bash tool runs while on `main`/`master`. |

## Settings

`settings.json` configures the default model, Bash/Read permission allow/deny/ask lists, the `branch-guard.sh` `PreToolUse` hook, voice mode, and enabled plugins/marketplaces (`anthropic-agent-skills`, `caveman`).

## Syncing across machines

Since this is a standard git repo, pull on any machine to stay current:

```sh
cd ~/coding-agents-config && git pull
```

The symlinks mean changes are picked up immediately — no reinstall needed.
