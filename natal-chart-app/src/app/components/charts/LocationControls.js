'use client'
import React from 'react';
import GlobeComponent from './GlobeComponent';

export const LocationControls = ({ selectedLocation, onLocationChange }) => (
  <div className="bg-black/50 backdrop-blur-sm rounded-lg shadow-lg shadow-cyan-500/20 p-4 border border-cyan-500/20">
    {/* <div className="h-64 rounded-lg mb-4 bg-black/30">
      <GlobeComponent 
        selectedLocation={selectedLocation}
        onLocationChange={onLocationChange}
      />
    </div> */}
    
    <div className="space-y-4 bg-black/30 p-4 rounded-lg">
      {/* Latitude Slider */}
      <div>
        <div className="flex justify-between text-cyan-300 text-sm mb-1">
          <span>Latitude: {selectedLocation.lat.toFixed(4)}°</span>
          <span className="text-cyan-500/70">-90° to 90°</span>
        </div>
        <input
          type="range"
          min="-90"
          max="90"
          step="0.0001"
          value={selectedLocation.lat}
          onChange={(e) => onLocationChange(prev => ({ ...prev, lat: parseFloat(e.target.value) }))}
          className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
        />
      </div>
      
      {/* Longitude Slider */}
      <div>
        <div className="flex justify-between text-cyan-300 text-sm mb-1">
          <span>Longitude: {selectedLocation.lng.toFixed(4)}°</span>
          <span className="text-cyan-500/70">-180° to 180°</span>
        </div>
        <input
          type="range"
          min="-180"
          max="180"
          step="0.0001"
          value={selectedLocation.lng}
          onChange={(e) => onLocationChange(prev => ({ ...prev, lng: parseFloat(e.target.value) }))}
          className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
        />
      </div>
    </div>
  </div>
);