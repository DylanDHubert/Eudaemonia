# Supabase Migration Guide

This document lists all files that need to be updated when migrating from NextAuth + Prisma to Supabase.

## ✅ Completed Setup Files

1. **Database Schema**: `supabase/migrations/001_initial_schema.sql`
   - All tables created with proper relationships
   - Indexes for performance
   - Triggers for updated_at timestamps
   - No RLS enabled (as requested)

2. **Supabase Client Utilities**:
   - `lib/supabase/client.ts` - Browser/client-side client
   - `lib/supabase/server.ts` - Server-side client
   - `lib/supabase/middleware.ts` - Middleware client
   - `lib/supabase/auth.ts` - Auth helper functions
   - `lib/supabase/db.ts` - Database helper
   - `lib/supabase/types.ts` - TypeScript types

## 📋 Files Requiring Updates

### Authentication Files

#### 1. `lib/auth.ts` ❌ DELETE/REPLACE
- **Current**: NextAuth configuration with Credentials + Google providers
- **Action**: Delete this file (replaced by `lib/supabase/auth.ts`)

#### 2. `app/api/auth/[...nextauth]/route.ts` ❌ DELETE
- **Current**: NextAuth API route handler
- **Action**: Delete this file (Supabase handles auth via their API)

#### 3. `app/providers.tsx` ⚠️ UPDATE
- **Current**: Uses `SessionProvider` from `next-auth/react`
- **Action**: Replace with Supabase auth context or remove if not needed

#### 4. `app/layout.tsx` ⚠️ UPDATE
- **Line 6**: `import { getServerSession } from 'next-auth'`
- **Line 7**: `import { authOptions } from '@/lib/auth'`
- **Line 28**: `const session = await getServerSession(authOptions)`
- **Action**: Replace with `getServerSession()` from `@/lib/supabase/auth`

### Client-Side Auth Files

#### 5. `app/login/page.tsx` ⚠️ UPDATE
- **Line 3**: `import { signIn } from 'next-auth/react'`
- **Line 54**: `await signIn('credentials', {...})`
- **Action**: Replace with Supabase `signInWithPassword()` or `signInWithOAuth()`

#### 6. `app/signup/page.tsx` ⚠️ UPDATE
- **Line 61**: Calls `/api/register` endpoint
- **Action**: Replace with Supabase `signUp()` and create profile in `profiles` table

#### 7. `app/components/Navigation.tsx` ⚠️ UPDATE
- **Line 5**: `import { signOut } from 'next-auth/react'`
- **Line 140**: `signOut({ callbackUrl: '/login' })`
- **Line 233**: `signOut({ callbackUrl: '/login' })`
- **Action**: Replace with Supabase `signOut()`

### Server Components (Pages)

#### 8. `app/page.tsx` ⚠️ UPDATE
- **Line 1**: `import { getServerSession } from 'next-auth'`
- **Line 2**: `import { authOptions } from '@/lib/auth'`
- **Line 11**: `const session = await getServerSession(authOptions)`
- **Action**: Replace with `getServerSession()` from `@/lib/supabase/auth`

#### 9. `app/entry/page.tsx` ⚠️ UPDATE
- **Line 1**: `import { getServerSession } from 'next-auth'`
- **Line 2**: `import { authOptions } from '@/lib/auth'`
- **Line 7**: `const session = await getServerSession(authOptions)`
- **Action**: Replace with `getServerSession()` from `@/lib/supabase/auth`

#### 10. `app/insights/page.tsx` ⚠️ UPDATE
- **Line 1**: `import { getServerSession } from 'next-auth'`
- **Line 3**: `import { authOptions } from '@/lib/auth'`
- **Line 4**: `import { db } from '@/lib/db'`
- **Line 10**: `const session = await getServerSession(authOptions)`
- **Line 17**: `await db.dailyEntry.findMany(...)`
- **Action**: 
  - Replace auth with Supabase
  - Replace Prisma queries with Supabase queries

