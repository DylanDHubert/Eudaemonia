'use client';

import { useState, useEffect } from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

export default function DarkModeToggle() {
  const [darkMode, setDarkMode] = useState(true); // DEFAULT TO DARK MODE

  useEffect(() => {
    // Check if user has a preference in localStorage - DEFAULT TO DARK IF NO PREFERENCE
    const storedPreference = localStorage.getItem('darkMode');
    const isDarkMode = storedPreference === null ? true : storedPreference === 'true';
    setDarkMode(isDarkMode);
    
    // Apply the class to the document based on preference
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    // Save preference to localStorage
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    // Toggle the dark class on the document
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-full bg-white/30 dark:bg-gray-800/30 backdrop-blur-md border border-white/30 dark:border-gray-700/30 shadow-sm hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {darkMode ? (
        <SunIcon className="h-5 w-5 text-amber-400" />
      ) : (
        <MoonIcon className="h-5 w-5 text-gray-700" />
      )}
    </button>
  );
} 