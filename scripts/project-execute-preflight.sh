#!/usr/bin/env bash
# Preflight validator for /project-execute one-turn pipeline.
# Validates inputs and local environment before generation starts.

set -u

PRD_PATH=""
DDD_PATH=""
STACK_PATH=""
WIREFRAME_PATH=""

usage() {
  cat <<USAGE
Usage:
  $0 --prd <path> --ddd <path> --stack <path> [--wireframe <path>]
USAGE
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --prd)
      PRD_PATH="${2:-}"
      shift 2
      ;;
    --ddd)
      DDD_PATH="${2:-}"
      shift 2
      ;;
    --stack)
      STACK_PATH="${2:-}"
      shift 2
      ;;
    --wireframe)
      WIREFRAME_PATH="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1"
      usage
      exit 1
      ;;
  esac
done

failures=()
notes=()

add_failure() {
  failures+=("$1")
}

add_note() {
  notes+=("$1")
}

require_file() {
  local file_path="$1"
  local label="$2"
  if [ -z "$file_path" ]; then
    add_failure "$label path is missing"
    return
  fi
  if [ ! -f "$file_path" ]; then
    add_failure "$label file not found: $file_path"
    return
  fi
  if [ ! -s "$file_path" ]; then
    add_failure "$label file is empty: $file_path"
  fi
}

require_command() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    add_failure "Required command not found: $cmd"
  fi
}

contains_any() {
  local file_path="$1"
  shift
  local found=1
  local token=""
  for token in "$@"; do
    if grep -Eiq "$token" "$file_path"; then
      found=0
      break
    fi
  done
  return $found
}

first_existing_dir() {
  local candidate=""
  for candidate in "$@"; do
    if [ -d "$candidate" ]; then
      printf '%s\n' "$candidate"
      return 0
    fi
  done
  return 1
}

first_existing_file() {
  local candidate=""
  for candidate in "$@"; do
    if [ -f "$candidate" ]; then
      printf '%s\n' "$candidate"
      return 0
    fi
  done
  return 1
}

# Basic command checks.
require_command git
require_command bash
require_command grep
require_command sed
require_command awk

# Input file checks.
require_file "$PRD_PATH" "PRD"
require_file "$DDD_PATH" "DDD"
require_file "$STACK_PATH" "Tech stack"
if [ -n "$WIREFRAME_PATH" ]; then
  require_file "$WIREFRAME_PATH" "Wireframe"
fi

# Repo checks.
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  add_failure "Current directory is not a git repository"
fi

if git remote get-url origin >/dev/null 2>&1; then
  add_note "Git remote 'origin' detected"
else
  add_note "No git remote 'origin' detected (local-only run will skip push/tag push)"
fi

# Content checks only when files exist.
if [ -f "$PRD_PATH" ]; then
  if ! contains_any "$PRD_PATH" "problem statement" "## problem"; then
    add_failure "PRD missing problem statement section"
  fi
  if ! contains_any "$PRD_PATH" "user stor" "## goals" "## goal"; then
    add_failure "PRD missing user stories or goals section"
  fi
  if ! contains_any "$PRD_PATH" "success" "metric" "criteria"; then
    add_failure "PRD missing success criteria/metrics section"
  fi
fi

if [ -f "$DDD_PATH" ]; then
  if ! contains_any "$DDD_PATH" "bounded context" "## bounded contexts"; then
    add_failure "DDD missing bounded context section"
  fi
  if ! contains_any "$DDD_PATH" "aggregate" "entity" "entities"; then
    add_failure "DDD missing aggregate/entity definitions"
  fi
fi