#### 11. `app/history/page.tsx` ⚠️ UPDATE
- **Line 1**: `import { getServerSession } from 'next-auth'`
- **Line 2**: `import { authOptions } from '@/lib/auth'`
- **Line 3**: `import { db } from '@/lib/db'`
- **Action**: Replace auth and db calls

### API Routes (All need Prisma → Supabase conversion)

#### 12. `app/api/register/route.ts` ⚠️ UPDATE
- **Line 3**: `import bcrypt from 'bcryptjs'`
- **Line 3**: `import { db } from '@/lib/db'`
- **Line 18**: `await db.user.findUnique(...)`
- **Line 32**: `await bcrypt.hash(...)`
- **Line 35**: `await db.user.create(...)`
- **Action**: 
  - Use Supabase `auth.signUp()` instead
  - Create profile in `profiles` table after signup

#### 13. `app/api/entries/route.ts` ⚠️ UPDATE
- **Line 2**: `import { getServerSession } from 'next-auth'`
- **Line 3**: `import { authOptions } from '@/lib/auth'`
- **Line 4**: `import { db } from '@/lib/db'`
- **Line 9**: `const session = await getServerSession(authOptions)`
- **Line 46**: `await db.dailyEntry.create(...)`
- **Line 110**: `await db.dailyEntry.findMany(...)`
- **Action**: Replace all Prisma queries with Supabase

#### 14. `app/api/entries/[id]/route.ts` ⚠️ UPDATE
- **Line 2**: `import { getServerSession } from 'next-auth'`
- **Line 3**: `import { authOptions } from '@/lib/auth'`
- **Line 4**: `import { db } from '@/lib/db'`
- **Line 22**: `await db.dailyEntry.findFirst(...)`
- **Line 34**: `await db.dailyEntry.update(...)`
- **Action**: Replace all Prisma queries with Supabase

#### 15. `app/api/daily-entries/route.ts` ⚠️ UPDATE
- **Line 2**: `import { getServerSession } from 'next-auth'`
- **Line 3**: `import { authOptions } from '@/lib/auth'`
- **Line 4**: `import prisma from '@/lib/prisma'`
- **Line 37**: `await prisma.dailyEntry.create(...)`
- **Line 88**: `await prisma.dailyEntry.findMany(...)`
- **Action**: Replace all Prisma queries with Supabase

#### 16. `app/api/categories/route.ts` ⚠️ UPDATE
- **Line 2**: `import { getServerSession } from 'next-auth'`
- **Line 3**: `import { authOptions } from '@/lib/auth'`
- **Line 4**: `import prisma from '@/lib/prisma'`
- **Line 13**: `await prisma.customCategory.findMany(...)`
- **Line 56**: `await prisma.customCategory.create(...)`
- **Action**: Replace all Prisma queries with Supabase

#### 17. `app/api/categories/[id]/route.ts` ⚠️ UPDATE
- Check for Prisma usage and replace

#### 18. `app/api/custom-categories/route.ts` ⚠️ UPDATE
- **Line 2**: `import { getServerSession } from 'next-auth'`
- **Line 3**: `import { authOptions } from '@/lib/auth'`
- **Line 4**: `import { db } from '@/lib/db'`
- **Line 17**: `await db.customCategory.findMany(...)`
- **Action**: Replace all Prisma queries with Supabase

#### 19. `app/api/custom-categories/[id]/route.ts` ⚠️ UPDATE
- Check for Prisma usage and replace

#### 20. `app/api/gratitudes/route.ts` ⚠️ UPDATE
- **Line 2**: `import { getServerSession } from 'next-auth'`
- **Line 3**: `import { authOptions } from '@/lib/auth'`
- **Line 4**: `import { db } from '@/lib/db'`
- **Action**: Replace all Prisma queries with Supabase

