'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import QuickEntryModal from './QuickEntryModal';
import { format } from 'date-fns';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Moon, Heart, Smile, Zap, Plus, Maximize2, Minimize2 } from 'lucide-react';

type QuickEntry = {
  id: string;
  category: 'sleep' | 'mood' | 'pride' | 'energy';
  rating: number;
  notes: string | null;
  date: string;
  createdAt: string;
  updatedAt: string;
};

type FilterOption = 'all' | 'sleep' | 'mood' | 'pride' | 'energy';

export default function QuickEntryList({ initialEntries }: { initialEntries: QuickEntry[] }) {
  const [entries, setEntries] = useState<QuickEntry[]>(initialEntries);
  const [filter, setFilter] = useState<FilterOption>('all');
  const [viewMode, setViewMode] = useState<'expanded' | 'collapsed'>('expanded');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<QuickEntry | null>(null);
  const router = useRouter();

  // SET DEFAULT VIEW MODE BASED ON SCREEN SIZE
  useEffect(() => {
    const checkScreenSize = () => {
      const isMobile = window.innerWidth < 640; // sm breakpoint
      setViewMode(isMobile ? 'collapsed' : 'expanded');
    };

    // INITIAL CHECK
    checkScreenSize();

    // LISTEN FOR RESIZE
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // FETCH ENTRIES WITH FILTER
  const fetchEntries = async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('category', filter);
      }
      params.append('sortBy', 'date');
      params.append('sortOrder', 'desc');

      const response = await fetch(`/api/quick-entries?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch entries');

      const data = await response.json();
      setEntries(data.entries || []);
    } catch (error) {
      console.error('Error fetching entries:', error);
      toast.error('Failed to load entries');
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [filter]);

  const handleCreate = () => {
    setEditingEntry(null);
    setIsModalOpen(true);
  };

  const handleEdit = (entry: QuickEntry) => {
    setEditingEntry(entry);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) {
      return;
    }

    try {
      const response = await fetch(`/api/quick-entries/${id}`, {
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sleep':
        return <Moon className="w-4 h-4" />;
      case 'mood':
        return <Heart className="w-4 h-4" />;
      case 'pride':
        return <Smile className="w-4 h-4" />;
      case 'energy':
        return <Zap className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'sleep':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200';
      case 'mood':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200';
      case 'pride':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
      case 'energy':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'sleep':
        return 'bg-blue-500';
      case 'mood':
        return 'bg-purple-500';
      case 'pride':
        return 'bg-green-500';
      case 'energy':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  // HAPPINESS COLOR SCHEME FROM ACTIVITY HEATMAP (1-10 SCALE)
  const happinessColors: Record<string, string> = {
    '1': '#cc3258',  // Deep red
    '2': '#c12e6b',  // Deep rose
    '3': '#b72b7d',  // Deep magenta
    '4': '#ac2790',  // Deep purple
    '5': '#a123a2',  // Deep violet
    '6': '#9720b5',  // Violet
    '7': '#8c1cc7',  // Light violet
    '8': '#8118da',  // Light purple
    '9': '#7715ec',  // Very light purple
    '10': '#6c11ff'  // Lightest purple
  };

  // GET COLOR FOR RATING VALUE (1-10)
  const getRatingColor = (rating: number) => {
    if (rating == null || isNaN(rating) || rating < 1 || rating > 10) {
      return happinessColors['1'];
    }
    return happinessColors[rating.toString()] || happinessColors['1'];
  };

  return (
    <div>
      {/* CONTROLS */}
      <div className="mb-6 flex flex-row gap-1.5 sm:gap-3 items-center overflow-x-auto">
        {/* LEFT SIDE: NEW ENTRY AND VIEW TOGGLE */}
        <div className="flex flex-row gap-1.5 sm:gap-3 items-center flex-shrink-0">
          <button
            onClick={handleCreate}
            className="bg-rose-500/80 dark:bg-indigo-500/80 backdrop-blur-sm border border-rose-600/50 dark:border-indigo-600/50 rounded-lg px-2 sm:px-4 py-0 h-[28px] sm:h-[36px] text-xs sm:text-sm font-medium text-white dark:text-gray-200 hover:bg-rose-600/90 dark:hover:bg-indigo-600/90 focus:outline-none focus:ring-2 focus:ring-rose-500/50 dark:focus:ring-indigo-500/50 transition-all duration-200 whitespace-nowrap flex-shrink-0 flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Entry</span>
          </button>

          {/* VIEW TOGGLE */}
          <div className="flex items-center gap-0.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 p-0.5 flex-shrink-0 h-[28px] sm:h-[36px]">
            <button
              onClick={() => setViewMode('expanded')}
              className={`px-1.5 sm:px-2 py-0 h-full rounded text-xs font-medium transition-colors flex items-center justify-center ${
                viewMode === 'expanded'
                  ? 'bg-rose-500/80 dark:bg-indigo-500/80 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title="Expanded view"
            >
              <Maximize2 className="w-3.5 h-3.5 sm:hidden" />
              <span className="hidden sm:inline">Expanded</span>
            </button>
            <button
              onClick={() => setViewMode('collapsed')}
              className={`px-1.5 sm:px-2 py-0 h-full rounded text-xs font-medium transition-colors flex items-center justify-center ${
                viewMode === 'collapsed'
                  ? 'bg-rose-500/80 dark:bg-indigo-500/80 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title="Collapsed view"
            >
              <Minimize2 className="w-3.5 h-3.5 sm:hidden" />
              <span className="hidden sm:inline">Collapsed</span>
            </button>
          </div>
        </div>

        {/* RIGHT SIDE: FILTER */}
        <div className="flex flex-row gap-1.5 sm:gap-3 items-center flex-shrink-0 ml-auto">
          {/* FILTER */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">Filter:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterOption)}
              className="px-2 sm:px-3 py-1 sm:py-1.5 h-[28px] sm:h-[36px] border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-xs sm:text-sm"
            >
              <option value="all">All</option>
              <option value="sleep">Sleep</option>
              <option value="mood">Mood</option>
              <option value="pride">Pride</option>
              <option value="energy">Energy</option>
            </select>
          </div>
        </div>
      </div>

      {/* ENTRIES LIST */}
      {entries.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-description">No quick entries yet. Create your first entry to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            viewMode === 'collapsed' ? (
              // COLLAPSED VIEW
              <div
                key={entry.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* ICON WITH BADGE */}
                    <div className="relative flex-shrink-0">
                      <div className={`${getCategoryBadgeColor(entry.category)} rounded-full p-2 text-white`}>
                        {getCategoryIcon(entry.category)}
                      </div>
                    </div>

                    {/* RATING CIRCLE */}
                    <div className="flex-shrink-0">
                      <div
                        className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600"
                        style={{ backgroundColor: getRatingColor(entry.rating) }}
                        title={`Rating: ${entry.rating}`}
                      />
                    </div>
                    
                    {/* CATEGORY AND DATE */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate capitalize">
                        {entry.category}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {format(new Date(entry.date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-rose-600 dark:hover:text-indigo-400 hover:bg-rose-50 dark:hover:bg-indigo-900/20 rounded-md transition-colors"
                      title="Edit"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                      title="Delete"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // EXPANDED VIEW
              <div
                key={entry.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  {/* LEFT: MAIN INFO */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(entry.category)}`}>
                        {entry.category.charAt(0).toUpperCase() + entry.category.slice(1)}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {entry.rating} / 10
                      </span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {format(new Date(entry.date), 'MMM d, yyyy')}
                      </p>
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
            )
          ))}
        </div>
      )}

      {/* MODAL */}
      <QuickEntryModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        entry={editingEntry}
      />
    </div>
  );
}

