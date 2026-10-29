export type SimRoute = { id: string; frequency_mins: number; fare: number; cycle_mins?: number };
export type SimBus = { route_id: string | null; status: string };
import { assertFleetCoverage } from './service-frequency';
import { operatingConditions, routeDemand } from './operating-conditions';

export const BUS_DAILY_COST = 90; // fuel + upkeep per bus in service
export const PASSENGERS_PER_TRIP = 22;
export const SERVICE_HOURS = 14;

/** Revenue and costs for one simulated operating day. */
export function simulateDay(routes: SimRoute[], buses: SimBus[], driverWages: number[], day?: number) {
  assertFleetCoverage(routes, buses);

  // Count all in-service buses assigned to a known route.
  const activeBuses = buses.filter(
    b => b.status === 'In service' && routes.some(r => r.id === b.route_id),
  ).length;

  if (driverWages.length < activeBuses) {
    throw new Error(
      `Cannot operate service: You have ${activeBuses} in-service buses but only ` +
      `${driverWages.length} drivers employed. Each in-service bus must have a driver assigned.`,
    );
  }

  let revenue = 0;
  for (const r of routes) {
    const n = buses.filter(b => b.route_id === r.id && b.status === 'In service').length;
    if (n === 0) continue;
    const tripsNeeded = (SERVICE_HOURS * 60) / Math.max(5, r.frequency_mins);
    const tripsRun = Math.min(tripsNeeded, n * SERVICE_HOURS);
    const fareFactor = Math.max(0.3, 1.3 - r.fare * 0.1);
    revenue += Math.round(
      tripsRun * PASSENGERS_PER_TRIP * fareFactor * r.fare *
      (day === undefined ? 1 : routeDemand(day, r.id)),
    );
  }

  const busCost = Math.round(
    activeBuses * BUS_DAILY_COST * (day === undefined ? 1 : operatingConditions(day).runningCost),
  );
  const wages = driverWages.reduce((a, b) => a + b, 0);
  return { revenue, costs: busCost + wages, profit: revenue - busCost - wages, activeBuses, busCost };
}