export const HERTS_TOWNS = [
  "Baldock", "Berkhamsted", "Bishop's Stortford", "Borehamwood", "Broxbourne", "Buntingford",
  "Bushey", "Cheshunt", "Harpenden", "Hatfield", "Hemel Hempstead", "Hertford", "Hitchin",
  "Hoddesdon", "Kings Langley", "Knebworth", "Letchworth", "London Colney", "Potters Bar",
  "Radlett", "Redbourn", "Rickmansworth", "Royston", "Sawbridgeworth", "St Albans", "Stevenage",
  "Tring", "Ware", "Waltham Cross", "Watford", "Welwyn", "Welwyn Garden City", "Abbots Langley",
  "Croxley Green", "Chorleywood", "Sandridge", "Wheathampstead", "Codicote", "Much Hadham",
  "Ashwell", "Bovingdon", "Brookmans Park", "Bricket Wood", "Cuffley", "Elstree", "Garston",
  "Goffs Oak", "Great Amwell", "Hertford Heath", "Hunsdon", "Kimpton", "Leverstock Green",
  "Markyate", "Northchurch", "Oxhey", "Park Street", "Puckeridge", "Sarratt", "Shenley",
  "South Mimms", "Stanstead Abbotts", "Standon", "Stotfold", "Tewin", "Walkern", "Watton-at-Stone",
  "Weston", "Wormley", "Hemel Maylands", "Hatfield Business Park", "Lister Hospital",
  "Watford General Hospital", "University of Hertfordshire", "Luton Airport", "Harlow", "Luton",
  "Enfield", "Barnet", "Aylesbury", "Heathrow Airport", "Stansted Airport", "Cambridge",
  "Wood Green", "Finchley", "New Barnet", "New Barnet Station Road", "Cockfosters", "Oakwood", "Edgware", "Brimsdown", "Turnpike Lane", "Palmers Green", "Winchmore Hill", "Gordon Hill", "Totteridge", "Whetstone", "Brent Cross",
].sort();

export const FEATURES = [
  "USB charging ports", "Wireless phone charging", "Leather seats", "E-leather seats", "Free Wi-Fi",
  "Air conditioning", "Next-stop audio/visual", "Wheelchair space", "Buggy area", "CCTV",
  "Contactless ticket machine", "Tables", "Panoramic glass roof", "Coach seats", "Reading lights",
  "Euro VI engine", "Battery electric", "Hybrid", "Stop-start engine", "Heritage interior",
];

export const STAFF_ROLES: Record<string, number> = {
  Driver: 140, "Senior Driver": 160, Engineer: 170, Cleaner: 95, Controller: 165,
  "Depot Manager": 230, "Ticket Inspector": 120, "Driver Trainer": 180,
};

export type PhotoKind = "double" | "single" | "mini" | "electric";
export function modelKind(model: string): PhotoKind {
  const m = model.toLowerCase();
  if (/ev|electric|yutong|byd|switch/.test(m)) return "electric";
  if (/solo|sprinter|tempo|versa/.test(m)) return "mini";
  if (/400|500|olympian|gemini|streetdeck|b5lh|b9tl|b7tl|n230ud|omnicity|atlantean|bristol vr|trident|routemaster|titan|metrobus|dominator/.test(m)) return "double";
  return "single";
}

export const BUS_MODELS = [
  "ADL Enviro200",
  "ADL Enviro200 MMC",
  "ADL Enviro300",
  "ADL Enviro400",
  "ADL Enviro400 MMC",
  "ADL Enviro400EV",
  "ADL Enviro500 MMC",
  "BYD / ADL Enviro200EV",
  "Bristol VR",
  "Dennis Dart / Caetano Nimbus",
  "Dennis Dart SLF / Plaxton Pointer",
  "Dennis Dominator",
  "Dennis Trident / ADL ALX400",
  "Dennis Trident / Plaxton President",
  "Leyland Atlantean",
  "Leyland Lynx",
  "Leyland National",
  "Leyland Olympian / ECW",
  "Leyland Titan",
  "MAN EcoCity / Caetano",
  "MCW Metrobus",
  "Mercedes-Benz Citaro",
  "Mercedes-Benz Citaro G (bendy)",
  "Mercedes-Benz Sprinter",
  "MAN Lion's City Hybrid",
  "New Flyer Xcelsior XD40",
  "New Flyer Xcelsior XDE40",
  "New Flyer Xcelsior XDE60",
  "Nova Bus LFS",
  "New Routemaster",
  "Optare Excel",
  "Optare MetroCity",
  "Optare Solo",
  "Optare Solo SR",
  "Optare Tempo",
  "Optare Versa",
  "Routemaster (AEC)",
  "Scania N230UD / ADL Enviro400",
  "Scania OmniCity",
  "Switch Metrocity EV",
  "VDL SB200 / Wright Pulsar 2",
  "Volvo B10BLE / Wright Renown",
  "Volvo B5LH / Wright Gemini 3",
  "Volvo B7TL / Wright Eclipse Gemini",
  "Volvo B8RLE / MCV Evora",
  "Volvo B9TL / Wright Gemini 2",
  "Volvo Olympian",
  "Wright Eclipse Urban",
  "Wright GB Kite",
  "Wright StreetDeck",
  "Wright StreetDeck Electroliner",
  "Wright StreetLite",
  "Yutong E10"
];

