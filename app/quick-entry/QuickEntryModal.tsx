'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Moon, Heart, Smile, Zap } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

type QuickEntry = {
  id: string;
  category: 'sleep' | 'mood' | 'pride' | 'energy';
  rating: number;
  notes: string | null;
  date: string;
  createdAt: string;
  updatedAt: string;
};

interface QuickEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: QuickEntry | null;
}

export default function QuickEntryModal({ isOpen, onClose, entry }: QuickEntryModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: 'sleep' as 'sleep' | 'mood' | 'pride' | 'energy',
    rating: 5,
    notes: '',
    date: new Date(),
  });
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (entry) {
        // EDIT MODE
        setFormData({
          category: entry.category,
          rating: entry.rating,
          notes: entry.notes || '',
          date: new Date(entry.date),
        });
      } else {
        // CREATE MODE
        setFormData({
          category: 'sleep',
          rating: 5,
          notes: '',
          date: new Date(),
        });
      }
    }
  }, [isOpen, entry]);

  // PREVENT BODY SCROLL WHEN MODAL IS OPEN
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = entry ? `/api/quick-entries/${entry.id}` : '/api/quick-entries';
      const method = entry ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: formData.category,
          rating: formData.rating,
          notes: formData.notes || null,
          date: formData.date.toISOString(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save entry');
      }

      toast.success(entry ? 'Entry updated successfully' : 'Entry created successfully', {
        position: "bottom-right",
        autoClose: 3000
      });

      onClose();
    } catch (error: any) {
      console.error('Error saving entry:', error);
      toast.error(error.message || 'Failed to save entry. Please try again.', {
        position: "bottom-right",
        autoClose: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' 
        ? parseInt(value) || 0 
        : value
    }));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sleep':
        return <Moon className="w-5 h-5" />;
      case 'mood':
        return <Heart className="w-5 h-5" />;
      case 'pride':
        return <Smile className="w-5 h-5" />;
      case 'energy':
        return <Zap className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'sleep':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'mood':
        return 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
      case 'pride':
        return 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'energy':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      default:
        return 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  const modalContent = (
    <>
      {/* BACKDROP */}
      <div 
        className="fixed top-0 left-0 right-0 bottom-0 z-[9999] bg-black/50 dark:bg-black/70"
        style={{ 
          backdropFilter: 'blur(12px)', 
          WebkitBackdropFilter: 'blur(12px)',
          width: '100vw',
          height: '100vh',
          position: 'fixed'
        }}
        onClick={onClose}
      />
      
      {/* MODAL CONTENT */}
      <div 
        className="fixed inset-0 z-[10000] flex items-center justify-center px-4 pointer-events-none"
      >
        <div 
          className="glass-card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* HEADER */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-header text-gray-800 dark:text-gray-100">
              {entry ? 'Edit Entry' : 'New Quick Entry'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* CATEGORY */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category *
              </label>
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category: 'sleep' }))}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-2 px-3 py-3 rounded-md border-2 transition-all ${
                    formData.category === 'sleep'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-500'
                  }`}
                >
                  <Moon className="w-5 h-5 sm:hidden" />
                  <span className="hidden sm:inline text-sm font-medium">Sleep</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category: 'mood' }))}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-2 px-3 py-3 rounded-md border-2 transition-all ${
                    formData.category === 'mood'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-purple-400 dark:hover:border-purple-500'
                  }`}
                >
                  <Heart className="w-5 h-5 sm:hidden" />
                  <span className="hidden sm:inline text-sm font-medium">Mood</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category: 'pride' }))}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-2 px-3 py-3 rounded-md border-2 transition-all ${
                    formData.category === 'pride'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-green-400 dark:hover:border-green-500'
                  }`}
                >
                  <Smile className="w-5 h-5 sm:hidden" />
                  <span className="hidden sm:inline text-sm font-medium">Pride</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category: 'energy' }))}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-2 px-3 py-3 rounded-md border-2 transition-all ${
                    formData.category === 'energy'
                      ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-yellow-400 dark:hover:border-yellow-500'
                  }`}
                >
                  <Zap className="w-5 h-5 sm:hidden" />
                  <span className="hidden sm:inline text-sm font-medium">Energy</span>
                </button>
              </div>
            </div>

            {/* DATE */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date *
              </label>
              <DatePicker
                selected={formData.date}
                onChange={(date: Date) => setFormData(prev => ({ ...prev, date }))}
                maxDate={new Date()}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                dateFormat="MMM d, yyyy"
              />
            </div>

            {/* RATING */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Rating (1-10) *
              </label>
              <input
                type="number"
                name="rating"
                value={formData.rating}
                onChange={handleInputChange}
                min="1"
                max="10"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* NOTES */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="Add any notes or observations..."
              />
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-rose-500/80 dark:bg-indigo-500/80 backdrop-blur-sm border border-rose-600/50 dark:border-indigo-600/50 rounded-lg px-4 py-2 text-sm font-medium text-white dark:text-gray-200 hover:bg-rose-600/90 dark:hover:bg-indigo-600/90 focus:outline-none focus:ring-2 focus:ring-rose-500/50 dark:focus:ring-indigo-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : (entry ? 'Update Entry' : 'Create Entry')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}



