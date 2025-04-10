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

  // Fetch the user's entries with custom categories
  const entries = await db.dailyEntry.findMany({
    where: {
      userId: session.user.id
    },
    include: {
      customCategoryEntries: {
        include: {
          customCategory: true
        }
      }
    },
    orderBy: {
      date: 'desc'
    }
  });

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="glass-card p-4 sm:p-8">
            <h1 className="text-header mb-6">Your History</h1>
            <p className="text-description mb-6">
              View and manage your past entries. You can edit or delete entries to keep your data accurate.
            </p>
            
            {entries.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-description">You haven't recorded any entries yet.</p>
                <Link href="/" className="mt-4 inline-block text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                  Add your first entry
                </Link>
              </div>
            ) : (
              <HistoryView />
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 