import { describe, expect, it } from 'vitest';
import { AREA_PRESETS, areaModels, areaTowns, companyArea } from './areas';
import { AREA_CURRENCY } from './currency';
import { BUS_MODELS } from './herts';
import { realBusPhoto, realOperatorPhoto } from './bus-photos';

describe('Boston, New York and Berlin operators', () => {
  it('each city has its own operator menu', () => {
    expect(AREA_PRESETS.boston.map(p => p.key)).toEqual(['mbta', 'logan-express']);
    expect(AREA_PRESETS.nyc.map(p => p.key)).toEqual(['mta-nyct', 'mta-bus', 'nice-bus', 'nj-transit-bus']);
    expect(AREA_PRESETS.berlin.map(p => p.key)).toEqual(['bvg']);
  });
  it('saved city companies land in the right menu', () => {
    expect(companyArea({ preset_key: 'bvg', hq_town: 'Mitte' }, [])).toBe('berlin');
    expect(companyArea({ preset_key: null, hq_town: 'Brooklyn' }, [])).toBe('nyc');
    expect(companyArea({ preset_key: null, hq_town: 'Cambridge' }, [])).toBe('boston');
  });
  it('Berlin includes BVG routes 300 and 147', () => {
    expect(AREA_PRESETS.berlin[0]!.routes.map(r => r.number)).toEqual(expect.arrayContaining(['300', '147']));
  });
  it('city companies buy only their own city models and open depots only in their own area', () => {
    expect(areaModels('berlin')).not.toContain('New Flyer Xcelsior XD40');
    expect(areaModels('boston')).not.toContain('ADL Enviro200');
    expect(areaModels('herts')).not.toContain('Nova Bus LFS');
    expect(areaTowns('boston')).not.toContain('Hertford');
    expect(areaTowns('herts')).toContain('Hertford');
  });
  it('city companies use local money', () => {
    expect(AREA_CURRENCY.boston).toBe('$');
    expect(AREA_CURRENCY.nyc).toBe('$');
    expect(AREA_CURRENCY.berlin).toBe('€');
    expect(AREA_CURRENCY.herts).toBe('£');
  });
  it('city fleets use buyable models and every operator has a real photo', () => {
    for (const p of [...AREA_PRESETS.boston, ...AREA_PRESETS.nyc, ...AREA_PRESETS.berlin]) {
      for (const b of p.fleet) { expect(BUS_MODELS).toContain(b.model); expect(realBusPhoto(null, b.model)).toBeDefined(); }
      expect(realOperatorPhoto(p.key)).toBeDefined();
    }
  });
});
