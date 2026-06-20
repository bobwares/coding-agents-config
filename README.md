# coding-agents-config

Agentic pipeline configuration for Claude Code. Enforces turn-based workflow with provenance tracking, branch protection, and governance rules.

## Setup

### 1. Clone the repo

```sh
git clone <repo-url> ~/coding-agents-config
```

### 2. Create symlinks (automated)

Run the setup script — it creates all symlinks (for both `~/.claude/` and `~/.codex/`) and backs up any existing files:

```sh
bash scripts/setup.sh
```

<details>
<summary>Manual symlink commands</summary>

```sh
# ~/.claude/
ln -s ~/coding-agents-config/skills       ~/.claude/skills
ln -s ~/coding-agents-config/agents       ~/.claude/agents
ln -s ~/coding-agents-config/hooks        ~/.claude/hooks
ln -s ~/coding-agents-config/scripts      ~/.claude/scripts
ln -s ~/coding-agents-config/CLAUDE.md    ~/.claude/CLAUDE.md
ln -s ~/coding-agents-config/settings.json ~/.claude/settings.json

# ~/.codex/
ln -s ~/coding-agents-config/agents   ~/.codex/agents
ln -s ~/coding-agents-config/AGENTS.md ~/.codex/AGENTS.md

# repo-local ./.claude/
ln -s ~/coding-agents-config/CLAUDE.md ./.claude/CLAUDE.md
```

`scripts/setup.sh` also links `rules/`, `context/`, and `plugins/` into `~/.claude/` if those directories exist — they are reserved for future use and not part of this repo yet. If any target already exists, back it up first (`mv <target> <target>.bak`).
</details>

### 3. Verify

```sh
ls -la ~/.claude/skills        # should point to ~/coding-agents-config/skills
ls -la ~/.claude/agents        # should point to ~/coding-agents-config/agents
ls -la ~/.claude/hooks         # should point to ~/coding-agents-config/hooks
ls -la ~/.claude/CLAUDE.md     # should point to ~/coding-agents-config/CLAUDE.md
ls -la ~/.claude/settings.json # should point to ~/coding-agents-config/settings.json
ls -la ~/.codex/AGENTS.md      # should point to ~/coding-agents-config/AGENTS.md
```

## Structure

```
coding-agents-config/
├── CLAUDE.md            # Global instructions — turn protocol, branch rules
├── AGENTS.md            # Codex loader directive (reads ~/.claude/CLAUDE.md)
├── settings.json        # Claude Code settings (model, permissions, hooks, plugins)
├── agents/              # Standalone subagent definitions
│   └── agent-architecture-planner.md
├── hooks/               # Shell hooks triggered by Claude Code events
│   └── branch-guard.sh  # Auto-creates a task branch when on main/master
├── scripts/             # Automation scripts
│   ├── setup.sh          # Creates ~/.claude and ~/.codex symlinks
│   └── af-state.sh       # state.yaml helpers sourced by af-* skills
├── skills/              # Slash-command skills
│   ├── .system/          # Meta-skills (skill-creator, skill-installer, plugin-creator, ...)
│   ├── session-start/    # Initialize session, load context docs
│   ├── task-init/        # Create a new task branch + turn-001
│   ├── turn-init/        # Create the next turn directory and artifacts
│   ├── turn-end/         # Finalize a turn with PR, ADR, manifest
│   ├── task-close/       # Push the task branch and open a PR
│   ├── branch-guard/     # Create a turn branch if on main/master
│   ├── af-*/              # App Factory SDLC pipeline (orchestrator, PRD, DDD, plan, implementation, checks, memory)
│   ├── dsl-utils/, e2e-tests/, ui-utils/, unit-tests/  # Category folders, each wrapping one nested skill
│   └── eval-labeler/     # Label/compare model responses for coding evals
├── .appfactory/          # Task/turn tracking and specs
│   ├── tasks/             # Task branches with turns (task-001, task-002, ...)
│   ├── specs/             # Specifications
│   ├── prompts/           # Prompt drafts
│   ├── memory/            # Project memory
│   ├── tasks_index.csv    # Task registry
│   └── changelog.md
├── archive/              # Retired skills and templates kept for reference
├── docs/                 # Reference documentation (App Factory plans, migrations)
└── .github/              # PR and issue templates
```

## Execution Flow

