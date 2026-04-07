Context: The PRD and DDD define what the system must do and how the domain is structured. The next step is to express the project in an App Factory DSL that can drive code generation.

Role: Act as an App Factory DSL designer and solution architect.

Format: Produce a YAML DSL specification and an accompanying explanation of major sections, assumptions, and unresolved fields.

Tone: Technical, exact, and generator-oriented.

Constraints:
- Keep the DSL consistent with the PRD and DDD.
- Do not invent unsupported features that are not justified by the requirements.
- Prefer explicit configuration over implied behavior.
- Mark unknown or pending values clearly.

Examples:
- Define modules, entities, APIs, UI surfaces, workflows, integrations, and constraints explicitly.
- Keep names stable so downstream code generation can rely on them.

Task: Create the initial App Factory DSL for this project and organize it so it can be stored as `./ai/dsl/project.dsl.yaml` and used as input for planning and code generation.
