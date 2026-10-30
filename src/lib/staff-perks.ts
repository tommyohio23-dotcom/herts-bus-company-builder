/** Pure staff perk rules shared by bus and rail days. Every perk is capped so huge rosters cannot run away. */
export const ROUTE_ROLES = ['Driver', 'Senior Driver', 'Ticket Inspector'] as const;
export const CREW_ROLES = ['Driver', 'Senior Driver'];
export const isCrew = (role?: string) => CREW_ROLES.includes(role ?? 'Driver');

export const BUS_PERKS: Record<string, string> = {
  'Driver': 'Assign to a route. Every in-service bus needs one.',
  'Senior Driver': 'Assign to a route. Counts as a driver and adds +3% fares on that route (up to +9%).',
  'Ticket Inspector': 'Assign to a route. Cuts fare dodging: +6% fares per inspector on that route (up to +12%) and happier passengers.',
  'Cleaner': 'Assign to a depot. Each keeps 10 buses there clean, so they break down less and get better reviews.',
  'Engineer': 'Assign to a depot. Each looks after 10 buses there: far fewer breakdowns and 10% lower running costs.',
  'Controller': 'Works company-wide. +2% fares each from better service control (up to +6%).',
  'Depot Manager': 'One per depot. Cuts that depot\'s rent by 25%.',
  'Driver Trainer': 'Works company-wide. Each cuts bus running costs by 5% (up to 15%).',
};

export const RAIL_PERKS: Record<string, string> = {
  'Train Driver': 'Assign to a service. Every train service needs one.',
  'Conductor': 'Each covers one service: up to +8% fares across your services.',
  'Rail Engineer': 'Each looks after 2 trains: fewer train breakdowns.',
  'Station Assistant': '+4% fares each from busier, safer stations (up to +12%).',
  'Signaller': '+3% fares each from fewer delays (up to +9%).',
  'Depot Manager': 'Cuts depot rent by 25% at their depot.',
  'Cleaner': 'Each keeps 3 trains clean: better passenger ratings.',
};

type Staff = { role?: string; route_id?: string | null; depot?: string | null };
const count = (s: Staff[], role: string, f: (d: Staff) => boolean = () => true) => s.filter(d => d.role === role && f(d)).length;
const cover = (staff: number, perStaff: number, items: number) => items <= 0 ? 0 : Math.min(1, (staff * perStaff) / items);

/** Fare multiplier for one bus route from its assigned staff and company-wide controllers. */
export function routeFareBoost(routeId: string, staff: Staff[]) {
  const seniors = Math.min(3, count(staff, 'Senior Driver', d => d.route_id === routeId));
  const inspectors = Math.min(2, count(staff, 'Ticket Inspector', d => d.route_id === routeId));
  const controllers = Math.min(3, count(staff, 'Controller'));
  return 1 + seniors * 0.03 + inspectors * 0.06 + controllers * 0.02;
}

/** Extra condition points used for breakdown odds and reviews, from cleaners/engineers at the bus's depot. */
export function depotCare(depot: string | null | undefined, staff: Staff[], busesAtDepot: number) {
  if (!depot) return { breakdown: 0, review: 0, costCut: 0 };
  const at = (d: Staff) => d.depot === depot;
  const clean = cover(count(staff, 'Cleaner', at), 10, busesAtDepot), eng = cover(count(staff, 'Engineer', at), 10, busesAtDepot);
  return { breakdown: Math.round(10 * clean + 20 * eng), review: Math.round(15 * clean), costCut: 0.1 * eng };
}

export const trainerCostCut = (staff: Staff[]) => Math.min(3, count(staff, 'Driver Trainer')) * 0.05;
export const managerRent = (rent: number, town: string | undefined, staff: Staff[]) => town && staff.some(d => d.role === 'Depot Manager' && d.depot === town) ? Math.round(rent * 0.75) : rent;

/** Rail: company-wide multipliers and care bonuses. */
export function railPerks(staff: Staff[], services: number, trains: number) {
  const fare = 1 + 0.08 * cover(count(staff, 'Conductor'), 1, services) + Math.min(3, count(staff, 'Station Assistant')) * 0.04 + Math.min(3, count(staff, 'Signaller')) * 0.03;
  return { fare, breakdown: Math.round(20 * cover(count(staff, 'Rail Engineer'), 2, trains)), cleanRating: cover(count(staff, 'Cleaner'), 3, trains) >= 1 ? 1 : 0 };
}
