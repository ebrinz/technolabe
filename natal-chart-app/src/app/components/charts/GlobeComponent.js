import React, { useEffect, useRef } from 'react';

const GeoJSON_URL = 'https://unpkg.com/world-atlas@2/land-110m.json';

const GlobeComponent = ({ selectedLocation }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const geoDataRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext('2d');

    // Fetch GeoJSON data if not already loaded
    if (!geoDataRef.current) {
      fetch(GeoJSON_URL)
        .then(response => response.json())
        .then(data => {
          geoDataRef.current = data;
          drawGlobe(); // Redraw once data is loaded
        })
        .catch(error => {
          console.error('Error loading world map data:', error);
        });
    }
    
    function updateCanvasSize() {
      const containerRect = container.getBoundingClientRect();
      const size = Math.min(containerRect.width, containerRect.height);
      
      canvas.width = size;
      canvas.height = size;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      
      canvas.style.position = 'absolute';
      canvas.style.left = `${(containerRect.width - size) / 2}px`;
      canvas.style.top = `${(containerRect.height - size) / 2}px`;
      
      drawGlobe();
    }

    function degreesToRadians(degrees) {
      return degrees * Math.PI / 180;
    }

    function projectPoint(lat, lng, radius) {
      const φ1 = degreesToRadians(lat);
      const λ1 = degreesToRadians(lng);
      const φ2 = degreesToRadians(selectedLocation.lat);
      const λ2 = degreesToRadians(selectedLocation.lng);

      const cosC = Math.sin(φ1) * Math.sin(φ2) + 
                  Math.cos(φ1) * Math.cos(φ2) * Math.cos(λ1 - λ2);
      
      if (cosC < 0) return null;

      const x = radius * Math.cos(φ1) * Math.sin(λ1 - λ2);
      const y = radius * (Math.cos(φ2) * Math.sin(φ1) - 
                         Math.sin(φ2) * Math.cos(φ1) * Math.cos(λ1 - λ2));

      return { x, y };
    }

    function drawSpecialLine(latitude, color, radius, centerX, centerY, glow = true) {
      if (glow) {
        ctx.beginPath();
        ctx.strokeStyle = `${color}33`;
        ctx.lineWidth = 0.5;
        drawLatitudeLine(latitude, radius, centerX, centerY);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.strokeStyle = `${color}66`;
        ctx.lineWidth = 0.5;
        drawLatitudeLine(latitude, radius, centerX, centerY);
        ctx.stroke();
      }
      
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 0.5;
      drawLatitudeLine(latitude, radius, centerX, centerY);
      ctx.stroke();
    }

    function drawLatitudeLine(latitude, radius, centerX, centerY) {
      let firstPoint = true;
      let lastPoint = null;
      
      for (let lng = -180; lng <= 180; lng += 2) {
        const point = projectPoint(latitude, lng, radius);
        if (!point) {
          firstPoint = true;
          continue;
        }
        
        if (firstPoint) {
          ctx.moveTo(centerX + point.x, centerY - point.y);
          firstPoint = false;
        } else if (lastPoint) {
          const dist = Math.hypot(point.x - lastPoint.x, point.y - lastPoint.y);
          if (dist > radius / 2) {
            firstPoint = true;
            continue;
          }
          ctx.lineTo(centerX + point.x, centerY - point.y);
        }
        lastPoint = point;
      }
    }

    function drawMeridianLine(longitude, radius, centerX, centerY) {
      let firstPoint = true;
      let lastPoint = null;
      
      for (let lat = -80; lat <= 80; lat += 2) {
        const point = projectPoint(lat, longitude, radius);
        if (!point) {
          firstPoint = true;
          continue;
        }
        
        if (firstPoint) {
          ctx.moveTo(centerX + point.x, centerY - point.y);
          firstPoint = false;
        } else if (lastPoint) {
          const dist = Math.hypot(point.x - lastPoint.x, point.y - lastPoint.y);
          if (dist > radius / 2) {
            firstPoint = true;
            continue;
          }
          ctx.lineTo(centerX + point.x, centerY - point.y);
        }
        lastPoint = point;
      }
    }

    function drawMapVectors(radius, centerX, centerY) {
      if (!geoDataRef.current || !geoDataRef.current.features) return;

      ctx.strokeStyle = 'rgba(255, 152, 0, 0.6)';
      ctx.lineWidth = 0.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      geoDataRef.current.features.forEach(feature => {
        if (feature.geometry.type === 'Polygon') {
          drawVectorPolygon(feature.geometry.coordinates[0], radius, centerX, centerY);
        } else if (feature.geometry.type === 'MultiPolygon') {
          feature.geometry.coordinates.forEach(polygon => {
            drawVectorPolygon(polygon[0], radius, centerX, centerY);
          });
        }
      });
    }

    function drawVectorPolygon(coordinates, radius, centerX, centerY) {
      ctx.beginPath();
      let firstPoint = true;
      let lastPoint = null;
      let lastValidPoint = null;

      coordinates.forEach(([lng, lat]) => {
        const point = projectPoint(lat, lng, radius);
        if (!point) {
          if (lastValidPoint) {
            firstPoint = true;
          }
          return;
        }

        if (firstPoint) {
          ctx.moveTo(centerX + point.x, centerY - point.y);
          firstPoint = false;
        } else if (lastPoint) {
          const dist = Math.hypot(point.x - lastPoint.x, point.y - lastPoint.y);
          if (dist <= radius / 2) {
            ctx.lineTo(centerX + point.x, centerY - point.y);
          } else {
            ctx.moveTo(centerX + point.x, centerY - point.y);
          }
        }
        lastPoint = point;
        lastValidPoint = point;
      });

      // Connect back to the start if possible
      if (lastValidPoint && !firstPoint) {
        const startPoint = coordinates[0];
        const point = projectPoint(startPoint[1], startPoint[0], radius);
        if (point) {
          const dist = Math.hypot(point.x - lastValidPoint.x, point.y - lastValidPoint.y);
          if (dist <= radius / 2) {
            ctx.lineTo(centerX + point.x, centerY - point.y);
          }
        }
      }

      ctx.stroke();
    }

    function drawGlobe() {
      if (!ctx || !canvas.width || !canvas.height) return;

      const { width, height } = canvas;
      const radius = Math.min(width, height) / 2.5;
      const centerX = width / 2;
      const centerY = height / 2;
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw globe background
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = '#111827';
      ctx.fill();
      ctx.strokeStyle = '#0891b2';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw regular grid
      ctx.strokeStyle = 'rgba(8, 145, 178, 0.15)';
      ctx.lineWidth = 0.5;

      // Draw longitude lines
      for (let lng = -180; lng <= 180; lng += 15) {
        if (lng === 0) continue;
        ctx.beginPath();
        drawMeridianLine(lng, radius, centerX, centerY);
        ctx.stroke();
      }

      // Draw regular latitude lines
      for (let lat = -75; lat <= 75; lat += 15) {
        if ([0, 23.5, -23.5, 66.5, -66.5].includes(Math.abs(lat))) continue;
        ctx.beginPath();
        drawLatitudeLine(lat, radius, centerX, centerY);
        ctx.stroke();
      }

      // Draw map vectors if data is available
      if (geoDataRef.current) {
        drawMapVectors(radius, centerX, centerY);
      }

      // Draw special reference lines
      drawSpecialLine(0, '#0891b2', radius, centerX, centerY);
      drawSpecialLine(23.5, '#0891b2', radius, centerX, centerY);
      drawSpecialLine(-23.5, '#0891b2', radius, centerX, centerY);
      drawSpecialLine(66.5, '#0891b2', radius, centerX, centerY);
      drawSpecialLine(-66.5, '#0891b2', radius, centerX, centerY);
      
      // Prime Meridian
      ctx.beginPath();
      ctx.strokeStyle = '#0891b2';
      ctx.lineWidth = 1;
      drawMeridianLine(0, radius, centerX, centerY);
      ctx.stroke();

      // Draw central beacon
      const beaconGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, 12
      );
      beaconGradient.addColorStop(0, '#06b6d4');
      beaconGradient.addColorStop(1, 'rgba(6, 182, 212, 0)');

      ctx.beginPath();
      ctx.arc(centerX, centerY, 12, 0, 2 * Math.PI);
      ctx.fillStyle = beaconGradient;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(centerX, centerY, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#06b6d4';
      ctx.fill();
    }

    // Set up resize handler
    const resizeObserver = new ResizeObserver(updateCanvasSize);
    resizeObserver.observe(container);

    // Initial draw
    updateCanvasSize();

    return () => {
      resizeObserver.disconnect();
    };
  }, [selectedLocation]);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <canvas ref={canvasRef} />
      <div className="absolute bottom-2 left-2 text-cyan-300 text-sm">
        Lat: {selectedLocation.lat.toFixed(2)}° Lng: {selectedLocation.lng.toFixed(2)}°
      </div>
    </div>
  );
};

export default GlobeComponent;