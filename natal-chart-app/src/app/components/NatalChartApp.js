'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';
import dynamic from 'next/dynamic';

const NatalChartGenerator = () => {
  const [selectedLocation, setSelectedLocation] = useState({ lat: 40.7128, lng: -74.0060 });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('12:00');
  const [chart, setChart] = useState(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const generateSVGChart = (chartData) => {
    if (!chartData?.planets) return null;

    const radius = 150;
    const center = { x: 200, y: 200 };
    
    const degreesToXY = (degrees, r) => ({
      x: center.x + r * Math.cos((degrees - 90) * Math.PI / 180),
      y: center.y + r * Math.sin((degrees - 90) * Math.PI / 180)
    });

    // Planet positions
    const planets = Object.entries(chartData?.planets || {}).map(([planet, data]) => ({
      symbol: planet,
      position: degreesToXY(data.longitude, radius * 0.8),
      label: planet
    }));

    return (
      <svg viewBox="0 0 400 400" className="w-full h-full">
        <circle cx={center.x} cy={center.y} r={radius} 
                fill="none" stroke="currentColor"/>
        {planets.map((planet, i) => (
          <g key={i}>
            <text x={planet.position.x} y={planet.position.y}
                  textAnchor="middle" dominantBaseline="middle"
                  className="text-blue-500">
              {planet.symbol}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  useEffect(() => {
    const initMap = async () => {
      if (typeof window !== 'undefined' && !mapRef.current) {
        const L = await import('leaflet');
        const mapElement = document.getElementById('map');
        if (!mapElement) return;

        const map = L.map(mapElement).setView([selectedLocation.lat, selectedLocation.lng], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        
        const marker = L.marker([selectedLocation.lat, selectedLocation.lng]).addTo(map);
        markerRef.current = marker;
        mapRef.current = map;

        map.on('click', async (e) => {
          const { lat, lng } = e.latlng;
          setSelectedLocation({ lat, lng });
          marker.setLatLng([lat, lng]);
          await generateChart({ lat, lng, date: selectedDate, time: selectedTime });
        });
      }
    };

    initMap();
  }, []);

  const generateChart = async (params) => {
    try {
      const response = await fetch('http://localhost:5000/natal-chart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          lat: params.lat,
          lon: params.lng,
          date: params.date,
          time: params.time
        })
      });
      const data = await response.json();
      setChart(data);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  

  return (
    <div className="h-screen p-4 bg-gray-50">
      <div className="grid grid-cols-2 gap-4 h-full">
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div id="map" className="h-full rounded-lg"></div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col">
          <div className="flex gap-4 mb-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border rounded p-2 flex-1"
            />
            <div className="flex items-center gap-2 border rounded p-2 flex-1">
              <Clock className="w-5 h-5 text-blue-500" />
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          <div className="flex-1 bg-gray-50 rounded-lg p-4">
              {chart?.planets && generateSVGChart(chart)}
          </div>
          {chart?.planets && (
            <div className="mt-4 grid grid-cols-3 gap-2">
            {Object.entries(chart.planets).map(([planet, data]) => (
                <div key={planet} className="bg-gray-50 p-2 rounded text-sm">
                <div className="font-medium">{planet}</div>
                <div className="text-gray-600">
                    {data.sign} ({data.house}°)
                </div>
                </div>
            ))}
            </div>
        )}
        </div>
    </div>
    </div>
);





};


export default dynamic(() => Promise.resolve(NatalChartGenerator), {
  ssr: false
});