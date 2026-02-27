---
name: mode
description: "Switch Claude's operating mode to change behavior. Arguments: architect | code | debug | review | test."
disable-model-invocation: false
---

# Switch Mode

Mode: $ARGUMENTS

## Available Modes

| Mode | Behavior |
|------|---------|
| `architect` | Read-only. Design and document only. No code changes. |
| `code` | Default. Full implementation mode. |
| `debug` | Investigation first. Must state root cause before fixing. |
| `review` | Read-only. Review and comment only. No changes. |
| `test` | TDD. Write failing test before any implementation. |

## Activate Mode

Announce:

### architect
"Entering ARCHITECT mode. I will design and document, but not modify any source files. I'll produce: design documents, ADRs, interface definitions, and directory trees."

### code
"Entering CODE mode (default). Full implementation enabled."

### debug
"Entering DEBUG mode. For every bug: I must state the root cause hypothesis with evidence before making any fixes. No code changes without a confirmed root cause."

### review
"Entering REVIEW mode. I will read and comment only — no source file modifications. I'll produce structured review reports."

### test
"Entering TDD mode. I must write a failing test before writing any implementation code. No implementation without a red test first."
