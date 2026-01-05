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

export default function HappinessStressHistograms() {
  const [happinessData, setHappinessData] = useState<any>(null);
  const [stressData, setStressData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(10);
  const [entries, setEntries] = useState<any[]>([]);

  // CHECK DARK MODE - INITIALIZE SYNCHRONOUSLY
  useEffect(() => {
    const checkDarkMode = () => {
      if (typeof window !== 'undefined') {
        const isDark = document.documentElement.classList.contains('dark');
        setIsDarkMode(isDark);
      }
    };

    // CHECK IMMEDIATELY ON MOUNT
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
        // FETCH ALL ENTRIES (NO LIMIT)
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

  // BUILD HISTOGRAM DATA - DEPENDS ON ENTRIES AND ISDARKMODE
  useEffect(() => {
    if (entries.length === 0 || isLoading) {
      setHappinessData(null);
      setStressData(null);
      return;
    }

    // BUILD HISTOGRAM DATA FOR HAPPINESS (1-10)
    const happinessCounts = Array(10).fill(0);
    const stressCounts = Array(10).fill(0);
    
    entries.forEach((entry: any) => {
      // HANDLE BOTH CAMELCASE AND SNAKE_CASE
      const happiness = entry.happiness_rating ?? entry.happinessRating;
      const stress = entry.stress_level ?? entry.stressLevel;
      
      if (happiness != null && !isNaN(happiness) && happiness >= 1 && happiness <= 10) {
        happinessCounts[Math.round(happiness) - 1]++;
      }
      
      if (stress != null && !isNaN(stress) && stress >= 1 && stress <= 10) {
        stressCounts[Math.round(stress) - 1]++;
      }
    });
    
    // PREPARE HAPPINESS HISTOGRAM DATA
    const happinessLabels = Array.from({ length: 10 }, (_, i) => (i + 1).toString());
    setHappinessData({
      labels: happinessLabels,
      datasets: [{
        label: 'Days',
        data: happinessCounts,
        backgroundColor: isDarkMode 
          ? 'rgba(79, 70, 229, 0.6)' 
          : 'rgba(244, 63, 94, 0.6)',
        borderColor: isDarkMode 
          ? 'rgb(79, 70, 229)' 
          : 'rgb(244, 63, 94)',
        borderWidth: 1,
      }]
    });
    
    // PREPARE STRESS HISTOGRAM DATA
    const stressLabels = Array.from({ length: 10 }, (_, i) => (i + 1).toString());
    setStressData({
      labels: stressLabels,
      datasets: [{
        label: 'Days',
        data: stressCounts,
        backgroundColor: isDarkMode 
          ? 'rgba(168, 85, 247, 0.6)' 
          : 'rgba(252, 165, 165, 0.6)',
        borderColor: isDarkMode 
          ? 'rgb(168, 85, 247)' 
          : 'rgb(252, 165, 165)',
        borderWidth: 1,
      }]
    });
  }, [entries, isLoading, isDarkMode]);

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

  if (!happinessData || !stressData) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">No data available</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-3">
      {/* HAPPINESS HISTOGRAM */}
      <div className="flex-1 min-h-0">
        <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">
          Happiness Distribution
        </h3>
        <div className="h-[60px]">
          <Bar data={happinessData} options={chartOptions} />
        </div>
      </div>
      
      {/* STRESS HISTOGRAM */}
      <div className="flex-1 min-h-0">
        <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">
          Stress Distribution
        </h3>
        <div className="h-[60px]">
          <Bar data={stressData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}
