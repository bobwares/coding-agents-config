---
name: project-init
description: Initialize a new AppFactory project scaffold with the App Factory Workflow structure. Creates the ai/specs hierarchy (shared/backend/frontend/plans/templates), AI prompts, git repository, main branch, initial commit, and attempts GitHub push with gh.
---

# project-init

## Purpose

Use this skill to initialize a new **AppFactory** project scaffold in a target parent directory.

The skill creates a new project directory using the provided project name and scaffolds the App Factory Workflow structure, including documentation templates, AI prompts, Git repository, and first commit.

## Required Input

This skill requires **both** of the following inputs:

1. **target_directory**
   A valid existing directory path where the new project directory will be created.

2. **project_name**
   The name of the new project directory to create.

## Validation Rules

The skill must refuse execution unless all the following are true:

1. `target_directory` is provided.
2. `project_name` is provided.
3. `target_directory` exists.
4. `target_directory` is a directory.
5. `project_name` is a valid directory name for the local operating system.
6. The destination path `target_directory/project_name` does not already exist.
7. If `gh` is authenticated, the GitHub repository `<github-user>/<project_name>` must not already exist.

If any requirement fails, show this error pattern and stop:

```text
Error: project-init requires valid input.
Provide:
- a valid existing target directory
- a new project name

Example:
project-init target_directory=/Users/bobware/gallery project_name=customer-domain
```

## Outputs

The skill creates the following directory structure:

```text
<project_name>/
├── .gitignore
├── README.md
└── ai/
    ├── prompts/
    │   ├── prompt-template.md
    │   ├── prd-prompt.md
    │   ├── ddd-prompt.md
    │   ├── dsl-prompt.md
    │   ├── task-plan-prompt.md
    │   └── codegen-test-prompt.md
    └── specs/
        ├── app-factory-workflow.md
        ├── shared/
        ├── backend/
        ├── frontend/
        │   ├── wireframes/
        │   └── dsl/
        ├── plans/
        └── templates/
            ├── template-glossary-shared.md
            ├── template-ddd-shared.md
            ├── template-prd-be.md
            ├── template-ddd-be.md
            ├── template-api-be.yaml
            ├── template-prd-fe.md
            ├── template-screen-fe.md
            ├── template-wire-ux.md
            ├── template-dsl-fe.yaml
            ├── template-plan-fullstack.md
            └── template-trace-fullstack.md
```

## App Factory Workflow

The generated project follows the App Factory Workflow with this authoring sequence:

1. Create the **business scope**
2. Create the **shared glossary**
3. Create the **shared domain foundation**
4. Create the **backend PRD**
5. Create the **backend DDD**
6. Create the **API / service contract**
7. Create the **frontend PRD**
8. Create the **screen catalog**
9. Create the **wireframes**
10. Create the **UI DSL** files
11. Create the **implementation plan**
12. Create the **traceability matrix**
13. Start implementation and testing

## Naming Conventions

Artifacts follow this pattern: `<artifact-type>-<scope>-<domain>-<capability>-v<major>.<minor>.<ext>`

| Scope | Meaning |
| ----- | ------- |
| `shared` | Cross-layer canonical artifact |
| `be` | Backend artifact |
| `fe` | Frontend artifact |
| `ux` | UX or wireframe artifact |
| `fullstack` | Cross-layer delivery artifact |

## Templates Included

| Template                      | Purpose                     |
|-------------------------------|-----------------------------|
| `template-glossary-shared.md` | Shared business terminology |
| `template-ddd-shared.md`      | Shared domain foundation    |
| `template-prd-be.md`          | Backend requirements        |
| `template-ddd-be.md`          | Backend domain design       |
| `template-api-be.yaml`        | API contract (OpenAPI)      |
| `template-prd-fe.md`          | Frontend requirements       |
| `template-screen-fe.md`       | Screen catalog              |
| `template-wire-ux.md`         | Wireframe definition        |
| `template-dsl-fe.yaml`        | UI DSL specification        |
| `template-plan-fullstack.md`  | Implementation plan         |
| `template-trace-fullstack.md` | Traceability matrix         |

## Execution

Run:

```bash
bash "$(dirname "$0")/scripts/init-appfactory-project.sh" "<target_directory>" "<project_name>"
```

Example:

```bash
bash "$(dirname "$0")/scripts/init-appfactory-project.sh" "/Users/bobware/gallery" "customer-domain"
```

## Notes

- The destination project directory is created as: `<target_directory>/<project_name>`
- Git is initialized with `main` as the default branch
- Initial commit message is: `Project Initialized by App Factory`
- The script attempts to create and push the repository to the authenticated GitHub profile using `gh`
- Placeholders like `{{PROJECT_NAME}}` and `{{CURRENT_DATE}}` are replaced automatically

## Additional Repository Guard

After validating the local inputs, the script checks whether the GitHub repository already exists for the authenticated `gh` user.

If the repository already exists, the script halts before creating the project scaffold and prints:

```text
Error: project-init cannot continue because the GitHub repository already exists.
Details: <github-user>/<project_name>
```

This check only runs when `gh` is installed and authenticated.
