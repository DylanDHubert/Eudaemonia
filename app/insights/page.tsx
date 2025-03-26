import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import InsightsView from './InsightsView';
import Link from 'next/link';

export default async function Insights() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // Fetch the user's entries
  const entries = await db.dailyEntry.findMany({
    where: {
      userId: session.user.id
    },
    orderBy: {
      date: 'desc'
    }
  });

  // Prepare the data for analysis
  const preparedEntries = entries.map(entry => ({
    id: entry.id,
    date: entry.date.toISOString(),
    sleepHours: entry.sleepHours,
    sleepQuality: entry.sleepQuality,
    exercise: entry.exercise,
    exerciseTime: entry.exerciseTime,
    alcohol: entry.alcohol,
    alcoholUnits: entry.alcoholUnits,
    weed: entry.weed,
    weedAmount: entry.weedAmount,
    meditation: entry.meditation,
    meditationTime: entry.meditationTime,
    socialTime: entry.socialTime,
    workHours: entry.workHours,
    stressLevel: entry.stressLevel,
    happinessRating: entry.happinessRating,
    notes: entry.notes,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString()
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Insights</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-indigo-600 hover:text-indigo-900">Home</Link>
              <Link href="/history" className="text-indigo-600 hover:text-indigo-900">History</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Your Insights</h2>
            <p className="mb-6 text-gray-600">
              Discover correlations between your lifestyle factors and happiness.
            </p>
            
            {entries.length < 5 ? (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      You need at least 5 entries to generate meaningful insights. You currently have {entries.length} {entries.length === 1 ? 'entry' : 'entries'}.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
            
            {entries.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">You haven't recorded any entries yet.</p>
                <Link href="/" className="mt-4 inline-block text-indigo-600 hover:text-indigo-900">
                  Add your first entry
                </Link>
              </div>
            ) : (
              <InsightsView entries={preparedEntries} minimumEntries={5} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 