if [ -f "$STACK_PATH" ]; then
  stack_tokens=()
  while IFS= read -r token; do
    if [ -n "$token" ]; then
      stack_tokens+=("$token")
    fi
  done < <(
    sed -E 's/#.*$//' "$STACK_PATH" \
      | grep -E '^\s*-\s*[A-Za-z0-9_-]+' \
      | sed -E 's/^\s*-\s*//' \
      | awk '{print tolower($1)}'
  )

  if [ "${#stack_tokens[@]}" -eq 0 ]; then
    add_failure "Tech stack file has no valid '- token' lines"
  else
    valid_tokens="nextjs next nestjs nest spring springboot drizzle shadcn ui ai vercel-ai"
    for token in "${stack_tokens[@]}"; do
      if ! printf '%s\n' "$valid_tokens" | tr ' ' '\n' | grep -Fxq "$token"; then
        add_failure "Unsupported tech stack token: $token"
      fi
    done
  fi
fi

if [ -n "$WIREFRAME_PATH" ] && [ -f "$WIREFRAME_PATH" ]; then
  if ! contains_any "$WIREFRAME_PATH" "screen" "page" "wireframe" "layout"; then
    add_failure "Wireframe file appears incomplete (no screen/page/layout markers found)"
  fi
fi

# Skill and agent availability checks.
skills_root=$(first_existing_dir "./skills" "$HOME/.claude/skills" || true)
if [ -z "${skills_root:-}" ]; then
  add_failure "Could not find skills directory (expected ./skills or $HOME/.claude/skills)"
else
  required_skills=(project-init spec-parse-ddd spec-planning spec-prd-parse verify-all)
  for skill_name in "${required_skills[@]}"; do
    if [ ! -f "$skills_root/$skill_name/SKILL.md" ]; then
      add_failure "Missing required skill definition: $skills_root/$skill_name/SKILL.md"
    fi
  done
fi

agents_root=$(first_existing_dir "./agents" "$HOME/.claude/agents" || true)
if [ -z "${agents_root:-}" ]; then
  add_failure "Could not find agents directory (expected ./agents or $HOME/.claude/agents)"
else
  required_agents=(agent-orchestrator.md agent-git-guardian.md agent-verify-app.md)
  for agent_file in "${required_agents[@]}"; do
    if [ ! -f "$agents_root/$agent_file" ]; then
      add_failure "Missing required agent: $agents_root/$agent_file"
    fi
  done
fi

# Template availability checks for turn artifacts.
pr_template=$(first_existing_file "./.claude/templates/pr/pull_request_template.md" "./templates/pr/pull_request_template.md" "$HOME/.claude/templates/pr/pull_request_template.md" || true)
adr_template=$(first_existing_file "./.claude/templates/adr/adr_template.md" "./templates/adr/adr_template.md" "$HOME/.claude/templates/adr/adr_template.md" || true)
manifest_schema=$(first_existing_file "./.claude/templates/turn/manifest.schema.json" "./templates/turn/manifest.schema.json" "$HOME/.claude/templates/turn/manifest.schema.json" || true)

if [ -z "${pr_template:-}" ]; then
  add_failure "Missing pull request template in ./.claude/templates, ./templates, or $HOME/.claude/templates"
fi
if [ -z "${adr_template:-}" ]; then
  add_failure "Missing ADR template in ./.claude/templates, ./templates, or $HOME/.claude/templates"
fi
if [ -z "${manifest_schema:-}" ]; then
  add_failure "Missing manifest schema in ./.claude/templates, ./templates, or $HOME/.claude/templates"
fi

# Report.
echo "PROJECT EXECUTE PREFLIGHT"
echo "========================="
echo "PRD:       ${PRD_PATH}"
echo "DDD:       ${DDD_PATH}"
echo "Stack:     ${STACK_PATH}"
if [ -n "$WIREFRAME_PATH" ]; then
  echo "Wireframe: ${WIREFRAME_PATH}"
else
  echo "Wireframe: (not provided)"
fi

echo ""
if [ "${#notes[@]}" -gt 0 ]; then
  echo "Notes:"
  for note in "${notes[@]}"; do
    echo "- $note"
  done
  echo ""
fi

if [ "${#failures[@]}" -gt 0 ]; then
  echo "FAILURES:"
  for failure in "${failures[@]}"; do
    echo "- $failure"
  done
  echo ""
  echo "Preflight result: FAIL"
  exit 1
fi

echo "Preflight result: PASS"
exit 0
