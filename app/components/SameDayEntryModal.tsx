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
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
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
          className="w-full flex justify-center py-2 px-4 glassmorphism text-sm font-medium text-gray-700 hover:bg-white/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
      </div>
    </div>
  );
} 