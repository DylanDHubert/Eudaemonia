'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type EntryFormProps = {
  userId: string;
};

export default function EntryForm({ userId }: EntryFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    sleepHours: 7,
    sleepQuality: 5,
    exercise: false,
    exerciseTime: '',
    alcohol: false,
    alcoholUnits: '',
    weed: false,
    weedAmount: '',
    meditation: false,
    meditationTime: '',
    socialTime: '',
    workHours: '',
    stressLevel: 5,
    happinessRating: 5,
    notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // Handle checkbox inputs
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
      return;
    }
    
    // Handle all other inputs
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Something went wrong');
      }
      
      setSuccess('Entry recorded successfully!');
      
      // Reset form values that should be reset after submission
      setFormData(prev => ({
        ...prev,
        date: new Date().toISOString().split('T')[0],
        notes: ''
      }));
      
      // Refresh page data
      router.refresh();
      
    } catch (err: any) {
      setError(err.message || 'Failed to submit entry');
      console.error('Entry submission error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{success}</span>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Date Selection */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        
        {/* Sleep Hours */}
        <div>
          <label htmlFor="sleepHours" className="block text-sm font-medium text-gray-700">Hours of Sleep</label>
          <input
            type="number"
            id="sleepHours"
            name="sleepHours"
            min="0"
            max="24"
            step="0.5"
            value={formData.sleepHours}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        
        {/* Sleep Quality */}
        <div>
          <label htmlFor="sleepQuality" className="block text-sm font-medium text-gray-700">Sleep Quality (1-10)</label>
          <input
            type="range"
            id="sleepQuality"
            name="sleepQuality"
            min="1"
            max="10"
            value={formData.sleepQuality}
            onChange={handleChange}
            className="mt-1 block w-full"
          />
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">Poor</span>
            <span className="text-xs text-gray-500">Excellent</span>
          </div>
        </div>
        
        {/* Exercise */}
        <div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="exercise"
              name="exercise"
              checked={formData.exercise}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="exercise" className="ml-2 block text-sm font-medium text-gray-700">Exercise</label>
          </div>
          
          {formData.exercise && (
            <div className="mt-2">
              <label htmlFor="exerciseTime" className="block text-sm font-medium text-gray-700">Minutes</label>
              <input
                type="number"
                id="exerciseTime"
                name="exerciseTime"
                min="0"
                value={formData.exerciseTime}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          )}
        </div>
        
        {/* Alcohol */}
        <div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="alcohol"
              name="alcohol"
              checked={formData.alcohol}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="alcohol" className="ml-2 block text-sm font-medium text-gray-700">Alcohol</label>
          </div>
          
          {formData.alcohol && (
            <div className="mt-2">
              <label htmlFor="alcoholUnits" className="block text-sm font-medium text-gray-700">Standard Drinks</label>
              <input
                type="number"
                id="alcoholUnits"
                name="alcoholUnits"
                min="0"
                step="0.5"
                value={formData.alcoholUnits}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          )}
        </div>
        
        {/* Weed */}
        <div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="weed"
              name="weed"
              checked={formData.weed}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="weed" className="ml-2 block text-sm font-medium text-gray-700">Weed</label>
          </div>
          
          {formData.weed && (
            <div className="mt-2">
              <label htmlFor="weedAmount" className="block text-sm font-medium text-gray-700">Amount (1-5)</label>
              <input
                type="range"
                id="weedAmount"
                name="weedAmount"
                min="1"
                max="5"
                value={formData.weedAmount || "1"}
                onChange={handleChange}
                className="mt-1 block w-full"
              />
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Little</span>
                <span className="text-xs text-gray-500">Lots</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Meditation */}
        <div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="meditation"
              name="meditation"
              checked={formData.meditation}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="meditation" className="ml-2 block text-sm font-medium text-gray-700">Meditation</label>
          </div>
          
          {formData.meditation && (
            <div className="mt-2">
              <label htmlFor="meditationTime" className="block text-sm font-medium text-gray-700">Minutes</label>
              <input
                type="number"
                id="meditationTime"
                name="meditationTime"
                min="0"
                value={formData.meditationTime}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          )}
        </div>
        
        {/* Social Time */}
        <div>
          <label htmlFor="socialTime" className="block text-sm font-medium text-gray-700">Social Time (minutes)</label>
          <input
            type="number"
            id="socialTime"
            name="socialTime"
            min="0"
            value={formData.socialTime}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        
        {/* Work Hours */}
        <div>
          <label htmlFor="workHours" className="block text-sm font-medium text-gray-700">Work Hours</label>
          <input
            type="number"
            id="workHours"
            name="workHours"
            min="0"
            max="24"
            step="0.5"
            value={formData.workHours}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        
        {/* Stress Level */}
        <div>
          <label htmlFor="stressLevel" className="block text-sm font-medium text-gray-700">Stress Level (1-10)</label>
          <input
            type="range"
            id="stressLevel"
            name="stressLevel"
            min="1"
            max="10"
            value={formData.stressLevel}
            onChange={handleChange}
            className="mt-1 block w-full"
          />
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">Low</span>
            <span className="text-xs text-gray-500">High</span>
          </div>
        </div>
        
        {/* Happiness Rating */}
        <div>
          <label htmlFor="happinessRating" className="block text-sm font-medium text-gray-700">Happiness Rating (1-10)</label>
          <input
            type="range"
            id="happinessRating"
            name="happinessRating"
            min="1"
            max="10"
            value={formData.happinessRating}
            onChange={handleChange}
            className="mt-1 block w-full"
          />
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">Low</span>
            <span className="text-xs text-gray-500">High</span>
          </div>
        </div>
      </div>
      
      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          value={formData.notes}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Any additional notes about your day..."
        />
      </div>
      
      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            'Save Entry'
          )}
        </button>
      </div>
    </form>
  );
} 