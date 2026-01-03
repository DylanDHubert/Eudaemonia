'use client';

import React, { useState, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// REGISTER CHARTJS COMPONENTS
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface CategoryConfig {
  key: string;
  snakeKey: string;
  label: string;
  maxValue: number;
  bins: number; // NUMBER OF BINS FOR HISTOGRAM
}

// CATEGORIES TO ROTATE THROUGH (EXCLUDING HAPPINESS AND STRESS)
const categories: CategoryConfig[] = [
  { key: 'sleepHours', snakeKey: 'sleep_hours', label: 'Sleep Hours', maxValue: 12, bins: 12 },
  { key: 'sleepQuality', snakeKey: 'sleep_quality', label: 'Sleep Quality', maxValue: 10, bins: 10 },
  { key: 'exerciseTime', snakeKey: 'exercise_time', label: 'Exercise Time', maxValue: 720, bins: 12 },
  { key: 'meditationTime', snakeKey: 'meditation_time', label: 'Meditation Time', maxValue: 60, bins: 12 },
  { key: 'socialTime', snakeKey: 'social_time', label: 'Social Time', maxValue: 12, bins: 12 },
  { key: 'workHours', snakeKey: 'work_hours', label: 'Work Hours', maxValue: 12, bins: 12 },
  { key: 'meals', snakeKey: 'meals', label: 'Meals', maxValue: 10, bins: 10 },
  { key: 'foodQuality', snakeKey: 'food_quality', label: 'Food Quality', maxValue: 10, bins: 10 },
  { key: 'alcoholUnits', snakeKey: 'alcohol_units', label: 'Alcohol Units', maxValue: 10, bins: 10 },
  { key: 'cannabisAmount', snakeKey: 'cannabis_amount', label: 'Cannabis Amount', maxValue: 0.1, bins: 10 },
];

export default function RotatingCategoryHistogram() {
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [histogramData, setHistogramData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(10);
  const [entries, setEntries] = useState<any[]>([]);

  // CHECK DARK MODE
  useEffect(() => {
    const checkDarkMode = () => {
      if (typeof window !== 'undefined') {
        const isDark = document.documentElement.classList.contains('dark');
        setIsDarkMode(isDark);
      }
    };

    checkDarkMode();

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

  // UPDATE FONT SIZE BASED ON SCREEN SIZE
  useEffect(() => {
    const updateFontSize = () => {
      if (window.innerWidth < 640) {
        setFontSize(8);
      } else {
        setFontSize(10);
      }
    };

    updateFontSize();
    window.addEventListener('resize', updateFontSize);
    return () => window.removeEventListener('resize', updateFontSize);
  }, []);

  // FETCH ENTRIES
  useEffect(() => {
    async function fetchEntries() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/entries`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        if (data.entries && Array.isArray(data.entries) && data.entries.length > 0) {
          setEntries(data.entries);
        } else {
          setEntries([]);
        }
      } catch (error) {
        console.error('Error fetching entries:', error);
        setEntries([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEntries();
  }, []);

  // ROTATE THROUGH CATEGORIES EVERY 5 SECONDS
  useEffect(() => {
    if (categories.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentCategoryIndex((prevIndex) => (prevIndex + 1) % categories.length);
    }, 5000); // ROTATE EVERY 5 SECONDS

    return () => clearInterval(interval);
  }, []);

  // BUILD HISTOGRAM DATA FOR CURRENT CATEGORY
  useEffect(() => {
    if (entries.length === 0 || isLoading) {
      setHistogramData(null);
      return;
    }

    const currentCategory = categories[currentCategoryIndex];
    if (!currentCategory) {
      setHistogramData(null);
      return;
    }

    // CREATE BINS
    const binSize = currentCategory.maxValue / currentCategory.bins;
    const bins = Array(currentCategory.bins).fill(0);
    const binLabels: string[] = [];

    // GENERATE BIN LABELS - ALWAYS SHOW SINGLE NUMBER (MIDPOINT)
    // FOR CANNABIS, SHOW 3 DECIMAL PLACES; OTHERS SHOW 1 DECIMAL PLACE
    const decimalPlaces = currentCategory.key === 'cannabisAmount' ? 3 : 1;
    for (let i = 0; i < currentCategory.bins; i++) {
      const start = i * binSize;
      const midpoint = start + binSize / 2;
      // SHOW MIDPOINT AS SINGLE NUMBER
      binLabels.push(midpoint.toFixed(decimalPlaces));
    }

    // COUNT VALUES INTO BINS
    entries.forEach((entry: any) => {
      const value = entry[currentCategory.key] ?? entry[currentCategory.snakeKey];
      
      if (value != null && !isNaN(value) && value >= 0) {
        // FIND WHICH BIN THIS VALUE BELONGS TO
        let binIndex = Math.floor(value / binSize);
        // CLAMP TO VALID RANGE
        if (binIndex >= currentCategory.bins) binIndex = currentCategory.bins - 1;
        if (binIndex < 0) binIndex = 0;
        bins[binIndex]++;
      }
    });

    // PREPARE HISTOGRAM DATA
    setHistogramData({
      labels: binLabels,
      datasets: [{
        label: 'Days',
        data: bins,
        backgroundColor: isDarkMode 
          ? 'rgba(79, 70, 229, 0.6)' 
          : 'rgba(244, 63, 94, 0.6)',
        borderColor: isDarkMode 
          ? 'rgb(79, 70, 229)' 
          : 'rgb(244, 63, 94)',
        borderWidth: 1,
      }]
    });
  }, [currentCategoryIndex, entries, isLoading, isDarkMode]);

  // CHART OPTIONS
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            size: fontSize,
            color: isDarkMode ? 'rgba(209, 213, 219, 0.8)' : 'rgba(75, 85, 99, 0.8)',
          },
        },
        grid: {
          color: isDarkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(209, 213, 219, 0.5)',
        },
      },
      x: {
        ticks: {
          font: {
            size: fontSize - 1,
            color: isDarkMode ? 'rgba(209, 213, 219, 0.8)' : 'rgba(75, 85, 99, 0.8)',
          },
          maxRotation: 45,
          minRotation: 45,
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
            return `${context.parsed.y} ${context.parsed.y === 1 ? 'day' : 'days'}`;
          },
        },
        titleFont: {
          size: fontSize + 1,
        },
        bodyFont: {
          size: fontSize,
        },
      },
    },
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-rose-500 dark:border-indigo-500"></div>
      </div>
    );
  }

  if (!histogramData || entries.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">No data available</p>
      </div>
    );
  }

  const currentCategory = categories[currentCategoryIndex];

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">
        {currentCategory.label} Distribution
      </h3>
      <div className="flex-1 min-h-0">
        <Bar data={histogramData} options={chartOptions} />
      </div>
      {/* INDICATOR DOTS */}
      <div className="flex justify-center gap-1 mt-2">
        {categories.map((_, index) => (
          <div
            key={index}
            className={`h-1.5 w-1.5 rounded-full transition-all ${
              index === currentCategoryIndex
                ? 'bg-rose-500 dark:bg-indigo-500 w-4'
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
