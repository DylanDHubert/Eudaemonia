import { getServerSession } from '@/lib/supabase/auth';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ExposureList from './ExposureList';

export default async function ERCPage() {
  const session = await getServerSession();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const supabase = await createClient();

  // GET ALL EXPOSURE ENTRIES FOR THE CURRENT USER
  const { data: entries, error } = await supabase
    .from('exposure_entries')
    .select('*')
    .eq('user_id', session.user.id)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching exposure entries:', error);
  }

  // FORMAT ENTRIES TO MATCH EXPECTED STRUCTURE
  const formattedEntries = (entries || []).map((entry: any) => ({
    id: entry.id,
    type: entry.type,
    title: entry.title,
    notes: entry.notes,
    sudsPre: entry.suds_pre,
    sudsPeak: entry.suds_peak,
    sudsPost: entry.suds_post,
    duration: entry.duration,
    date: entry.date,
    createdAt: entry.created_at,
    updatedAt: entry.updated_at,
  }));

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="glass-card p-4 sm:p-8">
            <h1 className="text-header mb-6">ERC - Exposure & Response Conditioning</h1>
            <p className="text-description mb-6">
              Track your exposure exercises to overcome your fear of flying. Record your SUDS (Subjective Units of Distress) levels before, during peak, and after each exposure.
            </p>
            
            <ExposureList initialEntries={formattedEntries} />
          </div>
        </div>
      </main>
    </div>
  );
}

