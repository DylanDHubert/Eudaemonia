// AUTH UTILITIES for Supabase
// Helper functions for authentication

import { createClient } from './server';
import { createClient as createBrowserClient } from './client';

// SERVER-SIDE: Get current user session
export async function getServerSession() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return {
    user: {
      id: user.id,
      email: user.email,
      name: profile?.name || user.user_metadata?.name || null,
      image: profile?.image || user.user_metadata?.avatar_url || null,
    },
  };
}

// SERVER-SIDE: Get user ID (throws if not authenticated)
export async function getUserId() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  return session.user.id;
}

// CLIENT-SIDE: Get current user session
export async function getClientSession() {
  const supabase = createBrowserClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return {
    user: {
      id: user.id,
      email: user.email,
      name: profile?.name || user.user_metadata?.name || null,
      image: profile?.image || user.user_metadata?.avatar_url || null,
    },
  };
}

