---
name: ui-implementation-language
version: 0.2.0
description: Declarative YAML language standard for defining UI pages, layouts, widgets, forms, actions, validation, state bindings, cards, tables, and API interactions in a framework-neutral, generator-friendly format.
---

## Purpose

Define a strict YAML-based declarative language for describing UI structure, widgets, layouts, forms, cards, tables, actions, state bindings, validation rules, testing metadata, and API integrations in a framework-neutral format.

This skill is intended to support:

1. human-authored UI specifications
2. code generation
3. schema validation
4. test scaffolding
5. consistent UI contracts across projects

## Goals

The language must support:

1. page composition
2. reusable components
3. forms and fields
4. cards and repeated content blocks
5. tables and detail views
6. actions and events
7. API request bindings
8. validation rules
9. conditional rendering and behavior
10. testable rendering metadata

## Non-Goals

Version `0.2` does not define:

1. full visual design systems
2. low-level CSS authoring
3. animation choreography
4. framework lifecycle hooks
5. arbitrary executable code
6. backend domain model generation rules

## Design Principles

### Declarative First

The YAML must describe what the UI is, not how a particular framework implements it.

### Framework Neutral

The language should be portable across React, Next.js, Vue, Angular, and server-driven UI generators.

### Generator Friendly

The shape must be explicit, normalized, predictable, and easy to parse into typed models.

### Explicit Over Implicit

Important behavior must be represented directly, including:

1. labels
2. bindings
3. widget types
4. validation
5. conditions
6. actions
7. API contracts
8. test metadata

### Separation of Concerns

Keep these concerns distinct:

1. `models` for data shape
2. `validation` for data rules
3. `ui` for rendering hints
4. `widgets` for renderable controls
5. `actions` for behavior
6. `apis` for request contracts
7. `lookups` for reusable options

## Language Versioning

The YAML document must declare a language version.

```yaml
version: 1
```

`version` refers to the UI YAML language version, not the application version.

## Root Document Contract

A valid root document must follow this structure.

```yaml
version: 1
app:
  name: customer-portal
  namespace: customer
pages: []
components: {}
models: {}
apis: {}
lookups: {}
actions: {}
```

## Top-Level Keys

| Key          | Required | Type     | Purpose                |
| ------------ | -------: | -------- | ---------------------- |
| `version`    |      Yes | `number` | Language version       |
| `app`        |      Yes | `object` | Application metadata   |
| `pages`      |      Yes | `array`  | Routeable UI surfaces  |
| `components` |       No | `object` | Reusable UI fragments  |
| `models`     |       No | `object` | Shared data contracts  |
| `apis`       |       No | `object` | Named API definitions  |
| `lookups`    |       No | `object` | Reusable option sets   |
| `actions`    |       No | `object` | Reusable named actions |

## App Contract

### Required Fields

```yaml
app:
  name: customer-portal
  namespace: customer
```

### Allowed Fields

| Field         | Required | Type     | Notes                       |
| ------------- | -------: | -------- | --------------------------- |
| `name`        |      Yes | `string` | Stable app identifier       |
| `namespace`   |      Yes | `string` | Domain or feature namespace |
| `title`       |       No | `string` | Human-readable title        |
| `description` |       No | `string` | App description             |

## Page Contract

A page is a routeable UI surface.

```yaml
pages:
  - id: customer-create
    route: /customers/new
    title: Create Customer
    layout: single-column
    data:
      model: customerForm
    sections: []
```

### Required Fields

| Field      | Required | Type     | Notes                  |
| ---------- | -------: | -------- | ---------------------- |
| `id`       |      Yes | `string` | Unique page identifier |
| `route`    |      Yes | `string` | Route path             |
| `sections` |      Yes | `array`  | Ordered page sections  |

### Optional Fields

| Field     | Type     | Notes                        |
| --------- | -------- | ---------------------------- |
| `title`   | `string` | Page title                   |
| `layout`  | `string` | Layout token                 |
| `data`    | `object` | Page-level model binding     |
| `actions` | `array`  | Page-local actions           |
| `guards`  | `array`  | Access or precondition rules |
| `ui`      | `object` | Page rendering metadata      |

## Section Contract

A section groups related UI elements on a page.

```yaml
sections:
  - id: customer-form-section
    type: form-section
    title: Customer Information
    widgets: []
```

### Required Fields

