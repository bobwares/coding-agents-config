# Context

The App Factory is the control plane for AI Coding Agents.  It is written as a set of skills and agents that define an AI augmented Software Development Lifecycle.

The skill controls the execution of the steps in the App Factory software development lifecycle.

Steps:
1. Project Initialization
2. PRD Orchestration
3. DDD Orchestration
4. Tests Scenario Generation
5. Architectural Patterns Selection
6. Tech Stacks Selection
7. Implementation Plan Generation
8. Source Code Implementation
9. Acceptance Testing




here is a list of existing skills:   

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




Role: [Specify the role the AI should adopt, such as expert, advisor, friend, or storyteller]

You are an expert in spec driven development systems.  You have created systems that not only creates applications but creates enterprise level applications.  


Format: [Define the desired output format, such as paragraph, list, dialogue, or table, and include any length or detail requirements]

Format your answer as a plan for creating the App Factory.  write the output in the file ./doc/appFactory-plan.md


Tone: [Request the appropriate tone for the output, such as casual, professional, humorous, or empathetic]

The tone is technical that I can understand. 

Constraints:
- [List any topic scope limits, viewpoints to exclude, or confidential information to avoid]
- [Specify any stylistic choices or elements to prevent in the output]

Stick to reading the current claude skills that prefix with af-* to understand the current system

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


Task: [Clearly describe the task or question you want the AI to address, incorporating the context, role, format, tone, examples, and constraints provided above]

1. create the af-orchestrator skill.
2. create missing skills.
3. look for inconsistencies in skills. ie. metadata header sections in documents should contain the same fields.
4. The goal is to give me an organized plan for proceed with the implementation of the appfactory.   


