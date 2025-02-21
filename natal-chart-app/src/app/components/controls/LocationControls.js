'use client'
import React, { useCallback } from 'react';
import GlobeComponent from '../charts/GlobeComponent';

// Pre-calculate hours per degree
const HOURS_PER_DEGREE = 1 / 15;

// Optimized time calculation
const calculateTimeOffset = (oldLng, newLng, currentTime) => {
  const hourDiff = (newLng - oldLng) * HOURS_PER_DEGREE;
  const [hours, minutes] = currentTime.split(':').map(Number);
  let totalMinutes = ((hours * 60 + minutes + (hourDiff * 60)) + 1440) % 1440; // Add 1440 (24*60) before modulo to handle negatives
  return `${String(Math.floor(totalMinutes / 60)).padStart(2, '0')}:${String(Math.round(totalMinutes % 60)).padStart(2, '0')}`;
};

const SliderControl = React.memo(({ label, value, min, max, onChange, unit = "°" }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-sm">
      <span className="text-cyan-300">
        {label}: {value.toFixed(4)}{unit}
      </span>
      <span className="text-cyan-500/70">
        {min}{unit} to {max}{unit}
      </span>
    </div>
    <div className="relative">
      <input
        type="range"
        min={min}
        max={max}
        step="0.0001"
        value={value}
        onChange={onChange}
        className="
          w-full h-2 rounded-lg appearance-none cursor-pointer
          bg-gradient-to-r from-black/80 to-black/100
          border border-cyan-400/20
          accent-cyan-500
          hover:accent-cyan-400
          focus:outline-none focus:ring-2 focus:ring-cyan-500/50
        "
      />
      <div className="absolute inset-0 blur-sm bg-cyan-400/10 rounded-lg pointer-events-none" />
    </div>
  </div>
));

SliderControl.displayName = 'SliderControl';

export const LocationControls = ({ 
  selectedLocation, 
  onLocationChange, 
  selectedTime = '12:00', 
  onTimeChange = () => {} 
}) => {
  const handleLatitudeChange = useCallback((e) => {
    const newLat = Math.max(-66.5, Math.min(66.5, parseFloat(e.target.value)));
    onLocationChange({ ...selectedLocation, lat: newLat });
  }, [selectedLocation, onLocationChange]);

  const handleLongitudeChange = useCallback((e) => {
    const newLng = Math.max(-180, Math.min(180, parseFloat(e.target.value)));
    const newTime = calculateTimeOffset(selectedLocation.lng, newLng, selectedTime);
    onLocationChange({ ...selectedLocation, lng: newLng });
    onTimeChange(newTime);
  }, [selectedLocation, selectedTime, onLocationChange, onTimeChange]);

  const handleGlobeLocationChange = useCallback((newLocation) => {
    const newTime = calculateTimeOffset(selectedLocation.lng, newLocation.lng, selectedTime);
    onLocationChange(newLocation);
    onTimeChange(newTime);
  }, [selectedLocation.lng, selectedTime, onLocationChange, onTimeChange]);

  return (
    <div className="bg-black/20 backdrop-blur-sm">
      <div className="space-y-4 p-4 rounded-lg border border-cyan-500/20">
        <SliderControl
          label="Latitude"
          value={selectedLocation.lat}
          min={-66.5}
          max={66.5}
          onChange={handleLatitudeChange}
        />
        
        <SliderControl
          label="Longitude"
          value={selectedLocation.lng}
          min={-180}
          max={180}
          onChange={handleLongitudeChange}
        />

        <div className="mt-2 rounded-lg overflow-hidden border border-cyan-500/20">
          <GlobeComponent 
            selectedLocation={selectedLocation}
            onLocationChange={handleGlobeLocationChange}
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(LocationControls);