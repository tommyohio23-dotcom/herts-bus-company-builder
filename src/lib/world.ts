import type { Preset } from './herts';

// Boston, New York and Berlin operators. Routes are well-known services listed from memory,
// not a live timetable feed. Fares are converted to pounds so all game money stays in £.
type R = [number: string, origin: string, destination: string, via: string, frequency: number];
type Raw = Omit<Preset, 'routes' | 'fleet' | 'photoKind'> & { photoKind: Preset['photoKind']; fare: number; routes: R[]; models: [string, number][] };
const make = (p: Raw): Preset => ({
  key: p.key, name: p.name, short: p.short, primary: p.primary, secondary: p.secondary, livery: p.livery, hq: p.hq, depots: p.depots, photoKind: p.photoKind,
  routes: p.routes.map(([number, origin, destination, via, frequency]) => ({ number, origin, destination, via, frequency, fare: p.fare })),
  fleet: p.models.map(([model, year], i) => ({ fleet_no: `${p.short}-${i + 1} (game)`, registration: '', model, year })),
});

export const WORLD_PRESETS: Record<'boston' | 'nyc' | 'berlin', Preset[]> = {
  boston: [make({
    key: 'mbta', name: 'MBTA Bus', short: 'MBTA', primary: '#ffc72c', secondary: '#80276c', livery: 'MBTA yellow & silver', hq: 'Boston', photoKind: 'single', fare: 1.4,
    depots: ['Cabot (South Boston)', 'Charlestown', 'Arborway', 'Quincy', 'Lynn', 'North Cambridge'],
    routes: [
      ['1', 'Harvard Square', 'Nubian Station', 'Massachusetts Avenue', 10],
      ['23', 'Ashmont Station', 'Ruggles Station', 'Washington Street', 8],
      ['28', 'Mattapan Station', 'Ruggles Station', 'Blue Hill Avenue', 8],
      ['32', 'Wolcott Square', 'Forest Hills Station', 'Hyde Park Avenue', 10],
      ['39', 'Forest Hills Station', 'Back Bay Station', 'Huntington Avenue', 10],
      ['57', 'Watertown Yard', 'Kenmore Station', 'Brighton', 12],
      ['66', 'Harvard Square', 'Nubian Station', 'Brookline', 12],
      ['77', 'Arlington Heights', 'Harvard Square', 'Massachusetts Avenue', 10],
      ['111', 'Woodlawn', 'Haymarket Station', 'Chelsea, Tobin Bridge', 8],
      ['116', 'Wonderland Station', 'Maverick Station', 'Revere', 12],
      ['SL4', 'Nubian Station', 'South Station', 'Washington Street', 10],
      ['SL5', 'Nubian Station', 'Downtown Crossing', 'Washington Street', 10],
    ],
    models: [['New Flyer Xcelsior XDE40', 2016], ['New Flyer Xcelsior XDE60', 2018], ['New Flyer Xcelsior XDE40', 2019], ['New Flyer Xcelsior XDE40', 2022]],
  })],
  nyc: [make({
    key: 'mta-nyct', name: 'MTA New York City Transit', short: 'NYCT', primary: '#0039a6', secondary: '#f2f2f2', livery: 'MTA blue & white', hq: 'Manhattan', photoKind: 'single', fare: 2.3,
    depots: ['Michael J. Quill (Manhattan)', 'Kingsbridge (Bronx)', 'Flatbush (Brooklyn)', 'Jackie Gleason (Brooklyn)', 'Casey Stengel (Queens)'],
    routes: [
      ['M15', 'South Ferry', 'East Harlem', '1st & 2nd Avenues', 8],
      ['M14A', 'Lower East Side', 'Chelsea Piers', '14th Street', 8],
      ['M86', 'East 86th Street', 'West 86th Street', 'Central Park crosstown', 8],
      ['M60', 'West Harlem', 'LaGuardia Airport', '125th Street, Astoria', 10],
      ['Bx12', 'Inwood', 'Bay Plaza', 'Fordham Road', 8],
      ['Bx19', 'Riverbank State Park', 'New York Botanical Garden', '145th Street, Southern Boulevard', 10],
      ['B41', 'Downtown Brooklyn', 'Kings Plaza', 'Flatbush Avenue', 8],
      ['B44', 'Williamsburg Bridge Plaza', 'Sheepshead Bay', 'Nostrand Avenue', 8],
      ['B46', 'Williamsburg', 'Kings Plaza', 'Utica Avenue', 8],
      ['Q44', 'Jamaica', 'West Farms (Bronx)', 'Flushing, Whitestone Bridge', 10],
      ['Q58', 'Ridgewood', 'Flushing', 'Corona Avenue', 10],
    ],
    models: [['New Flyer Xcelsior XD40', 2016], ['Nova Bus LFS', 2011], ['New Flyer Xcelsior XD40', 2018], ['Nova Bus LFS', 2019]],
  }), make({
    key: 'mta-bus', name: 'MTA Bus Company', short: 'MTABC', primary: '#0039a6', secondary: '#f2a900', livery: 'MTA select-bus blue', hq: 'Queens', photoKind: 'single', fare: 2.3,
    depots: ['LaGuardia (Queens)', 'JFK (Queens)', 'Baisley Park (Queens)', 'College Point (Queens)', 'Eastchester (Bronx)'],
    routes: [
      ['Q10', 'Kew Gardens', 'JFK Airport', 'Lefferts Boulevard', 10],
      ['Q53', 'Woodside', 'Rockaway Park', 'Woodhaven Boulevard', 10],
      ['Q52', 'Elmhurst', 'Arverne', 'Woodhaven Boulevard', 12],
      ['Q60', 'Jamaica', 'East Midtown Manhattan', 'Queens Boulevard', 10],
      ['Q70', 'Woodside', 'LaGuardia Airport', 'LaGuardia Link', 10],
      ['BxM1', 'Riverdale', 'Midtown Manhattan', 'Express via Madison Avenue', 20],
    ],
    models: [['Nova Bus LFS', 2015], ['New Flyer Xcelsior XD40', 2017], ['Nova Bus LFS', 2020]],
  })],
  berlin: [make({
    key: 'bvg', name: 'BVG (Berliner Verkehrsbetriebe)', short: 'BVG', primary: '#f0d722', secondary: '#1d1d1b', livery: 'BVG yellow', hq: 'Mitte', photoKind: 'double', fare: 3,
    depots: ['Britz', 'Cicerostraße', 'Indira-Gandhi-Straße', 'Lichtenberg', 'Müllerstraße', 'Spandau'],
    routes: [
      ['100', 'Zoologischer Garten', 'Alexanderplatz', 'Unter den Linden, Brandenburger Tor', 8],
      ['200', 'Zoologischer Garten', 'Michelangelostraße', 'Potsdamer Platz, Alexanderplatz', 8],
      ['M19', 'Grunewald', 'Mehringdamm', 'Kurfürstendamm', 8],
      ['M29', 'Roseneck', 'Hermannplatz', 'Kurfürstendamm, Checkpoint Charlie', 8],
      ['M41', 'Hauptbahnhof', 'Baumschulenstraße', 'Potsdamer Platz, Hermannplatz', 8],
      ['M48', 'Zehlendorf', 'Alexanderplatz', 'Steglitz, Potsdamer Platz', 10],
      ['M85', 'Hauptbahnhof', 'Lichterfelde Süd', 'Potsdamer Platz, Steglitz', 10],
      ['X7', 'Rudow', 'Flughafen BER', 'Schönefeld', 10],
      ['X10', 'Zoologischer Garten', 'Teltow', 'Kurfürstendamm, Zehlendorf', 10],
    ],
    models: [['ADL Enviro500 MMC', 2017], ["MAN Lion's City Hybrid", 2019], ['ADL Enviro500 MMC', 2021], ["MAN Lion's City Hybrid", 2023]],
  })],
};
