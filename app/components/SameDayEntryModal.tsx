'use client';

import { useState } from 'react';
import { format } from 'date-fns';

type SameDayEntryModalProps = {
  date: string;
  onClose: () => void;
  onOverwrite: () => void;
  onContinue: () => void;
};

export default function SameDayEntryModal({ 
  date, 
  onClose, 
  onOverwrite, 
  onContinue 
}: SameDayEntryModalProps) {
  const formattedDate = format(new Date(date), 'MMMM d, yyyy');
  
  return (
    <div 
      className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={() => onClose()}
    >
      <div 
        className="glass-card p-4 w-full max-w-md mx-4"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-header mb-4">Entry Already Exists</h2>
        <p className="text-description mb-6">
          An entry already exists for {formattedDate}. Would you like to overwrite it or create a new entry?
        </p>
        <div className="flex space-x-4">
          <button
            onClick={onOverwrite}
            className="glass-button flex-1"
          >
            <span className="text-input">Overwrite</span>
          </button>
          <button
            onClick={onContinue}
            className="glass-button flex-1"
          >
            <span className="text-input">New Entry</span>
          </button>
        </div>
        
        <button
          onClick={onClose}
          className="w-full mt-4 flex justify-center py-2 px-4 bg-white/30 dark:bg-gray-700/30 backdrop-blur-sm border border-gray-300/50 dark:border-gray-600/50 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-rose-500/50 dark:focus:ring-indigo-500/50 transition-all duration-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
} 