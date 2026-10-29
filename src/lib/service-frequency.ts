export type LatLng = { lat: number; lng: number };

export const BUS_SPEED_KMH         = 20;  // average urban speed incl. traffic
export const DWELL_SECS_PER_STOP   = 30;  // boarding/alighting time per stop

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/** Straight-line distance in km between two coordinates (Haversine). */
export function haversineKm(a: LatLng, b: LatLng): number {
  const R    = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h    = Math.sin(dLat / 2) ** 2
             + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * One-way journey time in minutes for an ordered list of stop locations.
 * Combines travel time (distance ÷ speed) with dwell time at each stop.
 */
export function routeOneWayMinutes(stops: LatLng[]): number {
  if (stops.length < 2) return 5;
  let distanceKm = 0;
  for (let i = 0; i < stops.length - 1; i++) {
    distanceKm += haversineKm(stops[i], stops[i + 1]);
  }
  const travelMins = (distanceKm / BUS_SPEED_KMH) * 60;
  const dwellMins  = (stops.length * DWELL_SECS_PER_STOP) / 60;
  return Math.max(5, Math.round(travelMins + dwellMins));
}

/** Full round-trip cycle time: one-way × 2. */
export function routeCycleMinutes(stops: LatLng[]): number {
  return routeOneWayMinutes(stops) * 2;
}

/**
 * Buses needed to maintain a headway, given a round-trip cycle time.
 * e.g. 80-min cycle, every 20 min → ceil(80/20) = 4 buses.
 */
export function requiredBuses(frequencyMinutes: number, cycleMinutes: number): number {
  if (!Number.isFinite(frequencyMinutes) || frequencyMinutes < 5)
    throw new Error('Service frequency must be at least five minutes');
  return Math.max(1, Math.ceil(cycleMinutes / frequencyMinutes));
}

/**
 * Throws if any active route has fewer in-service buses than its geometry requires.
 */
export function assertFleetCoverage(
  routes: { id: string; number?: string; frequency_mins: number; stops: LatLng[] }[],
  buses:  { route_id: string | null; status: string }[],
): void {
  for (const route of routes) {
    const cycle   = routeCycleMinutes(route.stops);
    const needed  = requiredBuses(route.frequency_mins, cycle);
    const oneWay  = routeOneWayMinutes(route.stops);
    const count   = buses.filter(b => b.route_id === route.id && b.status === 'In service').length;
    if (count > 0 && count < needed) {
      throw new Error(
        `Route ${route.number ?? route.id}: ${oneWay}-min journey (${cycle}-min round trip). ` +
        `Every ${route.frequency_mins} min needs ${needed} buses; only ${count} allocated.`,
      );
    }
  }
