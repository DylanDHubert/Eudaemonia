'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { TrashIcon } from '@heroicons/react/24/outline';

interface Gratitude {
  id: string;
  content: string;
  createdAt: string;
}

export default function GratitudeList() {
  const [gratitudes, setGratitudes] = useState<Gratitude[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check if dark mode is enabled
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    checkDarkMode();

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

  useEffect(() => {
    const fetchGratitudes = async () => {
      try {
        const response = await fetch(`/api/gratitudes`);
        if (!response.ok) throw new Error('Failed to fetch gratitudes');
        const data = await response.json();
        // TRANSFORM SNAKE_CASE TO CAMELCASE
        const transformedData = data.map((gratitude: any) => ({
          id: gratitude.id,
          content: gratitude.content,
          createdAt: gratitude.created_at || gratitude.createdAt
        }));
        setGratitudes(transformedData);
      } catch (error) {
        console.error('Error fetching gratitudes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGratitudes();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/gratitudes/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete gratitude');
      
      setGratitudes(gratitudes.filter(g => g.id !== id));
    } catch (error) {
      console.error('Error deleting gratitude:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-description">Loading gratitudes...</div>
      </div>
    );
  }

  if (gratitudes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-description">No gratitudes recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="space-y-4 flex-grow overflow-y-auto">
        {gratitudes.map((gratitude) => (
          <div key={gratitude.id} className="glass-card p-4 border border-gray-200 dark:border-gray-700 relative group">
            <p className="text-sm text-gray-800 dark:text-gray-200 mb-2 pr-8">{gratitude.content}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {gratitude.createdAt ? format(new Date(gratitude.createdAt), 'MMMM d, yyyy') : 'Unknown date'}
            </p>
            <button
              onClick={() => handleDelete(gratitude.id)}
              className="absolute top-2 right-2 p-1 rounded-full text-gray-400 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full px-4 py-1 shadow-sm min-w-[120px] justify-center">
        <span className="text-xs text-gray-600 dark:text-gray-400">
          {gratitudes.length} gratitudes
        </span>
      </div>
    </div>
  );
} 