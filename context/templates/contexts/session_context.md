# Session Context — Turn {{TURN_ID}}

| Variable | Value |
|----------|-------|
| TURN_ID | {{TURN_ID}} |
| TURN_START_TIME | {{TURN_START_TIME}} |
| TARGET_PROJECT | {{TARGET_PROJECT}} |
| CURRENT_TURN_DIRECTORY | {{CURRENT_TURN_DIRECTORY}} |
| EXECUTION_TRACE_FILE | {{CURRENT_TURN_DIRECTORY}}/execution_trace.json |
| CODING_AGENT | claude |
| Active Branch | {{ACTIVE_BRANCH}} |
| Task Description | {{TASK_DESCRIPTION}} |

## Loaded Context Files

| Context File | Purpose |
|-------------|---------|
| context_container.md | Base directories and path configuration |
| context_session.md | Turn timing and directory variables |
| context_conventions.md | Naming, templating, git conventions |
| context_governance.md | Coding standards and git workflow rules |
| context_orchestration.md | 10-step turn lifecycle |
| context_adr.md | ADR policy |
| context_skills.md | Available skills and invocation guide |

## Activated Skills

| Skill | Activation Type |
|-------|----------------|
| governance | Always active |
| adr | Always active |
| {{DOMAIN_SKILL}} | Auto-activated by skill-eval hook |

## Turn Execution Tracking

| Field | Value |
|------|-------|
| Skills requested in prompt | {{SKILLS_REQUESTED_FROM_PROMPT}} |
| Skills executed (finalize at session-end) | {{SKILLS_EXECUTED}} |
| Agents executed (finalize at session-end) | {{AGENTS_EXECUTED}} |
| Source of truth | `execution_trace.json` |

## Agent Routing

| Task Type | Assigned Agent |
|-----------|---------------|
| {{TASK_TYPE}} | {{ASSIGNED_AGENT}} |
