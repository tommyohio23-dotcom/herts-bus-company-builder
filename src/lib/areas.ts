import data from './area-presets.json';
import type { Preset } from './herts';
import { HERTS_TOWNS } from './herts';
import { WORLD_PRESETS } from './world';

export const AREAS = [
  { key: 'herts', label: 'Hertfordshire' },
  { key: 'london', label: 'North London' },
  { key: 'beds', label: 'Bedfordshire' },
  { key: 'bucks', label: 'Buckinghamshire' },
  { key: 'essex', label: 'Essex' },
  { key: 'boston', label: 'Boston' },
  { key: 'nyc', label: 'New York' },
  { key: 'berlin', label: 'Berlin' },
] as const;
export type AreaKey = (typeof AREAS)[number]['key'];
type OtherArea = Exclude<AreaKey, 'herts' | 'london'>;
const OTHER: OtherArea[] = ['beds', 'bucks', 'essex', 'boston', 'nyc', 'berlin'];

type Raw = Omit<Preset, 'photoKind' | 'fleet'>;
const build = (list: Raw[]): Preset[] => list.map(p => ({
  ...p, photoKind: 'single',
  fleet: p.routes.slice(0, 4).map((_, i) => ({ fleet_no: `${p.short}-${i + 1} (game)`, registration: '', model: i % 2 ? 'ADL Enviro400' : 'ADL Enviro200', year: 2015 + i })),
}));
const raw = data as unknown as Record<'beds' | 'bucks' | 'essex', Raw[]>;
export const AREA_PRESETS: Record<OtherArea, Preset[]> = {
  beds: build(raw.beds), bucks: build(raw.bucks), essex: build(raw.essex), ...WORLD_PRESETS,
};
export const AREA_TOWNS: Record<AreaKey, string[]> = {
  herts: HERTS_TOWNS,
  london: ['Barnet', 'New Barnet', 'Finchley', 'Wood Green', 'Enfield', 'Edmonton', 'Tottenham', 'Southgate', 'Edgware', 'Borehamwood', 'Muswell Hill', 'Hornsey'],
  beds: ['Luton', 'Bedford', 'Dunstable', 'Leighton Buzzard', 'Biggleswade', 'Ampthill', 'Flitwick', 'Sandy', 'Houghton Regis'],
  bucks: ['Aylesbury', 'High Wycombe', 'Milton Keynes', 'Amersham', 'Chesham', 'Buckingham', 'Marlow', 'Beaconsfield', 'Princes Risborough'],
  essex: ['Chelmsford', 'Colchester', 'Harlow', 'Basildon', 'Southend-on-Sea', 'Brentwood', 'Braintree', 'Epping', 'Clacton-on-Sea'],
  boston: ['Boston', 'Cambridge', 'Somerville', 'Brookline', 'Roxbury', 'Dorchester', 'Jamaica Plain', 'Charlestown', 'Chelsea', 'Revere', 'Quincy', 'Watertown'],
  nyc: ['Manhattan', 'Bronx', 'Brooklyn', 'Queens', 'Harlem', 'Flushing', 'Jamaica', 'Williamsburg', 'Astoria', 'Midtown'],
  berlin: ['Mitte', 'Charlottenburg', 'Kreuzberg', 'Friedrichshain', 'Neukölln', 'Spandau', 'Steglitz', 'Lichtenberg', 'Pankow', 'Tempelhof', 'Schöneberg', 'Wedding'],
};
/** Which area menu a saved company belongs to: by its operator, else its head-office town. */
export function companyArea(c: { preset_key: string | null; hq_town: string | null }, londonKeys: string[]): AreaKey {
  for (const a of OTHER) if (AREA_PRESETS[a].some(p => p.key === c.preset_key)) return a;
  if (c.preset_key && londonKeys.includes(c.preset_key)) return 'london';
  for (const a of ['london', ...OTHER] as const) if (c.hq_town && AREA_TOWNS[a].includes(c.hq_town)) return a;
  return 'herts';
}
