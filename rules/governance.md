# Governance Rules

These apply to every session without exception.

## Metadata Headers

Every source file (TypeScript, JavaScript, Java, Python, SQL, shell, YAML infrastructure)
must begin with a metadata header. Invoke `/governance` for the exact format per language.

Exempt: `pom.xml`, `package.json`, `turbo.json`, `globals.css`, `.toml` files, binary files, generated files.

## Versioning

Every source file tracks its own semantic version in its header.
- New file: start at `0.1.0`
- Bug fix / refactor: increment PATCH
- New feature: increment MINOR
- Breaking change: increment MAJOR
- Append `TURN_ID` to the `Turns` field on every modification

## Branch Naming

Format: `<type>/<short-description>[-T<id>]`

Types: `feat` `fix` `chore` `docs` `refactor` `test` `perf`

Never branch from or commit to `main` or `master`.

## Commit Format

```
AI Coding Agent Change:
- <imperative verb> <object> <context>
- <imperative verb> <object> <context>
- <imperative verb> <object> <context>
```

3–5 bullets. Imperative mood. Reference TURN_ID if ADR was written.

## Full Spec

Invoke `/governance` for complete metadata header formats, versioning rules,
code quality standards, security policy, and compliance checklist.
