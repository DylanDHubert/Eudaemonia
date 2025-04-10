'use client';

import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface DatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  onDateChange: (date: Date) => void;
}

export default function DatePickerModal({ isOpen, onClose, date, onDateChange }: DatePickerModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(date);
  
  useEffect(() => {
    // When modal opens, set the initial date
    if (isOpen) {
      setSelectedDate(date);
    }
  }, [isOpen, date]);

  if (!isOpen) return null;

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const handleConfirm = () => {
    onDateChange(selectedDate);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  // Prevent click propagation on modal content
  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="fixed flex inset-0 items-start justify-center z-50 pt-6">
      <div className="glass-card p-6 max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-header">Select Date</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-indigo-500 dark:text-gray-400 dark:hover:text-indigo-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex justify-center">
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            inline
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
} 