---
name: react-form-page
description: Generate React form pages and components from DSL page specifications. Use when creating or updating frontend forms for CRUD operations.
---

# React Form Page

Generate React form pages from `app-dsl/ui/pages/` and `app-dsl/models/ui/` specifications.

## Purpose

Create:
- Form component with all fields
- Create/Edit page components
- List page with data table
- Form validation logic
- API integration hooks

## Use When

- Creating a new entity's frontend pages
- Adding form fields from DSL
- Updating validation rules

## Inputs

| Input | Description | Required |
|-------|-------------|----------|
| `parsed_pages` | Array of parsed page specifications from `dsl-model-interpreter` | **Yes** |
| `parsed_ui_model` | Parsed UI model from `dsl-model-interpreter` | **Yes** |
| `parsed_lookups` | Parsed lookup data (if referenced) | No |
| `dsl_context` | DSL context with path metadata from orchestrator | **Yes** |
| `entity` | PascalCase (e.g., `Customer`) | **Yes** |
| `resource` | Plural kebab-case (e.g., `customers`) | **Yes** |

### Input Contract

This skill receives **parsed content** from the `dsl-model-interpreter`, not raw file paths.

**Expected `parsed_pages` structure:**
```json
[
  {
    "page": {
      "id": "customer-create",
      "route": "/customers/new",
      "title": "Create Customer",
      "mode": "create",
      "layout": { "type": "single-column" },
      "form": { "modelRef": "...", "stateAlias": "customer" },
      "sections": [...]
    }
  }
]
```

**Expected `parsed_ui_model` structure:**
```json
{
  "kind": "ui-model",
  "fields": {
    "firstName": { "type": "string", "required": true },
    "sameAsHomeAddress": { "type": "boolean", "uiOnly": true }
  }
}
```

**Expected `dsl_context` structure:**
```json
{
  "originalPath": "./app-dsl",
  "resolvedPath": "/absolute/path/to/app-dsl",
  "inputType": "directory",
  "entity": "Customer",
  "resource": "customers"
}
```

### Legacy Compatibility

**Deprecated:** Direct file path inputs are deprecated. Use the orchestrator's parsed content instead.

## Outputs

| Output | Location |
|--------|----------|
| Form component | `app/web/src/app/{resources}/{entity}-form.tsx` |
| Create page | `app/web/src/app/{resources}/new/page.tsx` |
| Edit page | `app/web/src/app/{resources}/[id]/edit/page.tsx` |
| List page | `app/web/src/app/{resources}/page.tsx` |
| API client | `app/web/src/lib/{entity}-api.ts` |
| Form tests | `app/web/src/app/{resources}/{entity}-form.test.tsx` |

## Dependencies

| Skill | Purpose |
|-------|---------|
| `dsl-model-interpreter` | Parse page and model YAML |
| `nestjs-crud-resource` | Backend API must exist |

## Repository Patterns Reproduced

### Directory Structure

```
app/web/src/app/{resources}/
  page.tsx              # List page
  new/
    page.tsx            # Create page
  [id]/
    page.tsx            # View page
    edit/
      page.tsx          # Edit page
  {entity}-form.tsx     # Shared form component
  {entity}-form.test.tsx
  {entity}-list.tsx     # List component
```

### Form Component Pattern

```tsx
'use client';

import { useState, useEffect } from 'react';

interface {Entity}FormProps {
  mode: 'create' | 'edit';
  initialData?: {Entity}FormData;
  onSubmit: (data: {Entity}FormData) => Promise<void>;
}

export function {Entity}Form({ mode, initialData, onSubmit }: {Entity}FormProps) {
  const [formData, setFormData] = useState<{Entity}FormData>(
    initialData ?? defaultFormData
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Field handlers
  const handleChange = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Conditional rendering for country-dependent fields
  const isUSA = formData.homeAddress?.country === 'USA';

  return (
    <form onSubmit={handleSubmit} autoComplete="off">
      {/* Form sections */}
    </form>
  );
}
```

### Field Type Mappings

| DSL `type` | React Component |
|------------|-----------------|
| `text-field` | `<input type="text">` |
| `number-field` | `<input type="number">` |
| `email-field` | `<input type="email" autoComplete="off">` |
| `password-field` | `<input type="password" autoComplete="new-password">` |
| `phone-field` | `<input type="tel">` with mask |
| `select` | `<select>` with options |
| `checkbox` | `<input type="checkbox">` |
| `button` | `<button type="submit">` |

### Conditional Rendering Pattern

```tsx
// From DSL: visibleWhen: { all: [{ path: 'homeAddress.country', op: 'eq', value: 'USA' }] }
{formData.homeAddress?.country === 'USA' && (
  <select data-testid="customer-home-state-select">
    {usStates.map(state => (
      <option key={state.value} value={state.value}>{state.label}</option>
    ))}
  </select>
)}
```

### Disabled Field Pattern

```tsx
// From DSL: disabledWhen: { all: [{ path: 'sameAsHomeAddress', op: 'eq', value: true }] }
<input
  disabled={formData.sameAsHomeAddress}
  data-testid="customer-billing-address-line1"
/>
```

### Field Sync Pattern (Copy Value Action)

```tsx
// From DSL: actions: [{ type: 'copy-value', from: 'homeAddress', to: 'billingAddress' }]
useEffect(() => {
  if (formData.sameAsHomeAddress) {
    setFormData(prev => ({
      ...prev,
      billingAddress: { ...prev.homeAddress }
    }));
  }
}, [formData.sameAsHomeAddress, formData.homeAddress]);
```

## Instructions

### Step 1: Use Parsed DSL Content

