---
name: spec-prd-list
description: List all PRDs and epics with their current status. No arguments needed.
disable-model-invocation: false
---

# List PRDs and Epics

## PRDs

List all files in `.claude/prds/`:

For each file found, read the frontmatter and display:

| Name | Status | Created | Title |
|------|--------|---------|-------|
| [filename] | [status] | [created] | [title] |

If empty: "No PRDs yet. Run `/spec-prd-new <feature-name>` to create your first one."

## Epics

List all subdirectories in `.claude/epics/`:

For each epic directory, read `epic.md` frontmatter:

| Epic | Status | Branch | Tasks Done |
|------|--------|--------|-----------|
| [name] | [status] | [branch] | X/N |

Count tasks: grep for `- [x]` (done) vs `- [ ]` (pending) in each epic.md.

## Current Git Branch

Show current branch and any in-progress work:

Run: `git branch --show-current && git status --short | head -10`

## Suggestion

Based on the status report, suggest the next action:
- If there's an in-progress epic: "Continue with `/spec-task-next <epic>`"
- If there are planned epics: "Start with `/spec-epic-start <epic>`"
- If no PRDs: "Create your first feature with `/spec-prd-new <feature>`"
