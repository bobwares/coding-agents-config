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

When pages specify `shell` and `renderIn`, generate inside a Next.js route group:

```
app/web/src/app/(dashboard)/
  layout.tsx            # Dashboard layout with shell
  page.tsx              # Home/landing page content
  {resources}/
    page.tsx            # List page
    CustomerTable.tsx   # Table component with modal dialog
    new/
      page.tsx          # Create page
    [id]/
      edit/
        page.tsx        # Edit page
        EditForm.tsx    # Edit form wrapper
app/web/src/components/
  DashboardShell.tsx    # Shared shell component
  ui/
    ConfirmDialog.tsx   # Centered modal dialog component
```

### Shell-Based Layout Pattern

When DSL pages specify `shell: app-shell` and `renderIn: main-content`:

1. Generate a route group (e.g., `(dashboard)`) for shell-wrapped pages
2. Create a shared layout.tsx that wraps children with the shell
3. Generate page content without standalone page structure
4. Content renders inside the shell's main content area

```tsx
// app/web/src/app/(dashboard)/layout.tsx
import { DashboardShell } from "@/components/DashboardShell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}

// app/web/src/app/(dashboard)/customers/page.tsx
export default function CustomerListPage() {
  return (
    <div className="page-content">
      {/* Page content without shell wrapper */}
    </div>
  );
}
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
| `text-field` | `<input type="text" autoComplete="off">` |
| `number-field` | `<input type="number">` |
| `email-field` | `<input type="email" autoComplete="off">` |
| `password-field` | `<input type="password" autoComplete="new-password">` |
| `phone-field` | `<input type="tel" autoComplete="off">` with mask |
| `select` | `<select>` with options |
| `checkbox` | `<input type="checkbox">` |
| `button` | `<button type="submit">` |

### Phone Number Mask Pattern

Implement phone formatting as-you-type for `phone-field` widgets:

```tsx
/**
 * Formats a phone number string as user types: (XXX) XXX-XXXX
 * Strips non-digits, then applies mask progressively.
 */
export function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

// Usage in form component:
const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
  const formatted = formatPhoneNumber(e.target.value);
  updateField("phone", formatted);
};

<input
  type="tel"
  value={form.phone}
  onChange={handlePhoneChange}
  placeholder="(555) 123-4567"
  autoComplete="off"
/>
```

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

### DashboardShell Component Pattern

Generate a shared shell component with collapsible sidebar and top navigation:

```tsx
// app/web/src/components/DashboardShell.tsx
"use client";

import { useState, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface DashboardShellProps {
  children: ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <div className="dashboard-layout">
      <aside className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <h2 className={sidebarCollapsed ? "hidden" : ""}>App Title</h2>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="sidebar-toggle"
            data-testid="sidebar-toggle"
          >
            {sidebarCollapsed ? "»" : "«"}
          </button>
        </div>
        <nav className="sidebar-nav">
          {/* Navigation items from DSL */}
        </nav>
      </aside>

      <div className="dashboard-content">
        <header className="top-nav" data-testid="top-nav">
          <div className="top-nav-left">{/* Left items */}</div>
          <div className="top-nav-right">{/* Right items */}</div>
        </header>

        <main className="dashboard-main" data-testid="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### ConfirmDialog Modal Pattern

Generate a centered modal dialog for confirmations:

```tsx
// app/web/src/components/ui/ConfirmDialog.tsx
"use client";

import { useEffect, useRef } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) dialog.showModal();
    else dialog.close();
  }, [open]);

  if (!open) return null;

  return (
    <dialog ref={dialogRef} className="confirm-dialog" data-testid="confirm-dialog">
      <div className="confirm-dialog-content">
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="confirm-dialog-actions">
          <button onClick={onCancel}>{cancelLabel}</button>
          <button
            className={variant === "danger" ? "btn-danger-solid" : "btn-primary"}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
```

### Delete Confirmation Pattern

Replace `window.confirm` with centered modal dialog:

```tsx
// In table/list components
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
const [itemToDelete, setItemToDelete] = useState<Item | null>(null);

const openDeleteDialog = (item: Item) => {
  setItemToDelete(item);
  setDeleteDialogOpen(true);
};

const closeDeleteDialog = () => {
  setDeleteDialogOpen(false);
  setItemToDelete(null);
};

const handleDelete = async () => {
  if (!itemToDelete) return;
  await api.delete(itemToDelete.id);
  closeDeleteDialog();
  router.refresh();
};

// In JSX:
<button onClick={() => openDeleteDialog(item)}>Delete</button>

<ConfirmDialog
  open={deleteDialogOpen}
  title="Delete Item"
  message={`Are you sure you want to delete ${itemToDelete?.name}?`}
  confirmLabel="Delete"
  cancelLabel="Cancel"
  variant="danger"
  onConfirm={handleDelete}
  onCancel={closeDeleteDialog}
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
- **Prevent browser autofill**: Add `autoComplete="off"` to `<form>` and all text/email inputs. Use `autoComplete="new-password"` for password fields. This applies to entity forms (not login forms where autofill is desired).
- **Phone number mask**: Apply input formatting mask for `phone-field` widgets using the `formatPhoneNumber` utility

## Non-Goals

- Complex form state libraries (React Hook Form, Formik)
- Server-side form validation
- File upload fields
- Rich text editors