**Receive parsed content from the orchestrator** (via `dsl-model-interpreter` output):

**From `parsed_pages`:**
```json
[
  {
    "page": {
      "id": "customer-create",
      "route": "/customers/new",
      "mode": "create",
      "sections": [...]
    }
  }
]
```

**From `parsed_ui_model`:**
```json
{
  "fields": {
    "firstName": { "type": "string", "required": true },
    "sameAsHomeAddress": { "type": "boolean", "uiOnly": true }
  }
}
```

**From `parsed_lookups` (if referenced):**
```json
{
  "countries": { "items": [...] },
  "usStates": { "items": [...] }
}
```

**Note:** Do NOT read DSL files directly. The orchestrator provides pre-parsed content.

### Step 2: Generate Form Data Types

From UI model, create TypeScript interface:

```typescript
interface {Entity}FormData {
  firstName: string;
  middleInitial?: string;
  lastName: string;
  age: number;
  password: string;
  sameAsHomeAddress: boolean;  // UI-only field
  homeAddress: AddressFormData;
  billingAddress: AddressFormData;
}
```

### Step 3: Generate Form Component

For each section in page spec:

1. Create section container with title
2. For each field:
   - Determine input type from `type`
   - Add `data-testid` from `ui.testId`
   - Add validation from model
   - Add `visibleWhen` conditional
   - Add `disabledWhen` conditional
   - Add `requiredWhen` validation
   - Bind to form state via `bind` path

### Step 4: Implement Field Sizing

Map DSL `ui.width` to CSS classes:

| Width | CSS Class / Width |
|-------|-------------------|
| `xs` | `w-16` or `max-w-[4rem]` |
| `sm` | `w-32` or `max-w-[8rem]` |
| `md` | `w-48` or `max-w-[12rem]` |
| `lg` | `w-64` or `max-w-[16rem]` |
| `xl` | `w-full` |

### Step 5: Implement Validation

From model validation rules:

```typescript
const validateForm = (data: {Entity}FormData): Record<string, string> => {
  const errors: Record<string, string> = {};

  // Required field
  if (!data.firstName) errors.firstName = 'First name is required';

  // Custom rule: age > 18
  if (data.age <= 18) errors.age = 'Age must be greater than 18';

  // Pattern validation
  if (data.phone && !/^\(\d{3}\) \d{3}-\d{4}$/.test(data.phone)) {
    errors.phone = 'Phone must match format (555) 123-4567';
  }

  // Conditional required
  if (data.homeAddress.country === 'USA' && !data.homeAddress.zip) {
    errors['homeAddress.zip'] = 'ZIP is required for USA';
  }

  return errors;
};
```

### Step 6: Generate Lookup Data

Import lookup data or fetch from API:

```typescript
const countries = [
  { label: 'USA', value: 'USA' },
  { label: 'Canada', value: 'Canada' },
];

const usStates = [
  { label: 'Alabama', value: 'AL' },
  // ...
];
```

### Step 7: Generate Page Components

**Create Page** (`/new/page.tsx`):

```tsx
export default function Create{Entity}Page() {
  const router = useRouter();

  const handleSubmit = async (data: {Entity}FormData) => {
    await create{Entity}(data);
    router.push('/{resources}');
  };

  return <{Entity}Form mode="create" onSubmit={handleSubmit} />;
}
```

**Edit Page** (`/[id]/edit/page.tsx`):

```tsx
export default function Edit{Entity}Page({ params }: { params: { id: string } }) {
  const [data, setData] = useState<{Entity}FormData | null>(null);

  useEffect(() => {
    get{Entity}(params.id).then(setData);
  }, [params.id]);

  if (!data) return <Loading />;

  return <{Entity}Form mode="edit" initialData={data} onSubmit={...} />;
}
```

### Step 8: Generate API Client

```typescript
// app/web/src/lib/{entity}-api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function create{Entity}(data: {Entity}FormData) {
  const res = await fetch(`${API_BASE}/{resources}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create');
  return res.json();
}
```

### Step 9: Add Metadata Headers

```tsx
/**
 * App: base-node-fullstack
 * Package: web
 * File: {filename}
 * Version: 0.1.0
 * Turns: {TURN_ID}
 * Author: AI Coding Agent ({MODEL_NAME})
 * Date: {ISO8601_DATE}
 * Exports: {ComponentName}
 * Description: {description}
 */
```

### Step 10: Validation Loop

```bash
cd app/web
pnpm run build
pnpm run test
```

## Required Tests

| Test Scenario | Coverage |
|---------------|----------|
| Renders all fields | All form fields visible |
| Conditional visibility | Country-dependent state field |
| Disabled state | Billing fields when same-as-home |
| Field sync | Billing copies home address |
| Validation errors | Required, pattern, custom rules |
| Successful submit | Form data passed to onSubmit |
| Edit mode prefill | Initial data populates fields |

**Minimum 20 test cases** covering:
- Field rendering (one per field)
- Conditional rendering (visible/hidden states)
- Validation (required, pattern, custom rules)
- User interactions (change, submit)

## Constraints

- **Next.js App Router**: Use `'use client'` directive
- **data-testid attributes**: Required for all interactive elements
- **Controlled inputs**: All fields use React state
- **No external form libraries**: Plain React state management
- **Prevent browser autofill**: Add `autoComplete="off"` to `<form>`, use `autoComplete="new-password"` for password fields, and `autoComplete="off"` for email fields in entity forms (not login forms)

## Non-Goals

- Complex form state libraries (React Hook Form, Formik)
- Server-side form validation
- File upload fields
- Rich text editors
