'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format, parseISO } from 'date-fns';

// REGISTER CHARTJS COMPONENTS
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

interface MetricConfig {
  key: string;
  label: string;
  snakeKey: string;
  color: { light: string; dark: string };
  maxValue: number; // MAX VALUE FOR NORMALIZATION
  normalize: (value: number | null | undefined, max: number) => number;
}

export default function LifestyleStackedArea() {
  const [chartData, setChartData] = useState<any>(null);
  const [rawValues, setRawValues] = useState<number[][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(10);

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

  // UPDATE FONT SIZE
  useEffect(() => {
    const updateFontSize = () => {
      if (window.innerWidth < 640) {
        setFontSize(9);
      } else {
        setFontSize(10);
      }
    };

    updateFontSize();
    window.addEventListener('resize', updateFontSize);
    return () => window.removeEventListener('resize', updateFontSize);
  }, []);

  // NORMALIZE FUNCTION - SCALE TO 0-10
  const normalizeValue = useCallback((value: number | null | undefined, max: number): number => {
    if (value == null || isNaN(value) || value <= 0) return 0;
    // NORMALIZE TO 0-10 SCALE
    return Math.min(10, (value / max) * 10);
  }, []);

  // HAPPINESS COLOR SCALE FROM ACTIVITY HEATMAP (1-10)
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

  // CONVERT HEX TO RGBA WITH OPACITY
  const hexToRgba = (hex: string, opacity: number): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // METRIC CONFIGURATIONS - EXCLUDING STRESS AND HAPPINESS
  // MAP EACH METRIC TO A COLOR FROM THE HAPPINESS SCALE (1-10)
  const metrics: MetricConfig[] = [
    {
      key: 'sleepHours',
      snakeKey: 'sleep_hours',
      label: 'Sleep Hours',
      color: { 
        light: hexToRgba(happinessColors['1'], 0.6), 
        dark: hexToRgba(happinessColors['1'], 0.6) 
      },
      maxValue: 12,
      normalize: normalizeValue,
    },
    {
      key: 'sleepQuality',
      snakeKey: 'sleep_quality',
      label: 'Sleep Quality',
      color: { 
        light: hexToRgba(happinessColors['2'], 0.6), 
        dark: hexToRgba(happinessColors['2'], 0.6) 
      },
      maxValue: 10,
      normalize: (val, max) => {
        if (val == null || isNaN(val) || val <= 0) return 0;
        // ALREADY 1-10, NORMALIZE TO 0-10
        return ((val - 1) / (max - 1)) * 10;
      },
    },
    {
      key: 'exerciseTime',
      snakeKey: 'exercise_time',
      label: 'Exercise',
      color: { 
        light: hexToRgba(happinessColors['3'], 0.6), 
        dark: hexToRgba(happinessColors['3'], 0.6) 
      },
      maxValue: 12, // 12 HOURS MAX
      normalize: normalizeValue,
    },
    {
      key: 'meditationTime',
      snakeKey: 'meditation_time',
      label: 'Meditation',
      color: { 
        light: hexToRgba(happinessColors['4'], 0.6), 
        dark: hexToRgba(happinessColors['4'], 0.6) 
      },
      maxValue: 60, // 1 HOUR MAX
      normalize: normalizeValue,
    },
    {
      key: 'socialTime',
      snakeKey: 'social_time',
      label: 'Social Time',
      color: { 
        light: hexToRgba(happinessColors['5'], 0.6), 
        dark: hexToRgba(happinessColors['5'], 0.6) 
      },
      maxValue: 12, // 12 HOURS MAX
      normalize: normalizeValue,
    },
    {
      key: 'workHours',
      snakeKey: 'work_hours',
      label: 'Work Hours',
      color: { 
        light: hexToRgba(happinessColors['6'], 0.6), 
        dark: hexToRgba(happinessColors['6'], 0.6) 
      },
      maxValue: 12, // 12 HOURS MAX
      normalize: normalizeValue,
    },
    {
      key: 'meals',
      snakeKey: 'meals',
      label: 'Meals',
      color: { 
        light: hexToRgba(happinessColors['7'], 0.6), 
        dark: hexToRgba(happinessColors['7'], 0.6) 
      },
      maxValue: 10, // 10 MEALS MAX
      normalize: normalizeValue,
    },
    {
      key: 'foodQuality',
      snakeKey: 'food_quality',
      label: 'Food Quality',
      color: { 
        light: hexToRgba(happinessColors['8'], 0.6), 
        dark: hexToRgba(happinessColors['8'], 0.6) 
      },
      maxValue: 10,
      normalize: (val, max) => {
        if (val == null || isNaN(val) || val <= 0) return 0;
        // ALREADY 1-10, NORMALIZE TO 0-10
        return ((val - 1) / (max - 1)) * 10;
      },
    },
    {
      key: 'alcoholUnits',
      snakeKey: 'alcohol_units',
      label: 'Alcohol',
      color: { 
        light: hexToRgba(happinessColors['9'], 0.6), 
        dark: hexToRgba(happinessColors['9'], 0.6) 
      },
      maxValue: 10, // 10 UNITS MAX
      normalize: normalizeValue,
    },
    {
      key: 'cannabisAmount',
      snakeKey: 'cannabis_amount',
      label: 'Cannabis',
      color: { 
        light: hexToRgba(happinessColors['10'], 0.6), 
        dark: hexToRgba(happinessColors['10'], 0.6) 
      },
      maxValue: 0.1, // 0 TO 0.1 RANGE
      normalize: normalizeValue,
    },
  ];

  // FETCH ENTRIES AND BUILD CHART DATA
  useEffect(() => {
    async function fetchEntries() {
      try {
        setIsLoading(true);
        // FETCH ALL ENTRIES
        const response = await fetch(`/api/entries`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        if (data.entries && Array.isArray(data.entries) && data.entries.length > 0) {
          // SORT ENTRIES BY DATE (OLDEST FIRST)
          const sortedEntries = [...data.entries].sort((a: any, b: any) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
          );
          
          // PREPARE DATA FOR EACH METRIC
          const dates: string[] = [];
          const rawValues: number[][] = [];
          
          // FIRST PASS: COLLECT ALL RAW NORMALIZED VALUES
          sortedEntries.forEach((entry: any, entryIndex: number) => {
            // BUILD DATE LABELS
            const date = typeof entry.date === 'string' ? parseISO(entry.date) : new Date(entry.date);
            dates.push(format(date, 'MMM d'));
            
            // COLLECT VALUES FOR EACH METRIC
            metrics.forEach((metric, metricIndex) => {
              if (!rawValues[metricIndex]) {
                rawValues[metricIndex] = [];
              }
              const rawValue = entry[metric.key] ?? entry[metric.snakeKey];
              const normalized = metric.normalize(rawValue, metric.maxValue);
              rawValues[metricIndex][entryIndex] = normalized;
            });
          });
          
          // SECOND PASS: NORMALIZE EACH METRIC ACROSS ALL DAYS (0-1 BASED ON MIN/MAX OF THAT METRIC)
          const numEntries = sortedEntries.length;
          for (let metricIndex = 0; metricIndex < metrics.length; metricIndex++) {
            // FIND MIN AND MAX FOR THIS METRIC ACROSS ALL DAYS
            // ALWAYS INCLUDE 0 IN THE RANGE SO ONLY ACTUAL 0 VALUES MAP TO 0
            let min = 0; // ALWAYS START WITH 0
            let max = -Infinity;
            
            for (let entryIndex = 0; entryIndex < numEntries; entryIndex++) {
              const value = rawValues[metricIndex][entryIndex] || 0;
              if (value < min) min = value;
              if (value > max) max = value;
            }
            
            // NORMALIZE EACH VALUE TO 0-1 BASED ON THIS METRIC'S RANGE
            // MIN IS ALWAYS 0 (OR LESS), SO RANGE IS FROM 0 TO MAX
            const range = max - min;
            if (range > 0) {
              for (let entryIndex = 0; entryIndex < numEntries; entryIndex++) {
                const value = rawValues[metricIndex][entryIndex] || 0;
                // IF VALUE IS 0, IT MAPS TO 0; OTHERWISE NORMALIZE FROM 0 TO MAX
                rawValues[metricIndex][entryIndex] = (value - min) / range;
              }
            } else {
              // IF ALL VALUES ARE THE SAME, SET TO 0 (OR COULD SET TO 0.5, BUT 0 MAKES MORE SENSE)
              for (let entryIndex = 0; entryIndex < numEntries; entryIndex++) {
                rawValues[metricIndex][entryIndex] = 0;
              }
            }
          }
          
          // THIRD PASS: NORMALIZE EACH DAY TO SUM TO 1
          for (let entryIndex = 0; entryIndex < numEntries; entryIndex++) {
            // CALCULATE SUM OF ALL METRICS FOR THIS DAY
            let daySum = 0;
            for (let metricIndex = 0; metricIndex < metrics.length; metricIndex++) {
              daySum += rawValues[metricIndex][entryIndex] || 0;
            }
            
            // NORMALIZE EACH METRIC VALUE BY DIVIDING BY THE SUM (IF SUM > 0)
            if (daySum > 0) {
              let normalizedSum = 0;
              for (let metricIndex = 0; metricIndex < metrics.length; metricIndex++) {
                rawValues[metricIndex][entryIndex] = (rawValues[metricIndex][entryIndex] || 0) / daySum;
                normalizedSum += rawValues[metricIndex][entryIndex];
              }
              // ENSURE EXACT SUM OF 1 BY ADJUSTING THE LAST METRIC (ACCOUNT FOR FLOATING POINT ERRORS)
              if (normalizedSum > 0 && Math.abs(normalizedSum - 1) > 0.0001) {
                const adjustment = 1 - normalizedSum;
                rawValues[metrics.length - 1][entryIndex] = (rawValues[metrics.length - 1][entryIndex] || 0) + adjustment;
              }
            }
          }
          
          // FOURTH PASS: CREATE DATASETS WITH RAW NORMALIZED VALUES (CHART.JS WILL HANDLE STACKING)
          const datasets = metrics.map((metric, metricIndex) => {
            return {
              label: metric.label,
              data: rawValues[metricIndex],
              borderColor: isDarkMode ? metric.color.dark : metric.color.light,
              backgroundColor: isDarkMode ? metric.color.dark : metric.color.light,
              fill: true,
              tension: 0.3,
              pointRadius: 0, // HIDE POINTS, SHOW ONLY LINES
            };
          });
          
          setChartData({
            labels: dates,
            datasets,
          });
          setRawValues(rawValues);
        } else {
          setChartData(null);
          setRawValues([]);
        }
      } catch (error) {
        console.error('Error fetching entries:', error);
        setChartData(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEntries();
  }, [normalizeValue, isDarkMode]);

  // UPDATE COLORS WHEN DARK MODE CHANGES
  useEffect(() => {
    if (chartData) {
      setChartData({
        ...chartData,
        datasets: chartData.datasets.map((dataset: any, index: number) => ({
          ...dataset,
          borderColor: isDarkMode ? metrics[index].color.dark : metrics[index].color.light,
          backgroundColor: isDarkMode ? metrics[index].color.dark : metrics[index].color.light,
          pointRadius: 0, // PRESERVE NO POINTS SETTING
        })),
      });
    }
  }, [isDarkMode]);

  // CHART OPTIONS - MEMOIZED TO ACCESS RAW VALUES
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 1.0,
        min: 0,
        stacked: true,
        ticks: {
          display: false,
        },
        grid: {
          color: isDarkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(209, 213, 219, 0.5)',
        },
      },
      x: {
        stacked: true,
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
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const datasetIndex = context.datasetIndex;
            const dataIndex = context.dataIndex;
            // GET RAW VALUE - NOW A PROPORTION (0-1)
            const rawValue = rawValues[datasetIndex]?.[dataIndex] || 0;
            return `${label}: ${(rawValue * 100).toFixed(1)}%`;
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
  }), [rawValues, fontSize, isDarkMode]);

  if (isLoading) {
    return (
      <div className="glass-card p-4 sm:p-6 rounded-lg">
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 dark:border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="glass-card p-4 sm:p-6 rounded-lg">
        <div className="h-64 flex items-center justify-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 sm:p-6 rounded-lg">
      <h3 className="text-subheader mb-4 text-gray-800 dark:text-white text-center">
        Lifestyle Factors Over Time
      </h3>
      <div className="h-64">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
