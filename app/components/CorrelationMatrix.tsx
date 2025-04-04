'use client';

import React, { useState, useEffect, useMemo } from 'react';

interface Entry {
  id: string;
  date: string;
  sleepHours: number;
  sleepQuality: number;
  exercise: boolean;
  exerciseTime: number | null;
  alcohol: boolean;
  alcoholUnits: number | null;
  cannabis: boolean;
  cannabisAmount: number | null;
  meditation: boolean;
  meditationTime: number | null;
  socialTime: number | null;
  workHours: number | null;
  meals: number | null;
  foodQuality: number | null;
  stressLevel: number;
  happinessRating: number;
  notes: string | null;
}

export default function CorrelationMatrix() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        // Fetch entries
        const entriesResponse = await fetch('/api/entries?limit=90');
        const entriesData = await entriesResponse.json();
        
        if (entriesData.entries) {
          setEntries(entriesData.entries);
        }
      } catch (error) {
        console.error('Error fetching data for correlation matrix:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Define a subset of fields for smaller matrix with shorter display names for better alignment
  const displayFields = useMemo(() => [
    // Core metrics
    { id: 'happinessRating', name: 'Happiness' },
    { id: 'stressLevel', name: 'Stress' },
    
    // Sleep metrics
    { id: 'sleepHours', name: 'Sleep Hours' },
    
    // Exercise metrics
    { id: 'exercise', name: 'Exercise' },
    
    // Meditation metrics
    { id: 'meditation', name: 'Meditation' },
    
    // Substance metrics
    { id: 'alcohol', name: 'Alcohol' },
    { id: 'cannabis', name: 'Cannabis' },
    
    // Social and work metrics
    { id: 'socialTime', name: 'Social Time' },
    { id: 'workHours', name: 'Work Hours' },
    
    // Food metrics
    { id: 'meals', name: 'Meals' },
    { id: 'foodQuality', name: 'Food Quality' },
  ], []);

  // Calculate the correlation between two variables
  const calculateCorrelation = (fieldX: string, fieldY: string) => {
    if (entries.length < 10) return null; // Need enough data for meaningful correlation
    if (fieldX === fieldY) return 1.0; // Perfect correlation with self
    
    // Extract values
    const getFieldValue = (entry: Entry, fieldId: string) => {
      // Handle boolean fields
      if (fieldId === 'exercise') return entry.exercise ? 1 : 0;
      if (fieldId === 'alcohol') return entry.alcohol ? 1 : 0;
      if (fieldId === 'cannabis') return entry.cannabis ? 1 : 0;
      if (fieldId === 'meditation') return entry.meditation ? 1 : 0;
      
      // Handle numeric fields
      const value = (entry as any)[fieldId];
      return value !== null && value !== undefined ? value : null;
    };
    
    // Get all pairs of values for the two fields
    const pairs = entries.map(entry => {
      const x = getFieldValue(entry, fieldX);
      const y = getFieldValue(entry, fieldY);
      return { x, y };
    }).filter(pair => pair.x !== null && pair.y !== null);
    
    if (pairs.length < 10) return null; // Need at least 10 pairs
    
    // Calculate correlation
    const n = pairs.length;
    const sumX = pairs.reduce((sum, pair) => sum + pair.x, 0);
    const sumY = pairs.reduce((sum, pair) => sum + pair.y, 0);
    const sumXY = pairs.reduce((sum, pair) => sum + (pair.x * pair.y), 0);
    const sumXX = pairs.reduce((sum, pair) => sum + (pair.x * pair.x), 0);
    const sumYY = pairs.reduce((sum, pair) => sum + (pair.y * pair.y), 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    
    if (denominator === 0) return null;
    return numerator / denominator;
  };

  // Calculate color based on correlation value
  const getCorrelationColor = (correlation: number) => {
    // Absolute correlation strength determines color intensity
    const intensity = Math.min(Math.abs(correlation), 1);
    
    if (correlation === 1) {
      // Special case for perfect self-correlation (diagonal)
      return '#6c11ff'; // Lightest purple
    } else if (correlation > 0) {
      // Positive correlation: purple shades (matching happiness from heatmap)
      const purpleColors = ['#cc3258', '#c12e6b', '#b72b7d', '#ac2790', '#a123a2', '#9720b5', '#8c1cc7', '#8118da', '#7715ec', '#6c11ff'];
      const colorIndex = Math.min(Math.floor(intensity * 10), 9);
      return purpleColors[colorIndex];
    } else {
      // Negative correlation: rose shades
      const roseColors = ['#cc3258', '#c12e6b', '#b72b7d', '#ac2790', '#a123a2', '#9720b5', '#8c1cc7', '#8118da', '#7715ec', '#6c11ff'];
      const colorIndex = Math.min(Math.floor(intensity * 10), 9);
      return roseColors[colorIndex];
    }
  };

  // Format correlation for display
  const formatCorrelation = (correlation: number | null) => {
    if (correlation === null) return 'N/A';
    // Only show significant digits (without decimal for perfect correlations)
    if (correlation === 1) return '1';
    if (correlation === -1) return '-1';
    // Convert to integer percentage for cleaner display
    return Math.round(correlation * 100) + '%';
  };

  if (isLoading) {
    return (
      <div className="glass-card p-4 sm:p-6 animate-pulse">
        <div className="h-48 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (entries.length < 10) {
    return (
      <div className="glass-card p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-center text-gray-800">Feature Correlation Matrix</h3>
        <p className="text-gray-600 text-sm text-center">Add at least 10 entries to see correlations between different factors.</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 sm:p-6 w-full max-w-fit mx-auto">
      <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 pb-12 text-center text-gray-800">Feature Correlation Matrix</h3>
      
      <div className="flex">
        {/* Row labels */}
        <div className="flex flex-col mr-2 text-[8px] sm:text-xs text-gray-600">
          {displayFields.map((field, index) => (
            <div key={field.id} className="flex items-center justify-end w-[100px] h-[24px] mb-[2.1px]">
              {field.name}
            </div>
          ))}
        </div>
        
        {/* Column labels and heatmap grid */}
        <div className="flex flex-col">
          {/* Column labels */}
          <div className="flex mb-2">
            {displayFields.map((field, index) => (
              <div key={field.id} className="w-[24px] sm:w-[24px] mx-[2.1px] h-8 relative">
                <div 
                  className="absolute origin-bottom-left rotate-[-90deg] whitespace-nowrap text-[8px] sm:text-xs text-gray-600"
                  style={{ bottom: 0, left: 12 }}
                >
                  {field.name}
                </div>
              </div>
            ))}
          </div>
          
          {/* Heatmap grid */}
          <div className="overflow-x-auto">
            <div className="grid-display">
              {displayFields.map(fieldX => (
                <div key={fieldX.id} className="week-column">
                  {displayFields.map(fieldY => {
                    const correlation = calculateCorrelation(fieldX.id, fieldY.id);
                    
                    if (correlation === null) {
                      return (
                        <div 
                          key={`${fieldY.id}-${fieldX.id}`} 
                          className="day-cell no-data-cell"
                          title={`${fieldY.name} vs ${fieldX.name}: Insufficient data`}
                        />
                      );
                    }
                    
                    const backgroundColor = getCorrelationColor(correlation);
                    
                    return (
                      <div 
                        key={`${fieldY.id}-${fieldX.id}`} 
                        className="day-cell"
                        style={{ backgroundColor }}
                        title={`${fieldY.name} vs ${fieldX.name}: ${formatCorrelation(correlation)}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Correlation Legend */}
      <div className="mt-8 flex flex-col items-center">
        <div className="text-[8px] sm:text-xs text-gray-600 mb-2">Correlation Strength</div>
        <div className="flex h-4 w-full max-w-md rounded-sm overflow-hidden">
          {Array.from({ length: 10 }, (_, i) => {
            const correlation = (i + 1) / 10;
            return (
              <div 
                key={i}
                className="h-full flex-1"
                style={{ backgroundColor: getCorrelationColor(correlation) }}
                title={`${formatCorrelation(correlation)}`}
              />
            );
          })}
        </div>
        <div className="flex justify-between w-full max-w-md mt-4 text-[8px] sm:text-xs text-gray-600">
          <span>Strong Negative</span>
          <span>No Correlation</span>
          <span>Strong Positive</span>
        </div>
      </div>
    </div>
  );
} 