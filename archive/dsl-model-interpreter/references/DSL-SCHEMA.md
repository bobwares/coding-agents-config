# DSL Schema Reference

Complete schema definitions for `app-dsl/` YAML files.

## Model Files

### UI Model (`models/ui/*.yaml`)

```yaml
version: 1

models:
  {Entity}Form:
    kind: ui-model
    description: Form state for {entity} create/edit
    fields:
      {fieldName}:
        type: string | number | boolean | object
        required: true | false
        defaultValue: {value}  # Optional initial value
        validation:
          minLength: {n}
          maxLength: {n}
          pattern: {regex}
          message: {error message}
          customRules:
            - name: {rule-name}
              expr: {expression}
              message: {error message}
      {nestedObject}:
        type: object
        fields:
          {childField}:
            type: string
```

**UI-only fields**: Fields like `sameAsHomeAddress` exist only in UI model, not API/persistence.

### API Model (`models/api/*.yaml`)

```yaml
version: 1

models:
  Create{Entity}Request:
    kind: api-model
    description: Request body for creating {entity}
    fields:
      {fieldName}:
        type: string | number | boolean | object | ref | array
        required: true | false
      {refField}:
        type: ref
        modelRef: '#/models/{ReferencedModel}'

  {Entity}Response:
    kind: api-model
    description: {Entity} returned by API
    fields:
      id:
        type: string
        required: true
      # ... response fields

  ValidationError:
    kind: api-model
    description: Standard error response
    fields:
      code:
        type: string
        required: true
      message:
        type: string
        required: true
      fieldErrors:
        type: array
        items:
          type: object
          fields:
            field:
              type: string
            message:
              type: string
```

### Persistence Model (`models/persistence/*.yaml`)

```yaml
version: 1

models:
  {Entity}Record:
    kind: persistence-model
    storage:
      table: {table_name}
    description: Persisted {entity} row
    fields:
      {column_name}:
        type: uuid | varchar(n) | char(n) | integer | boolean | jsonb | timestamp | text
        primaryKey: true  # For PK field
        nullable: true | false
    indexes:
      - name: idx_{table}_{field}
        fields:
          - {field1}
          - {field2}
        unique: true | false
        where: {sql condition}  # Optional partial index
```

## Mapper Files (`mappers/*.yaml`)

```yaml
version: 1

mappers:
  {Source}To{Target}:
    fromModelRef: {relative/path}#/models/{SourceModel}
    toModelRef: {relative/path}#/models/{TargetModel}
    rules:
      {targetField}:
        from: {sourceField}           # Direct mapping
      {targetField}:
        from: {parent.child}          # Nested access
      {targetField}:
        generated: uuid | timestamp   # Auto-generated
      {targetField}:
        fromExpr: {expression}        # Transformation
```

### Expression Syntax

| Expression | Meaning |
|------------|---------|
| `hash(field)` | Hash the field value |
| `field != null ? a : b` | Conditional |
| `preserveExisting()` | Keep existing value (update only) |

## Page Files (`ui/pages/*.yaml`)

```yaml
version: 1

page:
  id: {entity}-create | {entity}-edit
  route: /{resources}/new | /{resources}/[id]/edit
  title: Create {Entity} | Edit {Entity}
  mode: create | edit
  layout:
    type: single-column | two-column
  form:
    modelRef: {path}#/models/{FormModel}
    stateAlias: {entity}
    submitAction: create{Entity} | update{Entity}
  sections:
    - id: {section-id}
      type: form-section
      title: {Section Title}
      fields:
        - id: {fieldId}
          type: text-field | number-field | email-field | password-field | phone-field | select | checkbox | button
          label: {Label Text}
          bind: {alias}.{field}
          required: true | false
          requiredWhen:
            all:
              - path: {field.path}
                op: eq | neq | notEmpty
                value: {value}
          visibleWhen:
            all:
              - path: {field.path}
                op: eq | neq | notEmpty
                value: {value}
          disabledWhen:
            all:
              - path: {field.path}
                op: eq | neq
                value: {value}
          optionsRef: {path}#/lookup/items  # For select
          validation:
            pattern: {regex}
            message: {error}
          actions:
            - type: apply-mapper | copy-value
              mapperRef: {path}#/mappers/{Mapper}
          ui:
            width: xs | sm | md | lg | xl
            testId: {test-id}
            autocomplete: {html-autocomplete}
            inputMask: {mask-pattern}
```

## Backend Files (`backend/*.yaml`)

```yaml
version: 1

service:
  id: {entity}-service
  namespace: {entity}
  description: {description}

endpoints:
  create{Entity}:
    method: POST
    path: /api/{resources}
    requestModelRef: {path}#/models/Create{Entity}Request
    responseModelRef: {path}#/models/{Entity}Response
    errorModelRef: {path}#/models/ValidationError
    requestMapperRef: {path}#/mappers/{FormToRequest}
    persistenceMapperRef: {path}#/mappers/{RequestToRecord}
    onSuccess:
      - type: navigate
        to: /{resources}
    onError:
      - type: show-message
        level: error
        text: {error message}

  get{Entity}:
    method: GET
    path: /api/{resources}/{id}
    responseModelRef: {path}#/models/{Entity}Response
    responseMapperRef: {path}#/mappers/{RecordToResponse}

  update{Entity}:
    method: PUT | PATCH
    path: /api/{resources}/{id}
    requestModelRef: {path}#/models/Update{Entity}Request
    responseModelRef: {path}#/models/{Entity}Response
```

## Lookup Files (`lookups/*.yaml`)

```yaml
lookup:
  id: {lookup-id}
  items:
    - label: {Display Text}
      value: {value}
    - label: {Display Text}
      value: {value}
```

## Reference Syntax

All references use JSON Pointer notation:

```
{relative/path/to/file.yaml}#/{root}/{name}
```

Examples:
- Same file: `#/models/AddressDto`
- Relative path: `../models/api/customer-api.model.yaml#/models/CreateCustomerRequest`
- Lookup items: `../../lookups/countries.lookup.yaml#/lookup/items`