| Field     | Required | Type     | Notes                 |
| --------- | -------: | -------- | --------------------- |
| `id`      |      Yes | `string` | Unique within page    |
| `type`    |      Yes | `string` | Section type token    |
| `widgets` |      Yes | `array`  | Ordered child widgets |

### Allowed Section Types

1. `form-section`
2. `card-group`
3. `table-section`
4. `details-section`
5. `summary-section`
6. `toolbar`

## Widget Contract

A widget is the fundamental renderable unit.

```yaml
- id: firstName
  type: text-field
  label: First Name
  bind: customer.firstName
```

### Required Fields

| Field  | Required | Type     | Notes                     |
| ------ | -------: | -------- | ------------------------- |
| `id`   |      Yes | `string` | Unique within local scope |
| `type` |      Yes | `string` | Widget type               |

### Common Optional Fields

| Field          | Type                          | Notes                               |
| -------------- | ----------------------------- | ----------------------------------- |
| `label`        | `string`                      | Field or control label              |
| `bind`         | `string`                      | Data binding path                   |
| `value`        | `string \| number \| boolean` | Literal or expression-backed value  |
| `required`     | `boolean`                     | Shortcut UI requirement flag        |
| `placeholder`  | `string`                      | Input placeholder                   |
| `helpText`     | `string`                      | Supporting help text                |
| `defaultValue` | `string \| number \| boolean` | Initial value                       |
| `visibleWhen`  | `object`                      | Conditional visibility              |
| `disabledWhen` | `object`                      | Conditional disabled state          |
| `readonlyWhen` | `object`                      | Conditional read-only state         |
| `validation`   | `object`                      | Validation rules                    |
| `ui`           | `object`                      | Rendering metadata                  |
| `actions`      | `array`                       | Local actions                       |
| `options`      | `string \| array`             | Selectable options                  |
| `fields`       | `array`                       | Used by `form` widgets              |
| `body`         | `array`                       | Used by rich widgets such as `card` |
| `columns`      | `array`                       | Used by `table`                     |

## Widget Types

### Field Widgets

1. `text-field`
2. `number-field`
3. `password-field`
4. `email-field`
5. `phone-field`
6. `textarea`
7. `select`
8. `checkbox`
9. `radio-group`
10. `date-field`

### Structural Widgets

1. `form`
2. `card`
3. `card-list`
4. `table`
5. `heading`
6. `text`
7. `alert`
8. `divider`
9. `spacer`
10. `button`

## Binding Rules

Bindings use dot-path syntax.

### Syntax

```yaml
bind: customer.firstName
```

### Rules

1. Use dot notation only.
2. Resolve against page, form, row, or card scope.
3. Do not include framework syntax.
4. Do not use function calls in `v0.2`.

### Valid Examples

1. `customer.firstName`
2. `customer.address.home.zip`
3. `item.email`

### Invalid Examples

1. `customer.getName()`
2. `form['firstName']`
3. `state.customer.firstName`

## Scope Resolution Rules

### Binding Scope

Bindings resolve in this order:

1. local item scope such as `item`
2. local form alias if defined
3. page data model scope
4. root named model alias

### Recommended Form Alias Rule

For forms, prefer an explicit alias in the page or form context.

```yaml
data:
  alias: customer
  model: customerForm
```

Then bind fields using:

```yaml
bind: customer.firstName
```

Avoid relative paths like `firstName` in `v0.2`.

## Form Contract

A form is a first-class widget.

```yaml
- id: customerForm
  type: form
  model: customerForm
  alias: customer
  submit:
    action: createCustomerAction
  fields: []
```

### Required Fields

| Field    | Required | Type     | Notes                 |
| -------- | -------: | -------- | --------------------- |
| `id`     |      Yes | `string` | Form identifier       |
| `type`   |      Yes | `string` | Must be `form`        |
| `model`  |      Yes | `string` | Named model reference |
| `fields` |      Yes | `array`  | Ordered field widgets |

### Optional Fields

| Field      | Type               | Notes                           |
| ---------- | ------------------ | ------------------------------- |
| `alias`    | `string`           | Binding alias for the form data |
| `submit`   | `object`           | Submit action binding           |
| `load`     | `object`           | Load action binding             |
| `reset`    | `object`           | Reset action binding            |
| `layout`   | `string \| object` | Form layout token or config     |
| `messages` | `object`           | Validation or status messages   |

