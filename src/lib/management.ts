import { simulateDay, type SimBus, type SimRoute } from './sim';
import { upgradeUpkeep } from './upgrades';
import { operatingConditions } from './operating-conditions';

export const MAP_AREAS = [
  { key: 'herts', name: 'Hertfordshire & borders', lat: 51.85, lng: -0.28 },
  { key: 'beds', name: 'Bedfordshire & Luton', lat: 52.075, lng: -0.475 },
  { key: 'bucks', name: 'Buckinghamshire & borders', lat: 51.70, lng: -0.75 },
  { key: 'essex', name: 'West Essex', lat: 51.825, lng: 0.30 },
  { key: 'london', name: 'London & borders', lat: 51.5074, lng: -0.1278 },
  { key: 'north-london', name: 'Barnet · Enfield · Haringey · Borehamwood', lat: 51.637, lng: -0.12 },
];
export type RealStop = { id: string; name: string; locality: string; indicator: string; lat: number; lng: number };
export const stopLabel = (s: RealStop) => `${s.locality} · ${s.name}${s.indicator ? ` (${s.indicator})` : ''}`;
export const DEPOT_PACKAGES = [
  { name: 'Outstation', capacity: 5, cost: 10000, daily_rent: 35 },
  { name: 'Local depot', capacity: 15, cost: 25000, daily_rent: 75 },
  { name: 'Main depot', capacity: 40, cost: 60000, daily_rent: 160 },
];
const marketModels = ['Optare Solo', 'ADL Enviro200', 'Dennis Dart SLF / Plaxton Pointer', 'ADL Enviro400', 'Wright StreetLite', 'Volvo B9TL / Wright Gemini 2'];
export function marketListings(day: number) {
  const week = Math.floor((day - 1) / 7);
  return Array.from({length: 18}, (_, i) => {
    const model = marketModels[i % marketModels.length] ?? 'Optare Solo';
    const variant = Math.floor(i / marketModels.length);
    const year = ([2009, 2013, 2004, 2011, 2017, 2010][i % marketModels.length] ?? 2010) + variant * 2;
    const mileage = 80000 + (i % 6) * 42000 + (week % 5) * 12000 - variant * 18000;
    const condition = 62 + ((i * 7 + week * 3) % 33);
    return { key: `used-${week}-${i}`, model, year, mileage, condition, price: Math.round((18000 + (year - 2000) * 3000) * (condition / 100)), features: ['CCTV', 'Wheelchair space', ...(variant >= 1 ? ['Contactless ticket machine'] : []), ...(variant === 2 ? ['USB charging ports', 'Free Wi-Fi'] : [])] };
  });
}
export function tenderOffers(day: number) {
  const week = Math.floor((day - 1) / 7);
  return [
    { number: 'T1', origin: 'Hertford', destination: 'Ware', via: '', frequency_mins: 60, budget: 360, required: 1 },
    { number: 'T2', origin: 'St Albans', destination: 'Hatfield', via: 'London Colney', frequency_mins: 30, budget: 680, required: 2 },
    { number: 'T3', origin: 'Watford', destination: 'Rickmansworth', via: 'Croxley Green', frequency_mins: 60, budget: 420, required: 1 },
  ].map((t, i) => ({ ...t, key: `tender-${week}-${i}`, close_day: week * 7 + 7, end_day: week * 7 + 35 }));
}
export function tenderDecision(bid: number, budget: number, eligibleBuses: number, required: number) {
  return Number.isFinite(bid) && bid > 0 && bid <= budget * 0.95 && eligibleBuses >= required;
}
export function passengerReview(route: { number: string; fare: number; frequency_mins: number }, buses: { features: string[]; condition: number }[]) {
  if (!buses.length) return { route_number: route.number, rating: 1, comment: 'No bus arrived for this service.' };
  const avgCondition = buses.reduce((n, b) => n + b.condition, 0) / buses.length;
  const comfortable = buses.some(b => b.features.includes('Leather seats') || b.features.includes('USB charging ports') || b.features.includes('Air conditioning'));
  const rating = Math.max(1, Math.min(5, 3 + (route.frequency_mins <= 30 ? 1 : 0) + (comfortable ? 1 : 0) - (route.fare > 3 ? 1 : 0) - (avgCondition < 65 ? 1 : 0)));
  const comment = avgCondition < 65 ? 'The bus felt worn and could do with attention.' : route.fare > 3 ? 'The journey was useful, but the fare felt expensive.' : comfortable ? 'A comfortable journey; the onboard extras were welcome.' : route.frequency_mins <= 30 ? 'A regular service and a straightforward journey.' : 'A useful service, though I would like more frequent buses.';
  return { route_number: route.number, rating, comment };
}
export function managementDay(routes: (SimRoute & { number: string; contract_payment: number; contract_end_day: number | null })[], buses: (SimBus & { features: string[]; condition: number })[], wages: number[], rents: number[], day: number) {
  const activeRoutes = routes.filter(r => r.contract_end_day == null || r.contract_end_day >= day);
  const result = simulateDay(activeRoutes, buses, wages, day);
  const contractRevenue = activeRoutes.reduce((sum, r) => sum + (buses.some(b => b.route_id === r.id && b.status === 'In service') ? r.contract_payment : 0), 0);
  const depotCosts = rents.reduce((sum, rent) => sum + rent, 0);
  const upgradeCosts = buses.filter(b => b.status !== 'Withdrawn').reduce((n,b) => n + upgradeUpkeep(b.features), 0);
  return { revenue: result.revenue + contractRevenue, costs: result.costs + depotCosts + upgradeCosts, profit: result.profit + contractRevenue - depotCosts - upgradeCosts, details: { conditions: operatingConditions(day).label, fares: result.revenue, contractRevenue, depotCosts, upgradeCosts, wages: wages.reduce((a,b) => a+b,0), busCosts: result.busCost, activeBuses: result.activeBuses }, reviews: activeRoutes.map(r => passengerReview(r, buses.filter(b => b.route_id === r.id && b.status === 'In service'))) };
}