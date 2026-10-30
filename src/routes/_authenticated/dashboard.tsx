import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BusSide } from "@/components/BusSide";
import { realOperatorPhoto } from "@/lib/bus-photos";
import { BusPhoto } from "@/components/BusPhoto";
import { type Preset } from "@/lib/herts";
import { useServerFn } from '@tanstack/react-start';
import { createRailCompany } from '@/lib/rail.functions';
import { Bus,TrainFront } from 'lucide-react';
import { Tabs,TabsList,TabsTrigger } from '@/components/ui/tabs';
import { BUS_OPERATOR_PRESETS, LONDON_PRESETS } from '@/lib/london';
import { AREAS, AREA_PRESETS, AREA_TOWNS, companyArea, type AreaKey } from '@/lib/areas';
import { AREA_CURRENCY } from '@/lib/currency';
import { StartingMoney } from '@/components/StartingMoney';
import { COMPANY_INFO } from '@/lib/company-info';
import { starterFleet } from '@/lib/operator-fleets';
import { suggestedBusCapital, validStartingCapital, RAIL_STARTING_CAPITAL } from '@/lib/starting-capital';
const LONDON_KEYS = LONDON_PRESETS.map(p => p.key);
function areaPresets(a: AreaKey): Preset[] { return a === 'herts' ? BUS_OPERATOR_PRESETS.filter(p => !LONDON_KEYS.includes(p.key)) : a === 'london' ? LONDON_PRESETS : AREA_PRESETS[a]; }

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Bus & train companies — Herts Transport Manager" },
      { name: "description", content: "Choose bus operations in Herts and London or your separate Great Northern train company." },
      { property: "og:title", content: "Bus & train companies — Herts Transport Manager" },
      { property: "og:description", content: "Your saved bus and Great Northern railway companies." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [mode,setMode]=useState('bus');
  const [area,setArea]=useState<AreaKey>('herts');
  const createRail=useServerFn(createRailCompany);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: companies = [] } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const boost = await supabase.rpc('boost_existing_network_capital');
      if (boost.error) throw new Error(boost.error.message);
      const result = await supabase.from("companies").select("*").order("created_at");
      if (result.error) throw new Error(result.error.message);
      return result.data ?? [];
    },
  });

  const [busy, setBusy] = useState<string | null>(null);
  const [pending, setPending] = useState<Preset | 'rail' | null>(null);
  const [startingMoney, setStartingMoney] = useState('');
  function chooseStartingMoney(p: Preset | 'rail') {
    setStartingMoney(String(p === 'rail' ? RAIL_STARTING_CAPITAL : suggestedBusCapital(p.routes)));
    setPending(p);
  }
  async function confirmStart() {
    if (!pending || busy) return;
    const amount = Number(startingMoney);
    if (!startingMoney.trim() || !validStartingCapital(amount)) { toast.error('Enter a non-negative whole-pound amount'); return; }
    if (pending !== 'rail') { await startPreset(pending, amount); return; }
    setBusy('rail');
    try {
      const r = await createRail({ data: { startingMoney: amount } });
      qc.invalidateQueries({ queryKey: ['companies'] });
      navigate({ to: '/rail/$id', params: { id: r.id } });
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Could not create railway'); }
    finally { setBusy(null); }
  }
  async function startPreset(p: Preset, amount: number) {
    if (busy) return;
    setBusy(p.key);
    const t = toast.loading(`Setting up ${p.name}…`);
    try { await setupPreset(p, amount); } finally { toast.dismiss(t); setBusy(null); }
  }
  async function removeCompany(id: string, name: string) {
    if (!confirm(`Delete ${name}? This removes its fleet, routes and staff.`)) return;
    await supabase.from("companies").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["companies"] });
  }
  async function setupPreset(p: Preset, amount: number) {
    const { data: c, error } = await supabase.from("companies").insert({
      name: p.name, short_name: p.short, primary_color: p.primary, secondary_color: p.secondary, preset_key: p.key, hq_town: p.hq,
      balance: amount, capital_boost_applied: true,
    }).select().single();
    if (error || !c) { toast.error(error?.message ?? "Failed"); return; }
    const depotResult = await supabase.from('depots').insert(p.depots.map(town => ({company_id:c.id,name:`${town} depot`,town,capacity:15,daily_rent:0})));
    if (depotResult.error) { toast.error('Starter depots could not be created'); return; }
    const { data: routes } = await supabase.from("routes").insert(
      p.routes.map((r) => ({ company_id: c.id, number: r.number, origin: r.origin, destination: r.destination, via: r.via, frequency_mins: r.frequency, fare: r.fare })),
    ).select();
    const fleet = starterFleet(p);
    const busResult = await supabase.from("buses").insert(fleet.map((b, i) => ({
      company_id: c.id, ...b, livery: p.livery, depot: p.depots[i % p.depots.length] ?? "", route_id: routes && i < routes.length ? routes[i]!.id : null,
    })));
    const driverResult = await supabase.from("drivers").insert(fleet.map((_, i) => ({ company_id: c.id, name: `Driver ${i + 1}`, depot: p.depots[i % p.depots.length] ?? "", staff_no: String(1000 + i), role: "Driver" })));
    if (busResult.error || driverResult.error) toast.error(`Some starting buses or drivers could not be added: ${(busResult.error ?? driverResult.error)!.message}`);
    qc.invalidateQueries({ queryKey: ["companies"] });
    navigate({ to: "/company/$id", params: { id: c.id } });
  }

  async function signOut() {
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen">
      <div className="stripe-band h-2" />
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="blind px-3 py-1 text-xl">HERTS BUS MANAGER</Link>
        <Button variant="ghost" onClick={signOut}>Sign out</Button>
      </header>
      <main className="mx-auto max-w-6xl px-4 pb-16">
        <h1 className="text-5xl">Your transport companies</h1>
        <Tabs value={mode} onValueChange={setMode} className="mt-4"><TabsList className="h-12 w-full sm:w-auto"><TabsTrigger className="flex-1 gap-2" value="bus"><Bus className="size-5"/>Bus companies</TabsTrigger><TabsTrigger className="flex-1 gap-2" value="train"><TrainFront className="size-5"/>Train companies</TabsTrigger></TabsList></Tabs>
        {mode==='bus'&&<Tabs value={area} onValueChange={v=>setArea(v as AreaKey)} className="mt-3"><TabsList className="h-auto flex-wrap">{AREAS.map(a=><TabsTrigger key={a.key} value={a.key}>{a.label}</TabsTrigger>)}</TabsList></Tabs>}
        {companies.length === 0 && <p className="text-muted-foreground">None yet — pick a classic operator or found your own below.</p>}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {companies.filter(c=>c.transport_mode===mode&&(mode!=='bus'||companyArea(c,LONDON_KEYS)===area)).map((c) => (
            <div key={c.id} className="card-raised rounded-lg bg-card p-3">
            <Link to={c.transport_mode==='train'?'/rail/$id':'/company/$id'} params={{ id: c.id }} className="block">
              {c.transport_mode==='train'?<TrainFront className="my-4 size-12 text-primary"/>:<BusSide primary={c.primary_color} secondary={c.secondary_color} label={c.short_name} className="w-full" />}
              <p className="font-display text-2xl">{c.name}</p>
              <p className="text-sm text-muted-foreground">Day {c.day} · {c.transport_mode==='train'?'£':AREA_CURRENCY[companyArea(c,LONDON_KEYS)]}{Number(c.balance).toLocaleString()}</p>
            </Link>
            <Button size="sm" variant="ghost" className="mt-1 text-destructive" onClick={() => removeCompany(c.id, c.name)}>Delete</Button>
            </div>
          ))}
        </div>

        {mode==='train'?<section className="mt-10"><h2 className="text-4xl">Great Northern</h2><div className="mt-4 flex items-center gap-4 border-y py-6"><TrainFront className="size-16 text-primary"/><div><p className="text-lg">Hornsey · Class 717</p><Button className="mt-3" disabled={!!busy} onClick={()=>chooseStartingMoney('rail')}>{busy==='rail'?'Setting up…':'Take control of Great Northern'}</Button></div></div></section>:<>
        <div className="mt-12 flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-4xl">{AREAS.find(a=>a.key===area)?.label} operators</h2>
          <CustomCompany key={area} area={area} onDone={(id) => navigate({ to: "/company/$id", params: { id } })} />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {areaPresets(area).map((p) => (
            <div key={p.key} className="min-w-0 rounded-lg border bg-card p-3">
              <BusPhoto model={p.name} presetKey={p.key} credit={realOperatorPhoto(p.key)} className="overflow-hidden rounded-md" />
              <p className="font-display text-2xl">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.livery} · {p.routes.length} routes · {starterFleet(p).length} buses</p>
              {COMPANY_INFO[p.key] && <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-2 text-xs">
                <dt className="font-semibold">Established</dt><dd>{COMPANY_INFO[p.key]!.founded}</dd>
                <dt className="font-semibold">Owner</dt><dd>{COMPANY_INFO[p.key]!.owner}</dd>
                <dt className="font-semibold">Based</dt><dd>{p.hq}</dd>
              </dl>}
              {COMPANY_INFO[p.key] && <p className="mt-1 text-xs text-muted-foreground">{COMPANY_INFO[p.key]!.about}</p>}
              <p className="mt-2 text-sm text-muted-foreground">Suggested start: {AREA_CURRENCY[area]}{suggestedBusCapital(p.routes).toLocaleString('en-GB')}</p>
              <Button size="sm" className="mt-2 w-full" disabled={!!busy} onClick={() => chooseStartingMoney(p)}>{busy === p.key ? "Setting up…" : "Take control"}</Button>
            </div>
          ))}
        </div>
        </>}
        <Dialog open={pending !== null} onOpenChange={open=>{if(!open&&!busy)setPending(null);}}>
          <DialogContent>
            <DialogHeader><DialogTitle>{pending === 'rail' ? 'Great Northern' : pending?.name} starting money</DialogTitle></DialogHeader>
            <StartingMoney amount={startingMoney} suggested={pending === 'rail' ? RAIL_STARTING_CAPITAL : pending ? suggestedBusCapital(pending.routes) : 0} onChange={setStartingMoney} cur={pending === 'rail' ? '£' : AREA_CURRENCY[area]}/>
            <Button disabled={!!busy} onClick={confirmStart}>{busy ? 'Setting up…' : 'Start company'}</Button>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

