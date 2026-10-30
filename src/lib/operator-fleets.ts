import type { Preset } from './herts';

/** [model, build year, how many] — bus types each operator is known to run; game fleet numbers, no real registrations. */
type Mix = [string, number, number][];
const CAROUSEL: Mix = [['ADL Enviro200 MMC', 2019, 3], ['ADL Enviro400 MMC', 2018, 3], ['Volvo B9TL / Wright Gemini 2', 2012, 2]];
const REDLINE: Mix = [['Dennis Dart SLF / Plaxton Pointer', 2005, 3], ['ADL Enviro200', 2014, 3], ['Volvo B7TL / Wright Eclipse Gemini', 2004, 2]];
export const OPERATOR_FLEETS: Record<string, Mix> = {
  'arriva-shires': [['VDL SB200 / Wright Pulsar 2', 2010, 3], ['ADL Enviro400', 2008, 3], ['Wright StreetLite', 2015, 3], ['Mercedes-Benz Citaro', 2012, 2], ['ADL Enviro200 MMC', 2019, 2]],
  uno: [['ADL Enviro400 MMC', 2017, 4], ['Optare Solo SR', 2014, 3], ['Volvo B9TL / Wright Gemini 2', 2011, 3], ['ADL Enviro200 MMC', 2018, 3]],
  centrebus: [['ADL Enviro200', 2012, 3], ['Optare Solo', 2010, 3], ['Optare Versa', 2013, 2]],
  trustybus: [['Dennis Dart / Caetano Nimbus', 2006, 2], ['Dennis Dart SLF / Plaxton Pointer', 2007, 2], ['Optare Solo', 2011, 2], ['ADL Enviro200', 2014, 2]],
  carousel: CAROUSEL,
  'carousel-bucks': CAROUSEL,
  'red-rose': [['Dennis Dart SLF / Plaxton Pointer', 2006, 2], ['Optare Solo', 2010, 2], ['ADL Enviro200', 2015, 2]],
  'red-eagle': [['Dennis Dart SLF / Plaxton Pointer', 2006, 3], ['ADL Enviro200', 2013, 2], ['Volvo B7TL / Wright Eclipse Gemini', 2004, 2]],
  redline: REDLINE,
  'redline-bucks': REDLINE,
  sullivan: [['ADL Enviro400', 2010, 4], ['ADL Enviro200', 2013, 3], ['Dennis Trident / ADL ALX400', 2005, 2], ['Volvo B9TL / Wright Gemini 2', 2012, 3]],
  'arriva-london': [['Volvo B5LH / Wright Gemini 3', 2015, 4], ['ADL Enviro400 MMC', 2018, 3], ['New Routemaster', 2014, 3], ['ADL Enviro200 MMC', 2019, 2]],
  metroline: [['Volvo B5LH / Wright Gemini 3', 2016, 4], ['New Routemaster', 2015, 3], ['ADL Enviro400 MMC', 2018, 3], ['BYD / ADL Enviro200EV', 2020, 2], ['Wright StreetDeck Electroliner', 2022, 2]],
  'go-ahead-london': [['ADL Enviro400 MMC', 2017, 4], ['ADL Enviro400EV', 2021, 3], ['BYD / ADL Enviro200EV', 2019, 3], ['New Routemaster', 2014, 2], ['Volvo B5LH / Wright Gemini 3', 2015, 2]],
  'first-london': [['ADL Enviro400 MMC', 2018, 4], ['Volvo B5LH / Wright Gemini 3', 2016, 3], ['BYD / ADL Enviro200EV', 2020, 2], ['Wright StreetDeck Electroliner', 2023, 3]],
  'stagecoach-london': [['ADL Enviro400 MMC', 2017, 4], ['ADL Enviro400EV', 2021, 3], ['New Routemaster', 2015, 2], ['ADL Enviro200 MMC', 2018, 3]],
  'london-united': [['Volvo B5LH / Wright Gemini 3', 2016, 4], ['New Routemaster', 2015, 3], ['BYD / ADL Enviro200EV', 2019, 3], ['ADL Enviro400', 2012, 2]],
  'transport-uk-london': [['ADL Enviro400 MMC', 2017, 3], ['ADL Enviro400EV', 2021, 3], ['BYD / ADL Enviro200EV', 2019, 2], ['Wright StreetDeck Electroliner', 2023, 2]],
  'london-general': [['New Routemaster', 2014, 4], ['ADL Enviro400 MMC', 2017, 3], ['ADL Enviro400EV', 2021, 3], ['BYD / ADL Enviro200EV', 2019, 2]],
  'uno-london': [['ADL Enviro200 MMC', 2018, 3], ['Optare Solo SR', 2015, 2]],
  'london-sovereign': [['ADL Enviro200', 2014, 3], ['ADL Enviro400', 2013, 3]],
  'arriva-beds': [['Wright StreetLite', 2015, 3], ['VDL SB200 / Wright Pulsar 2', 2010, 3], ['ADL Enviro400', 2009, 2], ['ADL Enviro200 MMC', 2019, 2]],
  'stagecoach-beds': [['ADL Enviro400 MMC', 2018, 3], ['ADL Enviro200 MMC', 2017, 3], ['Scania N230UD / ADL Enviro400', 2012, 2], ['ADL Enviro300', 2010, 2]],
  'grant-palmer-beds': [['ADL Enviro200', 2014, 3], ['ADL Enviro400', 2011, 2], ['Dennis Dart SLF / Plaxton Pointer', 2006, 2], ['ADL Enviro200 MMC', 2019, 2]],
  'arriva-bucks': [['Wright StreetLite', 2016, 3], ['ADL Enviro200 MMC', 2019, 3], ['Mercedes-Benz Citaro', 2012, 2], ['VDL SB200 / Wright Pulsar 2', 2010, 2]],
  'first-essex': [['Wright StreetDeck', 2017, 4], ['Wright StreetLite', 2015, 3], ['Volvo B9TL / Wright Gemini 2', 2011, 3], ['ADL Enviro400 MMC', 2019, 2]],
  'arriva-essex': [['ADL Enviro200 MMC', 2018, 3], ['ADL Enviro400', 2010, 3], ['Wright StreetLite', 2015, 2], ['Volvo B9TL / Wright Gemini 2', 2012, 2]],
  'stephensons-essex': [['ADL Enviro200 MMC', 2019, 4], ['ADL Enviro400', 2012, 2], ['Volvo Olympian', 1998, 2], ['Optare Solo', 2011, 2]],
};

/** Starting fleet: the operator's real model mix (never smaller than the preset), limited to 15 buses per starter depot. */
export function starterFleet(p: Preset): Preset['fleet'] {
  const mix = OPERATOR_FLEETS[p.key];
  if (!mix) return p.fleet;
  const fleet = mix.flatMap(([model, year, n]) => Array.from({ length: n }, (_, i) => ({ model, year: year + (i % 3) })))
    .map((b, i) => ({ fleet_no: `${p.short}-${i + 1} (game)`, registration: '', ...b }));
  const room = 15 * Math.max(1, p.depots.length);
  return (fleet.length >= p.fleet.length ? fleet : p.fleet).slice(0, room);
}
