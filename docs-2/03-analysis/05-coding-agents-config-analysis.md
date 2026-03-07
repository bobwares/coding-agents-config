# Analysis: coding-agents-config Repository

## Executive Summary

The `coding-agents-config` repository is a sophisticated Claude Code configuration framework that defines a complete agentic development pipeline. It provides the foundational infrastructure for multi-agent software development, combining skills (reusable prompt templates), agents (specialist personas), hooks (lifecycle automation), and governance rules into a cohesive system. The repository establishes strict contracts for turn-based execution with full provenance tracking, domain-driven design integration, and comprehensive quality gates. With 43 skills, 14 specialized agents, and a mature turn-lifecycle system, this is an enterprise-grade framework designed to be symlinked into `~/.claude/` for global availability across all projects. However, operational execution shows gaps in artifact completeness and some environmental portability challenges that need addressing.

## Repository Architecture

### Directory Structure

```
coding-agents-config/                      [4.9 MB total]
├── CLAUDE.md                              # Core turn-lifecycle mandate
├── README.md                              # Setup and structure guide
├── settings.json                          # Claude Code config (hooks, permissions, env)
├── .gitignore                             # Standard ignores
│
├── rules/                                 # Shared governance
│   ├── branch-operations.md               # Git workflow (epic/feature/fix branches, conventional commits)
│   ├── tech-standards.md                  # TypeScript strict mode, security, collaboration
│   └── agent-coordination.md              # Parallelism, file scopes, conflict resolution
│
├── skills/                                # 43 slash-command skills
│   ├── .system/
│   │   ├── skill-creator/SKILL.md         # Meta-skill to create new skills
│   │   └── skill-installer/SKILL.md       # Install skills from external sources
│   │
│   ├── project-*/                         # 4 project pipeline skills
│   │   ├── project-execute/SKILL.md       # One-turn full-stack build (PRD → DDD → code)
│   │   ├── project-init/SKILL.md          # Scaffold monorepo structure
│   │   ├── project-create-plan/SKILL.md   # Plan task breakdown
│   │   └── project-plan/SKILL.md          # Generate planning docs
│   │
│   ├── spec-*/                            # 7 spec/planning skills
│   │   ├── spec-prd-parse/SKILL.md        # Parse PRD into DDD-aware epic
│   │   ├── spec-epic-start/SKILL.md       # Begin epic implementation
│   │   ├── spec-prd-new/SKILL.md          # Create new PRD
│   │   ├── spec-prd-list/SKILL.md         # List PRDs/epics
│   │   ├── spec-planning/SKILL.md         # Generate planning docs
│   │   ├── spec-task-next/SKILL.md        # Get next task in epic
│   │   └── spec-parse-ddd/SKILL.md        # Parse DDD to domain model
│   │
│   ├── git-*/                             # 8 git workflow skills
│   │   ├── git-commit-push-pr/SKILL.md    # Full: verify → commit → push → PR
│   │   ├── git-quick-commit/SKILL.md      # Fast local commit
│   │   ├── git-checkpoint/SKILL.md        # Named save point
│   │   ├── git-rollback/SKILL.md          # Restore from checkpoint
│   │   ├── git-undo/SKILL.md              # Undo last Claude commit
│   │   ├── git-status/SKILL.md            # Project context
│   │   └── github-issue/SKILL.md          # GitHub issue integration
│   │
│   ├── pattern-*/                         # 9 framework pattern libraries
│   │   ├── pattern-nextjs/SKILL.md        # Next.js 15 App Router
│   │   ├── pattern-nestjs/SKILL.md        # NestJS modules/services/DTOs
│   │   ├── pattern-spring/SKILL.md        # Spring WebFlux + R2DBC
│   │   ├── pattern-drizzle/SKILL.md       # Drizzle ORM + PostgreSQL
│   │   ├── pattern-testing/SKILL.md       # Vitest/JUnit 5/Playwright
│   │   ├── pattern-react-ui/SKILL.md      # React state/loading patterns
│   │   ├── pattern-shadcn/SKILL.md        # shadcn/ui + Tailwind
│   │   ├── pattern-vercel-ai/SKILL.md     # Vercel AI SDK patterns
│   │   └── pattern-api-design/SKILL.md    # REST API design
│   │
│   ├── session-*/                         # 3 session management skills
│   │   ├── session-start/SKILL.md         # Initialize turn + load context
│   │   ├── session-end/SKILL.md           # Complete artifacts + finalize
│   │   └── session-context-size/SKILL.md  # Capture context window usage
│   │
│   ├── governance*/                       # 2 governance skills
│   │   ├── governance/SKILL.md            # Enforce metadata + versioning
│   │   └── governance-adr/SKILL.md        # Architecture Decision Records
│   │
│   ├── quality-*/                         # 3 quality assurance skills
│   │   ├── verify-all/SKILL.md            # TypeScript + lint + test + build
│   │   ├── test-and-fix/SKILL.md          # Run tests + auto-fix
│   │   └── security-scan/SKILL.md         # OWASP Top 10 + secrets scanning
│   │
│   └── Other skills: analyze/, diagnose-issue/, makefile-gen/, mode/, human-review/, recreation.gov/
│
├── agents/                                # 14 specialist agent definitions
│   ├── agent-orchestrator.md              # Master coordinator (5-phase workflow)
│   ├── agent-nextjs-engineer.md           # Next.js 15 App Router specialist
│   ├── agent-nestjs-engineer.md           # NestJS API specialist
│   ├── agent-spring-engineer.md           # Spring WebFlux specialist
│   ├── agent-drizzle-dba.md               # Database schema + queries
│   ├── agent-test-writer.md               # TDD specialist (Vitest/JUnit/Playwright)
│   ├── agent-code-architect.md            # System design + API contracts
│   ├── agent-code-reviewer.md             # Senior code review
│   ├── agent-security-auditor.md          # OWASP security audit
│   ├── agent-verify-app.md                # Full quality gate orchestrator
│   ├── agent-git-guardian.md              # Git workflow (commit/push/PR)
│   ├── agent-doc-generator.md             # JSDoc/README/OpenAPI
│   ├── agent-ai-engineer.md               # Vercel AI SDK specialist
│   └── agent-analyze-engineer.md          # Analysis + reporting specialist
│
├── hooks/                                 # 5 lifecycle hooks
│   ├── turn-init.sh                       # UserPromptSubmit: create turn directory
│   ├── skill-eval.sh                      # UserPromptSubmit: analyze prompt, suggest skills
│   ├── skill-eval.js                      # Node.js skill-matching engine
│   ├── skill-rules.json                   # Skill trigger rules + directory mappings
│   ├── audit-log.sh                       # PreToolUse(Bash): log all commands
│   └── (Branch protection, Prettier, TypeCheck, etc. in settings.json)
│
├── scripts/                               # Automation scripts
│   ├── setup.sh                           # Bootstrap symlinks into ~/.claude
│   ├── get-next-turn-id.sh                # Allocate next turn ID
│   ├── get-current-turn-id.sh             # Resolve current turn ID
│   └── project-execute-preflight.sh       # Validate project-execute inputs
│
├── templates/                             # Turn artifacts templates
│   ├── adr/adr_template.md                # Architecture Decision Record
│   ├── pr/pull_request_template.md        # PR summary
│   ├── turn/                              # Turn directory structure
│   ├── governance/                        # Commit message, branch naming
│   ├── contexts/session_context.md        # Session metadata template
│   └── stack/tech-stack.template.md       # Tech stack specification
│
├── docs/                                  # Reference documentation (12 files)
│   ├── skills.md                          # Complete skills reference
│   ├── agents.md                          # Agent descriptions + roles
│   ├── hooks.md                           # Hook documentation
│   ├── project-execute-contract.md        # Golden path contract
│   ├── analysis-*.md                      # Various codebase analyses
│   └── ...
│
├── ai/agentic-pipeline/                   # Turn lifecycle artifacts
│   ├── turns_index.csv                    # Turn ledger
│   └── turns/turn-{1..18}/                # Turn directories
│       ├── session_context.md             # Metadata for this turn
│       ├── execution_trace.json           # Skills/agents executed
│       ├── pull_request.md                # Changes summary
│       ├── adr.md                         # Architecture decisions
│       └── manifest.json                  # File hashes (SHA-256)
│
├── plugins/                               # Plugin management
│   ├── blocklist.json                     # Blocked plugins
│   └── install-counts-cache.json          # Plugin statistics
│
└── vault/                                 # Obsidian vault (reference only)
```

