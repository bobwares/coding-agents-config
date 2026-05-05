# ADR: Add required environment variables to CLAUDE.md

**Status:** Accepted  
**Date:** 2026-04-07  
**Task:** 003  
**Turn:** 003

## Context

The `init-appfactory-project.sh` script requires environment variables that were previously documented only as informal constants.

## Decision

Added an "Environment Variables" section to CLAUDE.md with exportable bash variables:

- `APP_FACTORY_ROOT` - Path to AppFactory installation
- `AF_GITHUB_PROFILE` - GitHub username for repo creation
- `GENERATED_PROJECT_ROOT` - Default directory for generated projects

## Consequences

- Scripts can reference these variables directly
- Values match existing Container Constants
- Consistent with script requirements
