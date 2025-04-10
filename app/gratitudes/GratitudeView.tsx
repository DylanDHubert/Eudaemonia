'use client';

import { useEffect, useState, useRef } from 'react';

interface Gratitude {
  id: string;
  content: string;
  createdAt: string;
}

export default function GratitudeView() {
  const [gratitudes, setGratitudes] = useState<Gratitude[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasOverflow, setHasOverflow] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchGratitudes = async () => {
      try {
        const response = await fetch('/api/gratitudes');
        if (response.ok) {
          const data = await response.json();
          setGratitudes(data);
        }
      } catch (error) {
        console.error('Error fetching gratitudes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGratitudes();
  }, []);

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current) {
        const hasVerticalOverflow = containerRef.current.scrollHeight > containerRef.current.clientHeight;
        setHasOverflow(hasVerticalOverflow);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [gratitudes]);

  if (loading) {
    return <div className="text-center py-2">Loading...</div>;
  }

  return (
    <div className="space-y-3 w-[95%] mx-auto">
      <h3 className="text-lg font-semibold text-rose-600 mb-3">Recent Gratitudes</h3>
      {gratitudes.length === 0 ? (
        <div className="text-center text-gray-500 text-sm">
          No gratitudes yet. Add your first one below!
        </div>
      ) : (
        <div className="relative rounded-lg">
          {hasOverflow && (
            <>
              <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none rounded-lg" />
              <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none rounded-lg" />
            </>
          )}
          <div 
            ref={containerRef}
            className="space-y-3 max-h-[365px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] rounded-lg"
          >
            {gratitudes.map((gratitude) => (
              <div 
                key={gratitude.id} 
                className="glass-card p-3"
              >
                <p className="text-gray-800 text-sm leading-relaxed line-clamp-3 overflow-hidden" title={gratitude.content}>
                  {gratitude.content}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(gratitude.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 