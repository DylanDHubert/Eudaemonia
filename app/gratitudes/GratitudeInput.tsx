'use client';

import { useState } from 'react';
import { DocumentCheckIcon } from '@heroicons/react/24/outline';

export default function GratitudeInput() {
  const [gratitude, setGratitude] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gratitude.trim()) return;

    try {
      const response = await fetch('/api/gratitudes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: gratitude }),
      });

      if (response.ok) {
        setGratitude('');
        // You could add a success toast here
      }
    } catch (error) {
      console.error('Error saving gratitude:', error);
      // You could add an error toast here
    }
  };

  return (
    <div className="glass-card p-4 sm:p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="gratitude" className="block text-sm font-medium text-gray-700 mb-2">
            What are you grateful for today?
          </label>
          <textarea
            id="gratitude"
            value={gratitude}
            onChange={(e) => setGratitude(e.target.value)}
            placeholder="Enter your gratitude here..."
            className="glass-input w-full h-[150px] p-3 text-base resize-none"
            rows={6}
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 glass-button w-full justify-center"
        >
          <DocumentCheckIcon className="h-5 w-5 mr-2" />
          Save Gratitude
        </button>
      </form>
    </div>
  );
} 