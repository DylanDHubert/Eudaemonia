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

  // Prepare time series data for the happiness trend chart
  const prepareTimeSeriesData = useCallback((entries: Entry[]) => {
    if (entries.length < 2) return;
    
    // Sort entries by date (oldest first)
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Format dates and get happiness values
    const dates = sortedEntries.map(entry => format(parseISO(entry.date), 'MMM d'));
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
  }, []);

  useEffect(() => {
    async function fetchEntries() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/entries?limit=90`);
        const data = await response.json();
        if (data.entries) {
          const formattedEntries = data.entries.map((entry: any) => ({
            id: entry.id,
            date: entry.date,
            happinessRating: entry.happinessRating
          }));
          prepareTimeSeriesData(formattedEntries);
        }
      } catch (error) {
        console.error('Error fetching entries for happiness chart:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEntries();
  }, [prepareTimeSeriesData]);

  // Time series chart options
  const timeSeriesOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
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

  if (isLoading) {
    return (
      <div className="w-full h-full animate-pulse">
        <div className="h-full bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!timeSeriesData || !timeSeriesData.labels || timeSeriesData.labels.length < 2) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-gray-500">Not enough data to display happiness trends.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <Line options={timeSeriesOptions} data={timeSeriesData} />
    </div>
  );
} 