# coding-agents-config

Agentic pipeline configuration for Claude Code and Codex. Enforces a task/turn-based workflow with provenance tracking, branch protection, and governance rules, plus the "App Factory" library of skills for spec-driven application generation.

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

It links `skills/`, `agents/`, `hooks/`, `scripts/`, `CLAUDE.md`, and `settings.json` into `~/.claude/`, links `agents/` and `AGENTS.md` into `~/.codex/`, and links `CLAUDE.md` into a repo-local `./.claude/`. See `scripts/setup.sh` for the exact, current target list.

### 3. Verify

```sh
ls -la ~/.claude/skills        # should point to ~/coding-agents-config/skills
ls -la ~/.claude/hooks         # should point to ~/coding-agents-config/hooks
ls -la ~/.claude/CLAUDE.md     # should point to ~/coding-agents-config/CLAUDE.md
ls -la ~/.claude/settings.json # should point to ~/coding-agents-config/settings.json
```

## Structure

```
coding-agents-config/
├── CLAUDE.md           # Global instructions — task/turn protocol, branch rules (source of truth)
├── AGENTS.md           # Codex loader directive — points at ~/.claude/CLAUDE.md
├── settings.json       # Claude Code settings (model, permissions, hooks, plugins)
├── hooks/              # Shell hooks triggered by Claude Code events
│   └── branch-guard.sh # Auto-creates a task branch when a tool runs on main/master
├── agents/             # Standalone agent definitions
│   └── agent-architecture-planner.md
├── skills/             # Slash-command skills (see below)
│   └── .system/        # Bundled Codex system skills (imagegen, skill-creator, ...) — synced, not authored here
├── scripts/            # Automation and shared shell libraries
│   ├── setup.sh         # Creates the symlinks above
│   └── af-state.sh      # Shared helpers for reading/writing .appfactory/memory/state.yaml
├── .appfactory/         # Task/turn tracking, specs, prompts, and memory for THIS repo
│   ├── tasks/            # task-XXX/ directories, each with turns/turn-XXX/
│   ├── tasks_index.csv   # Registry of tasks and their status
│   ├── specs/
│   ├── prompts/
│   ├── memory/
│   └── changelog.md      # Human-readable summary of past turns
├── docs/                # Reference docs (App Factory plan, migration analyses, skill summary)
├── archive/             # Superseded skills and templates kept for reference/history
└── .github/             # Issue templates and PR template
```

## Task / Turn Lifecycle

The full protocol — including the mandatory skill invocation order, the hard gate against writing on `main`/`master`, required task and turn artifacts, registries, and commit message format — is defined in [`CLAUDE.md`](./CLAUDE.md). Treat that file as the single source of truth; this README only summarizes it.

In short:

1. **First prompt of a session** → `session-start` loads git state and pipeline context.
2. **On `main`/`master`** → `task-init` allocates the next `task/TXXX` branch and scaffolds `task-XXX` + `turn-001`.
3. **On a `task/TXXX(-*)` branch** → `turn-init` scaffolds the next `turn-XXX` inside the active task.
4. Execute the request.
5. **Always** → `turn-end` finalizes the turn's artifacts (`turn_context.md`, `execution_trace.json`, `adr.md`, `manifest.json`), even on failure.
6. **When the user says the task is ready for review** → `task-close` finalizes task-level artifacts, pushes the branch, and opens a pull request against `main`.

`branch-guard` (skill and matching `hooks/branch-guard.sh` PreToolUse hook) is a backstop that auto-creates a branch if code is about to be written directly on `main`/`master`.

## Skills

### Lifecycle (task/turn protocol)

| Skill | Description |
|-------|-------------|
| `session-start` | Load repository state and core pipeline context. Runs at the start of every session. |
| `task-init` | Initialize a new task branch (`task/TXXX`) and create task + `turn-001` artifacts. Runs when on `main`/`master`. |
| `turn-init` | Initialize the next turn within the active task branch. Runs when already on a task branch. |
| `turn-end` | Finalize the active turn after execution (context, ADR, manifest). Runs after every coding prompt. |
| `task-close` | Finalize the active task branch, push it, and open a pull request against `main`. |
| `branch-guard` | Check the current git branch and create a turn-scoped branch if on `main`/`master`. |

### App Factory (backend SDLC pipeline)

| Skill | Description |
|-------|-------------|
| `af-orchestrator` | Orchestrates the full App Factory software development lifecycle. |
| `af-project-init` | Exports required environment variables and initializes an App Factory project. |
| `af-be-prd-build` | Builds a business-facing backend PRD from an intake worksheet or discovery notes. |
| `af-be-ddd-orchestrator` | Orchestrates the backend Domain-Driven Design workflow (build → analyze → refactor → test). |
| `af-be-ddd-build` | Generates a human-readable backend DDD document from an approved PRD. |
| `af-be-ddd-analysis` | Analyzes a DDD specification for quality, completeness, and PRD alignment. |
| `af-be-ddd-refactor` | Refactors a DDD document based on analysis findings. |
| `af-be-ddd-tests` | Generates Gherkin-style BDD scenarios from DDD and PRD specifications. |
| `af-be-plan` | Generates a backend execution plan from a domain DSL and tech stack profile. |
| `af-be-ddd-dsl` | Generates a backend DSL YAML document from a DDD document. |
| `af-be-implementation` | Executes backend code generation from the execution plan and BDD specs into a target project. |
| `af-app-check` | Audits an application for production readiness (security, database, deployment, quality). |
| `af-memory` | CRUD operations against `.appfactory/memory/state.yaml` for pipeline state tracking. |

See `docs/skill-summary.md` for the full phase-by-phase App Factory pipeline table.

### Utility / nested skills

| Skill | Description |
|-------|-------------|
| `dsl-utils/dsl-model-interpreter` | Parse and validate `app-dsl` YAML specifications before code generation. |
| `e2e-tests/http-test-artifacts` | Generate `.http` request files for REST endpoint testing. |
| `ui-utils/ui-implementation-language` | Declarative YAML standard for describing UI pages, widgets, and forms. |
| `unit-tests/test-implementation-sync` | Keep generated unit tests synchronized with their target implementations. |
| `eval-labeler` | Process `Eval.md` files to label and compare two model responses on coding tasks. |

### `.system/` (bundled, not repo-authored)

`skills/.system/` (`imagegen`, `openai-docs`, `plugin-creator`, `skill-creator`, `skill-installer`) is synced in from Codex's built-in system skills (see `.codex-system-skills.marker`) rather than authored in this repo. `skill-creator` is the recommended way to scaffold a new skill.

## Archive

`archive/` holds skills and templates from earlier iterations of the pipeline (e.g. `app-from-dsl`, `nestjs-crud-resource`, `prisma-persistence`, `react-form-page`, `templates`, `legacy-turns`) that have since been superseded but are kept for reference. See `archive/README.md` for the original skill taxonomy.

## Hooks

| Hook | Trigger | Purpose |
|------|---------|---------|
| `branch-guard.sh` | `PreToolUse` (Bash) | Auto-creates a task branch instead of allowing writes directly on `main`/`master`. |

## Scripts

| Script | Purpose |
|--------|---------|
| `setup.sh` | Creates the `~/.claude`, `~/.codex`, and repo-local `./.claude` symlinks. |
| `af-state.sh` | Shared shell helpers for reading/writing `.appfactory/memory/state.yaml`, sourced by `af-*` skills. |

## Adding a new skill

Each skill lives in its own directory under `skills/` with a `SKILL.md` file:

```
skills/my-skill/
└── SKILL.md
```

The `skills/.system/skill-creator` meta-skill can guide you through creating one — invoke it from Claude Code.

## Syncing across machines

Since this is a standard git repo, pull on any machine to stay current:

```sh
cd ~/coding-agents-config && git pull
```

The symlinks mean changes are picked up immediately — no reinstall needed.
