# coding-agents-config

Agentic pipeline configuration for Claude Code. Enforces a task/turn workflow with provenance tracking, branch protection, and governance rules, and ships the App Factory (`af-*`) skill pipeline.

## Setup

### 1. Clone the repo

```sh
git clone <repo-url> ~/coding-agents-config
```

### 2. Create symlinks (automated)

Run the setup script — it symlinks `skills`, `agents`, `hooks`, `scripts`, `CLAUDE.md` and `settings.json` (plus any of `rules`, `context`, `plugins` that exist) into `~/.claude/`, `agents` and `AGENTS.md` into `~/.codex/`, and `CLAUDE.md` into the repo-local `.claude/`. Existing files are backed up to `*.bak`:

```sh
bash scripts/setup.sh
```

<details>
<summary>Manual symlink commands</summary>

```sh
ln -s ~/coding-agents-config/skills ~/.claude/skills
ln -s ~/coding-agents-config/agents ~/.claude/agents
ln -s ~/coding-agents-config/hooks ~/.claude/hooks
ln -s ~/coding-agents-config/scripts ~/.claude/scripts
ln -s ~/coding-agents-config/CLAUDE.md ~/.claude/CLAUDE.md
ln -s ~/coding-agents-config/settings.json ~/.claude/settings.json
ln -s ~/coding-agents-config/AGENTS.md ~/.codex/AGENTS.md   # Codex
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
├── AGENTS.md           # Agent loader directive (points Codex at ~/.claude/CLAUDE.md)
├── settings.json       # Claude Code settings (model, permissions, hooks, plugins)
├── agents/             # Subagent definitions
│   └── agent-architecture-planner.md
├── hooks/              # Shell hooks triggered by Claude Code events
│   └── branch-guard.sh # Auto-creates a task branch when on main/master
├── skills/             # Slash-command skills (see below)
├── scripts/
│   ├── setup.sh        # Creates symlinks into ~/.claude, ~/.codex
│   └── af-state.sh     # Helpers for .appfactory/memory/state.yaml
├── docs/               # Reference docs (skill-summary.md, migration + plan notes)
├── archive/            # Retired skills and the turn-lifecycle templates
│   └── templates/      # adr_template.md, pull_request_template.md, manifest.schema.json, ...
├── .github/            # PR and issue templates
└── .appfactory/        # Task/turn tracking (generated per repo)
    ├── tasks/          # task-XXX/ with turns/turn-XXX/ artifacts
    ├── tasks_index.csv # Task registry
    ├── specs/  prompts/  memory/
    └── changelog.md
```

## Execution Flow

The agentic pipeline enforces a strict task/turn workflow for all coding tasks:

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
        HALT --> BRANCH_GUARD["/task-init"]
        BRANCH_GUARD --> CREATE_BRANCH["git checkout -b<br/>task/TXXX"]
        CREATE_BRANCH --> VERIFY["Verify branch switched"]
        IS_MAIN -->|No| IS_TURN{On task/T*<br/>branch?}
        IS_TURN -->|Yes| PROCEED["Proceed"]
        IS_TURN -->|No| WARN["Warn non-task branch"]
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

### Task / turn lifecycle

| Skill | Description |
|-------|-------------|
| `session-start` | Load repository state and core pipeline context (first prompt of a session) |
| `task-init` | Create `task/TXXX` branch plus task and `turn-001` artifacts (run on main/master) |
| `turn-init` | Initialize the next turn inside the active task branch |
| `turn-end` | Finalize the turn: ADR, manifest, trace, commit (always run, even on failure) |
| `task-close` | Finalize the task, push, and open a pull request against main |
| `branch-guard` | Check the branch and create a scoped branch if on main/master |

### App Factory pipeline (`af-*`)

Phases are documented in `docs/skill-summary.md`.

| Phase | Skill | Description |
|-------|-------|-------------|
| Orchestration | `af-orchestrator` | Orchestrates the App Factory SDLC |
| Initialization | `af-project-init` | Export env vars and run the project init helper |
| Requirements | `af-be-prd-build` | Build a business-facing PRD from worksheets and discovery notes |
| Domain design | `af-be-ddd-orchestrator` | Build → analyze → refactor loop → tests |
| | `af-be-ddd-build` | Generate the DDD document from an approved PRD |
| | `af-be-ddd-analysis` | Analyze the DDD for quality and PRD alignment |
| | `af-be-ddd-refactor` | Refactor the DDD from analysis findings |
| Testing | `af-be-ddd-tests` | Generate Gherkin BDD feature files from DDD and PRD |
| Planning | `af-be-plan` | Execution plan from domain DSL and tech stack profile |
| DSL | `af-be-ddd-dsl` | Generate the application DSL YAML from the DDD |
| Implementation | `af-be-implementation` | Copy a tech stack implementation and generate the backend |
| Validation | `af-app-check` | Production-readiness audit (security, DB, deployment, quality) |
| Cross-cutting | `af-memory` | CRUD on `.appfactory/memory/state.yaml` |

### Utility skills

| Skill | Description |
|-------|-------------|
| `dsl-utils` | Holds `dsl-model-interpreter` |
| `e2e-tests` | Holds `http-test-artifacts` |
| `ui-utils` | Holds `ui-implementation-language` |
| `unit-tests` | Holds `test-implementation-sync` |
| `eval-labeler` | Label and evaluate model responses from Eval.md files |

### Meta-skills (`skills/.system`)

`skill-creator`, `skill-installer`, `plugin-creator`, `imagegen`, `openai-docs`.

## Agents

| Agent | Model | Purpose |
|-------|-------|---------|
| `agent-architecture-planner` | sonnet | Reads PRD/DDD/DSL and repo structure to produce architecture decisions, module maps, and task plans |

## Templates

Turn-lifecycle templates now live in `archive/templates/`: `adr_template.md`, `pull_request_template.md`, `manifest.schema.json`, `metadata_header.txt`, `branch_naming.md`, `commit_message.md`, `tech-stack.template.md`.

## Hooks

| Hook | Trigger | Purpose |
|------|---------|---------|
| `branch-guard.sh` | PreToolUse(Bash) | Auto-create a task branch instead of writing on main/master |

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
