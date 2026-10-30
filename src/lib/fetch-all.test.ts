import { describe, expect, it } from 'vitest';
import { chunk, fetchAll } from './fetch-all';

describe('fetchAll', () => {
  it('returns all 2,500 rows across the 1,000-row page limit', async () => {
    const rows = Array.from({ length: 2500 }, (_, i) => i);
    const all = await fetchAll(async (from, to) => ({ data: rows.slice(from, to + 1), error: null }));
    expect(all).toHaveLength(2500);
  });
  it('splits 450 ids into groups of 200', () => expect(chunk(Array.from({ length: 450 }, (_, i) => i)).map(c => c.length)).toEqual([200, 200, 50]));
});
