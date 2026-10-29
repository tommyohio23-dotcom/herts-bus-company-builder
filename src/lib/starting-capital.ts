import { requiredBuses } from './service-frequency';

export const RAIL_STARTING_CAPITAL = 3_000_000;
export function suggestedBusCapital(routes: { frequency: number }[]): number {
  return Math.max(1_000_000, routes.reduce((total, route) => total + requiredBuses(route.frequency), 0) * 500_000);
}
export function validStartingCapital(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 0;
}