import { getServerSession } from '@/lib/supabase/auth';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import InsightsView from './InsightsView';
import { format } from 'date-fns';
import Link from 'next/link';

export default async function InsightsPage() {
  const session = await getServerSession();
  
  if (!session || !session.user) {
    redirect('/login');
  }
  
  const supabase = await createClient();
  
  // GET ALL ENTRIES FOR THE CURRENT USER WITH CUSTOM CATEGORIES
  const { data: entries, error } = await supabase
    .from('daily_entries')
    .select(`
      *,
      custom_category_entries (
        *,
        custom_categories (*)
      )
    `)
    .eq('user_id', session.user.id)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching entries:', error);
  }
  
  // DEBUG: LOG CUSTOM CATEGORIES AND CANNABIS DATA
  if (entries && entries.length > 0) {
    const allCustomCategories = new Set<string>();
    entries.forEach((entry: any) => {
      if (entry.custom_category_entries) {
        entry.custom_category_entries.forEach((cce: any) => {
          if (cce.custom_categories) {
            allCustomCategories.add(`${cce.custom_categories.name} (${cce.custom_categories.type})`);
          }
        });
      }
    });
    console.log('DEBUG: Custom categories found:', Array.from(allCustomCategories));
    console.log('DEBUG: Cannabis amounts:', entries.map((e: any) => ({ date: e.date, cannabis_amount: e.cannabis_amount })).slice(0, 5));
  }
  
  // FORMAT DATE FIELD FOR EACH ENTRY
  const formattedEntries = (entries || []).map((entry: any) => ({
    id: entry.id,
    date: format(new Date(entry.date), 'yyyy-MM-dd'),
    sleepHours: entry.sleep_hours,
    sleepQuality: entry.sleep_quality,
    exercise: entry.exercise,
    exerciseTime: entry.exercise_time,
    alcoholUnits: entry.alcohol_units,
    cannabisAmount: entry.cannabis_amount,
    meditation: entry.meditation,
    meditationTime: entry.meditation_time,
    socialTime: entry.social_time,
    workHours: entry.work_hours,
    stressLevel: entry.stress_level,
    happinessRating: entry.happiness_rating,
    meals: entry.meals,
    foodQuality: entry.food_quality,
    notes: entry.notes,
    userId: entry.user_id,
    customCategories: (entry.custom_category_entries || []).map((cce: any) => ({
      id: cce.custom_categories.id,
      name: cce.custom_categories.name,
      type: cce.custom_categories.type,
      value: cce.value
    })),
    createdAt: entry.created_at,
    updatedAt: entry.updated_at,
  }));
  
  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="glass-card p-4 sm:p-8">
            <h1 className="text-header mb-6">Your Insights</h1>
            <p className="text-description mb-6">
              Discover correlations between your lifestyle factors and happiness.
            </p>
            
            {formattedEntries.length < 5 ? (
              <div className="bg-yellow-50 dark:bg-yellow-900/50 border-l-4 border-yellow-400 dark:border-yellow-500 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400 dark:text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700 dark:text-yellow-200">
                      You need at least 5 entries to generate meaningful insights. You currently have {formattedEntries.length} {formattedEntries.length === 1 ? 'entry' : 'entries'}.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
            
            {formattedEntries.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-description">You haven't recorded any entries yet.</p>
                <Link href="/" className="mt-4 inline-block text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                  Add your first entry
                </Link>
              </div>
            ) : (
              <InsightsView entries={formattedEntries} minimumEntries={5} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 