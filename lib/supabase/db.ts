// DATABASE UTILITIES for Supabase
// Helper functions for database operations

import { createClient } from './server';
import type { Database } from './types';

// Type-safe database client
export async function getDb() {
  return await createClient();
}

// Helper to get typed Supabase client
export type SupabaseClient = Awaited<ReturnType<typeof getDb>>;