## Validation Contract

Validation may be declared at both the model field level and the widget level.

```yaml
validation:
  required: true
  minLength: 6
  maxLength: 50
  pattern: '^\\(\\d{3}\\) \\d{3}-\\d{4}$'
  message: Phone number must match format (555) 123-4567
```

### Supported Fields

| Field         | Type      | Notes                         |
| ------------- | --------- | ----------------------------- |
| `required`    | `boolean` | Field must be provided        |
| `min`         | `number`  | Minimum numeric value         |
| `max`         | `number`  | Maximum numeric value         |
| `minLength`   | `number`  | Minimum string length         |
| `maxLength`   | `number`  | Maximum string length         |
| `pattern`     | `string`  | Regex string                  |
| `format`      | `string`  | Named format token            |
| `message`     | `string`  | Default validation message    |
| `customRules` | `array`   | Expression-based custom rules |

### Custom Rule Contract

```yaml
customRules:
  - name: adult-age
    expr: customer.age > 18
    message: Age must be greater than 18
```

| Field     | Required | Type     | Notes                 |
| --------- | -------: | -------- | --------------------- |
| `name`    |      Yes | `string` | Rule identifier       |
| `expr`    |      Yes | `string` | Validation expression |
| `message` |      Yes | `string` | Failure message       |

## Validation Resolution Rules

### Precedence

Validation resolves in this order:

1. model field validation
2. widget-local validation

### Merge Rules

Widget-local validation may:

1. extend model validation
2. add UI-specific messages
3. add stricter constraints

Widget-local validation must not:

1. weaken model-defined constraints
2. remove required model rules
3. redefine incompatible base types

### Examples

If the model declares:

```yaml
models:
  customerForm:
    fields:
      password:
        type: string
        validation:
          minLength: 6
```

A widget may add:

```yaml
validation:
  minLength: 8
  message: Password must be at least 8 characters
```

A widget must not lower it to:

```yaml
validation:
  minLength: 4
```

## UI Metadata Contract

UI metadata controls rendering hints and testability, not data rules.

```yaml
ui:
  width: xs
  inputMask: '(###) ###-####'
  autocomplete: given-name
  testId: customer-phone
```

### Supported Fields

| Field          | Type              | Notes                                |
| -------------- | ----------------- | ------------------------------------ |
| `width`        | `string`          | Token such as `xs`, `sm`, `md`, `lg` |
| `inputMask`    | `string`          | Input formatting mask                |
| `autocomplete` | `string`          | Browser autocomplete hint            |
| `testId`       | `string`          | Stable test selector                 |
| `cssClass`     | `string \| array` | Render class hint                    |
| `variant`      | `string`          | Visual variant token                 |
| `density`      | `string`          | Spacing density token                |

## Options Contract

Selectable widgets such as `select` and `radio-group` may define options inline or by lookup reference.

### Inline Options

```yaml
options:
  - label: USA
    value: USA
  - label: Canada
    value: Canada
```

### Lookup Options

```yaml
options: lookup:countries
```

### Option Item Contract

| Field      | Required | Type                          | Notes                   |
| ---------- | -------: | ----------------------------- | ----------------------- |
| `label`    |      Yes | `string`                      | Display label           |
| `value`    |      Yes | `string \| number \| boolean` | Submitted value         |
| `disabled` |       No | `boolean`                     | Optional disabled state |

## Card Contract

```yaml
- id: customerSummaryCard
  type: card
  title: Customer Summary
  bind: customer
  body:
    - type: text
      value: '${customer.firstName} ${customer.lastName}'
```

### Fields

| Field     | Required | Type     | Notes                 |
| --------- | -------: | -------- | --------------------- |
| `id`      |      Yes | `string` | Card identifier       |
| `type`    |      Yes | `string` | Must be `card`        |
| `body`    |      Yes | `array`  | Child content widgets |
| `title`   |       No | `string` | Card title            |
| `bind`    |       No | `string` | Bound object scope    |
| `actions` |       No | `array`  | Card actions          |

## Table Contract

```yaml
- id: customerTable
  type: table
  source: customers
  sortable: true
  columns:
    - id: firstName
      label: First Name
      value: item.firstName
      sortable: true
    - id: lastName
      label: Last Name
      value: item.lastName
      sortable: true
    - id: actions
      label: Actions
      sortable: false
```

