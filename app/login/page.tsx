'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import DarkModeToggle from '../components/DarkModeToggle';

// Component to handle registration success message
function RegistrationAlert() {
  const searchParams = useSearchParams();
  const [success, setSuccess] = useState('');
  
  useEffect(() => {
    // Check if user has just registered
    const registered = searchParams.get('registered');
    if (registered) {
      setSuccess('Registration successful! Please sign in with your new account.');
    }
  }, [searchParams]);
  
  if (!success) return null;
  
  return (
    <div className="glass-card p-4 mb-4 bg-green-50/50 border-green-200">
      <span className="block sm:inline text-green-700">{success}</span>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        setError('Invalid email or password');
      } else if (data.user) {
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-center items-center min-h-[calc(100vh-3rem)]">
            <div className="glass-card w-full max-w-md p-6 sm:p-8">
              <div className="flex justify-end mb-4">
                <DarkModeToggle />
              </div>
              
              <div className="text-center mb-8">
                <h1 className="text-header mb-2">Welcome Back</h1>
                <p className="text-description">
                  Sign in to your account to continue
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <Suspense fallback={null}>
                  <RegistrationAlert />
                </Suspense>
                
                {error && (
                  <div className="glass-card p-3 sm:p-4 bg-red-50/50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                    <span className="block sm:inline text-red-700 dark:text-red-300">{error}</span>
                  </div>
                )}
                <div className="space-y-4">
                  <div>
                    <label className="text-subheader block mb-2">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="glass-input w-full px-3 py-2 text-input dark:text-white"
                      placeholder="Email address"
                    />
                  </div>
                  <div>
                    <label className="text-subheader block mb-2">
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="glass-input w-full px-3 py-2 text-input dark:text-white"
                      placeholder="Password"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className="glass-button w-full group relative"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-input dark:text-white">Signing in...</span>
                      </>
                    ) : (
                      <span className="text-input dark:text-white">Sign In</span>
                    )}
                  </button>
                </div>

                <div className="text-center">
                  <Link
                    href="/signup"
                    className="font-medium text-rose-600 hover:text-rose-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    Don't have an account? Sign up
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 