import { LOCATION_TIERS, type LocationTier, BASE, getDotTierDef } from '../config/tiers';

export interface VisualizationState {
  activeTierIndex: number;
  activeTier: LocationTier;
  populationInActiveTier: number;
  fillRatio: number;
  isBeyondWorld: boolean;
  beyondWorldMultiplier: number;
  completedTiers: LocationTier[];
  upcomingTiers: LocationTier[];
}

export function calculateVisualizationState(totalPopulation: number): VisualizationState {
  let remainingPopulation = totalPopulation;
  let activeTierIndex = 0;

  for (let i = 0; i < LOCATION_TIERS.length; i++) {
    const tier = LOCATION_TIERS[i];
    const capacity = tier.capacity > 0 ? tier.capacity : 0.0001;

    if (remainingPopulation <= capacity || i === LOCATION_TIERS.length - 1) {
      activeTierIndex = i;
      break;
    } else {
      remainingPopulation -= capacity;
    }
  }

  const activeTier = LOCATION_TIERS[activeTierIndex];
  const capacity = activeTier.capacity > 0 ? activeTier.capacity : 0.0001;
  const fillRatio = Math.min(1, Math.max(0, remainingPopulation / capacity));

  const isBeyondWorld = activeTierIndex === LOCATION_TIERS.length - 1 && remainingPopulation > capacity;
  const beyondWorldMultiplier = isBeyondWorld ? totalPopulation / LOCATION_TIERS[LOCATION_TIERS.length - 1].capacity : 0;

  const completedTiers = LOCATION_TIERS.slice(0, activeTierIndex);
  const upcomingTiers = LOCATION_TIERS.slice(activeTierIndex + 1);

  return {
    activeTierIndex,
    activeTier,
    populationInActiveTier: isBeyondWorld ? capacity : remainingPopulation,
    fillRatio: isBeyondWorld ? 1 : fillRatio,
    isBeyondWorld,
    beyondWorldMultiplier,
    completedTiers,
    upcomingTiers
  };
}

export const INDIVIDUAL_DOT_LIMIT = 20000;

export interface DotComposition {
  tierLevel: number;
  unitValue: number;
  totalDots: number;
  filledDots: number;
  unfilledDots: number;
  label: string;
}

export function getDotComposition(
  currentVal: number,
  targetVal: number
): DotComposition {
  if (targetVal <= 0 && currentVal <= 0) {
    return {
      tierLevel: 0,
      unitValue: 1,
      totalDots: 0,
      filledDots: 0,
      unfilledDots: 0,
      label: '1 person'
    };
  }

  // If target is 0 or less, fallback to currentVal as target
  const effectiveTarget = targetVal > 0 ? targetVal : currentVal;

  let tierLevel = 0;
  let unitValue = 1;

  // If effectiveTarget <= INDIVIDUAL_DOT_LIMIT (20,000), 1 dot = 1 person
  if (effectiveTarget > INDIVIDUAL_DOT_LIMIT) {
    while (Math.ceil(effectiveTarget / unitValue) > INDIVIDUAL_DOT_LIMIT) {
      tierLevel++;
      unitValue = Math.pow(BASE, tierLevel);
    }
  }

  const totalDots = Math.min(INDIVIDUAL_DOT_LIMIT, Math.ceil(effectiveTarget / unitValue));
  const rawFilled = Math.floor(currentVal / unitValue);
  const filledDots = Math.max(0, Math.min(totalDots, rawFilled));
  const unfilledDots = Math.max(0, totalDots - filledDots);

  const def = getDotTierDef(tierLevel);

  return {
    tierLevel,
    unitValue,
    totalDots,
    filledDots,
    unfilledDots,
    label: def.label
  };
}

export interface Dot {
  x: number;
  y: number;
  radius: number;
  isFilled: boolean;
}

function pseudoRandom(x: number, y: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453123;
  return n - Math.floor(n);
}

export function calculateDots(
  currentVal: number,
  targetVal: number,
  canvasWidth: number,
  canvasHeight: number,
  fillableArea?: { x: number; y: number; width: number; height: number }
): { dots: Dot[]; composition: DotComposition; dotRadius: number } {
  const area = fillableArea || { x: 0, y: 0, width: canvasWidth, height: canvasHeight };
  const composition = getDotComposition(currentVal, targetVal);

  const totalDots = composition.totalDots;
  const filledDotsCount = composition.filledDots;

  if (totalDots <= 0 || area.width <= 0 || area.height <= 0) {
    return { dots: [], composition, dotRadius: 3 };
  }

  // Calculate cell size dynamically to fit up to INDIVIDUAL_DOT_LIMIT (20,000) dots cleanly
  const maxCellsNeeded = Math.max(totalDots, 100);
  const areaPerDot = (area.width * area.height) / maxCellsNeeded;
  const theoreticalCell = Math.sqrt(areaPerDot);
  
  // Clamp CELL_SIZE between 4px and 16px to fit up to 20,000 dots
  const CELL_SIZE = Math.max(4.0, Math.min(16, Math.floor(theoreticalCell * 0.88)));
  const dotRadius = Math.max(1.3, Math.min(4, CELL_SIZE * 0.28));

  const cols = Math.max(1, Math.floor(area.width / CELL_SIZE));
  const rows = Math.max(1, Math.floor(area.height / CELL_SIZE));

  // Fill priority: bottom to top
  const cells: { r: number; c: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({ r, c });
    }
  }
  cells.sort((a, b) => b.r - a.r);

  const dots: Dot[] = [];
  const count = Math.min(totalDots, cells.length);

  for (let i = 0; i < count; i++) {
    const cell = cells[i];
    
    // Deterministic organic jitter so dots don't jump on input change
    const jitterMax = CELL_SIZE * 0.38;
    const jX = (pseudoRandom(cell.c, cell.r) - 0.5) * jitterMax;
    const jY = (pseudoRandom(cell.r, cell.c) - 0.5) * jitterMax;

    const x = area.x + cell.c * CELL_SIZE + CELL_SIZE / 2 + jX;
    const y = area.y + cell.r * CELL_SIZE + CELL_SIZE / 2 + jY;

    // First filledDotsCount dots are filled with cyan/accent, rest are white
    const isFilled = i < filledDotsCount;

    dots.push({
      x,
      y,
      radius: dotRadius,
      isFilled
    });
  }

  return { dots, composition, dotRadius };
}
