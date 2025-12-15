'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { CloudDrizzle, CloudHail, CloudRain, Plane } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

type ExposureEntry = {
  id: string;
  type: 'easy' | 'medium' | 'hard' | 'flight';
  title: string;
  notes: string | null;
  sudsPre: number;
  sudsPeak: number;
  sudsPost: number;
  duration: number | null;
  date: string;
  createdAt: string;
  updatedAt: string;
};

interface ExposureEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: ExposureEntry | null;
}

export default function ExposureEntryModal({ isOpen, onClose, entry }: ExposureEntryModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'easy' as 'easy' | 'medium' | 'hard' | 'flight',
    title: '',
    notes: '',
    sudsPre: 5,
    sudsPeak: 5,
    sudsPost: 5,
    duration: null as number | null,
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
          type: entry.type,
          title: entry.title,
          notes: entry.notes || '',
          sudsPre: entry.sudsPre,
          sudsPeak: entry.sudsPeak,
          sudsPost: entry.sudsPost,
          duration: entry.duration,
          date: new Date(entry.date),
        });
      } else {
        // CREATE MODE
        setFormData({
          type: 'easy',
          title: '',
          notes: '',
          sudsPre: 5,
          sudsPeak: 5,
          sudsPost: 5,
          duration: null,
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
      const url = entry ? `/api/exposure-entries/${entry.id}` : '/api/exposure-entries';
      const method = entry ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: formData.type,
          title: formData.title,
          notes: formData.notes || null,
          sudsPre: formData.sudsPre,
          sudsPeak: formData.sudsPeak,
          sudsPost: formData.sudsPost,
          duration: formData.duration,
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
      [name]: name === 'sudsPre' || name === 'sudsPeak' || name === 'sudsPost' 
        ? parseInt(value) || 0 
        : name === 'duration'
        ? value === '' ? null : parseInt(value) || null
        : value
    }));
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
              {entry ? 'Edit Entry' : 'New Exposure Entry'}
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
            {/* TYPE */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type *
              </label>
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'easy' }))}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-2 px-3 py-3 rounded-md border-2 transition-all ${
                    formData.type === 'easy'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-green-400 dark:hover:border-green-500'
                  }`}
                >
                  <CloudDrizzle className="w-5 h-5 sm:hidden" />
                  <span className="hidden sm:inline text-sm font-medium">Easy</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'medium' }))}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-2 px-3 py-3 rounded-md border-2 transition-all ${
                    formData.type === 'medium'
                      ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-yellow-400 dark:hover:border-yellow-500'
                  }`}
                >
                  <CloudHail className="w-5 h-5 sm:hidden" />
                  <span className="hidden sm:inline text-sm font-medium">Medium</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'hard' }))}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-2 px-3 py-3 rounded-md border-2 transition-all ${
                    formData.type === 'hard'
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-orange-400 dark:hover:border-orange-500'
                  }`}
                >
                  <CloudRain className="w-5 h-5 sm:hidden" />
                  <span className="hidden sm:inline text-sm font-medium">Hard</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'flight' }))}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-2 px-3 py-3 rounded-md border-2 transition-all ${
                    formData.type === 'flight'
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-red-400 dark:hover:border-red-500'
                  }`}
                >
                  <Plane className="w-5 h-5 sm:hidden" />
                  <span className="hidden sm:inline text-sm font-medium">Flight</span>
                </button>
              </div>
            </div>

            {/* TITLE */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="e.g., Airport visit, Short flight, etc."
              />
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

            {/* DURATION */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration || ''}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="Optional"
              />
            </div>

            {/* SUDS RATINGS */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  SUDS Pre (1-10) *
                </label>
                <input
                  type="number"
                  name="sudsPre"
                  value={formData.sudsPre}
                  onChange={handleInputChange}
                  min="1"
                  max="10"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  SUDS Peak (1-10) *
                </label>
                <input
                  type="number"
                  name="sudsPeak"
                  value={formData.sudsPeak}
                  onChange={handleInputChange}
                  min="1"
                  max="10"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  SUDS Post (1-10) *
                </label>
                <input
                  type="number"
                  name="sudsPost"
                  value={formData.sudsPost}
                  onChange={handleInputChange}
                  min="1"
                  max="10"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
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
                placeholder="Describe your experience, what you learned, or any observations..."
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

