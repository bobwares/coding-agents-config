#!/usr/bin/env bash

set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo "Usage: $0 <github_profile_name> <project_id>" >&2
  exit 1
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "gh is not installed" >&2
  exit 1
fi

profile_name="$1"
project_id="$2"
repo="${profile_name}/${project_id}"

if ! gh auth status >/dev/null 2>&1; then
  echo "gh is not authenticated" >&2
  exit 1
fi

if gh repo view "$repo" --json nameWithOwner >/dev/null 2>&1; then
  echo "true"
else
  echo "false"
fi