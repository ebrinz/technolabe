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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleDateBoundsChange = (e, bound) => {
    const newDate = e.target.value;
    
    if (bound === 'min') {
      if (newDate > selectedDate) {
        onDateChange(newDate);
      }
    } else {
      if (newDate < selectedDate) {
        onDateChange(newDate);
      }
    }
    
    onBoundsChange(e, bound);
  };

  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return 0;
    return hours * 60 + minutes;
  };

  const minutesToTime = (totalMinutes) => {
    if (isNaN(totalMinutes)) totalMinutes = 0;
    const hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  const currentTimeMinutes = timeToMinutes(selectedTime);

  const getTimestamp = (dateStr) => {
    try {
      return new Date(dateStr || '2025-01-01').getTime() / 1000;
    } catch (e) {
      return new Date('2025-01-01').getTime() / 1000;
    }
  };

  return (
    <div className="space-y-4 p-4 bg-black/20 backdrop-blur-sm rounded-lg border border-cyan-500/20">
      {/* Date Range Controls */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-cyan-300 text-sm mb-1">Min Date</label>
          <input
            type="date"
            value={minDate || ''}
            onChange={(e) => handleDateBoundsChange(e, 'min')}
            className="w-full bg-black/40 border-2 border-cyan-400/30 rounded p-2 
                     text-cyan-300 focus:outline-none focus:border-cyan-400
                     transition-colors duration-300"
          />
        </div>
        <div>
          <label className="block text-cyan-300 text-sm mb-1">Max Date</label>
          <input
            type="date"
            value={maxDate || ''}
            onChange={(e) => handleDateBoundsChange(e, 'max')}
            className="w-full bg-black/40 border-2 border-cyan-400/30 rounded p-2 
                     text-cyan-300 focus:outline-none focus:border-cyan-400
                     transition-colors duration-300"
          />
        </div>
      </div>

      {/* Date and Time Controls */}
      <div className="space-y-4">
        <div className="flex gap-4">
          <input
            type="date"
            value={selectedDate || ''}
            min={minDate || ''}
            max={maxDate || ''}
            onChange={(e) => onDateChange(e.target.value)}
            className="flex-1 bg-black/40 border-2 border-cyan-400/30 rounded p-2 
                     text-cyan-300 focus:outline-none focus:border-cyan-400
                     transition-colors duration-300"
          />
          <div className="flex items-center gap-2 rounded p-2 flex-1 
                       bg-black/40 border-2 border-cyan-400/30">
            {isMounted && <Clock className="w-5 h-5 text-cyan-400" />}
            <input
              type="time"
              value={selectedTime || ''}
              onChange={(e) => onTimeChange(e.target.value)}
              className="flex-1 bg-transparent text-cyan-300 focus:outline-none"
            />
          </div>
        </div>

        {/* Date Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-cyan-300 text-sm">
            <span className="font-mono">{selectedDate || ''}</span>
          </div>
          <div className="relative">
            <input
              type="range"
              min={getTimestamp(minDate)}
              max={getTimestamp(maxDate)}
              step={86400}
              value={getTimestamp(selectedDate)}
              onChange={(e) => {
                try {
                  const date = new Date(parseInt(e.target.value) * 1000);
                  if (!isNaN(date.getTime())) {
                    onDateChange(date.toISOString().split('T')[0]);
                  }
                } catch (error) {
                  console.error("Error updating date:", error);
                }
              }}
              className="
                w-full h-2 rounded-lg appearance-none cursor-pointer
                bg-gradient-to-r from-black/40 to-black/60
                border border-cyan-400/20
                accent-cyan-500
                hover:accent-cyan-400
                focus:outline-none focus:ring-2 focus:ring-cyan-500/50
              "
            />
            <div className="absolute inset-0 blur-sm bg-cyan-400/10 rounded-lg pointer-events-none" />
          </div>
        </div>
        
        {/* Time Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-cyan-300 font-mono">
              {selectedTime || '00:00'}
            </span>
            <span className="text-cyan-500/70">
              {currentTimeMinutes < 720 ? 'AM' : 'PM'}
            </span>
          </div>
          <div className="relative">
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
              className="
                w-full h-2 rounded-lg appearance-none cursor-pointer
                bg-gradient-to-r from-black/40 to-black/60
                border border-cyan-400/20
                accent-cyan-500
                hover:accent-cyan-400
                focus:outline-none focus:ring-2 focus:ring-cyan-500/50
              "
            />
            <div className="absolute inset-0 blur-sm bg-cyan-400/10 rounded-lg pointer-events-none" />
          </div>
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