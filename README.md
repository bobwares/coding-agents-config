# coding-agents-config

Agentic pipeline configuration for Claude Code. Enforces turn-based workflow with provenance tracking, branch protection, and governance rules, plus the App Factory (`af-*`) skill set for DDD-driven backend generation.

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
ln -s ~/coding-agents-config/skills ~/.claude/skills
ln -s ~/coding-agents-config/agents ~/.claude/agents
ln -s ~/coding-agents-config/hooks ~/.claude/hooks
ln -s ~/coding-agents-config/scripts ~/.claude/scripts
ln -s ~/coding-agents-config/CLAUDE.md ~/.claude/CLAUDE.md
ln -s ~/coding-agents-config/settings.json ~/.claude/settings.json

# Into ~/.codex/
ln -s ~/coding-agents-config/agents ~/.codex/agents
ln -s ~/coding-agents-config/AGENTS.md ~/.codex/AGENTS.md

# Repo-local
ln -s ~/coding-agents-config/CLAUDE.md ~/coding-agents-config/.claude/CLAUDE.md
```

If any of these already exist, back them up first (`mv <target> <target>.bak`). `scripts/setup.sh` also
attempts to link `rules/`, `context/`, and `plugins/` into `~/.claude/` — these directories don't exist in
the repo yet, so those links are currently dangling until the directories are added.
</details>

### 3. Verify

```sh
ls -la ~/.claude/skills        # should point to ~/coding-agents-config/skills
ls -la ~/.claude/agents        # should point to ~/coding-agents-config/agents
ls -la ~/.claude/hooks         # should point to ~/coding-agents-config/hooks
ls -la ~/.claude/CLAUDE.md     # should point to ~/coding-agents-config/CLAUDE.md
ls -la ~/.claude/settings.json # should point to ~/coding-agents-config/settings.json
```

## Structure

```
coding-agents-config/
├── CLAUDE.md           # Global instructions — turn/task protocol, branch rules
├── AGENTS.md           # Codex agent loader directive
├── settings.json       # Claude Code settings (model, permissions, hooks, plugins)
├── package.json        # Node dependency manifest (e.g. caveman plugin)
├── hooks/              # Shell hooks triggered by Claude Code events
│   └── branch-guard.sh # PreToolUse hook — auto-creates a task branch when on main/master
├── agents/              # Subagent definitions
│   └── agent-architecture-planner.md
├── skills/              # Slash-command skills
│   ├── session-start/       # Load repo state + pipeline context (run every session)
│   ├── task-init/           # Create a new task branch + turn-001 artifacts
│   ├── turn-init/           # Create the next turn directory + artifacts
│   ├── turn-end/            # Finalize a turn (ADR, manifest, commit)
│   ├── task-close/          # Finalize a task, push, and open a PR
│   ├── branch-guard/        # Legacy hook-driven branch guard
│   ├── af-orchestrator/     # Orchestrates the App Factory SDLC
│   ├── af-project-init/     # Initialize an App Factory project
│   ├── af-app-check/        # Production-readiness audit
│   ├── af-memory/           # CRUD for .appfactory/memory/state.yaml
│   ├── af-be-prd-build/     # Build a backend PRD from an intake worksheet
│   ├── af-be-ddd-build/     # Generate a backend DDD document from a PRD
│   ├── af-be-ddd-analysis/  # Audit a DDD document for gaps/risks
│   ├── af-be-ddd-refactor/  # Patch a DDD document from analysis findings
│   ├── af-be-ddd-tests/     # Generate Gherkin BDD scenarios from DDD + PRD
│   ├── af-be-ddd-orchestrator/ # Runs the DDD build/analyze/refactor/test loop
│   ├── af-be-ddd-dsl/       # Generate a backend DSL YAML from a DDD document
│   ├── af-be-plan/          # Generate a backend execution plan from DSL + tech stack
│   ├── af-be-implementation/ # Execute backend code generation from the plan
│   ├── dsl-utils/dsl-model-interpreter/     # Parse and validate app-dsl YAML
│   ├── ui-utils/ui-implementation-language/ # Declarative UI YAML language
│   ├── unit-tests/test-implementation-sync/ # Keep unit tests aligned with implementation
│   ├── e2e-tests/http-test-artifacts/       # Generate .http request files
│   └── eval-labeler/        # Label/compare model responses for coding evals
├── scripts/             # Automation scripts
│   ├── setup.sh         # Creates the symlinks described above
│   └── af-state.sh      # Helpers for reading/writing .appfactory/memory/state.yaml
├── .appfactory/         # Task/turn tracking and App Factory state
│   ├── tasks/           # task-XXX/ directories with turn-XXX/ subdirectories
│   ├── tasks_index.csv  # Registry of all tasks
│   ├── specs/           # Specifications
│   ├── prompts/         # Prompt drafts and notes
│   ├── memory/          # App Factory pipeline state (state.yaml)
│   └── changelog.md
├── docs/                # Reference documentation (App Factory design notes, migration analysis)
├── archive/             # Superseded skill library kept for reference
└── .github/             # Issue and PR templates
```

## Execution Flow

The agentic pipeline enforces a strict task/turn workflow for all coding tasks:

1. **First prompt of a session** → invoke `session-start`: loads `git branch`/`status`/`log` and the core
   pipeline context docs.
2. **Every coding prompt** → run `git branch --show-current`.
3. **On `main`/`master`** → invoke `task-init`: resolves the next zero-padded task id (`001`, `002`, ...),
   creates and checks out `task/TXXX`, and initializes `task-XXX/` plus `turn-001`.
4. **On `task/TXXX` (or `task/TXXX-*`)** → invoke `turn-init`: resolves and initializes the next turn id
   inside the active task.
5. **Execute** the user's request.
6. **Always** invoke `turn-end`, even on failure — it finalizes `turn_context.md`, writes `adr.md`, writes
   `manifest.json`, updates `execution_trace.json`, and commits any uncommitted changes.
7. **When the task is ready for review** → invoke `task-close`: finalizes task-level artifacts, pushes the
   branch, and opens a pull request against `main`.

`hooks/branch-guard.sh` is a `PreToolUse` safety net registered in `settings.json`: if a `Bash` tool call
is about to run while still on `main`/`master`, it auto-creates and switches to the next `task/TXXX` branch
before the command executes.

### Task/Turn Protocol Summary

| Phase | Trigger | Outputs |
|-------|---------|---------|
| **Session Start** | First prompt of session | Git state + context loaded |
| **Task Init** | Branch is `main`/`master` | `task/TXXX` branch, `task-XXX/` + `turn-001` artifacts |
| **Turn Init** | Already on `task/TXXX` | Next `turn-XXX/` directory + `turn_context.md`, `execution_trace.json` |
| **Execution** | Every prompt | Modified files |
| **Turn End** | After every prompt, always | `adr.md`, `manifest.json`, updated context/trace, commit |
| **Task Close** | User signals task is done | Updated `task_status.json`/`task_summary.md`/`pull_request.md`, pushed branch, PR |

## Skills (24)

| Category | Skill | Description |
|----------|-------|-------------|
| **Pipeline** | `session-start` | Load repository state and core pipeline context |
| | `task-init` | Initialize a new task branch and create task + turn-001 artifacts |
| | `turn-init` | Initialize the next turn within the active task branch |
| | `turn-end` | Finalize the active turn after execution |
| | `task-close` | Finalize the active task branch, push it, and open a PR against main |
| | `branch-guard` | Create a turn-scoped branch if on main/master (legacy, hook-driven) |
| **App Factory — Orchestration** | `af-orchestrator` | Orchestrate the App Factory Software Development Lifecycle |
| | `af-project-init` | Export required environment variables and initialize an App Factory project |
| | `af-app-check` | Audit an application for production readiness |
| | `af-memory` | CRUD operations for `.appfactory/memory/state.yaml` |
| **App Factory — Backend DDD** | `af-be-prd-build` | Build a backend-focused PRD from an intake worksheet |
| | `af-be-ddd-build` | Generate a backend DDD document from an approved PRD |
| | `af-be-ddd-analysis` | Audit a generated DDD document for quality and gaps |
| | `af-be-ddd-refactor` | Patch a DDD document using `af-be-ddd-analysis` findings |
| | `af-be-ddd-tests` | Generate Gherkin BDD scenarios from DDD + PRD |
| | `af-be-ddd-orchestrator` | Orchestrate the DDD build/analyze/refactor/test loop |
| **App Factory — Backend Codegen** | `af-be-ddd-dsl` | Generate a backend DSL YAML from a DDD document |
| | `af-be-plan` | Generate a backend execution plan from a DSL + tech stack profile |
| | `af-be-implementation` | Execute backend code generation from the plan and BDD specs |
| **Utilities** | `dsl-utils/dsl-model-interpreter` | Parse and validate app-dsl YAML specifications |
| | `ui-utils/ui-implementation-language` | Declarative YAML language for UI pages/widgets/forms |
| | `unit-tests/test-implementation-sync` | Keep generated unit tests aligned with implementations |
| | `e2e-tests/http-test-artifacts` | Generate `.http` request files for API endpoint testing |
| | `eval-labeler` | Label and compare model responses for coding evals |

## Agents

| Agent | Purpose |
|-------|---------|
| `agent-architecture-planner.md` | Subagent definition for architecture planning tasks |

## Hooks

| Hook | Trigger | Purpose |
|------|---------|---------|
| `branch-guard.sh` | `PreToolUse(Bash)` | Auto-create/switch to the next `task/TXXX` branch when on main/master |

## Adding a new skill

Each skill lives in its own directory under `skills/` with a `SKILL.md` file:

```
skills/my-skill/
└── SKILL.md
```

## Syncing across machines

Since this is a standard git repo, pull on any machine to stay current:

```sh
cd ~/coding-agents-config && git pull
```

The symlinks mean changes are picked up immediately — no reinstall needed.
