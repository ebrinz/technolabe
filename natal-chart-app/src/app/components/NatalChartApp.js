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

const calculateTimeFromLongitude = (longitude, baseTime = '12:00') => {
  const hourOffset = longitude / 15;
  const [baseHours, baseMinutes] = baseTime.split(':').map(Number);
  let hours = baseHours + Math.floor(hourOffset);
  let minutes = baseMinutes + Math.round((hourOffset % 1) * 60);
  if (minutes >= 60) {
    hours += 1;
    minutes = minutes % 60;
  } else if (minutes < 0) {
    hours -= 1;
    minutes = 60 + minutes;
  }
  while (hours < 0) hours += 24;
  hours = hours % 24;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
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
      console.log('NEW DATA', data);
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
    const locationToUpdate = typeof newLoc === 'function' 
      ? newLoc(selectedLocation) 
      : newLoc;
    const validatedLoc = {
      lat: Math.max(LATITUDE_BOUNDS.min, Math.min(LATITUDE_BOUNDS.max, locationToUpdate.lat)),
      lng: Math.max(-180, Math.min(180, locationToUpdate.lng))
    };
    setSelectedLocation(validatedLoc);
    const newTime = calculateTimeFromLongitude(validatedLoc.lng);
    setSelectedTime(newTime);
  };

  return (
    <div className="h-screen overflow-hidden bg-black p-4">
      <div className="grid grid-cols-6 gap-4 h-full">
        {/* Left column - 1 column for controls */}
        <div className="col-span-2 h-full pr-2 flex flex-col">
          <div className="flex-grow-[3.3333333333333333333] overflow-auto bg-black/20 rounded-lg p-4 mb-4">
            TECHNOLABE!!!
          </div>
          
          <div className="flex flex-col flex-grow-[1] space-y-4">
            <div className="bg-black/50 backdrop-blur-sm p-4 rounded-lg">
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
            
            <div className="flex-shrink-0">
              <LocationControls 
                selectedLocation={selectedLocation}
                onLocationChange={handleLocationChange}
              />
            </div>
          </div>
        </div>
        
        {/* Chart column - 4 columns wide */}
        <div className="col-span-4 bg-black/30 p-4 flex flex-col h-full">
          <div className="relative flex-1 w-full">
            {/* Main Astral Chart - expanded to fill entire area */}
            <div className="absolute inset-0 bg-black/30 rounded-lg">
              <AstralChart
                chartData={chart}
                selectedPlanet={selectedPlanet}
                onPlanetSelect={setSelectedPlanet}
              />
            </div>
            
            {/* Moon Phase overlay - positioned in top right */}
            <div className="absolute top-7 right-7 w-24 h-24 sm:w-36 sm:h-36 md:w-44 md:h-44 lg:w-52 lg:h-52
                            bg-black/00 rounded-full flex items-center justify-center 
                            border-0 border-gray-700/00 z-10">
              <div className="w-full h-full flex items-center justify-center">
                <MoonPhase chartData={chart} />
              </div>
            </div>
            
            {/* Globe - positioned at bottom left - LARGER SIZE */}
            <div className="absolute bottom-3 left-3 w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56
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
            <div className="absolute bottom-4 right-4 w-20 h-20 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48
                          bg-black/00 flex items-center justify-center z-10">
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