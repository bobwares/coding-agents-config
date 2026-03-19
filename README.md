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
