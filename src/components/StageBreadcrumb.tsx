import React from 'react';
import { type LocationTier, formatCompactNumber } from '../config/tiers';

interface StageBreadcrumbProps {
  completedTiers: LocationTier[];
  activeTier: LocationTier;
  upcomingTiers: LocationTier[];
}

export const StageBreadcrumb: React.FC<StageBreadcrumbProps> = ({ 
  completedTiers, 
  activeTier, 
  upcomingTiers 
}) => {
  return (
    <div className="w-full max-w-full overflow-x-auto scrollbar-none py-1 px-1">
      <div className="inline-flex items-center gap-1.5 sm:gap-2 text-xs font-medium text-neutral-400 bg-neutral-950/90 py-1.5 px-3 rounded-full backdrop-blur-md border border-neutral-800/80 shadow-lg whitespace-nowrap">
        {/* Completed Stages */}
        {completedTiers.map((t) => (
          <React.Fragment key={t.name}>
            <span className="flex-shrink-0 opacity-50 line-through decoration-neutral-600 hover:opacity-80 transition-opacity flex items-center gap-1">
              ✓ {t.name} <span className="text-[10px] font-mono opacity-70">({formatCompactNumber(t.capacity)})</span>
            </span>
            <span className="flex-shrink-0 opacity-30 text-[10px]">›</span>
          </React.Fragment>
        ))}

        {/* Active Stage */}
        <span className="flex-shrink-0 font-semibold text-cyan-300 bg-cyan-950/60 px-2.5 py-1 rounded-full border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)] flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          {activeTier.name}
          <span className="text-[10px] font-mono text-cyan-200/90">({formatCompactNumber(activeTier.capacity)})</span>
        </span>

        {/* Upcoming Stages */}
        {upcomingTiers.map((t) => (
          <React.Fragment key={t.name}>
            <span className="flex-shrink-0 opacity-30 text-[10px]">›</span>
            <span className="flex-shrink-0 opacity-55 hover:opacity-90 transition-opacity flex items-center gap-1">
              {t.name} <span className="text-[10px] font-mono opacity-60">({formatCompactNumber(t.capacity)})</span>
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
