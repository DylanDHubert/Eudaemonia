'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
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

  return (
    <nav className="glass-nav fixed top-0 left-0 right-0 z-50 h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between h-full">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src={isDarkMode ? '/dark.png' : '/light.png'}
                alt="Eudaemonia"
                width={120}
                height={40}
                className="h-8 w-auto"
                priority
              />
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <DarkModeToggle />
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-stone-600 hover:text-indigo-500 hover:bg-indigo-500/10 focus:outline-none ml-2"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden sm:flex sm:items-center sm:space-x-6">
            <Link 
              href="/" 
              className={`text-sm sm:text-base px-3 py-2 rounded-md transition-colors ${
                isActive('/')
                  ? 'text-rose-600 dark:text-indigo-600 bg-white/50 dark:bg-gray-800/50' 
                  : 'text-stone-600 hover:text-rose-500 hover:bg-rose-500/10 dark:text-gray-300 dark:hover:text-indigo-500 dark:hover:bg-indigo-500/10'
              }`}
            >
              Dashboard
            </Link>
            <Link 
              href="/entry" 
              className={`text-sm sm:text-base px-3 py-2 rounded-md transition-colors ${
                isActive('/entry')
                  ? 'text-rose-600 dark:text-indigo-600 bg-white/50 dark:bg-gray-800/50' 
                  : 'text-stone-600 hover:text-rose-500 hover:bg-rose-500/10 dark:text-gray-300 dark:hover:text-indigo-500 dark:hover:bg-indigo-500/10'
              }`}
            >
              Entry
            </Link>
            <Link 
              href="/insights" 
              className={`text-sm sm:text-base px-3 py-2 rounded-md transition-colors ${
                isActive('/insights')
                  ? 'text-rose-600 dark:text-indigo-600 bg-white/50 dark:bg-gray-800/50' 
                  : 'text-stone-600 hover:text-rose-500 hover:bg-rose-500/10 dark:text-gray-300 dark:hover:text-indigo-500 dark:hover:bg-indigo-500/10'
              }`}
            >
              Insights
            </Link>
            <Link 
              href="/history" 
              className={`text-sm sm:text-base px-3 py-2 rounded-md transition-colors ${
                isActive('/history')
                  ? 'text-rose-600 dark:text-indigo-600 bg-white/50 dark:bg-gray-800/50' 
                  : 'text-stone-600 hover:text-rose-500 hover:bg-rose-500/10 dark:text-gray-300 dark:hover:text-indigo-500 dark:hover:bg-indigo-500/10'
              }`}
            >
              History
            </Link>
            <Link 
              href="/gratitudes" 
              className={`text-sm sm:text-base px-3 py-2 rounded-md transition-colors ${
                isActive('/gratitudes')
                  ? 'text-rose-600 dark:text-indigo-600 bg-white/50 dark:bg-gray-800/50' 
                  : 'text-stone-600 hover:text-rose-500 hover:bg-rose-500/10 dark:text-gray-300 dark:hover:text-indigo-500 dark:hover:bg-indigo-500/10'
              }`}
            >
              Gratitudes
            </Link>
            <Link
              href="/categories"
              className={`text-sm sm:text-base px-3 py-2 rounded-md transition-colors ${
                isActive('/categories')
                  ? 'text-rose-600 dark:text-indigo-600 bg-white/50 dark:bg-gray-800/50' 
                  : 'text-stone-600 hover:text-rose-500 hover:bg-rose-500/10 dark:text-gray-300 dark:hover:text-indigo-500 dark:hover:bg-indigo-500/10'
              }`}
            >
              Categories
            </Link>
            <Link
              href="/how-to-use"
              className={`text-sm sm:text-base px-3 py-2 rounded-md transition-colors ${
                isActive('/how-to-use')
                  ? 'text-rose-600 dark:text-indigo-600 bg-white/50 dark:bg-gray-800/50' 
                  : 'text-stone-600 hover:text-rose-500 hover:bg-rose-500/10 dark:text-gray-300 dark:hover:text-indigo-500 dark:hover:bg-indigo-500/10'
              }`}
            >
              Help
            </Link>
            <DarkModeToggle />
            <div className="relative ml-3">
              <div className="flex items-center">
                <span className="text-sm text-stone-600 dark:text-gray-300 mr-2">{getUserName()}</span>
                <button
                  onClick={async () => {
                    const supabase = createClient();
                    await supabase.auth.signOut();
                    router.push('/login');
                    router.refresh();
                  }}
                  className="text-sm text-stone-600 hover:text-indigo-500 dark:text-gray-300 dark:hover:text-indigo-500"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div 
          className="sm:hidden fixed inset-0 z-[100] bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg"
          onClick={closeMenu}
        >
          <div 
            className="px-4 pt-20 pb-6 space-y-2 max-h-screen overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Link 
              href="/" 
              className={`block px-3 py-2.5 rounded-md text-base font-medium ${
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
              className={`block px-3 py-2.5 rounded-md text-base font-medium ${
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
              className={`block px-3 py-2.5 rounded-md text-base font-medium ${
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
              className={`block px-3 py-2.5 rounded-md text-base font-medium ${
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
              className={`block px-3 py-2.5 rounded-md text-base font-medium ${
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
              className={`block px-3 py-2.5 rounded-md text-base font-medium ${
                isActive('/categories')
                  ? 'text-rose-600 dark:text-indigo-600 bg-rose-100/80 dark:bg-indigo-400/20' 
                  : 'text-stone-600 hover:text-rose-500 hover:bg-rose-500/10 dark:text-gray-300 dark:hover:text-indigo-500 dark:hover:bg-indigo-500/10'
              }`}
              onClick={closeMenu}
            >
              Categories
            </Link>
            <Link
              href="/how-to-use"
              className={`block px-3 py-2.5 rounded-md text-base font-medium ${
                isActive('/how-to-use')
                  ? 'text-rose-600 dark:text-indigo-600 bg-rose-100/80 dark:bg-indigo-400/20' 
                  : 'text-stone-600 hover:text-rose-500 hover:bg-rose-500/10 dark:text-gray-300 dark:hover:text-indigo-500 dark:hover:bg-indigo-500/10'
              }`}
              onClick={closeMenu}
            >
              Help
            </Link>
            <button
              onClick={async () => {
                const supabase = createClient();
                await supabase.auth.signOut();
                router.push('/login');
                router.refresh();
              }}
              className="w-full text-left px-3 py-2.5 rounded-md text-base font-medium text-white bg-rose-500/70 hover:bg-rose-600/80 dark:bg-indigo-600/70 dark:hover:bg-indigo-700/80"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
} 