import React, { useState, useMemo, useEffect } from 'react';
import { calculateVisualizationState, getDotComposition } from '../lib/logic';
import { LocationStage } from './LocationStage';
import { StageProgressBar } from './StageProgressBar';
import { Navbar } from './Navbar';
import { AnimatePresence, motion } from 'framer-motion';

const STORAGE_KEY_TARGET = 'visualizer_target_population';
const STORAGE_KEY_CURRENT = 'visualizer_current_population';

export const PopulationVisualizer: React.FC = () => {
  const [targetInput, setTargetInput] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_TARGET) || '20,000';
  });

  const [populationInput, setPopulationInput] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_CURRENT) || '2,000';
  });

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TARGET, targetInput);
  }, [targetInput]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CURRENT, populationInput);
  }, [populationInput]);
  
  const totalTarget = parseInt(targetInput.replace(/,/g, ''), 10) || 0;
  const rawPopulation = parseInt(populationInput.replace(/,/g, ''), 10) || 0;

  // Enforce Current <= Target rule
  const totalPopulation = (totalTarget > 0 && rawPopulation > totalTarget) 
    ? totalTarget 
    : rawPopulation;

  const handleTargetChange = (val: string) => {
    setTargetInput(val);
    const newTarget = parseInt(val.replace(/,/g, ''), 10) || 0;
    const currentPop = parseInt(populationInput.replace(/,/g, ''), 10) || 0;
    if (newTarget > 0 && currentPop > newTarget) {
      setPopulationInput(new Intl.NumberFormat('en-US').format(newTarget));
    }
  };

  const handlePopulationChange = (val: string) => {
    const raw = val.replace(/[^0-9,]/g, '');
    const num = parseInt(raw.replace(/,/g, ''), 10) || 0;
    if (totalTarget > 0 && num > totalTarget) {
      setPopulationInput(new Intl.NumberFormat('en-US').format(totalTarget));
    } else {
      setPopulationInput(raw);
    }
  };

  // Use the active number (target or current) to determine stage
  const effectiveStagePop = totalPopulation > 0 ? totalPopulation : totalTarget;
  const state = useMemo(() => calculateVisualizationState(effectiveStagePop), [effectiveStagePop]);
  
  const composition = useMemo(
    () => getDotComposition(totalPopulation, totalTarget), 
    [totalPopulation, totalTarget]
  );

  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col font-sans select-none overflow-x-hidden">
      
      {/* Sticky Header: Controls, Legend, Breadcrumbs, and Dual Progress Bars */}
      <header className="sticky top-0 z-40 w-full bg-black/95 backdrop-blur-lg border-b border-neutral-850/80 shadow-2xl p-2.5 sm:p-4 flex flex-col gap-2.5">
        <Navbar 
          targetInput={targetInput}
          setTargetInput={handleTargetChange}
          totalTarget={totalTarget}
          populationInput={populationInput} 
          setPopulationInput={handlePopulationChange} 
          totalPopulation={totalPopulation} 
          state={state} 
          composition={composition}
        />

        {!state.isBeyondWorld && (
          <StageProgressBar 
            tier={state.activeTier} 
            populationInTier={state.populationInActiveTier}
            current={totalPopulation}
            target={totalTarget}
          />
        )}
      </header>

      {/* Main Content Area: Stage Canvas with Vertical Scroll capability */}
      <main className="flex-1 w-full relative bg-black">
        <AnimatePresence mode="wait">
          <motion.div
            key={state.activeTier.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full"
          >
            {state.isBeyondWorld ? (
              <div className="min-h-[70vh] flex items-center justify-center bg-black flex-col text-white px-4 text-center">
                <h1 className="text-4xl sm:text-6xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-500">
                  Beyond Earth
                </h1>
                <p className="text-lg sm:text-2xl text-neutral-400">
                  That's <span className="font-bold text-cyan-300">
                    {new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(state.beyondWorldMultiplier)}x
                  </span> the population of planet Earth.
                </p>
              </div>
            ) : (
              <LocationStage 
                tier={state.activeTier} 
                currentVal={totalPopulation}
                targetVal={totalTarget}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

    </div>
  );
};
