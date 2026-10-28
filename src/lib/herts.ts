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
  if (/400|olympian|gemini|streetdeck|b5lh|b9tl|b7tl|n230ud|omnicity/.test(m)) return "double";
  return "single";
}

export const BUS_MODELS = [
  "ADL Enviro200", "ADL Enviro200 MMC", "ADL Enviro400", "ADL Enviro400 MMC", "Dennis Dart SLF / Plaxton Pointer",
  "Dennis Dart / Caetano Nimbus", "Leyland Olympian / ECW", "Leyland National", "Leyland Lynx",
  "Volvo B7TL / Wright Eclipse Gemini", "Volvo B9TL / Wright Gemini 2", "Volvo B5LH / Wright Gemini 3",
  "Scania OmniCity", "Scania N230UD / ADL Enviro400", "VDL SB200 / Wright Pulsar 2", "Wright StreetLite",
  "Wright StreetDeck", "Optare Solo", "Optare Solo SR", "Optare Versa", "Optare Tempo",
  "Mercedes-Benz Citaro", "Mercedes-Benz Sprinter", "MAN EcoCity / Caetano", "Switch Metrocity EV",
  "Yutong E10", "BYD / ADL Enviro200EV",
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
      { number: "300", origin: "Stevenage", destination: "Hemel Hempstead", via: "Welwyn GC, Hatfield, St Albans", frequency: 30, fare: 3 },
      { number: "320", origin: "Watford", destination: "Hemel Hempstead", via: "Kings Langley", frequency: 20, fare: 2 },
      { number: "321", origin: "Watford", destination: "Luton", via: "St Albans, Harpenden", frequency: 30, fare: 3 },
      { number: "724", origin: "Harlow", destination: "Heathrow", via: "Hertford, Welwyn GC, Hatfield, St Albans, Watford", frequency: 60, fare: 3 },
      { number: "101", origin: "Stevenage", destination: "Luton", via: "Hitchin", frequency: 30, fare: 3 },
      { number: "302", origin: "Hemel Hempstead", destination: "Watford", via: "Leverstock Green, Abbots Langley", frequency: 30, fare: 2 },
      { number: "310", origin: "Hertford", destination: "Waltham Cross", via: "Ware, Hoddesdon, Cheshunt", frequency: 20, fare: 3 },
      { number: "311", origin: "Hertford", destination: "Waltham Cross", via: "Broxbourne, Cheshunt", frequency: 30, fare: 3 },
      { number: "344", origin: "Hitchin", destination: "Letchworth", via: "Lister Hospital", frequency: 30, fare: 2 },
      { number: "500", origin: "Watford", destination: "Aylesbury", via: "Hemel Hempstead, Berkhamsted, Tring", frequency: 30, fare: 3 },
      { number: "H1", origin: "Hemel Hempstead", destination: "Hemel Maylands", via: "Town Centre", frequency: 15, fare: 2 },
      { number: "SB1", origin: "Stevenage", destination: "Lister Hospital", via: "Bus Station", frequency: 20, fare: 2 },
      { number: "10", origin: "Watford", destination: "Oxhey", via: "Watford General Hospital", frequency: 20, fare: 2 },
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
      { number: "602", origin: "Hatfield", destination: "Watford", via: "St Albans, Bricket Wood", frequency: 20, fare: 2 },
      { number: "610", origin: "Potters Bar", destination: "Luton", via: "Hatfield, Welwyn GC", frequency: 30, fare: 3 },
      { number: "614", origin: "Hatfield", destination: "Queensbury", via: "Borehamwood, Edgware", frequency: 30, fare: 3 },
      { number: "653", origin: "Hatfield", destination: "Hatfield", via: "Oxlease, Hatfield Business Park", frequency: 15, fare: 2 },
      { number: "601", origin: "Welwyn Garden City", destination: "Borehamwood", via: "Hatfield, University of Hertfordshire", frequency: 20, fare: 2 },
      { number: "612", origin: "Hatfield", destination: "Borehamwood", via: "Shenley, Elstree", frequency: 60, fare: 3 },
      { number: "635", origin: "Hatfield", destination: "Hertford", via: "Welwyn GC", frequency: 60, fare: 3 },
      { number: "641", origin: "Hatfield", destination: "Hemel Hempstead", via: "St Albans, Leverstock Green", frequency: 60, fare: 3 },
      { number: "644", origin: "Hatfield", destination: "Welwyn Garden City", via: "College Lane", frequency: 20, fare: 2 },
      { number: "655", origin: "Hatfield", destination: "Hatfield Business Park", via: "University of Hertfordshire", frequency: 10, fare: 1.5 },
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
      { number: "331", origin: "Hertford", destination: "Royston", via: "Ware, Buntingford", frequency: 60, fare: 3 },
      { number: "386", origin: "Bishop's Stortford", destination: "Hertford", via: "Much Hadham", frequency: 90, fare: 3 },
      { number: "390", origin: "Stevenage", destination: "Hertford", via: "Watton-at-Stone", frequency: 60, fare: 3 },
      { number: "380", origin: "Stevenage", destination: "Buntingford", via: "Walkern", frequency: 120, fare: 3 },
      { number: "97", origin: "Hitchin", destination: "Stotfold", via: "Letchworth", frequency: 60, fare: 2 },
      { number: "88", origin: "Hitchin", destination: "Luton", via: "Offley", frequency: 60, fare: 3 },
      { number: "700", origin: "Hertford", destination: "Hertford Heath", via: "Town Centre", frequency: 60, fare: 2 },
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
      { number: "351", origin: "Hertford", destination: "Bishop's Stortford", via: "Ware, Sawbridgeworth", frequency: 60, fare: 3 },
      { number: "510", origin: "Harlow", destination: "Bishop's Stortford", via: "Sawbridgeworth", frequency: 30, fare: 3 },
      { number: "331", origin: "Hertford", destination: "Royston", via: "Ware, Puckeridge, Buntingford", frequency: 60, fare: 3 },
      { number: "386", origin: "Bishop's Stortford", destination: "Hertford", via: "Much Hadham, Hunsdon", frequency: 120, fare: 3 },
      { number: "308", origin: "Hertford", destination: "Stansted Airport", via: "Ware, Standon", frequency: 120, fare: 4 },
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
      { number: "500", origin: "Watford", destination: "Aylesbury", via: "Hemel Hempstead, Berkhamsted, Tring", frequency: 30, fare: 3 },
      { number: "336", origin: "Watford", destination: "Chesham", via: "Rickmansworth, Chorleywood", frequency: 60, fare: 3 },
      { number: "8", origin: "Watford", destination: "Croxley Green", via: "Cassiobury", frequency: 30, fare: 2 },
      { number: "R1", origin: "Rickmansworth", destination: "Sarratt", via: "Chorleywood", frequency: 120, fare: 2 },
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
      { number: "164", origin: "Aylesbury", destination: "Tring", via: "Wendover", frequency: 120, fare: 3 },
      { number: "61", origin: "Tring", destination: "Aylesbury", via: "Aston Clinton", frequency: 60, fare: 3 },
      { number: "387B", origin: "Tring", destination: "Northchurch", via: "Berkhamsted", frequency: 120, fare: 2 },
    ],
    fleet: [{ fleet_no: "RR1", registration: "MX09 HHR", model: "Optare Solo", year: 2009 }],
  },
  {
    key: "red-eagle", photoKind: "mini", name: "Red Eagle", short: "Red Eagle", primary: "#b3141c", secondary: "#f4c430",
    livery: "Red & gold", hq: "Aylesbury",
    depots: ["Aylesbury"],
    routes: [
      { number: "387", origin: "Tring", destination: "Tring Station", via: "Aldbury", frequency: 120, fare: 2 },
      { number: "30", origin: "Tring", destination: "Bovingdon", via: "Northchurch, Berkhamsted", frequency: 120, fare: 3 },
      { number: "164B", origin: "Aylesbury", destination: "Markyate", via: "Tring", frequency: 180, fare: 3 },
    ],
    fleet: [{ fleet_no: "RE7", registration: "YJ10 EYH", model: "Optare Solo", year: 2010 }],
  },
  {
    key: "redline", photoKind: "single", name: "Redline Buses", short: "Redline", primary: "#e11b22", secondary: "#2b2b2b",
    livery: "Red & charcoal", hq: "Aylesbury",
    depots: ["Aylesbury"],
    routes: [
      { number: "50", origin: "Aylesbury", destination: "Berkhamsted", via: "Tring", frequency: 120, fare: 3 },
      { number: "354", origin: "Hemel Hempstead", destination: "Bovingdon", via: "Leverstock Green", frequency: 120, fare: 2 },
      { number: "52", origin: "Berkhamsted", destination: "Hemel Hempstead", via: "Northchurch", frequency: 60, fare: 2 },
    ],
    fleet: [{ fleet_no: "RL3", registration: "KX54 AHN", model: "Dennis Dart SLF / Plaxton Pointer", year: 2004 }],
  },
  {
    key: "sullivan", photoKind: "double", name: "Sullivan Buses", short: "Sullivan", primary: "#b71c1c", secondary: "#ffd200",
    livery: "Red & yellow", hq: "Potters Bar",
    depots: ["South Mimms"],
    routes: [
      { number: "84", origin: "St Albans", destination: "New Barnet", via: "London Colney, Potters Bar", frequency: 60, fare: 2 },
      { number: "305", origin: "Potters Bar", destination: "Welwyn GC", via: "Hatfield", frequency: 60, fare: 3 },
      { number: "242", origin: "Potters Bar", destination: "Cheshunt", via: "Cuffley, Goffs Oak", frequency: 60, fare: 2 },
      { number: "398", origin: "Potters Bar", destination: "Brookmans Park", via: "Little Heath", frequency: 60, fare: 2 },
      { number: "313", origin: "Potters Bar", destination: "Enfield", via: "Chingford", frequency: 30, fare: 2 },
      { number: "602S", origin: "South Mimms", destination: "St Albans", via: "London Colney", frequency: 120, fare: 3 },
    ],
    fleet: [
      { fleet_no: "DE1", registration: "LK55 KJV", model: "ADL Enviro400", year: 2005 },
      { fleet_no: "AE24", registration: "YX13 AEB", model: "ADL Enviro200", year: 2013 },
    ],
  },
];
