#!/usr/bin/env bash
# App: coding-agents-config
# File: init-appfactory-project.sh
# Version: 0.5.0
# Task: 001,003,004
# Turns: 001,007,008,009;001,002;001
# Author: AI Coding Agent (claude-haiku-4-5-20251001)
# Date: 2026-04-07T21:54:49Z
# Description: Initialize AppFactory scaffold, optionally copy stack implementations, emit state.yaml, bootstrap Git, and publish with GitHub CLI.
# Log:
# 001, 001, 0.1.0, 2026/04/03, 04:31 PM UTC, AI Coding Agent (unknown)
# 001, 007, 0.2.0, 2026/04/04, 07:04 AM UTC, AI Coding Agent (unknown)
# 001, 008, 0.3.1, 2026/04/07, 06:40 PM UTC, AI Coding Agent (unknown)
set -euo pipefail
echo Initialization of new project.

PROJECT_ROOT_INPUT="${1:-.}"
AF_FACTORY_ROOT="${AF_FACTORY_ROOT:-$HOME/gallery/app-factory}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
AF_GITHUB_PROFILE="${AF_GITHUB_PROFILE:-}"
AF_CHECK_GITHUB_REPO_SCRIPT="${AF_CHECK_GITHUB_REPO_SCRIPT:-${SCRIPT_DIR}/check-github-repo.sh}"

