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

  // Particle configuration for Technolabe: Celestial Technology
  const particlesConfig = {
    fullScreen: {
      enable: true,
      zIndex: -1
    },
    background: {
      color: {
        value: "#0a0a2a" // Deep cosmic dark blue
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
          mode: "connect"
        },
        resize: {
          enable: true,
          delay: 0.5
        }
      },
      modes: {
        connect: {
          radius: 150,
          links: {
            opacity: 0.1
          }
        },
        repulse: {
          distance: 200,
          duration: 0.4,
          speed: 0.1
        }
      }
    },
    particles: {
      color: {
        value: [
          "#00ffff",      // Bright Cyan
          "#4169e1",      // Royal Blue
          "#8a2be2",      // Blue Violet
          "#ff1493"       // Deep Pink (for tech/circuit accent)
        ]
      },
      move: {
        direction: "none",
        enable: true,
        outModes: {
          default: "out"
        },
        random: true,
        speed: {
          min: 0.1,
          max: 1
        },
        straight: false,
        drift: {
          min: -0.5,
          max: 0.5
        }
      },
      number: {
        density: {
          enable: true,
          area: 800
        },
        value: 500 // High particle count for dense, technological feel
      },
      opacity: {
        value: { min: 0.1, max: 0.7 },
        animation: {
          enable: true,
          speed: 0.1,
          minimumValue: 0.1,
          sync: false
        }
      },
      shape: {
        type: ["circle", "triangle", "polygon"],
        options: {
          polygon: {
            sides: 5 // Pentagonal shapes for a tech/circuit feel
          }
        }
      },
      size: {
        value: { min: 1, max: 4 },
        animation: {
          enable: true,
          speed: 0.1,
          minimumValue: 0.5,
          sync: false
        }
      },
      links: {
        enable: true,
        distance: 150,
        color: {
          value: "#00ffff" // Cyan connecting lines
        },
        opacity: 0.3,
        width: 1,
        triangles: {
          enable: true,
          color: "#4169e1",
          opacity: 0.1
        }
      },
      rotate: {
        value: { min: 0, max: 360 },
        direction: "random",
        animation: {
          enable: true,
          speed: 0.1,
          sync: false
        }
      },
      twinkle: {
        lines: {
          enable: true,
          color: "#8a2be2",
          opacity: 0.5
        },
        particles: {
          enable: true,
          color: "#00ffff",
          opacity: 0.1,
          animation: {
            enable: true,
            speed: 0.1,
            sync: false
          }
        }
      },
      wobble: {
        enable: true,
        distance: 10,
        speed: 1
      }
    },
    detectRetina: true,
    responsive: [
      {
        maxWidth: 500,
        options: {
          particles: {
            number: {
              value: 250
            }
          }
        }
      }
    ],
    // Add some themes for additional visual interest
    themes: [
      {
        name: "light-circuit",
        default: {
          value: true,
          mode: "light"
        },
        options: {
          particles: {
            color: {
              value: "#4169e1"
            },
            links: {
              color: "#00ffff",
              opacity: 0.1
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