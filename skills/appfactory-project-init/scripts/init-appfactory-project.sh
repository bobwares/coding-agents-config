#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="${1:-.}"
README_PATH="${PROJECT_ROOT}/README.md"
GITIGNORE_PATH="${PROJECT_ROOT}/.gitignore"
PROMPTS_DIR="${PROJECT_ROOT}/AI/prompts"
SPECS_DIR="${PROJECT_ROOT}/AI/specs"

mkdir -p "${PROMPTS_DIR}" "${SPECS_DIR}"

touch "${PROMPTS_DIR}/.gitkeep"
touch "${SPECS_DIR}/.gitkeep"

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
AI/tmp/
AI/output/
GITIGNORE_EOF
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
echo "ENSURED ${PROMPTS_DIR}/.gitkeep"
echo "ENSURED ${SPECS_DIR}/.gitkeep"
