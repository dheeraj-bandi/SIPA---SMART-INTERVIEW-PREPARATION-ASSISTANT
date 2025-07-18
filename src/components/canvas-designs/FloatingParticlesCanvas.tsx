import React, { useRef, useEffect, useState, useCallback } from 'react';

// Define a Particle interface for better type safety
interface Particle {
  x: number;
  y: number;
  radius: number;
  color: string;
  speedX: number;
  speedY: number;
  alpha: number;
}

interface FloatingParticlesCanvasProps {
  className?: string;
  numParticles?: number;
  particleColor?: string;
  maxParticleSize?: number;
  minParticleSize?: number;
  particleSpeedFactor?: number;
  connectionDistance?: number; // Max distance for lines between particles
  connectionColor?: string;
}

const FloatingParticlesCanvas: React.FC<FloatingParticlesCanvasProps> = ({
  className,
  numParticles = 100,
  particleColor = '#C0C0C0', // Silver/light gray
  maxParticleSize = 3,
  minParticleSize = 0.5,
  particleSpeedFactor = 0.5,
  connectionDistance = 120, // Particles within this distance will be connected
  connectionColor = 'rgba(200, 200, 200, 0.1)'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const [canvasWidth, setCanvasWidth] = useState(window.innerWidth);
  const [canvasHeight, setCanvasHeight] = useState(window.innerHeight);

  // Function to create initial particles
  const createParticles = useCallback((width: number, height: number): Particle[] => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < numParticles; i++) {
      newParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * (maxParticleSize - minParticleSize) + minParticleSize,
        color: particleColor,
        speedX: (Math.random() - 0.5) * particleSpeedFactor,
        speedY: (Math.random() - 0.5) * particleSpeedFactor,
        alpha: Math.random() * 0.7 + 0.3, // Vary initial alpha for subtle twinkling
      });
    }
    return newParticles;
  }, [numParticles, particleColor, maxParticleSize, minParticleSize, particleSpeedFactor]);

  // Handle canvas resizing
  useEffect(() => {
    const handleResize = () => {
      setCanvasWidth(window.innerWidth);
      setCanvasHeight(window.innerHeight);
      // Re-initialize particles on resize to prevent them going out of bounds
      // or becoming too sparse/dense.
      particlesRef.current = createParticles(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [createParticles]);

  // Main drawing logic
  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    const canvas = ctx.canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

    // Update and draw particles
    particlesRef.current.forEach(p => {
      // Move particle
      p.x += p.speedX;
      p.y += p.speedY;

      // Wrap around canvas edges
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${parseInt(p.color.slice(1, 3), 16)}, ${parseInt(p.color.slice(3, 5), 16)}, ${parseInt(p.color.slice(5, 7), 16)}, ${p.alpha})`;
      ctx.fill();
    });

    // Draw lines between nearby particles
    for (let i = 0; i < particlesRef.current.length; i++) {
      for (let j = i + 1; j < particlesRef.current.length; j++) {
        const p1 = particlesRef.current[i];
        const p2 = particlesRef.current[j];

        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < connectionDistance) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = connectionColor;
          ctx.lineWidth = 0.5; // Thin lines
          ctx.stroke();
        }
      }
    }
  }, [connectionDistance, connectionColor, particleColor]); // Added dependencies to useCallback

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Initialize particles on first mount
    if (particlesRef.current.length === 0) {
      particlesRef.current = createParticles(canvasWidth, canvasHeight);
    }

    const render = () => {
      draw(context);
      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId.current);
    };
  }, [draw, canvasWidth, canvasHeight, createParticles]); // Added createParticles to dependencies

  return (
    <canvas
      ref={canvasRef}
      className={className}
      width={canvasWidth}
      height={canvasHeight}
      style={{ display: 'block' }} // Ensures no default canvas margin/padding issues
    />
  );
};

export default FloatingParticlesCanvas;