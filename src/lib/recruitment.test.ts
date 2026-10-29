import { describe,expect,it } from 'vitest';
import { generateApplicants,offerAccepted } from './recruitment';
describe('application recruitment',()=>{
  it('provides twelve distinct applicants for each advert',()=>{const a=generateApplicants('Driver',140,1);expect(a).toHaveLength(12);expect(new Set(a.map(x=>x.name)).size).toBe(12);expect(new Set(a.map(x=>x.portrait_index)).size).toBe(12);});
  it('varies experience, skills, availability and expected wage',()=>{const a=generateApplicants('Driver',140,1);expect(new Set(a.map(x=>x.experience_years)).size).toBeGreaterThan(4);expect(new Set(a.map(x=>x.statement)).size).toBeGreaterThan(4);expect(new Set(a.map(x=>x.expected_wage)).size).toBe(5);});
  it('gives driver applicants driving qualifications',()=>expect(generateApplicants('Driver',140,1).every(a=>a.qualifications.includes('Category D licence'))).toBe(true));
  it('gives engineer applicants maintenance qualifications',()=>expect(generateApplicants('Engineer',170,1)[0]?.qualifications).toContain('Vehicle maintenance Level 3'));
  it('declines an offer below expected wage',()=>expect(offerAccepted(140,147)).toBe(false));
  it('accepts an offer meeting expected wage',()=>expect(offerAccepted(140,140)).toBe(true));
});