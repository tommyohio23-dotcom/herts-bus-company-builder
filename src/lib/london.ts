import { PRESETS,type Preset } from './herts';
export const NEW_BARNET_ROUTES = [
 {number:'107',operator:'metroline',origin:'Edgware Station',destination:'New Barnet Station',via:'Borehamwood, New Barnet Station Road'},
 {number:'184',operator:'go-ahead-london',origin:'Turnpike Lane',destination:'Chesterfield Road',via:'Wood Green, New Barnet Station Road'},
 {number:'307',operator:'arriva-london',origin:'Barnet Hospital',destination:'Brimsdown Station',via:'New Barnet Station Road, Enfield'},
 {number:'326',operator:'london-sovereign',origin:'Barnet, The Spires',destination:'Brent Cross',via:'New Barnet Station Road, Finchley'},
 {number:'383',operator:'uno',origin:'Finchley Memorial Hospital',destination:'Barnet, The Spires',via:'New Barnet Station Road'},
 {number:'384',operator:'metroline',origin:'Edgware Station',destination:'Cockfosters Station',via:'New Barnet Station Road'},
 {number:'626',operator:'metroline',origin:'Finchley Central',destination:"Dame Alice Owen's School",via:'New Barnet Station Road (school journeys only)'},
];
// Endpoints checked against TfL Line/Route; operating-company attribution corroborated by stop listings.
import NL from './north-london-routes.json';
const OP_KEY:Record<string,string>={'Metroline':'metroline','Arriva London':'arriva-london','Go-Ahead London':'go-ahead-london','First Bus London':'first-london','Stagecoach London':'stagecoach-london','Uno':'uno'};
/** Every current TfL route with 3+ stops inside Barnet, Enfield, Haringey or Borehamwood, operator from current allocation lists. */
export const NORTH_LONDON_ROUTES=[...(NL as {number:string;operator:string;origin:string;destination:string;via:string;school:boolean}[]).map(r=>({...r,operator:OP_KEY[r.operator]??r.operator})),...NEW_BARNET_ROUTES.filter(b=>!(NL as {number:string}[]).some(r=>r.number===b.number)).map(r=>({...r,school:r.number==='626'}))];
const routesFor=(key:string)=>NORTH_LONDON_ROUTES.filter(r=>r.operator===key).map(r=>({number:r.number,origin:r.origin,destination:r.destination,via:r.via,frequency:r.school?720:r.number.startsWith('N')?30:12,fare:1.75}));
export const LONDON_PRESETS:Preset[] = [
 {key:'arriva-london',name:'Arriva London',short:'Arriva',hq:'Enfield',depots:['Enfield','Edmonton']},
 {key:'metroline',name:'Metroline',short:'Metroline',hq:'Potters Bar',depots:['Potters Bar','Edgware','Holloway']},
 {key:'go-ahead-london',name:'Go-Ahead London',short:'Go-Ahead',hq:'Northumberland Park',depots:['Northumberland Park']},
 {key:'first-london',name:'First Bus London',short:'First',hq:'Edgware',depots:['Edgware']},
 {key:'stagecoach-london',name:'Stagecoach London',short:'Stagecoach',hq:'Tottenham',depots:['Tottenham']},
 {key:'london-sovereign',name:'London Sovereign',short:'Sovereign',hq:'Edgware',depots:['Edgware']},
 {key:'london-united',name:'London United (RATP Dev)',short:'LU',hq:'Hounslow',depots:['Hounslow','Park Royal','Stamford Brook'],extra:[['9','Hammersmith','Aldwych','Kensington'],['65','Ealing Broadway','Kingston','Richmond'],['71','Chessington','Kingston','Surbiton'],['281','Hounslow','Tolworth','Twickenham'],['285','Heathrow Central','Kingston','Feltham']]},
 {key:'transport-uk-london',name:'Transport UK (Abellio London)',short:'TUK',hq:'Battersea',depots:['Battersea','Walworth','Hayes'],extra:[['3','Crystal Palace','Trafalgar Square','Brixton'],['159','Streatham Station','Marble Arch','Brixton, Westminster'],['195','Charville Lane Estate','Brentford','Hayes, Southall']]},
 {key:'london-general',name:'London General (Go-Ahead)',short:'General',hq:'Putney',depots:['Putney','Stockwell','Merton'],extra:[['14','Putney Heath','Russell Square','Fulham, Knightsbridge'],['22','Putney Common','Piccadilly Circus','Chelsea'],['44','Tooting Station','Victoria','Wandsworth'],['77','Tooting Station','Waterloo','Clapham Junction'],['270','Mitcham','Putney Bridge','Tooting']]},
 {key:'uno-london',name:'Uno London',short:'Uno LDN',hq:'Barnet',depots:['Barnet'],extra:[['383','Finchley Memorial Hospital','Barnet, The Spires','New Barnet Station Road']]},
].map(({extra,...p}:{key:string;name:string;short:string;hq:string;depots:string[];extra?:string[][]})=>({...p,photoKind:'double' as const,primary:'#ce192d',secondary:'#24272b',livery:'London red (game fleet)',routes:extra?extra.map(([number,origin,destination,via])=>({number:number!,origin:origin!,destination:destination!,via:via!,frequency:12,fare:1.75})):routesFor(p.key),fleet:[0,1,2].map(i=>({fleet_no:`${p.short}-${i+1} (game)`,registration:'',model:i===1?'ADL Enviro200':'ADL Enviro400',year:2016+i}))})).filter(p=>p.routes.length>0);
export const BUS_OPERATOR_PRESETS = [...PRESETS.map(p=>p.key==='uno'?{...p,routes:[...p.routes,...routesFor('uno').filter(r=>!p.routes.some(x=>x.number===r.number))]}:p),...LONDON_PRESETS];
