import data from './area-presets.json';
import type { Preset } from './herts';
import { HERTS_TOWNS } from './herts';

export const AREAS = [
  { key: 'herts', label: 'Hertfordshire' },
  { key: 'london', label: 'North London' },
  { key: 'beds', label: 'Bedfordshire' },
  { key: 'bucks', label: 'Buckinghamshire' },
  { key: 'essex', label: 'Essex' },
] as const;
export type AreaKey = (typeof AREAS)[number]['key'];

type Raw = Omit<Preset, 'photoKind' | 'fleet'>;
const build = (_area: AreaKey, list: Raw[]): Preset[] => list.map(p => ({
  ...p, photoKind: 'single',
  fleet: p.routes.slice(0, 4).map((_, i) => ({ fleet_no: `${p.short}-${i + 1} (game)`, registration: '', model: i % 2 ? 'ADL Enviro400' : 'ADL Enviro200', year: 2015 + i })),
}));
export const AREA_PRESETS: Record<'beds' | 'bucks' | 'essex', Preset[]> = {
  beds: build('beds', (data as unknown as Record<"beds"|"bucks"|"essex", Raw[]>).beds),
  bucks: build('bucks', (data as unknown as Record<"beds"|"bucks"|"essex", Raw[]>).bucks),
  essex: build('essex', (data as unknown as Record<"beds"|"bucks"|"essex", Raw[]>).essex),
};
export const AREA_TOWNS: Record<AreaKey, string[]> = {
  herts: HERTS_TOWNS,
  london: ['Barnet', 'New Barnet', 'Finchley', 'Wood Green', 'Enfield', 'Edmonton', 'Tottenham', 'Southgate', 'Edgware', 'Borehamwood', 'Muswell Hill', 'Hornsey'],
  beds: ['Luton', 'Bedford', 'Dunstable', 'Leighton Buzzard', 'Biggleswade', 'Ampthill', 'Flitwick', 'Sandy', 'Houghton Regis'],
  bucks: ['Aylesbury', 'High Wycombe', 'Milton Keynes', 'Amersham', 'Chesham', 'Buckingham', 'Marlow', 'Beaconsfield', 'Princes Risborough'],
  essex: ['Chelmsford', 'Colchester', 'Harlow', 'Basildon', 'Southend-on-Sea', 'Brentwood', 'Braintree', 'Epping', 'Clacton-on-Sea'],
};
/** Which area menu a saved company belongs to: by its operator, else its head-office town. */
export function companyArea(c: { preset_key: string | null; hq_town: string | null }, londonKeys: string[]): AreaKey {
  for (const a of ['beds', 'bucks', 'essex'] as const) if (AREA_PRESETS[a].some(p => p.key === c.preset_key)) return a;
  if (c.preset_key && londonKeys.includes(c.preset_key)) return 'london';
  for (const a of ['london', 'beds', 'bucks', 'essex'] as const) if (c.hq_town && AREA_TOWNS[a].includes(c.hq_town)) return a;
  return 'herts';
}
