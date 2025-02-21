'use client'
import React, { useEffect, useRef } from 'react';

const BackgroundEffects = () => {
  const canvasRef = useRef(null);
  const starsRef = useRef([]);
  const brightStarsRef = useRef([]);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;

    const initCanvas = () => {
      canvas.width = width;
      canvas.height = height;
    };

    // Create stars with different properties for variety
    const createStars = () => {
      // Regular stars
      starsRef.current = Array.from({ length: 150 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5 + 0.5,
        speed: Math.random() * 0.3 + 0.1,
        opacity: Math.random() * 0.5 + 0.3,
        layer: Math.floor(Math.random() * 3)  // Different depth layers
      }));

      // Bright stars with glow effect
      brightStarsRef.current = Array.from({ length: 15 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 0.2 + 0.05,
        baseOpacity: Math.random() * 0.3 + 0.7,
        glowSize: Math.random() * 4 + 2,
        pulse: 0,
        pulseSpeed: Math.random() * 0.03 + 0.01,
        color: Math.random() > 0.5 ? '#add8e6' : '#ffffff'  // Mix of white and light blue
      }));
    };

    const drawStar = (x, y, size, opacity) => {
      ctx.beginPath();
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawBrightStar = (star) => {
      // Update pulse
      star.pulse += star.pulseSpeed;
      const pulseOpacity = Math.sin(star.pulse) * 0.2 + star.baseOpacity;

      // Draw glow effect
      const gradient = ctx.createRadialGradient(
        star.x, star.y, 0,
        star.x, star.y, star.glowSize * 2
      );
      gradient.addColorStop(0, `rgba(255, 255, 255, ${pulseOpacity})`);
      gradient.addColorStop(0.3, `rgba(255, 255, 255, ${pulseOpacity * 0.3})`);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.beginPath();
      ctx.fillStyle = gradient;
      ctx.arc(star.x, star.y, star.glowSize * 2, 0, Math.PI * 2);
      ctx.fill();

      // Draw star center
      ctx.beginPath();
      ctx.fillStyle = star.color;
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();

      // Optional: Add cross light effect for extra brightness
      ctx.strokeStyle = `rgba(255, 255, 255, ${pulseOpacity * 0.5})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(star.x - star.glowSize, star.y);
      ctx.lineTo(star.x + star.glowSize, star.y);
      ctx.moveTo(star.x, star.y - star.glowSize);
      ctx.lineTo(star.x, star.y + star.glowSize);
      ctx.stroke();
    };

    const drawStars = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Draw regular stars by layer (creates depth effect)
      [0, 1, 2].forEach(layer => {
        starsRef.current
          .filter(star => star.layer === layer)
          .forEach(star => {
            drawStar(star.x, star.y, star.size, star.opacity);
            
            // Move star based on layer (parallax effect)
            star.y += star.speed * (layer + 1);

            if (star.y > height) {
              star.y = 0;
              star.x = Math.random() * width;
            }
          });
      });

      // Draw bright stars
      brightStarsRef.current.forEach(star => {
        drawBrightStar(star);
        
        star.y += star.speed;
        if (star.y > height) {
          star.y = 0;
          star.x = Math.random() * width;
          star.pulse = 0;  // Reset pulse for smooth transition
        }
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