### Repository Statistics

- **Size**: 4.9 MB
- **Total Skills**: 43 (7,163 lines of SKILL.md documentation)
- **Total Agents**: 14 specialized personas
- **Hooks**: 5 core hooks + several post-execution hooks
- **Rules**: 3 governance documents
- **Turn History**: 18 turns recorded
- **Documentation**: 12+ analysis and reference documents

---

## Skills System Deep Dive

### Skill Definition Format

Each skill is a directory with a `SKILL.md` file following this structure:

```yaml
---
name: skill-name
description: One-line purpose
model: claude-haiku-4-5 (optional)
allowed-tools: Read, Write, Edit, Bash, Glob, Grep (optional)
---

# Skill Name

[Detailed documentation in markdown]
- Step-by-step procedures
- Code examples
- Invocation syntax
```

### Skill Categories

| Category | Count | Skills | Purpose |
|----------|-------|--------|---------|
| **Pipeline** | 4 | `project-execute`, `project-init`, `project-plan`, `project-create-plan` | One-turn full-stack build from PRD/DDD/stack |
| **Spec Management** | 7 | `spec-prd-parse`, `spec-epic-start`, `spec-prd-new`, `spec-prd-list`, `spec-planning`, `spec-task-next`, `spec-parse-ddd` | PRD parsing, epic generation, DDD integration |
| **Git Workflow** | 8 | `git-commit-push-pr`, `git-quick-commit`, `git-checkpoint`, `git-rollback`, `git-undo`, `git-status`, `github-issue` | Branch management, commits, PRs, version control |
| **Patterns** | 9 | `pattern-nextjs`, `pattern-nestjs`, `pattern-spring`, `pattern-drizzle`, `pattern-testing`, `pattern-react-ui`, `pattern-shadcn`, `pattern-vercel-ai`, `pattern-api-design` | Framework-specific patterns and best practices |
| **Session** | 3 | `session-start`, `session-end`, `session-context-size` | Turn lifecycle and context management |
| **Governance** | 2 | `governance`, `governance-adr` | Metadata enforcement and architectural decisions |
| **Quality** | 3 | `verify-all`, `test-and-fix`, `security-scan` | Testing, verification, security audits |
| **System** | 2 | `skill-creator`, `skill-installer` | Meta-skills for managing skills themselves |
| **Other** | 5 | `analyze`, `diagnose-issue`, `human-review`, `makefile-gen`, `mode` | Debugging, analysis, code generation |

