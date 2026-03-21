<!-- PR Title: Turn {{TURN_ID}} – {{DATE}} – {{TASK_SUMMARY}} -->

# Turn {{TURN_ID}} Pull Request

## Turn Summary

- {{SUMMARY_BULLET_1}}
- {{SUMMARY_BULLET_2}}
- {{SUMMARY_BULLET_3}}

## Turn Duration

**Started**: {{TURN_START_TIME}}
**Finished**: {{TURN_END_TIME}}
**Elapsed**: {{TURN_ELAPSED_TIME}}

## Input Prompt

{{INPUT_PROMPT_SUMMARY}}

## Implementation Pattern

**Name**: {{ACTIVE_PATTERN_NAME}}
**Path**: {{ACTIVE_PATTERN_PATH}}

---

## Tasks Executed

| Task | Agents / Tools Used |
|------|---------------------|
| {{TASK_1}} | {{AGENTS_1}} |
| {{TASK_2}} | {{AGENTS_2}} |

---

## Execution Trace

**Trace File**: `./ai/agentic-pipeline/turns/turn-{{TURN_ID}}/execution_trace.json`

| Category | Values |
|----------|--------|
| Skills Executed | {{SKILLS_EXECUTED_LIST}} |
| Agents Executed | {{AGENTS_EXECUTED_LIST}} |

---

## Files Added (under `./ai/`)

| File |
|------|
| {{AI_FILE_1}} |
| {{AI_FILE_2}} |
| {{AI_FILE_3}} |
| {{AI_FILE_4}} |

---

## Files Added (source)

| Task | Description | File |
|------|-------------|------|
| {{TASK}} | {{DESCRIPTION_FROM_METADATA}} | {{FILE_PATH}} |

---

## Files Modified (source)

| Task | Description | File | Version |
|------|-------------|------|---------|
| {{TASK}} | {{DESCRIPTION_FROM_METADATA}} | {{FILE_PATH}} | {{OLD_VERSION}} → {{NEW_VERSION}} |

---

## Compliance Checklist

- [ ] Metadata headers present and version incremented on all modified files
- [ ] Turns field updated with TURN_ID {{TURN_ID}}
- [ ] Branch follows `<type>/<description>` naming
- [ ] Commit message follows `AI Coding Agent Change:` format
- [ ] Unit tests written for new or changed logic
- [ ] All tests pass
- [ ] Linting passes
- [ ] No sensitive data committed
- [ ] ADR written for this turn
- [ ] Turn tagged: `turn/{{TURN_ID}}`
