# Supabase SSR Usage Guide (App Router)

## ✅ Project Structure

Your project now uses **Supabase SSR** (Server-Side Rendering) with proper separation:

```
src/lib/supabase/
├── server.ts      # For Server Components & API Routes
├── client.ts      # For Client Components
└── middleware.ts  # For Middleware (session management)
```

---

## 📁 File Overview

### 1. **`src/lib/supabase/server.ts`** - Server Components
Use this in:
- Server Components
- Server Actions
- API Route Handlers

```typescript
import { createClient } from '@/lib/supabase/server';

export default async function Page() {
  const supabase = await createClient();
  const { data: users } = await supabase.from('users').select('*');
  
  return <div>{/* render users */}</div>;
}
```

### 2. **`src/lib/supabase/client.ts`** - Client Components
Use this in:
- Client Components (with `'use client'`)
- Event handlers
- Real-time subscriptions

```typescript
'use client';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export default function ClientPage() {
  const [users, setUsers] = useState([]);
  const supabase = createClient();

  useEffect(() => {
    supabase.from('users').select('*').then(({ data }) => {
      if (data) setUsers(data);
    });
  }, []);

  return <div>{/* render users */}</div>;
}
```

### 3. **`src/lib/supabase/middleware.ts`** - Middleware
Already integrated in `src/middleware.ts` to refresh auth sessions.

---

## 🎯 Usage Examples

### Server Component (Default in App Router)

```typescript
// app/users/page.tsx
import { createClient } from '@/lib/supabase/server';

export default async function UsersPage() {
  const supabase = await createClient();
  
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users?.map((user) => (
          <li key={user.id}>{user.full_name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Client Component

```typescript
// app/users/user-form.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function UserForm() {
  const [name, setName] = useState('');
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const { data, error } = await supabase
      .from('users')
      .insert([{ full_name: name }])
      .select();

    if (error) {
      console.error('Error:', error);
    } else {
      console.log('User created:', data);
      setName('');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter name"
      />
      <button type="submit">Add User</button>
    </form>
  );
}
```

### Server Action

```typescript
// app/users/actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createUser(formData: FormData) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('users')
    .insert([
      { full_name: formData.get('name') as string }
    ])
    .select();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/users');
  return { data };
}
```

```typescript
// app/users/page.tsx
import { createUser } from './actions';

export default function UsersPage() {
  return (
    <form action={createUser}>
      <input name="name" placeholder="Enter name" required />
      <button type="submit">Add User</button>
    </form>
  );
}
```

### API Route

```typescript
// app/api/users/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  
  const { data, error } = await supabase.from('users').select('*');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();
  
  const { data, error } = await supabase
    .from('users')
    .insert([body])
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
```

### Real-time Subscriptions (Client Component)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function RealtimeUsers() {
  const [users, setUsers] = useState([]);
  const supabase = createClient();

  useEffect(() => {
    // Initial fetch
    supabase.from('users').select('*').then(({ data }) => {
      if (data) setUsers(data);
    });

    // Subscribe to changes
    const channel = supabase
      .channel('users-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        (payload) => {
          console.log('Change received!', payload);
          // Update local state based on payload
          if (payload.eventType === 'INSERT') {
            setUsers((prev) => [...prev, payload.new]);
          }
          // Handle UPDATE and DELETE similarly
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.full_name}</li>
      ))}
    </ul>
  );
}
```

---

## 🔐 Authentication

### Sign Up

```typescript
'use server';

import { createClient } from '@/lib/supabase/server';

export async function signUp(email: string, password: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  return { data, error };
}
```

### Sign In

```typescript
'use server';

import { createClient } from '@/lib/supabase/server';

export async function signIn(email: string, password: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
}
```

### Get Current User (Server Component)

```typescript
import { createClient } from '@/lib/supabase/server';

export default async function Profile() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div>Not logged in</div>;
  }

  return <div>Welcome, {user.email}</div>;
}
```

### Get Current User (Client Component)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function Profile() {
  const [user, setUser] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  if (!user) return <div>Not logged in</div>;
  
  return <div>Welcome, {user.email}</div>;
}
```

---

## 🗄️ Database Migrations

For database schema changes, use Drizzle ORM:

```bash
# Generate migration
npm run db:generate

# Apply migration
npm run db:migrate

# Open Drizzle Studio
npm run db:studio
```

**Note:** Drizzle (`src/db/drizzle.ts`) is now only for migrations. Use Supabase client for all queries!

---

## 📊 Comparison Table

| Task | Use | Import From |
|------|-----|-------------|
| Server Component query | ✅ `createClient()` | `@/lib/supabase/server` |
| Client Component query | ✅ `createClient()` | `@/lib/supabase/client` |
| Server Action | ✅ `createClient()` | `@/lib/supabase/server` |
| API Route | ✅ `createClient()` | `@/lib/supabase/server` |
| Real-time subscription | ✅ `createClient()` | `@/lib/supabase/client` |

---

## ⚡ Performance Tips

### 1. **Prefer Server Components**
```typescript
// ✅ Good - Fetches data on server
export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase.from('users').select('*');
  return <div>{/* render */}</div>;
}

// ❌ Avoid - Fetches data on client
'use client';
export default function Page() {
  const [data, setData] = useState([]);
  useEffect(() => {
    createClient().from('users').select('*').then(/* ... */);
  }, []);
  return <div>{/* render */}</div>;
}
```

### 2. **Use Server Actions for Mutations**
```typescript
// ✅ Good - Server action
'use server';
export async function createUser(name: string) {
  const supabase = await createClient();
  return await supabase.from('users').insert([{ full_name: name }]);
}
```

### 3. **Enable Row Level Security (RLS)**
Always enable RLS on your Supabase tables for security.

---

## 🚫 What Was Removed

- ❌ Old single Supabase client
- ❌ Proxy configuration
- ❌ Drizzle ORM direct queries
- ❌ Database migrations via Drizzle
- ❌ Complex connection pooling

---

## ✅ Benefits

1. **Proper SSR Support** - Works with Next.js App Router
2. **Session Management** - Automatic session refresh via middleware
3. **Type Safety** - Full TypeScript support
4. **No Proxy Needed** - Works directly from browser
5. **Clean Separation** - Server vs Client components
6. **Better Performance** - Server components by default

---

## 🧪 Testing

Test Supabase client:
```bash
node scripts/test-supabase-client.js
```

Test table access:
```bash
node scripts/test-tables.js
```

---

## 📚 Documentation

- [Supabase SSR Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)

---

**Your project is now clean and follows Supabase best practices! 🎉**
