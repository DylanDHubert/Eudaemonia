import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // SECURITY: ALWAYS USE THE AUTHENTICATED USER'S ID - NEVER ALLOW QUERY PARAMETER OVERRIDE
  const userId = session.user.id;

  try {
    const supabase = await createClient();
    const { data: categories, error } = await supabase
      .from('custom_categories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching custom categories:', error);
      return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }

    return NextResponse.json({ categories: categories || [] });
  } catch (error) {
    console.error('Error fetching custom categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, type, min, max } = body;

    if (!name || !type) {
      return NextResponse.json({ error: 'Name and type are required' }, { status: 400 });
    }

    // VALIDATE TYPE
    const validTypes = ['numeric', 'scale', 'boolean'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: category, error } = await supabase
      .from('custom_categories')
      .insert({
        name,
        type,
        min: min ? parseFloat(min) : null,
        max: max ? parseFloat(max) : null,
        user_id: session.user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error);
      if (error.code === '23505') { // UNIQUE VIOLATION
        return NextResponse.json({ error: 'A category with this name already exists' }, { status: 400 });
      }
      return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Category created successfully', category });
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
} 