# Supabase Database Guide

This project uses **Supabase** with **Server-Side Rendering (SSR)** for Next.js App Router.

---

## 📁 Supabase Client Files

```
src/lib/supabase/
├── server.ts      # For Server Components, API Routes, Server Actions
├── client.ts      # For Client Components
└── middleware.ts  # For session management (auto-integrated)
```

---

## 🚀 Quick Start

### Server Component (Default - Best Performance)

```typescript
// app/users/page.tsx
import { createClient } from '@/lib/supabase/server';

export default async function UsersPage() {
  const supabase = await createClient();
  const { data: users } = await supabase.from('user').select('*');
  
  return (
    <ul>
      {users?.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### Client Component (For Interactivity)

```typescript
// app/users/user-form.tsx
'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';

export function UserForm() {
  const [name, setName] = useState('');
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await supabase.from('user').insert([{ name, email: `${name}@example.com` }]);
    setName('');
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <button>Add User</button>
    </form>
  );
}
```

### Server Action (Recommended for Mutations)

```typescript
// app/users/actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createUser(name: string, email: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('user')
    .insert([{ name, email }])
    .select();

  if (error) throw error;
  
  revalidatePath('/users');
  return data;
}
```

---

## 📊 Available Tables

- `user` - User information
- `subscription` - Subscription data
- `menu` - Menu/meal plans
- `recipe` - Recipe details
- `project` - User projects
- `account`, `session` - Auth tables

---

## 🔐 Environment Variables

Required in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Get these from: **Supabase Dashboard → Project Settings → API**

---

## 🧪 Testing

Test your Supabase connection:

```bash
node scripts/test-supabase-client.js
```

Test table access:

```bash
node scripts/test-tables.js
```

---

## 📚 Common Operations

### Query with Relations

```typescript
const { data } = await supabase
  .from('menu')
  .select(`
    *,
    user:userId(name, email),
    recipe(*)
  `);
```

### Insert Data

```typescript
const { data, error } = await supabase
  .from('user')
  .insert([{ name: 'John', email: 'john@example.com' }])
  .select();
```

### Update Data

```typescript
const { data, error } = await supabase
  .from('user')
  .update({ name: 'Jane' })
  .eq('id', userId)
  .select();
```

### Delete Data

```typescript
const { error } = await supabase
  .from('user')
  .delete()
  .eq('id', userId);
```

### Real-time Subscriptions (Client Only)

```typescript
'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect } from 'react';

export function RealtimeComponent() {
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel('table-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'user' },
        (payload) => console.log('Change:', payload)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return <div>Listening for changes...</div>;
}
```

---

## 🎯 Best Practices

1. **✅ Use Server Components by default** - Better performance
2. **✅ Use Server Actions for mutations** - More secure
3. **✅ Use Client Components only when needed** - For interactivity
4. **✅ Enable Row Level Security (RLS)** - In Supabase Dashboard
5. **✅ Validate data with Zod** - Before inserting

---

## 📖 Documentation

- [Supabase SSR Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Supabase JS Reference](https://supabase.com/docs/reference/javascript/introduction)
- [Next.js App Router](https://nextjs.org/docs/app)

---

## 🔧 Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

Your app runs at `http://localhost:3000` 🚀