### Fields

| Field        | Required | Type      | Notes                        |
| ------------ | -------: | --------- | ---------------------------- |
| `id`         |      Yes | `string`  | Table identifier             |
| `type`       |      Yes | `string`  | Must be `table`              |
| `source`     |      Yes | `string`  | Data collection binding      |
| `columns`    |      Yes | `array`   | Column definitions           |
| `rowActions` |       No | `array`   | Row-level actions            |
| `sortable`   |       No | `boolean` | Enable column sorting (default: false) |

### Column Contract

| Field      | Required | Type      | Notes                                    |
| ---------- | -------: | --------- | ---------------------------------------- |
| `id`       |      Yes | `string`  | Column identifier                        |
| `label`    |      Yes | `string`  | Column header                            |
| `value`    |      Yes | `string`  | Bound value expression                   |
| `sortable` |       No | `boolean` | Column is sortable (inherits from table) |
| `ui`       |       No | `object`  | Column UI metadata (testId, width)       |

### Table Sorting Pattern

When `sortable: true`, generate clickable column headers:

```tsx
type SortDirection = "asc" | "desc" | null;
type SortColumn = "firstName" | "lastName" | null;

const [sortColumn, setSortColumn] = useState<SortColumn>(null);
const [sortDirection, setSortDirection] = useState<SortDirection>(null);

const handleSort = (column: SortColumn) => {
  if (sortColumn === column) {
    if (sortDirection === "asc") setSortDirection("desc");
    else if (sortDirection === "desc") {
      setSortColumn(null);
      setSortDirection(null);
    } else setSortDirection("asc");
  } else {
    setSortColumn(column);
    setSortDirection("asc");
  }
};

// Column header with sort indicator
<th onClick={() => handleSort("firstName")} className="sortable">
  First Name {sortColumn === "firstName" ? (sortDirection === "asc" ? "↑" : "↓") : "↕"}
</th>
```

## Action Contract

Actions may be declared globally or locally.

### Global Named Action

```yaml
actions:
  createCustomerAction:
    type: api-call
    api: createCustomer
    onSuccess:
      - type: navigate
        to: /customers
```

### Local Widget Action

```yaml
actions:
  - type: copy-value
    when:
      expr: customer.sameAsHomeAddress == true
    from: customer.homeAddress
    to: customer.billingAddress
```

### Supported Action Types

1. `api-call`
2. `navigate`
3. `set-value`
4. `copy-value`
5. `toggle`
6. `open-modal`
7. `close-modal`
8. `show-message`
9. `reset-form`

### Common Fields

| Field             | Required | Type      | Notes                                |
| ----------------- | -------: | --------- | ------------------------------------ |
| `type`            |      Yes | `string`  | Action type                          |
| `when`            |       No | `object`  | Conditional execution                |
| `onSuccess`       |       No | `array`   | Success follow-up actions            |
| `onError`         |       No | `array`   | Error follow-up actions              |
| `continueOnError` |       No | `boolean` | Continue chained actions after error |

### Action-Specific Fields

#### `api-call`

| Field | Required | Type     |
| ----- | -------: | -------- |
| `api` |      Yes | `string` |

#### `navigate`

| Field | Required | Type     |
| ----- | -------: | -------- |
| `to`  |      Yes | `string` |

#### `set-value`

| Field    | Required | Type                          |
| -------- | -------: | ----------------------------- |
| `target` |      Yes | `string`                      |
| `value`  |      Yes | `string \| number \| boolean` |

#### `copy-value`

| Field  | Required | Type     |
| ------ | -------: | -------- |
| `from` |      Yes | `string` |
| `to`   |      Yes | `string` |

#### `show-message`

| Field   | Required | Type     |
| ------- | -------: | -------- |
| `level` |      Yes | `string` |
| `text`  |      Yes | `string` |

## Action Resolution Rules

### Lookup Order

When an action reference is used, resolve in this order:

1. local widget action object
2. local page action
3. top-level named action

### Execution Order

Multiple actions execute sequentially in declaration order.

### Failure Behavior

By default:

1. stop action execution on failure
2. run `onError` if defined
3. do not continue subsequent chained actions

If `continueOnError: true` is set, execution may continue after the failed action.

## API Contract

The `apis` section defines reusable request contracts.

