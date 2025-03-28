'use client';

import { useState } from 'react';
import { format } from 'date-fns';

interface FormattedEntry {
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
}

interface HistoryViewProps {
  initialEntries: FormattedEntry[];
}

export default function HistoryView({ initialEntries }: HistoryViewProps) {
  const [entries] = useState(initialEntries);

  return (
    <div className="space-y-6">
      {entries.map((entry) => (
        <div key={entry.id} className="glass-card p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {format(new Date(entry.date), 'MMMM d, yyyy')}
            </h2>
            <div className="text-right">
              <div className="text-lg font-medium text-indigo-600">
                Happiness: {entry.happinessRating}/10
              </div>
              <div className="text-sm text-gray-600">
                Stress: {entry.stressLevel}/10
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Sleep</span>
                <span className="font-medium">{entry.sleepHours} hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sleep Quality</span>
                <span className="font-medium">{entry.sleepQuality}/10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Exercise</span>
                <span className="font-medium">
                  {entry.exercise ? `${entry.exerciseTime} minutes` : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Meditation</span>
                <span className="font-medium">
                  {entry.meditation ? `${entry.meditationTime} minutes` : 'No'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Alcohol</span>
                <span className="font-medium">
                  {entry.alcohol ? `${entry.alcoholUnits} units` : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Weed</span>
                <span className="font-medium">
                  {entry.weed ? entry.weedAmount : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Social Time</span>
                <span className="font-medium">{entry.socialTime} hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Work Hours</span>
                <span className="font-medium">{entry.workHours} hours</span>
              </div>
            </div>
          </div>

          {entry.notes && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Notes</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{entry.notes}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 