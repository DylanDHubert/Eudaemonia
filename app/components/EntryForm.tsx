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
    exercise: '',
    exerciseTime: '',
    alcohol: false,
    alcoholUnits: '',
    cannabis: false,
    cannabisAmount: '',
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle number inputs
    if (type === 'number') {
      // Allow empty value or valid number
      if (value === '' || (!isNaN(Number(value)) && Number(value) >= 0)) {
        setFormData(prev => ({
          ...prev,
          [name]: value === '' ? '' : Number(value)
        }));
      }
    } else {
      // Handle other inputs (text, select)
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCustomValueChange = (categoryId: string, value: string) => {
    setCustomValues(prev => ({
      ...prev,
      [categoryId]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    // Update the checkbox state
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
    
    // Reset related fields when unchecked
    if (!checked) {
      switch (name) {
        case 'exercise':
          setFormData(prev => ({ ...prev, exerciseTime: '' }));
          break;
        case 'meditation':
          setFormData(prev => ({ ...prev, meditationTime: '' }));
          break;
        case 'alcohol':
          setFormData(prev => ({ ...prev, alcoholUnits: '' }));
          break;
        case 'cannabis':
          setFormData(prev => ({ ...prev, cannabisAmount: '' }));
          break;
      }
    }
  };

  const submitEntry = async (overwrite = false) => {
    setIsLoading(true);
    setError('');
    
    try {
      // Validate required fields
      const requiredFields = {
        sleepHours: 'Sleep hours',
        sleepQuality: 'Sleep quality',
        stressLevel: 'Stress level',
        happinessRating: 'Happiness rating'
      };

      for (const [field, label] of Object.entries(requiredFields)) {
        if (!formData[field as keyof typeof formData]) {
          throw new Error(`${label} is required`);
        }
      }

      // Prepare the data with proper type conversions
      const processedFormData = {
        ...formData,
        sleepHours: formData.sleepHours ? parseFloat(formData.sleepHours) : null,
        sleepQuality: formData.sleepQuality ? parseInt(formData.sleepQuality) : null,
        exercise: formData.exercise ? parseFloat(formData.exercise) : null,
        exerciseTime: formData.exerciseTime ? parseInt(formData.exerciseTime) : null,
        alcohol: formData.alcohol,
        alcoholUnits: formData.alcoholUnits ? parseFloat(formData.alcoholUnits) : null,
        cannabis: formData.cannabis,
        cannabisAmount: formData.cannabisAmount ? parseInt(formData.cannabisAmount) : null,
        meditation: formData.meditation,
        meditationTime: formData.meditationTime ? parseInt(formData.meditationTime) : null,
        socialTime: formData.socialTime ? parseFloat(formData.socialTime) : null,
        workHours: formData.workHours ? parseFloat(formData.workHours) : null,
        stressLevel: formData.stressLevel ? parseInt(formData.stressLevel) : null,
        happinessRating: formData.happinessRating ? parseInt(formData.happinessRating) : null,
        meals: formData.meals ? parseInt(formData.meals) : null,
        foodQuality: formData.foodQuality ? parseInt(formData.foodQuality) : null,
      };

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
          ...processedFormData,
          date: date.toISOString(),
          customCategoryEntries
        })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit entry. Please check your input values.');
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
        exercise: '',
        exerciseTime: '',
        alcohol: false,
        alcoholUnits: '',
        cannabis: false,
        cannabisAmount: '',
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
      const errorMessage = err.message || 'Failed to submit entry';
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "bottom-right",
        autoClose: 5000
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

  const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    e.currentTarget.blur();
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
            <span className="block sm:inline text-input">{error}</span>
          </div>
        )}
        
        <div className="glass-card p-4 relative">
          <label className="text-subheader block mb-2">
            Date
          </label>
          <div 
            className="glass-input w-full px-3 py-2 cursor-pointer flex items-center text-input"
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-4">
            <label className="text-subheader block mb-2">
              Sleep Hours
            </label>
            <input
              type="number"
              name="sleepHours"
              value={formData.sleepHours}
              onChange={handleChange}
              onWheel={handleWheel}
              className="glass-input w-full px-3 py-2 text-input"
              required
              min="0"
              max="24"
              step="0.5"
            />
          </div>
          
          <div className="glass-card p-4">
            <label className="text-subheader block mb-2">
              Sleep Quality
            </label>
            <input
              type="number"
              name="sleepQuality"
              value={formData.sleepQuality}
              onChange={handleChange}
              onWheel={handleWheel}
              className="glass-input w-full px-3 py-2 text-input"
              required
              min="1"
              max="10"
            />
          </div>
          
          <div className="glass-card p-4">
            <label className="text-subheader block mb-2">
              Exercise
            </label>
            <input
              type="number"
              name="exercise"
              value={formData.exercise}
              onChange={handleChange}
              onWheel={handleWheel}
              className="glass-input w-full px-3 py-2 text-input"
              min="0"
              max="24"
              step="0.5"
            />
          </div>
          
          <div className="glass-card p-4">
            <div className="flex items-center justify-between h-10">
              <div className="flex items-center gap-4">
                <label className="text-subheader whitespace-nowrap">
                  Meditation
                </label>
                <div className="flex items-center whitespace-nowrap">
                  <input
                    type="checkbox"
                    name="meditation"
                    checked={formData.meditation}
                    onChange={handleCheckboxChange}
                    className="mr-2"
                  />
                  <span className="text-input">Yes</span>
                </div>
              </div>
              {formData.meditation && (
                <input
                  type="number"
                  name="meditationTime"
                  value={formData.meditationTime}
                  onChange={handleChange}
                  onWheel={handleWheel}
                  className="glass-input w-24 h-10 px-3 py-0 m-0 text-input"
                  min="1"
                  max="480"
                />
              )}
            </div>
          </div>
          
          <div className="glass-card p-4">
            <div className="flex items-center justify-between h-10">
              <div className="flex items-center gap-4">
                <label className="text-subheader whitespace-nowrap">
                  Alcohol
                </label>
                <div className="flex items-center whitespace-nowrap">
                  <input
                    type="checkbox"
                    name="alcohol"
                    checked={formData.alcohol}
                    onChange={handleCheckboxChange}
                    className="mr-2"
                  />
                  <span className="text-input">Yes</span>
                </div>
              </div>
              {formData.alcohol && (
                <input
                  type="number"
                  name="alcoholUnits"
                  value={formData.alcoholUnits}
                  onChange={handleChange}
                  onWheel={handleWheel}
                  className="glass-input w-24 h-10 px-3 py-0 m-0 text-input"
                  min="0.5"
                  max="30"
                  step="0.5"
                />
              )}
            </div>
          </div>
          
          <div className="glass-card p-4">
            <div className="flex items-center justify-between h-10">
              <div className="flex items-center gap-4">
                <label className="text-subheader whitespace-nowrap">
                  Cannabis
                </label>
                <div className="flex items-center whitespace-nowrap">
                  <input
                    type="checkbox"
                    name="cannabis"
                    checked={formData.cannabis}
                    onChange={handleCheckboxChange}
                    className="mr-2"
                  />
                  <span className="text-input">Yes</span>
                </div>
              </div>
              {formData.cannabis && (
                <select
                  name="cannabisAmount"
                  value={formData.cannabisAmount}
                  onChange={handleChange}
                  className="glass-input w-24 h-10 px-3 py-0 m-0 text-input"
                >
                  <option value="">Amount</option>
                  <option value="1">Light</option>
                  <option value="2">Moderate</option>
                  <option value="3">Heavy</option>
                </select>
              )}
            </div>
          </div>
          
          <div className="glass-card p-4">
            <label className="text-subheader block mb-2">
              Social Time
            </label>
            <input
              type="number"
              name="socialTime"
              value={formData.socialTime}
              onChange={handleChange}
              onWheel={handleWheel}
              className="glass-input w-full px-3 py-2 text-input"
              min="0"
              max="24"
              step="0.5"
            />
          </div>
          
          <div className="glass-card p-4">
            <label className="text-subheader block mb-2">
              Work Hours
            </label>
            <input
              type="number"
              name="workHours"
              value={formData.workHours}
              onChange={handleChange}
              onWheel={handleWheel}
              className="glass-input w-full px-3 py-2 text-input"
              min="0"
              max="24"
              step="0.5"
            />
          </div>
          
          <div className="glass-card p-4">
            <label className="text-subheader block mb-2">
              Meals
            </label>
            <input
              type="number"
              name="meals"
              value={formData.meals}
              onChange={handleChange}
              onWheel={handleWheel}
              className="glass-input w-full px-3 py-2 text-input"
              min="0"
              max="10"
            />
          </div>
          
          <div className="glass-card p-4">
            <label className="text-subheader block mb-2">
              Food Quality
            </label>
            <input
              type="number"
              name="foodQuality"
              value={formData.foodQuality}
              onChange={handleChange}
              onWheel={handleWheel}
              className="glass-input w-full px-3 py-2 text-input"
              min="1"
              max="10"
            />
          </div>
          
          <div className="glass-card p-4">
            <label className="text-subheader block mb-2">
              Stress Level
            </label>
            <input
              type="number"
              name="stressLevel"
              value={formData.stressLevel}
              onChange={handleChange}
              onWheel={handleWheel}
              className="glass-input w-full px-3 py-2 text-input"
              required
              min="1"
              max="10"
            />
          </div>
          
          <div className="glass-card p-4">
            <label className="text-subheader block mb-2">
              Happiness Rating
            </label>
            <input
              type="number"
              name="happinessRating"
              value={formData.happinessRating}
              onChange={handleChange}
              onWheel={handleWheel}
              className="glass-input w-full px-3 py-2 text-input"
              required
              min="1"
              max="10"
            />
          </div>
        </div>
        
        {/* Custom Categories Section */}
        {customCategories.length > 0 && (
          <div className="glass-card p-4">
            <h3 className="text-subheader mb-4">Custom Categories</h3>
            <div className={`grid grid-cols-1 gap-6 ${
              customCategories.length % 3 === 0 ? 'md:grid-cols-3' : 
              customCategories.length % 3 === 1 ? 'md:grid-cols-2' : 
              'md:grid-cols-1'
            }`}>
              {customCategories.map((category) => (
                <div key={category.id} className="glass-card p-4">
                  <label className="text-subheader block mb-2">
                    {category.name}
                  </label>
                  {category.type === 'numeric' && (
                    <input
                      type="number"
                      value={customValues[category.id] || ''}
                      onChange={(e) => handleCustomValueChange(category.id, e.target.value)}
                      onWheel={handleWheel}
                      className="glass-input w-full px-3 py-2 text-input"
                      min={category.min || 0}
                      max={category.max || 100}
                      step="0.1"
                    />
                  )}
                  {category.type === 'scale' && (
                    <input
                      type="number"
                      value={customValues[category.id] || ''}
                      onChange={(e) => handleCustomValueChange(category.id, e.target.value)}
                      onWheel={handleWheel}
                      className="glass-input w-full px-3 py-2 text-input"
                      min="1"
                      max="10"
                    />
                  )}
                  {category.type === 'boolean' && (
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={customValues[category.id] === 'true'}
                        onChange={(e) => handleCustomValueChange(category.id, e.target.checked.toString())}
                        className="mr-2"
                      />
                      <span className="text-input">Yes</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="glass-card p-4">
          <label className="text-subheader block mb-2">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="glass-input w-full px-3 py-2 text-input"
            rows={4}
          />
        </div>
        
        <div>
          <button
            type="submit"
            className="glass-button w-full"
          >
            Save Entry
          </button>
        </div>
      </form>
    </>
  );
} 