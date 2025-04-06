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
      className="fixed inset-0 flex items-center justify-center z-[10000] bg-black/50"
      onClick={() => onClose()}
    >
      <div 
        className="bg-white/90 p-4 rounded-lg shadow-xl max-w-md w-auto overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-2">
          <h3 className="text-lg font-medium text-gray-900">Entry Already Exists</h3>
          <p className="mt-1 text-sm text-gray-500">
            You already have an entry for <span className="font-medium">{formattedDate}</span>. 
            What would you like to do?
          </p>
        </div>
        
        <div className="space-y-2">
          <button
            onClick={onOverwrite}
            className="glass-button w-full flex justify-center"
          >
            Overwrite Previous Entry
          </button>
          
          <button
            onClick={onContinue}
            className="w-full flex justify-center py-2 px-4 glassmorphism text-sm font-medium text-gray-700 hover:bg-white/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add As New Entry
          </button>
          
          <button
            onClick={onClose}
            className="w-full flex justify-center py-2 px-4 glassmorphism text-sm font-medium text-gray-700 hover:bg-white/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
} 