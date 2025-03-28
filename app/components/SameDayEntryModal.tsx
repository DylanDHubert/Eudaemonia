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
    <div className="fixed inset-0 bg-gray-600/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glassmorphism rounded-lg max-w-md w-full p-6 shadow-xl">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900">Entry Already Exists</h3>
          <p className="mt-2 text-sm text-gray-500">
            You already have an entry for <span className="font-medium">{formattedDate}</span>. 
            What would you like to do?
          </p>
        </div>
        
        <div className="space-y-3">
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