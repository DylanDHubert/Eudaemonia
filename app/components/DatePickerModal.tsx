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
    <div className="fixed inset-0 flex items-center justify-center z-[10000] bg-black/50" onClick={onClose}>
      <div className="bg-white/90 p-4 rounded-lg shadow-xl max-w-md w-auto overflow-y-auto" onClick={handleModalContentClick}>
        <h2 className="text-xl font-semibold mb-2 text-gray-800">Select Date</h2>
        
        <div className="mx-auto flex justify-center mb-2">
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            inline
            calendarClassName="!bg-white/80 glassmorphism"
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <button 
            onClick={handleCancel} 
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm} 
            className="glass-button"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
} 