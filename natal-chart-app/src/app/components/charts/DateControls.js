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
    const newDate = e.target.value;
    
    if (bound === 'min') {
      // If new min date is after selected date, update selected date
      if (newDate > selectedDate) {
        onDateChange(newDate);
      }
    } else { // 'max'
      // If new max date is before selected date, update selected date
      if (newDate < selectedDate) {
        onDateChange(newDate);
      }
    }
    
    onBoundsChange(e, bound);
  };

  // When selectedDate changes, adjust min/max bounds if necessary
  const handleSelectedDateChange = (newDate) => {
    if (newDate < minDate) {
      // Update min date if selected date is earlier
      onBoundsChange({ target: { value: newDate } }, 'min');
    } else if (newDate > maxDate) {
      // Update max date if selected date is later
      onBoundsChange({ target: { value: newDate } }, 'max');
    }
    
    onDateChange(newDate);
  };

  // Convert time string to minutes for slider
  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    if (parts.length !== 2) return 0;
    
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    
    if (isNaN(hours) || isNaN(minutes)) return 0;
    return hours * 60 + minutes;
  };

  // Convert minutes back to time string
  const minutesToTime = (totalMinutes) => {
    if (isNaN(totalMinutes)) totalMinutes = 0;
    const hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  // Current time in minutes with safety checks
  const currentTimeMinutes = timeToMinutes(selectedTime);
  
  // Calculate timestamp values safely
  const getMinTimestamp = () => {
    try {
      return new Date(minDate || '2025-01-01').getTime() / 1000;
    } catch (e) {
      return new Date('2025-01-01').getTime() / 1000;
    }
  };
  
  const getMaxTimestamp = () => {
    try {
      return new Date(maxDate || '2025-12-31').getTime() / 1000;
    } catch (e) {
      return new Date('2025-12-31').getTime() / 1000;
    }
  };
  
  const getCurrentTimestamp = () => {
    try {
      return new Date(selectedDate || '2025-01-01').getTime() / 1000;
    } catch (e) {
      return new Date('2025-01-01').getTime() / 1000;
    }
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-cyan-300 text-sm mb-1">Min Date</label>
          <input
            type="date"
            value={minDate || ''}
            onChange={(e) => handleDateBoundsChange(e, 'min')}
            className="w-full bg-gray-900 rounded p-2 text-cyan-300 focus:outline-none focus:border-cyan-400"
          />
        </div>
        <div>
          <label className="block text-cyan-300 text-sm mb-1">Max Date</label>
          <input
            type="date"
            value={maxDate || ''}
            onChange={(e) => handleDateBoundsChange(e, 'max')}
            className="w-full bg-gray-900 rounded p-2 text-cyan-300 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      <div className="space-y-4 mb-4">
        <div className="flex gap-4">
          <input
            type="date"
            value={selectedDate || ''}
            min={minDate || ''}
            max={maxDate || ''}
            onChange={(e) => handleSelectedDateChange(e.target.value)}
            className="bg-gray-900 rounded p-2 flex-1 text-cyan-300 focus:outline-none focus:border-cyan-400"
          />
          <div className="flex items-center gap-2  rounded p-2 flex-1 bg-gray-900">
            {/* Only render Clock icon on client side */}
            {isMounted && <Clock className="w-5 h-5 text-cyan-400" />}
            <input
              type="time"
              value={selectedTime || ''}
              onChange={(e) => onTimeChange(e.target.value)}
              className="flex-1 bg-transparent text-cyan-300 focus:outline-none"
            />
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-cyan-300 text-sm mb-1">
            <span className="font-mono">{selectedDate || ''}</span>
          </div>
          <input
            type="range"
            min={getMinTimestamp()}
            max={getMaxTimestamp()}
            step={86400}
            value={getCurrentTimestamp()}
            onChange={(e) => {
              try {
                const date = new Date(parseInt(e.target.value) * 1000);
                if (!isNaN(date.getTime())) {
                  handleSelectedDateChange(date.toISOString().split('T')[0]);
                }
              } catch (error) {
                console.error("Error updating date:", error);
              }
            }}
            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </div>
        
        {/* Time slider */}
        <div>
          <div className="flex justify-between text-cyan-300 text-sm mb-1">
            <span className="font-mono">{selectedTime || '00:00'}</span>
            <span className="text-cyan-500/70">
              {currentTimeMinutes < 720 ? 'AM' : 'PM'}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={1439}
            step={1}
            value={currentTimeMinutes}
            onChange={(e) => {
              const newTime = minutesToTime(parseInt(e.target.value, 10));
              onTimeChange(newTime);
            }}
            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <div className="flex justify-between text-xs text-cyan-400/50 mt-1">
            <span>12 AM</span>
            <span>6 AM</span>
            <span>12 PM</span>
            <span>6 PM</span>
            <span>12 AM</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateControls;