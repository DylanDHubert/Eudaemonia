'use client';

import { useState, useEffect } from 'react';
import GratitudeInput from './GratitudeInput';
import GratitudeList from './GratitudeList';

export default function GratitudesPage() {
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

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 pb-6 sm:px-0">
          <div className="glass-card p-6 sm:p-8">
            <div className="space-y-6">
              <div>
                <GratitudeInput />
              </div>
              <div>
                <GratitudeList />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 