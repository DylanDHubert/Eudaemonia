import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import HistoryView from './HistoryView';
import Link from 'next/link';

export default async function History() {
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

  // Convert Date objects to strings for client components
  const formattedEntries = entries.map(entry => ({
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
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="glass-card p-8">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Your History</h1>
            {entries.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">You haven't recorded any entries yet.</p>
                <Link href="/" className="mt-4 inline-block text-indigo-600 hover:text-indigo-900">
                  Add your first entry
                </Link>
              </div>
            ) : (
              <HistoryView initialEntries={formattedEntries} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 