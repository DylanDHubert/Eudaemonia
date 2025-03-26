'use client';

import { useState } from 'react';
import { format } from 'date-fns';

// Type definition for a daily entry
type DailyEntry = {
  id: string;
  date: string;
  sleepHours: number;
  sleepQuality: number;
  exercise: boolean;
  exerciseTime: number | null;
  alcohol: boolean;
  alcoholUnits: number | null;
  weed: boolean;
  weedAmount: number | null;
  meditation: boolean;
  meditationTime: number | null;
  socialTime: number | null;
  workHours: number | null;
  stressLevel: number;
  happinessRating: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

type HistoryViewProps = {
  initialEntries: DailyEntry[];
};

export default function HistoryView({ initialEntries }: HistoryViewProps) {
  const [entries, setEntries] = useState(initialEntries);
  const [activeEntry, setActiveEntry] = useState<DailyEntry | null>(null);
  const [filterType, setFilterType] = useState('all'); // 'all', 'week', 'month'
  
  const filterEntries = (type: string) => {
    setFilterType(type);
    
    if (type === 'all') {
      setEntries(initialEntries);
      return;
    }
    
    const now = new Date();
    const cutoffDate = new Date();
    
    if (type === 'week') {
      cutoffDate.setDate(now.getDate() - 7);
    } else if (type === 'month') {
      cutoffDate.setMonth(now.getMonth() - 1);
    }
    
    const filtered = initialEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= cutoffDate;
    });
    
    setEntries(filtered);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM dd, yyyy');
  };
  
  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => filterEntries('all')}
          className={`px-4 py-2 rounded ${
            filterType === 'all' 
              ? 'bg-indigo-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All Time
        </button>
        <button
          onClick={() => filterEntries('week')}
          className={`px-4 py-2 rounded ${
            filterType === 'week' 
              ? 'bg-indigo-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Past Week
        </button>
        <button
          onClick={() => filterEntries('month')}
          className={`px-4 py-2 rounded ${
            filterType === 'month' 
              ? 'bg-indigo-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Past Month
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sleep</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exercise</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alcohol</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weed</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stress</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Happiness</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                  No entries found for this time period
                </td>
              </tr>
            ) : (
              entries.map(entry => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(entry.date)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.sleepHours}h ({entry.sleepQuality}/10)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.exercise ? `Yes (${entry.exerciseTime}min)` : 'No'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.alcohol ? `Yes (${entry.alcoholUnits} units)` : 'No'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.weed ? `Yes (${entry.weedAmount}/5)` : 'No'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.stressLevel}/10
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.happinessRating}/10
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setActiveEntry(entry)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Entry Details Modal */}
      {activeEntry && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium">{formatDate(activeEntry.date)}</h3>
              <button
                onClick={() => setActiveEntry(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-medium text-gray-700">Sleep</h4>
                <p>Hours: {activeEntry.sleepHours}</p>
                <p>Quality: {activeEntry.sleepQuality}/10</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700">Exercise</h4>
                <p>{activeEntry.exercise ? `Yes (${activeEntry.exerciseTime} minutes)` : 'No'}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700">Alcohol</h4>
                <p>{activeEntry.alcohol ? `Yes (${activeEntry.alcoholUnits} units)` : 'No'}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700">Weed</h4>
                <p>{activeEntry.weed ? `Yes (${activeEntry.weedAmount}/5)` : 'No'}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700">Meditation</h4>
                <p>{activeEntry.meditation ? `Yes (${activeEntry.meditationTime} minutes)` : 'No'}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700">Social Time</h4>
                <p>{activeEntry.socialTime ? `${activeEntry.socialTime} minutes` : 'None'}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700">Work</h4>
                <p>{activeEntry.workHours ? `${activeEntry.workHours} hours` : 'None'}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700">Stress Level</h4>
                <p>{activeEntry.stressLevel}/10</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700">Happiness</h4>
                <p>{activeEntry.happinessRating}/10</p>
              </div>
            </div>
            
            {activeEntry.notes && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-700">Notes</h4>
                <p className="mt-1 text-gray-600">{activeEntry.notes}</p>
              </div>
            )}
            
            <div className="mt-6">
              <button
                onClick={() => setActiveEntry(null)}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 