---

## Agents System Deep Dive

### Agent Inventory

| Agent | Scope | Role |
|-------|-------|------|
| `orchestrator` | Multi-step coordination | Master coordinator, spawns specialists, 5-phase workflow |
| `nextjs-engineer` | `app/web/src/app/**`, components | Next.js 15 App Router specialist |
| `nestjs-engineer` | `app/api/src/modules/**` | NestJS API specialist |
| `spring-engineer` | `services/enterprise/src/main/java/**` | Spring WebFlux specialist |
| `drizzle-dba` | `packages/database/**` | Database expert, Drizzle ORM + PostgreSQL |
| `test-writer` | `**/*.test.ts`, `**/*.spec.ts`, `e2e/` | TDD specialist |
| `code-architect` | System design | API contracts, domain modeling |
| `code-reviewer` | Code review scope | Senior engineer review |
| `security-auditor` | Security concerns | OWASP Top 10, secrets scanning |
| `verify-app` | Full pipeline | Quality gate orchestrator |
| `git-guardian` | Git operations | Commits, pushes, PRs |
| `doc-generator` | Documentation | JSDoc, README, OpenAPI |
| `ai-engineer` | AI features | Vercel AI SDK, LLM integration |
| `analyze-engineer` | Analysis | Code analysis, reporting |

### Agent Coordination

**File Scope Assignments** (from `rules/agent-coordination.md`):

```
drizzle-dba      → app/packages/database/schema/, migrations/
nestjs-engineer  → app/api/src/modules/<feature>/
spring-engineer  → app/services/enterprise/src/main/java/
nextjs-engineer  → app/web/src/app/<route>/, components/
test-writer      → **/*.test.ts, **/*.spec.ts, app/e2e/
doc-generator    → **/*.md, JSDoc in any file
```

