'use client'
import React, { useState, useEffect } from 'react';
import { Save, Trash2 } from 'lucide-react';

const SaveAndPredict = ({ 
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
      onLocationChange?.({
        lat: slot.location.lat,
        lng: slot.location.lng
      });
      setSelectedDate?.(slot.date);
      setSelectedTime?.(slot.time);
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
      <button 
        onClick={() => savedSlot 
          ? handleLoadFromSlot(slotKey) 
          : handleSaveToSlot(slotKey)
        }
        className={`
          flex-1 relative group 
          bg-black/40 border border-${savedSlot ? 'orange' : 'cyan'}-400/30 
          ${savedSlot ? 'text-orange-300' : 'text-cyan-300'}
          py-2 px-4 rounded
          transition-all duration-300
          hover:bg-${savedSlot ? 'orange' : 'cyan'}-400/10
          focus:outline-none focus:ring-2 focus:ring-${savedSlot ? 'orange' : 'cyan'}-500/50
        `}
      >
        <div className="flex items-center justify-center text-sm">
          {savedSlot ? (
            <>
              <button 
                className="mr-2 p-1 rounded hover:bg-red-400/20 hover:text-red-300 
                         transition-colors"
                onClick={(e) => handleDeleteSlot(slotKey, e)}
              >
                <Trash2 size={16} />
              </button>
              <span>slot {slotKey.replace('slot', '')}</span>
            </>
          ) : (
            <>
              <Save className="mr-2" size={16} />
              <span>slot {slotKey.replace('slot', '')}</span>
            </>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-4 p-4 rounded-lg border border-cyan-500/20">
    {/* <div className="flex justify-between text-sm mb-1">
        <span className="text-cyan-300">Save States</span>
    </div> */}
    
        <div className="space-y-2">
            <div className="flex gap-2">
            <SlotButton slotKey="slot1" />
            <SlotButton slotKey="slot2" />
            </div>
            
            <button 
            disabled
            className="w-full relative 
                bg-black/40 border border-purple-400/30
                text-purple-300/50 py-2 px-4 rounded
                text-sm cursor-not-allowed
                transition-colors"
            >
            Predict
            </button>
        </div>
    </div>
  );
};

export default SaveAndPredict;