'use client';

import React, { useState, useEffect } from 'react';
import { format, parseISO, subDays, eachDayOfInterval, getDay, isSameDay, isToday } from 'date-fns';

interface Entry {
  id: string;
  date: string;
  happinessRating: number;
  stressLevel: number;
}

export default function ActivityHeatmap() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchEntries() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/entries?limit=90`);
        const data = await response.json();
        if (data.entries) {
          setEntries(data.entries.map((entry: any) => ({
            id: entry.id,
            date: entry.date,
            happinessRating: entry.happinessRating,
            stressLevel: entry.stressLevel
          })));
        }
      } catch (error) {
        console.error('Error fetching entries:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEntries();
  }, []);

  // Generate the last 84 days (12 weeks exactly)
  const endDate = new Date();
  const startDate = subDays(endDate, 83); // 84 days including today
  const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

  // Day labels for the left side
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Reorganize days into full weeks
  const weeks: Date[][] = [];
  
  // Create 12 empty weeks
  for (let i = 0; i < 12; i++) {
    weeks.push(Array(7).fill(null));
  }
  
  // Fill the weeks with actual dates
  dateRange.forEach((date, index) => {
    const weekIndex = Math.floor(index / 7);
    const dayOfWeek = getDay(date);
    if (weekIndex < 12) {
      weeks[weekIndex][dayOfWeek] = date;
    }
  });

  // Get entry for a specific date
  const getEntryForDate = (date: Date | null) => {
    if (!date) return null;
    
    return entries.find(entry => {
      const entryDate = parseISO(entry.date);
      return isSameDay(entryDate, date);
    });
  };

  // Indigo color values for reference
  const indigoColors: Record<string, string> = {
    '50': '#eef2ff',
    '100': '#e0e7ff', 
    '200': '#c7d2fe',
    '300': '#a5b4fc',
    '400': '#818cf8',
    '500': '#6366f1',
    '600': '#4f46e5'
  };

  // Calculate background color for happiness (indigo scale)
  const getHappinessColor = (happiness: number) => {
    // Map happiness rating (1-10) to indigo colors
    if (happiness <= 1) return indigoColors['50'];
    if (happiness <= 3) return indigoColors['100'];
    if (happiness <= 5) return indigoColors['200'];
    if (happiness <= 6) return indigoColors['300'];
    if (happiness <= 7) return indigoColors['400'];
    if (happiness <= 8) return indigoColors['500'];
    return indigoColors['600']; // 9-10
  };

  // Calculate stress gradient height (from bottom)
  const getStressGradient = (stress: number) => {
    // Map stress (1-10) to gradient height percentage (max 50%)
    // 10 -> 50%, 5 -> 25%, 1-3 very subtle
    let percentage = 0;
    if (stress >= 1 && stress <= 3) {
      percentage = 5 + (stress - 1) * 5; // 5-15%
    } else if (stress > 3) {
      percentage = 15 + (stress - 3) * 5; // 15-50%
    }
    
    // Create a true gradient from transparent at top to red at bottom
    return `linear-gradient(to top, rgba(255, 0, 0, 0.9) 0%, rgba(255, 0, 0, 0) ${percentage}%)`;
  };

  // Get the appropriate class and styles for a cell
  const getCellStyle = (date: Date | null) => {
    if (!date) {
      return {
        className: 'day-cell',
        style: {}
      };
    }
    
    const entry = getEntryForDate(date);
    const isCurrentDay = isToday(date);
    
    if (!entry) {
      return {
        className: `day-cell no-data-cell${isCurrentDay ? ' today-cell' : ''}`,
        style: {}
      };
    }
    
    // Get colors based on happiness and stress
    const happinessColor = getHappinessColor(entry.happinessRating);
    const stressGradient = getStressGradient(entry.stressLevel);
    
    return {
      className: `day-cell${isCurrentDay ? ' today-cell' : ''}`,
      style: {
        backgroundColor: happinessColor,
        backgroundImage: stressGradient
      }
    };
  };

  // Tooltip content for a cell
  const getTooltipContent = (date: Date | null) => {
    if (!date) return '';
    
    const entry = getEntryForDate(date);
    if (!entry) return `No data for ${format(date, 'MMM d, yyyy')}`;
    
    return `${format(date, 'MMM d, yyyy')}: Happiness (indigo) ${entry.happinessRating}/10, Stress (red) ${entry.stressLevel}/10`;
  };

  if (isLoading) {
    return (
      <div className="glass-card p-6 animate-pulse">
        <div className="h-48 bg-gray-200 rounded"></div>
      </div>
    );
  }

  // Generate indigo color stops for happiness legend
  const generateIndigoColorStops = () => {
    return ['50', '100', '200', '300', '400', '500', '600'].map((shade) => (
      <div 
        key={`indigo-${shade}`} 
        className="h-4 flex-1" 
        style={{ backgroundColor: indigoColors[shade] }}
        title={`Indigo-${shade}`}
      />
    ));
  };

  return (
    <div className="glass-card p-4 sm:p-6 w-full max-w-fit overflow-x-auto">
      <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-center text-gray-800">Happiness & Stress Activity</h3>
      
      <div className="w-full flex justify-center min-w-[300px]">
        <div className="flex">
          {/* Day labels */}
          <div className="flex flex-col mr-2 text-xs text-gray-600 justify-between">
            {dayLabels.map((day) => (
              <div key={day} className="flex items-center justify-end w-6 sm:w-8 h-[24px]">
                {day}
              </div>
            ))}
          </div>
          
          {/* Heatmap grid */}
          <div className="grid-container pr-1">
            <div className="grid-display">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="week-column">
                  {week.map((day, dayIndex) => {
                    const { className, style } = getCellStyle(day);
                    return (
                      <div
                        key={`${weekIndex}-${dayIndex}`}
                        className={className}
                        style={style}
                        title={getTooltipContent(day)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Color legend */}
      <div className="mt-4 sm:mt-6 px-2 sm:px-4">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <div>Low</div>
          <div>Happiness Level (Indigo)</div>
          <div>High</div>
        </div>
        <div className="flex h-4 w-full rounded-sm overflow-hidden">
          {generateIndigoColorStops()}
        </div>
        
        <div className="mt-3 sm:mt-4 flex flex-wrap justify-center items-center gap-2 sm:gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 no-data-cell rounded-sm mr-1"></div>
            <span className="text-xs text-gray-600">No data</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-white today-cell rounded-sm mr-1"></div>
            <span className="text-xs text-gray-600">Today</span>
          </div>
          <div className="flex items-center">
            <div 
              className="w-4 h-4 rounded-sm mr-1" 
              style={{ 
                backgroundColor: 'white',
                backgroundImage: `linear-gradient(to top, rgba(255, 0, 0, 0.9) 0%, rgba(255, 0, 0, 0) 45%)`
              }}
            ></div>
            <span className="text-xs text-gray-600">Stress level</span>
          </div>
        </div>
      </div>
    </div>
  );
} 