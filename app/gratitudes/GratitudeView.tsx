'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface Gratitude {
  id: string;
  content: string;
  createdAt: string;
}

export default function GratitudeView() {
  const { data: session } = useSession();
  const [gratitudes, setGratitudes] = useState<Gratitude[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

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
      if (!session?.user?.id) return;

      try {
        const response = await fetch(`/api/gratitudes?userId=${session.user.id}`);
        if (!response.ok) throw new Error('Failed to fetch gratitudes');
        const data = await response.json();
        setGratitudes(data);
      } catch (error) {
        console.error('Error fetching gratitudes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGratitudes();
  }, [session?.user?.id]);

  const handleUpClick = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleDownClick = () => {
    if (currentIndex < gratitudes.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const formatCount = (count: number) => {
    return count > 999 ? '1K+' : count.toString();
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

  const currentGratitude = gratitudes[currentIndex];

  return (
    <div className="max-h-[370px] min-h-0 flex flex-col gap-4">
      <div className="glass-card p-4 border border-gray-200 dark:border-gray-700 w-full max-w-md">
        <p className="text-sm text-gray-800 dark:text-gray-200 mb-2">{currentGratitude.content}</p>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {format(new Date(currentGratitude.createdAt), 'MMMM d, yyyy')}
        </p>
      </div>
      
      {/* Navigation Arrows */}
      <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full px-4 py-1 shadow-sm min-w-[120px] justify-center">
        <button
          onClick={handleUpClick}
          disabled={currentIndex === 0}
          className={`p-1 rounded-full ${
            currentIndex === 0 
              ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' 
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <ChevronUpIcon className="w-4 h-4" />
        </button>
        <span className="text-xs text-gray-600 dark:text-gray-400 min-w-[60px] text-center">
          {currentIndex + 1} / {formatCount(gratitudes.length)}
        </span>
        <button
          onClick={handleDownClick}
          disabled={currentIndex === gratitudes.length - 1}
          className={`p-1 rounded-full ${
            currentIndex === gratitudes.length - 1 
              ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' 
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <ChevronDownIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
} 