```yaml
apis:
  createCustomer:
    method: POST
    path: /api/customers
    request:
      body: customerForm
    response:
      successModel: customer
      errorModel: validationError
```

### Required Fields

| Field    | Required | Type     | Notes                         |
| -------- | -------: | -------- | ----------------------------- |
| `method` |      Yes | `string` | HTTP method                   |
| `path`   |      Yes | `string` | Relative or absolute API path |

### Optional Fields

| Field      | Type               | Notes                   |
| ---------- | ------------------ | ----------------------- |
| `query`    | `object`           | Query parameter mapping |
| `request`  | `object`           | Request contract        |
| `response` | `object`           | Response contract       |
| `headers`  | `object`           | Header mapping          |
| `auth`     | `string \| object` | Auth hint               |

## Model Contract

Models define reusable data shapes independent from rendering.

```yaml
models:
  customerForm:
    fields:
      firstName:
        type: string
      age:
        type: number
      country:
        type: string
```

### Required Fields

| Field    | Required | Type     | Notes                  |
| -------- | -------: | -------- | ---------------------- |
| `fields` |      Yes | `object` | Map of field contracts |

### Model Field Contract

| Field          | Required | Type      | Notes                  |
| -------------- | -------: | --------- | ---------------------- |
| `type`         |      Yes | `string`  | Primitive type token   |
| `required`     |       No | `boolean` | Base model requirement |
| `validation`   |       No | `object`  | Base validation rules  |
| `defaultValue` |       No | any       | Default data value     |

### Primitive Types

1. `string`
2. `number`
3. `boolean`
4. `object`
5. `array`
6. `date`

## Lookup Contract

Lookups define reusable selectable values.

```yaml
lookups:
  usStates:
    - label: Missouri
      value: MO
    - label: Illinois
      value: IL
```

Each lookup key must map to an array of option items.

## Expression Language

Expressions are used by:

1. `visibleWhen.expr`
2. `disabledWhen.expr`
3. `readonlyWhen.expr`
4. validation `customRules.expr`
5. action `when.expr`

### Rules

Expressions must:

1. be strings
2. be side-effect free
3. avoid framework-specific syntax
4. reference bound model values only

### Allowed Operators

1. `==`
2. `!=`
3. `>`
4. `<`
5. `>=`
6. `<=`
7. `&&`
8. `||`
9. `!`

### Allowed Literals

1. strings
2. numbers
3. booleans
4. `null`

### Valid Examples

```yaml
expr: customer.country == 'USA'
expr: customer.age > 18
expr: customer.sameAsHomeAddress == true
expr: customer.country != null && customer.country != ''
```

### Invalid Examples

```yaml
expr: someFunction(customer.age)
expr: setTimeout(x)
expr: props.country === 'USA'
```

## Layout Tokens

### Page Layout Tokens

1. `single-column`
2. `two-column`
3. `three-column`
4. `stack`
5. `shell` — application shell with regions

### Width Tokens

1. `xs`
2. `sm`
3. `md`
4. `lg`
5. `xl`
6. `full`

## Shell Contract

A shell defines the shared application frame that wraps multiple pages.

```yaml
shell:
  id: app-shell
  title: My App
  layout:
    type: shell
    structure:
      - region: sidebar
        position: left
        width: 240
        collapsible: true
        collapsedWidth: 64
      - region: topNav
        position: top
        height: 60
      - region: main
        position: center
  navigation:
    sidebar:
      id: main-nav
      collapsible: true
      items: []
    topNav:
      id: top-nav
      left: []
      right: []
  contentSlot:
    id: main-content
    region: main
    renderChildren: true
```

### Shell Fields

| Field         | Required | Type     | Notes                          |
| ------------- | -------: | -------- | ------------------------------ |
| `id`          |      Yes | `string` | Unique shell identifier        |
| `title`       |       No | `string` | Application title              |
| `layout`      |      Yes | `object` | Shell layout structure         |
| `navigation`  |       No | `object` | Navigation configuration       |
| `contentSlot` |      Yes | `object` | Where child pages are rendered |

### Shell Region Contract

