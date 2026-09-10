import React from 'react';
import type { VisualizationState, DotComposition } from '../lib/logic';
import { StageBreadcrumb } from './StageBreadcrumb';
import { DotColorLegend } from './DotColorLegend';

interface NavbarProps {
  targetInput: string;
  setTargetInput: (val: string) => void;
  totalTarget: number;
  populationInput: string;
  setPopulationInput: (val: string) => void;
  totalPopulation: number;
  state: VisualizationState;
  composition: DotComposition;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  targetInput,
  setTargetInput,
  totalTarget,
  populationInput, 
  setPopulationInput, 
  totalPopulation, 
  state,
  composition
}) => {
  return (
    <div className="w-full flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 sm:gap-3">
      {/* Left: Inputs & Legend Section */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Controls Container */}
        <div className="bg-neutral-950 p-1.5 sm:p-2 rounded-2xl shadow-xl backdrop-blur-md flex flex-wrap items-center gap-2 border border-neutral-800/90">
          
          {/* Target Input */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-neutral-900 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl border border-neutral-800 focus-within:border-white/60 transition-colors">
            <span className="w-2 h-2 rounded-full bg-white/90 shadow-[0_0_6px_rgba(255,255,255,0.7)]" />
            <label htmlFor="target-input" className="text-neutral-300 text-[11px] sm:text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
              Target:
            </label>
            <input
              id="target-input"
              type="text"
              className="bg-transparent text-white text-sm sm:text-base font-bold w-20 sm:w-24 outline-none font-mono placeholder:text-neutral-600"
              value={targetInput}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9,]/g, '');
                setTargetInput(val);
              }}
              onBlur={() => {
                if (totalTarget > 0) {
                  setTargetInput(new Intl.NumberFormat('en-US').format(totalTarget));
                }
              }}
              placeholder="20,000"
            />
          </div>

          {/* Current (Population) Input - Clamped to Target! */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-neutral-900 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl border border-neutral-800 focus-within:border-cyan-500/80 transition-colors">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(56,189,248,0.8)]" />
            <label htmlFor="population-input" className="text-cyan-300 text-[11px] sm:text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
              Current:
            </label>
            <input
              id="population-input"
              type="text"
              className="bg-transparent text-cyan-400 text-sm sm:text-base font-bold w-20 sm:w-24 outline-none font-mono placeholder:text-neutral-600"
              value={populationInput}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9,]/g, '');
                const num = parseInt(raw.replace(/,/g, ''), 10) || 0;
                // Clamping: If target exists, Current CANNOT exceed Target!
                if (totalTarget > 0 && num > totalTarget) {
                  setPopulationInput(new Intl.NumberFormat('en-US').format(totalTarget));
                } else {
                  setPopulationInput(raw);
                }
              }}
              onBlur={() => {
                if (totalPopulation > 0) {
                  setPopulationInput(new Intl.NumberFormat('en-US').format(totalPopulation));
                } else {
                  setPopulationInput('0');
                }
              }}
              placeholder="2,000"
            />
          </div>

        </div>

        {/* Legend */}
        {!state.isBeyondWorld && (
          <DotColorLegend composition={composition} />
        )}
      </div>

      {/* Right: Breadcrumbs Section */}
      <div className="w-full lg:w-auto overflow-hidden">
        {!state.isBeyondWorld && (
          <StageBreadcrumb 
            completedTiers={state.completedTiers} 
            activeTier={state.activeTier} 
            upcomingTiers={state.upcomingTiers} 
          />
        )}
      </div>
    </div>
  );
};
