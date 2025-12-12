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
    
    // VALIDATE REQUIRED FIELDS IF PROVIDED
    if (body.sleepHours !== undefined && (isNaN(parseFloat(body.sleepHours)) || parseFloat(body.sleepHours) < 0 || parseFloat(body.sleepHours) > 24)) {
      return NextResponse.json({ error: 'sleepHours must be between 0 and 24' }, { status: 400 });
    }
    if (body.sleepQuality !== undefined && (isNaN(parseInt(body.sleepQuality)) || parseInt(body.sleepQuality) < 1 || parseInt(body.sleepQuality) > 10)) {
      return NextResponse.json({ error: 'sleepQuality must be between 1 and 10' }, { status: 400 });
    }
    if (body.stressLevel !== undefined && (isNaN(parseInt(body.stressLevel)) || parseInt(body.stressLevel) < 1 || parseInt(body.stressLevel) > 10)) {
      return NextResponse.json({ error: 'stressLevel must be between 1 and 10' }, { status: 400 });
    }
    if (body.happinessRating !== undefined && (isNaN(parseInt(body.happinessRating)) || parseInt(body.happinessRating) < 1 || parseInt(body.happinessRating) > 10)) {
      return NextResponse.json({ error: 'happinessRating must be between 1 and 10' }, { status: 400 });
    }
    
    // UPDATE THE ENTRY
    const { data: updatedEntry, error: updateError } = await supabase
      .from('daily_entries')
      .update({
        date: body.date ? new Date(body.date).toISOString() : existingEntry.date,
        sleep_hours: body.sleepHours !== undefined ? parseFloat(body.sleepHours) : existingEntry.sleep_hours,
        sleep_quality: body.sleepQuality !== undefined ? parseInt(body.sleepQuality) : existingEntry.sleep_quality,
        exercise: body.exercise !== undefined ? Boolean(body.exercise) : existingEntry.exercise,
        exercise_time: body.exerciseTime !== undefined ? (body.exerciseTime ? parseInt(body.exerciseTime) : null) : existingEntry.exercise_time,
        alcohol: body.alcohol !== undefined ? Boolean(body.alcohol) : existingEntry.alcohol,
        alcohol_units: body.alcoholUnits !== undefined ? (body.alcoholUnits ? parseFloat(body.alcoholUnits) : null) : existingEntry.alcohol_units,
        cannabis: body.cannabis !== undefined ? Boolean(body.cannabis) : existingEntry.cannabis,
        cannabis_amount: body.cannabisAmount !== undefined ? (body.cannabisAmount ? parseInt(body.cannabisAmount) : null) : existingEntry.cannabis_amount,
        meditation: body.meditation !== undefined ? Boolean(body.meditation) : existingEntry.meditation,
        meditation_time: body.meditationTime !== undefined ? (body.meditationTime ? parseInt(body.meditationTime) : null) : existingEntry.meditation_time,
        social_time: body.socialTime !== undefined ? (body.socialTime ? parseFloat(body.socialTime) : null) : existingEntry.social_time,
        work_hours: body.workHours !== undefined ? (body.workHours ? parseFloat(body.workHours) : null) : existingEntry.work_hours,
        stress_level: body.stressLevel !== undefined ? parseInt(body.stressLevel) : existingEntry.stress_level,
        happiness_rating: body.happinessRating !== undefined ? parseInt(body.happinessRating) : existingEntry.happiness_rating,
        meals: body.meals !== undefined ? (body.meals ? parseInt(body.meals) : null) : existingEntry.meals,
        food_quality: body.foodQuality !== undefined ? (body.foodQuality ? parseInt(body.foodQuality) : null) : existingEntry.food_quality,
        notes: body.notes !== undefined ? (body.notes || null) : existingEntry.notes,
      })
      .eq('id', id)
      .eq('user_id', session.user.id) // SECURITY: ENSURE USER CAN ONLY UPDATE THEIR OWN ENTRIES
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