'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import BloodPressureEntryModal, { type BloodPressureEntry } from './BloodPressureEntryModal';
import { formatEntryDate } from '@/lib/utils';
import { Plus, HeartPlus, HeartMinus, HeartPulse } from 'lucide-react';

// AHA-STYLE ZONES: NORMAL <120/<80, ELEVATED 120-129 AND diastolic <80, HIGH 130+ OR 80+
function getZone(systolic: number, diastolic: number): 'normal' | 'elevated' | 'high' {
  if (systolic >= 130 || diastolic >= 80) return 'high';
  if (systolic >= 120 && diastolic < 80) return 'elevated';
  return 'normal';
}

function zoneColor(zone: 'normal' | 'elevated' | 'high') {
  switch (zone) {
    case 'normal':
      return 'text-emerald-600 dark:text-emerald-400';
    case 'elevated':
      return 'text-amber-600 dark:text-amber-400';
    case 'high':
      return 'text-red-600 dark:text-red-400';
    default:
      return 'text-gray-700 dark:text-gray-300';
  }
}

function zoneBg(zone: 'normal' | 'elevated' | 'high') {
  switch (zone) {
    case 'normal':
      return 'bg-emerald-100 dark:bg-emerald-900/30';
    case 'elevated':
      return 'bg-amber-100 dark:bg-amber-900/30';
    case 'high':
      return 'bg-red-100 dark:bg-red-900/30';
    default:
      return 'bg-gray-100 dark:bg-gray-800';
  }
}

export default function BloodPressureList({ initialEntries }: { initialEntries: BloodPressureEntry[] }) {
  const [entries, setEntries] = useState<BloodPressureEntry[]>(initialEntries);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<BloodPressureEntry | null>(null);
  const router = useRouter();

  const fetchEntries = async () => {
    try {
      const res = await fetch('/api/blood-pressure-entries');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setEntries(data.entries || []);
    } catch {
      toast.error('Failed to load entries');
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleCreate = () => {
    setEditingEntry(null);
    setIsModalOpen(true);
  };

  const handleEdit = (entry: BloodPressureEntry) => {
    setEditingEntry(entry);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this day’s blood pressure entry?')) return;
    try {
      const res = await fetch(`/api/blood-pressure-entries/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Entry deleted');
      router.refresh();
      fetchEntries();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingEntry(null);
    router.refresh();
    fetchEntries();
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  };

  const getReadings = (entry: BloodPressureEntry) =>
    [1, 2, 3, 4, 5].map((i) => ({
      systolic: entry[`systolic_${i}` as keyof BloodPressureEntry] as number,
      diastolic: entry[`diastolic_${i}` as keyof BloodPressureEntry] as number,
      bpm: entry[`bpm_${i}` as keyof BloodPressureEntry] as number,
    }));

  const getAverage = (entry: BloodPressureEntry) => {
    const r = getReadings(entry);
    const sys = r.reduce((a, x) => a + x.systolic, 0) / 5;
    const dia = r.reduce((a, x) => a + x.diastolic, 0) / 5;
    const bpm = r.reduce((a, x) => a + x.bpm, 0) / 5;
    return { systolic: Math.round(sys), diastolic: Math.round(dia), bpm: Math.round(bpm) };
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={handleCreate}
          className="bg-rose-500/80 dark:bg-indigo-500/80 border border-rose-600/50 dark:border-indigo-600/50 rounded-lg px-4 py-2 text-sm font-medium text-white dark:text-gray-200 hover:bg-rose-600/90 dark:hover:bg-indigo-600/90 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New entry
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-description">No blood pressure entries yet. Add your first daily entry (5 readings) to get started.</p>
        </div>
      ) : (
        <div className="space-y-0.5">
          {entries.map((entry) => {
            const readings = getReadings(entry);
            const avg = getAverage(entry);
            const avgZone = getZone(avg.systolic, avg.diastolic);
            const dateKey = entry.date.split('T')[0] || entry.date;

            return (
              <div
                key={entry.id}
                className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-5 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
              >
                {/* HEADER: DATE + TIME LOGGED + ACTIONS (MATCH ERC / QUICK ENTRY) */}
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      {formatEntryDate(dateKey, 'MMM d, yyyy')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Logged at {formatTime(entry.updated_at)}
                    </p>
                  </div>
                  <div className="flex items-start gap-4 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEdit(entry)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(entry.id)}
                      className="text-xs text-rose-600 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* 5×3 GRID: SYMBOL HEADERS + 5 ROWS, ZONE COLOR PER ROW (SPACE BETWEEN ROWS) */}
                <div className="mb-3">
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-1">
                    <div className="flex items-center justify-center text-gray-500 dark:text-gray-400" title="Systolic">
                      <HeartPlus className="w-4 h-4" />
                    </div>
                    <div className="flex items-center justify-center text-gray-500 dark:text-gray-400" title="Diastolic">
                      <HeartMinus className="w-4 h-4" />
                    </div>
                    <div className="flex items-center justify-center text-gray-500 dark:text-gray-400" title="BPM">
                      <HeartPulse className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="space-y-2">
                  {readings.map((r, i) => {
                    const zone = getZone(r.systolic, r.diastolic);
                    return (
                      <div
                        key={i}
                        className={`grid grid-cols-3 gap-1.5 sm:gap-2 py-0.5 px-1.5 rounded text-center text-sm ${zoneBg(zone)}`}
                      >
                        <span className={`font-semibold tabular-nums ${zoneColor(zone)}`}>{r.systolic}</span>
                        <span className={`font-semibold tabular-nums ${zoneColor(zone)}`}>{r.diastolic}</span>
                        <span className={`font-semibold tabular-nums ${zoneColor(zone)}`}>{r.bpm}</span>
                      </div>
                    );
                  })}
                  </div>
                </div>

                {/* AVERAGE ROW WITH SYMBOLS */}
                <div className={`grid grid-cols-3 gap-1.5 sm:gap-2 py-1.5 px-2 rounded-lg text-center text-sm ${zoneBg(avgZone)}`}>
                  <span className={`font-semibold tabular-nums ${zoneColor(avgZone)}`}>{avg.systolic}</span>
                  <span className={`font-semibold tabular-nums ${zoneColor(avgZone)}`}>{avg.diastolic}</span>
                  <span className={`font-semibold tabular-nums ${zoneColor(avgZone)}`}>{avg.bpm}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <BloodPressureEntryModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        entry={editingEntry}
      />
    </div>
  );
}
