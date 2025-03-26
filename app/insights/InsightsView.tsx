'use client';

import { useState, useEffect } from 'react';

// Types for our entries
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
  stressLevel: number;
  happinessRating: number;
  notes: string | null;
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
  
  useEffect(() => {
    if (entries.length < minimumEntries) {
      setCorrelations([]);
      return;
    }
    
    const calculateCorrelations = () => {
      // Factors to correlate with happiness
      const factors = [
        { key: 'sleepHours', name: 'Sleep Hours', type: 'numeric' },
        { key: 'sleepQuality', name: 'Sleep Quality', type: 'numeric' },
        { key: 'exercise', name: 'Exercise', type: 'boolean' },
        { key: 'exerciseTime', name: 'Exercise Time', type: 'numeric' },
        { key: 'alcohol', name: 'Alcohol', type: 'boolean' },
        { key: 'alcoholUnits', name: 'Alcohol Units', type: 'numeric' },
        { key: 'weed', name: 'Weed', type: 'boolean' },
        { key: 'weedAmount', name: 'Weed Amount', type: 'numeric' },
        { key: 'meditation', name: 'Meditation', type: 'boolean' },
        { key: 'meditationTime', name: 'Meditation Time', type: 'numeric' },
        { key: 'socialTime', name: 'Social Time', type: 'numeric' },
        { key: 'workHours', name: 'Work Hours', type: 'numeric' },
        { key: 'stressLevel', name: 'Stress Level', type: 'numeric' },
      ];
      
      const results: Correlation[] = [];
      
      factors.forEach(factor => {
        let correlation = 0;
        let description = '';
        
        if (factor.type === 'numeric') {
          // Only include entries where this factor is not null
          const validEntries = entries.filter(e => e[factor.key as keyof DailyEntry] !== null);
          
          if (validEntries.length >= minimumEntries) {
            // Calculate Pearson correlation for numeric factors
            const { r, description: desc } = calculatePearsonCorrelation(
              validEntries.map(e => Number(e[factor.key as keyof DailyEntry])),
              validEntries.map(e => e.happinessRating)
            );
            correlation = r;
            description = desc;
          } else {
            description = `Not enough data for ${factor.name} (need at least ${minimumEntries} entries)`;
          }
        }
        else if (factor.type === 'boolean') {
          // For boolean factors, compare happiness ratings when true vs false
          const { pointBiserial, description: desc } = calculatePointBiserialCorrelation(
            entries.map(e => Boolean(e[factor.key as keyof DailyEntry])),
            entries.map(e => e.happinessRating)
          );
          correlation = pointBiserial;
          description = desc;
        }
        
        results.push({
          factor: factor.name,
          correlation,
          description
        });
      });
      
      // Sort by absolute correlation value (strongest first)
      return results.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
    };
    
    setCorrelations(calculateCorrelations());
  }, [entries, minimumEntries]);
  
  useEffect(() => {
    if (selectedFactor && entries.length >= minimumEntries) {
      const factor = selectedFactor.toLowerCase().replace(/\s+/g, '');
      
      // Find the matching key in our data structure
      let factorKey: keyof DailyEntry;
      
      switch (factor) {
        case 'sleephours': factorKey = 'sleepHours'; break;
        case 'sleepquality': factorKey = 'sleepQuality'; break;
        case 'exercise': factorKey = 'exercise'; break;
        case 'exercisetime': factorKey = 'exerciseTime'; break;
        case 'alcohol': factorKey = 'alcohol'; break;
        case 'alcoholunits': factorKey = 'alcoholUnits'; break;
        case 'weed': factorKey = 'weed'; break;
        case 'weedamount': factorKey = 'weedAmount'; break;
        case 'meditation': factorKey = 'meditation'; break;
        case 'meditationtime': factorKey = 'meditationTime'; break;
        case 'socialtime': factorKey = 'socialTime'; break;
        case 'workhours': factorKey = 'workHours'; break;
        case 'stresslevel': factorKey = 'stressLevel'; break;
        default: return;
      }
      
      // For boolean factors, we'll create a bar chart-like visualization
      if (factorKey === 'exercise' || factorKey === 'alcohol' || factorKey === 'weed' || factorKey === 'meditation') {
        const trueValues = entries.filter(e => e[factorKey] === true).map(e => e.happinessRating);
        const falseValues = entries.filter(e => e[factorKey] === false).map(e => e.happinessRating);
        
        const trueAvg = trueValues.length ? trueValues.reduce((a, b) => a + b, 0) / trueValues.length : 0;
        const falseAvg = falseValues.length ? falseValues.reduce((a, b) => a + b, 0) / falseValues.length : 0;
        
        // We'll just use two points for the scatter plot in this case
        setScatterData([
          { x: 0, y: falseAvg },
          { x: 1, y: trueAvg }
        ]);
      } else {
        // For numeric factors, create scatter plot data
        const validEntries = entries.filter(e => e[factorKey] !== null);
        
        if (validEntries.length >= minimumEntries) {
          const scatter = validEntries.map(entry => ({
            x: Number(entry[factorKey]),
            y: entry.happinessRating
          }));
          
          setScatterData(scatter);
        }
      }
    }
  }, [selectedFactor, entries, minimumEntries]);
  
  // Function to calculate Pearson correlation
  const calculatePearsonCorrelation = (x: number[], y: number[]) => {
    const n = x.length;
    
    if (n === 0) return { r: 0, description: 'No data available' };
    
    // Calculate means
    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;
    
    // Calculate deviations
    let ssXY = 0;
    let ssXX = 0;
    let ssYY = 0;
    
    for (let i = 0; i < n; i++) {
      const devX = x[i] - meanX;
      const devY = y[i] - meanY;
      
      ssXY += devX * devY;
      ssXX += devX * devX;
      ssYY += devY * devY;
    }
    
    const r = ssXY / Math.sqrt(ssXX * ssYY);
    
    // Interpret the correlation
    let description = '';
    
    if (isNaN(r)) {
      return { r: 0, description: 'Unable to calculate correlation' };
    }
    
    const absR = Math.abs(r);
    
    if (absR < 0.1) {
      description = 'No correlation';
    } else if (absR < 0.3) {
      description = r > 0 ? 'Weak positive correlation' : 'Weak negative correlation';
    } else if (absR < 0.5) {
      description = r > 0 ? 'Moderate positive correlation' : 'Moderate negative correlation';
    } else if (absR < 0.7) {
      description = r > 0 ? 'Good positive correlation' : 'Good negative correlation';
    } else {
      description = r > 0 ? 'Strong positive correlation' : 'Strong negative correlation';
    }
    
    return { r, description };
  };
  
  // Function to calculate point-biserial correlation (for boolean variables)
  const calculatePointBiserialCorrelation = (x: boolean[], y: number[]) => {
    const n = x.length;
    
    if (n === 0) return { pointBiserial: 0, description: 'No data available' };
    
    // Convert boolean to 0/1
    const numericX = x.map(val => val ? 1 : 0);
    
    // Calculate means
    const meanX = numericX.reduce((a: number, b: number) => a + b, 0) / n;
    const meanY = y.reduce((a: number, b: number) => a + b, 0) / n;
    
    // Calculate group means
    const trueValues = y.filter((_, i) => x[i]);
    const falseValues = y.filter((_, i) => !x[i]);
    
    const meanTrue = trueValues.length ? trueValues.reduce((a: number, b: number) => a + b, 0) / trueValues.length : 0;
    const meanFalse = falseValues.length ? falseValues.reduce((a: number, b: number) => a + b, 0) / falseValues.length : 0;
    
    // Calculate standard deviation of y
    let ssYY = 0;
    for (let i = 0; i < n; i++) {
      const devY = y[i] - meanY;
      ssYY += devY * devY;
    }
    const stdY = Math.sqrt(ssYY / n);
    
    // Calculate point-biserial correlation
    const propTrue = trueValues.length / n;
    const propFalse = falseValues.length / n;
    
    const pointBiserial = ((meanTrue - meanFalse) / stdY) * Math.sqrt(propTrue * propFalse);
    
    // Interpret the correlation
    let description = '';
    
    if (isNaN(pointBiserial)) {
      return { pointBiserial: 0, description: 'Unable to calculate correlation' };
    }
    
    const difference = meanTrue - meanFalse;
    
    if (Math.abs(pointBiserial) < 0.1) {
      description = 'No effect';
    } else if (Math.abs(pointBiserial) < 0.3) {
      description = difference > 0 ? 'Slight positive effect' : 'Slight negative effect';
    } else if (Math.abs(pointBiserial) < 0.5) {
      description = difference > 0 ? 'Moderate positive effect' : 'Moderate negative effect';
    } else {
      description = difference > 0 ? 'Strong positive effect' : 'Strong negative effect';
    }
    
    return { pointBiserial, description };
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
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Factors Affecting Your Happiness</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Factor</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correlation</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interpretation</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {correlations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    No correlation data available
                  </td>
                </tr>
              ) : (
                correlations.map((correlation, index) => (
                  <tr key={index} className={selectedFactor === correlation.factor ? 'bg-indigo-50' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{correlation.factor}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${getCorrelationColor(correlation.correlation)}`}>
                      {formatDecimal(correlation.correlation)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{correlation.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => setSelectedFactor(correlation.factor)}
                        className="text-indigo-600 hover:text-indigo-900"
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
      
      {selectedFactor && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-4">{selectedFactor} vs. Happiness</h3>
          <div className="h-64 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-gray-500">Visualization coming soon</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              {correlations.find(c => c.factor === selectedFactor)?.description || 'No interpretation available'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 