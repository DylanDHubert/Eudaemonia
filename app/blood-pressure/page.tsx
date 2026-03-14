import { getServerSession } from '@/lib/supabase/auth';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import BloodPressureList from './BloodPressureList';

export default async function BloodPressurePage() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const supabase = await createClient();
  const { data: entries, error } = await supabase
    .from('blood_pressure_entries')
    .select('*')
    .eq('user_id', session.user.id)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching blood pressure entries:', error);
  }

  const formattedEntries = (entries || []).map((row: any) => ({
    id: row.id,
    date: row.date,
    systolic_1: row.systolic_1,
    diastolic_1: row.diastolic_1,
    bpm_1: row.bpm_1,
    systolic_2: row.systolic_2,
    diastolic_2: row.diastolic_2,
    bpm_2: row.bpm_2,
    systolic_3: row.systolic_3,
    diastolic_3: row.diastolic_3,
    bpm_3: row.bpm_3,
    systolic_4: row.systolic_4,
    diastolic_4: row.diastolic_4,
    bpm_4: row.bpm_4,
    systolic_5: row.systolic_5,
    diastolic_5: row.diastolic_5,
    bpm_5: row.bpm_5,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="glass-card p-4 sm:p-8">
            <h1 className="text-header mb-6">Blood Pressure</h1>
            <p className="text-description mb-6">
              Daily log: 5 readings per day (systolic / diastolic @ bpm). One entry per day.
            </p>
            <BloodPressureList initialEntries={formattedEntries} />
          </div>
        </div>
      </main>
    </div>
  );
}
