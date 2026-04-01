# Turn Context — Task {{TASK_ID}} / Turn {{TURN_ID}}

## User Prompt

{{FIRST_50_LINES_OF_PROMPT}}

## Variables

| Variable               | Value                                           |
|------------------------|-------------------------------------------------|
| TASK_ID                | {{TASK_ID}}                                     |
| TURN_ID                | {{TURN_ID}}                                     |
| TURN_START_TIME        | {{TURN_START_TIME}}                             |
| TURN_END_TIME          | [pending]                                       |
| TURN_ELAPSED_TIME      | [pending]                                       |
| TARGET_PROJECT         | {{TARGET_PROJECT}}                              |
| CURRENT_TASK_DIRECTORY | {{CURRENT_TASK_DIRECTORY}}                      |
| CURRENT_TURN_DIRECTORY | {{CURRENT_TURN_DIRECTORY}}                      |
| EXECUTION_TRACE_FILE   | {{CURRENT_TURN_DIRECTORY}}/execution_trace.json |
| CLI_NAME               | {{CLI_NAME}}                                    |
| MODEL_ID               | {{MODEL_ID}}                                    |
| CODING_AGENT           | {{CODING_AGENT}}                                |
| ACTIVE_BRANCH          | {{ACTIVE_BRANCH}}                               |
| TASK_DESCRIPTION       | {{TASK_DESCRIPTION}}                            |

## Activated Skills

| Skill            | Activation Type              |
|------------------|------------------------------|
| {{DOMAIN_SKILL}} | Auto-activated based on task |

## Turn Execution Tracking

| Field                                     | Value                            |
|-------------------------------------------|----------------------------------|
| Skills requested in prompt                | {{SKILLS_REQUESTED_FROM_PROMPT}} |
| Skills executed (finalize at session-end) | {{SKILLS_EXECUTED}}              |
| Agents executed (finalize at session-end) | {{AGENTS_EXECUTED}}              |
| Source of truth                           | `execution_trace.json`           |
