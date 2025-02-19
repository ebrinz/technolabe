'use client'
import React, { useState } from 'react';
import { ASPECT_COLORS } from '../../constants/aspectColors';

const ZODIAC_SIGNS = [
  { symbol: '♈', name: 'Aries', degree: 0 },
  { symbol: '♉', name: 'Taurus', degree: 30 },
  { symbol: '♊', name: 'Gemini', degree: 60 },
  { symbol: '♋', name: 'Cancer', degree: 90 },
  { symbol: '♌', name: 'Leo', degree: 120 },
  { symbol: '♍', name: 'Virgo', degree: 150 },
  { symbol: '♎', name: 'Libra', degree: 180 },
  { symbol: '♏', name: 'Scorpio', degree: 210 },
  { symbol: '♐', name: 'Sagittarius', degree: 240 },
  { symbol: '♑', name: 'Capricorn', degree: 270 },
  { symbol: '♒', name: 'Aquarius', degree: 300 },
  { symbol: '♓', name: 'Pisces', degree: 330 }
];

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

const CUNEIFORM_NUMBERS = ['𒁹', '𒁹𒁹', '𒁹𒁹𒁹', '𒁹𒁹𒁹𒁹', '𒈠', '𒈠𒁹', '𒈠𒁹𒁹', '𒈠𒁹𒁹𒁹', '𒈠𒁹𒁹𒁹𒁹', '𒈦', '𒈦𒁹', '𒈦𒁹𒁹']

const PLANET_SYMBOLS = {
  'Sun': '☉',
  'Moon': '☽',
  'Mercury': '☿',
  'Venus': '♀',
  'Mars': '♂',
  'Jupiter': '♃',
  'Saturn': '♄',
  'Uranus': '♅',
  'Neptune': '♆',
  'Pluto': '♇',
  'North Node': '☊',
  'South Node': '☋'
};

const normalizeAngle = (angle) => {
  while (angle >= 360) angle -= 360;
  while (angle < 0) angle += 360;
  return angle;
};

const calculateMidpoint = (start, end) => {
  let mid = (start + end) / 2;
  return normalizeAngle(mid);
};

