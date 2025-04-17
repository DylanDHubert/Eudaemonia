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

interface GratitudeViewProps {
  homePage?: boolean;
}

export default function GratitudeView({ homePage = false }: GratitudeViewProps) {
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
      <div className="flex justify-center items-center h-full">
        <div className="text-description">Loading gratitudes...</div>
      </div>
    );
  }

  if (gratitudes.length === 0) {
    // For home page, show three empty placeholders
    if (homePage) {
      return (
        <div className="flex flex-col h-full justify-between">
          <div className="flex-1 mb-2">
            <div className="glass-card p-2 border border-gray-200 dark:border-gray-700 h-8 mb-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">No gratitudes yet</p>
            </div>
            <div className="glass-card p-2 border border-gray-200 dark:border-gray-700 h-8 mb-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">Record what you're grateful for</p>
            </div>
            <div className="glass-card p-2 border border-gray-200 dark:border-gray-700 h-8">
              <p className="text-xs text-gray-500 dark:text-gray-400">Start building your gratitude habit</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400">No gratitudes recorded yet</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="text-center py-8">
        <p className="text-description">No gratitudes recorded yet.</p>
      </div>
    );
  }

  const currentGratitude = gratitudes[currentIndex];

  // For the home page, show a simplified view with three entries or placeholder entries
  if (homePage) {
    const displayGratitudes = [...gratitudes];
    
    // If we have less than 3 gratitudes, fill with placeholder entries
    while (displayGratitudes.length < 3) {
      displayGratitudes.push({
        id: `placeholder-${displayGratitudes.length}`,
        content: 'Record what you\'re grateful for',
        createdAt: new Date().toISOString()
      });
    }
    
    // Only show the first 3 gratitudes
    const firstThreeGratitudes = displayGratitudes.slice(0, 3);
    
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1">
          {firstThreeGratitudes.map((gratitude, index) => (
            <div 
              key={gratitude.id} 
              className="glass-card p-2 border border-gray-200 dark:border-gray-700 mb-2 last:mb-0 h-8 overflow-hidden"
            >
              <p className="text-xs text-gray-800 dark:text-gray-200 truncate">
                {gratitude.id.startsWith('placeholder') 
                  ? <span className="text-gray-500 dark:text-gray-400">{gratitude.content}</span>
                  : gratitude.content
                }
              </p>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-2">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full px-3 py-1 shadow-sm min-w-[100px] justify-center">
            <span className="text-xs text-gray-600 dark:text-gray-400 text-center">
              {gratitudes.length} gratitudes
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Regular view for the gratitudes page
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