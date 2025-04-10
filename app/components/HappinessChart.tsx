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

interface Entry {
  id: string;
  date: string;
  happinessRating: number;
}

export default function HappinessChart() {
  const [timeSeriesData, setTimeSeriesData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [entryCounts, setEntryCounts] = useState<number[]>([]);
  const [fontSize, setFontSize] = useState(12);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check if dark mode is enabled
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    // Initial check
    checkDarkMode();

    // Set up a mutation observer to detect changes to the dark mode class
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          checkDarkMode();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Prepare time series data for the happiness trend chart
  const prepareTimeSeriesData = useCallback((entries: Entry[]) => {
    if (entries.length < 2) return;
    
    // Sort entries by date (oldest first)
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Group entries by date and calculate average happiness
    const entriesByDate = new Map<string, { date: string; happiness: number; count: number }>();
    
    sortedEntries.forEach(entry => {
      const date = format(parseISO(entry.date), 'MMM d');
      const existing = entriesByDate.get(date);
      
      if (existing) {
        existing.happiness += entry.happinessRating;
        existing.count += 1;
      } else {
        entriesByDate.set(date, {
          date,
          happiness: entry.happinessRating,
          count: 1
        });
      }
    });
    
    // Convert map to arrays and calculate averages
    const dates: string[] = [];
    const happinessValues: number[] = [];
    const counts: number[] = [];
    
    entriesByDate.forEach(({ date, happiness, count }) => {
      dates.push(date);
      happinessValues.push(happiness / count);
      counts.push(count);
    });
    
    // Prepare dataset for Chart.js
    const data = {
      labels: dates,
      datasets: [
        {
          label: 'Happiness Rating',
          data: happinessValues,
          borderColor: 'rgb(79, 70, 229)',
          backgroundColor: 'rgba(79, 70, 229, 0.5)',
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
        const data = await response.json();
        if (data.entries) {
          prepareTimeSeriesData(data.entries);
        }
      } catch (error) {
        console.error('Error fetching entries:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEntries();
  }, [prepareTimeSeriesData]);

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
      <div className="animate-pulse">
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (!timeSeriesData) {
    return (
      <div className="text-center py-4 pb-12">
        <p className="text-gray-500 dark:text-gray-400">No data available for the happiness chart.</p>
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
            return `Happiness: ${context.parsed.y.toFixed(1)}/10 (${count} ${count === 1 ? 'entry' : 'entries'})`;
          },
        },
        titleFont: {
          size: fontSize + 2,
        },
        bodyFont: {
          size: fontSize,
        },
      },
    },
  };

  return (
    <div className="glass-card p-4">
      <h2 className="text-subheader mb-4">Happiness Trend</h2>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
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