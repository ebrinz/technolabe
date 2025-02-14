'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Clock, Info } from 'lucide-react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

const ASPECT_COLORS = {
  'Conjunction': '#FF00FF', // Neon pink
  'Square': '#FF3D3D',     // Bright red
  'Trine': '#00FF9F',      // Neon green
  'Opposition': '#9D00FF', // Neon purple
  'Sextile': '#00FFFF'     // Cyan
};

const NatalChartGenerator = () => {
  const [selectedLocation, setSelectedLocation] = useState({ lat: 40.7128, lng: -74.0060 });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('12:00');
  const [chart, setChart] = useState(null);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    const initMap = async () => {
      if (typeof window === 'undefined') return;
      
      // If map is already initialized, return
      if (mapInstanceRef.current) return;

      const L = await import('leaflet');
      const mapElement = document.getElementById('map');
      if (!mapElement) return;
      
      // Custom dark mode marker
      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="marker-pin" style="background-color: #00FFFF; box-shadow: 0 0 10px #00FFFF;"></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      // Dark mode map styles
      const map = L.map('map', {
        center: [selectedLocation.lat, selectedLocation.lng],
        zoom: 13,
        zoomControl: false,
        attributionControl: false
      });

      // Dark mode map tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }).addTo(map);
      
      const marker = L.marker([selectedLocation.lat, selectedLocation.lng], {
        icon: customIcon
      }).addTo(map);

      // Add zoom control to top right
      L.control.zoom({
        position: 'topright'
      }).addTo(map);

      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        setSelectedLocation({ lat, lng });
        marker.setLatLng([lat, lng]);
      });

      // Store references
      markerRef.current = marker;
      mapInstanceRef.current = map;

      // Generate initial chart
      generateChart({
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        date: selectedDate,
        time: selectedTime
      });
    };

    initMap();

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Empty dependency array

  // Update marker position when location changes
  useEffect(() => {
    if (markerRef.current && mapInstanceRef.current) {
      markerRef.current.setLatLng([selectedLocation.lat, selectedLocation.lng]);
      mapInstanceRef.current.setView([selectedLocation.lat, selectedLocation.lng], mapInstanceRef.current.getZoom());
    }
  }, [selectedLocation]);

  // Effect for chart updates
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

  const generateSVGChart = (chartData) => {
    if (!chartData?.points) return null;

    const radius = 150;
    const center = { x: 200, y: 200 };
    
    const degreesToXY = (degrees, r) => ({
      x: center.x + r * Math.cos((degrees - 90) * Math.PI / 180),
      y: center.y + r * Math.sin((degrees - 90) * Math.PI / 180)
    });

    const houseCusps = Object.entries(chartData.houses).map(([house, degree]) => ({
      house: house.replace('House', ''),
      position: degreesToXY(degree, radius)
    }));

    const planets = Object.entries(chartData.points).map(([planet, data]) => ({
      symbol: planet,
      longitude: data.longitude,
      position: degreesToXY(data.longitude, radius * 0.8),
      house: data.house,
      sign: data.sign,
      movement: data.movement
    }));
    // Generate aspect lines
    const aspectLines = chartData.aspects.map((aspect, i) => {
      const planet1 = planets.find(p => p.symbol === aspect.planet1);
      const planet2 = planets.find(p => p.symbol === aspect.planet2);
      
      if (!planet1 || !planet2) return null;

      return (
        <line 
          key={`aspect-${i}`}
          x1={planet1.position.x}
          y1={planet1.position.y}
          x2={planet2.position.x}
          y2={planet2.position.y}
          stroke={ASPECT_COLORS[aspect.aspect_type]}
          strokeWidth="25"
          opacity="0.8"
        />
      );
    });

    return (
      <svg viewBox="0 0 400 400" className="w-full h-full">
        {/* Background circles */}
        <circle cx={center.x} cy={center.y} r={radius + 20} 
                className="fill-none stroke-cyan-500/20" strokeWidth="0.5"/>
        <circle cx={center.x} cy={center.y} r={radius} 
                className="fill-none stroke-cyan-400/30" strokeWidth="1"/>
        <circle cx={center.x} cy={center.y} r={radius - 20} 
                className="fill-none stroke-cyan-300/20" strokeWidth="0.5"/>

        {/* Grid lines for cosmic effect */}
        {Array.from({length: 36}).map((_, i) => {
          const angle = i * 10;
          const pos = degreesToXY(angle, radius + 30);
          return (
            <line 
              key={`grid-${i}`}
              x1={center.x}
              y1={center.y}
              x2={pos.x}
              y2={pos.y}
              className="stroke-cyan-500/10"
              strokeWidth="0.5"
            />
          );
        })}

        {/* Houses */}
        {houseCusps.map((house, i) => (
          <g key={`house-${i}`}>
            <line 
              x1={center.x}
              y1={center.y}
              x2={house.position.x}
              y2={house.position.y}
              className="stroke-cyan-400/30"
              strokeWidth="1"
            />
            <text 
              x={house.position.x}
              y={house.position.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-cyan-300 text-xs font-light"
              style={{ textShadow: '0 0 10px #00FFFF' }}
            >
              {house.house}
            </text>
          </g>
        ))}

        {/* Aspects */}
        {chartData.aspects.map((aspect, i) => {
          const planet1 = planets.find(p => p.symbol === aspect.planet1);
          const planet2 = planets.find(p => p.symbol === aspect.planet2);
          if (!planet1 || !planet2) return null;

          return (
            <line 
              key={`aspect-${i}`}
              x1={planet1.position.x}
              y1={planet1.position.y}
              x2={planet2.position.x}
              y2={planet2.position.y}
              stroke={ASPECT_COLORS[aspect.aspect_type]}
              strokeWidth="3"
              opacity="0.7"
              style={{ filter: 'blur(0.6px)' }}
            />
          );
        })}

        {/* Planets */}
        {planets.map((planet, i) => (
          <g key={i} 
             className="cursor-pointer transition-all duration-300"
             onClick={() => setSelectedPlanet(planet.symbol)}>
            <circle 
              cx={planet.position.x}
              cy={planet.position.y}
              r="12"
              className={`${
                selectedPlanet === planet.symbol 
                  ? 'fill-cyan-900/30 stroke-cyan-400' 
                  : 'fill-transparent stroke-transparent'
              } transition-all duration-300`}
            />
            <text 
              x={planet.position.x}
              y={planet.position.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className={`text-sm font-medium ${
                selectedPlanet === planet.symbol 
                  ? 'fill-cyan-300' 
                  : 'fill-pink-300'
              }`}
              style={{ 
                textShadow: selectedPlanet === planet.symbol 
                  ? '0 0 10px #00FFFF' 
                  : '0 0 10px #FF00FF' 
              }}
            >
              {planet.symbol.slice(0, 2)}
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
        
        // Custom dark mode marker
        const customIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div class="marker-pin" style="background-color: #00FFFF; box-shadow: 0 0 10px #00FFFF;"></div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        const mapElement = document.getElementById('map');
        if (!mapElement) return;

        // const map = L.map(mapElement, {
        //   center: [selectedLocation.lat, selectedLocation.lng],
        //   zoom: 13,
        //   zoomControl: false, // We'll add it in a custom position
        //   attributionControl: false // Hide attribution for cleaner look
        // });

        // // Dark mode map tiles
        // L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        //   maxZoom: 19
        // }).addTo(map);
        
        // const marker = L.marker([selectedLocation.lat, selectedLocation.lng], {
        //   icon: customIcon
        // }).addTo(map);
        
        // markerRef.current = marker;
        // mapRef.current = map;

        // // Add zoom control to top right
        // L.control.zoom({
        //   position: 'topright'
        // }).addTo(map);

        // map.on('click', (e) => {
        //   const { lat, lng } = e.latlng;
        //   setSelectedLocation({ lat, lng });
        //   marker.setLatLng([lat, lng]);
        // });
      }
    };

    initMap();
  }, []);

  const generateChart = async (params) => {
    try {
      console.log('Generating chart with params:', params);
      const response = await fetch('http://localhost:5000/chart', {
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
      console.log('Received chart data:', data);
      setChart(data);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  // Update chart when date or time changes
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

  useEffect(() => {
    const initMap = async () => {
      if (typeof window !== 'undefined' && !mapRef.current) {
        const L = await import('leaflet');
        
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        const mapElement = document.getElementById('map');
        if (!mapElement) return;

        // const map = L.map(mapElement).setView([selectedLocation.lat, selectedLocation.lng], 13);
        // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        
        // const marker = L.marker([selectedLocation.lat, selectedLocation.lng]).addTo(map);
        // markerRef.current = marker;
        // mapRef.current = map;

        // map.on('click', (e) => {
        //   const { lat, lng } = e.latlng;
        //   setSelectedLocation({ lat, lng });
        //   marker.setLatLng([lat, lng]);
        // });

        // Generate initial chart
        generateChart({
          lat: selectedLocation.lat,
          lng: selectedLocation.lng,
          date: selectedDate,
          time: selectedTime
        });
      }
    };

    initMap();
  }, []);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleTimeChange = (e) => {
    setSelectedTime(e.target.value);
  };

  const getAspectsForPlanet = (planet) => {
    if (!chart?.aspects) return [];
    return chart.aspects.filter(a => a.planet1 === planet || a.planet2 === planet);
  };

  return (
    <div className="min-h-screen p-4 bg-gray-900">
      <div className="grid grid-cols-2 gap-4 h-full">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg shadow-lg shadow-cyan-500/20 p-4 border border-cyan-500/20">
          <div id="map" className="h-[600px] rounded-lg"></div>
        </div>
        
        <div className="bg-black/50 backdrop-blur-sm rounded-lg shadow-lg shadow-cyan-500/20 p-4 border border-cyan-500/20">
          <div className="flex gap-4 mb-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-gray-900 border border-cyan-500/30 rounded p-2 flex-1 text-cyan-300 focus:outline-none focus:border-cyan-400"
            />
            <div className="flex items-center gap-2 border border-cyan-500/30 rounded p-2 flex-1 bg-gray-900">
              <Clock className="w-5 h-5 text-cyan-400" />
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="flex-1 bg-transparent text-cyan-300 focus:outline-none"
              />
            </div>
          </div>
          
          <div className="text-xs text-cyan-500/70 mb-2">
            <div>Date: {selectedDate}</div>
            <div>Time: {selectedTime}</div>
            <div>Lat: {selectedLocation.lat.toFixed(4)}</div>
            <div>Lon: {selectedLocation.lng.toFixed(4)}</div>
          </div>

          <div className="flex-1 bg-black/30 rounded-lg p-4 border border-cyan-500/10">
            {chart?.points ? generateSVGChart(chart) : 'Loading chart...'}
          </div>

          {selectedPlanet && chart?.points[selectedPlanet] && (
            <div className="mt-4 bg-black/30 p-4 rounded-lg border border-pink-500/20">
              <h3 className="font-medium text-lg mb-2 text-pink-300">{selectedPlanet}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-cyan-300">
                  <p>Sign: {chart.points[selectedPlanet].sign}</p>
                  <p>House: {chart.points[selectedPlanet].house}</p>
                  <p>Movement: {chart.points[selectedPlanet].movement}</p>
                </div>
                <div className="text-cyan-300">
                  <p>Long: {chart.points[selectedPlanet].longitude.toFixed(2)}°</p>
                  <p>Lat: {chart.points[selectedPlanet].latitude.toFixed(2)}°</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .custom-div-icon {
          background: transparent;
          border: none;
        }
        .marker-pin {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #00FFFF;
          box-shadow: 0 0 10px #00FFFF;
        }
        .leaflet-container {
          background: #111;
        }
        .leaflet-control-zoom a {
          background-color: rgba(0, 255, 255, 0.1) !important;
          border-color: rgba(0, 255, 255, 0.2) !important;
          color: #00FFFF !important;
        }
        .leaflet-control-zoom a:hover {
          background-color: rgba(0, 255, 255, 0.2) !important;
        }
      `}</style>
    </div>
  );
};

export default dynamic(() => Promise.resolve(NatalChartGenerator), {
  ssr: false
});



// // Add CSS imports to the page component
// const NatalChartPage = () => {
//   return (
//     <>
//       <style jsx global>{`
//         .leaflet-default-icon-path {
//           background-image: url(https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png);
//         }
//       `}</style>
//       <NatalChartGenerator />
//     </>
//   );
// };

// export default dynamic(() => Promise.resolve(NatalChartPage), {
//   ssr: false
// });