'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format, parseISO } from 'date-fns';
import { Entry } from '../types/entry';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// SET DEFAULT FONT FOR ALL CHARTS
ChartJS.defaults.font.family = "'IM Fell Great Primer SC', serif";
ChartJS.defaults.font.size = 12;

interface HappinessChartProps {
  entries?: Entry[];
}

export default function HappinessChart({ entries }: HappinessChartProps) {
  const [timeSeriesData, setTimeSeriesData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [entryCounts, setEntryCounts] = useState<number[]>([]);
  const [fontSize, setFontSize] = useState(12);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [rawEntries, setRawEntries] = useState<Entry[]>([]);

  // Check if dark mode is enabled - CHECK IMMEDIATELY ON MOUNT
  useEffect(() => {
    // IMMEDIATE CHECK ON MOUNT TO AVOID FLASH OF WRONG COLORS
    const checkDarkMode = () => {
      if (typeof window !== 'undefined') {
        const isDark = document.documentElement.classList.contains('dark');
        setIsDarkMode(isDark);
      }
    };

    // CHECK IMMEDIATELY ON MOUNT (DOM IS AVAILABLE IN CLIENT COMPONENTS)
    checkDarkMode();

    // Set up a mutation observer to detect changes to the dark mode class
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          checkDarkMode();
        }
      });
    });

    if (typeof window !== 'undefined') {
      observer.observe(document.documentElement, { 
        attributes: true,
        attributeFilter: ['class']
      });
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  // Prepare time series data for the happiness and stress trend chart
  const prepareTimeSeriesData = useCallback((entries: Entry[], darkMode: boolean) => {
    if (!entries || entries.length < 2) {
      setTimeSeriesData(null);
      return;
    }
    
    // Sort entries by date (oldest first)
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Group entries by date and calculate average happiness and stress
    const entriesByDate = new Map<string, { 
      date: string; 
      happiness: number; 
      stress: number;
      happinessCount: number;
      stressCount: number;
    }>();
    
    sortedEntries.forEach(entry => {
      const date = format(typeof entry.date === 'string' ? parseISO(entry.date) : entry.date, 'MMM d');
      const existing = entriesByDate.get(date);
      
      // HANDLE BOTH CAMELCASE AND SNAKE_CASE FIELD NAMES
      const happinessRating = entry.happinessRating ?? (entry as any).happiness_rating;
      const stressLevel = entry.stressLevel ?? (entry as any).stress_level;
      
      if (existing) {
        // ADD HAPPINESS IF AVAILABLE
        if (happinessRating && !isNaN(happinessRating)) {
          existing.happiness += happinessRating;
          existing.happinessCount += 1;
        }
        // ADD STRESS IF AVAILABLE
        if (stressLevel && !isNaN(stressLevel)) {
          existing.stress += stressLevel;
          existing.stressCount += 1;
        }
      } else {
        entriesByDate.set(date, {
          date,
          happiness: (happinessRating && !isNaN(happinessRating)) ? happinessRating : 0,
          stress: (stressLevel && !isNaN(stressLevel)) ? stressLevel : 0,
          happinessCount: (happinessRating && !isNaN(happinessRating)) ? 1 : 0,
          stressCount: (stressLevel && !isNaN(stressLevel)) ? 1 : 0,
        });
      }
    });
    
    // Convert map to arrays and calculate averages
    const dates: string[] = [];
    const happinessValues: number[] = [];
    const stressValues: number[] = [];
    const counts: number[] = [];
    
    entriesByDate.forEach(({ date, happiness, stress, happinessCount, stressCount }) => {
      dates.push(date);
      // CALCULATE AVERAGE HAPPINESS
      if (happinessCount > 0) {
        happinessValues.push(happiness / happinessCount);
      } else {
        happinessValues.push(NaN);
      }
      // CALCULATE AVERAGE STRESS
      if (stressCount > 0) {
        stressValues.push(stress / stressCount);
      } else {
        stressValues.push(NaN);
      }
      counts.push(Math.max(happinessCount, stressCount));
    });
    
    // Prepare dataset for Chart.js with both happiness and stress
    const data = {
      labels: dates,
      datasets: [
        {
          label: 'Happiness Rating',
          data: happinessValues,
          borderColor: darkMode ? 'rgb(79, 70, 229)' : 'rgb(244, 63, 94)',
          backgroundColor: darkMode ? 'rgba(79, 70, 229, 0.5)' : 'rgba(244, 63, 94, 0.5)',
          tension: 0.3,
          fill: false,
        },
        {
          label: 'Stress Level',
          data: stressValues,
          borderColor: darkMode ? 'rgb(168, 85, 247)' : 'rgb(252, 165, 165)', // PURPLE IN DARK MODE, LIGHT RED IN LIGHT MODE
          backgroundColor: darkMode ? 'rgba(168, 85, 247, 0.5)' : 'rgba(252, 165, 165, 0.5)',
          tension: 0.3,
          fill: false,
        }
      ]
    };
    
    setTimeSeriesData(data);
    setEntryCounts(counts);
  }, []);

  useEffect(() => {
    async function fetchEntries() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/entries?limit=90`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.entries && Array.isArray(data.entries) && data.entries.length > 0) {
          // TRANSFORM ENTRIES TO HANDLE SNAKE_CASE FROM API
          const transformedEntries = data.entries.map((entry: any) => ({
            ...entry,
            happinessRating: entry.happiness_rating ?? entry.happinessRating,
            stressLevel: entry.stress_level ?? entry.stressLevel,
            date: entry.date
          }));
          setRawEntries(transformedEntries);
          // PREPARE DATA WITH CURRENT DARK MODE STATE
          prepareTimeSeriesData(transformedEntries, isDarkMode);
        } else {
          setTimeSeriesData(null);
          setRawEntries([]);
        }
      } catch (error) {
        console.error('Error fetching entries:', error);
        setTimeSeriesData(null);
        setRawEntries([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEntries();
  }, [prepareTimeSeriesData]);

  // RE-PREPARE DATA WHEN DARK MODE CHANGES TO UPDATE COLORS
  useEffect(() => {
    if (rawEntries.length > 0) {
      prepareTimeSeriesData(rawEntries, isDarkMode);
    }
  }, [isDarkMode, rawEntries, prepareTimeSeriesData]);

  // Update font size based on screen size
  useEffect(() => {
    const updateFontSize = () => {
      if (window.innerWidth < 640) {
        setFontSize(10);
      } else {
        setFontSize(12);
      }
    };

    updateFontSize();
    window.addEventListener('resize', updateFontSize);
    return () => window.removeEventListener('resize', updateFontSize);
  }, []);

  if (isLoading) {
    return (
      <div className="glass-card p-4">
        <h2 className="text-subheader mb-4">Happiness & Stress Trend</h2>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 dark:border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (!timeSeriesData) {
    return (
      <div className="glass-card p-4">
        <h2 className="text-subheader mb-4">Happiness & Stress Trend</h2>
        <div className="text-center py-4 pb-12">
          <p className="text-gray-500 dark:text-gray-400">No data available for the chart.</p>
        </div>
      </div>
    );
  }

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        ticks: {
          stepSize: 2,
          font: {
            family: "'IM Fell Great Primer SC', serif",
            size: fontSize,
            color: isDarkMode ? 'rgba(209, 213, 219, 0.8)' : 'rgba(75, 85, 99, 0.8)',
          },
          callback: function(tickValue: number | string) {
            return tickValue.toString();
          },
        },
        grid: {
          color: isDarkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(209, 213, 219, 0.5)',
        },
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            family: "'IM Fell Great Primer SC', serif",
            size: fontSize,
            color: isDarkMode ? 'rgba(209, 213, 219, 0.8)' : 'rgba(75, 85, 99, 0.8)',
          },
        },
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const index = context.dataIndex;
            const count = entryCounts[index];
            const datasetLabel = context.dataset.label || '';
            const value = context.parsed.y;
            if (isNaN(value)) {
              return `${datasetLabel}: No data`;
            }
            return `${datasetLabel}: ${value.toFixed(1)}/10 (${count} ${count === 1 ? 'entry' : 'entries'})`;
          },
        },
        titleFont: {
          family: "'IM Fell Great Primer SC', serif",
          size: fontSize + 2,
        },
        bodyFont: {
          family: "'IM Fell Great Primer SC', serif",
          size: fontSize,
        },
      },
    },
  };

  return (
    <div className="glass-card p-4">
      <h2 className="text-subheader mb-4">Happiness & Stress Trend</h2>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 dark:border-indigo-500"></div>
        </div>
      ) : timeSeriesData ? (
        <div className="h-64">
          <Line
            data={timeSeriesData}
            options={options}
          />
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-description">No data available</p>
        </div>
      )}
    </div>
  );
} 