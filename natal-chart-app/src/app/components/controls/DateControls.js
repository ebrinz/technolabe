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

  const handleSelectedDateChange = (newDate) => {
    if (newDate < minDate) {
      onBoundsChange({ target: { value: newDate } }, 'min');
    } else if (newDate > maxDate) {
      onBoundsChange({ target: { value: newDate } }, 'max');
    }
    
    onDateChange(newDate);
  };

  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    if (parts.length !== 2) return 0;
    
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    
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
    <div className="space-y-4 p-4 rounded-lg border border-cyan-500/20">
      <div className="relative">
        {/* Date Range Controls */}
        <div className="flex justify-between items-center text-xs mb-1">
          <div className="group relative">
            <input
              type="date"
              value={minDate || ''}
              onChange={(e) => handleDateBoundsChange(e, 'min')}
              className="absolute bottom-full mb-1 left-0 w-32 
                         bg-gray-900/80 rounded p-1 text-cyan-300/70
                         border border-cyan-500/20
                         focus:outline-none focus:border-cyan-400
                         opacity-0 group-hover:opacity-100 transition-opacity"
            />
            <span className="text-cyan-400/50 cursor-pointer">{minDate}</span>
          </div>
          <div className="group relative">
            <input
              type="date"
              value={selectedDate || ''}
              min={minDate || ''}
              max={maxDate || ''}
              onChange={(e) => handleSelectedDateChange(e.target.value)}
              className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 w-32
                         bg-gray-900/80 rounded p-1 text-cyan-300
                         border border-cyan-500/20
                         focus:outline-none focus:border-cyan-400
                         opacity-0 group-hover:opacity-100 transition-opacity"
            />
            <span className="font-mono text-cyan-300 text-sm cursor-pointer">{selectedDate}</span>
          </div>
          <div className="group relative">
            <input
              type="date"
              value={maxDate || ''}
              onChange={(e) => handleDateBoundsChange(e, 'max')}
              className="absolute bottom-full mb-1 right-0 w-32
                         bg-gray-900/80 rounded p-1 text-cyan-300/70
                         border border-cyan-500/20
                         focus:outline-none focus:border-cyan-400
                         opacity-0 group-hover:opacity-100 transition-opacity"
            />
            <span className="text-cyan-400/50 cursor-pointer">{maxDate}</span>
          </div>
        </div>

        {/* Date Range Slider */}
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
          className="
            w-full h-2 rounded-lg appearance-none cursor-pointer
            bg-gradient-to-r from-black/80 to-black/100
            border border-cyan-400/20
            accent-cyan-500
            hover:accent-cyan-400
            focus:outline-none focus:ring-2 focus:ring-cyan-500/50
          "
        />
      </div>
      
      {/* Time Controls */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="font-mono text-cyan-300">{selectedTime || '00:00'}</span>
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
          className="
            w-full h-2 rounded-lg appearance-none cursor-pointer
            bg-gradient-to-r from-black/80 to-black/100
            border border-cyan-400/20
            accent-cyan-500
            hover:accent-cyan-400
            focus:outline-none focus:ring-2 focus:ring-cyan-500/50
          "
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
  );
};

export default DateControls;