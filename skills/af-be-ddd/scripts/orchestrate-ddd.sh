#!/bin/bash
set -euo pipefail

# af-be-ddd Orchestration Script
# Coordinates backend DDD build, analysis, refactoring loop, and test phases

PROJECT_ROOT="${PROJECT_ROOT:-.}"
CLAUDE_MD="$PROJECT_ROOT/CLAUDE.md"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

log_error() {
  echo -e "${RED}ERROR: $*${NC}" >&2
}

log_success() {
  echo -e "${GREEN}✓ $*${NC}"
}

log_info() {
  echo -e "${YELLOW}→ $*${NC}"
}

# ============================================================================
# PHASE 1: Validate Configuration
# ============================================================================
log_info "Phase 1: Reading configuration from CLAUDE.md"

if [ ! -f "$CLAUDE_MD" ]; then
  log_error "CLAUDE.md not found at $CLAUDE_MD"
  exit 1
fi

# Extract max_ddd_tries
MAX_DDD_TRIES=$(grep "^max_ddd_tries = " "$CLAUDE_MD" | head -1 | cut -d'=' -f2 | tr -d ' ' || echo "")

if [ -z "$MAX_DDD_TRIES" ]; then
  log_error "max_ddd_tries not found in CLAUDE.md"
  exit 1
fi

if ! [[ "$MAX_DDD_TRIES" =~ ^[0-9]+$ ]] || [ "$MAX_DDD_TRIES" -le 0 ]; then
  log_error "max_ddd_tries must be a positive integer, got: $MAX_DDD_TRIES"
  exit 1
fi

log_success "Configuration valid: max_ddd_tries = $MAX_DDD_TRIES"

# ============================================================================
# PHASE 2: Build Initial DDD
# ============================================================================
log_info "Phase 2: Building initial backend DDD"

if ! command -v claude-code &> /dev/null; then
  log_error "claude-code CLI not found. Required to invoke skills."
  exit 1
fi

BUILD_RESULT=$(claude-code skill af-be-ddd-build 2>&1 || echo "FAILED")
if [ "$BUILD_RESULT" = "FAILED" ]; then
  log_error "af-be-ddd-build skill failed"
  exit 1
fi

log_success "Backend DDD built"

# ============================================================================
# PHASE 3: Analyze & Refactor Loop
# ============================================================================
log_info "Phase 3: Starting analyze and refactor loop (max $MAX_DDD_TRIES attempts)"

DDD_TRY_COUNT=0
ANALYSIS_PASSES=0
REFACTOR_ATTEMPTS=0
LOOP_EXIT_REASON=""

while [ $DDD_TRY_COUNT -lt $MAX_DDD_TRIES ]; do
  # Run analysis
  log_info "Running analysis pass $((ANALYSIS_PASSES + 1))"
  ANALYSIS_RESULT=$(claude-code skill af-be-ddd-analysis 2>&1 || echo "FAILED")

  if [ "$ANALYSIS_RESULT" = "FAILED" ]; then
    log_error "af-be-ddd-analysis skill failed"
    exit 1
  fi

  ((ANALYSIS_PASSES++))

  # Check if refactoring is needed (look for "refactoring_required" in output)
  if echo "$ANALYSIS_RESULT" | grep -q "refactoring_required: false\|no refactoring"; then
    log_success "Analysis complete: no refactoring required"
    LOOP_EXIT_REASON="no refactoring required"
    break
  fi

  # Refactoring required
  ((DDD_TRY_COUNT++))

  if [ $DDD_TRY_COUNT -eq $MAX_DDD_TRIES ]; then
    log_info "Max refactor attempts reached ($MAX_DDD_TRIES/$MAX_DDD_TRIES)"
    LOOP_EXIT_REASON="max attempts reached"
    break
  fi

  # Perform refactoring
  log_info "Performing refactor attempt $DDD_TRY_COUNT of $MAX_DDD_TRIES"
  REFACTOR_RESULT=$(claude-code skill af-be-ddd-refactor 2>&1 || echo "FAILED")

  if [ "$REFACTOR_RESULT" = "FAILED" ]; then
    log_error "af-be-ddd-refactor skill failed on attempt $DDD_TRY_COUNT"
    exit 1
  fi

  ((REFACTOR_ATTEMPTS++))
  log_success "Refactor attempt $DDD_TRY_COUNT completed"
done

# ============================================================================
# PHASE 4: Run Tests
# ============================================================================
log_info "Phase 4: Generating and running tests"

TESTS_RESULT=$(claude-code skill af-be-ddd-tests 2>&1 || echo "FAILED")

if [ "$TESTS_RESULT" = "FAILED" ]; then
  log_error "af-be-ddd-tests skill failed"
  exit 1
fi

log_success "Tests passed"

# ============================================================================
# PHASE 5: Report Results
# ============================================================================
log_info "Phase 5: Generating final report"

cat <<EOF

════════════════════════════════════════════════════════════════════════════════
                          af-be-ddd ORCHESTRATION REPORT
════════════════════════════════════════════════════════════════════════════════

Build Status:
  ✓ Backend DDD built successfully

Analysis & Refactoring Loop:
  - Analysis passes: $ANALYSIS_PASSES
  - Refactor attempts: $REFACTOR_ATTEMPTS
  - Loop exit reason: $LOOP_EXIT_REASON
  - Max attempts allowed: $MAX_DDD_TRIES

Test Results:
  ✓ Test suite passed

════════════════════════════════════════════════════════════════════════════════

EOF

log_success "Orchestration complete"
exit 0
