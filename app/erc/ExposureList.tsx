'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import ExposureEntryModal from './ExposureEntryModal';
import { format } from 'date-fns';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

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

type SortOption = 'date' | 'sudsPre' | 'sudsPeak' | 'sudsPost' | 'sudsAverage';
type FilterOption = 'all' | 'easy' | 'medium' | 'hard' | 'flight';

export default function ExposureList({ initialEntries }: { initialEntries: ExposureEntry[] }) {
  const [entries, setEntries] = useState<ExposureEntry[]>(initialEntries);
  const [filter, setFilter] = useState<FilterOption>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ExposureEntry | null>(null);
  const router = useRouter();

  // FETCH ENTRIES WITH FILTER AND SORT
  const fetchEntries = async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('type', filter);
      }
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const response = await fetch(`/api/exposure-entries?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch entries');

      const data = await response.json();
      setEntries(data.entries);
    } catch (error) {
      console.error('Error fetching entries:', error);
      toast.error('Failed to load entries');
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [filter, sortBy, sortOrder]);

  const handleCreate = () => {
    setEditingEntry(null);
    setIsModalOpen(true);
  };

  const handleEdit = (entry: ExposureEntry) => {
    setEditingEntry(entry);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) {
      return;
    }

    try {
      const response = await fetch(`/api/exposure-entries/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete entry');

      toast.success('Entry deleted successfully');
      router.refresh();
      fetchEntries();
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Failed to delete entry');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingEntry(null);
    router.refresh();
    fetchEntries();
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'easy':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200';
      case 'hard':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200';
      case 'flight':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
    }
  };

  const getAverageSUDS = (entry: ExposureEntry) => {
    return ((entry.sudsPre + entry.sudsPeak + entry.sudsPost) / 3).toFixed(1);
  };

  return (
    <div>
      {/* CONTROLS */}
      <div className="mb-6 flex flex-row flex-wrap gap-3 items-center justify-between">
        <button
          onClick={handleCreate}
          className="bg-rose-500/80 dark:bg-indigo-500/80 backdrop-blur-sm border border-rose-600/50 dark:border-indigo-600/50 rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white dark:text-gray-200 hover:bg-rose-600/90 dark:hover:bg-indigo-600/90 focus:outline-none focus:ring-2 focus:ring-rose-500/50 dark:focus:ring-indigo-500/50 transition-all duration-200 whitespace-nowrap"
        >
          + New Entry
        </button>

        <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
          {/* FILTER */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterOption)}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
            >
              <option value="all">All</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="flight">Flight</option>
            </select>
          </div>

          {/* SORT */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
            >
              <option value="date">Date</option>
              <option value="sudsPre">SUDS Pre</option>
              <option value="sudsPeak">SUDS Peak</option>
              <option value="sudsPost">SUDS Post</option>
              <option value="sudsAverage">SUDS Average</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
              title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* ENTRIES LIST */}
      {entries.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-description">No exposure entries yet. Create your first entry to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                {/* LEFT: MAIN INFO */}
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(entry.type)}`}>
                      {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {entry.title}
                    </h3>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {format(new Date(entry.date), 'MMM d, yyyy')}
                    </p>
                    {entry.duration !== null && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {entry.duration} min
                      </p>
                    )}
                  </div>

                  {/* SUDS VALUES */}
                  <div className="flex flex-wrap gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Pre:</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{entry.sudsPre}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Peak:</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{entry.sudsPeak}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Post:</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{entry.sudsPost}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Avg:</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{getAverageSUDS(entry)}</span>
                    </div>
                  </div>

                  {/* NOTES */}
                  {entry.notes && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                      {entry.notes}
                    </p>
                  )}
                </div>

                {/* RIGHT: ACTIONS */}
                <div className="flex items-start gap-2">
                  <button
                    onClick={() => handleEdit(entry)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-rose-600 dark:hover:text-indigo-400 hover:bg-rose-50 dark:hover:bg-indigo-900/20 rounded-md transition-colors"
                    title="Edit"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                    title="Delete"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      <ExposureEntryModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        entry={editingEntry}
      />
    </div>
  );
}

