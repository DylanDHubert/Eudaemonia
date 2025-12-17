import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';

// POST: CREATE A NEW DAILY ENTRY
export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    
    // VALIDATE REQUIRED FIELDS
    const requiredFields = ['sleepHours', 'sleepQuality', 'exercise', 'meditation', 'stressLevel', 'happinessRating'];
    
    for (const field of requiredFields) {
      if (body[field] === undefined) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // VALIDATE NUMERIC FIELDS
    const numericFields = {
      sleepHours: { min: 0, max: 24 },
      sleepQuality: { min: 1, max: 10 },
      stressLevel: { min: 1, max: 10 },
      happinessRating: { min: 1, max: 10 }
    };

    for (const [field, range] of Object.entries(numericFields)) {
      const value = parseFloat(body[field]);
      if (isNaN(value)) {
        return NextResponse.json({ error: `${field} must be a number` }, { status: 400 });
      }
      if (value < range.min || value > range.max) {
        return NextResponse.json({ error: `${field} must be between ${range.min} and ${range.max}` }, { status: 400 });
      }
    }
    
    const supabase = await createClient();
    
    // NORMALIZE DATE TO CALENDAR DAY AT MIDNIGHT UTC
    let normalizedDate: string;
    if (body.date) {
      const dateObj = new Date(body.date);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      normalizedDate = `${year}-${month}-${day}T00:00:00.000Z`;
    } else {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      normalizedDate = `${year}-${month}-${day}T00:00:00.000Z`;
    }
    
    // CREATE THE ENTRY
    const { data: entry, error: entryError } = await supabase
      .from('daily_entries')
      .insert({
        date: normalizedDate,
        sleep_hours: parseFloat(body.sleepHours),
        sleep_quality: parseInt(body.sleepQuality),
        exercise: Boolean(body.exercise),
        exercise_time: body.exerciseTime ? parseInt(body.exerciseTime) : null,
        alcohol_units: body.alcoholUnits !== undefined && body.alcoholUnits !== null && body.alcoholUnits !== '' ? parseFloat(body.alcoholUnits) : null,
        cannabis_amount: body.cannabisAmount !== undefined && body.cannabisAmount !== null && body.cannabisAmount !== '' ? parseFloat(body.cannabisAmount) : null,
        meditation: Boolean(body.meditation),
        meditation_time: body.meditationTime ? parseInt(body.meditationTime) : null,
        social_time: body.socialTime ? parseFloat(body.socialTime) : null,
        work_hours: body.workHours ? parseFloat(body.workHours) : null,
        stress_level: parseInt(body.stressLevel),
        happiness_rating: parseInt(body.happinessRating),
        meals: body.meals ? parseInt(body.meals) : null,
        food_quality: body.foodQuality ? parseInt(body.foodQuality) : null,
        notes: body.notes || null,
        user_id: session.user.id,
      })
      .select()
      .single();
    
    if (entryError || !entry) {
      console.error('Entry creation error:', entryError);
      return NextResponse.json({ error: 'Error creating entry' }, { status: 500 });
    }
    
    // CREATE CUSTOM CATEGORY ENTRIES
    if (body.customCategoryEntries && body.customCategoryEntries.length > 0) {
      const customEntries = body.customCategoryEntries.map((catEntry: any) => ({
        daily_entry_id: entry.id,
        custom_category_id: catEntry.customCategoryId,
        value: catEntry.value
      }));
      
      const { error: customError } = await supabase
        .from('custom_category_entries')
        .insert(customEntries);
      
      if (customError) {
        console.error('Custom category entries creation error:', customError);
      }
    }
    
    return NextResponse.json({ message: 'Entry created successfully', entry });
  } catch (error) {
    console.error('Entry creation error:', error);
    return NextResponse.json({ error: 'Error creating entry' }, { status: 500 });
  }
}

// GET: FETCH ENTRIES
export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam) : undefined;
    
    const supabase = await createClient();
    
    let query = supabase
      .from('daily_entries')
      .select(`
        *,
        custom_category_entries (
          *,
          custom_categories (*)
        )
      `)
      .eq('user_id', session.user.id);
    
    if (date) {
      const startDate = new Date(`${date}T00:00:00.000Z`).toISOString();
      const endDate = new Date(`${date}T23:59:59.999Z`).toISOString();
      query = query.gte('date', startDate).lte('date', endDate);
    }
    
    query = query.order('date', { ascending: false });
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data: entries, error } = await query;
    
    if (error) {
      console.error('Error fetching entries:', error);
      return NextResponse.json({ error: 'Error fetching entries' }, { status: 500 });
    }
    
    return NextResponse.json({ entries: entries || [] });
  } catch (error) {
    console.error('Error fetching entries:', error);
    return NextResponse.json({ error: 'Error fetching entries' }, { status: 500 });
  }
} 