write a claude code skill named af-be-ddd.

It will orchestrate other skills.

- calls af-be-ddd-build
- loop
  - calls af-be-ddd-analysis
  - if refactoring is required call af-be-ddd-refactor
- is there more refactoring required?  yes then check max_ddd_tries in claude.md.  if number of tries equals the max_ddd_tries then exit loop
- call af-be-ddd-tests




