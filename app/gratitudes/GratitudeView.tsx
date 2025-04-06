'use client';

import { useEffect, useState } from 'react';

interface Gratitude {
  id: string;
  content: string;
  createdAt: string;
}

export default function GratitudeView() {
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

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {gratitudes.length === 0 ? (
        <div className="glass-card p-4 sm:p-6 text-center text-gray-500 text-sm sm:text-base">
          No gratitudes saved yet. Start by adding one in the Input tab!
        </div>
      ) : (
        gratitudes.map((gratitude) => (
          <div key={gratitude.id} className="glass-card p-4 sm:p-6">
            <p className="text-gray-800 text-sm sm:text-base">{gratitude.content}</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              {new Date(gratitude.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))
      )}
    </div>
  );
} 