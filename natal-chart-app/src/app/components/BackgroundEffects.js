'use client'
import React, { useEffect, useState } from 'react';
import { Particles } from '@tsparticles/react';
import { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

const BackgroundEffects = () => {
  const [init, setInit] = useState(false);

  // Initialization effect
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
      setInit(true);
    });
  }, []);

  // Particle configuration for a cosmic/starry background
  const particlesConfig = {
    fullScreen: {
      enable: true,
      zIndex: -1
    },
    background: {
      color: {
        value: "#000022" // Deep dark blue background
      }
    },
    fpsLimit: 120,
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: "repulse"
        },
        onClick: {
          enable: true,
          mode: "push"
        },
        resize: {
          enable: true,
          delay: 0.5
        }
      },
      modes: {
        push: {
          quantity: 4
        },
        repulse: {
          distance: 100,
          duration: 0.4
        }
      }
    },
    particles: {
      color: {
        value: "#ffffff" // White stars
      },
      move: {
        direction: "none",
        enable: true,
        outModes: {
          default: "out"
        },
        random: true,
        speed: 1,
        straight: false
      },
      number: {
        density: {
          enable: true,
          area: 800
        },
        value: 300 // Increased number of particles
      },
      opacity: {
        value: 0.5,
        random: {
          enable: true,
          minimumValue: 0.1
        },
        animation: {
          enable: true,
          speed: 1,
          minimumValue: 0.1,
          sync: false
        }
      },
      shape: {
        type: "circle"
      },
      size: {
        value: { min: 1, max: 3 },
        random: {
          enable: true,
          minimumValue: 0.5
        },
        animation: {
          enable: true,
          speed: 10,
          minimumValue: 0.5,
          sync: false
        }
      },
      links: {
        enable: true,
        distance: 150,
        color: "#ffffff",
        opacity: 0.1,
        width: 1
      }
    },
    detectRetina: true,
    themes: [
      {
        name: 'light',
        default: {
          value: true,
          mode: 'light'
        },
        options: {
          background: {
            color: "#ffffff"
          },
          particles: {
            color: {
              value: "#000000"
            }
          }
        }
      }
    ]
  };

  if (!init) {
    return null;
  }

  return (
    <Particles
      id="tsparticles"
      options={particlesConfig}
    />
  );
};

export default BackgroundEffects;