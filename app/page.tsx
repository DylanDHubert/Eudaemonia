import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import ActivityHeatmap from './components/ActivityHeatmap';
import HappinessChart from './components/HappinessChart';
import GratitudeView from './gratitudes/GratitudeView';
import GratitudeInput from './gratitudes/GratitudeInput';

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Dashboard area - split into two sections with welcome above and happiness chart below */}
          <div className="flex flex-col items-center mb-6">
            {/* Welcome section - matches width of sections below */}
            <div className="glass-card p-6 sm:p-6 mb-6 w-full md:max-w-3xl">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800 dark:text-gray-100 text-center">Welcome to Eudaemonia</h2>
              <p className="mb-4 text-gray-600 dark:text-gray-300 text-sm sm:text-base max-w-2xl mx-auto">
                Your personal well-being tracker. Use the dashboard to navigate through different features.
              </p>
            </div>
          
            {/* Activity Heatmap and Gratitudes side by side */}
            <div className="flex flex-col md:flex-row gap-6 w-full justify-center mb-6 md:max-w-3xl">
              {/* Activity Heatmap Container */}
              <div className="glass-card p-6 sm:p-6 w-full md:flex-1">
                <ActivityHeatmap />
              </div>
              
              {/* Gratitudes Container */}
              <div className="glass-card p-6 sm:p-6 w-full md:w-60">
                <div className="overflow-y-auto overflow-x-hidden max-h-[410px] scrollbar-hide">
                  <GratitudeView />
                </div>
              </div>
            </div>
            
            {/* Gratitude Input Section */}
            <div className="w-full md:max-w-3xl mb-6">
              <GratitudeInput />
            </div>
            
            {/* Happiness Chart */}
            <div className="glass-card p-6 sm:p-6 w-full md:max-w-3xl">
              <div className="h-70 relative">
                <HappinessChart />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
