import { describe, expect, it } from 'vitest';
import { operatingConditions, routeDemand } from './operating-conditions';

describe('daily operating variation', () => {
  it('has seven different daily demand and cost combinations', () => {
    const days = Array.from({ length: 7 }, (_, i) => operatingConditions(i + 1));
    expect(new Set(days.map(d => `${d.demand}:${d.runningCost}`)).size).toBe(7);
  });
  it('keeps route demand repeatable on retries', () => {
    expect(routeDemand(4, 'route-1')).toBe(routeDemand(4, 'route-1'));
    expect(routeDemand(4, 'route-1')).not.toBe(routeDemand(3, 'route-1'));
  });
});