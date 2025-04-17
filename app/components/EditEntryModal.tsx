'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Entry, CustomCategory, CustomCategoryEntry } from '../types/entry';

interface EditEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: Entry;
}

export default function EditEntryModal({ isOpen, onClose, entry }: EditEntryModalProps) {
  const [formData, setFormData] = useState(entry);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/entries/${entry.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          customCategoryEntries: formData.customCategoryEntries.map(category => ({
            customCategoryId: category.customCategory.id,
            value: category.value
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update entry');
      }

      toast.success('Entry updated successfully', {
        position: "bottom-right",
        autoClose: 3000
      });

      router.refresh();
      onClose();
    } catch (error) {
      console.error('Error updating entry:', error);
      toast.error('Failed to update entry. Please try again.', {
        position: "bottom-right",
        autoClose: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
              type === 'number' ? parseFloat(value) || null :
              value
    }));
  };

  const handleCustomCategoryChange = (categoryId: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      customCategoryEntries: prev.customCategoryEntries.map(category =>
        category.customCategory.id === categoryId ? { ...category, value } : category
      )
    }));
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="glass-card p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-header mb-4 text-gray-800 dark:text-gray-100">Edit Entry</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sleep Hours
              </label>
              <input
                type="number"
                name="sleepHours"
                value={formData.sleepHours}
                onChange={handleInputChange}
                step="0.1"
                min="0"
                max="24"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sleep Quality
              </label>
              <input
                type="number"
                name="sleepQuality"
                value={formData.sleepQuality}
                onChange={handleInputChange}
                min="1"
                max="10"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Exercise Time (minutes)
              </label>
              <input
                type="number"
                name="exerciseTime"
                value={formData.exerciseTime || ''}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Social Time (hours)
              </label>
              <input
                type="number"
                name="socialTime"
                value={formData.socialTime || ''}
                onChange={handleInputChange}
                step="0.1"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Work Hours
              </label>
              <input
                type="number"
                name="workHours"
                value={formData.workHours || ''}
                onChange={handleInputChange}
                step="0.1"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Stress Level
              </label>
              <input
                type="number"
                name="stressLevel"
                value={formData.stressLevel}
                onChange={handleInputChange}
                min="1"
                max="10"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Happiness Rating
              </label>
              <input
                type="number"
                name="happinessRating"
                value={formData.happinessRating}
                onChange={handleInputChange}
                min="1"
                max="10"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          {formData.customCategoryEntries.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Custom Categories</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.customCategoryEntries.map((category) => (
                  <div key={category.customCategory.id}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {category.customCategory.name}
                    </label>
                    <input
                      type="number"
                      value={category.value}
                      onChange={(e) => handleCustomCategoryChange(category.customCategory.id, parseFloat(e.target.value))}
                      min={category.customCategory.min ?? undefined}
                      max={category.customCategory.max ?? undefined}
                      step={category.customCategory.type === 'numeric' ? 1 : 0.1}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes || ''}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="flex justify-end space-x-4 mt-6">
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
              className="bg-rose-500/80 dark:bg-indigo-500/80 backdrop-blur-sm border border-rose-600/50 dark:border-indigo-600/50 rounded-lg px-4 py-2 text-sm font-medium text-white dark:text-gray-200 hover:bg-rose-600/90 dark:hover:bg-indigo-600/90 focus:outline-none focus:ring-2 focus:ring-rose-500/50 dark:focus:ring-indigo-500/50 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md dark:hover:shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 