**5-Phase Orchestrator Workflow**:
1. **Understand**: Clarify scope, read relevant files
2. **Plan**: Write numbered implementation plan, present to user
3. **Execute**: Spawn specialist agents via Task tool
4. **Verify**: Run `verify-app`, fix failures, re-verify
5. **Ship**: Spawn `git-guardian` for commit/push/PR

---

## Hooks System Deep Dive

### Hook Types

| Hook | Trigger | Purpose |
|------|---------|---------|
| `SessionStart` | Session begins | Load context files, display turn status |
| `turn-init.sh` | `UserPromptSubmit` | Create turn directory, `session_context.md`, `execution_trace.json` |
| `skill-eval.sh` | `UserPromptSubmit` | Analyze prompt, suggest top 3 skills |
| `audit-log.sh` | `PreToolUse(Bash)` | Log all bash commands for audit trail |
| Branch Protection | `PreToolUse(Edit)` | Block direct edits to `main`/`master` |
| Prettier | `PostToolUse(Edit)` | Auto-format TS/JS/JSON/CSS/MD |
| Package Install | `PostToolUse(Edit)` | Auto-run `pnpm install` on package.json changes |
| Test Runner | `PostToolUse(Edit)` | Auto-run tests on `.test.ts` / `.spec.ts` changes |
| TypeCheck | `PostToolUse(Edit)` | Auto-run `pnpm typecheck` on TS file changes |

---

## Turn Lifecycle System

### Artifact Structure

Every turn produces a directory at `./ai/agentic-pipeline/turns/turn-${TURN_ID}/` with:

| Artifact | Purpose | Mandatory |
|----------|---------|-----------|
| `session_context.md` | Metadata table (TURN_ID, timestamps, branch, prompt preview) | YES |
| `execution_trace.json` | Skills and agents executed, with reasons | YES |
| `pull_request.md` | Summary of changes, files modified, compliance checklist | YES |
| `adr.md` | Architecture Decision Record (full or minimal) | YES |
| `manifest.json` | SHA-256 hashes of all modified files | For tracked turns |

---

## Issues Identified

### HIGH SEVERITY

**1. Turn Provenance is Incomplete**
- Many turn directories only have partial artifacts
- `turns_index.csv` is inconsistent with actual turn directories
- Root cause: `session-end` skill not being invoked consistently

### MEDIUM SEVERITY

**2. SessionStart Hook Context Resolution**
- Assumes local `.claude` completeness
- May show false "missing context" warnings

**3. Hard-Coded Home Path Fallbacks**
- Skills assume `$HOME/coding-agents-config` exists
- Reduces cross-machine portability

### LOW SEVERITY

**4. Session-End Always Attempts Git Push**
- Fails on local-only repos without remote

**5. Line-Ending Normalization**
- Missing `.gitattributes` causes cross-platform diff noise

---

## Recommendations

### Priority 1: Governance & Provenance
1. Automate post-execution artifact completion
2. Implement turn artifact validation
3. Update `turns_index.csv` tracking

### Priority 2: Environment Portability
1. Fix SessionStart context resolution
2. Standardize script path resolution
3. Add graceful degradation for optional agents
4. Fix session-end for local-only repos

### Priority 3: Quality & Maintainability
1. Add `.gitattributes` for line-ending normalization
2. Create a `verify-governance` skill
3. Document skill contracts formally
4. Add examples for each agent

---

## Conclusion

The `coding-agents-config` repository is a **well-architected, comprehensive agentic development framework**. Its strength lies in:

- **Clear separation of concerns**: skills, agents, hooks, rules are distinct and composable
- **Deterministic execution**: step-by-step skills with clear contracts
- **Spec-driven workflow**: PRD → DDD → Epic → Implementation
- **Full-stack coverage**: Frontend, backend, database, testing, security, deployment
- **Governance first**: Turn tracking, branch protection, conventional commits, ADRs
- **Extensibility**: Easy to add new skills or agents

With the recommended improvements around artifact automation and environment portability, this framework would be **production-ready** for multi-agent enterprise software development at scale.

---

**Generated**: 2026-03-05T16:55:00Z
**Analyzed by**: Explore agent (sonnet)
**Repository size**: 4.9 MB
**Total skills**: 43
**Total agents**: 14
