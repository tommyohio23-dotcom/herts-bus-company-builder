import {it,expect} from 'vitest';
import {NEW_BARNET_ROUTES,BUS_OPERATOR_PRESETS} from './london';
it('includes all seven listed New Barnet Station Road routes',()=>expect(NEW_BARNET_ROUTES.map(r=>r.number)).toEqual(['107','184','307','326','383','384','626']));
it('puts route 307 under Arriva London, not Arriva the Shires or TfL',()=>{expect(BUS_OPERATOR_PRESETS.find(p=>p.key==='arriva-london')?.routes.some(r=>r.number==='307')).toBe(true);expect(BUS_OPERATOR_PRESETS.find(p=>p.key==='arriva-shires')?.routes.some(r=>r.number==='307')).toBe(false);});
it('puts 383 under Uno',()=>expect(BUS_OPERATOR_PRESETS.find(p=>p.key==='uno')?.routes.some(r=>r.number==='383')).toBe(true));