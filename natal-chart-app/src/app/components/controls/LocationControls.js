'use client'
import React from 'react';
import GlobeComponent from '../charts/GlobeComponent';

const SliderControl = ({ label, value, min, max, onChange, unit = "°" }) => (
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
);

export const LocationControls = ({ selectedLocation, onLocationChange }) => (
  <div className="bg-black/20 backdrop-blur-sm">
    <div className="space-y-4 p-4 rounded-lg border border-cyan-500/20">
      {/* Latitude Slider */}
      <SliderControl
        label="Latitude"
        value={selectedLocation.lat}
        min={-66.5}
        max={66.5}
        onChange={(e) => onLocationChange(prev => ({ 
          ...prev, 
          lat: parseFloat(e.target.value) 
        }))}
      />
      
      {/* Longitude Slider */}
      <SliderControl
        label="Longitude"
        value={selectedLocation.lng}
        min={-180}
        max={180}
        onChange={(e) => onLocationChange(prev => ({ 
          ...prev, 
          lng: parseFloat(e.target.value) 
        }))}
      />

      <div className="mt-2 rounded-lg overflow-hidden border border-cyan-500/20">
        <GlobeComponent 
          selectedLocation={selectedLocation}
          onLocationChange={onLocationChange}
        />
      </div>
    </div>
  </div>
);