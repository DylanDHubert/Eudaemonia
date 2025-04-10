'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import EditEntryModal from '../components/EditEntryModal';

interface CustomCategory {
  id: string;
  name: string;
  type: 'numeric' | 'scale' | 'boolean';
  value: number;
}

interface Entry {
  id: string;
  date: string;
  sleepHours: number;
  sleepQuality: number;
  exercise: boolean;
  exerciseTime: number | null;
  alcohol: boolean;
  alcoholUnits: number | null;
  cannabis: boolean;
  cannabisAmount: number | null;
  meditation: boolean;
  meditationTime: number | null;
  socialTime: number | null;
  workHours: number | null;
  meals: number | null;
  foodQuality: number | null;
  stressLevel: number;
  happinessRating: number;
  notes: string | null;
  customCategories: CustomCategory[];
}

export default function HistoryView() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await fetch('/api/entries');
        if (!response.ok) throw new Error('Failed to fetch entries');
        const data = await response.json();
        setEntries(data);
      } catch (error) {
        console.error('Error fetching entries:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntries();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const isMobile = window.innerWidth < 768;
    return isMobile
      ? format(date, 'MM.dd.yyyy')
      : format(date, 'MMMM d, yyyy');
  };

  const handleEditClick = (entry: Entry) => {
    setSelectedEntry(entry);
    setIsEditModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="glass-card p-4 hover:shadow-lg transition-shadow duration-200"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {formatDate(entry.date)}
            </h3>
            <button
              onClick={() => handleEditClick(entry)}
              className="text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 transition-colors"
            >
              Edit
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Sleep</p>
              <p className="text-gray-900 dark:text-gray-100">
                {entry.sleepHours}h ({entry.sleepQuality}/10)
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Exercise</p>
              <p className="text-gray-900 dark:text-gray-100">
                {entry.exercise ? `${entry.exerciseTime}min` : 'No'}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Social Time</p>
              <p className="text-gray-900 dark:text-gray-100">
                {entry.socialTime ? `${entry.socialTime}h` : 'N/A'}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Work Hours</p>
              <p className="text-gray-900 dark:text-gray-100">
                {entry.workHours ? `${entry.workHours}h` : 'N/A'}
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

            {entry.customCategories.map((category) => (
              <div key={category.id}>
                <p className="text-sm text-gray-500 dark:text-gray-400">{category.name}</p>
                <p className="text-gray-900 dark:text-gray-100">
                  {category.type === 'scale' ? `${category.value}/10` : category.value}
                </p>
              </div>
            ))}
          </div>

          {entry.notes && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">Notes</p>
              <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{entry.notes}</p>
            </div>
          )}
        </div>
      ))}

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