resolve_project_root() {
    local input_path="$1"
    if [[ "$input_path" = /* ]]; then
        printf '%s\n' "$input_path"
        return 0
    fi
    printf '%s/%s\n' "$(pwd)" "$input_path"
}

check_repo_exists() {
    local owner="$1"
    local repo_name="$2"

    if [[ -n "$AF_CHECK_GITHUB_REPO_SCRIPT" ]]; then
        bash "$AF_CHECK_GITHUB_REPO_SCRIPT" "$owner" "$repo_name"
        return $?
    fi

    if ! command -v gh >/dev/null 2>&1; then
        echo "ERROR: gh is not installed and AF_CHECK_GITHUB_REPO_SCRIPT is not set." >&2
        return 1
    fi

    if ! gh auth status >/dev/null 2>&1; then
        echo "ERROR: gh is not authenticated and AF_CHECK_GITHUB_REPO_SCRIPT is not set." >&2
        return 1
    fi

    if gh repo view "$owner/$repo_name" --json nameWithOwner >/dev/null 2>&1; then
        echo "true"
    else
        echo "false"
    fi
}

PROJECT_ROOT="$(resolve_project_root "$PROJECT_ROOT_INPUT")"
PROJECT_NAME="$(basename "$PROJECT_ROOT")"
PROJECT_ID="${2:-${APP_FACTORY_PROJECT_ID:-$PROJECT_NAME}}"
PROJECT_YAML="${AF_FACTORY_ROOT}/projects/${PROJECT_ID}.yaml"

# ============================================================================
# VALIDATION CHECKS - All must pass before proceeding
# ============================================================================

# Check 1: Project YAML must exist in projects directory
if [[ ! -f "${PROJECT_YAML}" ]]; then
    echo "ERROR: Project YAML does not exist: ${PROJECT_YAML}" >&2
    echo "Create the project definition file first, then retry." >&2
    exit 1
fi

README_PATH="${PROJECT_ROOT}/README.md"
GITIGNORE_PATH="${PROJECT_ROOT}/.gitignore"
PROMPTS_DIR="${PROJECT_ROOT}/.appfactory/prompts"
SPECS_DIR="${PROJECT_ROOT}/.appfactory/specs"
MEMORY_DIR="${PROJECT_ROOT}/.appfactory/memory"
APP_DIR="${PROJECT_ROOT}/app"
STATE_FILE="${MEMORY_DIR}/state.yaml"

if [[ -z "$AF_GITHUB_PROFILE" ]]; then
    if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
        AF_GITHUB_PROFILE="$(gh api user --jq '.login')"
    else
        echo "ERROR: AF_GITHUB_PROFILE is not set." >&2
        exit 1
    fi
fi

# Check 2: GitHub repository must NOT already exist
REPO_EXISTS="$(check_repo_exists "$AF_GITHUB_PROFILE" "$PROJECT_ID")"
if [[ "$REPO_EXISTS" == "true" ]]; then
    echo "ERROR: GitHub repository already exists: https://github.com/${AF_GITHUB_PROFILE}/${PROJECT_ID}" >&2
    exit 1
fi

# Check 3: Project directory must NOT already exist on disk
if [[ -e "$PROJECT_ROOT" ]]; then
    echo "ERROR: Project directory already exists: ${PROJECT_ROOT}" >&2
    exit 1
fi

# ============================================================================
# VALIDATION PASSED - Proceeding with project initialization
# ============================================================================

mkdir -p "${PROMPTS_DIR}" "${SPECS_DIR}" "${MEMORY_DIR}" "${APP_DIR}"

touch "${PROMPTS_DIR}/.gitkeep"
touch "${SPECS_DIR}/.gitkeep"
touch "${MEMORY_DIR}/.gitkeep"
touch "${APP_DIR}/.gitkeep"

readme_content() {
    cat <<'README_EOF'
# AppFactory Project

## Overview

This repository is a new **agentic pipeline AppFactory project**.

It is intended to be used as the starting point for building a structured application through requirements, domain design, DSL definition, planning, code generation, and testing.

## AppFactory Workflow

1. Create the **PRD**.
2. Create the **domain-driven design**.
3. Create the **DSL** for the project.
4. Create the **task plan**.
5. Generate the **code and test**.
README_EOF
}

appfactory_readme_section() {
    cat <<'README_APPEND_EOF'

## AppFactory Initialization

This repository has been initialized as a new **agentic pipeline AppFactory project**.

### Workflow

1. Create the **PRD**.
2. Create the **domain-driven design**.
3. Create the **DSL** for the project.
4. Create the **task plan**.
5. Generate the **code and test**.
README_APPEND_EOF
}

gitignore_block() {
    cat <<'GITIGNORE_EOF'
# Operating system
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Environment
.env
.env.*
!.env.example

# Node
node_modules/
.npm/

# Build output
.next/
dist/
build/
out/
coverage/
.turbo/

# Python
__pycache__/
*.pyc
.venv/
venv/

# IDE
.vscode/
.idea/

# AppFactory temporary artifacts

GITIGNORE_EOF
}

read_yaml_field() {
    ruby -r yaml -e 'data = YAML.load_file(ARGV[0]) || {}; value = data.dig(*ARGV[1..]); puts(value || "")' "$PROJECT_YAML" "$@"
}

read_yaml_list() {
    ruby -r yaml -e 'data = YAML.load_file(ARGV[0]) || {}; Array(data[ARGV[1]]).each { |value| puts value }' "$PROJECT_YAML" "$1"
}

if [[ ! -f "${README_PATH}" ]]; then
    readme_content > "${README_PATH}"
    echo "CREATED ${README_PATH}"
else
    if ! grep -q "## AppFactory Initialization" "${README_PATH}"; then
        appfactory_readme_section >> "${README_PATH}"
        echo "UPDATED ${README_PATH}"
    else
        echo "SKIPPED ${README_PATH}"
    fi
fi

if [[ ! -f "${GITIGNORE_PATH}" ]]; then
    gitignore_block > "${GITIGNORE_PATH}"
    echo "CREATED ${GITIGNORE_PATH}"
else
    while IFS= read -r line; do
        if [[ -n "${line}" ]] && ! grep -Fqx "${line}" "${GITIGNORE_PATH}"; then
            echo "${line}" >> "${GITIGNORE_PATH}"
        fi
    done < <(gitignore_block)
    echo "UPDATED ${GITIGNORE_PATH}"
fi

echo "ENSURED ${PROMPTS_DIR}"
echo "ENSURED ${SPECS_DIR}"
echo "ENSURED ${MEMORY_DIR}"
echo "ENSURED ${APP_DIR}"
echo "ENSURED ${PROMPTS_DIR}/.gitkeep"
echo "ENSURED ${SPECS_DIR}/.gitkeep"
echo "ENSURED ${MEMORY_DIR}/.gitkeep"
echo "ENSURED ${APP_DIR}/.gitkeep"

if [[ -f "${PROJECT_YAML}" ]]; then
    PROJECT_DISPLAY_NAME="$(read_yaml_field project name)"
    PROJECT_DESCRIPTION="$(read_yaml_field project description)"
    STACK_REFS=()
    while IFS= read -r ref; do
        STACK_REFS+=("${ref}")
    done < <(read_yaml_list tech_stack_profiles)

    if [[ ${#STACK_REFS[@]} -gt 0 ]]; then
        RESOLVED_PROFILE_PATHS=()
        RESOLVED_IMPLEMENTATION_PATHS=()

        for ref in "${STACK_REFS[@]}"; do
            [[ -z "${ref}" ]] && continue

            implementation_source="${AF_FACTORY_ROOT}/tech-stack-implementations/${ref}"
            if [[ -d "${implementation_source}" ]]; then
                cp -R "${implementation_source}/." "${APP_DIR}/"
                echo "COPIED ${implementation_source} -> ${APP_DIR}"
                RESOLVED_IMPLEMENTATION_PATHS+=("tech-stack-implementations/${ref}")
            else
                echo "Warning: implementation path not found: ${implementation_source}"
            fi

            profile_source="${AF_FACTORY_ROOT}/tech-stack-profiles/${ref}.yaml"
            if [[ -f "${profile_source}" ]]; then
                RESOLVED_PROFILE_PATHS+=("tech-stack-profiles/${ref}.yaml")
            else
                echo "Warning: profile path not found: ${profile_source}"
            fi
        done

        # Generate state.yaml with provenance data
        RECORDED_AT="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
        APP_FACTORY_COMMIT="$(git -C "${AF_FACTORY_ROOT}" rev-parse HEAD 2>/dev/null || true)"
        SKILL_REPO_COMMIT="$(git -C "${SKILL_REPO_ROOT}" rev-parse HEAD 2>/dev/null || true)"
        PROFILE_PATH="${RESOLVED_PROFILE_PATHS[0]:-}"
        IMPLEMENTATION_PATH="${RESOLVED_IMPLEMENTATION_PATHS[0]:-}"
        STACK_REF="${STACK_REFS[0]:-none}"

        cat > "${STATE_FILE}" <<EOF
version: 1
kind: appfactory-project-state

project:
  id: "${PROJECT_ID}"
  name: "${PROJECT_DISPLAY_NAME}"
  description: "${PROJECT_DESCRIPTION}"
  source_yaml: "projects/${PROJECT_ID}.yaml"

stack:
  profile: "${STACK_REF}"
  profile_path: "${PROFILE_PATH:-null}"
  implementation_path: "${IMPLEMENTATION_PATH:-null}"

provenance:
  recorded_at: "${RECORDED_AT}"
  app_factory:
    repository_path: "${AF_FACTORY_ROOT}"
    commit: "${APP_FACTORY_COMMIT}"
  generator:
    skill: "af-project-init"
    skill_repository_path: "${SKILL_REPO_ROOT}"
    skill_repository_commit: "${SKILL_REPO_COMMIT}"

artifacts:
  prd:
    path: ".appfactory/specs/spec-be-prd.md"
    status: null
    created_at: null
    updated_at: null
  ddd:
    path: ".appfactory/specs/spec-be-ddd.md"
    status: null
    created_at: null
    updated_at: null
  dsl:
    path: ".appfactory/specs/dsl-be-ddd.yaml"
    status: null
    created_at: null
    updated_at: null
  plan:
    path: ".appfactory/specs/spec-be-plan.md"
    status: null
    created_at: null
    updated_at: null
  implementation_manifest:
    path: ".appfactory/specs/implementation-manifest.yaml"
    status: null
    created_at: null

workflow:
  current_stage: init
  stages:
    init:
      status: complete
      completed_at: "${RECORDED_AT}"
      skill_invocation: "af-project-init"
      requires: []
    prd:
      status: pending
      completed_at: null
      skill_invocation: "af-be-build-prd"
      requires:
        - init
    ddd:
      status: pending
      completed_at: null
      skill_invocation: "af-be-build-ddd"
      requires:
        - prd
    dsl:
      status: pending
      completed_at: null
      skill_invocation: "af-be-build-dsl"
      requires:
        - ddd
    plan:
      status: pending
      completed_at: null
      skill_invocation: "af-be-build-plan"
      requires:
        - dsl
    implementation:
      status: pending
      completed_at: null
      skill_invocation: "af-be-build-implementation"
      requires:
        - plan

runtime:
  target_directory: "${PROJECT_ROOT}"
  app_factory_home: "${AF_FACTORY_ROOT}"
  bounded_contexts: []
  turn_recommendation: null

history:
  - timestamp: "${RECORDED_AT}"
    stage: init
    action: completed
    agent: "af-project-init"
EOF

        echo "CREATED ${STATE_FILE}"
    else
        echo "Warning: ${PROJECT_YAML} does not define tech_stack_profiles. Skipping implementation copy and state generation."
    fi
fi

cd "${PROJECT_ROOT}"

if [[ ! -d ".git" ]]; then
    git init -b main
else
    git branch -M main
fi

if ! git config user.name >/dev/null 2>&1; then
    git config user.name "AppFactory"
fi
if ! git config user.email >/dev/null 2>&1; then
    git config user.email "appfactory@local.invalid"
fi

git add .
if ! git diff --cached --quiet; then
    git commit -m "Project Initialized by App Factory"
fi

if command -v gh >/dev/null 2>&1; then
    if gh auth status >/dev/null 2>&1; then
        REPO_NAME="${PROJECT_ID}"
        REPO_FULL_NAME="${AF_GITHUB_PROFILE}/${REPO_NAME}"

        if ! gh repo view "${REPO_FULL_NAME}" >/dev/null 2>&1; then
            echo "Creating GitHub repository: ${REPO_FULL_NAME}"
            if gh repo create "${REPO_FULL_NAME}" --source=. --remote=origin --private --push; then
                echo "Successfully created and pushed to: https://github.com/${REPO_FULL_NAME}"
            else
                echo "Warning: GitHub repo creation or push failed. You can retry with: gh repo create ${REPO_FULL_NAME} --source=. --push"
            fi
        else
            if ! git remote get-url origin >/dev/null 2>&1; then
                gh repo set-default "${REPO_FULL_NAME}" >/dev/null 2>&1 || true
                git remote add origin "git@github.com:${REPO_FULL_NAME}.git"
            fi
            echo "Pushing to GitHub: ${REPO_FULL_NAME}"
            if git push -u origin main; then
                echo "Successfully pushed to: https://github.com/${REPO_FULL_NAME}"
            else
                echo "Warning: GitHub push failed. You can push manually with: git push -u origin main"
            fi
        fi
    else
        echo "Warning: gh is installed but not authenticated. Skipping GitHub push."
    fi
else
    echo "Warning: gh is not installed. Skipping GitHub push."
fi

echo "Project initialized at: ${PROJECT_ROOT}"
