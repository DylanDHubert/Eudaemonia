import { getServerSession } from '@/lib/supabase/auth';
import { redirect } from 'next/navigation';
import CustomCategoriesManager from '../components/CustomCategoriesManager';

export default async function Categories() {
  const session = await getServerSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="glass-card p-4 sm:p-8">
            <h1 className="text-header mb-6">Your Categories</h1>
            <p className="text-description mb-6">
              Create and manage custom categories to track factors that affect your happiness.
            </p>
            
            <CustomCategoriesManager userId={session.user.id} />
          </div>
        </div>
      </main>
    </div>
  );
} 