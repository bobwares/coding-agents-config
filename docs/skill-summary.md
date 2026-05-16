# AppFactory Skills Reference

| #  | Phase                   | Step | Name                   | Invoked By             | Description                                                                              |
|----|-------------------------|------|------------------------|------------------------|------------------------------------------------------------------------------------------|
| 1  | Initialization          | 1    | af-project-init        | af-orchestrator        | Orchestrate AppFactory project<br/>initialization by exporting<br/>environment variables |
| 2  | Requirements            | 2    | af-be-prd-build        | af-orchestrator        | Build business-facing PRD from<br/>worksheets, questionnaires,<br/>discovery notes       |
| 3  | Domain-Driven Design    | 3    | af-be-ddd-orchestrator | af-orchestrator        | Orchestrate backend DDD<br/>workflow through build,<br/>analyze, refactor loop           |
| 4  |                         | 4    | af-be-ddd-build        | af-be-ddd-orchestrator | Generate human-readable DDD<br/>document from approved PRD                               |
| 5  |                         | 5    | af-be-ddd-analysis     | af-be-ddd-orchestrator | Analyze DDD specification for<br/>quality, completeness,<br/>PRD alignment               |
| 6  |                         | 6    | af-be-ddd-refactor     | af-be-ddd-orchestrator | Refactor DDD based on<br/>analysis findings                                              |
| 7  | Testing                 | 7    | af-be-ddd-tests        | af-be-ddd-orchestrator | Generate Gherkin-style BDD<br/>scenarios from DDD and PRD<br/>specifications             |
| 8  | Planning                | 8    | af-be-plan             | af-orchestrator        | Backend execution plan and<br/>strategy definition                                       |
| 9  | DSL Generation          | 9    | af-be-ddd-dsl          | af-be-implementation   | Domain-Specific Language<br/>generation from DDD<br/>specifications                      |
| 10 | Implementation          | 10   | af-be-implementation   | af-orchestrator        | Backend implementation from<br/>DDD specifications                                       |
| 11 | Validation              | 11   | af-app-check           | af-orchestrator        | Application verification and<br/>quality checks                                          |
| 12 | Utility (Cross-cutting) | 12   | af-memory              | All Skills             | CRUD operations for AppFactory<br/>pipeline state management                             |
