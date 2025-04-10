'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';

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

  // Check if dark mode is enabled
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    // Initial check
    checkDarkMode();

    // Set up a mutation observer to detect changes to the dark mode class
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
    <div className="space-y-4 scrollbar-hide">
      {gratitudes.map((gratitude) => (
        <div
          key={gratitude.id}
          className="glass-card p-4 border border-gray-200 dark:border-gray-700"
        >
          <p className="text-sm text-gray-800 dark:text-gray-200 mb-2">{gratitude.content}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {format(new Date(gratitude.createdAt), 'MMMM d, yyyy')}
          </p>
        </div>
      ))}
    </div>
  );
} 