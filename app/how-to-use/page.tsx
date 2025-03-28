import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';

export default async function HowToUsePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="glass-card p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">How to Use Eudaemonia</h2>
            <p className="mb-6 text-gray-600">
              Welcome to Eudaemonia, your personal well-being tracker. Here's how to use the application effectively:
            </p>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-rose-600">Daily Check-ins</h3>
                <p className="text-gray-600">
                  Complete the daily entry form to track your activities, sleep, exercise, social time, and happiness level.
                  Try to be consistent with your entries to get the most accurate insights.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2 text-rose-600">Insights</h3>
                <p className="text-gray-600">
                  The insights page will analyze your data to show correlations between your activities and happiness.
                  Use these insights to identify what activities contribute most to your well-being.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2 text-rose-600">History</h3>
                <p className="text-gray-600">
                  Review your past entries to track your progress over time. You can edit or delete entries if needed.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2 text-rose-600">Categories</h3>
                <p className="text-gray-600">
                  Customize your activity categories to better reflect your lifestyle and interests.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 