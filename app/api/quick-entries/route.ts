import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';

// POST: CREATE A NEW QUICK ENTRY
export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    
    // VALIDATE REQUIRED FIELDS
    const requiredFields = ['category', 'rating'];
    
    for (const field of requiredFields) {
      if (body[field] === undefined) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // VALIDATE CATEGORY
    const validCategories = ['sleep', 'mood', 'pride', 'energy'];
    if (!validCategories.includes(body.category)) {
      return NextResponse.json({ error: 'category must be one of: sleep, mood, pride, energy' }, { status: 400 });
    }

    // VALIDATE RATING (1-10)
    const rating = parseInt(body.rating);
    if (isNaN(rating) || rating < 1 || rating > 10) {
      return NextResponse.json({ error: 'rating must be between 1 and 10' }, { status: 400 });
    }
    
    const supabase = await createClient();
    
    // CREATE THE ENTRY
    const { data: entry, error: entryError } = await supabase
      .from('quick_entries')
      .insert({
        category: body.category,
        rating: rating,
        notes: body.notes || null,
        date: body.date ? new Date(body.date).toISOString() : new Date().toISOString(),
        user_id: session.user.id,
      })
      .select()
      .single();
    
    if (entryError || !entry) {
      console.error('Quick entry creation error:', entryError);
      return NextResponse.json({ error: 'Error creating quick entry' }, { status: 500 });
    }
    
    return NextResponse.json({ message: 'Quick entry created successfully', entry });
  } catch (error) {
    console.error('Quick entry creation error:', error);
    return NextResponse.json({ error: 'Error creating quick entry' }, { status: 500 });
  }
}

// GET: FETCH QUICK ENTRIES
export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const sortBy = searchParams.get('sortBy') || 'date';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    const supabase = await createClient();
    
    let query = supabase
      .from('quick_entries')
      .select('*')
      .eq('user_id', session.user.id);
    
    // FILTER BY CATEGORY IF PROVIDED
    if (category && ['sleep', 'mood', 'pride', 'energy'].includes(category)) {
      query = query.eq('category', category);
    }
    
    // SORT BY SPECIFIED FIELD
    if (sortBy === 'date') {
      query = query.order('date', { ascending: sortOrder === 'asc' });
    } else if (sortBy === 'rating') {
      query = query.order('rating', { ascending: sortOrder === 'asc' });
    } else {
      // DEFAULT: SORT BY DATE DESC (NEWEST FIRST)
      query = query.order('date', { ascending: false });
    }
    
    const { data: entries, error } = await query;
    
    if (error) {
      console.error('Error fetching quick entries:', error);
      return NextResponse.json({ error: 'Error fetching quick entries' }, { status: 500 });
    }
    
    return NextResponse.json({ entries: entries || [] });
  } catch (error) {
    console.error('Error fetching quick entries:', error);
    return NextResponse.json({ error: 'Error fetching quick entries' }, { status: 500 });
  }
}



