import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';

function validateReading(s: number, d: number, b: number, idx: number): string | null {
  if (isNaN(s) || s < 50 || s > 250) return `Reading ${idx}: systolic must be 50–250`;
  if (isNaN(d) || d < 30 || d > 180) return `Reading ${idx}: diastolic must be 30–180`;
  if (isNaN(b) || b < 30 || b > 250) return `Reading ${idx}: bpm must be 30–250`;
  return null;
}

// PUT: UPDATE BLOOD PRESSURE ENTRY
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const supabase = await createClient();

    const { data: existing, error: fetchError } = await supabase
      .from('blood_pressure_entries')
      .select('*')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    for (let i = 1; i <= 5; i++) {
      const s = parseInt(body[`systolic_${i}`]);
      const d = parseInt(body[`diastolic_${i}`]);
      const b = parseInt(body[`bpm_${i}`]);
      const err = validateReading(s, d, b, i);
      if (err) return NextResponse.json({ error: err }, { status: 400 });
    }

    const updateData = {
      systolic_1: parseInt(body.systolic_1),
      diastolic_1: parseInt(body.diastolic_1),
      bpm_1: parseInt(body.bpm_1),
      systolic_2: parseInt(body.systolic_2),
      diastolic_2: parseInt(body.diastolic_2),
      bpm_2: parseInt(body.bpm_2),
      systolic_3: parseInt(body.systolic_3),
      diastolic_3: parseInt(body.diastolic_3),
      bpm_3: parseInt(body.bpm_3),
      systolic_4: parseInt(body.systolic_4),
      diastolic_4: parseInt(body.diastolic_4),
      bpm_4: parseInt(body.bpm_4),
      systolic_5: parseInt(body.systolic_5),
      diastolic_5: parseInt(body.diastolic_5),
      bpm_5: parseInt(body.bpm_5),
    };

    const { data: updated, error: updateError } = await supabase
      .from('blood_pressure_entries')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select()
      .single();

    if (updateError || !updated) {
      console.error('Blood pressure update error:', updateError);
      return NextResponse.json({ error: 'Error updating entry' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Entry updated successfully', entry: updated });
  } catch (error) {
    console.error('Blood pressure update error:', error);
    return NextResponse.json({ error: 'Error updating entry' }, { status: 500 });
  }
}

// DELETE: REMOVE BLOOD PRESSURE ENTRY
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = await createClient();

    const { error } = await supabase
      .from('blood_pressure_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Blood pressure delete error:', error);
      return NextResponse.json({ error: 'Error deleting entry' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Entry deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Blood pressure delete error:', error);
    return NextResponse.json({ error: 'Error deleting entry' }, { status: 500 });
  }
}
