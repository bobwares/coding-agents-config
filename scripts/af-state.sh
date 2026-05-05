#!/usr/bin/env bash
# af-state.sh - AppFactory state management utilities
# Source this script in af-* skills to manage .appfactory/memory/state.yaml

set -euo pipefail

# Resolve state file path
_af_state_file() {
  local project_root="${AF_PROJECT_ROOT:-.}"
  echo "$project_root/.appfactory/memory/state.yaml"
}

# Check if state file exists
af_state_exists() {
  [[ -f "$(_af_state_file)" ]]
}

# Initialize state file from project YAML
af_state_init() {
  local project_id="$1"
  local app_factory_home="${APP_FACTORY_HOME:-$HOME/gallery/app-factory}"
  local project_yaml="$app_factory_home/projects/${project_id}.yaml"
  local state_file="$(_af_state_file)"
  local now
  now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

  if [[ ! -f "$project_yaml" ]]; then
    echo "ERROR: Project YAML not found: $project_yaml"
    return 1
  fi

  # Extract project info
  local name description profile
  name=$(yq -r '.project.name // "Unnamed Project"' "$project_yaml")
  description=$(yq -r '.project.description // ""' "$project_yaml")
  profile=$(yq -r '.tech_stack_profiles[0] // "none"' "$project_yaml")

  mkdir -p "$(dirname "$state_file")"

  cat > "$state_file" <<EOF
version: 1
kind: appfactory-project-state

project:
  id: "$project_id"
  name: "$name"
  description: "$description"
  source_yaml: "$project_yaml"

stack:
  profile: "$profile"
  profile_path: null
  implementation_path: null

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
      status: in_progress
      completed_at: null
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
  target_directory: "${AF_PROJECT_ROOT:-$(pwd)}"
  app_factory_home: "$app_factory_home"
  bounded_contexts: []
  turn_recommendation: null

history:
  - timestamp: "$now"
    stage: init
    action: started
    agent: "${AF_AGENT:-claude}"
EOF

  echo "State initialized: $state_file"
}

# Get a value from state
af_state_get() {
  local path="$1"
  yq -r ".$path" "$(_af_state_file)"
}

# Set a string value in state
af_state_set() {
  local path="$1"
  local value="$2"
  local state_file="$(_af_state_file)"
  yq -i ".$path = \"$value\"" "$state_file"
}

# Set a value preserving type (for null, bool, numbers, arrays)
af_state_set_raw() {
  local path="$1"
  local value="$2"
  local state_file="$(_af_state_file)"
  yq -i ".$path = $value" "$state_file"
}

# Check if a stage is complete
af_state_stage_complete() {
  local stage="$1"
  local status
  status=$(af_state_get "workflow.stages.$stage.status")
  [[ "$status" == "complete" ]]
}

# Check if all prerequisites for a stage are complete
af_state_prereqs_met() {
  local stage="$1"
  local state_file="$(_af_state_file)"
  local requires
  requires=$(yq -r ".workflow.stages.$stage.requires[]" "$state_file" 2>/dev/null || true)

  if [[ -z "$requires" ]]; then
    return 0
  fi

  for req in $requires; do
    if ! af_state_stage_complete "$req"; then
      echo "Prerequisite not met: $req" >&2
      return 1
    fi
  done
  return 0
}

# Mark stage as started
af_state_stage_start() {
  local stage="$1"
  local state_file="$(_af_state_file)"
  local now
  now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

  # Check prerequisites
  if ! af_state_prereqs_met "$stage"; then
    echo "ERROR: Prerequisites not met for stage: $stage" >&2
    return 1
  fi

  # Update stage status
  yq -i ".workflow.stages.$stage.status = \"in_progress\"" "$state_file"
  yq -i ".workflow.current_stage = \"$stage\"" "$state_file"

  # Append history
  yq -i ".history += [{\"timestamp\": \"$now\", \"stage\": \"$stage\", \"action\": \"started\", \"agent\": \"${AF_AGENT:-claude}\"}]" "$state_file"

  echo "Stage started: $stage"
}

