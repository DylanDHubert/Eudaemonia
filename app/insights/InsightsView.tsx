'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Chart as ChartJS, 
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ScatterController
} from 'chart.js';
import { Line, Bar, Scatter } from 'react-chartjs-2';
import { format, subDays, parseISO } from 'date-fns';
import CorrelationMatrix from '../components/CorrelationMatrix';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ScatterController
);

// Types for our entries
type CustomCategory = {
  id: string;
  name: string;
  type: 'numeric' | 'scale' | 'boolean';
  value: number;
};

type DailyEntry = {
  id: string;
  date: string;
  sleepHours: number;
  sleepQuality: number;
  exercise: boolean;
  exerciseTime: number | null;
  alcoholUnits: number | null;
  cannabisAmount: number | null;
  meditation: boolean;
  socialTime: number | null;
  workHours: number | null;
  meals: number | null;
  foodQuality: number | null;
  stressLevel: number;
  happinessRating: number;
  notes: string | null;
  customCategories: CustomCategory[];
  createdAt: string;
  updatedAt: string;
};

type InsightsViewProps = {
  entries: DailyEntry[];
  minimumEntries: number;
};

type Correlation = {
  factor: string;
  correlation: number;
  stressCorrelation: number | null;
};

export default function InsightsView({ entries, minimumEntries }: InsightsViewProps) {
  const [correlations, setCorrelations] = useState<Correlation[]>([]);
  const [selectedFactor, setSelectedFactor] = useState<string | null>(null);
  const [scatterData, setScatterData] = useState<{ x: number; y: number }[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<any>(null);
  const [factorTimeSeriesData, setFactorTimeSeriesData] = useState<any>(null);
  const [factorCounts, setFactorCounts] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'correlations' | 'trends' | 'matrix'>('correlations');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entryCounts, setEntryCounts] = useState<number[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [sortColumn, setSortColumn] = useState<'happiness' | 'stress'>('happiness');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [fontLoaded, setFontLoaded] = useState(false);
  
  // Mapping of internal factor names to display names
  const factorNameMap = useMemo<Record<string, string>>(() => ({
    sleepHours: 'Sleep Hours',
    sleepQuality: 'Sleep Quality',
    exercise: 'Exercise',
    exerciseTime: 'Exercise Time',
    meditation: 'Meditation',
    alcoholUnits: 'Alcohol Units',
    cannabisAmount: 'Cannabis Amount',
    socialTime: 'Social Time',
    workHours: 'Work Hours',
    meals: 'Number of Meals',
    foodQuality: 'Food Quality',
    stressLevel: 'Stress Level'
  }), []);
  
  // Reverse mapping of display names to internal names
  const displayToInternalMap = useMemo<Record<string, string>>(() => 
    Object.entries(factorNameMap)
      .reduce<Record<string, string>>((acc, [internal, display]) => ({...acc, [display]: internal}), {}), 
    [factorNameMap]
  );
  
  // List of boolean factors (all others are numeric)
  const booleanFactors = useMemo(() => ['exercise', 'meditation'], []);
  
  // List of numeric factors
  const numericFactors = useMemo(() => {
    const baseFactors = [
      'sleepHours',
      'sleepQuality',
      'exerciseTime',
      'alcoholUnits',
      'cannabisAmount',
      'socialTime',
      'workHours',
      'meals',
      'foodQuality',
      'stressLevel'
    ];

    // COLLECT ALL UNIQUE CUSTOM NUMERIC AND SCALE CATEGORIES FROM ALL ENTRIES
    if (entries.length > 0) {
      const customCategorySet = new Set<string>();
      entries.forEach(entry => {
        entry.customCategories
          .filter(cat => cat.type === 'numeric' || cat.type === 'scale')
          .forEach(cat => customCategorySet.add(cat.name));
      });
      const customNumericCategories = Array.from(customCategorySet);
      return [...baseFactors, ...customNumericCategories];
    }

    return baseFactors;
  }, [entries]);
  
  // Helper function to get display name from internal name
  const getDisplayName = useCallback((internalName: string): string => {
    // CHECK IF IT'S A CUSTOM CATEGORY BY SEARCHING ALL ENTRIES
    if (entries.length > 0) {
      const isCustomCategory = entries.some(entry => 
        entry.customCategories.some(cat => cat.name === internalName)
      );
      if (isCustomCategory) {
        return internalName;
      }
    }
    return factorNameMap[internalName] || internalName;
  }, [entries, factorNameMap]);
  
  // Helper function to get internal name from display name
  const getInternalName = useCallback((displayName: string): string => {
    return displayToInternalMap[displayName] || displayName;
  }, [displayToInternalMap]);
  
  // Helper function to check if a factor is boolean
  const isBooleanFactor = useCallback((factorName: string): boolean => {
    // First check if it's already an internal name
    if (booleanFactors.includes(factorName)) {
      return true;
    }
    
    // CHECK IF IT'S A CUSTOM BOOLEAN CATEGORY
    if (entries.length > 0) {
      const isCustomBoolean = entries.some(entry =>
        entry.customCategories.some(cat => cat.name === factorName && cat.type === 'boolean')
      );
      if (isCustomBoolean) {
        return true;
      }
    }
    
    // Then check if it's a display name that maps to a boolean factor
    const internalName = getInternalName(factorName);
    return booleanFactors.includes(internalName);
  }, [booleanFactors, getInternalName, entries]);
  
  // Prepare time series data for the happiness trend chart
  const prepareTimeSeriesData = useCallback(() => {
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
          borderColor: isDarkMode ? 'rgb(79, 70, 229)' : 'rgb(244, 63, 94)',
          backgroundColor: isDarkMode ? 'rgba(79, 70, 229, 0.5)' : 'rgba(244, 63, 94, 0.5)',
          tension: 0.3,
          fill: false,
        }
      ]
    };
    
    setTimeSeriesData(data);
    setEntryCounts(counts);
  }, [entries, isDarkMode]);
  
  useEffect(() => {
    if (entries.length < minimumEntries) {
      setCorrelations([]);
      return;
    }
    
    const calculateCorrelations = () => {
      if (entries.length < minimumEntries) return;

      const correlations: Correlation[] = [];

      // Helper function to get numeric values for a factor
      const getNumericValues = (factor: string) => {
        return entries.map(entry => {
          // Check if it's a custom category first
          const customCategory = entry.customCategories.find(cat => cat.name === factor);
          if (customCategory) {
            return customCategory.value;
          }

          // Then check built-in factors
          switch (factor) {
            case 'sleepHours':
              return entry.sleepHours;
            case 'sleepQuality':
              return entry.sleepQuality;
            case 'exerciseTime':
              return entry.exercise ? entry.exerciseTime || 0 : 0;
            case 'alcoholUnits':
              return entry.alcoholUnits ?? 0;
            case 'cannabisAmount':
              return entry.cannabisAmount ?? 0;
            case 'socialTime':
              return entry.socialTime ?? 0;
            case 'workHours':
              return entry.workHours ?? 0;
            case 'meals':
              return entry.meals ?? 0;
            case 'foodQuality':
              return entry.foodQuality ?? 0;
            case 'stressLevel':
              return entry.stressLevel;
            default:
              return 0;
          }
        });
      };

      // Helper function to get boolean values for a factor
      const getBooleanValues = (factor: string) => {
        return entries.map(entry => {
          // Check if it's a custom boolean category first
          const customCategory = entry.customCategories.find(cat => cat.name === factor && cat.type === 'boolean');
          if (customCategory) {
            return customCategory.value === 1;
          }

          // Then check built-in boolean factors
          switch (factor) {
            case 'exercise':
              return entry.exercise;
            case 'meditation':
              return entry.meditation;
            default:
              return false;
          }
        });
      };

      // Calculate correlations for numeric factors
      numericFactors.forEach(factor => {
        const values = getNumericValues(factor);
        // FILTER OUT ENTRIES WHERE THE FACTOR HAS NO VARIANCE (ALL ZEROS OR NULLS)
        const validIndices: number[] = [];
        const validValues: number[] = [];
        const validHappiness: number[] = [];
        const validStress: number[] = [];
        
        values.forEach((val, idx) => {
          // INCLUDE ENTRY IF VALUE IS A VALID NUMBER (INCLUDING 0)
          // FOR CUSTOM CATEGORIES, ALWAYS INCLUDE (THEY SHOULD ALWAYS HAVE VALUES)
          // FOR BUILT-IN FACTORS, INCLUDE ALL ENTRIES (0 IS A VALID VALUE)
          const isCustomCategory = entries[idx].customCategories.some(cat => cat.name === factor);
          
          // CHECK IF VALUE IS VALID (NOT NULL, NOT UNDEFINED, NOT NaN)
          // NOTE: 0 IS A VALID VALUE AND SHOULD BE INCLUDED
          const isValidValue = val !== null && val !== undefined && !isNaN(val);
          
          if (isValidValue) {
            validIndices.push(idx);
            validValues.push(val);
            validHappiness.push(entries[idx].happinessRating);
            validStress.push(entries[idx].stressLevel);
          }
        });
        
        // ONLY CALCULATE CORRELATION IF WE HAVE ENOUGH VALID DATA POINTS
        if (validValues.length >= minimumEntries) {
          // CHECK FOR VARIANCE - IF ALL VALUES ARE THE SAME, CORRELATION IS MEANINGLESS
          const uniqueValues = new Set(validValues);
          if (uniqueValues.size > 1) {
            const correlation = calculatePearsonCorrelation(validValues, validHappiness);
            const stressCorrelation = calculatePearsonCorrelation(validValues, validStress);
            if (!isNaN(correlation) && isFinite(correlation)) {
              correlations.push({
                factor,
                correlation,
                stressCorrelation: (!isNaN(stressCorrelation) && isFinite(stressCorrelation)) ? stressCorrelation : null
              });
            }
          }
        }
      });

      // Calculate correlations for boolean factors
      const customBooleanFactors = [...booleanFactors];
      
      // COLLECT ALL UNIQUE CUSTOM BOOLEAN CATEGORIES FROM ALL ENTRIES
      if (entries.length > 0) {
        const customBooleanSet = new Set<string>();
        entries.forEach(entry => {
          entry.customCategories
            .filter(cat => cat.type === 'boolean')
            .forEach(cat => customBooleanSet.add(cat.name));
        });
        customBooleanSet.forEach(catName => customBooleanFactors.push(catName));
      }
      
      customBooleanFactors.forEach(factor => {
        let values: boolean[];
        
        // CHECK IF THIS IS A CUSTOM BOOLEAN CATEGORY BY SEARCHING ALL ENTRIES
        const isCustomBoolean = entries.some(entry => 
          entry.customCategories.some(cat => cat.name === factor && cat.type === 'boolean')
        );
        
        if (isCustomBoolean) {
          values = entries.map(entry => {
            const customCat = entry.customCategories.find(cat => cat.name === factor);
            return customCat ? customCat.value === 1 : false;
          });
        } else {
          values = getBooleanValues(factor);
        }
        
        // FILTER TO ONLY ENTRIES WHERE THE FACTOR IS PRESENT
        const validIndices: number[] = [];
        const validValues: boolean[] = [];
        const validHappiness: number[] = [];
        const validStress: number[] = [];
        
        values.forEach((val, idx) => {
          // FOR CUSTOM BOOLEAN CATEGORIES, INCLUDE ALL ENTRIES (MISSING = FALSE)
          // FOR BUILT-IN BOOLEAN FACTORS, INCLUDE ALL ENTRIES
          validIndices.push(idx);
          validValues.push(val);
          validHappiness.push(entries[idx].happinessRating);
          validStress.push(entries[idx].stressLevel);
        });
        
        // CHECK THAT WE HAVE BOTH TRUE AND FALSE VALUES FOR MEANINGFUL CORRELATION
        const hasTrue = validValues.some(v => v === true);
        const hasFalse = validValues.some(v => v === false);
        
        if (validValues.length >= minimumEntries && hasTrue && hasFalse) {
          const correlation = calculatePointBiserialCorrelation(validValues, validHappiness);
          const stressCorrelation = calculatePointBiserialCorrelation(validValues, validStress);
          if (!isNaN(correlation) && isFinite(correlation)) {
            correlations.push({
              factor,
              correlation,
              stressCorrelation: (!isNaN(stressCorrelation) && isFinite(stressCorrelation)) ? stressCorrelation : null
            });
          }
        }
      });

      // DON'T SORT HERE - WILL BE SORTED IN useMemo BASED ON USER SELECTION
      setCorrelations(correlations);
    };
    
    calculateCorrelations();
    
    // Prepare time series data for happiness
    prepareTimeSeriesData();
    
  }, [entries, minimumEntries, prepareTimeSeriesData, booleanFactors, numericFactors]);
  
  // Update scatter data and time series data when selectedFactor changes
  useEffect(() => {
    if (!selectedFactor || entries.length < minimumEntries) return;
    
    try {
      // Step 1: Determine the internal factor name
      const internalName = getInternalName(selectedFactor);
      
      // Step 2: Generate appropriate scatter data based on factor type
      let newScatterData: { x: number; y: number }[] = [];
      
      // Step 3: Prepare time series data for the selected factor
      const sortedEntries = [...entries].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      // Group entries by date and calculate average values
      const entriesByDate = new Map<string, { date: string; value: number; count: number }>();
      
      sortedEntries.forEach(entry => {
        const date = format(parseISO(entry.date), 'MMM d');
        
        // Get the value based on factor type
        let value: number;
        // CHECK FOR CUSTOM CATEGORY FIRST - SEARCH ALL ENTRIES TO FIND IF IT'S A CUSTOM CATEGORY
        const isCustomCategory = entries.some(e => 
          e.customCategories.some(cat => cat.name === selectedFactor)
        );
        if (isCustomCategory) {
          const customCat = entry.customCategories.find(cat => cat.name === selectedFactor);
          value = customCat ? customCat.value : 0;
        } else if (booleanFactors.includes(internalName)) {
          value = entry[internalName as keyof DailyEntry] ? 1 : 0;
        } else {
          const rawValue = entry[internalName as keyof DailyEntry];
          value = typeof rawValue === 'number' ? rawValue : 
                  typeof rawValue === 'boolean' ? (rawValue ? 1 : 0) : 0;
        }
        
        const existing = entriesByDate.get(date);
        if (existing) {
          existing.value += value;
          existing.count += 1;
        } else {
          entriesByDate.set(date, {
            date,
            value,
            count: 1
          });
        }
      });
      
      // Convert map to arrays and calculate averages
      const factorDates: string[] = [];
      const factorValues: number[] = [];
      const newFactorCounts: number[] = [];
      
      // CHECK IF THIS IS A BOOLEAN FACTOR (BUILT-IN OR CUSTOM)
      const isBoolean = isBooleanFactor(selectedFactor);
      
      entriesByDate.forEach(({ date, value, count }) => {
        factorDates.push(date);
        const avgValue = value / count;
        // FOR BOOLEAN FACTORS, ROUND TO 0 OR 1 (>= 0.5 = 1, < 0.5 = 0)
        // THIS PREVENTS FRACTIONAL VALUES LIKE 0.2, 0.5, 0.8 FROM SHOWING UP
        const finalValue = isBoolean ? Math.round(avgValue) : avgValue;
        factorValues.push(finalValue);
        newFactorCounts.push(count);
      });
      
      // Prepare time series data for the selected factor
      const factorTimeSeriesData = {
        labels: factorDates,
        datasets: [
          {
            label: getDisplayName(selectedFactor),
            data: factorValues,
            borderColor: isDarkMode ? 'rgb(79, 70, 229)' : 'rgb(244, 63, 94)',
            backgroundColor: isDarkMode ? 'rgba(79, 70, 229, 0.5)' : 'rgba(244, 63, 94, 0.5)',
            tension: 0.3,
            fill: false,
          }
        ]
      };
      
      setFactorTimeSeriesData(factorTimeSeriesData);
      setFactorCounts(newFactorCounts);
      
      // Step 4: Handle boolean factors (exercise, meditation)
      if (booleanFactors.includes(internalName)) {
        // For boolean factors, show all data points at x=0 (false) or x=1 (true)
        const validEntriesWithKey = entries.filter(e => internalName in e && e[internalName as keyof DailyEntry] !== undefined);
        
        if (validEntriesWithKey.length >= minimumEntries) {
          // SHOW ALL DATA POINTS, NOT JUST AVERAGES
          newScatterData = validEntriesWithKey.map(entry => {
            const boolValue = entry[internalName as keyof DailyEntry] === true;
            return {
              x: boolValue ? 1 : 0,
              y: entry.happinessRating
            };
          });
        }
      }
      // Step 5: Handle custom categories
      else if (entries.length > 0 && entries.some(e => 
        e.customCategories && Array.isArray(e.customCategories) && e.customCategories.some(cat => cat.name === selectedFactor)
      )) {
        // DETERMINE IF IT'S A BOOLEAN OR NUMERIC CUSTOM CATEGORY
        const firstEntryWithCategory = entries.find(e => 
          e.customCategories.some(cat => cat.name === selectedFactor)
        );
        const categoryType = firstEntryWithCategory?.customCategories.find(cat => cat.name === selectedFactor)?.type;
        // Get entries that have this custom category
        const validEntries = entries.filter(e => 
          e.customCategories && Array.isArray(e.customCategories) && e.customCategories.some(cat => cat.name === selectedFactor)
        );
        
        if (validEntries.length >= minimumEntries) {
          // FOR ALL CUSTOM CATEGORIES (BOOLEAN AND NUMERIC), SHOW ALL DATA POINTS
          // BOOLEAN FORMATTING WILL BE HANDLED BY CHART OPTIONS
          newScatterData = validEntries.map(entry => {
            const category = entry.customCategories.find(cat => cat.name === selectedFactor);
            // FOR BOOLEAN CATEGORIES, ENSURE VALUE IS 0 OR 1
            if (categoryType === 'boolean') {
              return {
                x: category && category.value === 1 ? 1 : 0,
                y: entry.happinessRating
              };
            } else {
              // FOR NUMERIC/SCALE CATEGORIES, USE THE VALUE DIRECTLY
              return {
                x: category ? category.value : 0,
                y: entry.happinessRating
              };
            }
          });
        }
      }
      // Step 6: Handle numeric factors
      else {
        // Get entries that have a valid value for this factor
        const validEntries = entries.filter(e => 
          internalName in e && 
          e[internalName as keyof DailyEntry] !== null && 
          e[internalName as keyof DailyEntry] !== undefined
        );
        
        if (validEntries.length >= minimumEntries) {
          newScatterData = validEntries.map(entry => {
            // Safely get the numeric value 
            const value = entry[internalName as keyof DailyEntry];
            const numericValue = typeof value === 'number' ? value : 
                                typeof value === 'boolean' ? (value ? 1 : 0) : 0;
            
            return {
              x: numericValue,
              y: entry.happinessRating
            };
          });
        }
      }

      // Step 7: Update state if we have valid data
      if (newScatterData.length > 0) {
        setScatterData(newScatterData);
        setIsModalOpen(true);
      } else {
        // Show modal with message that not enough data is available
        setScatterData([]);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error("Error processing factor:", selectedFactor, error);
    }
  }, [selectedFactor, entries, minimumEntries, getInternalName, booleanFactors, isBooleanFactor, getDisplayName, isDarkMode]);
  
  // Function to calculate Pearson correlation
  const calculatePearsonCorrelation = (x: number[], y: number[]): number => {
    const n = x.length;
    if (n !== y.length) return 0;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
    const sumX2 = x.reduce((a, b) => a + b * b, 0);
    const sumY2 = y.reduce((a, b) => a + b * b, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  };
  
  // Function to calculate point-biserial correlation (for boolean variables)
  const calculatePointBiserialCorrelation = (x: boolean[], y: number[]): number => {
    const n = x.length;
    if (n !== y.length) return 0;

    const trueGroup = y.filter((_, i) => x[i]);
    const falseGroup = y.filter((_, i) => !x[i]);

    if (trueGroup.length === 0 || falseGroup.length === 0) return 0;

    const trueMean = trueGroup.reduce((a, b) => a + b, 0) / trueGroup.length;
    const falseMean = falseGroup.reduce((a, b) => a + b, 0) / falseGroup.length;
    const yMean = y.reduce((a, b) => a + b, 0) / n;

    const yStdDev = Math.sqrt(
      y.reduce((a, b) => a + Math.pow(b - yMean, 2), 0) / (n - 1)
    );

    if (yStdDev === 0) return 0;

    const p = trueGroup.length / n;
    const q = 1 - p;

    return (trueMean - falseMean) * Math.sqrt(p * q) / yStdDev;
  };
  
  // Helper function to get color based on correlation value
  const getCorrelationColor = (correlation: number) => {
    const absCorrelation = Math.abs(correlation);
    
    if (absCorrelation < 0.1) return 'text-gray-500';
    if (correlation > 0) return 'text-green-600';
    return 'text-red-600';
  };
  
  // Helper function to get color for stress correlation (inverted logic)
  // NEGATIVE CORRELATION WITH STRESS = GOOD (GREEN), POSITIVE = BAD (RED)
  const getStressCorrelationColor = (correlation: number) => {
    const absCorrelation = Math.abs(correlation);
    
    if (absCorrelation < 0.1) return 'text-gray-500';
    if (correlation < 0) return 'text-green-600'; // NEGATIVE = LESS STRESS = GOOD
    return 'text-red-600'; // POSITIVE = MORE STRESS = BAD
  };
  
  const formatDecimal = (num: number) => {
    return num.toFixed(2);
  };
  
  // Generate options for scatter plot
  const getScatterOptions = (factorName: string): any => {
    // Determine if this is a boolean factor
    const isBoolean = isBooleanFactor(factorName);
    const xTitle = isBoolean ? '' : getDisplayName(factorName);
    
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: `${getDisplayName(factorName)} vs. Happiness`,
          color: isDarkMode ? 'rgba(209, 213, 219, 0.8)' : 'rgba(75, 85, 99, 0.8)',
          font: {
            family: 'CustomChartFont, serif',
          },
        },
        tooltip: {
          titleFont: {
            family: 'CustomChartFont, serif',
          },
          bodyFont: {
            family: 'CustomChartFont, serif',
          },
          callbacks: {
            label: function(context: any) {
              if (isBoolean) {
                const labels = ['No', 'Yes'];
                return `${labels[context.parsed.x]}: ${context.parsed.y.toFixed(1)} happiness`;
              }
              return `(${context.parsed.x}, ${context.parsed.y})`;
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: xTitle,
            color: isDarkMode ? 'rgba(209, 213, 219, 0.8)' : 'rgba(75, 85, 99, 0.8)',
            font: {
              family: 'CustomChartFont, serif',
            },
          },
          ticks: {
            color: isDarkMode ? 'rgba(209, 213, 219, 0.8)' : 'rgba(75, 85, 99, 0.8)',
            font: {
              family: 'CustomChartFont, serif',
            },
            ...(isBoolean ? {
              callback: function(value: any) {
                return ['No', 'Yes'][value];
              }
            } : {})
          },
          grid: {
            color: isDarkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(209, 213, 219, 0.5)',
          }
        },
        y: {
          title: {
            display: true,
            text: 'Happiness Rating',
            color: isDarkMode ? 'rgba(209, 213, 219, 0.8)' : 'rgba(75, 85, 99, 0.8)',
            font: {
              family: 'CustomChartFont, serif',
            },
          },
          min: 0,
          max: 10,
          ticks: {
            color: isDarkMode ? 'rgba(209, 213, 219, 0.8)' : 'rgba(75, 85, 99, 0.8)',
            font: {
              family: 'CustomChartFont, serif',
            },
          },
          grid: {
            color: isDarkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(209, 213, 219, 0.5)',
          }
        }
      }
    };
  };
  
  // Update scatter chart data to use the correct colors
  const getScatterChartData = (factorName: string): any => {
    if (!selectedFactor || entries.length < 2) return null;
    
    // USE PRE-CALCULATED SCATTER DATA FOR ALL FACTORS (ALREADY PROCESSED CORRECTLY)
    if (scatterData.length > 0) {
      return {
        datasets: [
          {
            label: selectedFactor,
            data: scatterData,
            backgroundColor: isDarkMode ? 'rgba(79, 70, 229, 0.7)' : 'rgba(244, 63, 94, 0.7)',
            borderColor: isDarkMode ? 'rgb(79, 70, 229)' : 'rgb(244, 63, 94)',
            borderWidth: 1,
            pointRadius: 5,
            pointHoverRadius: 7,
          }
        ]
      };
    }
    
    // FALLBACK IF NO SCATTER DATA (SHOULDN'T HAPPEN, BUT JUST IN CASE)
    return null;
  };
  
  // Time series chart options
  const getTimeSeriesChartOptions = useCallback(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: isDarkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        titleColor: isDarkMode ? 'rgb(229, 231, 235)' : 'rgb(17, 24, 39)',
        bodyColor: isDarkMode ? 'rgb(229, 231, 235)' : 'rgb(17, 24, 39)',
        borderColor: isDarkMode ? 'rgb(75, 85, 99)' : 'rgb(229, 231, 235)',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: (context: any) => {
            const value = context.parsed.y;
            const count = entryCounts[context.dataIndex];
            return [
              `Happiness: ${value.toFixed(1)}`,
              `Entries: ${count}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          color: isDarkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(229, 231, 235, 0.2)'
        },
        ticks: {
          color: isDarkMode ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)',
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        beginAtZero: true,
        max: 10,
        grid: {
          color: isDarkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(229, 231, 235, 0.2)'
        },
        ticks: {
          color: isDarkMode ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)',
          stepSize: 2
        }
      }
    }
  }), [isDarkMode, entryCounts]);
  
  // Generate options for time series chart
  const getFactorTimeSeriesOptions = (factorName: string): any => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: `${getDisplayName(factorName)} Over Time`,
          color: isDarkMode ? 'rgba(209, 213, 219, 0.8)' : 'rgba(75, 85, 99, 0.8)',
          font: {
            family: 'CustomChartFont, serif',
          },
        },
        tooltip: {
          backgroundColor: isDarkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          titleColor: isDarkMode ? 'rgb(229, 231, 235)' : 'rgb(17, 24, 39)',
          bodyColor: isDarkMode ? 'rgb(229, 231, 235)' : 'rgb(17, 24, 39)',
          borderColor: isDarkMode ? 'rgb(75, 85, 99)' : 'rgb(229, 231, 235)',
          borderWidth: 1,
          padding: 12,
          titleFont: {
            family: 'CustomChartFont, serif',
          },
          bodyFont: {
            family: 'CustomChartFont, serif',
          },
          callbacks: {
            label: function(context: any) {
              const index = context.dataIndex;
              const count = factorCounts[index];
              // USE isBooleanFactor TO CHECK BOTH BUILT-IN AND CUSTOM BOOLEAN CATEGORIES
              if (isBooleanFactor(factorName)) {
                // ROUND TO HANDLE ANY FLOATING POINT ISSUES
                const roundedValue = Math.round(context.parsed.y);
                return `${context.dataset.label}: ${roundedValue === 1 ? 'Yes' : 'No'} (${count}x)`;
              }
              return `${context.dataset.label}: ${context.parsed.y.toFixed(1)} (${count}x)`;
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Date',
            color: isDarkMode ? 'rgba(209, 213, 219, 0.8)' : 'rgba(75, 85, 99, 0.8)',
            font: {
              family: 'CustomChartFont, serif',
            },
          },
          ticks: {
            color: isDarkMode ? 'rgba(209, 213, 219, 0.8)' : 'rgba(75, 85, 99, 0.8)',
            font: {
              family: 'CustomChartFont, serif',
            },
          },
          grid: {
            color: isDarkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(209, 213, 219, 0.5)',
          }
        },
        y: {
          title: {
            display: true,
            text: getDisplayName(factorName),
            color: isDarkMode ? 'rgba(209, 213, 219, 0.8)' : 'rgba(75, 85, 99, 0.8)',
            font: {
              family: 'CustomChartFont, serif',
            },
          },
          // FOR BOOLEAN FACTORS, ONLY SHOW TWO TICKS (0 AND 1)
          ...(isBooleanFactor(factorName) ? {
            min: 0,
            max: 1,
            ticks: {
              stepSize: 1,
              maxTicksLimit: 2,
              color: isDarkMode ? 'rgba(209, 213, 219, 0.8)' : 'rgba(75, 85, 99, 0.8)',
              font: {
                family: 'CustomChartFont, serif',
              },
              callback: function(value: any) {
                // ONLY SHOW LABELS FOR EXACTLY 0 AND 1
                if (value === 0) return 'No';
                if (value === 1) return 'Yes';
                return '';
              }
            }
          } : {
            ticks: {
              color: isDarkMode ? 'rgba(209, 213, 219, 0.8)' : 'rgba(75, 85, 99, 0.8)',
              font: {
                family: 'CustomChartFont, serif',
              },
            }
          }),
          grid: {
            color: isDarkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(209, 213, 219, 0.5)',
          }
        }
      }
    };
  };
  
  // Helper function to format factor names for display
  const formatFactorName = getDisplayName;
  
  // SORT CORRELATIONS BASED ON SELECTED COLUMN AND DIRECTION
  const sortedCorrelations = useMemo(() => {
    const sorted = [...correlations];
    sorted.sort((a, b) => {
      let aValue: number;
      let bValue: number;
      
      if (sortColumn === 'happiness') {
        aValue = Math.abs(a.correlation);
        bValue = Math.abs(b.correlation);
      } else {
        // FOR STRESS, HANDLE NULL VALUES BY PUTTING THEM LAST
        if (a.stressCorrelation === null && b.stressCorrelation === null) return 0;
        if (a.stressCorrelation === null) return 1;
        if (b.stressCorrelation === null) return -1;
        aValue = Math.abs(a.stressCorrelation);
        bValue = Math.abs(b.stressCorrelation);
      }
      
      return sortDirection === 'desc' ? bValue - aValue : aValue - bValue;
    });
    return sorted;
  }, [correlations, sortColumn, sortDirection]);
  
  // HANDLE COLUMN HEADER CLICK FOR SORTING
  const handleSort = (column: 'happiness' | 'stress') => {
    if (sortColumn === column) {
      // TOGGLE DIRECTION IF SAME COLUMN
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
    } else {
      // SWITCH TO NEW COLUMN, DEFAULT TO DESC
      setSortColumn(column);
      setSortDirection('desc');
    }
  };
  
  // CHECK IF COMPONENT IS MOUNTED (FOR PORTAL)
  useEffect(() => {
    setMounted(true);
  }, []);

  // LOAD AND SET CHART FONT USING FONTFACE API
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // CHECK IF FONT IS ALREADY LOADED
    const checkFontLoaded = async () => {
      try {
        // USE FONTFACE API TO LOAD FONT
        const font = new FontFace('CustomChartFont', 'url(/font.ttf)');
        await font.load();
        document.fonts.add(font);
        
        // SET CHART DEFAULT FONT
        ChartJS.defaults.font.family = 'CustomChartFont, serif';
        setFontLoaded(true);
      } catch (error) {
        console.error('Error loading font:', error);
        // FALLBACK TO SERIF IF FONT FAILS TO LOAD
        ChartJS.defaults.font.family = 'serif';
        setFontLoaded(true);
      }
    };
    
    // CHECK IF FONT IS ALREADY AVAILABLE
    if (document.fonts.check('1em CustomChartFont')) {
      ChartJS.defaults.font.family = 'CustomChartFont, serif';
      setFontLoaded(true);
    } else {
      // WAIT FOR FONTS TO BE READY, THEN LOAD
      document.fonts.ready.then(() => {
        if (!document.fonts.check('1em CustomChartFont')) {
          checkFontLoaded();
        } else {
          ChartJS.defaults.font.family = 'CustomChartFont, serif';
          setFontLoaded(true);
        }
      });
    }
  }, []);

  // PREVENT BODY SCROLL WHEN MODAL IS OPEN
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

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
  
  if (entries.length < minimumEntries) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500">
          Add at least {minimumEntries} entries to see insights about what affects your happiness.
        </p>
      </div>
    );
  }
  
  // MODAL CONTENT
  const modalContent = isModalOpen && selectedFactor && mounted ? (
    <>
      {/* BACKDROP - COVERS ENTIRE SCREEN */}
      <div 
        className="fixed top-0 left-0 right-0 bottom-0 z-[9999] bg-black/40 dark:bg-black/60"
        style={{ 
          backdropFilter: 'blur(8px)', 
          WebkitBackdropFilter: 'blur(8px)',
          width: '100vw',
          height: '100vh',
          position: 'fixed'
        }}
        onClick={() => {
          setIsModalOpen(false);
          setSelectedFactor(null);
        }}
      />
      
      {/* MODAL CONTENT */}
      <div 
        className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none"
      >
        <div 
          className="glass-card p-2 w-full max-w-5xl h-[90vh] max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-end mb-1">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setSelectedFactor(null);
              }}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex flex-col gap-2 flex-1 min-h-0">
            {selectedFactor && scatterData.length > 0 ? (
              <div className="flex-1 min-h-0 w-full">
                <Scatter 
                  options={getScatterOptions(selectedFactor)} 
                  data={getScatterChartData(selectedFactor)} 
                />
              </div>
            ) : null}
            
            {factorTimeSeriesData && factorTimeSeriesData.datasets[0].data.length > 0 ? (
              <div className="flex-1 min-h-0 w-full">
                <Line 
                  options={getFactorTimeSeriesOptions(selectedFactor)} 
                  data={factorTimeSeriesData} 
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  ) : null;

  return (
    <>
      {/* Modal for scatter plot and time series */}
      {mounted && modalContent && createPortal(modalContent, document.body)}
      
      <div>
        {/* View mode tabs */}
        <div className="flex flex-row space-x-2 mb-6">
          <button 
            onClick={() => setViewMode('correlations')}
            className={`px-4 py-2 rounded-lg transition-colors ${viewMode === 'correlations' ? 'bg-rose-400 dark:bg-indigo-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
            Correlations
          </button>
          <button 
            onClick={() => setViewMode('matrix')}
            className={`px-4 py-2 rounded-lg transition-colors ${viewMode === 'matrix' ? 'bg-rose-400 dark:bg-indigo-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
            Matrix View
          </button>
        </div>
        
        {viewMode === 'correlations' ? (
          <>
            <div className="">
              <h3 className="hidden sm:block text-subheader mb-4">Factors Affecting Your Happiness & Stress</h3>
              <div className="glass-card p-2 sm:p-6 rounded-lg overflow-hidden">
                <div className="overflow-x-auto sm:overflow-x-auto">
                  <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th scope="col" className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Factor</th>
                        <th 
                          scope="col" 
                          className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 select-none"
                          onClick={() => handleSort('happiness')}
                        >
                          <div className="flex items-center gap-1">
                            Happiness
                            {sortColumn === 'happiness' && (
                              <span className="text-gray-700 dark:text-gray-300">
                                {sortDirection === 'desc' ? '↓' : '↑'}
                              </span>
                            )}
                          </div>
                        </th>
                        <th 
                          scope="col" 
                          className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 select-none"
                          onClick={() => handleSort('stress')}
                        >
                          <div className="flex items-center gap-1">
                            Stress
                            {sortColumn === 'stress' && (
                              <span className="text-gray-700 dark:text-gray-300">
                                {sortDirection === 'desc' ? '↓' : '↑'}
                              </span>
                            )}
                          </div>
                        </th>
                        <th scope="col" className="hidden sm:table-cell px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {sortedCorrelations.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 sm:px-6 py-4 text-center text-description">
                            No correlation data available
                          </td>
                        </tr>
                      ) : (
                        sortedCorrelations.map((correlation, index) => (
                          <tr 
                            key={index} 
                            className={`${selectedFactor === correlation.factor ? 'bg-pink-50/50 dark:bg-indigo-900/20' : 'hover:bg-gray-50/50 dark:hover:bg-gray-800/50'} cursor-pointer`}
                            onClick={() => setSelectedFactor(correlation.factor)}
                          >
                            <td className="px-2 sm:px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                              {formatFactorName(correlation.factor)}
                            </td>
                            <td className={`px-2 sm:px-6 py-4 text-sm ${getCorrelationColor(correlation.correlation)}`}>
                              {formatDecimal(correlation.correlation)}
                            </td>
                            <td className={`px-2 sm:px-6 py-4 text-sm ${correlation.stressCorrelation !== null ? getStressCorrelationColor(correlation.stressCorrelation) : 'text-gray-400'}`}>
                              {correlation.stressCorrelation !== null ? formatDecimal(correlation.stressCorrelation) : 'N/A'}
                            </td>
                            <td className="hidden sm:table-cell px-2 sm:px-6 py-4 whitespace-nowrap text-sm">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedFactor(correlation.factor);
                                }}
                                className="text-rose-600 hover:text-rose-900 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="glass-card p-4 sm:p-6 rounded-lg">
            <h3 className="text-subheader mb-4">Feature Correlation Matrix</h3>
            <div className="relative">
              <CorrelationMatrix />
            </div>
            <div className="mt-4">
              <p className="text-description">
                This matrix shows correlations between different factors. Deeper colors indicate stronger relationships.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
} 