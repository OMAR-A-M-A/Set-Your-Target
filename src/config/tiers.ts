export interface LocationTier {
  name: string;
  label: string;
  capacity: number;
  isEstimate: boolean;
  backgroundImage: string;
}

export const LOCATION_TIERS: LocationTier[] = [
  {
    name: "Stadium",
    label: "Cairo Stadium",
    capacity: 75000,
    isEstimate: false,
    backgroundImage: "bg-black",
  },
  {
    name: "Square",
    label: "Tahrir Square",
    capacity: 250000,
    isEstimate: true,
    backgroundImage: "bg-black",
  },
  {
    name: "District",
    label: "Nasr City",
    capacity: 650000,
    isEstimate: true,
    backgroundImage: "bg-black",
  },
  {
    name: "City",
    label: "Greater Cairo",
    capacity: 23000000,
    isEstimate: false,
    backgroundImage: "bg-black",
  },
  {
    name: "Country",
    label: "Egypt",
    capacity: 120101175,
    isEstimate: false,
    backgroundImage: "bg-black",
  },
  {
    name: "Continent",
    label: "Africa",
    capacity: 1585000000,
    isEstimate: false,
    backgroundImage: "bg-black",
  },
  {
    name: "World",
    label: "Earth",
    capacity: 8200000000,
    isEstimate: true,
    backgroundImage: "bg-black",
  }
];

export const BASE = 10;

export interface DotTier {
  level: number;
  color: string;
  radius: number;
  label: string;
}

export const DOT_TIERS: DotTier[] = [
  { level: 0, color: '#E8E8E8', radius: 3, label: '1 person' },
  { level: 1, color: '#4A90D9', radius: 4.5, label: '10 people' },
  { level: 2, color: '#9B59B6', radius: 6, label: '100 people' },
  { level: 3, color: '#F1C40F', radius: 7.5, label: '1,000 people' },
];

export function getDotTierDef(level: number): DotTier {
  if (level < DOT_TIERS.length) {
    return DOT_TIERS[level];
  }
  const extraColors = ['#E74C3C', '#2ECC71', '#E67E22', '#1ABC9C', '#34495E'];
  const extraColor = extraColors[(level - DOT_TIERS.length) % extraColors.length];
  
  const val = Math.pow(BASE, level);
  const formatter = new Intl.NumberFormat('en-US');
  
  return {
    level,
    color: extraColor,
    radius: Math.min(10, 7.5 + (level - 3) * 1),
    label: `${formatter.format(val)} people`
  };
}

export function formatCompactNumber(num: number): string {
  if (!num || num <= 0) return '0';
  if (num >= 1_000_000_000) {
    const val = num / 1_000_000_000;
    return `${val % 1 === 0 ? val.toFixed(0) : val.toFixed(2).replace(/\.?0+$/, '')}B`;
  }
  if (num >= 1_000_000) {
    const val = num / 1_000_000;
    return `${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1).replace(/\.?0+$/, '')}M`;
  }
  if (num >= 1_000) {
    const val = num / 1_000;
    return `${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1).replace(/\.?0+$/, '')}K`;
  }
  return num.toLocaleString('en-US');
}
