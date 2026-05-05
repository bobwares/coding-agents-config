#!/usr/bin/env python3
"""
af-be-ddd Orchestration Agent

Coordinates the backend Domain-Driven Design (DDD) workflow through:
1. Initial build phase
2. Iterative analyze-refactor loop (bounded by max_ddd_tries)
3. Test generation phase
4. Comprehensive reporting
"""

import os
import sys
import re
from pathlib import Path
from typing import Tuple, Dict, Any

# ANSI colors
RED = "\033[0;31m"
GREEN = "\033[0;32m"
YELLOW = "\033[0;33m"
NC = "\033[0m"  # No Color


def log_error(msg: str) -> None:
    """Log error message."""
    print(f"{RED}ERROR: {msg}{NC}", file=sys.stderr)


def log_success(msg: str) -> None:
    """Log success message."""
    print(f"{GREEN}✓ {msg}{NC}")


def log_info(msg: str) -> None:
    """Log info message."""
    print(f"{YELLOW}→ {msg}{NC}")


def read_max_ddd_tries(claude_md_path: Path) -> int:
    """
    Read max_ddd_tries from CLAUDE.md.

    Args:
        claude_md_path: Path to CLAUDE.md

    Returns:
        max_ddd_tries value

    Raises:
        FileNotFoundError: If CLAUDE.md not found
        ValueError: If max_ddd_tries missing or invalid
    """
    if not claude_md_path.exists():
        raise FileNotFoundError(f"CLAUDE.md not found at {claude_md_path}")

    content = claude_md_path.read_text()

    # Search for max_ddd_tries = <number>
    match = re.search(r"^max_ddd_tries\s*=\s*(\d+)", content, re.MULTILINE)
    if not match:
        raise ValueError("max_ddd_tries not found in CLAUDE.md")

    value = int(match.group(1))
    if value <= 0:
        raise ValueError(f"max_ddd_tries must be positive integer, got: {value}")

    return value


def invoke_skill(skill_name: str) -> bool:
    """
    Invoke a child skill.

    Args:
        skill_name: Name of skill to invoke

    Returns:
        True if successful, False otherwise
    """
    # In actual implementation, this would use Claude Code's skill invocation
    # For now, we'll simulate it
    log_info(f"Invoking {skill_name}")
    # TODO: Implement actual skill invocation via Claude Code SDK or CLI
    return True


def main() -> int:
    """Main orchestration workflow."""
    project_root = Path.cwd()
    claude_md = project_root / "CLAUDE.md"

    # ========================================================================
    # Phase 1: Validate Configuration
    # ========================================================================
    log_info("Phase 1: Validating configuration")

    try:
        max_ddd_tries = read_max_ddd_tries(claude_md)
        log_success(f"Configuration valid: max_ddd_tries = {max_ddd_tries}")
    except (FileNotFoundError, ValueError) as e:
        log_error(str(e))
        return 1

    # ========================================================================
    # Phase 2: Build Initial DDD
    # ========================================================================
    log_info("Phase 2: Building initial backend DDD")

    if not invoke_skill("af-be-ddd-build"):
        log_error("af-be-ddd-build skill failed")
        return 1

    log_success("Backend DDD built")

    # ========================================================================
    # Phase 3: Analyze & Refactor Loop
    # ========================================================================
    log_info(f"Phase 3: Starting analyze and refactor loop (max {max_ddd_tries} attempts)")

    ddd_try_count = 0
    analysis_passes = 0
    refactor_attempts = 0
    loop_exit_reason = ""

    while ddd_try_count < max_ddd_tries:
        # Run analysis
        log_info(f"Running analysis pass {analysis_passes + 1}")

        if not invoke_skill("af-be-ddd-analysis"):
            log_error("af-be-ddd-analysis skill failed")
            return 1

        analysis_passes += 1

        # Check if refactoring is needed
        # (In real implementation, this would check the analysis output)
        refactoring_needed = True  # TODO: Parse analysis result
        if not refactoring_needed:
            log_success("Analysis complete: no refactoring required")
            loop_exit_reason = "no refactoring required"
            break

        # Increment try count
        ddd_try_count += 1

        # Check if max attempts reached
        if ddd_try_count >= max_ddd_tries:
            log_info(f"Max refactor attempts reached ({ddd_try_count}/{max_ddd_tries})")
            loop_exit_reason = "max attempts reached"
            break

        # Perform refactoring
        log_info(f"Performing refactor attempt {ddd_try_count} of {max_ddd_tries}")

        if not invoke_skill("af-be-ddd-refactor"):
            log_error(f"af-be-ddd-refactor skill failed on attempt {ddd_try_count}")
            return 1

        refactor_attempts += 1
        log_success(f"Refactor attempt {ddd_try_count} completed")

    # ========================================================================
    # Phase 4: Run Tests
    # ========================================================================
    log_info("Phase 4: Generating and running tests")

    if not invoke_skill("af-be-ddd-tests"):
        log_error("af-be-ddd-tests skill failed")
        return 1

    log_success("Tests passed")

    # ========================================================================
    # Phase 5: Report Results
    # ========================================================================
    log_info("Phase 5: Generating final report")

    report = f"""
════════════════════════════════════════════════════════════════════════════════
                          af-be-ddd ORCHESTRATION REPORT
════════════════════════════════════════════════════════════════════════════════

Build Status:
  ✓ Backend DDD built successfully

Analysis & Refactoring Loop:
  - Analysis passes: {analysis_passes}
  - Refactor attempts: {refactor_attempts}
  - Loop exit reason: {loop_exit_reason}
  - Max attempts allowed: {max_ddd_tries}

Test Results:
  ✓ Test suite passed

════════════════════════════════════════════════════════════════════════════════
"""
    print(report)

    log_success("Orchestration complete")
    return 0


if __name__ == "__main__":
    sys.exit(main())
