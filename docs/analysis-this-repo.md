# Analysis: This Repo

## Overview
This repository is a shared configuration and workflow engine for Claude Code and Codex. It centralizes skills, agent definitions, hooks, templates, and governance guidance, then distributes them via symlinks into user-level tool directories.

The architecture is solid at the execution layer (turn lifecycle initialization, skill suggestion engine, and preflight validation). The primary risk is consistency drift between documentation/policy and runnable assets, which can cause wrong command usage and reduced trust in the governance model.

## Key Findings
1. The automation core is well-structured: `turn-init.sh` creates per-turn provenance artifacts with fallback logic and prompt metadata capture, and `project-execute-preflight.sh` performs strong input/tooling checks before running complex workflows.
2. Documentation is significantly out of sync with current skills/agents in multiple files, including command names and inventory counts.
3. Governance requirements are explicit but not currently enforced by hooks; the system announces strict compliance while only enforcing branch protection plus format/verification helpers.
4. The metadata header template contains a malformed prefix (`du/**`) and CRLF endings, which can corrupt generated headers.
5. Post-edit hooks run background installs/tests/typechecks while silencing errors, which can hide failures and create noisy/non-deterministic local behavior.

## Files Examined
| File | Purpose |
|------|---------|
| `README.md` | Top-level setup, structure, and skills/agents inventory |
| `CLAUDE.md` | Global turn-lifecycle and post-execution requirements |
| `settings.json` | Permissions and hook wiring |
| `hooks/turn-init.sh` | Turn bootstrap and context artifact generation |
| `hooks/skill-eval.js` | Prompt-to-skill scoring engine |
| `hooks/skill-rules.json` | Skill trigger patterns and directory mappings |
| `scripts/setup.sh` | Symlink bootstrap for `~/.claude` and `~/.codex` |
| `scripts/project-execute-preflight.sh` | Pipeline preflight validation |
| `skills/analyze/SKILL.md` | Analysis workflow contract |
| `skills/governance/SKILL.md` | Governance policy and required standards |
| `skills/governance-adr/SKILL.md` | ADR policy |
| `templates/governance/metadata_header.txt` | Metadata header template |
| `docs/skills.md` | Skill reference doc |
| `docs/agents.md` | Agent reference doc |
| `docs/README-skills.md` | Skills handbook |
| `docs/README-agents.md` | Agents handbook |
| `agents/agent-orchestrator.md` | Orchestration behavior |
| `agents/agent-analyze-engineer.md` | Analysis specialist definition |

## Issues Identified
1. **HIGH**: Skills/agent documentation drift can direct users to non-existent commands and workflows.
   - Evidence: `docs/skills.md` references `execute`, `ddd-parse`, `fix-issue`, and `adr` (`docs/skills.md:9`, `docs/skills.md:11`, `docs/skills.md:31`, `docs/skills.md:34`) while the repo contains `project-execute`, `spec-parse-ddd`, `github-issue`, and `governance-adr` under `skills/`.
   - Evidence: `docs/agents.md` includes `memory-bank` (`docs/agents.md:22`) but there is no `agents/agent-memory-bank.md`; there is a new `agents/agent-analyze-engineer.md` not reflected in those docs.
2. **MEDIUM**: Public counts are stale, reducing trust in repository inventory docs.
   - Evidence: `README.md` says "Skills (42)" and "Agents (13)" (`README.md:95`, `README.md:110`), but current directories contain 43 non-system skills and 14 agents.
   - Evidence: `docs/README-skills.md` still says "all 42 skills" (`docs/README-skills.md:3`), and `docs/README-agents.md` says "all 13 specialist agents" (`docs/README-agents.md:3`).
3. **MEDIUM**: Governance policy is framed as mandatory but lacks enforcement hooks.
   - Evidence: governance declares metadata headers and turns tracking as non-negotiable (`skills/governance/SKILL.md:22`, `skills/governance/SKILL.md:196`).
   - Evidence: active hooks enforce branch protection and run formatter/test/typecheck helpers, but no metadata-header/turn-field validator exists (`settings.json:94`, `settings.json:116`).
4. **MEDIUM**: Metadata template corruption can generate invalid file headers.
   - Evidence: template starts with `du/**` instead of `/**` (`templates/governance/metadata_header.txt:1`).
5. **LOW**: Hook error handling prioritizes non-blocking UX over observability.
   - Evidence: background jobs with `&` and suppressed stderr (`2>/dev/null`) in post-edit install/test/typecheck hooks can hide failures (`settings.json:127`, `settings.json:132`, `settings.json:137`).

## Recommendations
1. Build a docs-to-files consistency check script and run it in CI:
   - Validate documented skills/agents against actual `skills/*/SKILL.md` and `agents/agent-*.md`.
   - Fail CI on unknown or missing entries and stale inventory counts.
2. Fix and normalize governance templates:
   - Correct `templates/governance/metadata_header.txt` prefix and line endings.
   - Add a hook or verification step that validates metadata headers and `Turns` updates for edited source files.
3. Reduce silent failure in hooks:
   - Keep non-blocking behavior, but write failures to a dedicated log (e.g., `.claude/audit/hook-errors.log`) for debugging.
4. Consolidate naming migration:
   - Standardize and document canonical names (`project-execute`, `spec-parse-ddd`, `github-issue`, `governance-adr`) and remove legacy aliases from docs unless explicitly supported.
5. Add one “source of truth” generator:
   - Generate `docs/skills.md` and `docs/agents.md` from directory metadata to avoid manual drift.

## Appendix
### Notable Strengths
- Turn initialization is robust and defensive (`hooks/turn-init.sh:17`, `hooks/turn-init.sh:32`, `hooks/turn-init.sh:71`).
- Skill evaluation combines keyword, intent, and path-based scoring with priority ordering (`hooks/skill-eval.js:42`, `hooks/skill-eval.js:91`).
- Preflight catches missing files, missing commands, missing skills/agents, and missing templates before pipeline execution (`scripts/project-execute-preflight.sh:119`, `scripts/project-execute-preflight.sh:198`, `scripts/project-execute-preflight.sh:223`).

---
Generated: 2026-03-05T16:33:42Z
Analyzed by: Codex (direct analysis)
