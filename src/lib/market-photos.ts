import solo from '@/assets/market/solo.jpg.asset.json';
import enviro200 from '@/assets/market/enviro200.jpg.asset.json';
import dart from '@/assets/market/dart.jpg.asset.json';
import enviro400 from '@/assets/market/enviro400.jpg.asset.json';
import streetlite from '@/assets/market/streetlite.jpg.asset.json';
import gemini from '@/assets/market/gemini.jpg.asset.json';
import { realBusPhoto, type PhotoCredit } from './bus-photos';

const images:Record<string,{url:string;credit?:PhotoCredit}>={
  'Optare Solo':{url:solo.url},
  'ADL Enviro200':{url:enviro200.url,credit:{url:enviro200.url,page:'https://commons.wikimedia.org/wiki/File:2013_Alexander_Dennis_Enviro200_4.5_Stagecoach_Midlands.jpg',author:'Vauxford',license:'CC BY-SA 4.0'}},
  'Dennis Dart SLF / Plaxton Pointer':{url:dart.url},
  'ADL Enviro400':{url:enviro400.url,credit:{url:enviro400.url,page:'https://commons.wikimedia.org/wiki/File:Arriva_Alexander_Dennis_Enviro400_(SN58_EOO)_in_Frideswide_Square,_Oxford.jpg',author:'Au Morandarte',license:'CC BY-SA 2.0'}},
  'Wright StreetLite':{url:streetlite.url},
  'Volvo B9TL / Wright Gemini 2':{url:gemini.url},
};
export function marketPhoto(model:string):PhotoCredit|undefined {
  const image=images[model],credit=image?.credit??realBusPhoto(null,model);
  return image&&credit?{...credit,url:image.url}:credit;
}