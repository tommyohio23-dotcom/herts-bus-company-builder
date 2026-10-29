import { describe, expect, it } from 'vitest';
import { suggestedBusCapital, validStartingCapital } from './starting-capital';

describe('starting capital', () => {
  it('provides £125 million for 50 routes running every 12 minutes', () => {
    expect(suggestedBusCapital(Array.from({ length: 50 }, () => ({ frequency: 12 })))).toBe(125_000_000);
  });
  it('increases suggested funding for more frequent services', () => {
    expect(suggestedBusCapital([{ frequency: 12 }])).toBe(2_500_000);
    expect(suggestedBusCapital([{ frequency: 30 }])).toBe(1_000_000);
  });
  it('lets a player choose their own whole-pound amount', () => {
    expect(validStartingCapital(750_000_000)).toBe(true);
    expect(validStartingCapital(0)).toBe(true);
    expect(validStartingCapital(-1)).toBe(false);
    expect(validStartingCapital(1.5)).toBe(false);
    expect(validStartingCapital(Number.NaN)).toBe(false);
  });
});