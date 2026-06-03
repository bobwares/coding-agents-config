---
name: eval-labeler
description: Model Response Evaluation (Repo-Based) Labeling skill. Process Eval.md files to generate structured notes and completed evaluation results. Use when evaluating and comparing two model responses (Response A vs Response B) for coding tasks. Triggers on requests to evaluate, label, score, or compare model responses in run directories.
---

# Eval Labeler

Process model response evaluations following the official labeling instructions.

## 1. Overview

Evaluate two AI model responses (Response A and Response B) against a pre-written prompt that references a code repository. Both models attempted the same coding task. Your goal is to read both transcripts, understand what each model actually did, and determine which response is better overall.

## 2. Inputs and Outputs

### Inputs

- `run_directory`: Path to the run directory (e.g., `./run01`)
- The run directory must contain `Eval.md` with:
  - A pre-written user prompt (the coding task)
  - Response A (full transcript of Model A's work)
  - Response B (full transcript of Model B's work)
  - Relevant repo snippets (no external repo access required)

### Outputs

Output files are versioned to preserve previous evaluations:

- `{run_directory}/Notes-{NN}.md`: Structured analysis notes
- `{run_directory}/Result-{NN}.md`: Completed evaluation form

Where `{NN}` is a zero-padded version number (01, 02, 03, ...).

**Version Detection:** Before writing output files, check for existing `Notes-*.md` and `Result-*.md` files in the run directory. Use the next available version number. If no versioned files exist, start with 01.

The Result.md file contains:
  - Strengths of Response A (free text, 200+ chars)
  - Weaknesses of Response A (taxonomy codes + justifications)
  - Strengths of Response B (free text, 200+ chars)
  - Weaknesses of Response B (taxonomy codes + justifications)
  - Overall preference rating (0-7 scale)
  - Rationale (single paragraph)

## 3. Step-by-Step Workflow

### Step 0: Determine Output Version

Before starting the evaluation, check for existing output files:

1. List files matching `Notes-*.md` and `Result-*.md` in the run directory
2. Find the highest existing version number (e.g., if Notes-02.md exists, highest is 02)
3. Set the output version to highest + 1 (zero-padded to 2 digits)
4. If no versioned files exist, use 01

Example: If `Notes-01.md` and `Result-01.md` exist, create `Notes-02.md` and `Result-02.md`.

### Step 1: Study the Repository Snippets

Read `{run_directory}/Eval.md` and analyze:

- Relevant files, documentation, and code provided
- Codebase structure relevant to the task
- Do not skim - the evaluation depends on repo details

Extract:
1. The exact bug or task
2. Every explicit constraint
3. Any hidden-test hints
4. Existing helpers/utilities available
5. Types, contracts, return behavior

### Step 2: Read Response A Fully

Read through the entire transcript. Pay attention to:

- **What files did the model edit?** Look at actual tool calls (str_replace, file_edit, etc.), not the model's narration
- **What commands did the model run?** Look at tool call outputs
- **What did the model search/read?** Look at grep, find, read_file calls
- **Did the model complete the task?** Did it address everything in the prompt?
- **Is the final code correct?** Does the logic actually solve the issue?

Form your own assessment of Response A before moving on.

### Step 3: Read Response B Fully

Do the same analysis for Response B. Do not let your opinion of A bias your reading of B.

### Step 4: Compare and Fill Out the Form

Compare both responses and produce the evaluation outputs.

## 4. Filling Out the Evaluation Form

### 4.1 Strengths (Required for Each Response)

- **Minimum: 200 characters**
- Describe what the model did well with specific evidence
- Reference actual tool calls, file names, and code changes from the transcript
- Even if the response is poor overall, note any genuine strengths

**GOOD EXAMPLE:** "Model used grep to locate the error message in parser.py, read the validate_input function to understand the type check logic, then made an edit to handle the missing case. Confirmed the import for TypeGuard was already present before finishing. No wasted steps - no unnecessary tool calls."

**BAD EXAMPLE:** "The model did a good job solving the problem efficiently."

### 4.2 Weaknesses (Select All That Apply)

For each weakness you flag, you must:

- Select the taxonomy code (see Section 5)
- Provide a justification of at least 20 characters
- The justification must reference specific evidence from the transcript (file names, tool calls, code snippets)

**IMPORTANT:** Only flag weaknesses you can back up with evidence. If an issue does not apply, leave it unchecked.

### 4.3 Overall Preference (0-7 Scale)

This is the only rating axis in this evaluation. Use it carefully.

| Score | Meaning |
|-------|---------|
| 0 | A Highly Preferred |
| 1 | A Preferred |
| 2 | A Slightly Preferred |
| 3 | A Minimally Preferred |
| 4 | B Minimally Preferred |
| 5 | B Slightly Preferred |
| 6 | B Preferred |
| 7 | B Highly Preferred |

When deciding your rating:

- **Correctness and final code quality matter most.** A model that took a messy path but produced better final code should be rated higher than a model that was efficient but produced weaker code.
- **Process efficiency matters, but less than outcome.** If both models produce equivalent final code, the one that got there in fewer steps is better if it is because of that model's reasoning ability. But do not prefer a faster model whose final code is worse.
- **Match the degree to the actual gap.** "Minimally Preferred" means the difference is small and reasonable people could disagree. "Highly Preferred" means one response is clearly and significantly better and the other response is terrible.

### 4.4 Rationale (Required)

Write a single paragraph explaining your overall preference. The rationale must:

- Cover the key differences between the two responses
- Be consistent with your rating direction (if you rate B preferred, explain why B is better)
- Reference specific evidence from both transcripts
- Be written in plain, direct language (no filler, no generic praise)

**GOOD EXAMPLE:** "Both models fix the correct function in config.py and both solutions resolve the reported crash, but A handles a broader set of input types by using the existing is_mapping_type utility instead of a raw isinstance dict check. B was faster in its reasoning but was lazy with its final code. A took more edits to get there, including reverting an earlier attempt, but its final code is cleaner with no placeholders. The final code quality matters more than the process to get there."

**BAD EXAMPLE:** "Response A is better because it has a more elegant solution that follows best practices and demonstrates a deeper understanding of the codebase architecture."

### 4.5 Writing Style: Natural Human Reviewer Voice

Write like a careful human evaluator, not like an automated scoring system.

Requirements:

- Prefer natural reviewer phrasing over polished rubric prose.
- Vary sentence length and structure. Avoid making every sentence feel equally compressed or equally formal.
- Do not use absolute claims unless the transcript proves them directly. Avoid phrases like:
  - "None identified"
  - "correctly handles all edge cases"
  - "all hidden tests pass"
  - "demonstrates deeper understanding"
    unless the evidence fully supports that exact claim.
- When evidence is strong but not absolute, use human language such as:
  - "I did not find a meaningful weakness in the final code"
  - "The change appears to handle the listed edge cases"
  - "This is the main reason I prefer A"
  - "B fixes the crash, but it also changes the value semantics"
- Prefer one concrete reason over a stack of polished abstractions. State the causal point plainly.
- Do not sound like a judge reading a rubric. Sound like an engineer explaining a decision to another engineer.
- Avoid overly symmetrical phrasing across A and B. It is fine if one side gets a shorter or more blunt writeup when the evidence warrants it.
- Do not force transition phrases like "Additionally," "Furthermore," or "The efficiency gain does not justify..." if a simpler sentence works.
- Keep the prose specific and grounded in transcript evidence, but allow slight naturalness and texture in the wording.

Human-sounding example:
"A found the existing string helper and reused it, which matters here because the bug is not just about avoiding a crash. The function also needs to preserve the difference between a missing value and a real string. B's `str(...)` change stops the exception, but it turns `None` into the literal text `'None'`, so I would still take A."

Less human-sounding example:
"Response A correctly handles all edge cases, follows all constraints, and therefore is preferred overall due to superior semantic correctness and instruction adherence."

## 5. Behavioral Weakness Taxonomy

Use these codes when flagging weaknesses. Each weakness must have a specific, evidence-based justification.

| Code | Category | Description |
|------|----------|-------------|
| `INST` | Instruction Following Failures | Model ignored or misunderstood explicit instructions from the prompt or config files |
| `OVERENG` | Overengineering | Solution is unnecessarily complex; adds unrequested features or scope |
| `TOOL` | Tool Use Errors | Incorrect or inappropriate use of tools, APIs, or commands |
| `LAZY` | Laziness | Response is incomplete, gives up early, or leaves TODOs/placeholders in final code |
| `VERIFY` | Verification Failures | Claims made without checking the repo or reasoning through correctness |
| `FALSE` | False Claims of Success | Model says something works or was completed when it was not |
| `ROOT` | Fails to Address Root Cause | Fixes symptoms rather than the actual underlying issue |
| `DESTRUCT` | Unauthorized Destructive Operations | Suggests or performs unsafe/irreversible actions without justification |
| `FILE` | File-Related Issues | Incorrect file paths, wrong files modified, unnecessary files created |
| `HALLUC` | Code Hallucinations | References functions, files, APIs, or behavior that do not exist |
| `DOCS` | Documentation Issues | Creates unwanted documentation or adds bad/unnecessary comments |
| `VERBOSE/FORMAT` | Verbose Dialogue | Excessively long responses, unnecessary filler, validation phrases, excessive markdown/lists/formatting |

### 5.1 Key Distinctions Between Codes

| Pair | Key Distinction |
|------|-----------------|
| VERIFY vs FALSE | VERIFY = did not check. FALSE = claimed it worked when it did not |
| TOOL vs HALLUC | TOOL = used a real tool wrong. HALLUC = invented a non-existent function |
| LAZY vs ROOT | LAZY = gave up early or left placeholders. ROOT = finished but fixed symptoms |
| OVERENG vs FILE | OVERENG = added features beyond scope. FILE = created/modified wrong files |
| LAZY vs VERIFY | LAZY = incomplete work. VERIFY = complete work but not validated |

### 5.2 Important Rules for Flagging Weaknesses

**Evaluate final output, not chain-of-thought.** Only flag issues present in the model's final code, final files, and final messages. Do not penalize for exploring ideas, considering alternatives, or abandoned approaches in the reasoning process.

**Do not penalize for pre-existing codebase issues.** If the existing code has a behavior, and the model's fix does not introduce or worsen that behavior, and the prompt is not related to this pre-existing issue, then do not flag it as a weakness. The model is responsible for its changes, not for fixing every unrelated issue in the codebase.

**Do not penalize for not running tests when code execution is disabled.** If the prompt or environment prevents code execution, neither model can run tests. This is not a weakness.

**Apply weaknesses symmetrically.** If a weakness applies to both models (e.g., neither validates edge cases), flag it for both. Do not selectively apply weaknesses based on which model you already decided is better.

**Use engineering judgment for OVERENG.** Not every piece of "extra" code is overengineering. Handling closely related edge cases, or updating imports are standard practice. Only flag OVERENG when the addition is clearly unrelated to the task or adds significant unrequested complexity and was not requested by prompt.

## 6. Common Mistakes to Avoid

### 6.1 Rating-Rationale Inconsistency

Your written analysis says Response A is better, but your numeric rating favors Response B (or vice versa).

- Before submitting, re-read your rationale and check that your rating matches
- If you wrote that A is better, your overall rating must favor A
- If you are genuinely torn, rate near the middle (3 or 4) and explain why

### 6.2 Scope Misunderstanding

Penalizing the model for doing something the task actually required, or expecting the model to do something the task did not ask for.

- Read the task prompt carefully for all requirements and constraints
- Check whether the prompt actually asks for the behavior you are evaluating
- If the prompt says "there are hidden tests," creating test files is valid

### 6.3 Confusing Process with Outcome

Penalizing a model for a messy exploration process when its final code is correct, or rewarding a model for efficiency when its final code is worse.

- A model that takes 20 tool calls but produces correct, general code can be better than a model that takes 5 tool calls but produces narrow, incomplete code
- Process efficiency is a tiebreaker, not the primary criterion

## 7. Quality Bar

Before completing, verify:

- [ ] Strengths fields have 200+ characters each
- [ ] Every checked weakness has a 20+ character justification with specific evidence
- [ ] Your overall rating direction matches your rationale
- [ ] Your strengths and weaknesses do not contradict each other
- [ ] You have not flagged pre-existing codebase issues as model weaknesses
- [ ] You have applied weaknesses symmetrically across both models

## 8. Final Reminder

You are evaluating based on the repo + prompt + transcript evidence, not on how convincing the response sounds.

**Correctness > Efficiency**
**Evidence > Assumptions**
**Final Code > Process**

Judge what the model **actually changed and actually proved**, not what it **said** it did.

## Output Templates

### Notes-{NN}.md Template

```text
# Evaluation Notes - {run_id} (v{NN})

## Prompt Analysis

- **Task**: [exact bug or task description]
- **Constraints**: [list all explicit constraints]
- **Hidden-test hints**: [any hints about edge cases]

## Repo Notes

- **Likely root cause**: [analysis of the bug]
- **Existing helper(s)**: [available utilities]
- **Scope red flags**: [things to watch for]

## Response A Analysis

- **Files searched/read**: [list actual tool calls]
- **Files edited**: [list actual edits]
- **Final code quality**: [assessment]
- **Instruction issues**: [any violations]
- **Possible weakness codes**: [tentative codes]
- **Best strength**: [key positive]

## Response B Analysis

- **Files searched/read**: [list actual tool calls]
- **Files edited**: [list actual edits]
- **Final code quality**: [assessment]
- **Instruction issues**: [any violations]
- **Possible weakness codes**: [tentative codes]
- **Best strength**: [key positive]

## Comparison Summary

- **Better final code**: [A or B with reason]
- **Better instruction following**: [A or B]
- **Better verification**: [A or B or neither]
- **Efficiency tiebreaker**: [only if final code is equivalent]
- **Final winner**: [A or B]
- **Score (0-7)**: [rating]

## Rationale

[One paragraph with specific evidence from both sides]
```

### Result-{NN}.md Template

```text
Strengths of Response A:

[200+ characters with specific evidence - tool calls, file names, code changes]

Weaknesses of Response A:

- [CODE]: [20+ char justification with specific evidence]

Strengths of Response B:

[200+ characters with specific evidence - tool calls, file names, code changes]

Weaknesses of Response B:

- [CODE]: [20+ char justification with specific evidence]

Overall preference rating:
[0-7]

Rationale:
[Single paragraph - key differences, consistent with rating, specific evidence from both, plain language]
```
