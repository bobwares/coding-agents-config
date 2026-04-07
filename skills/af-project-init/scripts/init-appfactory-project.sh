#!/usr/bin/env bash
# App: coding-agents-config
# File: init-appfactory-project.sh
# Version: 0.3.0
# Task: 001
# Turns: 001,007
# Author: AI Coding Agent (unknown)
# Date: 2026-04-04T16:40:00Z
# Description: Initialize AppFactory scaffold, optionally copy stack implementations, emit provenance, bootstrap Git, and publish with GitHub CLI.
# Log:
# 001, 001, 0.1.0, 2026/04/03, 04:31 PM UTC, AI Coding Agent (unknown)
# 001, 007, 0.2.0, 2026/04/04, 07:04 AM UTC, AI Coding Agent (unknown)
set -euo pipefail

PROJECT_ROOT_INPUT="${1:-.}"
APP_FACTORY_ROOT="${APP_FACTORY_ROOT:-$HOME/gallery/app-factory}"
SKILL_REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"

mkdir -p "${PROJECT_ROOT_INPUT}"
PROJECT_ROOT="$(cd "${PROJECT_ROOT_INPUT}" && pwd)"
PROJECT_NAME="$(basename "${PROJECT_ROOT}")"
PROJECT_ID="${2:-${APP_FACTORY_PROJECT_ID:-$PROJECT_NAME}}"
PROJECT_YAML="${APP_FACTORY_ROOT}/projects/${PROJECT_ID}.yaml"
README_PATH="${PROJECT_ROOT}/README.md"
GITIGNORE_PATH="${PROJECT_ROOT}/.gitignore"
PROMPTS_DIR="${PROJECT_ROOT}/.appfactory/prompts"
SPECS_DIR="${PROJECT_ROOT}/.appfactory/specs"
APP_DIR="${PROJECT_ROOT}/app"
PROVENANCE_DIR="${PROJECT_ROOT}/.appfactory"
PROVENANCE_PATH="${PROVENANCE_DIR}/provenance.json"

mkdir -p "${PROMPTS_DIR}" "${SPECS_DIR}" "${APP_DIR}"

touch "${PROMPTS_DIR}/.gitkeep"
touch "${SPECS_DIR}/.gitkeep"
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
echo "ENSURED ${APP_DIR}"
echo "ENSURED ${PROMPTS_DIR}/.gitkeep"
echo "ENSURED ${SPECS_DIR}/.gitkeep"
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

            implementation_source="${APP_FACTORY_ROOT}/tech-stack-implementations/${ref}"
            if [[ -d "${implementation_source}" ]]; then
                cp -R "${implementation_source}/." "${APP_DIR}/"
                echo "COPIED ${implementation_source} -> ${APP_DIR}"
                RESOLVED_IMPLEMENTATION_PATHS+=("tech-stack-implementations/${ref}")
            else
                echo "Warning: implementation path not found: ${implementation_source}"
            fi

            profile_source="${APP_FACTORY_ROOT}/tech-stack-profiles/${ref}.yaml"
            if [[ -f "${profile_source}" ]]; then
                RESOLVED_PROFILE_PATHS+=("tech-stack-profiles/${ref}.yaml")
            else
                echo "Warning: profile path not found: ${profile_source}"
            fi
        done

        mkdir -p "${PROVENANCE_DIR}"
        RECORDED_AT="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
        APP_FACTORY_COMMIT="$(git -C "${APP_FACTORY_ROOT}" rev-parse HEAD 2>/dev/null || true)"
        SKILL_REPO_COMMIT="$(git -C "${SKILL_REPO_ROOT}" rev-parse HEAD 2>/dev/null || true)"
        export RECORDED_AT PROJECT_ID PROJECT_DISPLAY_NAME PROJECT_DESCRIPTION APP_FACTORY_ROOT APP_FACTORY_COMMIT SKILL_REPO_ROOT SKILL_REPO_COMMIT
        export PROJECT_YAML_REL="projects/${PROJECT_ID}.yaml"
        export STACK_REFS_JOINED="$(printf '%s
' "${STACK_REFS[@]}")"
        export PROFILE_PATHS_JOINED="$(printf '%s
' "${RESOLVED_PROFILE_PATHS[@]}")"
        export IMPLEMENTATION_PATHS_JOINED="$(printf '%s
' "${RESOLVED_IMPLEMENTATION_PATHS[@]}")"

        ruby -r json -e '
          split_lines = ->(value) { value.to_s.split("
").reject(&:empty?) }
          data = {
            schemaVersion: "1.0.0",
            recordedAt: ENV.fetch("RECORDED_AT"),
            project: {
              id: ENV.fetch("PROJECT_ID"),
              name: ENV.fetch("PROJECT_DISPLAY_NAME", ""),
              description: ENV.fetch("PROJECT_DESCRIPTION", ""),
              projectYamlPath: ENV.fetch("PROJECT_YAML_REL")
            },
            appFactory: {
              repositoryPath: ENV.fetch("APP_FACTORY_ROOT"),
              commit: ENV.fetch("APP_FACTORY_COMMIT", ""),
              stackProfileRefs: split_lines.call(ENV["STACK_REFS_JOINED"]),
              resolvedProfilePaths: split_lines.call(ENV["PROFILE_PATHS_JOINED"]),
              resolvedImplementationPaths: split_lines.call(ENV["IMPLEMENTATION_PATHS_JOINED"])
            },
            generator: {
              skill: "af-project-init",
              skillRepositoryPath: ENV.fetch("SKILL_REPO_ROOT"),
              skillRepositoryCommit: ENV.fetch("SKILL_REPO_COMMIT", "")
            }
          }
          File.write(ARGV[0], JSON.pretty_generate(data) + "
")
        ' "${PROVENANCE_PATH}"

        echo "CREATED ${PROVENANCE_PATH}"
    else
        echo "Warning: ${PROJECT_YAML} does not define tech_stack_profiles. Skipping implementation copy and provenance generation."
    fi
else
    echo "Warning: project yaml not found at ${PROJECT_YAML}. Skipping implementation copy and provenance generation."
fi

cd "${PROJECT_ROOT}"

if [[ ! -d ".git" ]]; then
    git init -b main
else
    git branch -M main
fi

git add .
if ! git diff --cached --quiet; then
    git commit -m "Project Initialized by App Factory"
fi

if command -v gh >/dev/null 2>&1; then
    if gh auth status >/dev/null 2>&1; then
        GH_USER="$(gh api user --jq '.login')"
        REPO_NAME="${PROJECT_NAME}"
        REPO_FULL_NAME="${GH_USER}/${REPO_NAME}"

        if ! gh repo view "${REPO_FULL_NAME}" >/dev/null 2>&1; then
            if ! gh repo create "${REPO_FULL_NAME}" --source=. --remote=origin --private --push 2>&1; then
                echo "Warning: GitHub repo creation or push failed. You can retry with: gh repo create ${REPO_FULL_NAME} --source=. --push"
            fi
        else
            if ! git remote get-url origin >/dev/null 2>&1; then
                gh repo set-default "${REPO_FULL_NAME}" >/dev/null 2>&1 || true
                git remote add origin "git@github.com:${REPO_FULL_NAME}.git"
            fi
            if ! git push -u origin main 2>&1; then
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
