import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import CustomCategoriesManager from '../components/CustomCategoriesManager';

export default async function Categories() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="glass-card p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Custom Categories</h2>
            <p className="mb-6 text-gray-600">
              Create and manage your custom tracking categories. These will appear in your daily check-in form.
            </p>
            <CustomCategoriesManager userId={session.user.id} />
          </div>
        </div>
      </main>
    </div>
  );
} 