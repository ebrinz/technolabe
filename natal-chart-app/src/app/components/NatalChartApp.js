'use client'
import React, { useState, useEffect } from 'react';
import DateControls from './charts/DateControls';
import AstralChart from './charts/AstralChart';
import PlanetInfo from './charts/PlanetInfo';
import { LocationControls } from './charts/LocationControls';
import ChartDataDisplay from './charts/ChartDataDisplay';
import MoonPhase from './charts/MoonPhase';
import TimeDial from './charts/TimeDial';
import GlobeComponent from './GlobeComponent';

const LATITUDE_BOUNDS = {
  min: -66.5,  // Antarctic Circle
  max: 66.5    // Arctic Circle
};

const roundCoordinate = (value, precision = 4) => {
  return parseFloat(value.toFixed(precision));
};

const NatalChartApp = () => {
  const [selectedLocation, setSelectedLocation] = useState({ lat: 40.7128, lng: -74.0060 });
  const [selectedDate, setSelectedDate] = useState('2000-01-01');
  const [selectedTime, setSelectedTime] = useState('12:00');
  const [chart, setChart] = useState(null);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [minDate, setMinDate] = useState('1900-01-01');
  const [maxDate, setMaxDate] = useState('2100-12-31');

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
    <div className="min-h-screen p-4 bg-gray-900">
      <div className="grid grid-cols-5 gap-4">
        {/* Left column - 2 columns wide */}
        <div className="col-span-2 space-y-4">
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
        
        {/* Right column - 3 columns wide */}
        {/* <div className="col-span-3 bg-black/30 backdrop-blur-sm rounded-lg shadow-lg shadow-cyan-500/20 p-4 border border-cyan-500/20"> */}
        <div className="col-span-3 bg-black/30 rounded-lg shadow-lg shadow-cyan-500/20 p-4 border border-cyan-500/20">
          <div className="flex gap-4 mb-4 ">
            <div className="flex-row bg-black/30">
              {/* globe */}
              <div className="h-64 bg-black/30">
                <GlobeComponent 
                  selectedLocation={selectedLocation}
                  onLocationChange={handleLocationChange}
                />

              </div>

              {/* Moon Phase */}
              <div className="w-32">
                <MoonPhase chartData={chart} />
              </div>

              <div className="w-32">
                <TimeDial time={selectedTime} />
              </div>

            </div>

            
            {/* Main chart area */}
            {/* <div className="flex-1 bg-black/30 rounded-lg p-4 border border-cyan-500/10"> */}
            <div className="flex-1 bg-black/30">
              <AstralChart
                chartData={chart}
                selectedPlanet={selectedPlanet}
                onPlanetSelect={setSelectedPlanet}
              />
            </div>
         

          </div>

          {/* <PlanetInfo
            selectedPlanet={selectedPlanet}
            planetData={chart?.points[selectedPlanet]}
          /> */}
        </div>
      </div>
    </div>
  );
};

export default NatalChartApp;