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
          
          {/* CENTER: NAVIGATION BUTTONS */}
          <div className="hidden sm:flex sm:items-center sm:justify-center sm:space-x-3">
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
          </div>
          
          {/* RIGHT: USERNAME AND SIGN OUT / MOBILE BUTTONS */}
          <div className="flex items-center justify-end">
            {/* Mobile menu button and dark mode toggle - same position as desktop sign out */}
            <div className="flex items-center gap-2 sm:hidden">
              <DarkModeToggle />
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-stone-600 hover:text-indigo-500 hover:bg-indigo-500/10 focus:outline-none"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
            
            {/* Desktop: Username and Sign Out */}
            <div className="hidden sm:block">
              <div className="flex flex-col items-end">
                <span className="text-sm text-stone-600 dark:text-gray-300 mb-1">{getUserName()}</span>
                <button
                  onClick={async () => {
                    const supabase = createClient();
                    await supabase.auth.signOut();
                    router.push('/login');
                    router.refresh();
                  }}
                  className="text-sm text-stone-600 hover:text-red-500 dark:text-gray-300 dark:hover:text-red-500"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu modal */}
      {isMenuOpen && (
        <>
          {/* BACKDROP - COVERS ENTIRE SCREEN */}
          <div 
            className="sm:hidden fixed top-0 left-0 right-0 bottom-0 w-screen h-screen z-[9999] bg-black/50 dark:bg-black/70"
            style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
            onClick={closeMenu}
          />
          
          {/* MODAL CONTENT */}
          <div 
            className="sm:hidden fixed inset-0 z-[10000] flex items-start justify-center pt-[20vh] px-4 pointer-events-none"
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
                href="/how-to-use"
                className={`block px-3 py-2.5 rounded-md text-base font-medium transition-colors ${
                  isActive('/how-to-use')
                    ? 'text-rose-600 dark:text-indigo-600 bg-rose-100/80 dark:bg-indigo-400/20' 
                    : 'text-stone-600 hover:text-rose-500 hover:bg-rose-500/10 dark:text-gray-300 dark:hover:text-indigo-500 dark:hover:bg-indigo-500/10'
                }`}
                onClick={closeMenu}
              >
                Help
              </Link>
            </div>
            
            {/* MODAL FOOTER */}
            <div className="px-4 py-4 border-t border-stone-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-stone-600 dark:text-gray-400">{getUserName()}</span>
              </div>
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
        </>
      )}
    </nav>
  );
} 