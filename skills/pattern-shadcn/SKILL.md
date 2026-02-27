---
name: pattern-shadcn
description: shadcn/ui component patterns with Tailwind CSS. Activate when building UI components, forms, dialogs, tables, or styling with Tailwind.
---

# shadcn/ui + Tailwind CSS Patterns

## Installing Components

```bash
npx shadcn@latest add button input form dialog table toast badge card
```

## The cn() Helper

Always use `cn()` for conditional classes:

```typescript
import { cn } from '@/lib/utils';

<div className={cn(
  "base-classes",
  isActive && "active-class",
  variant === 'destructive' && "text-red-500",
  className, // allow override from parent
)} />
```

## Form with react-hook-form + Zod

```typescript
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const formSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

type FormData = z.infer<typeof formSchema>;

export function UserForm({ onSubmit }: { onSubmit: (data: FormData) => Promise<void> }) {
  const form = useForm<FormData>({ resolver: zodResolver(formSchema) });
  const [isPending, startTransition] = useTransition();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => startTransition(() => onSubmit(data)))}>
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl><Input type="email" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : 'Save'}
        </Button>
      </form>
    </Form>
  );
}
```

## Data Table Pattern

```typescript
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export function UsersTable({ users }: { users: User[] }) {
  if (users.length === 0) return <EmptyState />;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                {user.role}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

## Toast Notifications

```typescript
'use client';
import { useToast } from '@/hooks/use-toast';

export function DeleteUserButton({ userId }: { userId: string }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteUser(userId);
      if (result.success) {
        toast({ title: 'User deleted', description: 'User has been removed.' });
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      }
    });
  };

  return (
    <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
      {isPending ? 'Deleting...' : 'Delete'}
    </Button>
  );
}
```

## Tailwind Conventions

- Use `text-muted-foreground` for secondary text
- Use `bg-background` and `bg-card` from CSS variables (not hard-coded colors)
- Responsive: `sm:`, `md:`, `lg:` prefixes
- Dark mode works automatically via CSS variables
- Never use `!important` or inline styles
