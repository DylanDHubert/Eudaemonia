'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import EditEntryModal from '../components/EditEntryModal';
import { Entry } from '../types/entry';
import { useRouter } from 'next/navigation';

interface CustomCategory {
  id: string;
  name: string;
  type: 'numeric' | 'scale' | 'boolean';
  value: number;
}

interface CustomCategoryEntry {
  id: string;
  value: number;
  customCategory: CustomCategory;
}

interface HistoryViewProps {
  entries: Entry[];
}

export default function HistoryView({ entries }: HistoryViewProps) {
  const router = useRouter();
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleEditClick = (entry: Entry) => {
    setSelectedEntry(entry);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (entry: Entry) => {
    setSelectedEntry(entry);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteEntry = async () => {
    if (!selectedEntry) return;
    
    setIsDeleting(true);
    setDeleteError(null);
    
    try {
      const response = await fetch(`/api/entries/${selectedEntry.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete entry');
      }
      
      // Close the modal and refresh the page
      setIsDeleteModalOpen(false);
      setSelectedEntry(null);
      router.refresh();
    } catch (error) {
      console.error('Error deleting entry:', error);
      setDeleteError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-6">
        {entries.map((entry) => (
          <div key={entry.id} className="glass-card p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {format(new Date(entry.date), 'MMMM d, yyyy')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {format(new Date(entry.date), 'EEEE')}
                </p>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleEditClick(entry)}
                  className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteClick(entry)}
                  className="text-rose-600 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-300"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Sleep</p>
                <p className="text-gray-900 dark:text-gray-100">
                  {entry.sleepHours} hours ({entry.sleepQuality}/10)
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Exercise</p>
                <p className="text-gray-900 dark:text-gray-100">
                  {entry.exercise ? 'Yes' : 'No'}
                  {entry.exerciseTime && ` (${entry.exerciseTime} min)`}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Alcohol</p>
                <p className="text-gray-900 dark:text-gray-100">
                  {entry.alcohol ? 'Yes' : 'No'}
                  {entry.alcoholUnits && ` (${entry.alcoholUnits} units)`}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Cannabis</p>
                <p className="text-gray-900 dark:text-gray-100">
                  {entry.cannabis ? 'Yes' : 'No'}
                  {entry.cannabisAmount && ` (${entry.cannabisAmount}/5)`}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Meditation</p>
                <p className="text-gray-900 dark:text-gray-100">
                  {entry.meditation ? 'Yes' : 'No'}
                  {entry.meditationTime && ` (${entry.meditationTime} min)`}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Social Time</p>
                <p className="text-gray-900 dark:text-gray-100">
                  {entry.socialTime ? `${entry.socialTime} hours` : 'N/A'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Work Hours</p>
                <p className="text-gray-900 dark:text-gray-100">
                  {entry.workHours ? `${entry.workHours} hours` : 'N/A'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Meals</p>
                <p className="text-gray-900 dark:text-gray-100">
                  {entry.meals ? `${entry.meals} meals` : 'N/A'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Food Quality</p>
                <p className="text-gray-900 dark:text-gray-100">
                  {entry.foodQuality ? `${entry.foodQuality}/10` : 'N/A'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Stress Level</p>
                <p className="text-gray-900 dark:text-gray-100">{entry.stressLevel}/10</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Happiness</p>
                <p className="text-gray-900 dark:text-gray-100">{entry.happinessRating}/10</p>
              </div>

              {entry.customCategoryEntries.map((categoryEntry) => (
                <div key={categoryEntry.id}>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{categoryEntry.customCategory.name}</p>
                  <p className="text-gray-900 dark:text-gray-100">
                    {categoryEntry.customCategory.type === 'scale' ? `${categoryEntry.value}/10` : categoryEntry.value}
                  </p>
                </div>
              ))}

              {entry.notes && (
                <div className="col-span-full">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Notes</p>
                  <p className="text-gray-900 dark:text-gray-100">{entry.notes}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedEntry && (
        <EditEntryModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedEntry(null);
          }}
          entry={selectedEntry}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedEntry && (
        <div className="fixed inset-0 bg-black/50 dark:bg-gray-900/70 flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 max-w-md w-full rounded-lg">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Delete Entry
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete the entry from {format(new Date(selectedEntry.date), 'MMMM d, yyyy')}? This action cannot be undone.
            </p>
            
            {deleteError && (
              <div className="mb-4 p-3 bg-rose-100 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-md text-rose-800 dark:text-rose-300 text-sm">
                {deleteError}
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteEntry}
                className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition-colors"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 