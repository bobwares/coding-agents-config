#!/usr/bin/env bash
# -------------------------------------------------------------------
# turn-init.sh
# Agentic pipeline turn initialization hook
# -------------------------------------------------------------------
# Version: 2.0.0
# Author: bobware
# Created: 2026-03-06
# Modified: 2026-03-06
# Trigger: UserPromptSubmit
# Description: Outputs directive for Claude to invoke /turn-init
#              skill. The skill creates turn directory and artifacts.
# -------------------------------------------------------------------

set -euo pipefail

PROJECT_ROOT="$(pwd)"

# Resolve TURN_ID
NEXT_TURN_SCRIPT="${PROJECT_ROOT}/scripts/get-next-turn-id.sh"
if [ ! -x "$NEXT_TURN_SCRIPT" ]; then
  NEXT_TURN_SCRIPT="$HOME/.claude/scripts/get-next-turn-id.sh"
fi

if [ -x "$NEXT_TURN_SCRIPT" ]; then
  TURN_ID="$("$NEXT_TURN_SCRIPT" "$PROJECT_ROOT" 2>/dev/null || echo 1)"
else
  TURN_ID=1
fi

BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
TURN_START=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo ""
echo "<system-reminder>"
echo "Turn ${TURN_ID} | Branch: ${BRANCH} | Started: ${TURN_START}"
echo "MANDATORY: Execute /turn-init skill to create turn directory before proceeding."
echo "Turn directory: ./ai/agentic-pipeline/turns/turn-${TURN_ID}/"
echo "</system-reminder>"

exit 0
