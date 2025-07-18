import React, { useRef, useEffect } from 'react';

interface BaseCanvasProps {
  draw: (ctx: CanvasRenderingContext2D, frameCount: number) => void;
  width?: number;
  height?: number;
  className?: string;
}

const BaseCanvas: React.FC<BaseCanvasProps> = ({ draw, width = window.innerWidth, height = window.innerHeight, className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>(0);
  let frameCount = 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const render = () => {
      frameCount++;
      draw(context, frameCount);
      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId.current);
    };
  }, [draw, width, height]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (context) {
        // Redraw immediately after resize to avoid blank canvas
        draw(context, frameCount);
      }
    }
  }, [width, height, draw]); // Add draw to dependencies for completeness

  return <canvas ref={canvasRef} className={className} />;
};

export default BaseCanvas;