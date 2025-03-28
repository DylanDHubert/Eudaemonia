'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import SameDayEntryModal from './SameDayEntryModal';
import DatePickerModal from './DatePickerModal';
import { format } from 'date-fns';

type EntryFormProps = {
  userId: string;
};

export default function EntryForm({ userId }: EntryFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSameDayModal, setShowSameDayModal] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [existingEntryId, setExistingEntryId] = useState<string | null>(null);
  const [date, setDate] = useState(new Date());
  
  const [formData, setFormData] = useState({
    sleepHours: '',
    sleepQuality: '',
    exercise: false,
    exerciseTime: '',
    alcohol: false,
    alcoholUnits: '',
    weed: false,
    weedAmount: '',
    meditation: false,
    meditationTime: '',
    socialTime: '',
    workHours: '',
    stressLevel: '',
    happinessRating: '',
    meals: '',
    foodQuality: '',
    notes: ''
  });

  const [customCategories, setCustomCategories] = useState<any[]>([]);
  const [customValues, setCustomValues] = useState<Record<string, string>>({});

  // Check if an entry already exists for the selected date
  useEffect(() => {
    const checkExistingEntry = async () => {
      try {
        const response = await fetch(`/api/entries?date=${date.toISOString().split('T')[0]}`);
        if (response.ok) {
          const data = await response.json();
          if (data.entries && data.entries.length > 0) {
            setExistingEntryId(data.entries[0].id);
          } else {
            setExistingEntryId(null);
          }
        }
      } catch (error) {
        console.error('Error checking existing entry:', error);
      }
    };

    if (date) {
      checkExistingEntry();
    }
  }, [date]);

  // Fetch custom categories when component mounts
  useEffect(() => {
    const fetchCustomCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCustomCategories(data);
        }
      } catch (error) {
        console.error('Error fetching custom categories:', error);
      }
    };

    fetchCustomCategories();
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleCustomValueChange = (categoryId: string, value: string) => {
    setCustomValues(prev => ({
      ...prev,
      [categoryId]: value
    }));
  };

  const submitEntry = async (overwrite = false) => {
    setIsLoading(true);
    setError('');
    
    try {
      const url = overwrite && existingEntryId 
        ? `/api/entries/${existingEntryId}` 
        : '/api/entries';
      
      const method = overwrite && existingEntryId ? 'PUT' : 'POST';
      
      const customCategoryEntries = customCategories.map(category => ({
        customCategoryId: category.id,
        value: parseFloat(customValues[category.id] || '0')
      })).filter(entry => !isNaN(entry.value));
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          date: date.toISOString(),
          customCategoryEntries
        })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Something went wrong');
      }
      
      // Show success toast
      toast.success(overwrite 
        ? 'Entry updated successfully!' 
        : 'Entry recorded successfully!', {
        position: "bottom-right",
        autoClose: 3000
      });
      
      // Reset form values that should be reset after submission
      setFormData(prev => ({
        ...prev,
        sleepHours: '',
        sleepQuality: '',
        exercise: false,
        exerciseTime: '',
        alcohol: false,
        alcoholUnits: '',
        weed: false,
        weedAmount: '',
        meditation: false,
        meditationTime: '',
        socialTime: '',
        workHours: '',
        stressLevel: '',
        happinessRating: '',
        meals: '',
        foodQuality: '',
        notes: ''
      }));
      
      // Reset custom values
      setCustomValues({});
      
      // Refresh page data
      router.refresh();
      
    } catch (err: any) {
      setError(err.message || 'Failed to submit entry');
      toast.error(err.message || 'Failed to submit entry', {
        position: "bottom-right",
        autoClose: 3000
      });
      console.error('Entry submission error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // If an entry already exists for this date, show the modal
    if (existingEntryId && !showSameDayModal) {
      setShowSameDayModal(true);
      return;
    }
    
    // Otherwise submit normally
    await submitEntry();
  };

  const handleOverwrite = async () => {
    setShowSameDayModal(false);
    await submitEntry(true);
  };

  const handleContinue = async () => {
    setShowSameDayModal(false);
    await submitEntry(false);
  };

  // Handle date picker click
  const handleDateClick = () => {
    setDatePickerOpen(true);
  };

  return (
    <>
      <DatePickerModal 
        isOpen={datePickerOpen} 
        onClose={() => setDatePickerOpen(false)}
        date={date}
        onDateChange={setDate}
      />
      
      {showSameDayModal && (
        <SameDayEntryModal 
          date={date.toISOString().split('T')[0]}
          onClose={() => setShowSameDayModal(false)}
          onOverwrite={handleOverwrite}
          onContinue={handleContinue}
        />
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <div className="glass-card p-4 relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date
          </label>
          <div 
            className="glass-input w-full px-3 py-2 cursor-pointer flex items-center"
            onClick={handleDateClick}
          >
            <span>{format(date, 'MMMM d, yyyy')}</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 ml-auto text-gray-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sleep Hours
            </label>
            <input
              type="number"
              name="sleepHours"
              value={formData.sleepHours}
              onChange={handleChange}
              className="glass-input w-full px-3 py-2"
              required
              min="0"
              max="24"
              step="0.5"
            />
          </div>
          
          <div className="glass-card p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sleep Quality (1-10)
            </label>
            <input
              type="number"
              name="sleepQuality"
              value={formData.sleepQuality}
              onChange={handleChange}
              className="glass-input w-full px-3 py-2"
              required
              min="1"
              max="10"
            />
          </div>
          
          <div className="glass-card p-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="exercise"
                checked={formData.exercise}
                onChange={handleChange}
                className="glass-input h-4 w-4 text-rose-500 focus:ring-rose-500 border-rose-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Exercise</span>
            </label>
            {formData.exercise && (
              <input
                type="number"
                name="exerciseTime"
                value={formData.exerciseTime}
                onChange={handleChange}
                className="glass-input mt-2 w-full px-3 py-2"
                placeholder="Minutes"
                min="0"
              />
            )}
          </div>
          
          <div className="glass-card p-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="alcohol"
                checked={formData.alcohol}
                onChange={handleChange}
                className="glass-input h-4 w-4 text-rose-500 focus:ring-rose-500 border-rose-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Alcohol</span>
            </label>
            {formData.alcohol && (
              <input
                type="number"
                name="alcoholUnits"
                value={formData.alcoholUnits}
                onChange={handleChange}
                className="glass-input mt-2 w-full px-3 py-2"
                placeholder="Units"
                min="0"
                step="0.5"
              />
            )}
          </div>
          
          <div className="glass-card p-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="weed"
                checked={formData.weed}
                onChange={handleChange}
                className="glass-input h-4 w-4 text-rose-500 focus:ring-rose-500 border-rose-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Weed</span>
            </label>
            {formData.weed && (
              <input
                type="number"
                name="weedAmount"
                value={formData.weedAmount}
                onChange={handleChange}
                className="glass-input mt-2 w-full px-3 py-2"
                placeholder="Amount (1-5)"
                min="1"
                max="5"
              />
            )}
          </div>
          
          <div className="glass-card p-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="meditation"
                checked={formData.meditation}
                onChange={handleChange}
                className="glass-input h-4 w-4 text-rose-500 focus:ring-rose-500 border-rose-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Meditation</span>
            </label>
            {formData.meditation && (
              <input
                type="number"
                name="meditationTime"
                value={formData.meditationTime}
                onChange={handleChange}
                className="glass-input mt-2 w-full px-3 py-2"
                placeholder="Minutes"
                min="0"
              />
            )}
          </div>
          
          <div className="glass-card p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Social Time (minutes)
            </label>
            <input
              type="number"
              name="socialTime"
              value={formData.socialTime}
              onChange={handleChange}
              className="glass-input w-full px-3 py-2"
              min="0"
            />
          </div>
          
          <div className="glass-card p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Work Hours
            </label>
            <input
              type="number"
              name="workHours"
              value={formData.workHours}
              onChange={handleChange}
              className="glass-input w-full px-3 py-2"
              min="0"
              max="24"
              step="0.5"
            />
          </div>
          
          <div className="glass-card p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Meals
            </label>
            <input
              type="number"
              name="meals"
              value={formData.meals}
              onChange={handleChange}
              className="glass-input w-full px-3 py-2"
              min="0"
              max="10"
              placeholder="How many meals did you have today?"
            />
          </div>
          
          <div className="glass-card p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Food Quality (1-10)
            </label>
            <input
              type="number"
              name="foodQuality"
              value={formData.foodQuality}
              onChange={handleChange}
              className="glass-input w-full px-3 py-2"
              min="1"
              max="10"
              placeholder="Rate your food quality"
            />
          </div>
          
          {/* Custom Categories */}
          {customCategories.length > 0 && (
            <div className="col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Custom Categories</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customCategories.map((category) => (
                  <div key={category.id} className="glass-card p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {category.name}
                    </label>
                    {category.description && (
                      <p className="text-sm text-gray-500 mb-2">{category.description}</p>
                    )}
                    {category.type === 'boolean' ? (
                      <div className="mt-2">
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            checked={customValues[category.id] === '1'}
                            onChange={(e) => handleCustomValueChange(category.id, e.target.checked ? '1' : '0')}
                            className="glass-input h-4 w-4 text-rose-500 focus:ring-rose-500 border-rose-300 rounded"
                          />
                          <span className="ml-2 text-gray-700">Yes</span>
                        </label>
                      </div>
                    ) : (
                      <input
                        type="number"
                        value={customValues[category.id] || ''}
                        onChange={(e) => handleCustomValueChange(category.id, e.target.value)}
                        className="glass-input w-full px-3 py-2"
                        min={category.type === 'scale' ? 1 : undefined}
                        max={category.type === 'scale' ? 10 : undefined}
                        placeholder={category.type === 'scale' ? '1-10' : 'Enter value'}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="glass-card p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stress Level (1-10)
          </label>
          <input
            type="number"
            name="stressLevel"
            value={formData.stressLevel}
            onChange={handleChange}
            className="glass-input w-full px-3 py-2"
            required
            min="1"
            max="10"
          />
        </div>
        
        <div className="glass-card p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Happiness Rating (1-10)
          </label>
          <input
            type="number"
            name="happinessRating"
            value={formData.happinessRating}
            onChange={handleChange}
            className="glass-input w-full px-3 py-2"
            required
            min="1"
            max="10"
          />
        </div>
        
        <div className="glass-card p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="glass-input w-full px-3 py-2"
            rows={4}
            placeholder="Any additional notes about your day..."
          />
        </div>
        
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="glass-button w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              'Save Entry'
            )}
          </button>
        </div>
      </form>
    </>
  );
} 