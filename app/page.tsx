import { getServerSession } from '@/lib/supabase/auth';
import { redirect } from 'next/navigation';
import ActivityHeatmap from './components/ActivityHeatmap';
import HappinessChart from './components/HappinessChart';
import GratitudeView from './gratitudes/GratitudeView';
import GratitudeInput from './gratitudes/GratitudeInput';

export default async function Dashboard() {
  const session = await getServerSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Dashboard area */}
          <div className="flex flex-col items-center mb-6">
            {/* Activity Heatmap - Full Width */}
            <div className="glass-card p-6 sm:p-6 w-full md:max-w-3xl mb-6">
              <ActivityHeatmap />
            </div>
            
            {/* Gratitudes Container and Input side-by-side */}
            <div className="flex flex-col md:flex-row w-full md:max-w-3xl gap-6 mb-6">
              {/* Gratitudes View */}
              <div className="glass-card p-6 sm:p-6 w-full md:w-1/2">
                <div className="h-[160px] overflow-hidden">
                  <GratitudeView homePage={true} />
                </div>
              </div>
              
              {/* Gratitude Input */}
              <div className="glass-card p-6 sm:p-6 w-full md:w-1/2">
                <div className="h-[160px]">
                  <GratitudeInput homePage={true} />
                </div>
              </div>
            </div>
            
            {/* Happiness Chart */}
            <div className="glass-card p-6 sm:p-6 w-full md:max-w-3xl">
              <div className="relative">
                <HappinessChart />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
