import { describe, expect, it } from 'vitest';
import { AREA_PRESETS, companyArea } from './areas';
import { BUS_MODELS } from './herts';
import { realOperatorPhoto } from './bus-photos';

describe('Boston, New York and Berlin operators', () => {
  it('each city has its own operator menu', () => {
    expect(AREA_PRESETS.boston.map(p => p.key)).toEqual(['mbta']);
    expect(AREA_PRESETS.nyc.map(p => p.key)).toEqual(['mta-nyct', 'mta-bus']);
    expect(AREA_PRESETS.berlin.map(p => p.key)).toEqual(['bvg']);
  });
  it('saved city companies land in the right menu', () => {
    expect(companyArea({ preset_key: 'bvg', hq_town: 'Mitte' }, [])).toBe('berlin');
    expect(companyArea({ preset_key: null, hq_town: 'Brooklyn' }, [])).toBe('nyc');
    expect(companyArea({ preset_key: null, hq_town: 'Cambridge' }, [])).toBe('boston');
  });
  it('city fleets use buyable models and every operator has a real photo', () => {
    for (const p of [...AREA_PRESETS.boston, ...AREA_PRESETS.nyc, ...AREA_PRESETS.berlin]) {
      for (const b of p.fleet) expect(BUS_MODELS).toContain(b.model);
      expect(realOperatorPhoto(p.key)).toBeDefined();
    }
  });
});
