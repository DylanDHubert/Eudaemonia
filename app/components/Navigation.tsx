'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Bars3Icon, XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import DarkModeToggle from './DarkModeToggle';

type NavigationProps = {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

export default function Navigation({ user }: NavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // SET MOUNTED STATE FOR PORTAL
  useEffect(() => {
    setMounted(true);
  }, []);

  // CHECK DARK MODE STATE
  useEffect(() => {
    // CHECK INITIAL DARK MODE
    setIsDarkMode(document.documentElement.classList.contains('dark'));

    // SET UP OBSERVER FOR DARK MODE CHANGES
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'));
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // PREVENT BODY SCROLL WHEN MOBILE MENU IS OPEN
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const getUserName = () => {
    return user?.name || user?.email?.split('@')[0] || 'User';
  };

  const isActive = (path: string) => pathname === path;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // EXPORT DATA FUNCTION
  const handleExportData = async () => {
    try {
      // SHOW LOADING STATE (OPTIONAL - CAN ADD LATER)
      
      // FETCH ALL DATA IN PARALLEL
      const [entriesRes, exposureRes, quickRes, gratitudesRes] = await Promise.all([
        fetch('/api/entries'),
        fetch('/api/exposure-entries'),
        fetch('/api/quick-entries'),
        fetch('/api/gratitudes')
      ]);

      const entriesData = await entriesRes.json();
      const exposureData = await exposureRes.json();
      const quickData = await quickRes.json();
      const gratitudesData = await gratitudesRes.json();

      const entries = entriesData.entries || [];
      const exposureEntries = exposureData.entries || [];
      const quickEntries = quickData.entries || [];
      const gratitudes = gratitudesData || [];

      // GROUP DATA BY DATE
      const dataByDate: Record<string, {
        dailyEntry?: any;
        exposureEntries: any[];
        quickEntries: any[];
        gratitudes: any[];
      }> = {};

      // PROCESS DAILY ENTRIES
      entries.forEach((entry: any) => {
        const dateKey = new Date(entry.date).toISOString().split('T')[0];
        if (!dataByDate[dateKey]) {
          dataByDate[dateKey] = {
            dailyEntry: null,
            exposureEntries: [],
            quickEntries: [],
            gratitudes: []
          };
        }
        dataByDate[dateKey].dailyEntry = entry;
      });

      // PROCESS EXPOSURE ENTRIES
      exposureEntries.forEach((entry: any) => {
        const dateKey = new Date(entry.date).toISOString().split('T')[0];
        if (!dataByDate[dateKey]) {
          dataByDate[dateKey] = {
            dailyEntry: null,
            exposureEntries: [],
            quickEntries: [],
            gratitudes: []
          };
        }
        dataByDate[dateKey].exposureEntries.push(entry);
      });

      // PROCESS QUICK ENTRIES
      quickEntries.forEach((entry: any) => {
        const dateKey = new Date(entry.date).toISOString().split('T')[0];
        if (!dataByDate[dateKey]) {
          dataByDate[dateKey] = {
            dailyEntry: null,
            exposureEntries: [],
            quickEntries: [],
            gratitudes: []
          };
        }
        dataByDate[dateKey].quickEntries.push(entry);
      });

      // PROCESS GRATITUDES (USE CREATED_AT DATE)
      gratitudes.forEach((gratitude: any) => {
        const dateKey = new Date(gratitude.created_at).toISOString().split('T')[0];
        if (!dataByDate[dateKey]) {
          dataByDate[dateKey] = {
            dailyEntry: null,
            exposureEntries: [],
            quickEntries: [],
            gratitudes: []
          };
        }
        dataByDate[dateKey].gratitudes.push(gratitude);
      });

      // SORT DATES CHRONOLOGICALLY (OLDEST TO NEWEST)
      const sortedDates = Object.keys(dataByDate).sort((a, b) => 
        new Date(a).getTime() - new Date(b).getTime()
      );

      // FORMAT DATA FOR EXPORT
      let exportText = '=== Eudaemonia Data Export ===\n';
      exportText += `Generated: ${new Date().toISOString()}\n\n`;

      sortedDates.forEach((dateKey) => {
        const dayData = dataByDate[dateKey];
        const date = new Date(dateKey);
        const formattedDate = date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });

        exportText += `--- ${formattedDate} (${dateKey}) ---\n\n`;

        // DAILY ENTRY
        if (dayData.dailyEntry) {
          const entry = dayData.dailyEntry;
          exportText += 'Daily Entry:\n';
          exportText += `  Sleep: ${entry.sleep_hours} hours (Quality: ${entry.sleep_quality}/10)\n`;
          exportText += `  Exercise: ${entry.exercise ? 'Yes' : 'No'}${entry.exercise_time ? ` (${entry.exercise_time} minutes)` : ''}\n`;
          exportText += `  Meditation: ${entry.meditation ? 'Yes' : 'No'}${entry.meditation_time ? ` (${entry.meditation_time} minutes)` : ''}\n`;
          exportText += `  Alcohol: ${entry.alcohol ? 'Yes' : 'No'}${entry.alcohol_units !== null && entry.alcohol_units !== undefined ? ` (${entry.alcohol_units} units)` : ''}\n`;
          exportText += `  Cannabis: ${entry.cannabis ? 'Yes' : 'No'}${entry.cannabis_amount !== null && entry.cannabis_amount !== undefined ? ` (${entry.cannabis_amount})` : ''}\n`;
          if (entry.social_time !== null && entry.social_time !== undefined) {
            exportText += `  Social Time: ${entry.social_time} hours\n`;
          }
          if (entry.work_hours !== null && entry.work_hours !== undefined) {
            exportText += `  Work Hours: ${entry.work_hours} hours\n`;
          }
          exportText += `  Stress Level: ${entry.stress_level}/10\n`;
          exportText += `  Happiness Rating: ${entry.happiness_rating}/10\n`;
          if (entry.meals !== null && entry.meals !== undefined) {
            exportText += `  Meals: ${entry.meals}\n`;
          }
          if (entry.food_quality !== null && entry.food_quality !== undefined) {
            exportText += `  Food Quality: ${entry.food_quality}/10\n`;
          }
          if (entry.notes) {
            exportText += `  Notes: ${entry.notes}\n`;
          }
          
          // CUSTOM CATEGORIES
          if (entry.custom_category_entries && entry.custom_category_entries.length > 0) {
            exportText += '  Custom Categories:\n';
            entry.custom_category_entries.forEach((cce: any) => {
              const category = cce.custom_categories;
              exportText += `    - ${category.name}: ${cce.value}`;
              if (category.type === 'scale' && category.min !== null && category.max !== null) {
                exportText += ` (scale: ${category.min}-${category.max})`;
              }
              exportText += '\n';
            });
          }
          exportText += '\n';
        } else {
          exportText += 'Daily Entry: (No entry for this day)\n\n';
        }

        // ERC ENTRIES
        if (dayData.exposureEntries.length > 0) {
          exportText += 'ERC Entries:\n';
          dayData.exposureEntries.forEach((entry: any) => {
            exportText += `  - [${entry.type.toUpperCase()}]: ${entry.title}\n`;
            exportText += `    SUDS Pre: ${entry.suds_pre}/10, Peak: ${entry.suds_peak}/10, Post: ${entry.suds_post}/10\n`;
            if (entry.duration !== null && entry.duration !== undefined) {
              exportText += `    Duration: ${entry.duration} minutes\n`;
            }
            if (entry.notes) {
              exportText += `    Notes: ${entry.notes}\n`;
            }
          });
          exportText += '\n';
        }

        // QUICK ENTRIES
        if (dayData.quickEntries.length > 0) {
          exportText += 'Quick Entries:\n';
          dayData.quickEntries.forEach((entry: any) => {
            exportText += `  - ${entry.category.charAt(0).toUpperCase() + entry.category.slice(1)}: ${entry.rating}/10\n`;
            if (entry.notes) {
              exportText += `    Notes: ${entry.notes}\n`;
            }
          });
          exportText += '\n';
        }

        // GRATITUDES
        if (dayData.gratitudes.length > 0) {
          exportText += 'Gratitudes:\n';
          dayData.gratitudes.forEach((gratitude: any) => {
            exportText += `  - ${gratitude.content}\n`;
          });
          exportText += '\n';
        }

        exportText += '\n';
      });

      // DOWNLOAD FILE
      const blob = new Blob([exportText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const today = new Date().toISOString().split('T')[0];
      a.download = `eudaemonia-export-${today}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      closeMenu();
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  return (
    <nav className="glass-nav fixed top-0 left-0 right-0 z-50 h-16 overflow-visible">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full overflow-visible">
        <div className="flex sm:grid sm:grid-cols-3 items-center justify-between sm:justify-normal h-full overflow-visible">
          {/* LEFT: LOGO */}
          <div className="flex items-center overflow-visible">
            <Link href="/" className="flex items-center p-3 -m-3 overflow-visible">
              <div className="p-1">
                <Image
                  src={isDarkMode ? '/dark.png' : '/light.png'}
                  alt="Eudaemonia"
                  width={120}
                  height={40}
                  className="h-8 w-auto drop-shadow-[0_0_8px_rgba(99,102,241,0.6)] dark:drop-shadow-[0_0_8px_rgba(99,102,241,0.8)] transition-all duration-300 hover:drop-shadow-[0_0_12px_rgba(99,102,241,0.8)] dark:hover:drop-shadow-[0_0_12px_rgba(99,102,241,1)]"
                  priority
                />
              </div>
            </Link>
          </div>
          
          {/* CENTER: EMPTY SPACE (NAVIGATION MOVED TO POPUP) */}
          <div className="hidden sm:block"></div>
          
          {/* RIGHT: MENU BUTTON AND DARK MODE TOGGLE */}
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-2">
              <DarkModeToggle />
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-stone-600 hover:text-rose-500 hover:bg-rose-500/10 dark:hover:text-indigo-500 dark:hover:bg-indigo-500/10 focus:outline-none"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* MENU MODAL - USED FOR BOTH MOBILE AND DESKTOP */}
      {isMenuOpen && mounted && createPortal(
        <>
          {/* BACKDROP - COVERS ENTIRE SCREEN */}
          <div 
            className="fixed top-0 left-0 right-0 bottom-0 z-[9999] bg-black/50 dark:bg-black/70"
            style={{ 
              backdropFilter: 'blur(12px)', 
              WebkitBackdropFilter: 'blur(12px)',
              width: '100vw',
              height: '100vh',
              position: 'fixed'
            }}
            onClick={closeMenu}
          />
          
          {/* MODAL CONTENT */}
          <div 
            className="fixed inset-0 z-[10000] flex items-start justify-center pt-[20vh] px-4 pointer-events-none"
          >
            <div 
              className="relative w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-stone-900 dark:text-gray-100">Menu</h2>
              <button
                onClick={closeMenu}
                className="p-1.5 rounded-md text-stone-500 hover:text-stone-700 hover:bg-stone-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only">Close menu</span>
              </button>
            </div>
            
            {/* MODAL BODY */}
            <div className="px-4 py-4 space-y-1 max-h-[70vh] overflow-y-auto">
              <Link 
                href="/" 
                className={`block px-3 py-2.5 rounded-md text-base font-medium transition-colors ${
                  isActive('/')
                    ? 'text-rose-600 dark:text-indigo-600 bg-rose-100/80 dark:bg-indigo-400/20' 
                    : 'text-stone-600 hover:text-rose-500 hover:bg-rose-500/10 dark:text-gray-300 dark:hover:text-indigo-500 dark:hover:bg-indigo-500/10'
                }`}
                onClick={closeMenu}
              >
                Dashboard
              </Link>
              <Link 
                href="/entry" 
                className={`block px-3 py-2.5 rounded-md text-base font-medium transition-colors ${
                  isActive('/entry')
                    ? 'text-rose-600 dark:text-indigo-600 bg-rose-100/80 dark:bg-indigo-400/20' 
                    : 'text-stone-600 hover:text-rose-500 hover:bg-rose-500/10 dark:text-gray-300 dark:hover:text-indigo-500 dark:hover:bg-indigo-500/10'
                }`}
                onClick={closeMenu}
              >
                Entry
              </Link>
              <Link 
                href="/insights" 
                className={`block px-3 py-2.5 rounded-md text-base font-medium transition-colors ${
                  isActive('/insights')
                    ? 'text-rose-600 dark:text-indigo-600 bg-rose-100/80 dark:bg-indigo-400/20' 
                    : 'text-stone-600 hover:text-rose-500 hover:bg-rose-500/10 dark:text-gray-300 dark:hover:text-indigo-500 dark:hover:bg-indigo-500/10'
                }`}
                onClick={closeMenu}
              >
                Insights
              </Link>
              <Link 
                href="/history" 
                className={`block px-3 py-2.5 rounded-md text-base font-medium transition-colors ${
                  isActive('/history')
                    ? 'text-rose-600 dark:text-indigo-600 bg-rose-100/80 dark:bg-indigo-400/20' 
                    : 'text-stone-600 hover:text-rose-500 hover:bg-rose-500/10 dark:text-gray-300 dark:hover:text-indigo-500 dark:hover:bg-indigo-500/10'
                }`}
                onClick={closeMenu}
              >
                History
              </Link>
              <Link 
                href="/gratitudes" 
                className={`block px-3 py-2.5 rounded-md text-base font-medium transition-colors ${
                  isActive('/gratitudes')
                    ? 'text-rose-600 dark:text-indigo-600 bg-rose-100/80 dark:bg-indigo-400/20' 
                    : 'text-stone-600 hover:text-rose-500 hover:bg-rose-500/10 dark:text-gray-300 dark:hover:text-indigo-500 dark:hover:bg-indigo-500/10'
                }`}
                onClick={closeMenu}
              >
                Gratitudes
              </Link>
              <Link
                href="/categories"
                className={`block px-3 py-2.5 rounded-md text-base font-medium transition-colors ${
                  isActive('/categories')
                    ? 'text-rose-600 dark:text-indigo-600 bg-rose-100/80 dark:bg-indigo-400/20' 
                    : 'text-stone-600 hover:text-rose-500 hover:bg-rose-500/10 dark:text-gray-300 dark:hover:text-indigo-500 dark:hover:bg-indigo-500/10'
                }`}
                onClick={closeMenu}
              >
                Categories
              </Link>
              <Link
                href="/erc"
                className={`block px-3 py-2.5 rounded-md text-base font-medium transition-colors ${
                  isActive('/erc')
                    ? 'text-rose-600 dark:text-indigo-600 bg-rose-100/80 dark:bg-indigo-400/20' 
                    : 'text-stone-600 hover:text-rose-500 hover:bg-rose-500/10 dark:text-gray-300 dark:hover:text-indigo-500 dark:hover:bg-indigo-500/10'
                }`}
                onClick={closeMenu}
              >
                ERC
              </Link>
              <Link
                href="/quick-entry"
                className={`block px-3 py-2.5 rounded-md text-base font-medium transition-colors ${
                  isActive('/quick-entry')
                    ? 'text-rose-600 dark:text-indigo-600 bg-rose-100/80 dark:bg-indigo-400/20' 
                    : 'text-stone-600 hover:text-rose-500 hover:bg-rose-500/10 dark:text-gray-300 dark:hover:text-indigo-500 dark:hover:bg-indigo-500/10'
                }`}
                onClick={closeMenu}
              >
                Quick Entry
              </Link>
            </div>
            
            {/* MODAL FOOTER */}
            <div className="px-4 py-4 border-t border-stone-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-stone-600 dark:text-gray-400">{getUserName()}</span>
              </div>
              <button
                onClick={handleExportData}
                className="w-full mb-2 px-4 py-2.5 rounded-md text-base font-medium text-stone-700 dark:text-gray-200 bg-stone-100 hover:bg-stone-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
                Export Data
              </button>
              <button
                onClick={async () => {
                  const supabase = createClient();
                  await supabase.auth.signOut();
                  router.push('/login');
                  router.refresh();
                }}
                className="w-full px-4 py-2.5 rounded-md text-base font-medium text-white bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
        </>,
        document.body
      )}
    </nav>
  );
} 