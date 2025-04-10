'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface CustomCategory {
  id: string;
  name: string;
  type: 'numeric' | 'scale' | 'boolean';
  value: number;
}

interface FormattedEntry {
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
  createdAt: string;
  updatedAt: string;
}

interface HistoryViewProps {
  initialEntries: FormattedEntry[];
}

export default function HistoryView({ initialEntries }: HistoryViewProps) {
  const [entries] = useState(initialEntries);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check if dark mode is enabled
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    // Initial check
    checkDarkMode();

    // Set up a mutation observer to detect changes to the dark mode class
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          checkDarkMode();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="space-y-6">
      {entries.map((entry) => (
        <div key={entry.id} className="glass-card p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              {format(new Date(entry.date), 'MMMM d, yyyy')}
            </h2>
            <div className="text-right">
              <div className="text-lg font-medium text-rose-600 dark:text-indigo-400">
                Happiness: {entry.happinessRating}/10
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Stress: {entry.stressLevel}/10
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Sleep</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{entry.sleepHours} hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Sleep Quality</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{entry.sleepQuality}/10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Exercise</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {entry.exercise ? `${entry.exerciseTime} minutes` : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Meditation</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {entry.meditation ? `${entry.meditationTime} minutes` : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Meals</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{entry.meals || 'Not recorded'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Food Quality</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {entry.foodQuality ? `${entry.foodQuality}/10` : 'Not recorded'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Alcohol</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {entry.alcohol ? `${entry.alcoholUnits} units` : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Cannabis</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {entry.cannabis ? `${entry.cannabisAmount} grams` : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Social Time</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{entry.socialTime} hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Work Hours</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{entry.workHours} hours</span>
              </div>
            </div>
          </div>

          {entry.customCategories.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Custom Categories</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {entry.customCategories.map((category) => (
                  <div key={category.id} className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{category.name}</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {category.type === 'scale' ? `${category.value}/10` : 
                       category.type === 'boolean' ? (category.value === 1 ? 'Yes' : 'No') : 
                       category.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {entry.notes && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Notes</h3>
              <p className="text-gray-600 dark:text-gray-400">{entry.notes}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 