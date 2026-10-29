export const BUS_CYCLE_MINUTES = 60;

export function requiredBuses(frequency: number, cycleMinutes: number = BUS_CYCLE_MINUTES): number {
  if (!Number.isFinite(frequency) || frequency < 5)
    throw new Error('Service frequency must be at least five minutes');
  return Math.max(1, Math.ceil(cycleMinutes / frequency));
}

export function assertFleetCoverage(
  routes: { id: string; number?: string; frequency_mins: number; cycle_mins?: number }[],
  buses: { route_id: string | null; status: string }[],
): void {
  for (const route of routes) {
    const cycle = route.cycle_mins ?? BUS_CYCLE_MINUTES;
    const needed = requiredBuses(route.frequency_mins, cycle);
    const count = buses.filter(b => b.route_id === route.id && b.status === 'In service').length;
    if (count > 0 && count < needed) {
      throw new Error(
        `Route ${route.number ?? route.id}: every ${route.frequency_mins}-min frequency needs ${needed} in-service buses` +
        ` (${cycle}-min cycle); ${count} allocated. Add buses or increase the interval.`,
      );
    }
  }
}
