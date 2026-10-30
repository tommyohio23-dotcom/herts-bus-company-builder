import { describe, it, expect } from 'vitest';
import { routeFareBoost, depotCare, managerRent, trainerCostCut, railPerks } from './staff-perks';
import { assertDriverCoverage } from './service-frequency';

describe('staff perks', () => {
  it('ticket inspectors add 6% fares each on their route, capped at two', () => {
    expect(routeFareBoost('a', [{ role: 'Ticket Inspector', route_id: 'a' }])).toBeCloseTo(1.06);
    expect(routeFareBoost('a', Array(5).fill({ role: 'Ticket Inspector', route_id: 'a' }))).toBeCloseTo(1.12);
    expect(routeFareBoost('b', [{ role: 'Ticket Inspector', route_id: 'a' }])).toBe(1);
  });
  it('senior drivers count as route drivers', () =>
    expect(() => assertDriverCoverage([{ id: 'a' }], [{ route_id: 'a', status: 'In service' }], [{ role: 'Senior Driver', route_id: 'a' }])).not.toThrow());
  it('one engineer per 10 buses gives full depot cover', () => expect(depotCare('Hertford', [{ role: 'Engineer', depot: 'Hertford' }], 10).costCut).toBeCloseTo(0.1));
  it('depot manager cuts that depot rent by 25%', () => {
    expect(managerRent(100, 'Hertford', [{ role: 'Depot Manager', depot: 'Hertford' }])).toBe(75);
    expect(managerRent(100, 'Watford', [{ role: 'Depot Manager', depot: 'Hertford' }])).toBe(100);
  });
  it('driver trainers cut running costs 5% each up to 15%', () => expect(trainerCostCut(Array(6).fill({ role: 'Driver Trainer' }))).toBeCloseTo(0.15));
  it('conductors covering every rail service add 8% fares', () => expect(railPerks([{ role: 'Conductor' }], 1, 1).fare).toBeCloseTo(1.08));
});
