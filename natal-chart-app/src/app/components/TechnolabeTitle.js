'use client'
import React, { useEffect, useState } from 'react';

const TechnolabeTitle = () => {
  // Track if component is mounted (for SSR compatibility)
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    
    // Optional: Add custom animation initialization logic here
  }, []);

  if (!mounted) return null;

  return (
    <div className="top-24 left-2 absolute z-20 overflow-visible">
      <style jsx>{`
        @keyframes textPulse {
          0% { text-shadow: 0 0 7px #0f03fc, 0 0 10px #0f03fc, 0 0 21px #0f03fc; }
          50% { text-shadow: 0 0 7px #00ffff, 0 0 10px #00ffff, 0 0 21px #00ffff; }
          100% { text-shadow: 0 0 7px #6f03fc, 0 0 10px #6f03fc, 0 0 21px #6f03fc; }
        }
        
        @keyframes flicker {
          0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100% {
            opacity: 0.6;
            text-shadow: none;
          }
          20%, 21.999%, 63%, 63.999%, 65%, 69.999% {
            opacity: 0.8;
            text-shadow: 0 0 10px #00ffff, 0 0 20px #00ffff;
          }
        }
        
        @keyframes borderPulse {
          0% { 
            box-shadow: 
              0 0 5px #00ffff,
              0 0 10px #00ffff,
              inset 0 0 5px #00ffff;
          }
          50% { 
            box-shadow: 
              0 0 7px #6f03fc,
              0 0 15px #6f03fc,
              inset 0 0 10px #6f03fc;
          }
          100% { 
            box-shadow: 
              0 0 5px #00ffff,
              0 0 10px #00ffff,
              inset 0 0 5px #00ffff;
          }
        }
        
        .title-container {
          position: relative;
          padding: 20px 40px;
          text-align: center;
          transform: translateX(-10%);
          width: 120%;
        }
        
        .main-title {
          font-family: "Impact", "Haettenschweiler", "Arial Black", sans-serif;
          font-size: 6vw;
          font-weight: 1000;
          letter-spacing: 0.1em;
          line-height: 1;
          text-transform: uppercase;
          color: transparent;
          position: relative;
          animation: textPulse 4s infinite alternate;
          transform: scaleY(2.6); /* Slightly stretch vertically */
          filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.3));
          -webkit-text-stroke: 1px rgba(255, 255, 255, 0.5)
        }
        
        .main-title::before {
          content: "TECHNOLABE";
          position: absolute;
          z-index: -2;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to bottom, #ff00ff, #00ffff);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }
        
        .main-title::after {
          content: "TECHNOLABE";
          position: absolute;
          z-index: -1;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          color: #00ffff;
          background-clip: text;
          -webkit-background-clip: text;
          opacity: 0.7;
          animation: flicker 3s infinite alternate-reverse;
        }
        
        .outline {
          position: absolute;

          border: 2px solid cyan;
          border-radius: 5px;
          animation: borderPulse 3s infinite alternate;
        }
        
        .subtitle {
          font-family: "Courier New", monospace;
          color: #fff;
          font-size: 1.5vw;
          font-weight: bold;
          letter-spacing: 0.2em;
          margin-top: 10px;
          text-shadow: 0 0 5px #00ffff;
          opacity: 0.8;
        }
        
        @media (max-width: 768px) {
          .main-title {
            font-size: 8vw;
          }
          .subtitle {
            font-size: 2vw;
          }
        }
      `}</style>
      
      <div className="title-container">
        {/* <div className="outline"></div> */}
        <h1 className="main-title">TECHNOLABE</h1>
        <div className="subtitle">CELESTIAL TECHNOLOGY</div>
      </div>
    </div>
  );
};

export default TechnolabeTitle;