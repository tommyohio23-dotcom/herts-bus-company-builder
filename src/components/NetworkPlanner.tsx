/// <reference types="google.maps" />
import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowUp, ArrowDown, X, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { MAP_AREAS, stopLabel, type RealStop } from '@/lib/management';
import { Tabs,TabsList,TabsTrigger } from './ui/tabs';
import {routeOneWayMinutes,timetableCycle} from '@/lib/service-frequency';
import {ServiceFrequency} from './ServiceFrequency';

let mapPromise: Promise<void> | undefined;
function loadMaps() {
  if (mapPromise) return mapPromise;
  mapPromise = new Promise((resolve,reject) => {
    const key = import.meta.env['VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY'];
    if (!key) { reject(new Error('Map connection unavailable')); return; }
    window.hertsMapsReady = () => resolve();
    const script=document.createElement('script');
    script.src=`https://maps.googleapis.com/maps/api/js?key=${key}&loading=async&callback=hertsMapsReady&channel=${import.meta.env['VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID'] ?? ''}&language=en&region=GB`;
    script.onerror=() => reject(new Error('The map could not load'));
    document.head.appendChild(script);
  });
  return mapPromise;
}
declare global { interface Window { hertsMapsReady?: () => void } }
export function NetworkPlanner({companyId,refresh}: {companyId:string;refresh:()=>void}) {
  const [areaKey,setAreaKey]=useState('herts'),[search,setSearch]=useState(''),[selected,setSelected]=useState<RealStop[]>([]);
  const [number,setNumber]=useState(''),[serviceType,setServiceType]=useState('Commercial'),[fare,setFare]=useState(2),[frequency,setFrequency]=useState(30),[saving,setSaving]=useState(false),[error,setError]=useState('');
  const container=useRef<HTMLDivElement>(null),map=useRef<google.maps.Map | null>(null);
  const [ready,setReady]=useState(false);
  const area=MAP_AREAS.find(a=>a.key===areaKey) ?? MAP_AREAS[0];
  const stops=useQuery({queryKey:['real-stops',areaKey],queryFn:async()=>{const r=await fetch(`/data/stops-${area?.file ?? areaKey}.json`);if(!r.ok)throw new Error('Stop data could not load');const all=await r.json() as RealStop[];const b=area?.bounds;return b?all.filter(s=>s.lat>=b[0]&&s.lat<=b[1]&&s.lng>=b[2]&&s.lng<=b[3]):all;},staleTime:Infinity});
  const matches=(stops.data ?? []).filter(s => stopLabel(s).toLowerCase().includes(search.toLowerCase())).slice(0,60);
  const selectedRef=useRef(selected);selectedRef.current=selected;
  useEffect(()=>{let cancelled=false;loadMaps().then(()=>{if(cancelled || !container.current)return;map.current=new google.maps.Map(container.current,{center:{lat:51.85,lng:-.28},zoom:10,clickableIcons:false,mapTypeControl:true,streetViewControl:false});setReady(true);}).catch(e=>setError(e.message));return()=>{cancelled=true;};},[]);
  useEffect(()=>{if(ready && area)map.current?.setCenter({lat:area.lat,lng:area.lng});},[areaKey,ready,area]);
  useEffect(()=>{
    if(!ready || !map.current)return;
    const nodes=[...new Map([...matches,...selected].map(s=>[s.id,s])).values()];
    const markers=nodes.map(s=>{const index=selected.findIndex(p=>p.id===s.id);const m=new google.maps.Marker({position:{lat:s.lat,lng:s.lng},map:map.current,title:stopLabel(s),label:index>=0?String(index+1):null});m.addListener('click',()=>{if(!selectedRef.current.some(p=>p.id===s.id))setSelected(p=>[...p,s]);});return m;});
    const line=new google.maps.Polyline({path:selected.map(s=>({lat:s.lat,lng:s.lng})),map:map.current,strokeWeight:3});
    return()=>{markers.forEach(m=>m.setMap(null));line.setMap(null);};
  },[ready,stops.data,search,selected]);
  function move(i:number,d:number){setSelected(old=>{const next=[...old],a=next[i],b=next[i+d];if(!a||!b)return old;next[i]=b;next[i+d]=a;return next;});}
  async function save(){if(saving)return;if(!number.trim()||selected.length<2){toast.error('Enter a route number and choose at least two stops');return;}setSaving(true);try{const first=selected[0],last=selected.at(-1);if(!first||!last)return;const r=await supabase.from('routes').insert({company_id:companyId,number:number.trim(),origin:stopLabel(first),destination:stopLabel(last),via:selected.slice(1,-1).map(stopLabel).join(' → '),stop_ids:selected.map(s=>s.id),service_type:serviceType,fare,frequency_mins:frequency,journey_minutes:routeOneWayMinutes(selected)});if(r.error)throw r.error;toast.success('Route registered');setNumber('');setSelected([]);refresh();}catch(e){toast.error(e instanceof Error?e.message:'Route could not save');}finally{setSaving(false);}}
  return <section className="mt-4 space-y-4">
    <h2 className="text-3xl">Network maps</h2><Tabs value={areaKey} onValueChange={setAreaKey}><TabsList className="h-auto w-full flex-wrap justify-start">{MAP_AREAS.map(a=><TabsTrigger className="whitespace-normal text-left" value={a.key} key={a.key}>{a.name}</TabsTrigger>)}</TabsList></Tabs>
    <Input aria-label="Find a real bus stop" placeholder="Search town, street or bus stop" value={search} onChange={e=>setSearch(e.target.value)}/>
    <div ref={container} className="h-[420px] w-full overflow-hidden rounded-md border bg-muted" aria-label="Bus stop map"/>
    {error&&<p className="text-destructive">{error}</p>}
    <p className="text-xs text-muted-foreground">NaPTAN · Department for Transport · Open Government Licence · Active stop snapshot, 29 October 2026 · {stops.data?.length.toLocaleString() ?? '…'} stops in this map window. Lines connect selected stops, not road directions.</p>
    <div className="grid gap-5 md:grid-cols-2"><div><h3 className="text-2xl">Bus stops</h3>{stops.isError&&<p className="text-destructive">Could not load stops.</p>}<div className="mt-2 max-h-72 overflow-y-auto divide-y">{matches.map(s=><Button key={s.id} variant="ghost" className="h-auto min-h-10 w-full justify-start whitespace-normal text-left" disabled={selected.some(p=>p.id===s.id)} onClick={()=>setSelected(p=>[...p,s])}><MapPin className="mr-2 size-4 shrink-0"/>{stopLabel(s)}</Button>)}</div></div>
    <div><h3 className="text-2xl">New service · {selected.length} stops</h3><ol className="my-2 space-y-1">{selected.map((s,i)=><li className="flex items-center gap-1 border-b py-2 text-sm" key={s.id}><span className="min-w-0 flex-1">{i+1}. {stopLabel(s)}</span><Button size="icon" variant="ghost" title="Move stop up" aria-label="Move selected stop up" disabled={i===0} onClick={()=>move(i,-1)}><ArrowUp className="size-4"/></Button><Button size="icon" variant="ghost" title="Move stop down" aria-label="Move selected stop down" disabled={i===selected.length-1} onClick={()=>move(i,1)}><ArrowDown className="size-4"/></Button><Button size="icon" variant="ghost" title="Remove stop" aria-label="Remove selected stop" onClick={()=>setSelected(p=>p.filter(x=>x.id!==s.id))}><X className="size-4"/></Button></li>)}</ol>
    <div className="grid grid-cols-2 gap-2"><Input aria-label="Map route number" placeholder="Route number" value={number} onChange={e=>setNumber(e.target.value)}/><Select value={serviceType} onValueChange={setServiceType}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{['Commercial','Tourism'].map(t=><SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select><label className="text-sm">Fare £<Input aria-label="Map route fare" type="number" min={0} max={50} value={fare} onChange={e=>setFare(Math.max(0,Number(e.target.value)))}/></label></div><ServiceFrequency cycleMinutes={timetableCycle({journey_minutes:routeOneWayMinutes(selected)})} value={frequency} onChange={setFrequency} label="Map route frequency"/><Button className="mt-3" disabled={saving||selected.length<2} onClick={save}>{saving?'Saving…':'Register mapped route'}</Button></div></div>
    <p className="text-xs text-muted-foreground"><a href="https://maps.google.com/help/terms_maps/" target="_blank" rel="noreferrer" className="underline">Google Maps terms</a> · <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="underline">Google privacy policy</a></p>
  </section>;
}