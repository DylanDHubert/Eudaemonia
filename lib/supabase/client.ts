// CLIENT-SIDE Supabase client
// Use this in client components and browser-side code
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing Supabase environment variables. Please check your .env file has:\n' +
      'NEXT_PUBLIC_SUPABASE_URL=...\n' +
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=...'
    );
  }

  return createBrowserClient(url, key);
}

