'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getPageTitle = () => {
    switch (pathname) {
      case '/':
        return 'Dashboard';
      case '/entry':
        return 'Daily Entry';
      case '/insights':
        return 'Insights';
      case '/history':
        return 'History';
      case '/how-to-use':
        return 'How to Use';
      case '/gratitudes':
        return 'Gratitudes';
      default:
        return 'Eudaemonia';
    }
  };

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
    <nav className="glass-nav fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-stone-800">
              {pathname === '/' ? `Hello, ${getUserName()}` : getPageTitle()}
            </h1>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-stone-600 hover:text-rose-600 hover:bg-white/30 focus:outline-none"
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
                  ? 'text-rose-600 bg-white/50' 
                  : 'text-stone-600 hover:text-rose-600 hover:bg-white/30'
              }`}
            >
              Dashboard
            </Link>
            <Link 
              href="/entry" 
              className={`text-sm sm:text-base px-3 py-2 rounded-md transition-colors ${
                isActive('/entry')
                  ? 'text-rose-600 bg-white/50' 
                  : 'text-stone-600 hover:text-rose-600 hover:bg-white/30'
              }`}
            >
              Entry
            </Link>
            <Link 
              href="/insights" 
              className={`text-sm sm:text-base px-3 py-2 rounded-md transition-colors ${
                isActive('/insights')
                  ? 'text-rose-600 bg-white/50' 
                  : 'text-stone-600 hover:text-rose-600 hover:bg-white/30'
              }`}
            >
              Insights
            </Link>
            <Link 
              href="/history" 
              className={`text-sm sm:text-base px-3 py-2 rounded-md transition-colors ${
                isActive('/history')
                  ? 'text-rose-600 bg-white/50' 
                  : 'text-stone-600 hover:text-rose-600 hover:bg-white/30'
              }`}
            >
              History
            </Link>
            <Link 
              href="/gratitudes" 
              className={`text-sm sm:text-base px-3 py-2 rounded-md transition-colors ${
                isActive('/gratitudes')
                  ? 'text-rose-600 bg-white/50' 
                  : 'text-stone-600 hover:text-rose-600 hover:bg-white/30'
              }`}
            >
              Gratitudes
            </Link>
            <Link
              href="/categories"
              className={`text-sm sm:text-base px-3 py-2 rounded-md transition-colors ${
                isActive('/categories')
                  ? 'text-rose-600 bg-white/50' 
                  : 'text-stone-600 hover:text-rose-600 hover:bg-white/30'
              }`}
            >
              Categories
            </Link>
            <Link
              href="/how-to-use"
              className={`text-sm sm:text-base px-3 py-2 rounded-md transition-colors ${
                isActive('/how-to-use')
                  ? 'text-rose-600 bg-white/50' 
                  : 'text-stone-600 hover:text-rose-600 hover:bg-white/30'
              }`}
            >
              Help
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="glass-button"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden bg-white/80 backdrop-blur-md">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              href="/" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/')
                  ? 'text-rose-600 bg-white/50' 
                  : 'text-stone-600 hover:text-rose-600 hover:bg-white/30'
              }`}
              onClick={closeMenu}
            >
              Dashboard
            </Link>
            <Link 
              href="/entry" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/entry')
                  ? 'text-rose-600 bg-white/50' 
                  : 'text-stone-600 hover:text-rose-600 hover:bg-white/30'
              }`}
              onClick={closeMenu}
            >
              Entry
            </Link>
            <Link 
              href="/insights" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/insights')
                  ? 'text-rose-600 bg-white/50' 
                  : 'text-stone-600 hover:text-rose-600 hover:bg-white/30'
              }`}
              onClick={closeMenu}
            >
              Insights
            </Link>
            <Link 
              href="/history" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/history')
                  ? 'text-rose-600 bg-white/50' 
                  : 'text-stone-600 hover:text-rose-600 hover:bg-white/30'
              }`}
              onClick={closeMenu}
            >
              History
            </Link>
            <Link 
              href="/gratitudes" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/gratitudes')
                  ? 'text-rose-600 bg-white/50' 
                  : 'text-stone-600 hover:text-rose-600 hover:bg-white/30'
              }`}
              onClick={closeMenu}
            >
              Gratitudes
            </Link>
            <Link
              href="/categories"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/categories')
                  ? 'text-rose-600 bg-white/50' 
                  : 'text-stone-600 hover:text-rose-600 hover:bg-white/30'
              }`}
              onClick={closeMenu}
            >
              Categories
            </Link>
            <Link
              href="/how-to-use"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/how-to-use')
                  ? 'text-rose-600 bg-white/50' 
                  : 'text-stone-600 hover:text-rose-600 hover:bg-white/30'
              }`}
              onClick={closeMenu}
            >
              Help
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-rose-500/70 hover:bg-rose-600/80"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
} 