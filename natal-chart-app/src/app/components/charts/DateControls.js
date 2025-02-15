'use client'
import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

const DateControls = ({
  selectedDate,
  selectedTime,
  minDate,
  maxDate,
  onDateChange,
  onTimeChange,
  onBoundsChange
}) => {
  // Add client-side only state to prevent hydration mismatch
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleDateBoundsChange = (e, bound) => {
    onBoundsChange(e, bound);
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-cyan-300 text-sm mb-1">Min Date</label>
          <input
            type="date"
            value={minDate}
            onChange={(e) => handleDateBoundsChange(e, 'min')}
            className="w-full bg-gray-900 border border-cyan-500/30 rounded p-2 text-cyan-300 focus:outline-none focus:border-cyan-400"
          />
        </div>
        <div>
          <label className="block text-cyan-300 text-sm mb-1">Max Date</label>
          <input
            type="date"
            value={maxDate}
            onChange={(e) => handleDateBoundsChange(e, 'max')}
            className="w-full bg-gray-900 border border-cyan-500/30 rounded p-2 text-cyan-300 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      <div className="space-y-4 mb-4">
        <div className="flex gap-4">
          <input
            type="date"
            value={selectedDate}
            min={minDate}
            max={maxDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="bg-gray-900 border border-cyan-500/30 rounded p-2 flex-1 text-cyan-300 focus:outline-none focus:border-cyan-400"
          />
          <div className="flex items-center gap-2 border border-cyan-500/30 rounded p-2 flex-1 bg-gray-900">
            {/* Only render Clock icon on client side */}
            {isMounted && <Clock className="w-5 h-5 text-cyan-400" />}
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => onTimeChange(e.target.value)}
              className="flex-1 bg-transparent text-cyan-300 focus:outline-none"
            />
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-cyan-300 text-sm mb-1">
            <span className="font-mono">{selectedDate}</span>
          </div>
          <input
            type="range"
            min={new Date(minDate).getTime() / 1000}
            max={new Date(maxDate).getTime() / 1000}
            step={86400}
            value={new Date(selectedDate).getTime() / 1000}
            onChange={(e) => {
              const date = new Date(e.target.value * 1000);
              onDateChange(date.toISOString().split('T')[0]);
            }}
            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </div>
      </div>
    </div>
  );
};

export default DateControls;