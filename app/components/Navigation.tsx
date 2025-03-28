'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

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

  const getPageTitle = () => {
    switch (pathname) {
      case '/':
        return 'Home';
      case '/insights':
        return 'Insights';
      case '/history':
        return 'History';
      default:
        return 'Eudaemonia';
    }
  };

  const getUserName = () => {
    return user?.name || user?.email?.split('@')[0] || 'User';
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="glass-nav fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-stone-800">
              {pathname === '/' ? `Hello, ${getUserName()}` : getPageTitle()}
            </h1>
          </div>
          <div className="flex items-center space-x-6 sm:space-x-8">
            <Link 
              href="/" 
              className={`text-sm sm:text-base px-3 py-2 rounded-md transition-colors ${
                isActive('/')
                  ? 'text-rose-600 bg-white/50' 
                  : 'text-stone-600 hover:text-rose-600 hover:bg-white/30'
              }`}
            >
              Home
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
              href="/categories"
              className={`text-sm sm:text-base px-3 py-2 rounded-md transition-colors ${
                isActive('/categories')
                  ? 'text-rose-600 bg-white/50' 
                  : 'text-stone-600 hover:text-rose-600 hover:bg-white/30'
              }`}
            >
              Categories
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
    </nav>
  );
} 