import { assertFleetCoverage, assertDriverCoverage, timetableCycle, type TimedRoute } from './service-frequency';
import { operatingConditions, routeDemand } from './operating-conditions';

export type SimRoute  = TimedRoute & { id: string; frequency_mins: number; fare: number; journey_minutes?: number; turnaround_minutes?: number; recovery_percent?: number };
export type SimBus    = { id?: string; route_id: string | null; status: string };
export type SimDriver = { id?: string; route_id?: string | null; role?: string; wage: number };

export const BUS_DAILY_COST      = 90;
export const PASSENGERS_PER_TRIP = 22;
export const SERVICE_HOURS       = 14;

export function simulateDay(
  routes:  SimRoute[],
  buses:   SimBus[],
  drivers: SimDriver[],
  day?:    number,
) {
  // 1. Check every active route has enough buses for its actual journey time.
  assertFleetCoverage(routes, buses);

  assertDriverCoverage(routes,buses,drivers);
  const inServiceBuses = buses.filter(b=>b.status==='In service' && routes.some(r=>r.id===b.route_id));

  // 3. Revenue — trips per bus depends on real journey length, not a fixed constant.
  let revenue = 0;
  for (const r of routes) {
    const n = buses.filter(b => b.route_id === r.id && b.status === 'In service').length;
    if (n === 0) continue;

    const cycle       = timetableCycle(r);        // derived from real geography
    const tripsPerBus = (SERVICE_HOURS * 60) / cycle;
    const tripsRun    = Math.floor(n * tripsPerBus);

    const fareFactor = Math.max(0.3, 1.3 - r.fare * 0.1);
    revenue += Math.round(
      tripsRun * PASSENGERS_PER_TRIP * fareFactor * r.fare *
      (day === undefined ? 1 : routeDemand(day, r.id)),
    );
  }

  // 4. Costs.
  const activeBuses = inServiceBuses.length;
  const busCost = Math.round(
    activeBuses * BUS_DAILY_COST *
    (day === undefined ? 1 : operatingConditions(day).runningCost),
  );
  const wages = drivers.reduce((sum, d) => sum + d.wage, 0);

  return { revenue, costs: busCost + wages, profit: revenue - busCost - wages, activeBuses, busCost };}