import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import InsightsView from './InsightsView';
import { format } from 'date-fns';
import Link from 'next/link';

export default async function InsightsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect('/login');
  }
  
  // Get all entries for the current user with custom categories
  const entries = await db.dailyEntry.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      customCategoryEntries: {
        include: {
          customCategory: true
        }
      }
    },
    orderBy: {
      date: 'desc',
    },
  });
  
  // Format date field for each entry
  const formattedEntries = entries.map((entry: any) => ({
    ...entry,
    date: format(new Date(entry.date), 'yyyy-MM-dd'),
    customCategories: entry.customCategoryEntries.map((cce: any) => ({
      id: cce.customCategory.id,
      name: cce.customCategory.name,
      type: cce.customCategory.type,
      value: cce.value
    })),
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
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
            
            {entries.length < 5 ? (
              <div className="bg-yellow-50 dark:bg-yellow-900/50 border-l-4 border-yellow-400 dark:border-yellow-500 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400 dark:text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700 dark:text-yellow-200">
                      You need at least 5 entries to generate meaningful insights. You currently have {entries.length} {entries.length === 1 ? 'entry' : 'entries'}.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
            
            {entries.length === 0 ? (
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