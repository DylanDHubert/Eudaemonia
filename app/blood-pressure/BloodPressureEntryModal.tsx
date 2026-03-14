'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { HeartPlus, HeartMinus, HeartPulse } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export type BloodPressureEntry = {
  id: string;
  date: string;
  systolic_1: number;
  diastolic_1: number;
  bpm_1: number;
  systolic_2: number;
  diastolic_2: number;
  bpm_2: number;
  systolic_3: number;
  diastolic_3: number;
  bpm_3: number;
  systolic_4: number;
  diastolic_4: number;
  bpm_4: number;
  systolic_5: number;
  diastolic_5: number;
  bpm_5: number;
  created_at: string;
  updated_at: string;
};

interface BloodPressureEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: BloodPressureEntry | null;
}

type ReadingState = {
  systolic: number | '';
  diastolic: number | '';
  bpm: number | '';
};

const emptyReading: ReadingState = { systolic: '', diastolic: '', bpm: '' };

export default function BloodPressureEntryModal({ isOpen, onClose, entry }: BloodPressureEntryModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [readings, setReadings] = useState<ReadingState[]>([
    { ...emptyReading },
    { ...emptyReading },
    { ...emptyReading },
    { ...emptyReading },
    { ...emptyReading },
  ]);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (entry) {
        setDate(new Date(entry.date + 'T12:00:00'));
        setReadings([
          { systolic: entry.systolic_1, diastolic: entry.diastolic_1, bpm: entry.bpm_1 },
          { systolic: entry.systolic_2, diastolic: entry.diastolic_2, bpm: entry.bpm_2 },
          { systolic: entry.systolic_3, diastolic: entry.diastolic_3, bpm: entry.bpm_3 },
          { systolic: entry.systolic_4, diastolic: entry.diastolic_4, bpm: entry.bpm_4 },
          { systolic: entry.systolic_5, diastolic: entry.diastolic_5, bpm: entry.bpm_5 },
        ]);
      } else {
        setDate(new Date());
        setReadings(Array(5).fill(null).map(() => ({ ...emptyReading })));
      }
    }
  }, [isOpen, entry]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const setReading = (index: number, field: keyof ReadingState, value: number | '') => {
    setReadings((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value === '' ? '' : Number(value) };
      return next;
    });
  };

  const buildPayload = () => {
    const dateStr = date.toISOString().split('T')[0];
    const payload: Record<string, number | string> = { date: dateStr };
    for (let i = 0; i < 5; i++) {
      const r = readings[i];
      payload[`systolic_${i + 1}`] = typeof r.systolic === 'number' ? r.systolic : parseInt(String(r.systolic), 10) || 0;
      payload[`diastolic_${i + 1}`] = typeof r.diastolic === 'number' ? r.diastolic : parseInt(String(r.diastolic), 10) || 0;
      payload[`bpm_${i + 1}`] = typeof r.bpm === 'number' ? r.bpm : parseInt(String(r.bpm), 10) || 0;
    }
    return payload;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    for (let i = 0; i < 5; i++) {
      const r = readings[i];
      if (r.systolic === '' || r.diastolic === '' || r.bpm === '') {
        toast.error(`Please fill all fields for reading ${i + 1}.`);
        return;
      }
    }
    setIsLoading(true);
    try {
      const url = entry ? `/api/blood-pressure-entries/${entry.id}` : '/api/blood-pressure-entries';
      const method = entry ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save');
      toast.success(entry ? 'Entry updated.' : 'Entry created.', { position: 'bottom-right', autoClose: 3000 });
      onClose();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save.', { position: 'bottom-right', autoClose: 5000 });
    } finally {
      setIsLoading(false);
    }
  };

  const modalContent = (
    <>
      <div
        className="fixed inset-0 z-[9999] bg-black/40 dark:bg-black/60"
        style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[10000] flex items-center justify-center px-4 pointer-events-none">
        <div
          className="glass-card p-4 sm:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-header text-gray-800 dark:text-gray-100">
              {entry ? 'Edit blood pressure' : 'New blood pressure'}
            </h2>
            <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-200">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date *</label>
              <DatePicker
                selected={date}
                onChange={(d: Date) => setDate(d)}
                maxDate={new Date()}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                dateFormat="MMM d, yyyy"
              />
            </div>

            {/* 5×3 GRID: ICON HEADERS + 5 ROWS OF INPUTS (SPACE BETWEEN ROWS) */}
            <div>
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
              <div className="space-y-2 mt-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  <input
                    type="number"
                    min={50}
                    max={250}
                    placeholder="120"
                    aria-label={`Row ${i + 1} systolic`}
                    value={readings[i].systolic === '' ? '' : readings[i].systolic}
                    onChange={(e) => setReading(i, 'systolic', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                    className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm text-center tabular-nums"
                  />
                  <input
                    type="number"
                    min={30}
                    max={180}
                    placeholder="80"
                    aria-label={`Row ${i + 1} diastolic`}
                    value={readings[i].diastolic === '' ? '' : readings[i].diastolic}
                    onChange={(e) => setReading(i, 'diastolic', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                    className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm text-center tabular-nums"
                  />
                  <input
                    type="number"
                    min={30}
                    max={250}
                    placeholder="72"
                    aria-label={`Row ${i + 1} bpm`}
                    value={readings[i].bpm === '' ? '' : readings[i].bpm}
                    onChange={(e) => setReading(i, 'bpm', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                    className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm text-center tabular-nums"
                  />
                </div>
              ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white/30 dark:bg-gray-700/30 border border-gray-300/50 dark:border-gray-600/50 hover:bg-white/50 dark:hover:bg-gray-700/50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-rose-500/80 dark:bg-indigo-500/80 hover:bg-rose-600/90 dark:hover:bg-indigo-600/90 disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : entry ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
