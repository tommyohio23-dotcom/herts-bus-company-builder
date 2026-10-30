import { describe, expect, it } from 'vitest';
import { passengerReview } from './management';

const berlin = { area: 'berlin', operator: 'BVG', presetKey: 'bvg', cur: '€' };
const route = { number: '300', fare: 3.8, frequency_mins: 10, origin: 'Warschauer Straße', destination: 'Philharmonie', via: 'Ostbahnhof, Unter den Linden' };
const UK_PLACES = /Finchley|Stevenage|Hitchin|Hatfield|Barnet|Watford|Enfield|Hertford|King's Cross|£/;

describe('company-specific passenger reviews', () => {
  it('Berlin reviews never mention Herts or London places or pounds across many days', () => {
    for (let day = 1; day <= 200; day++) {
      for (const buses of [[], [{ features: [], condition: 40 }], [{ features: ['USB charging ports'], condition: 90 }]]) {
        expect(passengerReview(route, buses, day, berlin).comment).not.toMatch(UK_PLACES);
      }
    }
  });
  it('Boston reviews use dollars', () => {
    const r = passengerReview({ ...route, number: '1', fare: 4, origin: 'Harvard Square', destination: 'Nubian Station', via: '' }, [{ features: [], condition: 90 }], 4, { area: 'boston', operator: 'MBTA Bus', cur: '$' });
    expect(r.comment).not.toMatch(UK_PLACES);
  });
  it('produces lots of different reviews for one company', () => {
    const texts = new Set(Array.from({ length: 120 }, (_, d) => passengerReview(route, [{ features: [], condition: 90 }], d + 1, berlin).comment));
    expect(texts.size).toBeGreaterThan(60);
  });
});
it('a normal €3.80 Berlin fare is not marked down as expensive', () => {
  const r = passengerReview(route, [{ features: [], condition: 90 }], 3, berlin);
  expect(r.rating).toBe(4);
});
