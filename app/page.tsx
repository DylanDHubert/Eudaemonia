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
    <div className="min-h-screen">
      <nav className="glass-nav fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-800">
                Hello, {session.user?.name || session.user?.email?.split('@')[0] || 'User'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/insights" className="text-indigo-600 hover:text-indigo-900 transition-colors">Insights</a>
              <a href="/history" className="text-indigo-600 hover:text-indigo-900 transition-colors">History</a>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 pt-24">
        <div className="px-4 py-6 sm:px-0">
          <div className="glass-card p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Daily Check-in</h2>
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