function CustomCompany({ onDone, area }: { onDone: (id: string) => void; area: AreaKey }) {
  const [name, setName] = useState("");
  const [short, setShort] = useState("");
  const [primary, setPrimary] = useState("#0b6b3a");
  const [secondary, setSecondary] = useState("#f2e6b8");
  const [hq, setHq] = useState<string>(AREA_TOWNS[area][0] ?? "");
  const [startingMoney, setStartingMoney] = useState(String(suggestedBusCapital([])));
  const [busy, setBusy] = useState(false);
  async function create() {
    if (busy) return;
    if (!name.trim()) { toast.error("Give your company a name"); return; }
    const amount = Number(startingMoney);
    if (!startingMoney.trim() || !validStartingCapital(amount)) { toast.error('Enter a non-negative whole-pound amount'); return; }
    setBusy(true);
    try {
    const { data, error } = await supabase.from("companies").insert({
      name, short_name: short || name.slice(0, 8), primary_color: primary, secondary_color: secondary, hq_town: hq, balance: amount, capital_boost_applied: true,
    }).select().single();
    if (error || !data) { toast.error(error?.message ?? "Failed"); return; }
    const depot = await supabase.from('depots').insert({company_id:data.id,name:`${hq} depot`,town:hq,capacity:5,daily_rent:0});
    if (depot.error) { toast.error('Starter depot could not be created'); return; }
    onDone(data.id);
    } finally { setBusy(false); }
  }
  return (
    <Dialog>
      <DialogTrigger asChild><Button variant="secondary">+ Found your own company</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle className="font-display text-3xl">New bus company</DialogTitle></DialogHeader>
        <BusSide primary={primary} secondary={secondary} label={short || name} className="w-full" />
        <div className="grid gap-3">
          <div><Label>Company name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Lea Valley Motor Services" /></div>
          <div><Label>Short name (on blinds)</Label><Input value={short} onChange={(e) => setShort(e.target.value)} maxLength={10} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Main colour</Label><Input type="color" value={primary} onChange={(e) => setPrimary(e.target.value)} /></div>
            <div><Label>Skirt colour</Label><Input type="color" value={secondary} onChange={(e) => setSecondary(e.target.value)} /></div>
          </div>
          <div><Label>Head office town</Label>
            <Select value={hq} onValueChange={setHq}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{AREA_TOWNS[area].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <StartingMoney amount={startingMoney} suggested={suggestedBusCapital([])} onChange={setStartingMoney} cur={AREA_CURRENCY[area]}/>
          <Button disabled={busy} onClick={create}>{busy ? 'Setting up…' : 'Create company'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
