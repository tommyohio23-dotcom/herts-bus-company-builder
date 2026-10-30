import { bankReview } from './review-bank';
import { simulateDay, type SimBus, type SimRoute, type SimDriver } from './sim';
import { upgradeUpkeep } from './upgrades';
import { breakdownOccurs } from './disruptions';
import { depotCare, managerRent } from './staff-perks';
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
    { number: 'RR1', origin: 'New Barnet', destination: 'Potters Bar', via: 'Hadley Wood', frequency_mins: 60, budget: 900, required: 2 },
    { number: 'T3', origin: 'Watford', destination: 'Rickmansworth', via: 'Croxley Green', frequency_mins: 60, budget: 420, required: 1 },
  ].map((t, i) => ({ ...t, key: `tender-${week}-${i}`, close_day: week * 7 + 7, end_day: week * 7 + 35 }));
}
export function tenderDecision(bid: number, budget: number, eligibleBuses: number, required: number) {
  return Number.isFinite(bid) && bid > 0 && bid <= budget * 0.95 && eligibleBuses >= required;
}
const pick = (items: string[], seed: number) => items[Math.abs(seed) % items.length] ?? items[0] ?? '';
const REVIEW_TEXT = {
  missing: ['No bus arrived for this service.', 'I waited at the stop but the bus never came.', 'The timetable showed a bus, but nothing turned up.', 'Missed an appointment because this service did not run.'],
  worn: ['The bus felt worn and could do with attention.', 'Rattly seats and a tired interior spoiled the trip.', 'It got me there, but the vehicle needs some care.', 'The bus looked scruffy and the ride was rough.'],
  fare: ['The journey was useful, but the fare felt expensive.', 'Good route, though the ticket price is steep.', 'I would travel more often if the fare were lower.', 'Reliable enough, but poor value for a short trip.'],
  comfort: ['A comfortable journey; the onboard extras were welcome.', 'The onboard extras made the journey more comfortable.', 'Pleasant ride — the extras made a real difference.', 'One of the nicer buses I have used in the area.'],
  frequent: ['A regular service and a straightforward journey.', 'Having another bus soon after makes this route convenient.', 'Frequent buses make this route easy to rely on.', 'The regular service makes everyday journeys easier.'],
  sparse: ['A useful service, though I would like more frequent buses.', 'Handy route, but the gaps between buses are long.', 'If I miss one, the wait for the next is frustrating.', 'Decent journey; an extra bus each hour would help.'],
};
export function passengerReview(route: { number: string; fare: number; frequency_mins: number }, buses: { features: string[]; condition: number }[], day = 1) {
  const routeSeed = Number.parseInt(route.number.replace(/\D/g, ''), 10);
  const seed = day * 7 + (Number.isFinite(routeSeed) ? routeSeed : [...route.number].reduce((n, c, i) => n + c.charCodeAt(0) * (i + 1), 0));
  if (!buses.length) return { route_number: route.number, rating: 1, comment: pick(REVIEW_TEXT.missing, seed) };
  const avgCondition = buses.reduce((n, b) => n + b.condition, 0) / buses.length;
  const comfortable = buses.some(b => b.features.includes('Leather seats') || b.features.includes('USB charging ports') || b.features.includes('Air conditioning'));
  const rating = Math.max(1, Math.min(5, 3 + (route.frequency_mins <= 30 ? 1 : 0) + (comfortable ? 1 : 0) - (route.fare > 3 ? 1 : 0) - (avgCondition < 65 ? 1 : 0)));
  const comment = pick(avgCondition < 65 ? REVIEW_TEXT.worn : route.fare > 3 ? REVIEW_TEXT.fare : comfortable ? REVIEW_TEXT.comfort : route.frequency_mins <= 30 ? REVIEW_TEXT.frequent : REVIEW_TEXT.sparse, seed);
  return { route_number: route.number, rating, comment: seed % 4 === 0 ? comment : bankReview('bus', rating, seed * 13 + day) ?? comment };
}
export function managementDay(routes: (SimRoute & { number: string; contract_payment: number; contract_end_day: number | null })[], buses: (SimBus & { features: string[]; condition: number })[], staff: SimDriver[], rents: (number | { rent: number; town: string })[], day: number) {
  const busesAt = (d?: string | null) => buses.filter(b => b.depot === d && b.status !== 'Withdrawn').length;
  const care = (b: SimBus) => depotCare(b.depot, staff, busesAt(b.depot));
  const inspected = (id: string) => staff.some(d => d.role === 'Ticket Inspector' && d.route_id === id);
  const activeRoutes = routes.filter(r => r.contract_end_day == null || r.contract_end_day >= day);
  const result = simulateDay(activeRoutes, buses, staff, day);
  const contractRevenue = activeRoutes.reduce((sum, r) => sum + (buses.some(b => b.route_id === r.id && b.status === 'In service') ? r.contract_payment : 0), 0);
  const depotCosts = rents.reduce<number>((sum, r) => sum + (typeof r === 'number' ? r : managerRent(r.rent, r.town, staff)), 0);
  const upgradeCosts = buses.filter(b => b.status !== 'Withdrawn').reduce((n,b) => n + upgradeUpkeep(b.features), 0);
  return { revenue: result.revenue + contractRevenue, costs: result.costs + depotCosts + upgradeCosts, profit: result.profit + contractRevenue - depotCosts - upgradeCosts, details: { conditions: operatingConditions(day).label, fares: result.revenue, contractRevenue, depotCosts, upgradeCosts, wages: staff.reduce((a,b) => a+b.wage,0), breakdowns: buses.filter(b=>b.id&&b.status==='In service'&&activeRoutes.some(r=>r.id===b.route_id)&&breakdownOccurs(day,b.id,Math.min(100,b.condition+care(b).breakdown))).map(b=>({id:b.id})), busCosts: result.busCost, activeBuses: result.activeBuses }, reviews: activeRoutes.map(r => { const rv = passengerReview(r, buses.filter(b => b.route_id === r.id && b.status === 'In service').map(b => ({ ...b, condition: Math.min(100, b.condition + care(b).review) })), day); return inspected(r.id) ? { ...rv, rating: Math.min(5, rv.rating + 1) } : rv; }) };
}