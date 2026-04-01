---
name: appfactory-project-init
description: Initialize a new AppFactory project with the base agentic-pipeline scaffold, including AI/prompts, AI/specs, .gitignore, and a project README.
triggers:
  - initialize appfactory project
  - create appfactory project scaffold
  - bootstrap new appfactory repo
  - start new appfactory project
  - create agentic pipeline appfactory project
---

# AppFactory Project Init

## Purpose

Use this skill to create the initial scaffold for a brand-new **AppFactory** project. It creates the minimum required structure for an agentic pipeline project and writes the baseline project documentation.

## What This Skill Creates

At the repository root, this skill creates:

1. `AI/prompts/`
2. `AI/specs/`
3. `.gitignore`
4. `README.md`

It also adds `.gitkeep` files so the `AI/prompts` and `AI/specs` directories are preserved in Git.

## When To Use

Use this skill when:

- starting a new **AppFactory** project from an empty or near-empty repository
- converting a plain repository into an **AppFactory** agentic-pipeline repository
- standardizing the initial folder structure before writing requirements and design artifacts

## Inputs

### Required

- project root directory

### Optional

- project name
- short system description
- preferred stack summary to mention in the README

If optional values are not provided, use safe defaults.

## Execution Rules

1. Run from the repository root.
2. Do not delete existing project files.
3. Only create missing directories and files unless the user explicitly asks for overwrite behavior.
4. If `README.md` already exists, append an **AppFactory Initialization** section instead of replacing the whole file.
5. If `.gitignore` already exists, merge the missing entries rather than replacing it.
6. Preserve existing user content whenever possible.

## Procedure

### Step 1

Validate that the current working directory is the intended project root.

### Step 2

Create the base directories:

- `AI/prompts`
- `AI/specs`

### Step 3

Add `.gitkeep` files to both directories if they do not already exist.

### Step 4

Create or update `.gitignore` with standard development and agentic-pipeline ignore rules.

### Step 5

Create or update `README.md` with:

- statement that the repository is a new **AppFactory** agentic-pipeline project
- purpose of the repository
- required workflow steps in order:
  1. create the PRD
  2. create the domain-driven design
  3. create the DSL for the project
  4. create the task plan
  5. generate the code and test

### Step 6

Report exactly what was created or updated.

## Output Expectations

Return a concise summary containing:

- directories created
- files created
- files updated
- any skipped files because they already existed

## Recommended Command

Use the helper script in this skill:

`bash scripts/init-appfactory-project.sh`

## Notes

This skill intentionally creates only the **initial scaffold**. It does not generate the PRD, DDD, DSL, task plan, code, or tests. Those are the next stages of the AppFactory workflow.
