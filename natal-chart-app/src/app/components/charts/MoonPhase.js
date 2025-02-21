'use client'
import React, { useEffect, useRef } from 'react';

const MoonPhase = ({ chartData }) => {
  const canvasRef = useRef(null);

  // Calculate moon phase based on sun and moon longitudes
  const calculateMoonPhase = () => {
    if (!chartData?.points?.Moon || !chartData?.points?.Sun) return null;

    const moonLong = chartData.points.Moon.longitude;
    const sunLong = chartData.points.Sun.longitude;
    
    // Calculate phase angle (0-360)
    let phaseAngle = moonLong - sunLong;
    if (phaseAngle < 0) phaseAngle += 360;
    
    // Calculate illumination (0-1)
    const illumination = (1 - Math.cos(phaseAngle * Math.PI / 180)) / 2;

    // Determine phase name
    let phaseName;
    if (phaseAngle < 12) phaseName = "New Moon";
    else if (phaseAngle < 90) phaseName = "Waxing Crescent";
    else if (phaseAngle < 135) phaseName = "First Quarter";
    else if (phaseAngle < 172) phaseName = "Waxing Gibbous";
    else if (phaseAngle < 198) phaseName = "Full Moon";
    else if (phaseAngle < 270) phaseName = "Waning Gibbous";
    else if (phaseAngle < 315) phaseName = "Last Quarter";
    else if (phaseAngle < 345) phaseName = "Waning Crescent";
    else phaseName = "New Moon";

    return {
      angle: phaseAngle,
      illumination,
      name: phaseName
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !chartData) return;

    const ctx = canvas.getContext('2d');
    const phase = calculateMoonPhase();
    if (!phase) return;

    const size = canvas.width;
    const radius = size / 3;
    const centerX = size / 2;
    const centerY = size / 2;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    const moonGradient = ctx.createRadialGradient(
        centerX, centerY, radius * 0.5,
        centerX, centerY, radius
      );
      moonGradient.addColorStop(0, '#06b6d4');  // Brighter cyan in center
      moonGradient.addColorStop(0.8, '#0891b2'); // Medium cyan


    // Draw moon circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = moonGradient; // Base moon color
    ctx.fill();

    ctx.shadowColor = 'rgba(251, 146, 60, 0.5)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(251, 146, 60, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.shadowBlur = 15;

    const phaseAngle = phase.angle;

    ctx.beginPath();

    let curveX

    if (phase.illumination >= 0.99) {
        return;
     } else if (phase.illumination <= 0.01) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#0f172a';  // Shadow color
        ctx.fill();
        ctx.shadowColor = 'rgba(251, 146, 60, 0.5)';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(251, 146, 60, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.shadowBlur = 15;
        return;
     } else if (phaseAngle < 180) {
        ctx.arc(centerX, centerY, radius, -Math.PI/2, Math.PI/2, true);
        curveX = centerX + radius * Math.cos((phase.illumination) * Math.PI );
      } else {
        ctx.arc(centerX, centerY, radius, -Math.PI/2, Math.PI/2, false);
        curveX = centerX - radius * Math.cos((phase.illumination) * Math.PI );
      }
    
    ctx.bezierCurveTo(
        curveX, centerY + radius,
        curveX, centerY - radius,
        centerX, centerY - radius
    );
    
    ctx.fillStyle = '#0f172a'; // Shadow color
    ctx.fill();

  }, [chartData]);

  const moonPhase = calculateMoonPhase();

  return (
    // <div className="bg-black/50 backdrop-blur-sm rounded-lg shadow-lg shadow-cyan-500/20 p-4 border border-cyan-500/20">
    <div>
      <h3 className="text-cyan-300 text-lg font-medium mb-4"></h3>
      <div className="flex items-center justify-center mb-4">
        <canvas 
          ref={canvasRef}
          width={200}
          height={200}
          className="w-32 h-32"
        />
      </div>
      {moonPhase && (
        // <div className="text-center">
        <div className="text-center">
          {/* <div className="text-cyan-300 font-medium mb-1">{moonPhase.name}</div> */}
          {/* <div className="text-cyan-400/70 text-sm"> */}
            {/* {(moonPhase.illumination * 100).toFixed(1)}% illuminated */}
          {/* </div> */}
          
          {/* <div className="text-cyan-400/70 text-sm"> */}
            {/* {moonPhase.angle.toFixed(1)}° phase angle */}
          {/* </div> */}
        </div>
      )}
    </div>
  );
};

export default MoonPhase;