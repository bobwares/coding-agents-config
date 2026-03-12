# Turn Context — Turn {{TURN_ID}}


## User Prompt

{{respond with the first 50 lines of the prompt.}}


## Variables

| Variable               | Value                                           |
|------------------------|-------------------------------------------------|
| TURN_ID                | {{TURN_ID}}                                     |
| TURN_START_TIME        | {{TURN_START_TIME}}                             |
| TURN_END_TIME          | {{TURN_END_TIME}}                               |
| TURN_ELAPSED_TIME      | {{TURN_ELAPSED_TIME}}                           |
| TARGET_PROJECT         | {{TARGET_PROJECT}}                              |
| CURRENT_TURN_DIRECTORY | {{CURRENT_TURN_DIRECTORY}}                      |
| EXECUTION_TRACE_FILE   | {{CURRENT_TURN_DIRECTORY}}/execution_trace.json |
| CLI_NAME               | {{CLI_NAME}}                                    |
| MODEL_ID               | {{MODEL_ID}}                                    |
| CODING_AGENT           | {{CODING_AGENT}}                                |
| Active Branch          | {{ACTIVE_BRANCH}}                               |
| Task Description       | {{TASK_DESCRIPTION}}                            |






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

## Agent Routing

| Task Type     | Assigned Agent     |
|---------------|--------------------|
| {{TASK_TYPE}} | {{ASSIGNED_AGENT}} |
