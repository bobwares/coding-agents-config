# ADR: Fix PROJECT_ID vs PROJECT_NAME Mismatch in GitHub Push

## Status
Accepted

## Context
The `af-project-init` skill was not pushing new projects to GitHub. Investigation revealed that line 79 uses `$PROJECT_ID` for the early repo existence check, but line 314 used `$PROJECT_NAME` for repo creation. These variables can differ when:
- A second argument is passed to the script
- `APP_FACTORY_PROJECT_ID` environment variable is set

## Decision
Change line 313 from `REPO_NAME="${PROJECT_NAME}"` to `REPO_NAME="${PROJECT_ID}"` to ensure consistency with the early existence check. Also added progress/success messages for better observability.

## Consequences
- GitHub repo name now correctly matches the project ID
- Users see explicit feedback about repo creation and push status
- Script version bumped to 0.3.3