The agentic pipeline enforces a strict turn-based workflow for all coding tasks:

```mermaid
flowchart TB
    subgraph SESSION["Session Lifecycle"]
        START([User Prompt]) --> SS{First prompt<br/>of session?}
        SS -->|Yes| SESSION_START["/session-start"]
        SS -->|No| TURN_INIT

        SESSION_START --> LOAD_GIT["Load Git State<br/>• git branch<br/>• git status<br/>• git log"]
        LOAD_GIT --> LOAD_CTX["Load Context Docs<br/>• adr-context.md<br/>• governance-context.md<br/>• tech-standards-context.md<br/>• turn-tracking-context.md"]
        LOAD_CTX --> BANNER["Display Session Banner"]
        BANNER --> TURN_INIT
    end

    subgraph TURN["Turn Lifecycle"]
        TURN_INIT["/turn-init"] --> RESOLVE_ID["Resolve TURN_ID<br/>get-next-turn-id.sh"]
        RESOLVE_ID --> CREATE_DIR["Create Turn Directory<br/>turns/turn-N/"]
        CREATE_DIR --> WRITE_CTX["Write turn_context.md"]
        WRITE_CTX --> WRITE_TRACE["Write execution_trace.json"]
        WRITE_TRACE --> TURN_BANNER["Display Turn Status"]
    end

    subgraph BRANCH_GATE["Branch Protection Gate"]
        TURN_BANNER --> CHECK_BRANCH["git branch --show-current"]
        CHECK_BRANCH --> IS_MAIN{On main<br/>or master?}
        IS_MAIN -->|Yes| HALT["HALT<br/>DO NOT WRITE CODE"]
        HALT --> BRANCH_GUARD["/branch-guard"]
        BRANCH_GUARD --> CREATE_BRANCH["git checkout -b<br/>turn/T{TURN_ID}"]
        CREATE_BRANCH --> VERIFY["Verify branch switched"]
        IS_MAIN -->|No| IS_TURN{On turn/T*<br/>branch?}
        IS_TURN -->|Yes| PROCEED["Proceed"]
        IS_TURN -->|No| WARN["Warn non-turn branch"]
        WARN --> PROCEED
        VERIFY --> PROCEED
    end

    subgraph EXECUTION["Task Execution"]
        PROCEED --> EXEC["Execute User Task"]
        EXEC --> ADD_HEADERS["Add Metadata Headers<br/>to all modified files"]
        ADD_HEADERS --> BUMP_VERSION["Bump File Versions<br/>SemVer"]
    end

    subgraph POST_EXEC["Post-Execution (/turn-end)"]
        BUMP_VERSION --> TURN_END["/turn-end"]
        TURN_END --> CAPTURE_GIT["Capture Git State"]
        CAPTURE_GIT --> UPDATE_CTX["Update turn_context.md<br/>• TURN_END_TIME<br/>• TURN_ELAPSED_TIME<br/>• SKILLS_EXECUTED<br/>• AGENTS_EXECUTED"]
        UPDATE_CTX --> UPDATE_TRACE["Update execution_trace.json"]
        UPDATE_TRACE --> WRITE_PR["Write pull_request.md"]
        WRITE_PR --> WRITE_ADR["Write adr.md<br/>Full or Minimal"]
        WRITE_ADR --> WRITE_MANIFEST["Write manifest.json<br/>SHA-256 checksums"]
        WRITE_MANIFEST --> UPDATE_INDEX["Update turns_index.csv"]
        UPDATE_INDEX --> TAG["git tag turn/{TURN_ID}"]
        TAG --> CHECK_UNCOMMITTED{Uncommitted<br/>changes?}
        CHECK_UNCOMMITTED -->|Yes| COMMIT["Commit with format:<br/>AI Coding Agent Change:"]
        CHECK_UNCOMMITTED -->|No| COMPLETE
        COMMIT --> COMPLETE["Turn Complete"]
    end

    subgraph ARTIFACTS["Turn Artifacts"]
        direction LR
        A1["turn_context.md"]
        A2["execution_trace.json"]
        A3["pull_request.md"]
        A4["adr.md"]
        A5["manifest.json"]
    end

    WRITE_CTX -.-> A1
    WRITE_TRACE -.-> A2
    WRITE_PR -.-> A3
    WRITE_ADR -.-> A4
    WRITE_MANIFEST -.-> A5
```

