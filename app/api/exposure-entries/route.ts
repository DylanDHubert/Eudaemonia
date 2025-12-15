import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';

// POST: CREATE A NEW EXPOSURE ENTRY
export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    
    // VALIDATE REQUIRED FIELDS
    const requiredFields = ['type', 'title', 'sudsPre', 'sudsPeak', 'sudsPost'];
    
    for (const field of requiredFields) {
      if (body[field] === undefined) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // VALIDATE TYPE
    const validTypes = ['easy', 'medium', 'hard', 'flight'];
    if (!validTypes.includes(body.type)) {
      return NextResponse.json({ error: 'type must be one of: easy, medium, hard, flight' }, { status: 400 });
    }

    // VALIDATE SUDS VALUES (1-10)
    const sudsFields = ['sudsPre', 'sudsPeak', 'sudsPost'];
    for (const field of sudsFields) {
      const value = parseInt(body[field]);
      if (isNaN(value) || value < 1 || value > 10) {
        return NextResponse.json({ error: `${field} must be between 1 and 10` }, { status: 400 });
      }
    }
    
    const supabase = await createClient();
    
    // VALIDATE DURATION IF PROVIDED
    let duration = null;
    if (body.duration !== undefined && body.duration !== null && body.duration !== '') {
      const durationValue = parseInt(body.duration);
      if (isNaN(durationValue) || durationValue < 0) {
        return NextResponse.json({ error: 'duration must be a positive number' }, { status: 400 });
      }
      duration = durationValue;
    }
    
    // CREATE THE ENTRY
    const { data: entry, error: entryError } = await supabase
      .from('exposure_entries')
      .insert({
        type: body.type,
        title: body.title,
        notes: body.notes || null,
        suds_pre: parseInt(body.sudsPre),
        suds_peak: parseInt(body.sudsPeak),
        suds_post: parseInt(body.sudsPost),
        duration: duration,
        date: body.date ? new Date(body.date).toISOString() : new Date().toISOString(),
        user_id: session.user.id,
      })
      .select()
      .single();
    
    if (entryError || !entry) {
      console.error('Exposure entry creation error:', entryError);
      return NextResponse.json({ error: 'Error creating exposure entry' }, { status: 500 });
    }
    
    return NextResponse.json({ message: 'Exposure entry created successfully', entry });
  } catch (error) {
    console.error('Exposure entry creation error:', error);
    return NextResponse.json({ error: 'Error creating exposure entry' }, { status: 500 });
  }
}

// GET: FETCH EXPOSURE ENTRIES
export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const sortBy = searchParams.get('sortBy') || 'date';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    const supabase = await createClient();
    
    let query = supabase
      .from('exposure_entries')
      .select('*')
      .eq('user_id', session.user.id);
    
    // FILTER BY TYPE IF PROVIDED
    if (type && ['easy', 'medium', 'hard', 'flight'].includes(type)) {
      query = query.eq('type', type);
    }
    
    // SORT BY SPECIFIED FIELD
    if (sortBy === 'date') {
      query = query.order('date', { ascending: sortOrder === 'asc' });
    } else if (sortBy === 'sudsPre') {
      query = query.order('suds_pre', { ascending: sortOrder === 'asc' });
    } else if (sortBy === 'sudsPeak') {
      query = query.order('suds_peak', { ascending: sortOrder === 'asc' });
    } else if (sortBy === 'sudsPost') {
      query = query.order('suds_post', { ascending: sortOrder === 'asc' });
    } else if (sortBy === 'sudsAverage') {
      // FOR AVERAGE SUDS, WE'LL NEED TO SORT IN MEMORY AFTER FETCHING
      // SINCE POSTGRES DOESN'T HAVE A DIRECT WAY TO SORT BY CALCULATED FIELDS
      query = query.order('date', { ascending: false }); // DEFAULT SORT
    } else {
      // DEFAULT: SORT BY DATE DESC (NEWEST FIRST)
      query = query.order('date', { ascending: false });
    }
    
    const { data: entries, error } = await query;
    
    if (error) {
      console.error('Error fetching exposure entries:', error);
      return NextResponse.json({ error: 'Error fetching exposure entries' }, { status: 500 });
    }
    
    // IF SORTING BY AVERAGE SUDS, SORT IN MEMORY
    let sortedEntries = entries || [];
    if (sortBy === 'sudsAverage') {
      sortedEntries = [...(entries || [])].sort((a, b) => {
        const avgA = (a.suds_pre + a.suds_peak + a.suds_post) / 3;
        const avgB = (b.suds_pre + b.suds_peak + b.suds_post) / 3;
        return sortOrder === 'asc' ? avgA - avgB : avgB - avgA;
      });
    }
    
    return NextResponse.json({ entries: sortedEntries });
  } catch (error) {
    console.error('Error fetching exposure entries:', error);
    return NextResponse.json({ error: 'Error fetching exposure entries' }, { status: 500 });
  }
}

