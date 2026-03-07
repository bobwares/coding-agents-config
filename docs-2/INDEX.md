# docs-2 Index

This directory reorganizes every file from `docs/` into numbered groups with consistent, subject-based names.

## Grouping Scheme

- `01-reference`: operational reference docs for agents, hooks, and skills
- `02-standards-and-contracts`: normative requirements, checklists, and execution contracts
- `03-analysis`: architectural and repository analyses
- `04-plans-and-context`: optimization plans and context-management notes

## Naming Convention

`<group>/<nn>-<subject>.md`

- `<group>` is the numbered category directory
- `<nn>` is sequence number within that group
- `<subject>` is a stable kebab-case topic label

## Document Index

| # | New Path | Original Path | Summary |
|---|---|---|---|
| 1 | `01-reference/01-agents-reference-quick.md` | `docs/agents.md` | Compact agents reference with role table and model assignment. |
| 2 | `01-reference/02-agents-reference-detailed.md` | `docs/README-agents.md` | Detailed agent reference with orchestrator workflow and per-agent docs. |
| 3 | `01-reference/03-hooks-reference.md` | `docs/hooks.md` | Hook catalog for lifecycle events, trigger conditions, and commands. |
| 4 | `01-reference/04-skills-reference-quick.md` | `docs/skills.md` | Summary skills catalog grouped by category and usage patterns. |
| 5 | `01-reference/05-skills-reference-detailed.md` | `docs/README-skills.md` | Full skill-by-skill command reference and behavior details. |
| 6 | `02-standards-and-contracts/01-non-functional-spec-global-baseline.md` | `docs/NON_FUNCTIONAL_SPEC.md` | Mandatory stack-agnostic NFR baseline for reliability, observability, security, and operations. |
| 7 | `02-standards-and-contracts/02-nfr-checklist.md` | `docs/NFR_CHECKLIST.md` | Production readiness checklist derived from the NFR baseline. |
| 8 | `02-standards-and-contracts/03-project-execute-golden-path-contract.md` | `docs/project-execute-contract.md` | Deterministic contract and success criteria for `/project-execute`. |
| 9 | `03-analysis/01-codebase-analysis-summary.md` | `docs/analysis-codebase.md` | Concise analysis of repository architecture, strengths, and gaps. |
| 10 | `03-analysis/02-claude-implementation-analysis.md` | `docs/analysis-claude-implementation.md` | Analysis of `.claude` runtime configuration and naming/wiring issues. |
| 11 | `03-analysis/03-spec-prd-parse-analysis.md` | `docs/analysis-spec-prd-parse.md` | Review of `spec-prd-parse` behavior, DDD alignment, and output contract. |
| 12 | `03-analysis/04-skills-and-agents-ecosystem-analysis.md` | `docs/analysis-skills-and-agents.md` | Ecosystem analysis of skills/agents coverage and architecture. |
| 13 | `03-analysis/05-coding-agents-config-analysis.md` | `docs/analysis-coding-agents-config.md` | Deep analysis of the full coding-agents-config framework and governance model. |
| 14 | `03-analysis/06-coding-agents-config-repository-analysis.md` | `docs/analysis-coding-agents-config-repository.md` | Repository-level analysis emphasizing shared symlink-based configuration strategy. |
| 15 | `03-analysis/07-this-repo-analysis.md` | `docs/analysis-this-repo.md` | Focused analysis of this repository as a workflow engine for Claude/Codex. |
| 16 | `03-analysis/08-codex-one-turn-readiness-analysis.md` | `docs/codex-analysis.md` | Codex readiness assessment for one-turn app generation. |
| 17 | `03-analysis/09-tech-standards-analysis.md` | `docs/tech-standards-analysis.md` | Analysis of tech standards rules and recommendations for skill extraction. |
| 18 | `03-analysis/10-2026-03-05-coding-agents-config-codebase-analysis.md` | `docs/analysis/2026-03-05__repo__coding-agents-config.md` | Date-stamped (2026-03-05) codebase analysis snapshot. |
| 19 | `04-plans-and-context/01-optimize-claude-md-plan.md` | `docs/optimize-plan.md` | Step-by-step plan to reduce `CLAUDE.md` token size safely. |
| 20 | `04-plans-and-context/02-session-context-optimization.md` | `docs/update-context.md` | Session context pressure analysis and optimization actions (Claude Opus snapshot). |
| 21 | `04-plans-and-context/03-session-context-optimization-gpt-5.md` | `docs/update-context-2.md` | Updated context optimization guidance for GPT-5 model behavior. |

## Notes

- All files were copied from `docs/` and renamed for consistency.
- Source content was not modified; only file paths and filenames changed.
