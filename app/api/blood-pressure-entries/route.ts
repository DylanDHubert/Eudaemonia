import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';

// VALIDATE ONE READING (systolic, diastolic, bpm)
function validateReading(s: number, d: number, b: number, idx: number): string | null {
  if (isNaN(s) || s < 50 || s > 250) return `Reading ${idx}: systolic must be 50–250`;
  if (isNaN(d) || d < 30 || d > 180) return `Reading ${idx}: diastolic must be 30–180`;
  if (isNaN(b) || b < 30 || b > 250) return `Reading ${idx}: bpm must be 30–250`;
  return null;
}

// POST: CREATE A NEW BLOOD PRESSURE ENTRY (ONE PER DAY)
export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const dateStr = body.date; // ISO DATE STRING (YYYY-MM-DD) OR FULL ISO
    if (!dateStr) {
      return NextResponse.json({ error: 'Missing required field: date' }, { status: 400 });
    }
    const dateOnly = new Date(dateStr).toISOString().split('T')[0];

    // VALIDATE ALL 5 READINGS
    for (let i = 1; i <= 5; i++) {
      const s = parseInt(body[`systolic_${i}`]);
      const d = parseInt(body[`diastolic_${i}`]);
      const b = parseInt(body[`bpm_${i}`]);
      const err = validateReading(s, d, b, i);
      if (err) return NextResponse.json({ error: err }, { status: 400 });
    }

    const supabase = await createClient();
    const row = {
      user_id: session.user.id,
      date: dateOnly,
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

    const { data: entry, error } = await supabase
      .from('blood_pressure_entries')
      .insert(row)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'You already have an entry for this date. Edit it instead.' }, { status: 409 });
      }
      console.error('Blood pressure entry creation error:', error);
      return NextResponse.json({ error: 'Error creating entry' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Entry created successfully', entry });
  } catch (error) {
    console.error('Blood pressure entry creation error:', error);
    return NextResponse.json({ error: 'Error creating entry' }, { status: 500 });
  }
}

// GET: LIST BLOOD PRESSURE ENTRIES FOR THE USER (MOST RECENT FIRST)
export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const { data: entries, error } = await supabase
      .from('blood_pressure_entries')
      .select('*')
      .eq('user_id', session.user.id)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching blood pressure entries:', error);
      return NextResponse.json({ error: 'Error fetching entries' }, { status: 500 });
    }

    return NextResponse.json({ entries: entries || [] });
  } catch (error) {
    console.error('Error fetching blood pressure entries:', error);
    return NextResponse.json({ error: 'Error fetching entries' }, { status: 500 });
  }
}
