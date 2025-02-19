import React from 'react';
import { useEffect, useState } from 'react';

const TimeDial = ({ time = "12:00", linkedToLocation = true }) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const getTimeDetails = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const hourAngle = ((hours % 12) + minutes / 60) * 30; // 30 degrees per hour
    const minuteAngle = minutes * 6; // 6 degrees per minute
    const isPM = hours >= 12;
    return { hourAngle, minuteAngle, isPM };
  };

  const { hourAngle, minuteAngle, isPM } = getTimeDetails(time);

  if (!mounted) {
    return (
      <div className="w-32 h-32 rounded-full bg-slate-100 dark:bg-slate-800" />
    );
  }

  return (
    <div className="w-32">
      <div className="relative">
        <svg viewBox="0 0 160 160" className="w-full h-full">
        
          <defs>
            {/* Simple glow effect */}
            <filter id="simple-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1" />
            </filter>
            <filter id="orangeGlow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
          </defs>

          {/* Dial background */}
          <circle
            cx="80"
            cy="80"
            r="76"
            fill="none"
            className="stroke-orange-500/50"
            strokeWidth="1"
            style={{ 
              filter: 'url(#orangeGlow)',
            }}
          />
          {/* Dial background */}
          <circle
            cx="80"
            cy="80"
            r="68"
            fill="none"
            className="stroke-cyan-500/50"
            strokeWidth="1"
            style={{ 
              filter: 'url(#orangeGlow)',
            }}
          />

          {/* Hour markers */}
          {[...Array(12)].map((_, i) => (
            <line
              key={i}
              x1="80"
              y1="15"
              x2="80"
              y2="25"
              className="stroke-cyan-300/40"
              strokeWidth="2"
              transform={`rotate(${i * 30} 80 80)`}
            />
          ))}

           {/* minute markers */}
           {[...Array(60)].map((_, i) => (
            <line
              key={i}
              x1="80"
              y1="20"
              x2="80"
              y2="15"
              className="stroke-cyan-300/40"
              strokeWidth="1"
              transform={`rotate(${i * 6} 80 80)`}
            />
          ))}

          {/* AM/PM indicators */}
          <text
            x="80"
            y="50"
            textAnchor="middle"
            className={`text-xs fill-cyan-400 ${isPM ? 'opacity-30' : 'opacity-100'}`}
          >
            AM
          </text>
          <text
            x="80"
            y="110"
            textAnchor="middle"
            className={`text-xs fill-cyan-400 ${isPM ? 'opacity-100' : 'opacity-30'}`}
          >
            PM
          </text>

          {/* Hands group */}
          <g>
            {/* Hour hand */}
            <line
              transform={`rotate(${hourAngle} 80 80)`}
              x1="80"
              y1="80"
              x2="80"
              y2="40"
              className="stroke-cyan-500"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Minute hand */}
            <line
              transform={`rotate(${minuteAngle} 80 80)`}
              x1="80"
              y1="80"
              x2="80"
              y2="30"
              className="stroke-cyan-400"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>

          {/* Center dot */}
          <circle
            cx="80"
            cy="80"
            r="4"
            className="fill-cyan-400/40"
          />
        </svg>
      </div>
    </div>
  );
};

export default TimeDial;