import {describe,it,expect} from 'vitest';
import {requiredBuses,assertFleetCoverage,timetableCycle,assertDriverCoverage} from './service-frequency';
describe('fleet frequency rules',()=>{
 it('requires two buses for a half-hourly service',()=>expect(requiredBuses(30)).toBe(2));
 it('rejects one bus operating every 30 minutes',()=>expect(()=>assertFleetCoverage([{id:'a',frequency_mins:30,journey_minutes:20}],[{route_id:'a',status:'In service'}])).toThrow('needs 2'));
 it('allows one bus when changed to 60 minutes',()=>expect(()=>assertFleetCoverage([{id:'a',frequency_mins:60,journey_minutes:20}],[{route_id:'a',status:'In service'}])).not.toThrow());
 it('does not count a workshop bus',()=>expect(()=>assertFleetCoverage([{id:'a',frequency_mins:30,journey_minutes:20}],[{route_id:'a',status:'In service'},{route_id:'a',status:'Workshop'}])).toThrow());
 it('allows planned routes without in-service buses',()=>expect(()=>assertFleetCoverage([{id:'a',frequency_mins:30,journey_minutes:20}],[])).not.toThrow());
 it('requires three buses at twenty minutes',()=>expect(requiredBuses(20)).toBe(3));
});
describe('journey and staffing requirements',()=>{
 it('includes both terminals and recovery for an hour-long journey',()=>expect(timetableCycle({journey_minutes:60,turnaround_minutes:5,recovery_percent:10})).toBe(142));
 it('requires five buses every thirty minutes for that 142-minute cycle',()=>expect(requiredBuses(30,142)).toBe(5));
 it('rejects an operating route without assigned drivers',()=>expect(()=>assertDriverCoverage([{id:'a'}],[{route_id:'a',status:'In service'}],[])).toThrow('needs 1 assigned drivers'));
 it('does not count staff assigned to another route',()=>expect(()=>assertDriverCoverage([{id:'a'}],[{route_id:'a',status:'In service'}],[{route_id:'b',role:'Driver'}])).toThrow());
});
