'use client';

import { useState, useEffect } from 'react';
import DeleteAccountModal from '../components/DeleteAccountModal';

export default function HowToUsePage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
        <div className="px-4 py-6 sm:px-0">
          <div className="glass-card p-8">
            <h2 className="text-header mb-6 text-gray-800 dark:text-gray-100">How to Use Eudaemonia</h2>
            <p className="text-description mb-6 text-gray-600 dark:text-gray-300">
              Welcome to Eudaemonia, your personal well-being tracker. Here's how to use the application effectively:
            </p>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-subheader mb-2 text-gray-800 dark:text-gray-200">Daily Check-ins</h3>
                <p className="text-description text-gray-600 dark:text-gray-300">
                  Complete the daily entry form to track your activities, sleep, exercise, social time, and happiness level.
                  Try to be consistent with your entries to get the most accurate insights.
                </p>
              </div>
              
              <div>
                <h3 className="text-subheader mb-2 text-gray-800 dark:text-gray-200">Insights</h3>
                <p className="text-description text-gray-600 dark:text-gray-300">
                  The insights page will analyze your data to show correlations between your activities and happiness.
                  Use these insights to identify what activities contribute most to your well-being.
                </p>
              </div>
              
              <div>
                <h3 className="text-subheader mb-2 text-gray-800 dark:text-gray-200">History</h3>
                <p className="text-description text-gray-600 dark:text-gray-300">
                  Review your past entries to track your progress over time. You can edit or delete entries if needed.
                </p>
              </div>
              
              <div>
                <h3 className="text-subheader mb-2 text-gray-800 dark:text-gray-200">Categories</h3>
                <p className="text-description text-gray-600 dark:text-gray-300">
                  Customize your activity categories to better reflect your lifestyle and interests.
                </p>
              </div>

              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-subheader mb-2 text-gray-800 dark:text-gray-200">Account Management</h3>
                <p className="text-description text-gray-600 dark:text-gray-300 mb-4">
                  Manage your account settings and data.
                </p>
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <DeleteAccountModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
} 