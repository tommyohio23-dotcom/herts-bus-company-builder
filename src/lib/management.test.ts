import { describe, expect, it } from 'vitest';
import { DEPOT_PACKAGES, managementDay, marketListings, passengerReview, tenderDecision } from './management';
describe('management rules', () => {
  it('varies daily income and running costs without changing wages, rent or contract payments', () => {
    const routes = [{id:'a',number:'1',fare:2,frequency_mins:120,contract_payment:360,contract_end_day:35}];
    const buses = [{route_id:'a',status:'In service',features:[],condition:85}];
    const days = [1,2,3].map(day => managementDay(routes,buses,[{wage:140,role:"Driver",route_id:"a"}],[35],day));
    expect(new Set(days.map(d => d.revenue)).size).toBe(3);
    expect(new Set(days.map(d => d.costs)).size).toBe(3);
    for (const d of days) {
      expect(d.details.wages).toBe(140);
      expect(d.details.depotCosts).toBe(35);
      expect(d.details.contractRevenue).toBe(360);
      expect(d.profit).toBe(d.revenue - d.costs);
      expect(d.costs).toBe(d.details.busCosts + 140 + 35);
    }
    expect(managementDay(routes,buses,[{wage:140,role:"Driver",route_id:"a"}],[35],2)).toEqual(days[1]);
  });
  it('offers eighteen distinct used listings and renews after seven days', () => {
    expect(new Set(marketListings(1).map(b => b.key)).size).toBe(18);
    expect(marketListings(7)[0]?.key).toBe(marketListings(1)[0]?.key);
    expect(marketListings(8)[0]?.key).not.toBe(marketListings(1)[0]?.key);
  });
  it('offers the same model with different years and specifications', () => {
    const stock = marketListings(1).filter(b => b.model === 'Optare Solo');
    expect(stock.map(b => b.year)).toEqual([2009, 2011, 2013]);
    expect(stock[0]?.features).not.toEqual(stock[2]?.features);
  });
  it('has five spaces in the smallest depot', () => expect(DEPOT_PACKAGES[0]?.capacity).toBe(5));
  it('rejects bids without the required eligible fleet', () => expect(tenderDecision(300,360,0,1)).toBe(false));
  it('rejects bids above the simulated competitor threshold', () => expect(tenderDecision(360,360,1,1)).toBe(false));
  it('accepts a competitive eligible bid', () => expect(tenderDecision(300,360,1,1)).toBe(true));
  it('gives an unserved route one star', () => expect(passengerReview({number:'1',fare:2,frequency_mins:30},[]).rating).toBe(1));
  it('rewards frequent comfortable journeys with five stars', () => expect(passengerReview({number:'1',fare:2,frequency_mins:30},[{condition:85,features:['USB charging ports']}]).rating).toBe(5));
  it('adds depot rent even without services', () => expect(managementDay([],[],[],[35],1).profit).toBe(-35));
  it('cannot settle a half-hourly contract with only one bus',()=>expect(()=>managementDay([{id:'a',number:'T2',fare:0,frequency_mins:30,journey_minutes:20,contract_payment:680,contract_end_day:35}],[{route_id:'a',status:'In service',features:[],condition:85}],[],[],1)).toThrow('needs 2'));
  it('settles a half-hourly contract with two in-service buses',()=>expect(managementDay([{id:'a',number:'T2',fare:0,frequency_mins:30,journey_minutes:20,contract_payment:680,contract_end_day:35}],[{route_id:'a',status:'In service',features:[],condition:85},{route_id:'a',status:'In service',features:[],condition:85}],[{role:'Driver',route_id:'a',wage:140},{role:'Driver',route_id:'a',wage:140}],[],1).revenue).toBe(680));
  it('does not pay an expired contract', () => {
    const r = managementDay([{id:'a',number:'T1',fare:0,frequency_mins:120,contract_payment:360,contract_end_day:7}],[{route_id:'a',status:'In service',features:[],condition:85}],[],[],8);
    expect(r.revenue).toBe(0);
  });
});describe('passenger review variety', () => {
  it('changes wording across days without changing the rating', () => {
    const reviews = [1,2,3,4].map(day => passengerReview({number:'1',fare:2,frequency_mins:60},[{condition:85,features:[]}],day));
    expect(new Set(reviews.map(r => r.comment)).size).toBe(4);
    expect(new Set(reviews.map(r => r.rating))).toEqual(new Set([3]));
  });
});
import { REVIEW_BANK } from './review-bank';
import { bankReviewFor } from './local-reviews';
describe('uploaded review bank', () => {
  it('holds the 1,240 company reviews, 40 for each of the 31 companies', () => {
    const own = REVIEW_BANK.filter(r => r.companies?.length === 1 && !r.places);
    expect(own.length).toBe(1240);
    expect(own.filter(r => r.companies![0] === 'bvg').length).toBe(40);
  });
  it('drops old reviews naming places no company serves (Hitchin)', () => expect(REVIEW_BANK.some(r => r.mode === 'bus' && r.text.includes('Hitchin'))).toBe(false));
  it('gives a company only its own reviews', () => {
    const bvgTexts = new Set(REVIEW_BANK.filter(r => r.companies?.includes('bvg')).map(r => r.text));
    for (let s = 0; s < 30; s++) {
      const t = bankReviewFor('bus', 1 + (s % 5), { area: 'berlin', operator: 'BVG', presetKey: 'bvg', places: ['Alexanderplatz'], cur: '€' }, s)!;
      expect(bvgTexts.has(t.split(' — ')[0]!)).toBe(true);
    }
  });
  it('custom UK companies only get old reviews naming their own places', () => {
    for (let s = 0; s < 30; s++) {
      const t = bankReviewFor('bus', 1 + (s % 5), { area: 'herts', operator: 'Mine', presetKey: null, places: ['Watford', 'St Albans'], cur: '£' }, s);
      const r = REVIEW_BANK.find(x => t?.startsWith(x.text));
      if (r) expect(r.places!.every(p => ['Watford', 'St Albans'].includes(p))).toBe(true);
    }
  });
});