### Turn Protocol Summary

| Phase | Steps | Outputs |
|-------|-------|---------|
| **Session Start** | Load git state → Load 4 context docs → Display banner | Context loaded |
| **Turn Init** | Resolve ID → Create dir → Write context + trace | `turn_context.md`, `execution_trace.json` |
| **Branch Gate** | Check branch → HALT if main → Create turn branch | Safe branch |
| **Execution** | Execute task → Add headers → Bump versions | Modified files |
| **Turn End** | Update context → Write PR → ADR → Manifest → Index → Tag | 5 artifacts complete |

## Skills (23, plus 5 meta-skills)

| Category | Skill | Description |
|----------|-------|-------------|
| **Lifecycle** | `session-start` | Load repository state and core pipeline context at the start of every session |
| | `task-init` | Initialize a new task branch and create task + turn-001 artifacts |
| | `turn-init` | Initialize the next turn within the active task branch |
| | `turn-end` | Finalize the active turn after execution (even on failure) |
| | `task-close` | Finalize the active task branch, push it, and open a PR against main |
| | `branch-guard` | Create a turn-scoped branch if on main/master |
| **App Factory pipeline (af-\*)** | `af-orchestrator` | Orchestrate the App Factory SDLC end to end |
| | `af-project-init` | Export required env vars and initialize an App Factory project |
| | `af-be-prd-build` | Build a backend-focused PRD from an intake worksheet |
| | `af-be-ddd-build` | Generate a backend DDD document from an approved PRD |
| | `af-be-ddd-analysis` | Audit a generated DDD document for quality and PRD alignment |
| | `af-be-ddd-refactor` | Patch a DDD document using `af-be-ddd-analysis` findings |
| | `af-be-ddd-orchestrator` | Orchestrate the DDD build → analyze → refactor → test loop |
| | `af-be-ddd-dsl` | Generate a backend DSL YAML document from a DDD document |
| | `af-be-ddd-tests` | Generate Gherkin/BDD scenarios from DDD and PRD specs |
| | `af-be-plan` | Generate a backend execution plan from a DSL and tech-stack profile |
| | `af-be-implementation` | Generate backend domain code from the execution plan and BDD specs |
| | `af-app-check` | Audit an application for production readiness |
| | `af-memory` | CRUD operations on `.appfactory/memory/state.yaml` |
| **Utility (category folders)** | `dsl-utils` → `dsl-model-interpreter` | Parse DSL/YAML specifications |
| | `e2e-tests` → `http-test-artifacts` | Generate HTTP test artifacts |
| | `ui-utils` → `ui-implementation-language` | UI implementation-language guidance |
| | `unit-tests` → `test-implementation-sync` | Keep tests in sync with implementation |
| **Eval** | `eval-labeler` | Label and compare model responses for coding evals |

### Meta-Skills (.system)

| Skill | Description |
|-------|-------------|
| `skill-creator` | Create or update skills with SKILL.md |
| `skill-installer` | Install skills from `$CODEX_HOME/skills` or a GitHub repo |
| `plugin-creator` | Scaffold Codex plugin directories and marketplace entries |
| `imagegen` | Generate or edit raster image assets |
| `openai-docs` | Look up official OpenAI product/API docs |

Templates for the turn/task lifecycle (`adr_template.md`, `pull_request_template.md`, `manifest.schema.json`, `tech-stack.template.md`, ...) live alongside the skills that consume them (e.g. `skills/turn-init/templates/`, `skills/task-init/templates/`, `skills/af-*/templates/`), plus a retired copy under `archive/templates/`.

## Agents

| Agent | Description |
|-------|-------------|
| `agent-architecture-planner` | Reads PRD/DDD/DSL and repo structure to produce module maps, implementation plans, and review gates for downstream coding agents |

## Hooks

| Hook | Trigger | Purpose |
|------|---------|---------|
| `branch-guard.sh` | PreToolUse (Bash / write tools) | Auto-creates a `task/T<NNN>` branch when the current branch is main/master |

## Archive & docs

- `archive/` holds retired skills (e.g. `schema-to-database`, `nestjs-crud-resource`, `code-entity-to-crud`) and their templates, kept for reference — see `archive/README.md`.
- `docs/` holds reference material such as the App Factory plan and the AI-to-AppFactory migration analyses.

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
