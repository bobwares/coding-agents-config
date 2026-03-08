---
name: cheap-analysis
description: Use when the user asks to analyze code, analyze codebase, debug errors, analyze logs, review architecture, analyze a repository, or run post-turn analysis.
context: fork
agent: agent-cheap-analyzer
---

Analyze $ARGUMENTS.

Step 1 — Start

Print:
[analysis] starting analysis

Step 2 — Determine output location

Print:
[analysis] determining output mode

If request references turns:
output directory:

ai/agentic-pipeline/turns/current-turn/analysis/

Otherwise:

docs/analysis/

Step 3 — Classify analysis type

Print:
[analysis] classifying request

Classification rules

error analysis
stack traces, exceptions, panic, HTTP errors

log analysis
timestamps, INFO/WARN/ERROR logs

code analysis
functions, modules, classes

codebase analysis
phrases like:
analyze codebase
analyze repo
repo overview

architecture analysis
system structure, services, modules

document analysis
RFCs, markdown docs

general analysis
fallback

After classification print:

[analysis] classified as: <type> analysis

Step 4 — Select template

Templates live in:

templates/

Mapping

error → template__error-analysis.md
logs → template__log-analysis.md
code → template__code-analysis.md
codebase → template__codebase-analysis.md
architecture → template__architecture-analysis.md
document → template__document-review.md
general → template__general-analysis.md
turn → template__turn-analysis.md

Before collecting evidence:

Read the selected template file.

Treat it as a schema.
Every section must be populated.
If a section cannot be filled write:

Not found

Step 5 — Evidence collection

Print:
[analysis] searching repository

Use:
Glob
Grep
Read

Rules

If an error string exists → grep exact string first

Then read the minimal files needed.

Print:

[analysis] reading files

Step 6 — Populate template

Print:

[analysis] generating report

Fill the template sections using gathered evidence.

Step 7 — Write report

Print:

[analysis] writing report

Filename format:

YYYY-MM-DD__{analysis-type}__{slug}.md

Examples:

docs/analysis/2026-03-05__codebase__todo-app.md
docs/analysis/2026-03-05__error__auth-failure.md

Use Write tool to create the report.

Step 8 — Completion

Return only:

Analysis written to: <filepath>
