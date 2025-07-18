import React from 'react';
import BaseCanvas from './BaseCanvas';

interface CirclePatternCanvasProps {
  width?: number;
  height?: number;
  className?: string;
}

const CirclePatternCanvas: React.FC<CirclePatternCanvasProps> = ({ width, height, className }) => {
  const draw = (ctx: CanvasRenderingContext2D, frameCount: number) => {
    const canvas = ctx.canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas for new frame

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(canvas.width, canvas.height) * 0.4;
    const numCircles = 50;
    const speed = 0.005;

    for (let i = 0; i < numCircles; i++) {
      const angle = (i / numCircles) * Math.PI * 2 + frameCount * speed;
      const radius = maxRadius * (1 - (i / numCircles) * 0.8); // Smaller circles towards center
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      const circleRadius = 5 + Math.sin(frameCount * 0.1 + i * 0.2) * 3;
      const alpha = 0.1 + (0.9 * (i / numCircles)); // Fade out from center

      ctx.beginPath();
      ctx.arc(x, y, circleRadius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(100, 150, 255, ${alpha})`; // Blueish color
      ctx.fill();
      ctx.closePath();
    }
  };

  return (
    <BaseCanvas draw={draw} width={width} height={height} className={className} />
  );
};

export default CirclePatternCanvas;