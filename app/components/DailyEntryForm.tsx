'use client';

import { useState } from 'react';

interface DailyEntryFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
}

export default function DailyEntryForm({ onSubmit, initialData }: DailyEntryFormProps) {
  const [date, setDate] = useState<string>(
    initialData?.date 
      ? new Date(initialData.date).toLocaleDateString('en-US', { 
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })
      : new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })
  );
  const [sleepHours, setSleepHours] = useState(initialData?.sleepHours || 8);
  const [sleepQuality, setSleepQuality] = useState(initialData?.sleepQuality || 7);
  const [exercise, setExercise] = useState(initialData?.exercise || false);
  const [exerciseTime, setExerciseTime] = useState(initialData?.exerciseTime || 30);
  const [alcohol, setAlcohol] = useState(initialData?.alcohol || false);
  const [alcoholUnits, setAlcoholUnits] = useState(initialData?.alcoholUnits || 0);
  const [weed, setWeed] = useState(initialData?.weed || false);
  const [weedAmount, setWeedAmount] = useState(initialData?.weedAmount || 0);
  const [meditation, setMeditation] = useState(initialData?.meditation || false);
  const [meditationTime, setMeditationTime] = useState(initialData?.meditationTime || 10);
  const [socialTime, setSocialTime] = useState(initialData?.socialTime || 2);
  const [workHours, setWorkHours] = useState(initialData?.workHours || 8);
  const [stressLevel, setStressLevel] = useState(initialData?.stressLevel || 5);
  const [happinessRating, setHappinessRating] = useState(initialData?.happinessRating || 7);
  const [notes, setNotes] = useState(initialData?.notes || '');

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and forward slashes
    if (/^[\d/]*$/.test(value)) {
      setDate(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert date string to Date object
    const [month, day, year] = date.split('/');
    const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    onSubmit({
      date: dateObj,
      sleepHours,
      sleepQuality,
      exercise,
      exerciseTime,
      alcohol,
      alcoholUnits,
      weed,
      weedAmount,
      meditation,
      meditationTime,
      socialTime,
      workHours,
      stressLevel,
      happinessRating,
      notes
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 relative z-0">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="relative z-10">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date (MM/DD/YYYY)
            </label>
            <input
              type="text"
              value={date}
              onChange={handleDateChange}
              placeholder="MM/DD/YYYY"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              maxLength={10}
            />
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sleep Hours
              </label>
              <input
                type="number"
                value={sleepHours}
                onChange={(e) => setSleepHours(Number(e.target.value))}
                min="0"
                max="24"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sleep Quality (1-10)
              </label>
              <input
                type="number"
                value={sleepQuality}
                onChange={(e) => setSleepQuality(Number(e.target.value))}
                min="1"
                max="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exercise
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exercise}
                    onChange={(e) => setExercise(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Yes</span>
                </label>
                {exercise && (
                  <div className="flex-1">
                    <input
                      type="number"
                      value={exerciseTime}
                      onChange={(e) => setExerciseTime(Number(e.target.value))}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Minutes"
                    />
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meditation
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={meditation}
                    onChange={(e) => setMeditation(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Yes</span>
                </label>
                {meditation && (
                  <div className="flex-1">
                    <input
                      type="number"
                      value={meditationTime}
                      onChange={(e) => setMeditationTime(Number(e.target.value))}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Minutes"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alcohol
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={alcohol}
                    onChange={(e) => setAlcohol(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Yes</span>
                </label>
                {alcohol && (
                  <div className="flex-1">
                    <input
                      type="number"
                      value={alcoholUnits}
                      onChange={(e) => setAlcoholUnits(Number(e.target.value))}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Units"
                    />
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weed
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={weed}
                    onChange={(e) => setWeed(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Yes</span>
                </label>
                {weed && (
                  <div className="flex-1">
                    <input
                      type="number"
                      value={weedAmount}
                      onChange={(e) => setWeedAmount(Number(e.target.value))}
                      min="0"
                      max="5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Amount (1-5)"
                    />
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Social Time (hours)
              </label>
              <input
                type="number"
                value={socialTime}
                onChange={(e) => setSocialTime(Number(e.target.value))}
                min="0"
                max="24"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Work Hours
              </label>
              <input
                type="number"
                value={workHours}
                onChange={(e) => setWorkHours(Number(e.target.value))}
                min="0"
                max="24"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stress Level (1-10)
              </label>
              <input
                type="number"
                value={stressLevel}
                onChange={(e) => setStressLevel(Number(e.target.value))}
                min="1"
                max="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Happiness Rating (1-10)
              </label>
              <input
                type="number"
                value={happinessRating}
                onChange={(e) => setHappinessRating(Number(e.target.value))}
                min="1"
                max="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Any additional notes about your day..."
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Save Entry
        </button>
      </div>
    </form>
  );
} 