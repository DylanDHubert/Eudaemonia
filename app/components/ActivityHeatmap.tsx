'use client';

import React, { useState, useEffect } from 'react';
import { format, parseISO, subDays, eachDayOfInterval, getDay, isSameDay, isToday, addDays } from 'date-fns';

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

  // Generate the date range starting from the current week's Sunday
  const endDate = new Date();
  const currentDayOfWeek = getDay(endDate);
  // If we're past Sunday, get next Sunday, otherwise get this week's Sunday
  const daysUntilNextSunday = currentDayOfWeek === 0 ? 0 : 7 - currentDayOfWeek;
  const weekEndDate = addDays(endDate, daysUntilNextSunday);
  const startDate = subDays(weekEndDate, 83); // 84 days including the end date
  const dateRange = eachDayOfInterval({ start: startDate, end: weekEndDate });

  // Day labels for the left side
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Create a 7x12 grid (12 weeks, 7 days each)
  const weeks: Date[][] = Array(12).fill(null).map(() => Array(7).fill(null));
  const monthLabels: string[] = Array(12).fill('');
  
  // First, get all dates in chronological order
  const orderedDates = [...dateRange].sort((a, b) => a.getTime() - b.getTime());
  
  // Fill the grid from left to right, top to bottom
  let currentMonth = '';
  orderedDates.forEach((date, index) => {
    const weekIndex = Math.floor(index / 7);
    // Adjust dayIndex to make Sunday the last day (6) and Monday the first day (0)
    const dayOfWeek = getDay(date);
    const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    if (weekIndex < 12) {
      weeks[weekIndex][dayIndex] = date;
      
      // Track month changes - only set label if it's the first day of a new month
      const month = format(date, 'MMM');
      if (month !== currentMonth) {
        currentMonth = month;
        monthLabels[weekIndex] = month;
      }
    }
  });

  // Get entry for a specific date
  const getEntryForDate = (date: Date | null) => {
    if (!date) return null;
    
    return entries.find(entry => {
      const entryDate = parseISO(entry.date);
      // Normalize both dates to start of day for comparison
      const normalizedEntryDate = new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate());
      const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      return normalizedEntryDate.getTime() === normalizedDate.getTime();
    });
  };

  // Happiness color values for reference
  const happinessColors: Record<string, string> = {
    '1': '#cc3258',  // Deep red
    '2': '#c12e6b',  // Deep rose
    '3': '#b72b7d',  // Deep magenta
    '4': '#ac2790',  // Deep purple
    '5': '#a123a2',  // Deep violet
    '6': '#9720b5',  // Violet
    '7': '#8c1cc7',  // Light violet
    '8': '#8118da',  // Light purple
    '9': '#7715ec',  // Very light purple
    '10': '#6c11ff'  // Lightest purple
  };

  // Calculate background color for happiness
  const getHappinessColor = (happiness: number) => {
    // Map happiness rating (1-10) directly to colors
    return happinessColors[happiness.toString()] || happinessColors['1'];
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
    
    // Check if this is the first day of a month
    const isFirstDayOfMonth = date.getDate() === 1;
    
    if (!entry) {
      return {
        className: `day-cell no-data-cell${isCurrentDay ? ' today-cell' : ''}${isFirstDayOfMonth ? ' first-day-of-month' : ''}`,
        style: {}
      };
    }
    
    // Get colors based on happiness and stress
    const happinessColor = getHappinessColor(entry.happinessRating);
    const stressGradient = getStressGradient(entry.stressLevel);
    
    return {
      className: `day-cell${isCurrentDay ? ' today-cell' : ''}${isFirstDayOfMonth ? ' first-day-of-month' : ''}`,
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

  // Generate color stops for happiness legend
  const generateHappinessColorStops = () => {
    return Object.entries(happinessColors).map(([rating, color]) => (
      <div 
        key={`happiness-${rating}`} 
        className="h-4 flex-1" 
        style={{ backgroundColor: color }}
        title={`Rating ${rating}`}
      />
    ));
  };

  return (
    <div className="glass-card p-4 sm:p-6 w-full max-w-fit overflow-x-auto">
      <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-center text-gray-800">Happiness & Stress Activity</h3>
      
      <div className="w-full flex justify-center min-w-[300px]">
        <div className="flex flex-col">
          <div className="flex">
            {/* Day labels */}
            <div className="hidden sm:flex flex-col mr-3 text-xs text-gray-600">
              {dayLabels.map((day, index) => (
                <div key={day} className="flex items-center justify-end w-10 h-[24px] mb-[4px] sm:text-xs text-[10px] mt-[5px]">
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
                          className={`${className} mt-[10px]`}
                          style={style}
                          title={getTooltipContent(day)}
                        >
                          {day && (
                            <span className={`text-[6px] sm:text-[8px] absolute inset-0 flex items-center justify-center ${getEntryForDate(day) ? 'text-gray-300' : 'text-gray-500'}`}>
                              {format(day, 'd')}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Month labels - positioned at the bottom on desktop only */}
          <div className="hidden sm:flex text-xs text-gray-600 mt-2">
            <div className="w-10 mr-3"></div> {/* Spacer to align with day labels */}
            {monthLabels.map((month, index) => (
              <div key={index} className="flex-1 text-center">
                {month}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Color legend */}
      <div className="mt-4 sm:mt-6 px-2 sm:px-4">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <div>Low</div>
          <div>Happiness Level</div>
          <div>High</div>
        </div>
        <div className="flex h-4 w-full rounded-sm overflow-hidden">
          {generateHappinessColorStops()}
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