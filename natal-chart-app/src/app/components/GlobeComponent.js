import React, { useEffect, useRef, useState } from 'react';
import { feature } from 'topojson-client';

const GlobeComponent = ({ selectedLocation }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const countriesRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const animationFrameId = useRef(null);
  
  // Load country data on mount
  useEffect(() => {
    let isMounted = true;

    async function loadCountries() {
      try {
        setIsLoading(true);
        const response = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json');
        const topology = await response.json();
        
        if (isMounted) {
          countriesRef.current = feature(topology, topology.objects.countries);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error loading country data:', error);
        if (isMounted) {
          setError('Failed to load map data');
          setIsLoading(false);
        }
      }
    }

    loadCountries();

    return () => {
      isMounted = false;
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  // Handle canvas setup and drawing
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || isLoading) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext('2d');
    
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

    // Utility functions
    function degreesToRadians(degrees) {
      return degrees * Math.PI / 180;
    }

    function geoTo3d(lat, lng, radius) {
      const phi = degreesToRadians(lat);
      const theta = degreesToRadians(lng);
      
      return {
        x: radius * Math.cos(phi) * Math.sin(theta),
        y: -radius * Math.sin(phi),  // Negating y to flip the globe right-side up
        z: radius * Math.cos(phi) * Math.cos(theta)
      };
    }

    function rotatePoint(point, angleX, angleY) {
      const { x, y, z } = point;
      
      // Rotate around Y axis (longitude)
      const radY = degreesToRadians(angleY);
      const cosY = Math.cos(radY);
      const sinY = Math.sin(radY);
      const x2 = x * cosY - z * sinY;
      const z2 = z * cosY + x * sinY;
      
      // Rotate around X axis (latitude)
      const radX = degreesToRadians(angleX);
      const cosX = Math.cos(radX);
      const sinX = Math.sin(radX);
      const y3 = y * cosX - z2 * sinX;
      const z3 = z2 * cosX + y * sinX;
      
      return { x: x2, y: y3, z: z3 };
    }

    function projectPoint(point, width, height) {
      return {
        x: width/2 + point.x,
        y: height/2 + point.y,
        visible: point.z > 0
      };
    }

    function drawGlobe() {
      if (!ctx || !canvas.width || !canvas.height) return;

      const { width, height } = canvas;
      const radius = Math.min(width, height) / 3;
      
      ctx.clearRect(0, 0, width, height);

      // Draw base globe
      ctx.beginPath();
      ctx.arc(width/2, height/2, radius, 0, 2 * Math.PI);
      ctx.fillStyle = '#111827';
      ctx.fill();
      ctx.strokeStyle = '#0891b2';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Use selectedLocation for rotation
      const rotationY = selectedLocation.lng;
      const rotationX = selectedLocation.lat;

      // Draw countries if loaded
      if (countriesRef.current) {
        ctx.strokeStyle = 'rgba(8, 145, 178, 0.4)';
        ctx.lineWidth = 0.5;

        countriesRef.current.features.forEach(feature => {
          feature.geometry.coordinates.forEach(polygon => {
            const coordinates = Array.isArray(polygon[0][0]) ? polygon : [polygon];
            
            coordinates.forEach(ring => {
              ctx.beginPath();
              let started = false;

              ring.forEach(([lng, lat]) => {
                const point = geoTo3d(lat, lng, radius);
                const rotated = rotatePoint(point, rotationX, rotationY);
                const projected = projectPoint(rotated, width, height);

                if (projected.visible) {
                  if (!started) {
                    ctx.moveTo(projected.x, projected.y);
                    started = true;
                  } else {
                    ctx.lineTo(projected.x, projected.y);
                  }
                }
              });

              ctx.stroke();
            });
          });
        });
      }

      // Draw grid lines
      ctx.strokeStyle = 'rgba(8, 145, 178, 0.2)';
      
      // Draw latitude lines
      for (let lat = 80; lat >= -80; lat -= 20) {
        ctx.beginPath();
        let started = false;
        for (let lng = -180; lng <= 180; lng += 5) {
          const point = geoTo3d(lat, lng, radius);
          const rotated = rotatePoint(point, rotationX, rotationY);
          const projected = projectPoint(rotated, width, height);

          if (projected.visible) {
            if (!started) {
              ctx.moveTo(projected.x, projected.y);
              started = true;
            } else {
              ctx.lineTo(projected.x, projected.y);
            }
          }
        }
        ctx.stroke();
      }

      // Draw longitude lines
      for (let lng = -180; lng <= 180; lng += 30) {
        ctx.beginPath();
        let started = false;
        for (let lat = -90; lat <= 90; lat += 5) {
          const point = geoTo3d(lat, lng, radius);
          const rotated = rotatePoint(point, rotationX, rotationY);
          const projected = projectPoint(rotated, width, height);

          if (projected.visible) {
            if (!started) {
              ctx.moveTo(projected.x, projected.y);
              started = true;
            } else {
              ctx.lineTo(projected.x, projected.y);
            }
          }
        }
        ctx.stroke();
      }

      // Draw marker at selected location
      const markerPoint = geoTo3d(selectedLocation.lat, selectedLocation.lng, radius);
      const rotatedMarker = rotatePoint(markerPoint, rotationX, rotationY);
      const projectedMarker = projectPoint(rotatedMarker, width, height);
      
      if (projectedMarker.visible) {
        ctx.beginPath();
        ctx.arc(projectedMarker.x, projectedMarker.y, 8, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(projectedMarker.x, projectedMarker.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = '#06b6d4';
        ctx.fill();
      }
    }

    // Set up resize handler
    const resizeObserver = new ResizeObserver(updateCanvasSize);
    resizeObserver.observe(container);

    // Initial draw
    updateCanvasSize();

    return () => {
      resizeObserver.disconnect();
    };
  }, [selectedLocation, isLoading]);

  if (error) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-black/30 rounded-lg">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-black/30 rounded-lg">
        <div className="text-cyan-300">Loading map data...</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="absolute"
      />
      <div className="absolute bottom-2 left-2 text-cyan-300 text-sm">
        Lat: {selectedLocation.lat.toFixed(2)}° Lng: {selectedLocation.lng.toFixed(2)}°
      </div>
    </div>
  );
};

export default GlobeComponent;