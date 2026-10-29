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
export const LONDON_PRESETS:Preset[] = [
 {key:'arriva-london',name:'Arriva London',short:'Arriva',hq:'Enfield',depots:['Enfield']},
 {key:'metroline',name:'Metroline',short:'Metroline',hq:'Potters Bar',depots:['Potters Bar','Edgware']},
 {key:'go-ahead-london',name:'Go-Ahead London',short:'Go-Ahead',hq:'Wood Green',depots:['Wood Green']},
 {key:'london-sovereign',name:'London Sovereign',short:'Sovereign',hq:'Edgware',depots:['Edgware']},
].map(p=>({...p,photoKind:'double',primary:'#ce192d',secondary:'#24272b',livery:'London red (game fleet)',routes:NEW_BARNET_ROUTES.filter(r=>r.operator===p.key).map(r=>({...r,frequency:r.number==='626'?720:30,fare:2})),fleet:[{fleet_no:`${p.short}-1 (game)`,registration:'',model:'ADL Enviro400',year:2016}]}));
export const BUS_OPERATOR_PRESETS = [...PRESETS.map(p=>p.key==='uno'?{...p,routes:[...p.routes,...NEW_BARNET_ROUTES.filter(r=>r.operator==='uno').map(r=>({...r,frequency:30,fare:2}))]}:p),...LONDON_PRESETS];