'use client';

import { useState } from 'react';

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
            className="glass-input w-full min-h-[120px] sm:min-h-[150px] p-3 text-sm sm:text-base"
          />
        </div>
        <button type="submit" className="glass-button w-full text-sm sm:text-base py-2 sm:py-3">
          Save Gratitude
        </button>
      </form>
    </div>
  );
} 