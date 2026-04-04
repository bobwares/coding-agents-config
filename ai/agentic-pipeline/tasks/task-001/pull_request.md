# Pull Request — Task 001

## Title

Add backend AppFactory skills and close out task 001

## URL

https://github.com/bobwares/coding-agents-config/pull/15

## Summary

- Normalize LF line endings for the pipeline helper shell scripts and protect `*.sh` files with `.gitattributes`.
- Add the backend AppFactory authoring skills and templates for PRD, DDD, DSL, planning, and implementation generation.
- Rename `appfactory-project-init` to `af-project-init`, port over the Git/GitHub bootstrap flow, and refresh the related templates and documentation.

## Testing

- `skills/session-start/scripts/get-next-task-id.sh .`
- `skills/task-init/scripts/get-next-task-id.sh .`
- `skills/turn-init/scripts/get-next-turn-id.sh . 001`
- `bash -n skills/af-project-init/scripts/init-appfactory-project.sh`
- Smoke-test `skills/af-project-init/scripts/init-appfactory-project.sh` in `/tmp` with GitHub publishing suppressed
