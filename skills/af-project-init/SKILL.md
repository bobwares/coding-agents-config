---
name: af-project-init
description: Initialize a new AppFactory project with the base agentic-pipeline scaffold, including AI/prompts, AI/specs, .gitignore, a project README, Git initialization, and an initial publish attempt with `gh`.
triggers:
  - initialize AppFactory project
  - create AppFactory project scaffold
  - bootstrap new AppFactory repo
  - start new AppFactory project
  - create agentic pipeline AppFactory project
memory-integration:
  writes_to:
    - project.name
    - project.repository
    - project.created_at
    - config.tech_stack
    - config.tech_stack_path
    - config.target_project
    - progress.current_phase
    - directories.*
---

# AppFactory Project Init

## Purpose

Use this skill to create the initial scaffold for a brand-new **AppFactory** project. It creates the minimum required structure for an agentic pipeline project, writes the baseline project documentation, initializes Git, and attempts the initial GitHub publish when `gh` is available and authenticated.

## What This Skill Creates

At the repository root, this skill creates:

1. `.appfactory/prompts/`
2. `.appfactory/specs/`
3. `app`
4. `.appfactory/provenance.json`
5. `.gitignore`
6. `README.md`

It also adds `.gitkeep` files so the directories are preserved in Git.
When a matching AppFactory project YAML exists, it copies the referenced implementation stack into `app/` and writes `.appfactory/provenance.json` with the project YAML path, stack refs, resolved profile paths, resolved implementation paths, and AppFactory commit.
When the directory is not already a Git repository, it also initializes Git on `main`, creates the initial commit, and attempts to create and push the matching GitHub repository.


## Directory Structure

```
[application default directory]/
└── [project name]/
    ├── .appfactory/
    │   ├── prompts/
    │   │   └── .gitkeep
    │   ├── specs/
    │   │   └── .gitkeep
    │   └── provenance.json
    ├── app/
    │   └── .gitkeep
    ├── .gitignore
    └── README.md
```

## When To Use

Use this skill when:

- starting a new **AppFactory** project from an empty repository

## Inputs

- project id

## Usage

> /af-project-init [projectId]

## Execution Rules

1. Run from the repository root.
2. Do not delete existing project files.


## Procedure

### Step 1

read [App Factory]/projects/[projectId].yaml and store as projectObject.

if [App Factory]/projects/[projectId].yaml does not exist
then STOP execution of this SKILL.  Respond "Project Yaml does not exist."


### Step 2

- Check if directory [application default directory]/[project name].
- if the directory [application default directory]/[project name] does not exist then
  - Create the directory: [application default directory]/[project name].
  - change working directory to [application default directory]/[project name].
- else
  - Stop.  respond with message "The directory [application default directory]/[project name] already exists.".


### Step 2

Create the base directories:

- `.appfactory/prompts`
- `.appfactory/specs`
- `app/`

### Step 3

copy [AppFactory Implementations][projectObject.tech_stack_profiles] to `app` directory and create `.appfactory/provenance.json`.

### Step 4

Create `.gitignore`
with standard development and agentic-pipeline ignore rules.

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

Initialize Git in the project root using `main` as the default branch.

Stage the generated scaffold and create the initial commit:

`Project Initialized by App Factory`

### Step 7

If `gh` is installed and authenticated:

- attempt to create the GitHub repository named after the project directory
- add `origin` if needed
- push `main`

### Step 8

Report exactly what was created or updated.

## Output Expectations

Return a concise summary containing:

- directories created
- files created
- files updated
- repository actions performed
- provenance file created or skipped
- any skipped files because they already existed

## Recommended Command

Use the helper script in this skill:

`APP_FACTORY_PROJECT_ID=[projectId] bash scripts/init-appfactory-project.sh [projectRoot]`

## Notes

This skill intentionally creates only the **initial scaffold**. It does not generate the PRD, DDD, DSL, task plan, code, or tests. Those are the next stages of the AppFactory workflow.

If `gh` is unavailable or unauthenticated, the scaffold still completes locally and the script reports that GitHub publishing was skipped.

The helper script accepts an optional `APP_FACTORY_PROJECT_ID` environment variable or second positional argument. If neither is provided, it derives the project id from the target directory name.

## Memory Integration

This skill integrates with the AppFactory memory system via `af-memory`.

### Post-Execution

After successfully initializing the project:

1. Initialize the memory state file:
   ```
   af-memory init [project-name]
   ```

2. Set project configuration:
   ```
   af-memory write project.name "[project-name]"
   af-memory write project.repository "[repository-url]"
   af-memory write project.created_at "[ISO_TIMESTAMP]"
   af-memory write config.tech_stack "[tech-stack-name]"
   af-memory write config.tech_stack_path "[tech-stack-path]"
   af-memory write config.target_project "[target-path]"
   ```

3. Set initial pipeline phase:
   ```
   af-memory write progress.current_phase "prd"
   ```

4. Verify state initialization:
   ```
   af-memory status
   ```