| Field           | Required | Type      | Notes                              |
| --------------- | -------: | --------- | ---------------------------------- |
| `region`        |      Yes | `string`  | Region identifier                  |
| `position`      |      Yes | `string`  | `left`, `right`, `top`, `center`   |
| `width`         |       No | `number`  | Width in pixels (sidebar)          |
| `height`        |       No | `number`  | Height in pixels (topNav)          |
| `collapsible`   |       No | `boolean` | Whether region can collapse        |
| `collapsedWidth`|       No | `number`  | Width when collapsed               |
| `ui`            |       No | `object`  | Rendering metadata (testId)        |

### Page Shell Binding

Pages bind to a shell using `shell` and `renderIn`:

```yaml
page:
  id: customer-list
  route: /customers
  shell: app-shell
  renderIn: main-content
```

| Field      | Required | Type     | Notes                           |
| ---------- | -------: | -------- | ------------------------------- |
| `shell`    |       No | `string` | Reference to shell id           |
| `renderIn` |       No | `string` | Content slot id to render into  |

## Collapsible Sidebar Pattern

When `collapsible: true` on a sidebar region:

1. Generate a toggle button in the sidebar header
2. When collapsed, show only icons (no labels)
3. Apply `collapsed` CSS class to sidebar element
4. Persist state locally (optional)

```tsx
const [collapsed, setCollapsed] = useState(false);

<aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
  <button onClick={() => setCollapsed(!collapsed)}>
    {collapsed ? "»" : "«"}
  </button>
  {/* Navigation items */}
</aside>
```

## Top Navigation Contract

Top navigation appears above the main content area.

```yaml
topNav:
  id: top-nav
  position: top
  left:
    - id: app-title
      type: text
      value: Commerce App
  right:
    - id: user-greeting
      type: text
      value: "Welcome, User"
```

| Field    | Required | Type    | Notes                     |
| -------- | -------: | ------- | ------------------------- |
| `id`     |      Yes | `string`| Navigation identifier     |
| `position`|     Yes | `string`| Must be `top`             |
| `left`   |       No | `array` | Items on the left side    |
| `right`  |       No | `array` | Items on the right side   |

## Modal Dialog Contract

Modal dialogs are centered overlays for confirmations or forms.

```yaml
confirm:
  type: modal-dialog
  position: center
  title: Delete Customer
  message: "Are you sure you want to delete {row.firstName}?"
  confirmLabel: Delete
  cancelLabel: Cancel
  variant: danger
  ui:
    testId: confirm-dialog
```

### Modal Dialog Fields

| Field         | Required | Type     | Notes                              |
| ------------- | -------: | -------- | ---------------------------------- |
| `type`        |      Yes | `string` | Must be `modal-dialog`             |
| `position`    |       No | `string` | `center` (default), `top`          |
| `title`       |      Yes | `string` | Dialog title                       |
| `message`     |      Yes | `string` | Dialog message (supports binding)  |
| `confirmLabel`|       No | `string` | Confirm button text                |
| `cancelLabel` |       No | `string` | Cancel button text                 |
| `variant`     |       No | `string` | `default`, `danger`                |
| `ui`          |       No | `object` | Rendering metadata (testId)        |

### Modal Dialog Implementation

Generators must produce centered modal dialogs using:

```tsx
<dialog className="confirm-dialog" data-testid="confirm-dialog">
  <div className="confirm-dialog-content">
    <h2>{title}</h2>
    <p>{message}</p>
    <div className="confirm-dialog-actions">
      <button onClick={onCancel}>{cancelLabel}</button>
      <button onClick={onConfirm}>{confirmLabel}</button>
    </div>
  </div>
</dialog>
```

CSS positioning must center the dialog:

```css
.confirm-dialog-content {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

## Testing Metadata

The language supports stable testing metadata under `ui`.

### Recommended Fields

1. `testId`
2. `cssClass`

Generators may use these for:

1. unit test selectors
2. integration test selectors
3. render assertions

## Normalization Rules

1. Prefer explicit objects over overloaded shorthand, except for `options: lookup:name`.
2. Keep validation in `validation`, not in `ui`.
3. Keep rendering metadata in `ui`, not in `validation`.
4. Keep data shape in `models`, not in widgets unless a widget is intentionally extending behavior.
5. Keep reusable actions in top-level `actions`.
6. Use explicit binding aliases for forms and repeated item scopes.

## Lint Rules

A YAML document conforming to this skill should satisfy these checks:

1. root `version`, `app`, and `pages` must exist
2. every `page.id`, `section.id`, and widget `id` must be unique in its local scope
3. every widget `type` must be from the allowed vocabulary
4. every `bind` must use valid dot-path syntax
5. every `options: lookup:name` reference must resolve to an existing lookup
6. every `submit.action` or action reference must resolve successfully
7. widget validation must not weaken model validation
8. expressions must use only allowed operators and literals
9. `form.model` must resolve to a defined model
10. table `source` and column `value` bindings must resolve to valid scope

## Generator Conformance Rules

A generator implementing this language should:

1. preserve the declared widget order
2. enforce model validation plus widget-local validation
3. render conditional visibility and disabled states from expressions
4. resolve action chains sequentially
5. apply UI metadata as hints, not business rules
6. expose stable test selectors when `ui.testId` is defined
7. fail fast on unresolved model, lookup, API, or action references

## End-to-End Example

```yaml
version: 1

