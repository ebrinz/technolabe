'use client'
import React, { useState } from 'react';

import { 
  ROMAN_NUMERALS, 
  CUNEIFORM_NUMBERS, 
  MODERN_PLANETS, 
  TRADITIONAL_PLANETS,
  ZODIAC_SIGNS,
  ASPECT_COLORS
} from '../../constants/constants';

const normalizeAngle = (angle) => {
  while (angle >= 360) angle -= 360;
  while (angle < 0) angle += 360;
  return angle;
};

const calculateMidpoint = (start, end) => {
  let mid = (start + end) / 2;
  return normalizeAngle(mid);
};


const AstralChart = ({ 
    chartData, 
    selectedPlanet, 
    onPlanetSelect,
    useCuneiform = true,
    useTraditional = false
  }) => {
  const [hoveredSign, setHoveredSign] = useState(null);
  const [hoveredPlanet, setHoveredPlanet] = useState(null);

  if (!chartData?.points) return null;

  // Get the appropriate number system and planet set
  const HOUSE_NUMBERS = useCuneiform ? CUNEIFORM_NUMBERS : ROMAN_NUMERALS;
  const PLANET_SYMBOLS = useTraditional ? TRADITIONAL_PLANETS : MODERN_PLANETS;

  const radius = 140;
  const center = { x: 200, y: 200 };
  const innerRadius = radius - 30;
  const outerBoundaryRadius = radius + 50;
  const zodiacRadius = radius + 20;
  const outerZodiacRadius = zodiacRadius + 10;
  const houseRadius = outerZodiacRadius + 4;
  const houseInnerRadius = innerRadius + 4;
  const zodiacLabelRadius = (radius + zodiacRadius) / 2 + 2;
  const houseLabelRadius = (outerBoundaryRadius + houseRadius) / 2 - 2;
  const planetLabelRadius = radius + 30;

  // Get Ascendant degree from chartData
  // const ascendantDegree = chartData.points.Ascendent?.longitude || 0;
  const ascendantDegree = chartData.houses.House1 || 0;

  // Calculate chart rotation to place Ascendant at 270 degrees (9 o'clock)
  const chartRotation = ascendantDegree - 270;

  // Position calculation functions
  const getChartPosition = (degree, r) => {
    const rotatedDegree = normalizeAngle(degree - chartRotation);
    return {
      x: center.x + r * Math.cos((rotatedDegree - 90) * Math.PI / 180),
      y: center.y + r * Math.sin((rotatedDegree - 90) * Math.PI / 180)
    };
  };

  const getTextPosition = (degree, r) => ({
    x: center.x + r * Math.cos((degree - 90) * Math.PI / 180),
    y: center.y + r * Math.sin((degree - 90) * Math.PI / 180),
    rotation: degree
  });

  const getFixedDegreeXY = (degrees, r) => {
    return {
      x: center.x + r * Math.cos((degrees - 90) * Math.PI / 180),
      y: center.y + r * Math.sin((degrees - 90) * Math.PI / 180)
    };
  };

  const getTextRotationAngle = (degree, r) => {
    const position = degreesToXY(degree, r);
    // Calculate angle between position and center
    const angle = Math.atan2(position.y - center.y, position.x - center.x) * (180 / Math.PI);
    // Add 90 degrees to make text perpendicular to radius line
    // The + 90 ensures bottom of text points to center
    return angle + 90;
  };

  // Use getChartPosition for all chart elements
  const degreesToXY = (degrees, r) => {
    const rotatedDegree = normalizeAngle(degrees - chartRotation);
    return {
      x: center.x + r * Math.cos((rotatedDegree - 90) * Math.PI / 180),
      y: center.y + r * Math.sin((rotatedDegree - 90) * Math.PI / 180)
    };
  };

  // Generate house cusps with fixed text orientation
  const houseCusps = Array.from({length: 12}, (_, i) => {
    const houseNum = i + 1;
    const currentHouse = `House${houseNum}`;
    const nextHouse = `House${(houseNum % 12) + 1}`;
    
    const degree = chartData.houses[currentHouse];
    const nextDegree = chartData.houses[nextHouse];
    
    // Calculate midpoint considering wrap-around
    const midpointDegree = nextDegree < degree 
      ? calculateMidpoint(degree, nextDegree + 360)
      : calculateMidpoint(degree, nextDegree);
  
    const normalizedMidpoint = normalizeAngle(midpointDegree);
    
    return {
      house: HOUSE_NUMBERS[i],
      houseNum: houseNum, // Add this to make checking for houses 6 and 12 easier
      startDegree: degree,
      endDegree: nextDegree,
      midpointDegree: normalizedMidpoint,
      position: degreesToXY(degree, radius),
      labelPosition: degreesToXY(normalizedMidpoint, houseLabelRadius),
      rotation: getTextRotationAngle(normalizedMidpoint, radius)
    };
  });


  const planets = Object.entries(chartData.points || {})
    .filter(([planet, data]) => {
      if (useTraditional) {
        return TRADITIONAL_PLANETS.hasOwnProperty(planet);
      }
      return data && data.longitude !== undefined;
    })
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

  // // Update planet positions while keeping text orientation
  // const planets = Object.entries(chartData.points || {})
  //   .filter(([planet, data]) => {
  //     if (useTraditional) {
  //       return TRADITIONAL_PLANETS.hasOwnProperty(planet);
  //     }
  //     return data && data.longitude !== undefined;
  //   })
  //   .map(([planet, data]) => {
  //     const chartPos = getChartPosition(data.longitude, radius * 0.8);
  //     const textPos = getTextPosition(data.longitude, planetLabelRadius);
      
  //     return {
  //       symbol: PLANET_SYMBOLS[planet] || planet,
  //       name: planet,
  //       longitude: data.longitude,
  //       position: chartPos,
  //       labelPosition: textPos,
  //       house: data.house,
  //       sign: data.sign,
  //       movement: data.movement
  //     };
  //   });

  

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

        {/* Enhanced animated glow filter for aspects */}
        <filter id="enhancedGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur">
            <animate 
              attributeName="stdDeviation" 
              values="1.5;3;1.5" 
              dur="3s" 
              repeatCount="indefinite" 
            />
          </feGaussianBlur>
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 12 -7"
            result="glow"
          />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>


        {/* Create gradients for each aspect type */}
        {Object.entries(ASPECT_COLORS).map(([aspectType, color]) => (
          <linearGradient
            key={`gradient-${aspectType}`}
            id={`aspect-gradient-${aspectType}`}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="50%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </linearGradient>
        ))}

        {/* Create masks for varying line thickness */}
        <mask id="aspectMask">
          <rect x="0" y="0" width="400" height="400" fill="white" />
        </mask>
        
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
      {/* Draw all house boundaries and labels */}
      {houseCusps.map((house, i) => (
        <g key={`house-group-${i}`}>
          {/* Main house line */}
          <line 
            key={`house-line-${i}`}
            x1={degreesToXY(house.startDegree, houseInnerRadius).x}
            y1={degreesToXY(house.startDegree, houseInnerRadius).y}
            x2={degreesToXY(house.startDegree, outerBoundaryRadius).x}
            y2={degreesToXY(house.startDegree, outerBoundaryRadius).y}
            className="stroke-orange-400/20"
            strokeWidth="1"
            // style={{ filter: 'url(#orangeGlow)' }}
          />
          {/* House label */}
          <text 
            key={`house-label-${i}`}
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
        const rotation = getTextPosition(sign.degree + 15);
        
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
      {/* {chartData.aspects.map((aspect, i) => {
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
      })} */}

      {/* Enhanced Animated Aspects */}
      <g className="aspects-layer">
        {chartData.aspects.map((aspect, i) => {
          const planet1 = planets.find(p => p.name === aspect.planet1);
          const planet2 = planets.find(p => p.name === aspect.planet2);
          if (!planet1 || !planet2) return null;

          // Calculate the midpoint for the thin part
          const midX = (planet1.position.x + planet2.position.x) / 2;
          const midY = (planet1.position.y + planet2.position.y) / 2;

          // Calculate the angle for proper gradient direction
          const angle = Math.atan2(
            planet2.position.y - planet1.position.y,
            planet2.position.x - planet1.position.x
          ) * 180 / Math.PI;

          const animDelay = (i * 0.7) % 5;

          return (
            <g key={`aspect-${i}`}>
              {/* Base thick line with gradient */}
              <path
                d={`M ${planet1.position.x} ${planet1.position.y} 
                    Q ${midX} ${midY} ${planet2.position.x} ${planet2.position.y}`}
                stroke={`url(#aspect-gradient-${aspect.aspect_type})`}
                strokeWidth="4"
                fill="none"
                opacity="0.9"
                style={{ filter: 'url(#enhancedGlow)' }}
              >
                <animate
                  attributeName="stroke-width"
                  values="4;6;4"
                  dur="3s"
                  begin={`${animDelay}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.9;0.6;0.9"
                  dur="3s"
                  begin={`${animDelay}s`}
                  repeatCount="indefinite"
                />
              </path>

              {/* Overlay thinner line for the center effect */}
              <path
                d={`M ${planet1.position.x} ${planet1.position.y} 
                    Q ${midX} ${midY} ${planet2.position.x} ${planet2.position.y}`}
                stroke={ASPECT_COLORS[aspect.aspect_type]}
                strokeWidth="1"
                fill="none"
                opacity="0.8"
                style={{ filter: 'url(#enhancedGlow)' }}
              >
                <animate
                  attributeName="opacity"
                  values="0.8;0.4;0.8"
                  dur="3s"
                  begin={`${animDelay}s`}
                  repeatCount="indefinite"
                />
              </path>
            </g>
          );
        })}
      </g>

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