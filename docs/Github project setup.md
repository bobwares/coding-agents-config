I cannot create it directly in your GitHub account from here because I do not have a GitHub write-capable tool or your authenticated session.

You can set it up quickly, though. GitHub supports creating Projects from the UI or `gh`, linking the project to the repository, adding issues/PRs as items, and managing project fields through `gh project ...` commands. The CLI requires a token/session with the `project` scope. ([GitHub Docs][1])

Run this locally for `bobwares/coding-agents-config`:

```bash
gh auth status
gh auth refresh -s project

gh project create --owner bobwares --title "Coding Agents Config Roadmap"
gh project list --owner bobwares

# open the project in the browser to finish view/layout work if you want
gh project view 1 --owner bobwares --web
```

Then link the project to the repo. GitHub supports linking a project from the repository’s Projects tab, and setting the repository as the project’s default repository makes the project appear in that repo’s Projects area. ([GitHub Docs][2])

In the UI:
`https://github.com/bobwares/coding-agents-config` → `Projects` → `Link a project` → choose your new project. ([GitHub Docs][2])

After that, create the fields you need. `gh project` supports field creation and item editing, but the exact project field option IDs are easiest to inspect after the project exists. ([GitHub CLI][3])

Suggested fields:
`Status`: Todo, In Progress, Review, Blocked, Done
`Priority`: P0, P1, P2, P3
`Agent`: Claude, Codex, Both
`Track`: Skills, Orchestration, Governance, Docs, Tooling, CI
`Type`: Epic, Task, Bug, Research, ADR, Spec
`Version`: v0.1, v0.2, v1.0
`Spec ID`
`ADR ID`

Create seed issues in the repo, then add them to the project. GitHub supports adding issues/PRs to a project through the UI or `gh project item-add`. ([GitHub Docs][4])

Example:

```bash
gh issue create --repo bobwares/coding-agents-config --title "Baseline skills package" --body "Define the shared baseline skill set for Claude and Codex."
gh issue create --repo bobwares/coding-agents-config --title "Cross-agent compatibility layer" --body "Normalize skill metadata and runtime expectations across Claude Code and Codex."
gh issue create --repo bobwares/coding-agents-config --title "Governance framework" --body "Define AGENTS.md, CLAUDE.md, ADR, PRD, and lifecycle governance."
gh issue create --repo bobwares/coding-agents-config --title "Project sync automation" --body "Automate project state updates from issues and PRs."

gh project item-add 1 --owner bobwares --url https://github.com/bobwares/coding-agents-config/issues/1
gh project item-add 1 --owner bobwares --url https://github.com/bobwares/coding-agents-config/issues/2
gh project item-add 1 --owner bobwares --url https://github.com/bobwares/coding-agents-config/issues/3
gh project item-add 1 --owner bobwares --url https://github.com/bobwares/coding-agents-config/issues/4
```

To maintain it from Claude, the practical pattern is: Claude generates the `gh` commands, and you run them in your repo shell. The CLI supports listing items, viewing fields, adding items, and editing individual field values on project items. ([GitHub CLI][3])

Useful maintenance commands:

```bash
gh project item-list 1 --owner bobwares
gh project field-list 1 --owner bobwares
gh project view 1 --owner bobwares --web
```

Then Claude can help you with commands like:
“move issue 12 to In Progress”
“create an epic for Codex compatibility”
“add these 5 issues to the project”
“set Agent=Both and Track=Governance for issue 18”

A clean repo structure for this project would be:

```text
.github/ISSUE_TEMPLATE/
.github/PULL_REQUEST_TEMPLATE.md
.github/workflows/project-sync.yml
.claude/skills/
.codex/skills/
governance/
docs/specs/
docs/adr/
scripts/project/
```

The key operating model is:
GitHub Project = live planning and status
GitHub Issues = work items
Repo docs = governance and specs
Claude = command generator / workflow assistant

If you want this fully maintainable from Claude with minimal friction, the next step is to add a repo-local helper script, for example `scripts/project/project-manager.sh`, that wraps `gh project` calls for your field taxonomy. Then Claude only has to emit stable commands like:

```bash
./scripts/project/project-manager.sh start 12
./scripts/project/project-manager.sh block 18
./scripts/project/project-manager.sh done 21
```

I can draft that script and the matching GitHub issue templates next.

[1]: https://docs.github.com/issues/planning-and-tracking-with-projects/creating-projects/creating-a-project?utm_source=chatgpt.com "Creating a project - GitHub Docs"
[2]: https://docs.github.com/en/enterprise-cloud%40latest/issues/planning-and-tracking-with-projects/managing-your-project/adding-your-project-to-a-repository?apiVersion=2022-11-28&utm_source=chatgpt.com "Adding your project to a repository - GitHub Enterprise Cloud Docs"
[3]: https://cli.github.com/manual/gh_project?utm_source=chatgpt.com "GitHub CLI | Take GitHub to the command line"
[4]: https://docs.github.com/issues/planning-and-tracking-with-projects/managing-items-in-your-project/adding-items-to-your-project?utm_source=chatgpt.com "Adding items to your project - GitHub Docs"
