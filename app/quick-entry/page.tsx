import { getServerSession } from '@/lib/supabase/auth';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import QuickEntryList from './QuickEntryList';

export default async function QuickEntryPage() {
  const session = await getServerSession();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const supabase = await createClient();

  // GET ALL QUICK ENTRIES FOR THE CURRENT USER
  const { data: entries, error } = await supabase
    .from('quick_entries')
    .select('*')
    .eq('user_id', session.user.id)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching quick entries:', error);
  }

  // FORMAT ENTRIES TO MATCH EXPECTED STRUCTURE
  const formattedEntries = (entries || []).map((entry: any) => ({
    id: entry.id,
    category: entry.category,
    rating: entry.rating,
    notes: entry.notes,
    date: entry.date,
    createdAt: entry.created_at,
    updatedAt: entry.updated_at,
  }));

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="glass-card p-4 sm:p-8">
            <h1 className="text-header mb-6">Quick Entry</h1>
            <p className="text-description mb-6">
              Quickly track your sleep, anxiety, contentment, and energy levels throughout the day.
            </p>
            
            <QuickEntryList initialEntries={formattedEntries} />
          </div>
        </div>
      </main>
    </div>
  );
}

