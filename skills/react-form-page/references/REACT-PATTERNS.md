# React Form Patterns Reference

Code patterns extracted from `app/web/src/app/customers/` implementation.

## Form Component Structure

```tsx
/**
 * App: base-node-fullstack
 * Package: web
 * File: customer-form.tsx
 * ...
 */
'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';

// Types
interface AddressFormData {
  line1: string;
  line2: string;
  city: string;
  country: string;
  state: string;
  zip: string;
}

interface CustomerFormData {
  firstName: string;
  middleInitial: string;
  lastName: string;
  age: number | '';
  password: string;
  email: string;
  phone: string;
  sameAsHomeAddress: boolean;
  homeAddress: AddressFormData;
  billingAddress: AddressFormData;
}

// Default state
const defaultAddress: AddressFormData = {
  line1: '',
  line2: '',
  city: '',
  country: '',
  state: '',
  zip: '',
};

const defaultFormData: CustomerFormData = {
  firstName: '',
  middleInitial: '',
  lastName: '',
  age: '',
  password: '',
  email: '',
  phone: '',
  sameAsHomeAddress: false,
  homeAddress: { ...defaultAddress },
  billingAddress: { ...defaultAddress },
};

// Props
interface CustomerFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<CustomerFormData>;
  onSubmit: (data: CustomerFormData) => Promise<void>;
}

export function CustomerForm({ mode, initialData, onSubmit }: CustomerFormProps) {
  const [formData, setFormData] = useState<CustomerFormData>(() => ({
    ...defaultFormData,
    ...initialData,
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ... handlers and JSX
}
```

## Field Change Handlers

```tsx
// Simple field
const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value, type } = e.target;
  const checked = (e.target as HTMLInputElement).checked;

  setFormData(prev => ({
    ...prev,
    [name]: type === 'checkbox' ? checked : value,
  }));
};

// Nested field (address)
const handleAddressChange = (
  addressType: 'homeAddress' | 'billingAddress',
  field: string,
  value: string
) => {
  setFormData(prev => ({
    ...prev,
    [addressType]: {
      ...prev[addressType],
      [field]: value,
    },
  }));
};

// Number field
const handleNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: value === '' ? '' : Number(value),
  }));
};
```

## Conditional Rendering

```tsx
// Country-dependent state field
{formData.homeAddress.country === 'USA' ? (
  <select
    name="state"
    value={formData.homeAddress.state}
    onChange={(e) => handleAddressChange('homeAddress', 'state', e.target.value)}
    data-testid="customer-home-state-select"
    className="field-sm"
  >
    <option value="">Select State</option>
    {usStates.map((state) => (
      <option key={state.value} value={state.value}>
        {state.label}
      </option>
    ))}
  </select>
) : formData.homeAddress.country ? (
  <input
    type="text"
    name="state"
    value={formData.homeAddress.state}
    onChange={(e) => handleAddressChange('homeAddress', 'state', e.target.value)}
    placeholder="State / Province"
    data-testid="customer-home-state-text"
    className="field-md"
  />
) : null}
```

## Disabled Fields Pattern

```tsx
<input
  type="text"
  value={formData.billingAddress.line1}
  onChange={(e) => handleAddressChange('billingAddress', 'line1', e.target.value)}
  disabled={formData.sameAsHomeAddress}
  data-testid="customer-billing-address-line1"
  className={`field-lg ${formData.sameAsHomeAddress ? 'opacity-50' : ''}`}
/>
```

## Address Sync Effect

```tsx
// Sync billing from home when checkbox is checked
useEffect(() => {
  if (formData.sameAsHomeAddress) {
    setFormData(prev => ({
      ...prev,
      billingAddress: { ...prev.homeAddress },
    }));
  }
}, [formData.sameAsHomeAddress, formData.homeAddress]);
```

## Validation Function

```tsx
const validateForm = (data: CustomerFormData): Record<string, string> => {
  const errors: Record<string, string> = {};

  // Required fields
  if (!data.firstName.trim()) {
    errors.firstName = 'First name is required';
  }
  if (!data.lastName.trim()) {
    errors.lastName = 'Last name is required';
  }

  // Custom rules
  if (typeof data.age === 'number' && data.age <= 18) {
    errors.age = 'Age must be greater than 18';
  }

  // Password minimum length
  if (mode === 'create' && data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  // Pattern validation
  if (data.phone && !/^\(\d{3}\) \d{3}-\d{4}$/.test(data.phone)) {
    errors.phone = 'Phone must match format (555) 123-4567';
  }

  // Email format
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Invalid email format';
  }

  // Conditional required (ZIP for USA)
  if (data.homeAddress.country === 'USA' && !data.homeAddress.zip) {
    errors['homeAddress.zip'] = 'ZIP is required for USA';
  }

  return errors;
};
```

