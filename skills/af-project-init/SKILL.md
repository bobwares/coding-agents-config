---
name: af-project-init
description: "Orchestrate AppFactory project initialization by exporting required environment variables and invoking the helper script."
---

# AppFactory Project Init

## Inputs

- `PROJECT_ID`

## Usage

```bash
/af-project-init <project-id>
```

## Procedure

```bash
export AF_ROOT="${APP_FACTORY_ROOT:?APP_FACTORY_ROOT must be set in CLAUDE.md}"
export AF_GITHUB_PROFILE="${AF_GITHUB_PROFILE:?AF_GITHUB_PROFILE must be set in CLAUDE.md}"
export AF_GENERATED_PROJECT_ROOT="${AF_GENERATED_PROJECT_ROOT:?AF_GENERATED_PROJECT_ROOT must be set in CLAUDE.md}"
export PROJECT_ID="$1"

bash ~/.claude/skills/af-project-init/scripts/init-appfactory-project.sh "${AF_GENERATED_PROJECT_ROOT}/${PROJECT_ID}" "$PROJECT_ID"
```

## Output

- Report the script results.
