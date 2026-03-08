analyze this repo

⏺ I'll analyze this repository structure and purpose.

⏺ Searched for 5 patterns, read 6 files (ctrl+o to expand)

⏺ Repository Analysis: coding-agents-config

Purpose

This is a Claude Code configuration repository that defines a complete agentic development pipeline. It provides:

- Skills — Reusable prompt templates invoked via /skill-name
- Agents — Specialist personas for domain-specific tasks
- Hooks — Shell scripts triggered on Claude events
- Rules — Shared standards for branching, tech, and coordination

Directory Structure

coding-agents-config/
├── CLAUDE.md           # Main instructions (turn lifecycle)
├── skills/             # 43 skill definitions (SKILL.md files)
├── agents/             # 14 agent definitions
├── hooks/              # 5 lifecycle hooks
├── rules/              # 3 rule files
├── templates/          # ADR, PR, governance templates
├── scripts/            # Support scripts (turn ID, preflight)
├── docs/               # Reference documentation
└── ai/agentic-pipeline/turns/  # Turn artifact storage

Core Concepts

1. Turn Lifecycle — Every prompt creates a "turn" with provenance tracking:
- Pre-execution: create turn directory, write session_context.md
- Execution: run skills/agents
- Post-execution: write pull_request.md, adr.md, manifest.json

2. Agent Hierarchy

┌─────────────────┬──────────────────────────────────────────────┐
│      Agent      │                    Scope                     │
├─────────────────┼──────────────────────────────────────────────┤
│ orchestrator    │ Master coordinator, delegates to specialists │
├─────────────────┼──────────────────────────────────────────────┤
│ nextjs-engineer │ apps/web/                                    │
├─────────────────┼──────────────────────────────────────────────┤
│ nestjs-engineer │ apps/api/                                    │
├─────────────────┼──────────────────────────────────────────────┤
│ drizzle-dba     │ packages/database/                           │
├─────────────────┼──────────────────────────────────────────────┤
│ spring-engineer │ services/enterprise/                         │
├─────────────────┼──────────────────────────────────────────────┤
│ test-writer     │ All test files                               │
├─────────────────┼──────────────────────────────────────────────┤
│ code-architect  │ System design                                │
├─────────────────┼──────────────────────────────────────────────┤
│ git-guardian    │ Git/PR operations                            │
└─────────────────┴──────────────────────────────────────────────┘

3. Skill Categories
- Pipeline: /project-execute, /spec-prd-parse, /spec-epic-start
- Session: /session-start, /session-end, /git-status
- Git: /git-commit-push-pr, /git-checkpoint, /git-rollback
- Quality: /verify-all, /test-and-fix, /security-scan
- Patterns: pattern-nextjs, pattern-nestjs, pattern-drizzle, etc.

4. Hooks

┌───────────────┬──────────────────┬──────────────────────────┐
│     Hook      │     Trigger      │         Purpose          │
├───────────────┼──────────────────┼──────────────────────────┤
│ turn-init.sh  │ UserPromptSubmit │ Creates turn directory   │
├───────────────┼──────────────────┼──────────────────────────┤
│ skill-eval.sh │ UserPromptSubmit │ Suggests relevant skills │
└───────────────┴──────────────────┴──────────────────────────┘

Design Patterns

1. Spec-Driven Development — PRD → DDD → Epic → Tasks
2. Domain Separation — Each agent owns specific file scopes
3. Quality Gates — verify-all required before every PR
4. Provenance Tracking — Every turn produces artifacts for audit

Current State

- Branch: skill-creator
- Modified files: CLAUDE.md, plugins/blocklist.json, scripts/setup.sh, skills/config-init/SKILL.md
- Untracked: Several new files in .claude/, agents/, ai/, docs/, vault/

This repo is designed to be symlinked into ~/.claude/ via /config-init, making its skills and agents available globally across all projects.

✻ Crunched for 41s               