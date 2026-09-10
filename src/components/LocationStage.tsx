import React, { useEffect, useRef, useState } from 'react';
import type { LocationTier } from '../config/tiers';
import { calculateDots, getDotComposition } from '../lib/logic';

interface LocationStageProps {
  tier: LocationTier;
  currentVal: number;
  targetVal: number;
  onAreaChange?: (area: { width: number; height: number }) => void;
}

export const LocationStage: React.FC<LocationStageProps> = ({ 
  tier, 
  currentVal, 
  targetVal, 
  onAreaChange 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [computedHeight, setComputedHeight] = useState<number>(600);

  // Compute dynamic height required to hold all dots without crowding or clipping
  useEffect(() => {
    const updateDimensions = () => {
      const container = containerRef.current;
      const width = container?.clientWidth || window.innerWidth;
      const composition = getDotComposition(currentVal, targetVal);
      const totalDots = composition.totalDots;

      // Cell size adapts based on screen width
      const minCellSize = width < 640 ? 4.8 : (width < 1024 ? 6.0 : 7.2);
      const availableWidth = Math.max(100, width - 24);
      const cols = Math.max(1, Math.floor(availableWidth / minCellSize));
      const rowsNeeded = Math.ceil(totalDots / cols);

      // 60px padding, min height fills remaining screen viewport below header
      const neededContentHeight = rowsNeeded * minCellSize + 60;
      const minViewportH = Math.max(450, window.innerHeight - 240);
      const targetHeight = Math.max(minViewportH, neededContentHeight);

      setComputedHeight(targetHeight);
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [currentVal, targetVal]);

  // Draw dots on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = computedHeight;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const fillableArea = {
      x: 12,
      y: 16,
      width: Math.max(50, width - 24),
      height: Math.max(50, height - 32)
    };

    if (onAreaChange) {
      setTimeout(() => onAreaChange({ width: fillableArea.width, height: fillableArea.height }), 0);
    }

    const { dots } = calculateDots(
      currentVal,
      targetVal,
      width,
      height,
      fillableArea
    );

    // 1. Batched Draw: Unfilled target dots in Crisp White
    ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
    ctx.beginPath();
    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i];
      if (!dot.isFilled) {
        ctx.moveTo(dot.x + dot.radius, dot.y);
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
      }
    }
    ctx.fill();

    // 2. Batched Draw: Filled dots in Vibrant Electric Cyan
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i];
      if (dot.isFilled) {
        ctx.moveTo(dot.x + dot.radius, dot.y);
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
      }
    }
    ctx.fill();

    ctx.restore();
  }, [tier, currentVal, targetVal, computedHeight, onAreaChange]);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full bg-black overflow-visible transition-[height] duration-200"
      style={{ height: `${computedHeight}px` }}
    >
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 pointer-events-none block"
      />
    </div>
  );
};
