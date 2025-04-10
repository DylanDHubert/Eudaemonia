'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DarkModeToggle from '../components/DarkModeToggle';

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
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

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError('Email format is invalid');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();
      
      if (res.ok) {
        router.push('/login?registered=true');
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('An unexpected error occurred during registration');
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
              
              <div>
                <h2 className="text-header text-center">
                  Create your account
                </h2>
              </div>
              <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="glass-card p-3 sm:p-4 bg-red-50/50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                    <span className="block sm:inline text-red-700 dark:text-red-300">{error}</span>
                  </div>
                )}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="text-subheader block mb-2">
                      Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="glass-input w-full px-3 py-2 text-input dark:text-white"
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="text-subheader block mb-2">
                      Email address
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
                    <label htmlFor="password" className="text-subheader block mb-2">
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
                      placeholder="Password (min 6 characters)"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className="glass-button w-full group relative"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-input dark:text-white">Creating account...</span>
                      </>
                    ) : (
                      <span className="text-input dark:text-white">Sign up</span>
                    )}
                  </button>
                </div>

                <div className="text-center">
                  <Link
                    href="/login"
                    className="font-medium text-rose-600 hover:text-rose-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    Already have an account? Sign in
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