import React from 'react';
import type { DotComposition } from '../lib/logic';

interface DotColorLegendProps {
  composition: DotComposition;
}

export const DotColorLegend: React.FC<DotColorLegendProps> = ({ composition }) => {
  const formatter = new Intl.NumberFormat('en-US');

  return (
    <div className="flex flex-wrap items-center gap-3 bg-neutral-950/80 px-3.5 py-1.5 rounded-xl border border-neutral-800/80 backdrop-blur-md shadow-lg text-xs">
      <span className="text-neutral-500 font-bold uppercase tracking-wider text-[10px] hidden sm:inline">
        Legend
      </span>

      {/* Filled dots (Current) */}
      <div className="flex items-center gap-1.5" title="Filled with Current value">
        <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.7)] ring-1 ring-cyan-300" />
        <span className="text-neutral-200 font-medium">
          Current <span className="text-cyan-400 text-[11px]">({formatter.format(composition.filledDots)})</span>
        </span>
      </div>

      {/* Target dots (Unfilled) */}
      <div className="flex items-center gap-1.5" title="Remaining Target dots">
        <div className="w-2.5 h-2.5 rounded-full bg-white/90 shadow-[0_0_6px_rgba(255,255,255,0.6)] ring-1 ring-white/50" />
        <span className="text-neutral-300 font-medium">
          Target <span className="text-neutral-400 text-[11px]">({formatter.format(composition.unfilledDots)})</span>
        </span>
      </div>

      {/* Scale Badge */}
      <div className="bg-neutral-900 px-2 py-0.5 rounded-md border border-neutral-800 text-[11px] text-neutral-400 font-mono">
        1 dot = {composition.label}
      </div>
    </div>
  );
};
