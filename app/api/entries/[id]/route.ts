import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';

// PUT: UPDATE AN EXISTING ENTRY
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = params;
    const body = await request.json();
    const supabase = await createClient();
    
    // VERIFY THE ENTRY EXISTS AND BELONGS TO THE USER
    const { data: existingEntry, error: fetchError } = await supabase
      .from('daily_entries')
      .select('*')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();
    
    if (fetchError || !existingEntry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }
    
    // UPDATE THE ENTRY
    const { data: updatedEntry, error: updateError } = await supabase
      .from('daily_entries')
      .update({
        date: body.date ? new Date(body.date).toISOString() : existingEntry.date,
        sleep_hours: parseFloat(body.sleepHours),
        sleep_quality: parseInt(body.sleepQuality),
        exercise: Boolean(body.exercise),
        exercise_time: body.exerciseTime ? parseInt(body.exerciseTime) : null,
        alcohol: Boolean(body.alcohol),
        alcohol_units: body.alcoholUnits ? parseFloat(body.alcoholUnits) : null,
        cannabis: Boolean(body.cannabis),
        cannabis_amount: body.cannabisAmount ? parseInt(body.cannabisAmount) : null,
        meditation: Boolean(body.meditation),
        meditation_time: body.meditationTime ? parseInt(body.meditationTime) : null,
        social_time: body.socialTime ? parseFloat(body.socialTime) : null,
        work_hours: body.workHours ? parseFloat(body.workHours) : null,
        stress_level: parseInt(body.stressLevel),
        happiness_rating: parseInt(body.happinessRating),
        meals: body.meals ? parseInt(body.meals) : null,
        food_quality: body.foodQuality ? parseInt(body.foodQuality) : null,
        notes: body.notes || null,
      })
      .eq('id', id)
      .select(`
        *,
        custom_category_entries (
          *,
          custom_categories (*)
        )
      `)
      .single();
    
    if (updateError || !updatedEntry) {
      console.error('Entry update error:', updateError);
      return NextResponse.json({ error: 'Error updating entry' }, { status: 500 });
    }
    
    // DELETE EXISTING CUSTOM CATEGORY ENTRIES AND CREATE NEW ONES
    if (body.customCategoryEntries) {
      await supabase
        .from('custom_category_entries')
        .delete()
        .eq('daily_entry_id', id);
      
      if (body.customCategoryEntries.length > 0) {
        const customEntries = body.customCategoryEntries.map((entry: any) => ({
          daily_entry_id: id,
          custom_category_id: entry.customCategoryId,
          value: entry.value
        }));
        
        await supabase
          .from('custom_category_entries')
          .insert(customEntries);
      }
    }
    
    // FETCH UPDATED ENTRY WITH CUSTOM CATEGORIES
    const { data: finalEntry } = await supabase
      .from('daily_entries')
      .select(`
        *,
        custom_category_entries (
          *,
          custom_categories (*)
        )
      `)
      .eq('id', id)
      .single();
    
    return NextResponse.json({ message: 'Entry updated successfully', entry: finalEntry });
  } catch (error) {
    console.error('Entry update error:', error);
    return NextResponse.json({ error: 'Error updating entry' }, { status: 500 });
  }
}

// DELETE: REMOVE AN ENTRY
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = params;
    const supabase = await createClient();
    
    // CHECK IF THE ENTRY EXISTS AND BELONGS TO THE USER
    const { data: existingEntry, error: fetchError } = await supabase
      .from('daily_entries')
      .select('id')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();
    
    if (fetchError || !existingEntry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }
    
    // DELETE THE ENTRY (CASCADE WILL DELETE CUSTOM CATEGORY ENTRIES)
    const { error: deleteError } = await supabase
      .from('daily_entries')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      console.error('Entry deletion error:', deleteError);
      return NextResponse.json({ error: 'Error deleting entry' }, { status: 500 });
    }
    
    return NextResponse.json({ message: 'Entry deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Entry deletion error:', error);
    return NextResponse.json({ error: 'Error deleting entry' }, { status: 500 });
  }
} 