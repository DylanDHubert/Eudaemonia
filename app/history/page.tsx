import { getServerSession } from '@/lib/supabase/auth';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import HistoryView from './HistoryView';
import Link from 'next/link';

export default async function HistoryPage() {
  const session = await getServerSession();

  if (!session?.user?.id) {
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

  // FORMAT ENTRIES TO MATCH EXPECTED STRUCTURE
  const formattedEntries = (entries || []).map((entry: any) => ({
    id: entry.id,
    date: entry.date,
    sleepHours: entry.sleep_hours,
    sleepQuality: entry.sleep_quality,
    exercise: entry.exercise,
    exerciseTime: entry.exercise_time,
    alcohol: entry.alcohol,
    alcoholUnits: entry.alcohol_units,
    cannabis: entry.cannabis,
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
    customCategoryEntries: (entry.custom_category_entries || []).map((cce: any) => ({
      id: cce.id,
      value: cce.value,
      customCategory: {
        id: cce.custom_categories.id,
        name: cce.custom_categories.name,
        type: cce.custom_categories.type,
        min: cce.custom_categories.min,
        max: cce.custom_categories.max,
      }
    })),
    createdAt: entry.created_at,
    updatedAt: entry.updated_at,
  }));

  if (formattedEntries.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">No entries found</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Start tracking your daily activities to see your history here.</p>
          </div>
        </div>
      </div>
    );
  }

  return <HistoryView entries={formattedEntries} />;
} 