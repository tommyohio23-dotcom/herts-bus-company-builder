import {describe,it,expect} from 'vitest';
import {requiredBuses,assertFleetCoverage} from './service-frequency';
describe('fleet frequency rules',()=>{
 it('requires two buses for a half-hourly service',()=>expect(requiredBuses(30)).toBe(2));
 it('rejects one bus operating every 30 minutes',()=>expect(()=>assertFleetCoverage([{id:'a',frequency_mins:30}],[{route_id:'a',status:'In service'}])).toThrow('needs 2'));
 it('allows one bus when changed to 60 minutes',()=>expect(()=>assertFleetCoverage([{id:'a',frequency_mins:60}],[{route_id:'a',status:'In service'}])).not.toThrow());
 it('does not count a workshop bus',()=>expect(()=>assertFleetCoverage([{id:'a',frequency_mins:30}],[{route_id:'a',status:'In service'},{route_id:'a',status:'Workshop'}])).toThrow());
 it('allows planned routes without in-service buses',()=>expect(()=>assertFleetCoverage([{id:'a',frequency_mins:30}],[])).not.toThrow());
 it('requires three buses at twenty minutes',()=>expect(requiredBuses(20)).toBe(3));
});