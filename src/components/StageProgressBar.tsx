import React from 'react';
import type { LocationTier } from '../config/tiers';

interface StageProgressBarProps {
  tier: LocationTier;
  populationInTier: number;
  current: number;
  target: number;
}

export const StageProgressBar: React.FC<StageProgressBarProps> = ({ 
  tier, 
  populationInTier, 
  current, 
  target 
}) => {
  const formatter = new Intl.NumberFormat('en-US');

  // 1. Target Progress Calculations
  const effectiveTarget = target > 0 ? target : current;
  const targetFillRatio = effectiveTarget > 0 ? Math.min(1, Math.max(0, current / effectiveTarget)) : 0;
  const targetPercentage = (targetFillRatio * 100).toFixed(1);
  const formattedCurrent = formatter.format(Math.floor(current));
  const formattedTarget = formatter.format(Math.floor(effectiveTarget));
  const targetRemaining = Math.max(0, effectiveTarget - current);
  const formattedTargetRemaining = formatter.format(Math.floor(targetRemaining));

  // 2. Stage / Location Progress Calculations
  const stageCapacity = tier.capacity > 0 ? tier.capacity : 0;
  const stageFillRatio = stageCapacity > 0 ? Math.min(1, Math.max(0, populationInTier / stageCapacity)) : 1;
  const stagePercentage = (stageFillRatio * 100).toFixed(1);
  const formattedPopInTier = formatter.format(Math.floor(populationInTier));
  const formattedStageCap = stageCapacity > 0 ? formatter.format(stageCapacity) : '???';
  const stageRemaining = Math.max(0, stageCapacity - populationInTier);
  const formattedStageRemaining = formatter.format(Math.floor(stageRemaining));
  const isEst = tier.isEstimate;

  return (
    <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 transition-all duration-300">
      
      {/* 1. Target Progress Card */}
      <div className="bg-neutral-950/85 backdrop-blur-md px-3.5 py-2 sm:py-2.5 rounded-2xl border border-neutral-800/80 shadow-xl flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
            <span className="text-xs sm:text-sm font-bold tracking-tight text-neutral-200 truncate">
              Target Progress
            </span>
          </div>
          <div className="text-right whitespace-nowrap">
            <span className="text-xs sm:text-sm font-bold font-mono text-cyan-400">{formattedCurrent}</span>
            <span className="text-[11px] text-neutral-500 font-mono ml-1">/ {formattedTarget}</span>
          </div>
        </div>

        {/* Progress Track */}
        <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800 shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 via-cyan-500 to-cyan-300 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(56,189,248,0.5)]"
            style={{ width: `${targetPercentage}%` }}
          />
        </div>

        {/* Info Footer */}
        <div className="flex justify-between items-center text-[11px] mt-1 text-neutral-400">
          <span className="font-semibold text-cyan-400 font-mono">
            {targetPercentage}% Filled
          </span>
          <span className="truncate">
            {targetRemaining > 0 ? `${formattedTargetRemaining} to goal` : 'Goal reached!'}
          </span>
        </div>
      </div>

      {/* 2. Stage / Location Capacity Card */}
      <div className="bg-neutral-950/85 backdrop-blur-md px-3.5 py-2 sm:py-2.5 rounded-2xl border border-neutral-800/80 shadow-xl flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-xs sm:text-sm font-bold tracking-tight text-neutral-200 truncate">
              {tier.label}
            </span>
          </div>
          <div className="text-right whitespace-nowrap">
            <span className="text-xs sm:text-sm font-bold font-mono text-emerald-400">{isEst ? '~' : ''}{formattedPopInTier}</span>
            <span className="text-[11px] text-neutral-500 font-mono ml-1">/ {isEst ? '~' : ''}{formattedStageCap}</span>
          </div>
        </div>

        {/* Progress Track */}
        <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800 shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-teal-600 via-emerald-500 to-emerald-300 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(52,211,153,0.5)]"
            style={{ width: `${stagePercentage}%` }}
          />
        </div>

        {/* Info Footer */}
        <div className="flex justify-between items-center text-[11px] mt-1 text-neutral-400">
          <span className="font-semibold text-emerald-400 font-mono">
            {stagePercentage}% of {tier.name}
          </span>
          <span className="truncate">
            {stageRemaining > 0 ? `~${formattedStageRemaining} to next stage` : 'Stage filled!'}
          </span>
        </div>
      </div>

    </div>
  );
};
