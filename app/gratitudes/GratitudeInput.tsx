'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { DocumentCheckIcon } from '@heroicons/react/24/outline';

export default function GratitudeInput() {
  const { data: session } = useSession();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const MAX_CHARS = 199;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !session?.user?.id) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/gratitudes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
        }),
      });

      if (!response.ok) throw new Error('Failed to save gratitude');
      
      setContent('');
      // Refresh the page to show the new gratitude
      window.location.reload();
    } catch (error) {
      console.error('Error saving gratitude:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    if (newContent.length <= MAX_CHARS) {
      setContent(newContent);
    }
  };

  return (
    <div className="h-full">
      <form onSubmit={handleSubmit} className="h-full flex flex-col space-y-6">
        <div className="glass-card p-4 flex-grow relative">
          <textarea
            value={content}
            onChange={handleContentChange}
            placeholder="What are you grateful for today?"
            className="w-full h-full bg-transparent border-0 focus:ring-0 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 resize-none pr-16"
            required
          />
          <div className="absolute bottom-2 right-2 text-xs text-gray-500 dark:text-gray-400">
            {content.length}/{MAX_CHARS}
          </div>
        </div>
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="glass-button w-full flex items-center justify-center gap-2"
        >
          <DocumentCheckIcon className="h-5 w-5" />
          <span>{isSubmitting ? 'Saving...' : 'Save Gratitude'}</span>
        </button>
      </form>
    </div>
  );
} 