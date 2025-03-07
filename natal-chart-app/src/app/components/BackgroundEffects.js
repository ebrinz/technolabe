'use client'
import React, { useEffect, useRef } from 'react';

const BackgroundEffects = () => {
  const canvasRef = useRef(null);
  const foregroundStarsRef = useRef([]);
  const backgroundStarsRef = useRef([]);
  const animationFrameRef = useRef(null);

  // Realistic star colors based on stellar classification
  const starColors = [
    { color: '#ff4422', weight: 1 },   // Class M (Red)
    { color: '#ff8866', weight: 2 },   // Class K (Orange)
    { color: '#ffaa44', weight: 3 },   // Class G (Yellow-Orange)
    { color: '#ffffff', weight: 4 },   // Class F (White)
    { color: '#aaaaff', weight: 3 },   // Class A (Blue-White)
    { color: '#99bbff', weight: 2 },   // Class B (Blue)
    { color: '#99ddff', weight: 1 },   // Class O (Bright Blue)
  ];

  const getRandomStarColor = () => {
    const totalWeight = starColors.reduce((sum, color) => sum + color.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const star of starColors) {
      if (random < star.weight) return star.color;
      random -= star.weight;
    }
    return starColors[0].color;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    const centerX = width * 0.666; // Places origin point at 2/3 of screen width
    const centerY = height * 0.5;  // Places origin point at middle height

    const initCanvas = () => {
      canvas.width = width;
      canvas.height = height;
    };

    const createStar = (isForeground) => {
      // Start stars from center
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * (isForeground ? 100 : 200);
      
      return {
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        size: isForeground ? Math.random() * 2 + 1 : Math.random() * 1 + 0.5,
        speed: isForeground ? Math.random() * 2 + 2 : Math.random() * 1 + 0.5,
        angle: angle,
        distance: distance,
        color: getRandomStarColor(),
        brightness: Math.random() * 0.3 + 0.7, // Increased minimum brightness from 0.5 to 0.7
        twinkleSpeed: Math.random() * 0.05 + 0.02,
        twinklePhase: Math.random() * Math.PI * 2,
      };
    };

    const createStars = () => {
      foregroundStarsRef.current = Array.from({ length: 100 }, () => createStar(true));
      backgroundStarsRef.current = Array.from({ length: 200 }, () => createStar(false));
    };

    const drawStar = (star) => {
      // Update twinkle effect
      star.twinklePhase += star.twinkleSpeed;
      const twinkle = Math.sin(star.twinklePhase) * 0.2 + 0.8;
      
      // Create gradient for glow effect
      const gradient = ctx.createRadialGradient(
        star.x, star.y, 0,
        star.x, star.y, star.size * 2
      );
      
      // Convert hex color to RGB for opacity handling
      const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : null;
      };
      
      const rgb = hexToRgb(star.color);
      const opacity = star.brightness * twinkle;
      
      gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity * 1.5})`);  // Increased core brightness
      gradient.addColorStop(0.4, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity * 0.6})`); // Increased glow brightness
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.beginPath();
      ctx.fillStyle = gradient;
      ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
      ctx.fill();
    };

    const updateStarPosition = (star, speedMultiplier) => {
      // Calculate new position with outward expansion
      const expansionSpeed = star.speed * speedMultiplier;
      star.distance += expansionSpeed;
      
      // Calculate new coordinates with slight sideways movement
      const sideOffset = Math.sin(star.angle) * (star.distance * 0.1);
      star.x = centerX + Math.cos(star.angle) * star.distance + sideOffset;
      star.y = centerY + Math.sin(star.angle) * star.distance - star.distance * 0.5;

      // Reset star if it goes off screen
      const margin = 50;
      if (star.x < -margin || star.x > width + margin || 
          star.y < -margin || star.y > height + margin) {
        Object.assign(star, createStar(speedMultiplier > 1));
      }
    };

    const drawStars = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Draw and update background stars
      backgroundStarsRef.current.forEach(star => {
        drawStar(star);
        updateStarPosition(star, 0.5);
      });

      // Draw and update foreground stars
      foregroundStarsRef.current.forEach(star => {
        drawStar(star);
        updateStarPosition(star, 2);
      });

      animationFrameRef.current = requestAnimationFrame(drawStars);
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      initCanvas();
      createStars();
    };

    initCanvas();
    createStars();
    drawStars();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: -1 }}
    />
  );
};

export default BackgroundEffects;