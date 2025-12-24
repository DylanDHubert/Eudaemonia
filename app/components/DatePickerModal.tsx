'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import DatePicker from 'react-datepicker';
import { XMarkIcon } from '@heroicons/react/24/outline';
import "react-datepicker/dist/react-datepicker.css";

interface DatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  onDateChange: (date: Date) => void;
}

export default function DatePickerModal({ isOpen, onClose, date, onDateChange }: DatePickerModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(date);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSelectedDate(date);
    }
  }, [isOpen, date]);

  // PREVENT BODY SCROLL WHEN MODAL IS OPEN
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    onDateChange(date);
    onClose();
  };

  const modalContent = (
    <>
      {/* BACKDROP - COVERS ENTIRE SCREEN */}
      <div 
        className="fixed top-0 left-0 right-0 bottom-0 z-[9999] bg-black/40 dark:bg-black/60"
        style={{ 
          backdropFilter: 'blur(8px)', 
          WebkitBackdropFilter: 'blur(8px)',
          width: '100vw',
          height: '100vh',
          position: 'fixed'
        }}
        onClick={onClose}
      />
      
      {/* MODAL CONTENT */}
      <div 
        className="fixed inset-0 z-[10000] flex items-start justify-center pt-[20vh] px-4 pointer-events-none"
      >
        <div 
          className="glass-card p-4 w-auto max-w-md pointer-events-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex flex-col items-center gap-4">
            <h3 className="text-subheader">Select Date</h3>
            <div className="glass-card p-4 rounded-lg">
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                inline
                maxDate={new Date()}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
} 