import { createFileRoute, Link } from "@tanstack/react-router";
import { useCur, useArea, CurrencyContext, AreaContext, AREA_CURRENCY } from "@/lib/currency";
import { areaOf, areaModels, areaTowns } from "@/lib/areas";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BusSide } from "@/components/BusSide";
import { FEATURES, STATUSES } from "@/lib/herts";
import { BusPhoto } from "@/components/BusPhoto";
import { fetchAll, chunk } from "@/lib/fetch-all";
import { managementAction } from "@/lib/management.functions";
import { ManagementExpansion } from "@/components/ManagementExpansion";
import { NetworkPlanner } from "@/components/NetworkPlanner";
import { Recruitment } from "@/components/Recruitment";
import { UPGRADE_PRICES, upgradeCost, upgradeUpkeep } from '@/lib/upgrades';
import { purchaseBusOrFeatures } from '@/lib/upgrades.functions';
import {ServiceFrequency} from '@/components/ServiceFrequency';
import {repairBus} from '@/lib/disruptions.functions';
import {busRepairCost} from '@/lib/disruptions';
import {requiredBuses,timetableCycle,routeOneWayMinutes,HERTS_TOWN_COORDS,assertFleetCoverage,assertDriverCoverage} from '@/lib/service-frequency';

export const Route = createFileRoute("/_authenticated/company/$id")({
  head: () => ({
    meta: [
      { title: "Company depot — Herts Bus Manager" },
      { name: "description", content: "Fleet list, routes and driver roster for your Herts bus company." },
      { property: "og:title", content: "Company depot — Herts Bus Manager" },
      { property: "og:description", content: "Manage fleet, routes and drivers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CompanyPage,
});

const busPrice = (year: number) => Math.max(8000, 20000 + (year - 1995) * 6000);

function useCompanyData(id: string) {
  const company = useQuery({ queryKey: ["company", id], queryFn: async () => (await supabase.from("companies").select("*").eq("id", id).single()).data });
  const buses = useQuery({ queryKey: ["buses", id], queryFn: async () => (await supabase.from("buses").select("*").eq("company_id", id).order("fleet_no")).data ?? [] });
  const routes = useQuery({ queryKey: ["routes", id], queryFn: async () => (await supabase.from("routes").select("*").eq("company_id", id).order("number")).data ?? [] });
  const drivers = useQuery({ queryKey: ["drivers", id], queryFn: () => fetchAll((from, to) => supabase.from("drivers").select("*").eq("company_id", id).order("name").order("id").range(from, to)) });
  return { company: company.data, buses: buses.data ?? [], routes: routes.data ?? [], drivers: drivers.data ?? [] };
}

function CompanyPage() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const { company, buses, routes, drivers } = useCompanyData(id);
  const refresh = () => ["company", "buses", "routes", "drivers", "depots", "tender_bids", "passenger_reviews", "day_reports", "job_adverts", "job_applicants"].forEach((k) => qc.invalidateQueries({ queryKey: [k, id] }));
  const action = useServerFn(managementAction);
  const [running, setRunning] = useState(false);

  if (!company) return <div className="p-8 text-muted-foreground">Loading depot…</div>;
  const area = areaOf(company);
  const cur = AREA_CURRENCY[area];

  async function runDay() {
    if (!company || running) return;
    setRunning(true);
    try { const r = await action({data:{companyId:id,day:company.day,action:'day'}}); toast.success(`${r.message} · Profit ${cur}${r.profit?.toLocaleString() ?? 0}`); refresh(); }
    catch(e) { toast.error(e instanceof Error ? e.message : 'Day could not save'); }
    finally { setRunning(false); }
  }

  async function spend(amount: number) {
    if (!company) return false;
    if (Number(company.balance) < amount) { toast.error("Not enough money"); return false; }
    await supabase.from("companies").update({ balance: Number(company.balance) - amount }).eq("id", id);
    return true;
  }

  return (
    <AreaContext.Provider value={area}><CurrencyContext.Provider value={cur}>
    <div className="min-h-screen">
      <div className="stripe-band h-2" />
      <header className="mx-auto max-w-6xl px-4 py-4">
        <Link to="/dashboard" className="text-sm text-muted-foreground underline">← All companies</Link>
        <div className="mt-2 flex flex-wrap items-center gap-4">
          <BusSide primary={company.primary_color} secondary={company.secondary_color} label={company.short_name} double className="w-36" />
          <div className="flex-1">
            <h1 className="text-4xl leading-tight break-words">{company.name}</h1>
            <p className="text-muted-foreground">HQ {company.hq_town} · Day {company.day}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase text-muted-foreground">Balance</p>
            <p className={`font-display text-4xl ${Number(company.balance) < 0 ? "text-destructive" : "text-primary"}`}>{cur}{Number(company.balance).toLocaleString()}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Stat label="Buses" value={buses.length} /><Stat label="Routes" value={routes.length} /><Stat label="Staff" value={drivers.length} />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 pb-16">
        <Tabs defaultValue="fleet">
          <TabsList className="h-auto w-full flex-wrap justify-start gap-1">
            <TabsTrigger value="fleet">Fleet</TabsTrigger><TabsTrigger value="routes">Routes</TabsTrigger>
            <TabsTrigger value="drivers">Employees</TabsTrigger><TabsTrigger value="ops">Operations</TabsTrigger>
            <TabsTrigger value="market">Used market</TabsTrigger><TabsTrigger value="depots">Depots</TabsTrigger><TabsTrigger value="tenders">Tenders</TabsTrigger><TabsTrigger value="network">Map</TabsTrigger><TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="fleet"><Fleet companyId={id} company={company} buses={buses} routes={routes} refresh={refresh} spend={spend} /></TabsContent>
          <TabsContent value="routes"><Routes companyId={id} routes={routes} buses={buses} drivers={drivers} refresh={refresh} /></TabsContent>
          <TabsContent value="drivers"><Recruitment companyId={id} drivers={drivers} routes={routes} refresh={refresh} /></TabsContent>
          <TabsContent value="ops">
            <Button size="lg" className="mt-3" disabled={running} onClick={runDay}>{running ? 'Running…' : `Run day ${company.day}`}</Button>
            {routes.filter(r=>r.contract_end_day==null||r.contract_end_day>=company.day).map(r=>{let issue='';try{assertFleetCoverage([r],buses);assertDriverCoverage([r],buses,drivers);}catch(e){issue=e instanceof Error?e.message:'';}return issue?<p key={r.id} className="mt-2 text-sm text-destructive">{issue}</p>:null;})}
            <ManagementExpansion view="reports" company={company} buses={buses} drivers={drivers} refresh={refresh}/>
          </TabsContent>
          {(['market','depots','tenders','reviews'] as const).map(view=><TabsContent key={view} value={view}><ManagementExpansion view={view} company={company} buses={buses} drivers={drivers} refresh={refresh}/></TabsContent>)}
          <TabsContent value="network"><NetworkPlanner companyId={id} refresh={refresh}/></TabsContent>
        </Tabs>
      </main>
    </div>
    </CurrencyContext.Provider></AreaContext.Provider>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="rounded-md bg-secondary p-2"><p className="font-display text-3xl">{value}</p><p className="text-xs uppercase text-muted-foreground">{label}</p></div>;
}

type Bus = ReturnType<typeof useCompanyData>["buses"][number];
type Rt = ReturnType<typeof useCompanyData>["routes"][number];
type Drv = ReturnType<typeof useCompanyData>["drivers"][number];
type Co = NonNullable<ReturnType<typeof useCompanyData>["company"]>;

function Fleet({ companyId, company, buses, routes, refresh, spend }: { companyId: string; company: Co; buses: Bus[]; routes: Rt[]; refresh: () => void; spend: (n: number) => Promise<boolean> }) {
  const cur = useCur();
  const repair=useServerFn(repairBus);
  const purchase = useServerFn(purchaseBusOrFeatures);
  const [upgrading,setUpgrading]=useState(false);
  async function upgrade(b:Bus, features:string[]){if(upgrading)return;setUpgrading(true);try{const r=await purchase({data:{companyId,day:company.day,busId:b.id,features}});toast.success(`Specification saved · ${cur}${r.cost.toLocaleString()}`);refresh();}catch(e){toast.error(e instanceof Error?e.message:'Could not save');}finally{setUpgrading(false);}}
  const update = async (id: string, patch: Partial<Bus>) => { await supabase.from("buses").update(patch).eq("id", id); refresh(); };
  const remove = async (b: Bus) => {
    if (!confirm(`Sell ${b.fleet_no} for ${cur}${Math.round(busPrice(b.year) * 0.3).toLocaleString()}?`)) return;
    await supabase.from("buses").delete().eq("id", b.id);
    await supabase.from("companies").update({ balance: Number(company.balance) + Math.round(busPrice(b.year) * 0.3) }).eq("id", companyId);
    refresh();
  };
  return (
    <div className="mt-2">
      <AddBus companyId={companyId} company={company} routes={routes} refresh={refresh} spend={spend} />
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {buses.map((b) => (
          <div key={b.id} className="overflow-hidden rounded-lg border bg-card">
            <BusPhoto model={b.model} presetKey={company.preset_key} />
            <div className="p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-display text-2xl leading-none">{b.fleet_no} <span className="rounded bg-accent px-1.5 text-base text-accent-foreground">{b.registration}</span></p>
                <p className="text-sm">{b.model} · {b.year}</p>
                <p className="text-xs text-muted-foreground">{b.livery || "Fleet livery"} · {b.depot || "No depot"} · {b.mileage.toLocaleString()} mi · {b.condition}% condition</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => remove(b)}>Sell</Button>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Select disabled={b.status==='Broken down'} value={b.status} onValueChange={(v) => update(b.id, { status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={b.route_id ?? "none"} onValueChange={(v) => update(b.id, { route_id: v === "none" ? null : v })}>
                <SelectTrigger><SelectValue placeholder="Route" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unallocated</SelectItem>
                  {routes.map((r) => <SelectItem key={r.id} value={r.id}>{r.number} {r.destination}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {b.status==='Broken down'&&<Button className="mt-2" disabled={upgrading} onClick={async()=>{setUpgrading(true);try{await repair({data:{companyId,day:company.day,busId:b.id}});toast.success('Bus repaired');refresh();}catch(e){toast.error(e instanceof Error?e.message:'Repair failed');}finally{setUpgrading(false);}}}>Repair · {cur}{busRepairCost(b.condition).toLocaleString()}</Button>}
            <FeaturePicker value={b.features} disabled={upgrading} onChange={(v) => upgrade(b, v)} />
            <p className="mt-2 text-xs text-muted-foreground">Extras upkeep · {cur}{upgradeUpkeep(b.features)}/day</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddBus({ companyId, company, routes, refresh, spend }: { companyId: string; company: Co; routes: Rt[]; refresh: () => void; spend: (n: number) => Promise<boolean> }) {
  const cur = useCur();
  const purchase=useServerFn(purchaseBusOrFeatures);
  const [saving,setSaving]=useState(false);
  const [open, setOpen] = useState(false);
  const area = useArea();
  const models = areaModels(area);
  const depotList = useQuery({ queryKey: ['depots', companyId], queryFn: async () => { const r = await supabase.from('depots').select('*').eq('company_id', companyId); if (r.error) throw r.error; return r.data; } });
  const depotTowns = (depotList.data ?? []).map(d => d.town);
  const [f, setF] = useState({ fleet_no: "", registration: "", model: models[0] ?? "", year: 2012, depot: company.hq_town, livery: "", route_id: "none", features: [] as string[], quantity: 1 });
  const each = busPrice(f.year) + upgradeCost(f.features);
  const price = each * f.quantity;
  async function save() {
    if (!f.fleet_no) { toast.error("Fleet number needed"); return; }
    if (!depotTowns.includes(f.depot)) { toast.error("Choose one of your depots"); return; }
    if(saving)return;setSaving(true);
    try{
      const res=await purchase({data:{...f,companyId,day:company.day,route_id:f.route_id==='none'?null:f.route_id}});
      const bought=(res as {bought?:number;partial?:boolean;reason?:string})?.bought??f.quantity;
      const partial=(res as {partial?:boolean;reason?:string})?.partial;
      if(partial)toast.warning(`Only ${bought} of ${f.quantity} bought — ${(res as {reason?:string}).reason??'funds ran out'}`);
      else toast.success(f.quantity>1?`${bought} buses join the fleet`:`${f.fleet_no} joins the fleet`);
      setOpen(false);refresh();
    }catch(e){toast.error(e instanceof Error?e.message:'Purchase failed');}finally{setSaving(false);}
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button>+ Buy a bus</Button></DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="font-display text-3xl">Add to fleet</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Fleet no.</Label><Input value={f.fleet_no} onChange={(e) => setF({ ...f, fleet_no: e.target.value })} /></div>
            <div><Label>Registration</Label><Input value={f.registration} onChange={(e) => setF({ ...f, registration: e.target.value.toUpperCase() })} /></div>
          </div>
          <div><Label>Model</Label>
            <Select value={f.model} onValueChange={(v) => setF({ ...f, model: v })}><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{models.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div><Label>Year</Label><Input type="number" min={1970} max={2026} value={f.year} onChange={(e) => setF({ ...f, year: Number(e.target.value) })} /></div>
            <div><Label>How many</Label><Input type="number" min={1} max={50} value={f.quantity} onChange={(e) => setF({ ...f, quantity: Math.max(1, Math.min(50, Number(e.target.value) || 1)) })} /></div>
            <div><Label>Depot</Label>
              <Select value={depotTowns.includes(f.depot) ? f.depot : undefined} onValueChange={(v) => setF({ ...f, depot: v })}><SelectTrigger><SelectValue placeholder="Choose depot" /></SelectTrigger>
                <SelectContent>{depotTowns.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
            </div>
          </div>
          <div><Label>Livery</Label><Input value={f.livery} onChange={(e) => setF({ ...f, livery: e.target.value })} placeholder="e.g. Green Line, Sapphire, heritage NBC" /></div>
          <div><Label>Allocate to route</Label>
            <Select value={f.route_id} onValueChange={(v) => setF({ ...f, route_id: v })}><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="none">Unallocated</SelectItem>{routes.map((r) => <SelectItem key={r.id} value={r.id}>{r.number}</SelectItem>)}</SelectContent></Select>
          </div>
          <div><Label>Spec & extras</Label><FeaturePicker value={f.features} onChange={(v) => setF({ ...f, features: v })} /></div>
          <BusPhoto model={f.model} presetKey={company.preset_key} className="overflow-hidden rounded-md" />
          <p className="text-sm text-muted-foreground">Extras {cur}{upgradeCost(f.features).toLocaleString()} each · Upkeep {cur}{upgradeUpkeep(f.features)}/day each{f.quantity > 1 ? ` · ${f.quantity} buses at ${cur}${each.toLocaleString()} each` : ""}</p>
          <Button disabled={saving} onClick={save}>{f.quantity > 1 ? `Buy ${f.quantity} for ${cur}${price.toLocaleString()}` : `Buy for ${cur}${price.toLocaleString()}`}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Routes({ companyId, routes, buses, drivers, refresh }: { companyId: string; routes: Rt[]; buses: Bus[]; drivers: Drv[]; refresh: () => void }) {
  const area = useArea();
  const cur = useCur();
  const [f, setF] = useState({ number: "", origin: areaTowns(area)[0] ?? "", destination: areaTowns(area)[1] ?? "", via: "", frequency_mins: 30, fare: 2, journey_minutes:30, turnaround_minutes:5, recovery_percent:10 });
  async function add() {
    if (!f.number) { toast.error("Route number needed"); return; }
    const { error } = await supabase.from("routes").insert({ ...f, company_id: companyId });
    if (error) { toast.error(error.message); return; }
    setF({ ...f, number: "", via: "" }); refresh();
  }
  const townSelect = (k: "origin" | "destination") => (
    <Select value={f[k]} onValueChange={(v) => setF({ ...f, [k]: v })}><SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent>{areaTowns(area).map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
  );
  return (
    <div className="mt-2 space-y-3">
      {routes.map((r) => {
        const n = buses.filter((b) => b.route_id === r.id && b.status==='In service').length;
        return (
          <div key={r.id} className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3">
            <span className="blind min-w-16 px-2 py-1 text-center text-3xl">{r.number}</span>
            <div className="min-w-0 flex-1 basis-40">
              <p className="font-semibold">{r.origin} → {r.destination}</p>
              <p className="break-words text-xs text-muted-foreground">{r.service_type} · {r.via && `via ${r.via} · `}every {r.frequency_mins} min · {cur}{Number(r.fare).toFixed(2)} · {n} bus{n === 1 ? "" : "es"}{r.contract_end_day != null && ` · Contract ends day ${r.contract_end_day}`}</p>
            </div>
            {r.stop_ids.length === 0 && <EditStops route={r} refresh={refresh} />}
            <RouteFrequency route={r} count={n} refresh={refresh}/>
            <RouteDrivers route={r} needed={n} drivers={drivers} refresh={refresh} />
            <Button size="sm" variant="ghost" onClick={async () => { await supabase.from("routes").delete().eq("id", r.id); refresh(); }}>Withdraw</Button>
          </div>
        );
      })}
      <div className="rounded-lg border border-dashed bg-card p-3">
        <p className="font-display text-2xl">Register a new route</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          <div><Label>Number</Label><Input value={f.number} onChange={(e) => setF({ ...f, number: e.target.value })} /></div>
          <div><Label>From</Label>{townSelect("origin")}</div>
          <div><Label>To</Label>{townSelect("destination")}</div>
          <div className="sm:col-span-3"><Label>Stops in between (in order)</Label>
            <StopPicker value={f.via ? f.via.split(", ") : []} onChange={(v) => setF({ ...f, via: v.join(", ") })} />
          </div>
          <div><Label>One-way journey minutes</Label><Input aria-label="New route journey minutes" type="number" min={5} max={600} value={f.journey_minutes} onChange={e=>setF({...f,journey_minutes:Number(e.target.value)})}/></div>
          <ServiceFrequency cycleMinutes={timetableCycle(f)} value={f.frequency_mins} onChange={n=>setF({...f,frequency_mins:n})} label="New route frequency"/>
          <div><Label>Fare {cur}</Label><Input type="number" step="0.1" min={0} value={f.fare} onChange={(e) => setF({ ...f, fare: Number(e.target.value) })} /></div>
        </div>
        <Button className="mt-3" onClick={add}>Register route</Button>
      </div>
    </div>
  );
}

function FeaturePicker({ value, onChange, disabled=false }: { value: string[]; onChange: (v: string[]) => void; disabled?:boolean }) {
  const cur = useCur();
  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {FEATURES.map((ft) => {
        const on = value.includes(ft);
        return (
          <Button key={ft} type="button" size="sm" variant={on?'default':'outline'} disabled={disabled} onClick={() => onChange(on ? value.filter((x) => x !== ft) : [...value, ft])} className="h-auto whitespace-normal text-xs">
            {ft}{!on && ` · ${cur}${UPGRADE_PRICES[ft]?.install.toLocaleString()}`}
          </Button>
        );
      })}
    </div>
  );
}

function RouteFrequency({route,count,refresh}:{route:Rt;count:number;refresh:()=>void}) {
 const [draft,setDraft]=useState({frequency_mins:route.frequency_mins,journey_minutes:route.journey_minutes,turnaround_minutes:route.turnaround_minutes,recovery_percent:route.recovery_percent}),[busy,setBusy]=useState(false);
 useEffect(()=>setDraft({frequency_mins:route.frequency_mins,journey_minutes:route.journey_minutes,turnaround_minutes:route.turnaround_minutes,recovery_percent:route.recovery_percent}),[route.frequency_mins,route.journey_minutes,route.turnaround_minutes,route.recovery_percent]);
 const cycle=timetableCycle(draft),needed=requiredBuses(draft.frequency_mins,cycle);
 return <div className="w-full border-t pt-2"><div className="grid gap-2 sm:grid-cols-3">{([{key:'journey_minutes',label:'One-way journey minutes',min:5,max:600},{key:'turnaround_minutes',label:'Turnaround at each terminal',min:0,max:120},{key:'recovery_percent',label:'Recovery %',min:0,max:100}] as const).map(x=><div key={x.key}><Label>{x.label}</Label><Input aria-label={`Route ${route.number} ${x.label}`} type="number" min={x.min} max={x.max} value={draft[x.key]} onChange={e=>setDraft({...draft,[x.key]:Number(e.target.value)})}/></div>)}</div><ServiceFrequency cycleMinutes={cycle} value={draft.frequency_mins} onChange={value=>setDraft({...draft,frequency_mins:value})} label={`Route ${route.number} frequency`} disabled={busy}/><div className="flex flex-wrap items-center justify-between gap-2"><p className={`text-xs ${count<needed?'text-destructive':'text-muted-foreground'}`}>{count} in-service buses allocated · {count===0?'Planned / unserved':count<needed?'Not enough buses to operate':'Fleet covered'}</p><Button size="sm" variant="outline" disabled={busy} onClick={async()=>{setBusy(true);try{const r=await supabase.from('routes').update(draft).eq('id',route.id);if(r.error)throw r.error;toast.success('Timetable saved');refresh();}catch(e){toast.error(e instanceof Error?e.message:'Timetable could not save');}finally{setBusy(false);}}}>Save timetable</Button></div></div>;
}

function StopPicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const area = useArea();
  const [pick, setPick] = useState("");
  const move = (i: number, d: number) => { const v = [...value]; const j = i + d; const a=v[i],b=v[j]; if(a===undefined||b===undefined)return;v[i]=b;v[j]=a;onChange(v); };
  return (
    <div className="space-y-2">
      <ol className="space-y-1">
        {value.map((s, i) => (
          <li key={`${s}-${i}`} className="flex items-center gap-1 rounded-md border bg-background px-2 py-1 text-sm">
            <span className="w-5 text-muted-foreground">{i + 1}.</span><span className="flex-1">{s}</span>
            <Button type="button" size="icon" variant="ghost" aria-label="Move up" onClick={() => move(i, -1)}>↑</Button>
            <Button type="button" size="icon" variant="ghost" aria-label="Move down" onClick={() => move(i, 1)}>↓</Button>
            <Button type="button" size="icon" variant="ghost" aria-label="Remove stop" onClick={() => onChange(value.filter((_, k) => k !== i))}>✕</Button>
          </li>
        ))}
      </ol>
      <div className="flex gap-2">
        <div className="flex-1"><Select value={pick} onValueChange={setPick}><SelectTrigger><SelectValue placeholder="Choose a stop" /></SelectTrigger>
          <SelectContent>{areaTowns(area).map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
        <Button type="button" variant="secondary" disabled={!pick} onClick={() => { onChange([...value, pick]); setPick(""); }}>Add stop</Button>
      </div>
    </div>
  );
}

function EditStops({ route, refresh }: { route: Rt; refresh: () => void }) {
  const [open, setOpen] = useState(false);
  const [stops, setStops] = useState<string[]>(route.via ? route.via.split(", ") : []);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="outline">Stops</Button></DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="font-display text-3xl">{route.number}: {route.origin} → {route.destination}</DialogTitle></DialogHeader>
        <StopPicker value={stops} onChange={setStops} />
        <Button onClick={async () => { await supabase.from("routes").update({ via: stops.join(", ") }).eq("id", route.id); setOpen(false); refresh(); }}>Save stops</Button>
      </DialogContent>
    </Dialog>
  );
}

function RouteDrivers({ route, needed, drivers, refresh }: { route: { id: string }; needed: number; drivers: Drv[]; refresh: () => void }) {
  const [busy, setBusy] = useState(false);
  const crew = (d: Drv) => d.role === "Driver" || d.role === "Senior Driver";
  const assigned = drivers.filter((d) => d.route_id === route.id && crew(d));
  const free = drivers.filter((d) => crew(d) && !d.route_id);
  const inspectors = drivers.filter((d) => d.route_id === route.id && d.role === "Ticket Inspector");
  const freeInspectors = drivers.filter((d) => d.role === "Ticket Inspector" && !d.route_id);
  const save = async (ids: string[], routeId: string | null, msg: string) => {
    if (busy || !ids.length) return; setBusy(true);
    try { for (const part of chunk(ids)) { const r = await supabase.from("drivers").update({ route_id: routeId }).in("id", part); if (r.error) throw r.error; } toast.success(msg); refresh(); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Assignment failed"); } finally { setBusy(false); }
  };
  const gap = Math.max(0, needed - assigned.length);
  return (
    <div className="w-full border-t pt-2">
      <p className="text-sm font-semibold">Drivers · {assigned.length} assigned / {needed} needed · {free.length} unassigned available</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <Button size="sm" disabled={busy || !gap || !free.length} onClick={() => save(free.slice(0, gap).map((d) => d.id), route.id, `Assigned ${Math.min(gap, free.length)} drivers`)}>Fill with unassigned drivers{gap ? ` (${Math.min(gap, free.length)})` : ""}</Button>
        <Button size="sm" variant="outline" disabled={busy || !free.length} onClick={() => save([free[0]!.id], route.id, "Driver assigned")}>Add one</Button>
        {assigned.length > 0 && <Button size="sm" variant="ghost" disabled={busy} onClick={() => save(assigned.map((d) => d.id), null, "Drivers unassigned")}>Unassign all</Button>}
      </div>
      {assigned.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{assigned.slice(0, 40).map((d) => <Button key={d.id} size="sm" variant="secondary" disabled={busy} title="Tap to unassign" onClick={() => save([d.id], null, `${d.name} unassigned`)}>{d.name}{d.role === "Senior Driver" ? " ★" : ""} ✕</Button>)}{assigned.length > 40 && <span className="self-center text-xs text-muted-foreground">+{assigned.length - 40} more</span>}</div>}
      {!drivers.some(crew) && <p className="mt-2 text-sm text-muted-foreground">No drivers employed.</p>}
      <p className="mt-3 text-sm font-semibold">Ticket inspectors · {inspectors.length} on route (+{Math.min(2, inspectors.length) * 6}% fares) · {freeInspectors.length} available</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <Button size="sm" variant="outline" disabled={busy || !freeInspectors.length} onClick={() => save([freeInspectors[0]!.id], route.id, "Ticket inspector assigned")}>Add inspector</Button>
        {inspectors.map((d) => <Button key={d.id} size="sm" variant="secondary" disabled={busy} title="Tap to unassign" onClick={() => save([d.id], null, `${d.name} unassigned`)}>{d.name} ✕</Button>)}
      </div>
    </div>
  );
}
