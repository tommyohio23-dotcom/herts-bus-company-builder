import data from './area-presets.json';
import type { Preset } from './herts';
import { BUS_MODELS, HERTS_TOWNS, PRESETS } from './herts';
import { LONDON_PRESETS } from './london';
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

const LONDON_KEYS = LONDON_PRESETS.map(p => p.key);
/** Area of a saved company using the built-in London operator list. */
export const areaOf = (c: { preset_key: string | null; hq_town: string | null }) => companyArea(c, LONDON_KEYS);
const presetsIn = (a: AreaKey): Preset[] => a === 'herts' ? PRESETS.filter(p => !LONDON_KEYS.includes(p.key)) : a === 'london' ? LONDON_PRESETS : AREA_PRESETS[a];
/** Towns and depot sites a company in this area may use: area towns plus its operators' real depot names. */
export function areaTowns(a: AreaKey): string[] {
  return [...new Set([...AREA_TOWNS[a], ...presetsIn(a).flatMap(p => [p.hq, ...p.depots])])].filter(Boolean).sort((x, y) => x.localeCompare(y));
}
const WORLD_MODELS: Record<'boston' | 'nyc' | 'berlin', string[]> = {
  boston: ['New Flyer Xcelsior XDE40', 'New Flyer Xcelsior XDE60', 'New Flyer Xcelsior XE40 (battery electric)', 'New Flyer Xcelsior XE60 (battery electric)', 'Neoplan AN460LF (dual-mode)', 'Nova Bus LFS', 'MCI D4500 (coach)'],
  nyc: ['New Flyer Xcelsior XD40', 'New Flyer Xcelsior XD60', 'New Flyer Xcelsior XE40 (battery electric)', 'Nova Bus LFS', 'Nova Bus LFS Artic', 'Nova Bus LFSe+ (battery electric)', 'Orion VII Hybrid', 'Prevost X3-45 (express coach)', 'MCI D4500 (coach)'],
  berlin: ['ADL Enviro500 MMC', "MAN Lion's City Hybrid", "MAN Lion's City 12 E", 'Mercedes-Benz Citaro', 'Mercedes-Benz Citaro G (bendy)', 'Mercedes-Benz eCitaro', 'Solaris Urbino 12 electric', 'Solaris Urbino 18', 'Scania Citywide'],
};
const NON_UK = new Set(Object.values(WORLD_MODELS).flat().filter(m => !['ADL Enviro500 MMC', "MAN Lion's City Hybrid", 'Mercedes-Benz Citaro', 'Mercedes-Benz Citaro G (bendy)'].includes(m)));
/** Bus models sold in an area: city-specific lists abroad, British models at home. */
export function areaModels(a: AreaKey): string[] {
  return a === 'boston' || a === 'nyc' || a === 'berlin' ? WORLD_MODELS[a] : BUS_MODELS.filter(m => !NON_UK.has(m));
}
const isWorld = (a: AreaKey) => a === 'boston' || a === 'nyc' || a === 'berlin';
/** Used-market models for an area (British default stock unless abroad). */
export const areaMarketModels = (a: AreaKey) => isWorld(a) ? areaModels(a) : undefined;
/** Tender towns for areas outside the original Herts/London tender list. */
export const areaTenderTowns = (a: AreaKey) => a === 'herts' || a === 'london' ? undefined : AREA_TOWNS[a];
