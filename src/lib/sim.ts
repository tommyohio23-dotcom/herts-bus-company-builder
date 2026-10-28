export type SimRoute = { id: string; frequency_mins: number; fare: number };
export type SimBus = { route_id: string | null; status: string };

export const BUS_DAILY_COST = 90; // fuel + upkeep per bus in service
export const PASSENGERS_PER_TRIP = 22;
export const SERVICE_HOURS = 14;

/** Revenue and costs for one simulated operating day. */
export function simulateDay(routes: SimRoute[], buses: SimBus[], driverWages: number[]) {
  let revenue = 0;
  let activeBuses = 0;
  for (const r of routes) {
    const n = buses.filter((b) => b.route_id === r.id && b.status === "In service").length;
    if (n === 0) continue;
    activeBuses += n;
    const tripsNeeded = (SERVICE_HOURS * 60) / Math.max(5, r.frequency_mins);
    const tripsRun = Math.min(tripsNeeded, n * SERVICE_HOURS);
    const fareFactor = Math.max(0.3, 1.3 - r.fare * 0.1);
    revenue += Math.round(tripsRun * PASSENGERS_PER_TRIP * fareFactor * r.fare);
  }
  const busCost = activeBuses * BUS_DAILY_COST;
  const wages = driverWages.reduce((a, b) => a + b, 0);
  return { revenue, costs: busCost + wages, profit: revenue - busCost - wages, activeBuses };
}
