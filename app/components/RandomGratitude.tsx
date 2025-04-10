'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';

interface Gratitude {
  id: string;
  content: string;
  createdAt: string;
}

export default function RandomGratitude() {
  const [showInput, setShowInput] = useState(Math.random() < 0.5);
  const [gratitude, setGratitude] = useState<Gratitude | null>(null);
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

  const fetchRandomGratitude = () => {
    if (gratitudes.length > 0) {
      const randomIndex = Math.floor(Math.random() * gratitudes.length);
      setGratitude(gratitudes[randomIndex]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gratitude?.content.trim()) return;

    try {
      const response = await fetch('/api/gratitudes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: gratitude.content }),
      });

      if (response.ok) {
        setGratitude(null);
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
    <div className="glass-card p-4">
      <h2 className="text-header mb-4">Random Gratitude</h2>
      {gratitude ? (
        <div className="space-y-4">
          <p className="text-input">{gratitude.content}</p>
          <p className="text-description">
            {format(new Date(gratitude.createdAt), 'MMM d, yyyy')}
          </p>
          <button
            onClick={fetchRandomGratitude}
            className="glass-button w-full"
          >
            <span className="text-input">Another Gratitude</span>
          </button>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-description">No gratitudes found</p>
          <button
            onClick={fetchRandomGratitude}
            className="glass-button w-full mt-4"
          >
            <span className="text-input">Try Again</span>
          </button>
        </div>
      )}
    </div>
  );
} 