## Form Submit Handler

```tsx
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();

  const validationErrors = validateForm(formData);
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  setIsSubmitting(true);
  setErrors({});

  try {
    await onSubmit(formData);
  } catch (error) {
    setErrors({ submit: 'Failed to save. Please try again.' });
  } finally {
    setIsSubmitting(false);
  }
};
```

## Field Width Classes

```css
/* Tailwind-based field sizing */
.field-xs { @apply w-16 max-w-[4rem]; }
.field-sm { @apply w-32 max-w-[8rem]; }
.field-md { @apply w-48 max-w-[12rem]; }
.field-lg { @apply w-64 max-w-[16rem]; }
.field-xl { @apply w-full; }
```

## Test Patterns

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CustomerForm } from './customer-form';

describe('CustomerForm', () => {
  const mockSubmit = jest.fn();

  beforeEach(() => {
    mockSubmit.mockClear();
  });

  it('renders all required fields', () => {
    render(<CustomerForm mode="create" onSubmit={mockSubmit} />);

    expect(screen.getByTestId('customer-first-name')).toBeInTheDocument();
    expect(screen.getByTestId('customer-last-name')).toBeInTheDocument();
    expect(screen.getByTestId('customer-age')).toBeInTheDocument();
    expect(screen.getByTestId('customer-password')).toBeInTheDocument();
  });

  it('shows state dropdown only for USA', () => {
    render(<CustomerForm mode="create" onSubmit={mockSubmit} />);

    // Initially no state field visible
    expect(screen.queryByTestId('customer-home-state-select')).not.toBeInTheDocument();

    // Select USA
    fireEvent.change(screen.getByTestId('customer-home-country'), {
      target: { value: 'USA' },
    });

    // State dropdown should appear
    expect(screen.getByTestId('customer-home-state-select')).toBeInTheDocument();
  });

  it('syncs billing address when same-as-home is checked', async () => {
    render(<CustomerForm mode="create" onSubmit={mockSubmit} />);

    // Fill home address
    fireEvent.change(screen.getByTestId('customer-home-address-line1'), {
      target: { value: '123 Main St' },
    });

    // Check same-as-home
    fireEvent.click(screen.getByTestId('customer-same-as-home-address'));

    // Billing should sync
    await waitFor(() => {
      expect(screen.getByTestId('customer-billing-address-line1')).toHaveValue('123 Main St');
    });
  });

  it('validates age > 18', async () => {
    render(<CustomerForm mode="create" onSubmit={mockSubmit} />);

    fireEvent.change(screen.getByTestId('customer-age'), {
      target: { value: '17' },
    });

    fireEvent.click(screen.getByTestId('customer-submit'));

    await waitFor(() => {
      expect(screen.getByText('Age must be greater than 18')).toBeInTheDocument();
    });
  });

  it('prefills data in edit mode', () => {
    const initialData = {
      firstName: 'John',
      lastName: 'Doe',
      age: 30,
    };

    render(
      <CustomerForm mode="edit" initialData={initialData} onSubmit={mockSubmit} />
    );

    expect(screen.getByTestId('customer-first-name')).toHaveValue('John');
    expect(screen.getByTestId('customer-last-name')).toHaveValue('Doe');
    expect(screen.getByTestId('customer-age')).toHaveValue(30);
  });
});
```

## Lookup Data Pattern

```tsx
// Static lookup data (can also be fetched from API)
const countries = [
  { label: 'USA', value: 'USA' },
  { label: 'Canada', value: 'Canada' },
  { label: 'Mexico', value: 'Mexico' },
];

const usStates = [
  { label: 'Alabama', value: 'AL' },
  { label: 'Alaska', value: 'AK' },
  // ... all states
];

// Usage in select
<select data-testid="customer-home-country">
  <option value="">Select Country</option>
  {countries.map((c) => (
    <option key={c.value} value={c.value}>{c.label}</option>
  ))}
</select>
```
