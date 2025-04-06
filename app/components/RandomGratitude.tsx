'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Gratitude {
  id: string;
  content: string;
  createdAt: string;
}

export default function RandomGratitude() {
  const [showInput, setShowInput] = useState(Math.random() < 0.5);
  const [gratitude, setGratitude] = useState('');
  const [gratitudes, setGratitudes] = useState<Gratitude[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGratitudes = async () => {
      try {
        const response = await fetch('/api/gratitudes');
        if (response.ok) {
          const data = await response.json();
          setGratitudes(data);
        }
      } catch (error) {
        console.error('Error fetching gratitudes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGratitudes();
  }, []);

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
        const newGratitude = await response.json();
        setGratitudes([newGratitude, ...gratitudes]);
      }
    } catch (error) {
      console.error('Error saving gratitude:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <div className="glass-card p-4 sm:p-6">
      <div className="flex justify-between items-center mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800">Gratitudes</h3>
        <Link 
          href="/gratitudes"
          className="text-xs sm:text-sm text-rose-600 hover:text-rose-700"
        >
          View All
        </Link>
      </div>

      {showInput ? (
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <textarea
            value={gratitude}
            onChange={(e) => setGratitude(e.target.value)}
            placeholder="What are you grateful for today?"
            className="glass-input w-full min-h-[80px] sm:min-h-[100px] p-3 text-sm sm:text-base"
          />
          <button type="submit" className="glass-button w-full text-sm sm:text-base py-2 sm:py-3">
            Save Gratitude
          </button>
        </form>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {gratitudes.length === 0 ? (
            <p className="text-gray-500 text-center text-sm sm:text-base">
              No gratitudes yet. Start by adding one!
            </p>
          ) : (
            <div>
              <p className="text-gray-800 text-sm sm:text-base">{gratitudes[0].content}</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">
                {new Date(gratitudes[0].createdAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 