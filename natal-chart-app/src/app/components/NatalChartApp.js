'use client'
import React, { useState, useEffect } from 'react';
import DateControls from './charts/DateControls';
import AstralChart from './charts/AstralChart';
import PlanetInfo from './charts/PlanetInfo';
import { LocationControls } from './charts/LocationControls';
import ChartDataDisplay from './charts/ChartDataDisplay';
import MoonPhase from './charts/MoonPhase';
import TimeDial from './charts/TimeDial';
import GlobeComponent from './charts/GlobeComponent';

const LATITUDE_BOUNDS = {
  min: -66.5,  // Antarctic Circle
  max: 66.5    // Arctic Circle
};

const roundCoordinate = (value, precision = 4) => {
  return parseFloat(value.toFixed(precision));
};

const NatalChartApp = () => {
  const [selectedLocation, setSelectedLocation] = useState({ lat: 40.7128, lng: -74.0060 });
  const [selectedDate, setSelectedDate] = useState('2025-01-01');
  const [selectedTime, setSelectedTime] = useState('12:00');
  const [chart, setChart] = useState(null);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [minDate, setMinDate] = useState('2025-01-01');
  const [maxDate, setMaxDate] = useState('2025-12-31');

  useEffect(() => {
    if (selectedLocation) {
      generateChart({
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        date: selectedDate,
        time: selectedTime
      });
    }
  }, [selectedDate, selectedTime, selectedLocation]);

  const generateChart = async (params) => {
    try {
      const response = await fetch('http://localhost:5000/chart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          lat: params.lat,
          lon: params.lng,
          date: params.date,
          time: params.time
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('NEW DATA', data)
      setChart(data);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  const handleDateBoundsChange = (e, bound) => {
    const newDate = e.target.value;
    if (bound === 'min') {
      if (newDate < selectedDate) {
        setSelectedDate(newDate);
      }
      setMinDate(newDate);
    } else {
      if (newDate > selectedDate) {
        setSelectedDate(newDate);
      }
      setMaxDate(newDate);
    }
  };

  const handleLocationChange = (newLoc) => {
    const locationToUpdate = typeof newLoc === 'function' ? newLoc(selectedLocation) : newLoc;
    
    const validatedLoc = {
      lat: Math.max(LATITUDE_BOUNDS.min, Math.min(LATITUDE_BOUNDS.max, locationToUpdate.lat)),
      lng: Math.max(-180, Math.min(180, locationToUpdate.lng))
    };
    setSelectedLocation(validatedLoc);
  };

  return (
    <div className="h-screen overflow-hidden bg-gray-900 p-4">
      <div className="grid grid-cols-5 gap-4 h-full max-h-full">
        {/* Left column - 2 columns wide */}
        <div className="col-span-2 space-y-4 h-full overflow-y-auto pr-2">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg shadow-lg shadow-cyan-500/20 p-4 border border-cyan-500/20">
            <DateControls
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              minDate={minDate}
              maxDate={maxDate}
              onDateChange={setSelectedDate}
              onTimeChange={setSelectedTime}
              onBoundsChange={handleDateBoundsChange}
            />
          </div>
  
          <LocationControls 
            selectedLocation={selectedLocation}
            onLocationChange={handleLocationChange}
          />
          
          <ChartDataDisplay chartData={chart} />
        </div>
        
        <div className="col-span-3 bg-black/30 rounded-lg shadow-lg shadow-cyan-500/20 p-4 border border-cyan-500/20 h-full">
          <div className="relative h-full">
            {/* Main Astral Chart - expanded to fill entire area */}
            <div className="w-full h-full bg-black/30 rounded-lg">
              <AstralChart
                chartData={chart}
                selectedPlanet={selectedPlanet}
                onPlanetSelect={setSelectedPlanet}
              />
            </div>
            
            {/* Moon Phase overlay - positioned in top left */}
            <div className="absolute top-7 right-7 w-24 h-24 sm:w-44 sm:h-44 md:w-78 md:h-78 lg:w-92 lg:h-92
                            bg-black/00 rounded-full flex items-center justify-center 
                            border-0 border-gray-700/00 z-10">
              <div className="w-full h-full flex items-center justify-center">
                <MoonPhase chartData={chart} />
              </div>
            </div>
            
            {/* Globe - positioned at bottom left - LARGER SIZE */}
            <div className="absolute bottom-3 -left-12 w-32 h-32 sm:w-40 sm:h-40 md:w-46 md:h-46 lg:w-52 lg:h-52
                          bg-black/00 rounded-full flex items-center justify-center
                          border-0 border-gray-700/00 z-10">
              <div className="w-full h-full flex items-center justify-center">
                <GlobeComponent 
                  selectedLocation={selectedLocation}
                  onLocationChange={handleLocationChange}
                />
              </div>
            </div>
            
            {/* Time Dial - positioned at bottom right */}
            <div className="absolute bottom-4 right-4 w-20 h-20 sm:w-44 sm:h-44 md:w-62 md:h-62 lg:w-86 lg:h-86
                          bg-black/00 rounded-full flex items-center justify-center
                          border-0 border-gray-700/00 z-10">
              <div className="w-full h-full flex items-center justify-center">
                <TimeDial time={selectedTime} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NatalChartApp;