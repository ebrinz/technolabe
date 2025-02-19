'use client'
import React from 'react';

const PlanetInfo = ({ selectedPlanet, planetData }) => {
  if (!selectedPlanet || !planetData) return null;

  return (
    <div className="mt-4 bg-black/30 p-4">
      <h3 className="font-medium text-lg mb-2 text-pink-300">{selectedPlanet}</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="text-cyan-300">
          <p>Sign: {planetData.sign}</p>
          <p>House: {planetData.house}</p>
          <p>Movement: {planetData.movement}</p>
        </div>
        <div className="text-cyan-300">
          <p>Long: {planetData.longitude.toFixed(2)}°</p>
          <p>Lat: {planetData.latitude.toFixed(2)}°</p>
        </div>
      </div>
    </div>
  );
};

export default PlanetInfo;