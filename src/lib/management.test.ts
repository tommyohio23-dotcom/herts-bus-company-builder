import { describe, expect, it } from 'vitest';
import { DEPOT_PACKAGES, managementDay, marketListings, passengerReview, tenderDecision } from './management';
describe('management rules', () => {
  it('offers six distinct used listings and renews after seven days', () => {
    expect(new Set(marketListings(1).map(b => b.key)).size).toBe(6);
    expect(marketListings(7)[0]?.key).toBe(marketListings(1)[0]?.key);
    expect(marketListings(8)[0]?.key).not.toBe(marketListings(1)[0]?.key);
  });
  it('has five spaces in the smallest depot', () => expect(DEPOT_PACKAGES[0]?.capacity).toBe(5));
  it('rejects bids without the required eligible fleet', () => expect(tenderDecision(300,360,0,1)).toBe(false));
  it('rejects bids above the simulated competitor threshold', () => expect(tenderDecision(360,360,1,1)).toBe(false));
  it('accepts a competitive eligible bid', () => expect(tenderDecision(300,360,1,1)).toBe(true));
  it('gives an unserved route one star', () => expect(passengerReview({number:'1',fare:2,frequency_mins:30},[]).rating).toBe(1));
  it('rewards frequent comfortable journeys with five stars', () => expect(passengerReview({number:'1',fare:2,frequency_mins:30},[{condition:85,features:['USB charging ports']}]).rating).toBe(5));
  it('adds depot rent even without services', () => expect(managementDay([],[],[],[35],1).profit).toBe(-35));
  it('does not pay an expired contract', () => {
    const r = managementDay([{id:'a',number:'T1',fare:0,frequency_mins:60,contract_payment:360,contract_end_day:7}],[{route_id:'a',status:'In service',features:[],condition:85}],[],[],8);
    expect(r.revenue).toBe(0);
  });
});