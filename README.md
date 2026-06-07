# coding-agents-config

Agentic pipeline configuration for Claude Code. Enforces turn-based workflow with provenance tracking, branch protection, and governance rules.

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

The script links into three locations:

- `~/.claude/` — `skills`, `agents`, `rules`, `hooks`, `context`, `scripts`, `plugins`, `CLAUDE.md`, `settings.json`
- `~/.codex/` — `agents`, `AGENTS.md`
- `./.claude/` (repo-local) — `CLAUDE.md`

Only items that exist in the repo are linked usefully; optional targets (`rules`, `context`, `plugins`) are reserved for future use.

<details>
<summary>Manual symlink commands</summary>

```sh
ln -s ~/coding-agents-config/skills ~/.claude/skills
ln -s ~/coding-agents-config/agents ~/.claude/agents
ln -s ~/coding-agents-config/hooks ~/.claude/hooks
ln -s ~/coding-agents-config/scripts ~/.claude/scripts
ln -s ~/coding-agents-config/CLAUDE.md ~/.claude/CLAUDE.md
ln -s ~/coding-agents-config/settings.json ~/.claude/settings.json

ln -s ~/coding-agents-config/agents ~/.codex/agents
ln -s ~/coding-agents-config/AGENTS.md ~/.codex/AGENTS.md
```

If any of these already exist, back them up first (`mv <target> <target>.bak`).
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
├── CLAUDE.md           # Global instructions — turn protocol, branch rules
├── AGENTS.md           # Agent loader directive (points to ~/.claude/CLAUDE.md)
├── settings.json       # Claude Code settings (model, permissions, hooks)
├── package.json        # Repo-level dependencies
├── agents/             # Agent definitions
│   └── agent-architecture-planner.md
├── hooks/              # Shell hooks triggered by Claude Code events
│   └── branch-guard.sh # Auto-creates a task branch when on main/master
├── skills/             # Slash-command skills
│   ├── .system/        # Meta-skills (skill-creator, skill-installer)
│   ├── session-start/  # Load repo state and pipeline context
│   ├── task-init/      # Create a new task branch and artifacts
│   ├── turn-init/      # Initialize the next turn within a task
│   ├── turn-end/       # Finalize a turn (PR, ADR, manifest, trace)
│   ├── task-close/     # Finalize a task, push, and open a PR
│   ├── branch-guard/   # Create a turn branch if on main/master
│   ├── af-orchestrator/        # AppFactory SDLC orchestration
│   ├── af-project-init/        # AppFactory project initialization
│   ├── af-be-prd-build/        # Backend PRD generation
│   ├── af-be-ddd-orchestrator/ # Backend DDD workflow orchestration
│   ├── af-be-ddd-build/        # Generate DDD doc from PRD
│   ├── af-be-ddd-analysis/     # Analyze DDD for quality/completeness
│   ├── af-be-ddd-refactor/     # Refactor DDD from analysis findings
│   ├── af-be-ddd-dsl/          # Generate domain DSL YAML from DDD
│   ├── af-be-ddd-tests/        # Generate Gherkin/BDD scenarios from DDD
│   ├── af-be-plan/             # Generate backend execution plan
│   ├── af-be-implementation/   # Generate backend code from plan + DSL
│   ├── af-app-check/           # Production-readiness audit
│   ├── af-memory/              # CRUD on AppFactory pipeline state
│   ├── eval-labeler/           # Label/compare model responses for evals
│   ├── dsl-utils/, ui-utils/, e2e-tests/, unit-tests/  # Shared helpers
│   └── ...             # See "Skills" table below for the full set
├── scripts/            # Automation scripts
│   ├── setup.sh        # Create ~/.claude, ~/.codex, ./.claude symlinks
│   └── af-state.sh     # AppFactory state.yaml helpers (sourced by af-* skills)
├── .appfactory/        # Task/turn tracking and pipeline state
│   ├── tasks/          # Task branches with turns (task_context.md, adr.md, manifest.json, ...)
│   ├── specs/          # Specifications
│   ├── prompts/        # Prompt templates
│   ├── memory/         # Project memory / state.yaml
│   ├── changelog.md    # Project changelog
│   └── tasks_index.csv # Registry of tasks and statuses
├── archive/            # Retired skills, templates, and reference material
│   └── templates/      # Turn lifecycle templates (adr, PR, manifest schema, ...)
├── docs/               # Reference documentation (skill summaries, migration notes, plans)
└── .github/            # Issue and PR templates
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

## Skills

| Category | Skill | Description |
|----------|-------|-------------|
| **Session** | `session-start` | Load repository state and core pipeline context at session start |
| **Task** | `task-init` | Initialize a new task branch and create task + turn-001 artifacts (run on main/master) |
| | `task-close` | Finalize the active task branch, push it, and open a pull request against main |
| **Turn** | `turn-init` | Initialize the next turn within the active task branch |
| | `turn-end` | Finalize the active turn after execution (PR, ADR, manifest, trace) — run every turn, even on failure |
| | `branch-guard` | Check current branch and create a turn-scoped branch if on main/master |
| **AppFactory (af-\*)** | `af-orchestrator` | Orchestrate the App Factory software development lifecycle |
| | `af-project-init` | Orchestrate AppFactory project initialization (env vars, helper script) |
| | `af-be-prd-build` | Build a business-facing backend PRD from an intake worksheet |
| | `af-be-ddd-orchestrator` | Orchestrate the backend DDD workflow: build → analyze → refactor → test |
| | `af-be-ddd-build` | Generate a human-readable backend DDD document from an approved PRD |
| | `af-be-ddd-analysis` | Analyze a DDD specification for quality, completeness, and PRD alignment |
| | `af-be-ddd-refactor` | Refactor a DDD document based on analysis findings |
| | `af-be-ddd-dsl` | Generate a backend domain DSL YAML document from a DDD document |
| | `af-be-ddd-tests` | Generate Gherkin-style BDD scenarios from DDD and PRD specifications |
| | `af-be-plan` | Generate a backend execution plan from a domain DSL and tech stack profile |
| | `af-be-implementation` | Generate backend domain code from the execution plan and BDD specs |
| | `af-app-check` | Audit an application for production readiness (security, DB, deployment, code quality) |
| | `af-memory` | CRUD operations on `.appfactory/memory/state.yaml` for pipeline state tracking |
| **Utility** | `eval-labeler` | Process Eval.md files and label/compare model responses (Response A vs B) |
| | `dsl-utils`, `ui-utils`, `e2e-tests`, `unit-tests` | Shared helpers used by other skills |
| **Meta (.system)** | `skill-creator` | Create new skills with a `SKILL.md` |
| | `skill-installer` | Install skills from marketplaces |

## Templates

Turn lifecycle templates are kept under `archive/templates/`:

| Template | Purpose |
|----------|---------|
| `adr_template.md` | Architecture Decision Record format |
| `pull_request_template.md` | PR description format |
| `manifest.schema.json` | Turn manifest JSON schema |
| `metadata_header.txt` | Source file header format |
| `branch_naming.md` | Branch naming conventions |
| `commit_message.md` | Commit message format |
| `tech-stack.template.md` | Tech stack documentation |

## Hooks

| Hook | Trigger | Purpose |
|------|---------|---------|
| `branch-guard.sh` | PreToolUse(Bash) | Auto-create a `task/TXXX` branch when on main/master, instead of blocking the action |

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
