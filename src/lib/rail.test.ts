import { describe,it,expect } from 'vitest';
import { initialRailState,applyRailAction,validateTimetable,railMarket,type RailService } from './rail';
const service:RailService={id:'1',name:'GN1',calls:[{station:'New Barnet',arrival:'09:00',departure:'09:02',platform:'1'},{station:'Hatfield',arrival:'09:20',departure:'09:22',platform:'2'}],trainId:'starter-717',driverId:'',fare:8,returnMinutes:15};
describe('separate Great Northern management',()=>{
 it('starts with its own train fleet and finances',()=>{expect(initialRailState().balance).toBe(3000000);expect(initialRailState().trains[0]?.model).toBe('Class 717');});
 it('offers multiple years of each train model',()=>expect(new Set(railMarket(1).filter(t=>t.model==='Class 717').map(t=>t.year)).size).toBe(3));
 it('rejects backward station times',()=>expect(()=>validateTimetable({...service,calls:[...service.calls].reverse()},[])).toThrow());
 it('requires station platforms',()=>expect(()=>validateTimetable({...service,calls:service.calls.map(c=>({...c,platform:''}))},[])).toThrow());
 it('prevents overlapping train turnaround assignments',()=>expect(()=>validateTimetable({...service,id:'2'},[service])).toThrow('Train or driver'));
 it('prevents platform conflicts across different trains',()=>expect(()=>validateTimetable({...service,id:'2',trainId:'other'},[service])).toThrow('Platform occupied'));
 it('charges train installation and daily upkeep',()=>{const s=applyRailAction(initialRailState(),{kind:'upgrade',key:'starter-717',features:['USB charging ports']});expect(s.balance).toBe(2995200);expect(applyRailAction(s,{kind:'day'}).reports[0]?.costs).toBe(658);});
 it('generates rail-qualified applicants and hires once',()=>{let s=applyRailAction(initialRailState(),{kind:'advert',role:'Train Driver',wage:260,positions:1,depot:'Hornsey'});const a=s.applicants[0];expect(a?.qualifications).toContain('Train driving licence');if(!a)throw new Error('Missing applicant');s=applyRailAction(s,{kind:'review',key:a.id,decision:'offer'});expect(s.staff.length).toBe(1);expect(()=>applyRailAction(s,{kind:'review',key:a.id,decision:'offer'})).toThrow();});
});