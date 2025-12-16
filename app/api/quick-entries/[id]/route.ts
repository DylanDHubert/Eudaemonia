import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';

// PUT: UPDATE AN EXISTING QUICK ENTRY
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
      .from('quick_entries')
      .select('*')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();
    
    if (fetchError || !existingEntry) {
      return NextResponse.json({ error: 'Quick entry not found' }, { status: 404 });
    }
    
    // VALIDATE CATEGORY IF PROVIDED
    if (body.category !== undefined) {
      const validCategories = ['sleep', 'anxiety', 'contentment', 'energy'];
      if (!validCategories.includes(body.category)) {
        return NextResponse.json({ error: 'category must be one of: sleep, anxiety, contentment, energy' }, { status: 400 });
      }
    }
    
    // VALIDATE RATING IF PROVIDED
    if (body.rating !== undefined) {
      const rating = parseInt(body.rating);
      if (isNaN(rating) || rating < 1 || rating > 10) {
        return NextResponse.json({ error: 'rating must be between 1 and 10' }, { status: 400 });
      }
    }
    
    // BUILD UPDATE OBJECT
    const updateData: any = {};
    if (body.category !== undefined) updateData.category = body.category;
    if (body.rating !== undefined) updateData.rating = parseInt(body.rating);
    if (body.notes !== undefined) updateData.notes = body.notes || null;
    if (body.date !== undefined) updateData.date = new Date(body.date).toISOString();
    
    // UPDATE THE ENTRY
    const { data: updatedEntry, error: updateError } = await supabase
      .from('quick_entries')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', session.user.id) // SECURITY: ENSURE USER CAN ONLY UPDATE THEIR OWN ENTRIES
      .select()
      .single();
    
    if (updateError || !updatedEntry) {
      console.error('Quick entry update error:', updateError);
      return NextResponse.json({ error: 'Error updating quick entry' }, { status: 500 });
    }
    
    return NextResponse.json({ message: 'Quick entry updated successfully', entry: updatedEntry });
  } catch (error) {
    console.error('Quick entry update error:', error);
    return NextResponse.json({ error: 'Error updating quick entry' }, { status: 500 });
  }
}

// DELETE: REMOVE A QUICK ENTRY
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
      .from('quick_entries')
      .select('id')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();
    
    if (fetchError || !existingEntry) {
      return NextResponse.json({ error: 'Quick entry not found' }, { status: 404 });
    }
    
    // DELETE THE ENTRY
    const { error: deleteError } = await supabase
      .from('quick_entries')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      console.error('Quick entry deletion error:', deleteError);
      return NextResponse.json({ error: 'Error deleting quick entry' }, { status: 500 });
    }
    
    return NextResponse.json({ message: 'Quick entry deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Quick entry deletion error:', error);
    return NextResponse.json({ error: 'Error deleting quick entry' }, { status: 500 });
  }
}

