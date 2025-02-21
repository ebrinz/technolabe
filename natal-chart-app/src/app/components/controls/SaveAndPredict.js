import React, { useState, useEffect } from 'react';
import { Save, Trash2 } from 'lucide-react';
import dynamic from 'next/dynamic';

// Create a client-only version of the component to avoid hydration issues
const SaveAndPredict = dynamic(() => Promise.resolve(({ 
  chartData, 
  selectedLocation, 
  selectedDate, 
  selectedTime,
  onLocationChange,
  setSelectedDate,
  setSelectedTime
}) => {
  const [savedSlots, setSavedSlots] = useState({
    slot1: null,
    slot2: null
  });

  useEffect(() => {
    try {
      const savedChartSlots = JSON.parse(localStorage.getItem('savedChartSlots') || '{}');
      setSavedSlots(savedChartSlots);
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }, []);

  const handleSaveToSlot = (slotKey) => {
    if (chartData && selectedLocation && selectedDate && selectedTime) {
      const chartToSave = {
        location: selectedLocation,
        date: selectedDate,
        time: selectedTime,
        timestamp: new Date().toISOString()
      };

      const updatedSlots = {
        ...savedSlots,
        [slotKey]: chartToSave
      };

      setSavedSlots(updatedSlots);

      try {
        localStorage.setItem('savedChartSlots', JSON.stringify(updatedSlots));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    } else {
      alert('Please generate a chart before saving');
    }
  };

  const handleLoadFromSlot = (slotKey) => {
    const slot = savedSlots[slotKey];
    if (slot) {
      if (onLocationChange) {
        onLocationChange({
          lat: slot.location.lat,
          lng: slot.location.lng
        });
      }
      if (setSelectedDate) {
        setSelectedDate(slot.date);
      }
      if (setSelectedTime) {
        setSelectedTime(slot.time);
      }
    } else {
      alert(`No chart saved in ${slotKey}`);
    }
  };

  const handleDeleteSlot = (slotKey, e) => {
    e.stopPropagation();
    const updatedSlots = {
      ...savedSlots,
      [slotKey]: null
    };

    setSavedSlots(updatedSlots);

    try {
      localStorage.setItem('savedChartSlots', JSON.stringify(updatedSlots));
    } catch (error) {
      console.error('Error updating localStorage:', error);
    }
  };

  const SlotButton = ({ slotKey }) => {
    const savedSlot = savedSlots[slotKey];
    
    return (
      <div className="flex items-center space-x-1 relative group flex-1">
        <div 
          onClick={() => savedSlot 
            ? handleLoadFromSlot(slotKey) 
            : handleSaveToSlot(slotKey)
          }
          className={`w-full relative group overflow-hidden 
            bg-black border
            ${savedSlot ? 'border-orange-300/70' : 'border-cyan-300/70'}
            ${savedSlot ? 'text-orange-300/90' : 'text-cyan-300/90'}
            py-2 px-4 rounded
            transition duration-300 ease-in-out
            hover:text-white cursor-pointer
            transform hover:scale-105
            flex items-center justify-between text-sm
            ${savedSlot ? 'hover:bg-orange-300/10' : 'hover:bg-cyan-300/10'}`}
        >
          <div className="flex items-center">
            {savedSlot ? (
              <div 
                role="button"
                tabIndex={0}
                className="p-1 rounded hover:bg-red-400/20 hover:text-red-300/90 transition-colors"
                onClick={(e) => handleDeleteSlot(slotKey, e)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleDeleteSlot(slotKey, e);
                  }
                }}
              >
                <Trash2 size={16} />
              </div>
            ) : (
              <Save size={16} />
            )}
          </div>
          <span className="flex-1 text-center">slot {slotKey.replace('slot', '')}</span>
          <div className="w-[16px]"></div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 p-4 rounded-lg border border-cyan-500/20">
      <div className="w-full flex space-x-2">
        <SlotButton slotKey="slot1" />
        <SlotButton slotKey="slot2" />
        
        <div 
          className="flex-1 relative group overflow-hidden 
            bg-black border border-cyan-400/50
            text-cyan-300/50 py-2 px-4 rounded text-sm
            opacity-50 cursor-not-allowed
            
            before:absolute before:inset-0 
            before:bg-purple-400/10 before:opacity-0 
            before:-z-10 before:transition-opacity 
            before:duration-300 
            
            after:absolute after:inset-0 
            after:border after:border-purple-400/30
            after:animate-pulse after:opacity-0 
            after:pointer-events-none"
        >
          <span className="flex-1 text-center">Predict</span>
        </div>
      </div>
    </div>
  );
}), { ssr: false }); // Disable SSR for this component

export default SaveAndPredict;