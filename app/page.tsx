import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import EntryForm from './components/EntryForm';
import LogoutButton from './components/LogoutButton';

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">
                Hello, {session.user?.name || session.user?.email?.split('@')[0] || 'User'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/insights" className="text-indigo-600 hover:text-indigo-900">Insights</a>
              <a href="/history" className="text-indigo-600 hover:text-indigo-900">History</a>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Daily Check-in</h2>
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