const AstralChart = ({ chartData, selectedPlanet, onPlanetSelect }) => {
  const [hoveredSign, setHoveredSign] = useState(null);
  const [hoveredPlanet, setHoveredPlanet] = useState(null);
  
  if (!chartData?.points) return null;

  const radius = 140; // Slightly reduced from 150
  const center = { x: 200, y: 200 }; // Adjusted from 200,200
  const innerRadius = radius - 30;
  const outerBoundaryRadius = radius + 50; // Reduced from 55
  const zodiacRadius = radius + 20; // Adjusted
  const outerZodiacRadius = zodiacRadius + 10;
  const houseRadius = outerZodiacRadius + 4; // Adjusted
  const houseInnerRadius = innerRadius + 4;
  const zodiacLabelRadius = (radius + zodiacRadius) / 2 + 2;
  const houseLabelRadius = (outerBoundaryRadius + houseRadius) / 2 - 2;
  const planetLabelRadius = radius + 30; // Adjusted


  const getTextRotation = (degrees) => {
    let rotation = degrees;
    return rotation;
  };

  const degreesToXY = (degrees, r) => ({
    x: center.x + r * Math.cos((degrees - 90) * Math.PI / 180),
    y: center.y + r * Math.sin((degrees - 90) * Math.PI / 180)
  });

  const houseCusps = Object.entries(chartData.houses)
  .map(([house, degree]) => { 
    const houseNum = parseInt(house.replace('House', ''));
    const nextHouseNum = (houseNum % 12) + 1;
    const nextDegree = chartData.houses[`House${nextHouseNum}`] || chartData.houses.House1;
    const midpointDegree = nextDegree < degree 
      ? calculateMidpoint(degree, nextDegree + 360)
      : calculateMidpoint(degree, nextDegree);
    
    return {
      house: CUNEIFORM_NUMBERS[houseNum - 1], // Adjust index to be 0-based
      startDegree: degree,
      midpointDegree: normalizeAngle(midpointDegree),
      position: degreesToXY(degree, radius),
      labelPosition: degreesToXY(normalizeAngle(midpointDegree), houseLabelRadius),
      rotation: getTextRotation(normalizeAngle(midpointDegree))
    };
  });

  const planets = Object.entries(chartData.points || {})
  .filter(([planet, data]) => data && data.longitude !== undefined)
  .map(([planet, data]) => ({
    symbol: PLANET_SYMBOLS[planet] || planet,
    name: planet,
    longitude: data.longitude,
    position: degreesToXY(data.longitude, radius * 0.8),
    labelPosition: degreesToXY(data.longitude, planetLabelRadius),
    house: data.house,
    sign: data.sign,
    movement: data.movement
  }));

  return (
    <svg viewBox="0 0 400 400" className="w-full h-full">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id="orangeGlow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        
        {/* Animated glow filter for aspects */}
        <filter id="animatedGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur">
            <animate 
              attributeName="stdDeviation" 
              values="2;6;2" 
              dur="4s" 
              repeatCount="indefinite" 
            />
          </feGaussianBlur>
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 18 -7"
            result="glow"
          />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background circles */}
      <circle cx={center.x} cy={center.y} r={outerBoundaryRadius} 
              className="fill-none stroke-orange-500/30" strokeWidth="1.5"/>
      <circle cx={center.x} cy={center.y} r={houseRadius} 
              className="fill-none stroke-orange-400/20" strokeWidth="1"/>
      <circle cx={center.x} cy={center.y} r={outerZodiacRadius} 
              className="fill-none stroke-cyan-400/30" strokeWidth="1"/>
      <circle cx={center.x} cy={center.y} r={radius} 
              className="fill-none stroke-cyan-400/30" strokeWidth="1"/>
      <circle cx={center.x} cy={center.y} r={houseInnerRadius} 
              className="fill-none stroke-orange-300/20" strokeWidth="0.5"/>
      <circle cx={center.x} cy={center.y} r={innerRadius} 
              className="fill-none stroke-cyan-300/20" strokeWidth="0.5"/>

       {/* House cusp lines */}
       {houseCusps.map((house, i) => (
        <g key={`house-${i}`}>
          <line 
            x1={degreesToXY(house.startDegree, houseInnerRadius).x}
            y1={degreesToXY(house.startDegree, houseInnerRadius).y}
            x2={degreesToXY(house.startDegree, outerBoundaryRadius).x}
            y2={degreesToXY(house.startDegree, outerBoundaryRadius).y}
            className="stroke-orange-400/20"
            strokeWidth="1"
            style={{ filter: 'url(#orangeGlow)' }}
          />
          <text 
            x={house.labelPosition.x}
            y={house.labelPosition.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-orange-300 text-xs font-serif"
            style={{ 
              filter: 'url(#orangeGlow)',
              transform: `rotate(${house.rotation}deg)`,
              transformOrigin: `${house.labelPosition.x}px ${house.labelPosition.y}px`
            }}
          >
            {house.house}
          </text>
        </g>
      ))}

      {/* Zodiac cusps and degree markers */}
      {ZODIAC_SIGNS.map((sign, i) => {
        const cuspDegree = sign.degree - 15;
        // const midpointDegree = cuspDegree + 15; // Midpoint of the sign
        
        const degreeMarkers = [];
        for (let deg = 0; deg < 30; deg++) {
          const markerDegree = cuspDegree + deg;
          let markerLength = 4; // Default small marker
          
          if (deg === 15) {
            markerLength = 12;
          } 
          else if (deg % 5 === 0) {
            markerLength = 8;
          }

          const markerStart = degreesToXY(markerDegree, radius - markerLength);
          const markerEnd = degreesToXY(markerDegree, radius);
          
          
          degreeMarkers.push(
            <line
              key={`marker-${i}-${deg}`}
              x1={markerStart.x}
              y1={markerStart.y}
              x2={markerEnd.x}
              y2={markerEnd.y}
              className={`stroke-cyan-300 ${deg === 15 ? 'stroke-2' : 'stroke-1'}`}
              opacity={deg === 15 ? "0.8" : "0.6"}
            />
          );
        }

        return (
          <g key={`cusp-${i}`}>
            {degreeMarkers}
          </g>
        );
      })}

      {/* Zodiac cusp borderlines */}
      {ZODIAC_SIGNS.map((sign, i) => {
        const cuspLineDegree = sign.degree;
        const cuspLineMarkers = [];
        
        const cuspLineStart = degreesToXY(cuspLineDegree, outerZodiacRadius);
        const cuspLineEnd = degreesToXY(cuspLineDegree, radius);
          
        cuspLineMarkers.push(
            <line
                key={`marker-${i}-${cuspLineDegree}`}
                x1={cuspLineStart.x}
                y1={cuspLineStart.y}
                x2={cuspLineEnd.x}
                y2={cuspLineEnd.y}
                className={`stroke-cyan-300 stroke-1`}
                opacity={0.3}
            />
        );

        return (
          <g key={`cusp-${i}`}>
            {cuspLineMarkers}
          </g>
        );
      })}

      {/* Zodiac signs with rotated labels */}
      {ZODIAC_SIGNS.map((sign, i) => {
        const position = degreesToXY(sign.degree + 15, zodiacLabelRadius);
        const rotation = getTextRotation(sign.degree + 15);
        
        return (
          <g key={`zodiac-${i}`}
             onMouseEnter={() => setHoveredSign(sign.name)}
             onMouseLeave={() => setHoveredSign(null)}
             className="cursor-help">
            <text 
              x={position.x}
              y={position.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-cyan-300 text-xl font-astrological"
              style={{ 
                textShadow: '0 0 10px #06b6d4',
                fontFamily: 'Arial Unicode MS, sans-serif',
                transform: `rotate(${rotation}deg)`,
                transformOrigin: `${position.x}px ${position.y}px`
              }}
            >
              {sign.symbol}
            </text>
            {hoveredSign === sign.name && (
              <g>
                <rect
                  x={position.x - 40}
                  y={position.y + 10}
                  width="80"
                  height="20"
                  rx="4"
                  className="fill-gray-900/80"
                />
                <text 
                  x={position.x}
                  y={position.y + 20}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-cyan-300/90 text-xs"
                >
                  {sign.name}
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* Animated Aspects */}
      {chartData.aspects.map((aspect, i) => {
        const planet1 = planets.find(p => p.name === aspect.planet1);
        const planet2 = planets.find(p => p.name === aspect.planet2);
        if (!planet1 || !planet2) return null;
        
        // Different animation delay for each aspect based on aspect type and planets
        const animDelay = (i * 0.7) % 5;
        
        return (
          <line 
            key={`aspect-${i}`}
            x1={planet1.position.x}
            y1={planet1.position.y}
            x2={planet2.position.x}
            y2={planet2.position.y}
            stroke={ASPECT_COLORS[aspect.aspect_type]}
            opacity="0.9"
            filter="url(#animatedGlow)"
          >
            <animate
              attributeName="stroke-width"
              values="1.5;3;1.5"
              dur="3s"
              begin={`${animDelay}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.95;0.5;0.95"
              dur="3s"
              begin={`${animDelay}s`}
              repeatCount="indefinite"
            />
          </line>
        );
      })}

      {/* Planets */}
      {planets.map((planet, i) => (
        <g key={i} 
           className="cursor-pointer transition-all duration-300"
           onClick={() => onPlanetSelect(planet.name)}
           onMouseEnter={() => setHoveredPlanet(planet.name)}
           onMouseLeave={() => setHoveredPlanet(null)}>
          <circle 
            cx={planet.position.x}
            cy={planet.position.y}
            r="12"
            className={`${
              selectedPlanet === planet.name 
                ? 'fill-cyan-900/30 stroke-cyan-400' 
                : 'fill-transparent stroke-transparent'
            } transition-all duration-300`}
          />
          <text 
            x={planet.position.x}
            y={planet.position.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className={`text-lg font-astrological ${
              selectedPlanet === planet.name 
                ? 'fill-cyan-300' 
                : 'fill-orange-300'
            }`}
            style={{ 
              textShadow: selectedPlanet === planet.name 
                ? '0 0 10px #00FFFF' 
                : '0 0 10px #FF00FF',
              fontFamily: 'Arial Unicode MS, sans-serif'
            }}
          >
            {planet.symbol}
          </text>
          
          {/* Tooltip */}
          {hoveredPlanet === planet.name && (
            <g>
              <rect
                x={planet.position.x - 40}
                y={planet.position.y + 10}
                width="80"
                height="20"
                rx="4"
                className="fill-gray-900/80"
              />
              <text 
                x={planet.position.x}
                y={planet.position.y + 20}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-pink-300/90 text-xs"
              >
                {planet.name}
              </text>
            </g>
          )}
        </g>
      ))}
    </svg>
  );
};

export default AstralChart;