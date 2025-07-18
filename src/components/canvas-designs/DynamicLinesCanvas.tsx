import React, { useState, useEffect } from 'react';
import BaseCanvas from './BaseCanvas';

interface DynamicLinesCanvasProps {
  width?: number;
  height?: number;
  className?: string;
}

const DynamicLinesCanvas: React.FC<DynamicLinesCanvasProps> = ({ width, height, className }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePos({ x: event.clientX, y: event.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const draw = (ctx: CanvasRenderingContext2D, frameCount: number) => {
    const canvas = ctx.canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const numLines = 30;
    const lineLength = 150;
    const oscillationSpeed = 0.02;
    const mouseInfluence = 0.1;

    for (let i = 0; i < numLines; i++) {
      const startX = (i / numLines) * canvas.width;
      const oscillationOffset = Math.sin(frameCount * oscillationSpeed + i * 0.5) * 50;

      // Influence by mouse position
      const influencedY = mousePos.y * mouseInfluence + (1 - mouseInfluence) * (canvas.height / 2 + oscillationOffset);
      const startY = influencedY + (i % 2 === 0 ? 0 : 50); // Offset for alternating lines

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(startX, startY + lineLength);
      ctx.strokeStyle = `rgba(255, 200, 0, ${0.1 + Math.abs(Math.sin(frameCount * 0.05 + i * 0.1)) * 0.4})`; // Yellowish glow
      ctx.lineWidth = 2 + Math.abs(Math.sin(frameCount * 0.03 + i * 0.1)) * 3; // Pulsing width
      ctx.stroke();
      ctx.closePath();
    }
  };

  return (
    <BaseCanvas draw={draw} width={width} height={height} className={className} />
  );
};

export default DynamicLinesCanvas;