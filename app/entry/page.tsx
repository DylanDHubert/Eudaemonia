import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import EntryForm from '../components/EntryForm';

export default async function EntryPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="glass-card p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Daily Check-in</h2>
            <p className="mb-6 text-gray-600">
              Track your lifestyle factors and happiness to discover what contributes most to your well-being.
            </p>
            <EntryForm userId={session.user.id} />
          </div>
        </div>
      </main>
    </div>
  );
} 