# Mark stage as complete
af_state_stage_done() {
  local stage="$1"
  local state_file="$(_af_state_file)"
  local now
  now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

  # Update stage status
  yq -i ".workflow.stages.$stage.status = \"complete\"" "$state_file"
  yq -i ".workflow.stages.$stage.completed_at = \"$now\"" "$state_file"

  # Append history
  yq -i ".history += [{\"timestamp\": \"$now\", \"stage\": \"$stage\", \"action\": \"completed\", \"agent\": \"${AF_AGENT:-claude}\"}]" "$state_file"

  echo "Stage completed: $stage"
}

# Mark stage as failed
af_state_stage_fail() {
  local stage="$1"
  local reason="${2:-unknown}"
  local state_file="$(_af_state_file)"
  local now
  now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

  # Update stage status
  yq -i ".workflow.stages.$stage.status = \"failed\"" "$state_file"

  # Append history with reason
  yq -i ".history += [{\"timestamp\": \"$now\", \"stage\": \"$stage\", \"action\": \"failed\", \"agent\": \"${AF_AGENT:-claude}\", \"reason\": \"$reason\"}]" "$state_file"

  echo "Stage failed: $stage - $reason" >&2
}

# Update artifact status
af_state_artifact_update() {
  local artifact="$1"
  local status="$2"
  local path="${3:-}"
  local state_file="$(_af_state_file)"
  local now
  now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

  yq -i ".artifacts.$artifact.status = \"$status\"" "$state_file"
  yq -i ".artifacts.$artifact.updated_at = \"$now\"" "$state_file"

  # Set created_at if not already set
  local created
  created=$(af_state_get "artifacts.$artifact.created_at")
  if [[ -z "$created" || "$created" == "null" ]]; then
    yq -i ".artifacts.$artifact.created_at = \"$now\"" "$state_file"
  fi

  if [[ -n "$path" ]]; then
    yq -i ".artifacts.$artifact.path = \"$path\"" "$state_file"
  fi

  echo "Artifact updated: $artifact -> $status"
}

# Approve an artifact (convenience function)
af_state_artifact_approve() {
  local artifact="$1"
  af_state_artifact_update "$artifact" "approved"
}

# Set runtime variable
af_state_runtime_set() {
  local key="$1"
  local value="$2"
  af_state_set "runtime.$key" "$value"
}

# Get current workflow stage
af_state_current_stage() {
  af_state_get "workflow.current_stage"
}

# Get next pending stage
af_state_next_stage() {
  local state_file="$(_af_state_file)"
  yq -r '.workflow.stages | to_entries | map(select(.value.status == "pending")) | .[0].key // "complete"' "$state_file"
}

# Print state summary
af_state_summary() {
  local state_file="$(_af_state_file)"

  if ! af_state_exists; then
    echo "No state file found."
    return 1
  fi

  echo "=== AppFactory State Summary ==="
  echo "Project: $(af_state_get 'project.id')"
  echo "Current Stage: $(af_state_get 'workflow.current_stage')"
  echo ""
  echo "Stages:"
  for stage in init prd ddd dsl plan implementation; do
    local status
    status=$(af_state_get "workflow.stages.$stage.status")
    printf "  %-15s %s\n" "$stage:" "$status"
  done
  echo ""
  echo "Artifacts:"
  for artifact in prd ddd dsl plan implementation_manifest; do
    local status
    status=$(af_state_get "artifacts.$artifact.status")
    printf "  %-25s %s\n" "$artifact:" "$status"
  done
}

# Export functions for subshells
export -f _af_state_file af_state_exists af_state_init af_state_get af_state_set
export -f af_state_set_raw af_state_stage_complete af_state_prereqs_met
export -f af_state_stage_start af_state_stage_done af_state_stage_fail
export -f af_state_artifact_update af_state_artifact_approve af_state_runtime_set
export -f af_state_current_stage af_state_next_stage af_state_summary
