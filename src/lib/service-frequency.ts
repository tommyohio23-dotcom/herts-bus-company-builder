export type LatLng = { lat: number; lng: number };

export const BUS_SPEED_KMH         = 20;
export const DWELL_SECS_PER_STOP   = 30;

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function haversineKm(a: LatLng, b: LatLng): number {
  const R    = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h    = Math.sin(dLat / 2) ** 2
             + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function routeOneWayMinutes(stops?: LatLng[]): number {
  if (!stops || stops.length < 2) return 30;
  let distanceKm = 0;
  for (let i = 0; i < stops.length - 1; i++) {
    distanceKm += haversineKm(stops[i], stops[i + 1]);
  }
  const travelMins = (distanceKm / BUS_SPEED_KMH) * 60;
  const dwellMins  = (stops.length * DWELL_SECS_PER_STOP) / 60;
  return Math.max(5, Math.round(travelMins + dwellMins));
}

export function routeCycleMinutes(stops?: LatLng[]): number {
  return routeOneWayMinutes(stops) * 2;
}

export function requiredBuses(frequencyMinutes: number, cycleMinutes = 60): number {
  if (!Number.isFinite(frequencyMinutes) || frequencyMinutes < 5)
    throw new Error('Service frequency must be at least five minutes');
  return Math.max(1, Math.ceil(cycleMinutes / frequencyMinutes));
}

export function assertFleetCoverage(
  routes: { id: string; number?: string; frequency_mins: number; stops?: LatLng[] }[],
  buses:  { route_id: string | null; status: string }[],
): void {
  for (const route of routes) {
    const stops  = route.stops || [];
    const cycle  = routeCycleMinutes(stops);
    const needed = requiredBuses(route.frequency_mins, cycle);
    const oneWay = routeOneWayMinutes(stops);
    const count  = buses.filter(b => b.route_id === route.id && b.status === 'In service').length;
    if (count > 0 && count < needed) {
      throw new Error(
        `Route ${route.number ?? route.id}: ${oneWay}-min journey (${cycle}-min round trip). ` +
        `Every ${route.frequency_mins} min needs ${needed} buses; only ${count} allocated.`,
      );
    }
  }
}

/** Approximate coordinates for Hertfordshire towns. */
export const HERTS_TOWN_COORDS: Record<string, LatLng> = {
  'Hertford':           { lat: 51.796, lng: -0.078 },
  'Stevenage':          { lat: 51.902, lng: -0.204 },
  'Watford':            { lat: 51.655, lng: -0.396 },
  'St Albans':          { lat: 51.750, lng: -0.336 },
  'Hemel Hempstead':    { lat: 51.753, lng: -0.448 },
  'Hatfield':           { lat: 51.763, lng: -0.228 },
  'Welwyn Garden City': { lat: 51.800, lng: -0.211 },
  'Hitchin':            { lat: 51.947, lng: -0.280 },
  'Letchworth':         { lat: 51.978, lng: -0.228 },
  "Bishop's Stortford": { lat: 51.872, lng:  0.160 },
  'Ware':               { lat: 51.810, lng: -0.030 },
  'Hoddesdon':          { lat: 51.760, lng: -0.013 },
  'Waltham Cross':      { lat: 51.685, lng: -0.033 },
  'Cheshunt':           { lat: 51.702, lng: -0.030 },
  'Potters Bar':        { lat: 51.695, lng: -0.177 },
  'Borehamwood':        { lat: 51.659, lng: -0.272 },
  'Radlett':            { lat: 51.692, lng: -0.315 },
  'Bushey':             { lat: 51.644, lng: -0.360 },
  'Rickmansworth':      { lat: 51.638, lng: -0.472 },
  'Chorleywood':        { lat: 51.655, lng: -0.510 },
  'Berkhamsted':        { lat: 51.759, lng: -0.564 },
  'Tring':              { lat: 51.798, lng: -0.660 },
  'Royston':            { lat: 52.047, lng: -0.021 },
  'Baldock':            { lat: 51.993, lng: -0.188 },
  'Buntingford':        { lat: 51.945, lng: -0.015 },
  'Harpenden':          { lat: 51.815, lng: -0.354 },
  'Welwyn':             { lat: 51.838, lng: -0.211 },
  'Knebworth':          { lat: 51.868, lng: -0.198 },
  'Redbourn':           { lat: 51.795, lng: -0.384 },
  'London Colney':      { lat: 51.726, lng: -0.295 },
  'Wheathampstead':     { lat: 51.815, lng: -0.316 },
};

/**
 * Estimate round-trip cycle time from town name strings (origin, via, destination).
 * Falls back to 60 min if fewer than 2 towns have known coordinates.
 */
export function routeCycleFromNames(origin: string, via: string, destination: string): number {
  const viaStops = via ? via.split(', ').filter(Boolean) : [];
  const allTowns = [origin, ...viaStops, destination];
  const coords   = allTowns.map(t => HERTS_TOWN_COORDS[t]).filter((c): c is LatLng => !!c);
  return routeCycleMinutes(coords.length >= 2 ? coords : undefined);
}