#!/usr/bin/env bash
set -euo pipefail

error_usage() {
  cat <<'EOF'
Error: project-init requires valid input.
Provide:
- a valid existing target directory
- a new project name

Example:
project-init target_directory=/Users/bobware/gallery project_name=customer-domain
EOF
}

is_valid_project_name() {
  local name="$1"

  if [[ -z "${name}" ]]; then
    return 1
  fi

  if [[ "${name}" == "." || "${name}" == ".." ]]; then
    return 1
  fi

  if [[ "${name}" == *"/"* ]]; then
    return 1
  fi

  return 0
}

TARGET_DIRECTORY="${1:-}"
PROJECT_NAME="${2:-}"

if [[ -z "${TARGET_DIRECTORY}" || -z "${PROJECT_NAME}" ]]; then
  error_usage
  exit 1
fi

if [[ ! -e "${TARGET_DIRECTORY}" ]]; then
  error_usage
  echo
  echo "Details: target directory does not exist: ${TARGET_DIRECTORY}"
  exit 1
fi

if [[ ! -d "${TARGET_DIRECTORY}" ]]; then
  error_usage
  echo
  echo "Details: target path is not a directory: ${TARGET_DIRECTORY}"
  exit 1
fi

if ! is_valid_project_name "${PROJECT_NAME}"; then
  error_usage
  echo
  echo "Details: invalid project name: ${PROJECT_NAME}"
  exit 1
fi

DESTINATION_DIR="${TARGET_DIRECTORY%/}/${PROJECT_NAME}"

if [[ -e "${DESTINATION_DIR}" ]]; then
  error_usage
  echo
  echo "Details: destination already exists: ${DESTINATION_DIR}"
  exit 1
fi

if command -v gh >/dev/null 2>&1; then
  if gh auth status >/dev/null 2>&1; then
    GH_USER="$(gh api user --jq '.login')"
    REPO_FULL_NAME="${GH_USER}/${PROJECT_NAME}"

    if gh repo view "${REPO_FULL_NAME}" >/dev/null 2>&1; then
      echo "Error: project-init cannot continue because the GitHub repository already exists."
      echo "Details: ${REPO_FULL_NAME}"
      exit 1
    fi
  fi
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
TEMPLATES_DIR="${SKILL_ROOT}/templates"

# Create directory structure
mkdir -p "${DESTINATION_DIR}"

# AI structure (specs + prompts)
mkdir -p "${DESTINATION_DIR}/ai/specs/shared"
mkdir -p "${DESTINATION_DIR}/ai/specs/backend"
mkdir -p "${DESTINATION_DIR}/ai/specs/frontend/wireframes"
mkdir -p "${DESTINATION_DIR}/ai/specs/frontend/dsl"
mkdir -p "${DESTINATION_DIR}/ai/specs/plans"
mkdir -p "${DESTINATION_DIR}/ai/specs/templates"
mkdir -p "${DESTINATION_DIR}/ai/prompts"

# Copy root files
cp "${TEMPLATES_DIR}/gitignore.template" "${DESTINATION_DIR}/.gitignore"
cp "${TEMPLATES_DIR}/README.md" "${DESTINATION_DIR}/README.md"

# Copy App Factory Workflow documentation
cp "${TEMPLATES_DIR}/ai/specs/app-factory-workflow.md" "${DESTINATION_DIR}/ai/specs/app-factory-workflow.md"

# Copy all templates
cp "${TEMPLATES_DIR}/ai/specs/templates/template-glossary-shared.md" "${DESTINATION_DIR}/ai/specs/templates/template-glossary-shared.md"
cp "${TEMPLATES_DIR}/ai/specs/templates/template-ddd-shared.md" "${DESTINATION_DIR}/ai/specs/templates/template-ddd-shared.md"
cp "${TEMPLATES_DIR}/ai/specs/templates/template-prd-be.md" "${DESTINATION_DIR}/ai/specs/templates/template-prd-be.md"
cp "${TEMPLATES_DIR}/ai/specs/templates/template-ddd-be.md" "${DESTINATION_DIR}/ai/specs/templates/template-ddd-be.md"
cp "${TEMPLATES_DIR}/ai/specs/templates/template-api-be.yaml" "${DESTINATION_DIR}/ai/specs/templates/template-api-be.yaml"
cp "${TEMPLATES_DIR}/ai/specs/templates/template-prd-fe.md" "${DESTINATION_DIR}/ai/specs/templates/template-prd-fe.md"
cp "${TEMPLATES_DIR}/ai/specs/templates/template-screen-fe.md" "${DESTINATION_DIR}/ai/specs/templates/template-screen-fe.md"
cp "${TEMPLATES_DIR}/ai/specs/templates/template-wire-ux.md" "${DESTINATION_DIR}/ai/specs/templates/template-wire-ux.md"
cp "${TEMPLATES_DIR}/ai/specs/templates/template-dsl-fe.yaml" "${DESTINATION_DIR}/ai/specs/templates/template-dsl-fe.yaml"
cp "${TEMPLATES_DIR}/ai/specs/templates/template-plan-fullstack.md" "${DESTINATION_DIR}/ai/specs/templates/template-plan-fullstack.md"
cp "${TEMPLATES_DIR}/ai/specs/templates/template-trace-fullstack.md" "${DESTINATION_DIR}/ai/specs/templates/template-trace-fullstack.md"

# Copy AI prompts
cp "${TEMPLATES_DIR}/ai/prompts/prompt-template.md" "${DESTINATION_DIR}/ai/prompts/prompt-template.md"
cp "${TEMPLATES_DIR}/ai/prompts/prd-prompt.md" "${DESTINATION_DIR}/ai/prompts/prd-prompt.md"
cp "${TEMPLATES_DIR}/ai/prompts/ddd-prompt.md" "${DESTINATION_DIR}/ai/prompts/ddd-prompt.md"
cp "${TEMPLATES_DIR}/ai/prompts/dsl-prompt.md" "${DESTINATION_DIR}/ai/prompts/dsl-prompt.md"
cp "${TEMPLATES_DIR}/ai/prompts/task-plan-prompt.md" "${DESTINATION_DIR}/ai/prompts/task-plan-prompt.md"
cp "${TEMPLATES_DIR}/ai/prompts/codegen-test-prompt.md" "${DESTINATION_DIR}/ai/prompts/codegen-test-prompt.md"

# Replace placeholders
CURRENT_DATE="$(date +%Y-%m-%d)"

if command -v python3 >/dev/null 2>&1; then
  python3 - <<PY
from pathlib import Path
import os

project_name = ${PROJECT_NAME@Q}
current_date = ${CURRENT_DATE@Q}
dest_dir = Path(${DESTINATION_DIR@Q})

# Files to process for placeholder replacement
files_to_process = [
    dest_dir / "README.md",
    dest_dir / "ai/specs/app-factory-workflow.md",
]

# Also process all templates
templates_dir = dest_dir / "ai/specs/templates"
if templates_dir.exists():
    files_to_process.extend(templates_dir.glob("*"))

for path in files_to_process:
    if path.exists() and path.is_file():
        content = path.read_text()
        content = content.replace("{{PROJECT_NAME}}", project_name)
        content = content.replace("{{CURRENT_DATE}}", current_date)
        path.write_text(content)
PY
fi

cd "${DESTINATION_DIR}"

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

echo "Project initialized at: ${DESTINATION_DIR}"