#### 21. `app/api/gratitudes/[id]/route.ts` ⚠️ UPDATE
- Check for Prisma usage and replace

#### 22. `app/api/user/delete/route.ts` ⚠️ UPDATE
- Check for Prisma usage and replace
- Use Supabase `auth.admin.deleteUser()` or user deletion API

### Database Utility Files

#### 23. `lib/db.ts` ❌ DELETE
- **Current**: Prisma client singleton
- **Action**: Delete (replaced by `lib/supabase/db.ts`)

#### 24. `lib/prisma.ts` ❌ DELETE
- **Current**: Prisma client singleton
- **Action**: Delete (replaced by `lib/supabase/db.ts`)

### Client Components (May need updates)

#### 25. `app/gratitudes/GratitudeView.tsx` ⚠️ CHECK
- Check for any auth usage

#### 26. `app/gratitudes/GratitudeInput.tsx` ⚠️ CHECK
- Check for any auth usage

#### 27. `app/gratitudes/GratitudeList.tsx` ⚠️ CHECK
- Check for any auth usage

#### 28. `app/components/DeleteAccountModal.tsx` ⚠️ CHECK
- Check for auth and db usage

## 🔄 Migration Patterns

### Pattern 1: Server-Side Auth
**Before:**
```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const session = await getServerSession(authOptions);
if (!session?.user?.id) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

**After:**
```typescript
import { getServerSession } from '@/lib/supabase/auth';

const session = await getServerSession();
if (!session?.user?.id) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### Pattern 2: Client-Side Auth
**Before:**
```typescript
import { signIn, signOut } from 'next-auth/react';

await signIn('credentials', { email, password, redirect: false });
await signOut({ callbackUrl: '/login' });
```

**After:**
```typescript
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();
await supabase.auth.signInWithPassword({ email, password });
await supabase.auth.signOut();
```

### Pattern 3: Database Queries
**Before (Prisma):**
```typescript
import { db } from '@/lib/db';

const entries = await db.dailyEntry.findMany({
  where: { userId: session.user.id },
  include: { customCategoryEntries: { include: { customCategory: true } } },
  orderBy: { date: 'desc' }
});
```

**After (Supabase):**
```typescript
import { getDb } from '@/lib/supabase/db';

const supabase = await getDb();
const { data: entries } = await supabase
  .from('daily_entries')
  .select(`
    *,
    custom_category_entries (
      *,
      custom_categories (*)
    )
  `)
  .eq('user_id', session.user.id)
  .order('date', { ascending: false });
```

### Pattern 4: User Registration
**Before:**
```typescript
const hashedPassword = await bcrypt.hash(password, 12);
const user = await db.user.create({
  data: { email, name, password: hashedPassword }
});
```

**After:**
```typescript
const supabase = createClient();
const { data: authData, error: authError } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { name }
  }
});

// Create profile
if (authData.user) {
  await supabase.from('profiles').insert({
    id: authData.user.id,
    email: authData.user.email,
    name
  });
}
```

## 📦 Required Package Updates

### Remove:
- `next-auth`
- `@auth/prisma-adapter`
- `@prisma/client`
- `prisma`
- `bcrypt` / `bcryptjs`

### Add:
- `@supabase/ssr`
- `@supabase/supabase-js`

## 🔧 Environment Variables

Add to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Remove:
- `DATABASE_URL` (if using Supabase connection pooling, keep for direct connection)
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `GOOGLE_CLIENT_ID` (if using Supabase OAuth, configure in Supabase dashboard)
- `GOOGLE_CLIENT_SECRET`

## 🚀 Next Steps

1. Install Supabase packages: `npm install @supabase/ssr @supabase/supabase-js`
2. Run the migration SQL in your Supabase dashboard
3. Update environment variables
4. Start replacing files in order (auth first, then API routes)
5. Test each endpoint as you migrate
6. Remove old dependencies once migration is complete

