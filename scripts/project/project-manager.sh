#!/bin/bash
# App: coding-agents-config
# File: project-manager.sh
# Version: 0.1.0
# Turns: 1
# Author: AI Coding Agent (claude-opus-4-5)
# Date: 2026-03-12T00:00:00Z
# Description: GitHub Project management helper for Coding Agents Config Roadmap

set -euo pipefail

PROJECT_NUMBER=1
OWNER="bobwares"
REPO="bobwares/coding-agents-config"

# Unset GITHUB_TOKEN to use keyring token with project scope
unset GITHUB_TOKEN 2>/dev/null || true

usage() {
    cat <<EOF
Usage: $0 <command> [issue_number] [options]

Commands:
    start <issue>      Move issue to "In Progress"
    review <issue>     Move issue to "Review"
    block <issue>      Move issue to "Blocked"
    done <issue>       Move issue to "Done"
    todo <issue>       Move issue to "Todo"

    list               List all project items
    fields             List all project fields
    view               Open project in browser

    add <issue>        Add issue to project

    set-priority <issue> <P0|P1|P2|P3>
    set-agent <issue> <Claude|Codex|Both>
    set-track <issue> <Skills|Orchestration|Governance|Docs|Tooling|CI>
    set-type <issue> <Epic|Task|Bug|Research|ADR|Spec>
    set-version <issue> <v0.1|v0.2|v1.0>

Examples:
    $0 start 12        # Move issue 12 to In Progress
    $0 done 21         # Move issue 21 to Done
    $0 set-agent 18 Both
    $0 list
EOF
    exit 1
}

get_item_id() {
    local issue_number=$1
    gh project item-list "$PROJECT_NUMBER" --owner "$OWNER" --format json | \
        jq -r ".items[] | select(.content.number == $issue_number) | .id"
}

get_field_id() {
    local field_name=$1
    gh project field-list "$PROJECT_NUMBER" --owner "$OWNER" --format json | \
        jq -r ".fields[] | select(.name == \"$field_name\") | .id"
}

get_option_id() {
    local field_name=$1
    local option_name=$2
    gh project field-list "$PROJECT_NUMBER" --owner "$OWNER" --format json | \
        jq -r ".fields[] | select(.name == \"$field_name\") | .options[] | select(.name == \"$option_name\") | .id"
}

set_single_select() {
    local issue_number=$1
    local field_name=$2
    local option_name=$3

    local item_id=$(get_item_id "$issue_number")
    local field_id=$(get_field_id "$field_name")
    local option_id=$(get_option_id "$field_name" "$option_name")

    if [[ -z "$item_id" ]]; then
        echo "Error: Issue #$issue_number not found in project"
        exit 1
    fi

    if [[ -z "$option_id" ]]; then
        echo "Error: Option '$option_name' not found for field '$field_name'"
        exit 1
    fi

    gh project item-edit --project-id "$(gh project view "$PROJECT_NUMBER" --owner "$OWNER" --format json | jq -r .id)" \
        --id "$item_id" --field-id "$field_id" --single-select-option-id "$option_id"

    echo "Set $field_name=$option_name for issue #$issue_number"
}

case "${1:-}" in
    start)
        [[ -z "${2:-}" ]] && usage
        set_single_select "$2" "Status" "In Progress"
        ;;
    review)
        [[ -z "${2:-}" ]] && usage
        set_single_select "$2" "Status" "Review"
        ;;
    block)
        [[ -z "${2:-}" ]] && usage
        set_single_select "$2" "Status" "Blocked"
        ;;
    done)
        [[ -z "${2:-}" ]] && usage
        set_single_select "$2" "Status" "Done"
        ;;
    todo)
        [[ -z "${2:-}" ]] && usage
        set_single_select "$2" "Status" "Todo"
        ;;
    list)
        gh project item-list "$PROJECT_NUMBER" --owner "$OWNER"
        ;;
    fields)
        gh project field-list "$PROJECT_NUMBER" --owner "$OWNER"
        ;;
    view)
        gh project view "$PROJECT_NUMBER" --owner "$OWNER" --web
        ;;
    add)
        [[ -z "${2:-}" ]] && usage
        gh project item-add "$PROJECT_NUMBER" --owner "$OWNER" --url "https://github.com/$REPO/issues/$2"
        echo "Added issue #$2 to project"
        ;;
    set-priority)
        [[ -z "${2:-}" || -z "${3:-}" ]] && usage
        set_single_select "$2" "Priority" "$3"
        ;;
    set-agent)
        [[ -z "${2:-}" || -z "${3:-}" ]] && usage
        set_single_select "$2" "Agent" "$3"
        ;;
    set-track)
        [[ -z "${2:-}" || -z "${3:-}" ]] && usage
        set_single_select "$2" "Track" "$3"
        ;;
    set-type)
        [[ -z "${2:-}" || -z "${3:-}" ]] && usage
        set_single_select "$2" "Type" "$3"
        ;;
    set-version)
        [[ -z "${2:-}" || -z "${3:-}" ]] && usage
        set_single_select "$2" "Version" "$3"
        ;;
    *)
        usage
        ;;
esac
