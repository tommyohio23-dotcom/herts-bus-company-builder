import { FEATURES } from './herts';

// Fictional installation and daily maintenance costs, in game pounds.
export const UPGRADE_PRICES = Object.fromEntries(FEATURES.map((name, i) => [name, {
  install: [1200, 1800, 6000, 4500, 900, 7500, 2400, 800, 400, 1100, 1800, 2000, 9000, 5000, 600, 14000, 45000, 25000, 8000, 10000][i] ?? 1000,
  daily: [2, 3, 5, 4, 4, 8, 3, 1, 1, 2, 3, 2, 7, 4, 1, 6, 12, 9, 4, 5][i] ?? 1,
}])) as Record<string, { install: number; daily: number }>;
export function upgradeCost(features: string[], installed: string[] = [], multiplier = 1) {
  return [...new Set(features)].filter(f => !installed.includes(f)).reduce((n, f) => n + (UPGRADE_PRICES[f]?.install ?? 0) * multiplier, 0);
}
export function upgradeUpkeep(features: string[], multiplier = 1) {
  return [...new Set(features)].reduce((n, f) => n + (UPGRADE_PRICES[f]?.daily ?? 0) * multiplier, 0);
}
export const newBusPrice = (year: number) => Math.max(8000, 20000 + (year - 1995) * 6000);