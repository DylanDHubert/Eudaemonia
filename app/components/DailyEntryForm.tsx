'use client';

import { useState } from 'react';
import DatePickerModal from './DatePickerModal';
import { format } from 'date-fns';

interface DailyEntryFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
}

export default function DailyEntryForm({ onSubmit, initialData }: DailyEntryFormProps) {
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [date, setDate] = useState<Date>(
    initialData?.date 
      ? new Date(initialData.date)
      : new Date()
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      date,
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

  const handleDateClick = () => {
    setDatePickerOpen(true);
  };

  return (
    <>
      <DatePickerModal 
        isOpen={datePickerOpen} 
        onClose={() => setDatePickerOpen(false)}
        date={date}
        onDateChange={setDate}
      />
      
      <form onSubmit={handleSubmit} className="space-y-6 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="glass-card p-4 relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <div 
                className="glass-input w-full px-3 py-2 cursor-pointer flex items-center"
                onClick={handleDateClick}
              >
                <span>{format(date, 'MMMM d, yyyy')}</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 ml-auto text-gray-500" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                  />
                </svg>
              </div>
            </div>
            <div className="space-y-4">
              <div className="glass-card p-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sleep Hours
                </label>
                <input
                  type="number"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(Number(e.target.value))}
                  min="0"
                  max="24"
                  className="glass-input w-full px-3 py-2"
                />
              </div>
              <div className="glass-card p-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sleep Quality (1-10)
                </label>
                <input
                  type="number"
                  value={sleepQuality}
                  onChange={(e) => setSleepQuality(Number(e.target.value))}
                  min="1"
                  max="10"
                  className="glass-input w-full px-3 py-2"
                />
              </div>
              <div className="glass-card p-4">
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
                        className="glass-input w-full px-3 py-2"
                        placeholder="Minutes"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="glass-card p-4">
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
                        className="glass-input w-full px-3 py-2"
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
              <div className="glass-card p-4">
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
                        className="glass-input w-full px-3 py-2"
                        placeholder="Units"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="glass-card p-4">
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
                        min="1"
                        max="5"
                        className="glass-input w-full px-3 py-2"
                        placeholder="Amount (1-5)"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="glass-card p-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Social Time (hours)
                </label>
                <input
                  type="number"
                  value={socialTime}
                  onChange={(e) => setSocialTime(Number(e.target.value))}
                  min="0"
                  className="glass-input w-full px-3 py-2"
                />
              </div>
              <div className="glass-card p-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Hours
                </label>
                <input
                  type="number"
                  value={workHours}
                  onChange={(e) => setWorkHours(Number(e.target.value))}
                  min="0"
                  max="24"
                  className="glass-input w-full px-3 py-2"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="glass-card p-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stress Level (1-10)
                </label>
                <input
                  type="number"
                  value={stressLevel}
                  onChange={(e) => setStressLevel(Number(e.target.value))}
                  min="1"
                  max="10"
                  className="glass-input w-full px-3 py-2"
                />
              </div>
              <div className="glass-card p-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Happiness Rating (1-10)
                </label>
                <input
                  type="number"
                  value={happinessRating}
                  onChange={(e) => setHappinessRating(Number(e.target.value))}
                  min="1"
                  max="10"
                  className="glass-input w-full px-3 py-2"
                />
              </div>
              <div className="glass-card p-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="glass-input w-full px-3 py-2"
                  placeholder="Any additional notes about your day..."
                ></textarea>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" className="glass-button">
            Submit
          </button>
        </div>
      </form>
    </>
  );
} 