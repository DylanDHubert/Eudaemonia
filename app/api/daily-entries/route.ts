import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      date,
      sleepHours,
      sleepQuality,
      exercise,
      exerciseTime,
      alcohol,
      alcoholUnits,
      cannabis,
      cannabisAmount,
      meditation,
      meditationTime,
      socialTime,
      workHours,
      stressLevel,
      happinessRating,
      meals,
      foodQuality,
      notes,
      customCategoryEntries,
    } = body;

    const supabase = await createClient();

    // CREATE THE DAILY ENTRY
    const { data: entry, error: entryError } = await supabase
      .from('daily_entries')
      .insert({
        date: new Date(date).toISOString(),
        sleep_hours: parseFloat(sleepHours),
        sleep_quality: parseInt(sleepQuality),
        exercise,
        exercise_time: exerciseTime ? parseInt(exerciseTime) : null,
        alcohol,
        alcohol_units: alcoholUnits ? parseFloat(alcoholUnits) : null,
        cannabis,
        cannabis_amount: cannabisAmount ? parseInt(cannabisAmount) : null,
        meditation,
        meditation_time: meditationTime ? parseInt(meditationTime) : null,
        social_time: socialTime ? parseFloat(socialTime) : null,
        work_hours: workHours ? parseFloat(workHours) : null,
        stress_level: parseInt(stressLevel),
        happiness_rating: parseInt(happinessRating),
        meals: meals ? parseInt(meals) : null,
        food_quality: foodQuality ? parseInt(foodQuality) : null,
        notes,
        user_id: session.user.id,
      })
      .select()
      .single();

    if (entryError || !entry) {
      console.error('Error creating daily entry:', entryError);
      return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 });
    }

    // CREATE CUSTOM CATEGORY ENTRIES
    if (customCategoryEntries && customCategoryEntries.length > 0) {
      const customEntries = customCategoryEntries.map((catEntry: any) => ({
        daily_entry_id: entry.id,
        custom_category_id: catEntry.customCategoryId,
        value: catEntry.value
      }));

      const { error: customError } = await supabase
        .from('custom_category_entries')
        .insert(customEntries);

      if (customError) {
        console.error('Error creating custom category entries:', customError);
      }
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error('Error creating daily entry:', error);
    return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  try {
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

    if (startDate && endDate) {
      query = query.gte('date', new Date(startDate).toISOString())
                   .lte('date', new Date(endDate).toISOString());
    }

    const { data: entries, error } = await query.order('date', { ascending: false });

    if (error) {
      console.error('Error fetching daily entries:', error);
      return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
    }

    return NextResponse.json(entries || []);
  } catch (error) {
    console.error('Error fetching daily entries:', error);
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
  }
} 