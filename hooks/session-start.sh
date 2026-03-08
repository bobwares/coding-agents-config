#!/usr/bin/env bash
# -------------------------------------------------------------------
# session-start.sh
# Agentic pipeline session initialization hook
# -------------------------------------------------------------------
# Version: 2.0.0
# Author: bobware
# Created: 2026-03-06
# Modified: 2026-03-06
# Trigger: SessionStart
# Description: Outputs directive for Claude to invoke /session-start
#              skill. The skill loads context and displays status.
# -------------------------------------------------------------------

echo ""
echo "<system-reminder>"
echo "MANDATORY: Execute /session-start skill now before accepting any task."
echo "</system-reminder>"

exit 0
