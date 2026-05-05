# ADR: Refactor af-state.sh to project root and update skills

**Status:** Accepted  
**Date:** 2026-04-07  
**Task:** 003  
**Turn:** 002

## Context

The `af-state.sh` script was located inside `skills/af-memory/scripts/`. Other skills needed to source this script to read/write state, making the path reference awkward.

## Decision

1. Moved `af-state.sh` from `skills/af-memory/scripts/` to `scripts/` at project root
2. Updated all `af-*` skills to use the script functions directly:
   - `af-project-init`: Uses `af_state_init` to create state file
   - `af-be-build-prd`: Reads output path from `artifacts.prd.path`
   - `af-be-build-ddd`: Reads PRD input path, DDD output path from state
   - `af-be-build-dsl`: Reads DDD input path, DSL output path from state
   - `af-be-build-plan`: Reads DSL input path, plan output path from state
3. Replaced `af-memory` command-style interface with direct function calls

## Consequences

- Skills source the script with: `source "$HOME/coding-agents-config/scripts/af-state.sh"`
- Artifact paths are now read from `.appfactory/state.yaml` rather than hardcoded
- Stage lifecycle is managed with `af_state_stage_*` functions
- Prerequisite checking uses `af_state_prereqs_met` or `af_state_stage_complete`
