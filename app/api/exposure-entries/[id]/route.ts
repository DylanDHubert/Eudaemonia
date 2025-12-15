import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';

// PUT: UPDATE AN EXISTING EXPOSURE ENTRY
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
      .from('exposure_entries')
      .select('*')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();
    
    if (fetchError || !existingEntry) {
      return NextResponse.json({ error: 'Exposure entry not found' }, { status: 404 });
    }
    
    // VALIDATE TYPE IF PROVIDED
    if (body.type !== undefined) {
      const validTypes = ['easy', 'medium', 'hard', 'flight'];
      if (!validTypes.includes(body.type)) {
        return NextResponse.json({ error: 'type must be one of: easy, medium, hard, flight' }, { status: 400 });
      }
    }
    
    // VALIDATE SUDS VALUES IF PROVIDED
    const sudsFields = ['sudsPre', 'sudsPeak', 'sudsPost'];
    for (const field of sudsFields) {
      if (body[field] !== undefined) {
        const value = parseInt(body[field]);
        if (isNaN(value) || value < 1 || value > 10) {
          return NextResponse.json({ error: `${field} must be between 1 and 10` }, { status: 400 });
        }
      }
    }
    
    // VALIDATE DURATION IF PROVIDED
    if (body.duration !== undefined) {
      if (body.duration !== null && body.duration !== '') {
        const durationValue = parseInt(body.duration);
        if (isNaN(durationValue) || durationValue < 0) {
          return NextResponse.json({ error: 'duration must be a positive number' }, { status: 400 });
        }
      }
    }
    
    // BUILD UPDATE OBJECT
    const updateData: any = {};
    if (body.type !== undefined) updateData.type = body.type;
    if (body.title !== undefined) updateData.title = body.title;
    if (body.notes !== undefined) updateData.notes = body.notes || null;
    if (body.sudsPre !== undefined) updateData.suds_pre = parseInt(body.sudsPre);
    if (body.sudsPeak !== undefined) updateData.suds_peak = parseInt(body.sudsPeak);
    if (body.sudsPost !== undefined) updateData.suds_post = parseInt(body.sudsPost);
    if (body.date !== undefined) updateData.date = new Date(body.date).toISOString();
    if (body.duration !== undefined) {
      updateData.duration = body.duration === null || body.duration === '' ? null : parseInt(body.duration);
    }
    
    // UPDATE THE ENTRY
    const { data: updatedEntry, error: updateError } = await supabase
      .from('exposure_entries')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', session.user.id) // SECURITY: ENSURE USER CAN ONLY UPDATE THEIR OWN ENTRIES
      .select()
      .single();
    
    if (updateError || !updatedEntry) {
      console.error('Exposure entry update error:', updateError);
      return NextResponse.json({ error: 'Error updating exposure entry' }, { status: 500 });
    }
    
    return NextResponse.json({ message: 'Exposure entry updated successfully', entry: updatedEntry });
  } catch (error) {
    console.error('Exposure entry update error:', error);
    return NextResponse.json({ error: 'Error updating exposure entry' }, { status: 500 });
  }
}

// DELETE: REMOVE AN EXPOSURE ENTRY
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
      .from('exposure_entries')
      .select('id')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();
    
    if (fetchError || !existingEntry) {
      return NextResponse.json({ error: 'Exposure entry not found' }, { status: 404 });
    }
    
    // DELETE THE ENTRY
    const { error: deleteError } = await supabase
      .from('exposure_entries')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      console.error('Exposure entry deletion error:', deleteError);
      return NextResponse.json({ error: 'Error deleting exposure entry' }, { status: 500 });
    }
    
    return NextResponse.json({ message: 'Exposure entry deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Exposure entry deletion error:', error);
    return NextResponse.json({ error: 'Error deleting exposure entry' }, { status: 500 });
  }
}

