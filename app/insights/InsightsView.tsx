'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
import { format, subDays } from 'date-fns';
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
  alcohol: boolean;
  alcoholUnits: number | null;
  weed: boolean;
  weedAmount: number | null;
  meditation: boolean;
  meditationTime: number | null;
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
  description: string;
};

export default function InsightsView({ entries, minimumEntries }: InsightsViewProps) {
  const [correlations, setCorrelations] = useState<Correlation[]>([]);
  const [selectedFactor, setSelectedFactor] = useState<string | null>(null);
  const [scatterData, setScatterData] = useState<{ x: number; y: number }[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'correlations' | 'trends' | 'matrix'>('correlations');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Mapping of internal factor names to display names
  const factorNameMap = useMemo<Record<string, string>>(() => ({
    sleepHours: 'Sleep Hours',
    sleepQuality: 'Sleep Quality',
    exercise: 'Exercise',
    exerciseTime: 'Exercise Time',
    meditation: 'Meditation',
    meditationTime: 'Meditation Time',
    alcohol: 'Alcohol Consumption',
    alcoholUnits: 'Alcohol Units',
    weed: 'Weed Use',
    weedAmount: 'Weed Amount',
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
  const booleanFactors = useMemo(() => ['exercise', 'meditation', 'alcohol', 'weed'], []);
  
  // Helper function to get display name from internal name
  const getDisplayName = useCallback((internalName: string): string => {
    // Check if it's a custom category first
    if (entries.length > 0 && entries[0].customCategories.some(cat => cat.name === internalName)) {
      return internalName;
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
    
    // Then check if it's a display name that maps to a boolean factor
    const internalName = getInternalName(factorName);
    return booleanFactors.includes(internalName);
  }, [booleanFactors, getInternalName]);
  
  // Prepare time series data for the happiness trend chart
  const prepareTimeSeriesData = useCallback(() => {
    if (entries.length < 2) return;
    
    // Sort entries by date (oldest first)
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Format dates and get happiness values
    const dates = sortedEntries.map(entry => format(new Date(entry.date), 'MMM d'));
    const happinessValues = sortedEntries.map(entry => entry.happinessRating);
    
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
  }, [entries]);
  
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
          switch (factor) {
            case 'sleepHours':
              return entry.sleepHours;
            case 'sleepQuality':
              return entry.sleepQuality;
            case 'exerciseTime':
              return entry.exercise ? entry.exerciseTime || 0 : 0;
            case 'meditationTime':
              return entry.meditation ? entry.meditationTime || 0 : 0;
            case 'alcoholUnits':
              return entry.alcohol ? entry.alcoholUnits || 0 : 0;
            case 'weedAmount':
              return entry.weed ? entry.weedAmount || 0 : 0;
            case 'socialTime':
              return entry.socialTime || 0;
            case 'workHours':
              return entry.workHours || 0;
            case 'meals':
              return entry.meals || 0;
            case 'foodQuality':
              return entry.foodQuality || 0;
            case 'stressLevel':
              return entry.stressLevel;
            default:
              // Check if it's a custom category
              const customCategory = entry.customCategories.find(cat => cat.name === factor);
              return customCategory ? customCategory.value : 0;
          }
        });
      };

      // Helper function to get boolean values for a factor
      const getBooleanValues = (factor: string) => {
        return entries.map(entry => {
          switch (factor) {
            case 'exercise':
              return entry.exercise;
            case 'meditation':
              return entry.meditation;
            case 'alcohol':
              return entry.alcohol;
            case 'weed':
              return entry.weed;
            default:
              return false;
          }
        });
      };

      // Calculate correlations for numeric factors
      const numericFactors = [
        'sleepHours',
        'sleepQuality',
        'exerciseTime',
        'meditationTime',
        'alcoholUnits',
        'weedAmount',
        'socialTime',
        'workHours',
        'meals',
        'foodQuality',
        'stressLevel'
      ];

      // Add custom categories to numeric factors
      if (entries.length > 0) {
        const firstEntry = entries[0];
        firstEntry.customCategories.forEach(cat => {
          if (cat.type === 'numeric' || cat.type === 'scale') {
            numericFactors.push(cat.name);
          } else if (cat.type === 'boolean') {
            // Custom boolean categories will be added later
          }
        });
      }

      numericFactors.forEach(factor => {
        const values = getNumericValues(factor);
        const correlation = calculatePearsonCorrelation(values, entries.map(e => e.happinessRating));
        if (!isNaN(correlation)) {
          correlations.push({
            factor,
            correlation,
            description: getCorrelationDescription(factor, correlation)
          });
        }
      });

      // Calculate correlations for boolean factors
      const customBooleanFactors = [...booleanFactors];
      
      // Add custom boolean categories
      if (entries.length > 0) {
        const firstEntry = entries[0];
        firstEntry.customCategories.forEach(cat => {
          if (cat.type === 'boolean') {
            customBooleanFactors.push(cat.name);
          }
        });
      }
      
      customBooleanFactors.forEach(factor => {
        let values: boolean[];
        
        // Check if this is a custom boolean category
        if (entries.length > 0 && entries[0].customCategories.some(cat => cat.name === factor && cat.type === 'boolean')) {
          values = entries.map(entry => {
            const customCat = entry.customCategories.find(cat => cat.name === factor);
            return customCat ? customCat.value === 1 : false;
          });
        } else {
          values = getBooleanValues(factor);
        }
        
        const correlation = calculatePointBiserialCorrelation(values, entries.map(e => e.happinessRating));
        if (!isNaN(correlation)) {
          correlations.push({
            factor,
            correlation,
            description: getCorrelationDescription(factor, correlation)
          });
        }
      });

      // Sort correlations by absolute value
      correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
      setCorrelations(correlations);
    };
    
    calculateCorrelations();
    
    // Prepare time series data for happiness
    prepareTimeSeriesData();
    
  }, [entries, minimumEntries, prepareTimeSeriesData]);
  
  // Update scatter data when selectedFactor changes
  useEffect(() => {
    if (!selectedFactor || entries.length < minimumEntries) return;
    
    try {
      // Step 1: Determine the internal factor name
      const internalName = getInternalName(selectedFactor);
      
      // Step 2: Generate appropriate scatter data based on factor type
      let newScatterData: { x: number; y: number }[] = [];
      
      // Step 3: Handle boolean factors (exercise, meditation, alcohol, weed)
      if (booleanFactors.includes(internalName)) {
        // For boolean factors, create a bar chart showing happiness averages for true/false values
        const validEntriesWithKey = entries.filter(e => internalName in e && e[internalName as keyof DailyEntry] !== undefined);
        
        if (validEntriesWithKey.length >= minimumEntries) {
          // Group by true/false value
          const trueEntries = validEntriesWithKey.filter(e => e[internalName as keyof DailyEntry] === true);
          const falseEntries = validEntriesWithKey.filter(e => e[internalName as keyof DailyEntry] === false);
          
          // Calculate averages
          const trueAvg = trueEntries.length > 0 
            ? trueEntries.reduce((sum, e) => sum + e.happinessRating, 0) / trueEntries.length 
            : 0;
          const falseAvg = falseEntries.length > 0 
            ? falseEntries.reduce((sum, e) => sum + e.happinessRating, 0) / falseEntries.length 
            : 0;
          
          newScatterData = [
            { x: 0, y: falseAvg },
            { x: 1, y: trueAvg }
          ];
        }
      }
      // Step 4: Handle custom categories
      else if (entries.length > 0 && entries.some(e => 
        e.customCategories && Array.isArray(e.customCategories) && e.customCategories.some(cat => cat.name === selectedFactor)
      )) {
        // Get entries that have this custom category
        const validEntries = entries.filter(e => 
          e.customCategories && Array.isArray(e.customCategories) && e.customCategories.some(cat => cat.name === selectedFactor)
        );
        
        if (validEntries.length >= minimumEntries) {
          newScatterData = validEntries.map(entry => {
            const category = entry.customCategories.find(cat => cat.name === selectedFactor);
            return {
              x: category ? category.value : 0,
              y: entry.happinessRating
            };
          });
        }
      }
      // Step 5: Handle numeric factors
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

      // Step 6: Update state if we have valid data
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
  }, [selectedFactor, entries, minimumEntries, getInternalName, booleanFactors, isBooleanFactor]);
  
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
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
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
          },
          ticks: isBoolean ? {
            callback: function(value: any) {
              return ['No', 'Yes'][value];
            }
          } : undefined
        },
        y: {
          title: {
            display: true,
            text: 'Happiness Rating',
          },
          min: 0,
          max: 10
        }
      }
    };
  };
  
  // Generate scatter chart data
  const getScatterChartData = (factorName: string): any => {
    return {
      datasets: [
        {
          label: `${getDisplayName(factorName)} vs. Happiness`,
          data: scatterData,
          backgroundColor: 'rgba(79, 70, 229, 0.6)',
          pointRadius: isBooleanFactor(factorName) ? 10 : 6,
          pointHoverRadius: isBooleanFactor(factorName) ? 12 : 8,
        },
      ],
    };
  };
  
  // Time series chart options
  const timeSeriesOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Your Happiness Over Time',
      },
    },
    scales: {
      y: {
        min: 0,
        max: 10,
        title: {
          display: true,
          text: 'Happiness Rating'
        }
      }
    }
  };
  
  // Get correlation description
  const getCorrelationDescription = (factor: string, correlation: number) => {
    const factorNames: { [key: string]: string } = {
      sleepHours: 'Sleep Hours',
      sleepQuality: 'Sleep Quality',
      exercise: 'Exercise',
      exerciseTime: 'Exercise Time',
      meditation: 'Meditation',
      meditationTime: 'Meditation Time',
      alcohol: 'Alcohol Consumption',
      alcoholUnits: 'Alcohol Units',
      weed: 'Weed Use',
      weedAmount: 'Weed Amount',
      socialTime: 'Social Time',
      workHours: 'Work Hours',
      meals: 'Number of Meals',
      foodQuality: 'Food Quality',
      stressLevel: 'Stress Level'
    };

    const factorName = factorNames[factor] || factor;
    const strength = Math.abs(correlation);
    const direction = correlation > 0 ? 'positive' : 'negative';

    if (strength < 0.2) {
      return `No significant correlation between ${factorName} and happiness`;
    } else if (strength < 0.4) {
      return `Weak ${direction} correlation between ${factorName} and happiness`;
    } else if (strength < 0.6) {
      return `Moderate ${direction} correlation between ${factorName} and happiness`;
    } else if (strength < 0.8) {
      return `Strong ${direction} correlation between ${factorName} and happiness`;
    } else {
      return `Very strong ${direction} correlation between ${factorName} and happiness`;
    }
  };
  
  // Helper function to format factor names for display
  const formatFactorName = getDisplayName;
  
  if (entries.length < minimumEntries) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500">
          Add at least {minimumEntries} entries to see insights about what affects your happiness.
        </p>
      </div>
    );
  }
  
  return (
    <div>
      {/* View mode tabs */}
      <div className="flex space-x-2 mb-6">
        <button 
          onClick={() => setViewMode('correlations')}
          className={`px-4 py-2 rounded-lg transition-colors ${viewMode === 'correlations' ? 'bg-rose-400 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
          Correlations
        </button>
        <button 
          onClick={() => setViewMode('trends')}
          className={`px-4 py-2 rounded-lg transition-colors ${viewMode === 'trends' ? 'bg-rose-400 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
          Happiness Trend
        </button>
        <button 
          onClick={() => setViewMode('matrix')}
          className={`px-4 py-2 rounded-lg transition-colors ${viewMode === 'matrix' ? 'bg-rose-400 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
          Matrix View
        </button>
      </div>
      
      {viewMode === 'correlations' ? (
        <>
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">Factors Affecting Your Happiness</h3>
            <div className="glass-card p-4 sm:p-6 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Factor</th>
                      <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correlation</th>
                      <th scope="col" className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interpretation</th>
                      <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {correlations.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 sm:px-6 py-4 text-center text-gray-500">
                          No correlation data available
                        </td>
                      </tr>
                    ) : (
                      correlations.map((correlation, index) => (
                        <tr key={index} className={selectedFactor === correlation.factor ? 'bg-pink-50/50' : 'hover:bg-gray-50/50'}>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatFactorName(correlation.factor)}
                          </td>
                          <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm ${getCorrelationColor(correlation.correlation)}`}>
                            {formatDecimal(correlation.correlation)}
                          </td>
                          <td className="hidden sm:table-cell px-6 py-4 text-sm text-gray-500">{correlation.description}</td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => setSelectedFactor(correlation.factor)}
                              className="text-pink-600 hover:text-pink-900 transition-colors"
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
          
          {/* Modal for scatter plot */}
          {isModalOpen && selectedFactor && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="glass-card p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">{formatFactorName(selectedFactor)} vs. Happiness</h3>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setSelectedFactor(null);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="h-96 relative">
                  {selectedFactor && scatterData.length > 0 ? (
                    <Scatter 
                      options={getScatterOptions(selectedFactor)} 
                      data={getScatterChartData(selectedFactor)} 
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">Not enough data available for {formatFactorName(selectedFactor)}.</p>
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    {selectedFactor && (correlations.find(c => 
                      c.factor === selectedFactor || 
                      c.factor === getInternalName(selectedFactor))?.description || 
                      'No interpretation available')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      ) : viewMode === 'trends' ? (
        <div className="glass-card p-4 sm:p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Your Happiness Over Time</h3>
          <div className="h-64 relative">
            {timeSeriesData && <Line options={timeSeriesOptions} data={timeSeriesData} />}
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              This chart shows your happiness ratings over time. Look for patterns to understand how your happiness changes.
            </p>
          </div>
        </div>
      ) : (
        <div className="glass-card p-4 sm:p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Feature Correlation Matrix</h3>
          <div className="relative">
            <CorrelationMatrix />
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              This matrix shows correlations between different factors. Deeper colors indicate stronger relationships.
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 