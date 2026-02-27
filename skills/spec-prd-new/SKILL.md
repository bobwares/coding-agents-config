---
name: spec-prd-new
description: >-
  Create a new Product Requirements Document through guided discovery.
  Use at the start of any new feature or app.
  Arguments: feature name.
disable-model-invocation: false
---

# Create New PRD

Feature: $ARGUMENTS

## Step 1: Discovery

Ask the user these questions (one at a time, wait for answers):

1. **What is this feature?** Describe it in one sentence.
2. **Who uses it?** Primary user persona and their goal.
3. **What problem does it solve?** What is currently broken or missing?
4. **What does success look like?** How will we know when it's done?
5. **What's out of scope?** What are we explicitly NOT building?
6. **Any technical constraints?** Existing integrations, performance requirements, deadlines?

## Step 2: Write PRD

After collecting answers, write the PRD to `.claude/prds/<feature-name>.md`:

```markdown
---
title: [Feature Name]
status: draft
created: [date]
updated: [date]
---

# PRD: [Feature Name]

## Problem Statement
[1-2 sentences: who has what problem, what is the impact]

## Goals
- [ ] [Measurable goal 1]
- [ ] [Measurable goal 2]
- [ ] [Measurable goal 3]

## Non-Goals
- [What we are NOT building]

## User Stories
### Primary Flow
**As a** [user type], **I want to** [action], **so that** [benefit].

**Acceptance Criteria:**
- Given [context], when [action], then [result]
- Given [context], when [action], then [result]

### Edge Cases
- [What happens when X fails]
- [What happens with empty state]

## Technical Requirements
- [API endpoints needed]
- [Database changes needed]
- [UI screens needed]
- [External integrations needed]

## Out of Scope
- [Explicitly excluded item]

## Success Metrics
- [How to measure success]
```

## Step 3: Confirm

Show the PRD to the user and ask: "Does this capture everything? Should I adjust anything before we break it into tasks?"

When confirmed, suggest: "Run `/spec-prd-parse <feature-name>` to break this into epics and tasks."
