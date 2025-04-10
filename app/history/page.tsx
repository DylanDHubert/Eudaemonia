import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import HistoryView from './HistoryView';
import Link from 'next/link';

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

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

  if (entries.length === 0) {
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

  return <HistoryView entries={entries} />;
} 