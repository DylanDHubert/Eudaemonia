'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import EditEntryModal from '../components/EditEntryModal';
import { Entry } from '../types/entry';

interface CustomCategory {
  id: string;
  name: string;
  type: 'numeric' | 'scale' | 'boolean';
  value: number;
}

interface CustomCategoryEntry {
  id: string;
  value: number;
  customCategory: CustomCategory;
}

interface HistoryViewProps {
  entries: Entry[];
}

export default function HistoryView({ entries }: HistoryViewProps) {
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEditClick = (entry: Entry) => {
    setSelectedEntry(entry);
    setIsEditModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-6">
        {entries.map((entry) => (
          <div key={entry.id} className="glass-card p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {format(new Date(entry.date), 'MMMM d, yyyy')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {format(new Date(entry.date), 'EEEE')}
                </p>
              </div>
              <button
                onClick={() => handleEditClick(entry)}
                className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Edit
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Sleep</p>
                <p className="text-gray-900 dark:text-gray-100">
                  {entry.sleepHours} hours ({entry.sleepQuality}/10)
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Exercise</p>
                <p className="text-gray-900 dark:text-gray-100">
                  {entry.exercise ? 'Yes' : 'No'}
                  {entry.exerciseTime && ` (${entry.exerciseTime} min)`}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Alcohol</p>
                <p className="text-gray-900 dark:text-gray-100">
                  {entry.alcohol ? 'Yes' : 'No'}
                  {entry.alcoholUnits && ` (${entry.alcoholUnits} units)`}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Cannabis</p>
                <p className="text-gray-900 dark:text-gray-100">
                  {entry.cannabis ? 'Yes' : 'No'}
                  {entry.cannabisAmount && ` (${entry.cannabisAmount}/5)`}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Meditation</p>
                <p className="text-gray-900 dark:text-gray-100">
                  {entry.meditation ? 'Yes' : 'No'}
                  {entry.meditationTime && ` (${entry.meditationTime} min)`}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Social Time</p>
                <p className="text-gray-900 dark:text-gray-100">
                  {entry.socialTime ? `${entry.socialTime} hours` : 'N/A'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Work Hours</p>
                <p className="text-gray-900 dark:text-gray-100">
                  {entry.workHours ? `${entry.workHours} hours` : 'N/A'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Meals</p>
                <p className="text-gray-900 dark:text-gray-100">
                  {entry.meals ? `${entry.meals} meals` : 'N/A'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Food Quality</p>
                <p className="text-gray-900 dark:text-gray-100">
                  {entry.foodQuality ? `${entry.foodQuality}/10` : 'N/A'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Stress Level</p>
                <p className="text-gray-900 dark:text-gray-100">{entry.stressLevel}/10</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Happiness</p>
                <p className="text-gray-900 dark:text-gray-100">{entry.happinessRating}/10</p>
              </div>

              {entry.customCategoryEntries.map((categoryEntry) => (
                <div key={categoryEntry.id}>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{categoryEntry.customCategory.name}</p>
                  <p className="text-gray-900 dark:text-gray-100">
                    {categoryEntry.customCategory.type === 'scale' ? `${categoryEntry.value}/10` : categoryEntry.value}
                  </p>
                </div>
              ))}

              {entry.notes && (
                <div className="col-span-full">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Notes</p>
                  <p className="text-gray-900 dark:text-gray-100">{entry.notes}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedEntry && (
        <EditEntryModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedEntry(null);
          }}
          entry={selectedEntry}
        />
      )}
    </div>
  );
} 