app:
  name: customer-portal
  namespace: customer
  title: Customer Portal

models:
  customerForm:
    fields:
      firstName:
        type: string
        required: true
      password:
        type: string
        validation:
          minLength: 6
      age:
        type: number
        validation:
          customRules:
            - name: adult-age
              expr: customer.age > 18
              message: Age must be greater than 18
      country:
        type: string
      state:
        type: string
      zip:
        type: string
      sameAsHomeAddress:
        type: boolean

lookups:
  countries:
    - label: USA
      value: USA
    - label: Canada
      value: Canada
  usStates:
    - label: Missouri
      value: MO
    - label: Illinois
      value: IL

apis:
  createCustomer:
    method: POST
    path: /api/customers
    request:
      body: customerForm

actions:
  createCustomerAction:
    type: api-call
    api: createCustomer
    onSuccess:
      - type: navigate
        to: /customers
    onError:
      - type: show-message
        level: error
        text: Unable to create customer

pages:
  - id: customer-create
    route: /customers/new
    title: Create Customer
    layout: single-column
    data:
      alias: customer
      model: customerForm
    sections:
      - id: customer-form-section
        type: form-section
        widgets:
          - id: customerForm
            type: form
            model: customerForm
            alias: customer
            submit:
              action: createCustomerAction
            fields:
              - id: firstName
                type: text-field
                label: First Name
                bind: customer.firstName
                required: true
                ui:
                  width: md
                  testId: customer-first-name

              - id: password
                type: password-field
                label: Password
                bind: customer.password
                validation:
                  minLength: 8
                  message: Password must be at least 8 characters

              - id: age
                type: number-field
                label: Age
                bind: customer.age
                validation:
                  customRules:
                    - name: adult-age
                      expr: customer.age > 18
                      message: Age must be greater than 18
                ui:
                  width: xs

              - id: country
                type: select
                label: Country
                bind: customer.country
                options: lookup:countries
                required: true

              - id: state
                type: select
                label: State
                bind: customer.state
                options: lookup:usStates
                visibleWhen:
                  expr: customer.country == 'USA'
                ui:
                  width: sm

              - id: province
                type: text-field
                label: State / Province
                bind: customer.state
                visibleWhen:
                  expr: customer.country != 'USA'
                ui:
                  width: md

              - id: zip
                type: text-field
                label: ZIP
                bind: customer.zip
                validation:
                  pattern: '^\\d{5}(-\\d{4})?$'
                  message: ZIP must be 12345 or 12345-6789
                ui:
                  width: xs

              - id: sameAsHomeAddress
                type: checkbox
                label: Billing address same as home address
                bind: customer.sameAsHomeAddress
                actions:
                  - type: copy-value
                    when:
                      expr: customer.sameAsHomeAddress == true
                    from: customer.homeAddress
                    to: customer.billingAddress
```

## Authoring Guidance

When using this skill to define a UI language or author YAML specs:

1. start with `models`, `lookups`, `apis`, and `actions`
2. define pages next
3. keep binding aliases explicit
4. declare validation in models first
5. extend validation in widgets only when needed
6. add `ui.testId` for test-critical fields and controls
7. keep layout token-based until nested container support is formally added

## Future Extensions

Version `0.3` should consider:

1. nested container layouts
2. localization and message catalogs
3. model composition or inheritance
4. generator capability declarations
5. JSON Schema for the YAML language
6. event contracts beyond action chains

## Recommendation

Use this document as the `v2` baseline for the future `SKILL.md` and as the source specification for parser, linter, and code generator work.