export const STATUSES = ["In service", "Spare", "Workshop", "MOT due", "Withdrawn", "Preserved"];

export type Preset = {
  key: string;
  photoKind: PhotoKind;
  name: string;
  short: string;
  primary: string;
  secondary: string;
  livery: string;
  hq: string;
  depots: string[];
  routes: { number: string; origin: string; destination: string; via: string; frequency: number; fare: number }[];
  fleet: { fleet_no: string; registration: string; model: string; year: number }[];
};

// Liveries approximated from operator colour schemes; not official brand files.
export const PRESETS: Preset[] = [
  {
    key: "arriva-shires", photoKind: "single", name: "Arriva the Shires", short: "Arriva", primary: "#00a3ad", secondary: "#e8e2cf",
    livery: "Aquamarine & cotswold stone", hq: "Luton (Herts depots)",
    depots: ["Hemel Hempstead", "Watford", "Stevenage", "Hitchin", "Ware"],
    routes: [
      { number: "2", origin: "Woodhall Farm", destination: "Bennetts End", via: "Hemel Hempstead", frequency: 20, fare: 2 },
      { number: "3", origin: "Grovehill", destination: "Chaulden", via: "Hemel Hempstead", frequency: 20, fare: 2 },
      { number: "4", origin: "Grovehill", destination: "Chaulden", via: "Hemel Hempstead", frequency: 20, fare: 2 },
      { number: "300", origin: "Stevenage", destination: "Hemel Hempstead", via: "Welwyn GC, Hatfield, St Albans", frequency: 30, fare: 3 },
      { number: "301", origin: "Stevenage", destination: "Hemel Hempstead", via: "Welwyn GC, Hatfield, St Albans", frequency: 30, fare: 3 },
      { number: "320", origin: "Watford", destination: "Hemel Hempstead", via: "Kings Langley", frequency: 20, fare: 3 },
      { number: "321", origin: "Watford", destination: "Luton", via: "St Albans, Harpenden", frequency: 30, fare: 3 },
      { number: "724", origin: "Harlow", destination: "Heathrow Airport", via: "Hertford, Welwyn GC, Hatfield, St Albans, Watford", frequency: 60, fare: 3 },
      { number: "509", origin: "Harlow", destination: "Bishop's Stortford", via: "Sawbridgeworth", frequency: 30, fare: 3 },
      { number: "510", origin: "Harlow", destination: "Stansted Airport", via: "Sawbridgeworth, Bishop's Stortford", frequency: 30, fare: 3 },
    ],
    fleet: [
      { fleet_no: "3131", registration: "YX63 LKE", model: "VDL SB200 / Wright Pulsar 2", year: 2013 },
      { fleet_no: "5452", registration: "KX61 LDL", model: "ADL Enviro400", year: 2011 },
      { fleet_no: "2477", registration: "KE04 CZO", model: "Dennis Dart SLF / Plaxton Pointer", year: 2004 },
      { fleet_no: "4417", registration: "KX17 DCZ", model: "Wright StreetLite", year: 2017 },
    ],
  },
  {
    key: "uno", photoKind: "double", name: "Uno", short: "Uno", primary: "#5b2a86", secondary: "#9bc53d",
    livery: "Purple & lime green", hq: "Hatfield",
    depots: ["Hatfield", "Borehamwood"],
    routes: [
      { number: "243", origin: "Potters Bar", destination: "Waltham Cross", via: "", frequency: 60, fare: 2 },
      { number: "341", origin: "Hatfield", destination: "Broxbourne", via: "Hertford", frequency: 60, fare: 3 },
      { number: "641", origin: "Hatfield", destination: "Broxbourne", via: "Hertford", frequency: 60, fare: 3 },
      { number: "602", origin: "Hatfield", destination: "Watford", via: "St Albans, London Colney, Shenley", frequency: 20, fare: 3 },
      { number: "610", origin: "Hatfield", destination: "Luton", via: "", frequency: 30, fare: 3 },
      { number: "612", origin: "Hatfield", destination: "Luton", via: "Oaklands College", frequency: 60, fare: 3 },
      { number: "614", origin: "Hatfield", destination: "Queensbury", via: "Barnet", frequency: 30, fare: 3 },
      { number: "644", origin: "Hatfield", destination: "Queensbury", via: "Barnet", frequency: 30, fare: 3 },
      { number: "625", origin: "Hatfield", destination: "Stevenage", via: "", frequency: 60, fare: 3 },
      { number: "635", origin: "Hatfield", destination: "Watford", via: "", frequency: 60, fare: 3 },
      { number: "653", origin: "New Greens", destination: "Welwyn Garden City", via: "St Albans, Hatfield", frequency: 20, fare: 3 },
    ],
    fleet: [
      { fleet_no: "251", registration: "YX66 WFE", model: "ADL Enviro400 MMC", year: 2016 },
      { fleet_no: "172", registration: "YJ16 DZA", model: "Optare Solo SR", year: 2016 },
      { fleet_no: "408", registration: "YN09 HFV", model: "Scania OmniCity", year: 2009 },
    ],
  },
  {
    key: "centrebus", photoKind: "single", name: "Centrebus", short: "Centrebus", primary: "#1b4f9c", secondary: "#f7a600",
    livery: "Royal blue & amber", hq: "Stevenage",
    depots: ["Stevenage", "Hertford"],
    routes: [
      { number: "324", origin: "Hertford", destination: "Welwyn Garden City", via: "", frequency: 60, fare: 3 },
      { number: "907", origin: "Stevenage", destination: "Cheshunt", via: "Lister Hospital, Ware, Hertford, Hoddesdon, Broxbourne", frequency: 60, fare: 3 },
    ],
    fleet: [
      { fleet_no: "567", registration: "YX10 BGK", model: "ADL Enviro200", year: 2010 },
      { fleet_no: "312", registration: "MX07 BVD", model: "Optare Solo", year: 2007 },
    ],
  },
  {
    key: "trustybus", photoKind: "single", name: "Trustybus", short: "Trustybus", primary: "#2f7d32", secondary: "#f2efe2",
    livery: "Green & cream", hq: "Harlow",
    depots: ["Harlow", "Hertford"],
    routes: [
      { number: "351", origin: "Hertford", destination: "Bishop's Stortford", via: "Ware, Much Hadham", frequency: 60, fare: 3 },
      { number: "410", origin: "Waltham Cross", destination: "Hertford", via: "Cheshunt", frequency: 60, fare: 3 },
      { number: "411", origin: "Waltham Cross", destination: "Hertford", via: "Cheshunt, Hoddesdon", frequency: 60, fare: 3 },
      { number: "392", origin: "Harlow", destination: "Hertford", via: "", frequency: 120, fare: 3 },
    ],
    fleet: [
      { fleet_no: "DB2", registration: "R302 CVU", model: "Dennis Dart / Caetano Nimbus", year: 1998 },
      { fleet_no: "OS4", registration: "YJ58 PKV", model: "Optare Solo", year: 2008 },
    ],
  },
  {
    key: "carousel", photoKind: "single", name: "Carousel Buses", short: "Carousel", primary: "#c8102e", secondary: "#1f2a44",
    livery: "Red & navy", hq: "High Wycombe",
    depots: ["High Wycombe", "Watford outstation"],
    routes: [
      { number: "101", origin: "High Wycombe", destination: "Chesham", via: "Chiltern Hundreds", frequency: 60, fare: 3 },
      { number: "102", origin: "High Wycombe", destination: "Chesham", via: "Chiltern Hundreds", frequency: 60, fare: 3 },
      { number: "103", origin: "High Wycombe", destination: "Amersham", via: "Chiltern Hundreds", frequency: 60, fare: 3 },
      { number: "104", origin: "High Wycombe", destination: "Beaconsfield", via: "Chiltern Hundreds", frequency: 60, fare: 3 },
    ],
    fleet: [
      { fleet_no: "202", registration: "SN65 ZGA", model: "ADL Enviro200 MMC", year: 2015 },
      { fleet_no: "718", registration: "YN08 OAZ", model: "Scania N230UD / ADL Enviro400", year: 2008 },
    ],
  },
  {
    key: "red-rose", photoKind: "mini", name: "Red Rose Travel", short: "Red Rose", primary: "#d2232a", secondary: "#ffffff",
    livery: "Red & white", hq: "Aylesbury",
    depots: ["Aylesbury"],
    routes: [
      { number: "50", origin: "Aylesbury", destination: "Wendover", via: "", frequency: 60, fare: 3 },
      { number: "55", origin: "Aylesbury", destination: "Wendover", via: "", frequency: 60, fare: 3 },
      { number: "502", origin: "Aylesbury", destination: "Aylesbury", via: "Wendover, Tring, Marsworth", frequency: 120, fare: 3 },
    ],
    fleet: [{ fleet_no: "RR1", registration: "MX09 HHR", model: "Optare Solo", year: 2009 }],
  },
  {
    key: "red-eagle", photoKind: "mini", name: "Red Eagle", short: "Red Eagle", primary: "#b3141c", secondary: "#f4c430",
    livery: "Red & gold", hq: "Aylesbury",
    depots: ["Aylesbury"],
    routes: [
      { number: "500", origin: "Aylesbury", destination: "Hemel Hempstead", via: "Aston Clinton, Tring, Berkhamsted", frequency: 30, fare: 3 },
      { number: "61", origin: "Aylesbury", destination: "Dunstable", via: "Tring, Pitstone", frequency: 60, fare: 3 },
      { number: "62", origin: "Aylesbury", destination: "Long Marston", via: "Tring, Pitstone", frequency: 120, fare: 3 },
      { number: "34", origin: "Dunstable", destination: "St Albans", via: "Kensworth, Markyate, Redbourn", frequency: 60, fare: 3 },
      { number: "63", origin: "Cheddington", destination: "Tring", via: "Pitstone, Tring Station", frequency: 120, fare: 2 },
      { number: "1", origin: "Leverstock Green", destination: "Adeyfield", via: "Hemel Hempstead (circular)", frequency: 30, fare: 2 },
      { number: "H11", origin: "Hemel Hempstead", destination: "Chambersbury Lane", via: "Boxmoor", frequency: 30, fare: 2 },
    ],
    fleet: [{ fleet_no: "RE7", registration: "YJ10 EYH", model: "Optare Solo", year: 2010 }],
  },
  {
    key: "redline", photoKind: "single", name: "Redline Buses", short: "Redline", primary: "#e11b22", secondary: "#2b2b2b",
    livery: "Red & charcoal", hq: "Aylesbury",
    depots: ["Aylesbury"],
    routes: [
      { number: "4", origin: "Aylesbury", destination: "Berryfields", via: "", frequency: 30, fare: 2 },
    ],
    fleet: [{ fleet_no: "RL3", registration: "KX54 AHN", model: "Dennis Dart SLF / Plaxton Pointer", year: 2004 }],
  },
  {
    key: "sullivan", photoKind: "double", name: "Sullivan Buses", short: "Sullivan", primary: "#b71c1c", secondary: "#ffd200",
    livery: "Red & yellow", hq: "Potters Bar",
    depots: ["South Mimms"],
    routes: [
      { number: "84", origin: "Potters Bar", destination: "St Albans", via: "London Colney, Cell Barnes", frequency: 60, fare: 3 },
      { number: "303", origin: "Oaklands", destination: "Hatfield", via: "Smallford, Ellenbrook", frequency: 120, fare: 3 },
      { number: "306", origin: "Watford", destination: "Watford", via: "Bushey, Borehamwood (circular)", frequency: 60, fare: 3 },
      { number: "330", origin: "Oaklands", destination: "South Mimms", via: "Hatfield, Potters Bar", frequency: 120, fare: 3 },
      { number: "346", origin: "Bushey", destination: "Abbots Langley", via: "North Watford, Leavesden", frequency: 120, fare: 3 },
      { number: "358", origin: "Oaklands", destination: "Borehamwood", via: "London Colney, Shenley", frequency: 120, fare: 3 },
      { number: "397", origin: "Bushey", destination: "Borehamwood", via: "High Cross, Radlett", frequency: 120, fare: 3 },
      { number: "398", origin: "Potters Bar", destination: "Brookmans Park", via: "Borehamwood, South Mimms", frequency: 120, fare: 3 },
    ],
    fleet: [
      { fleet_no: "DE1", registration: "LK55 KJV", model: "ADL Enviro400", year: 2005 },
      { fleet_no: "AE24", registration: "YX13 AEB", model: "ADL Enviro200", year: 2013 },
    ],
  },
];
