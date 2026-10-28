import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BusSide } from "@/components/BusSide";
import { BUS_MODELS, HERTS_TOWNS, STATUSES } from "@/lib/herts";
import { simulateDay } from "@/lib/sim";

export const Route = createFileRoute("/_authenticated/company/$id")({
  head: () => ({
    meta: [
      { title: "Company depot — Herts Bus Manager" },
      { name: "description", content: "Fleet list, routes and driver roster for your Herts bus company." },
      { property: "og:title", content: "Company depot — Herts Bus Manager" },
      { property: "og:description", content: "Manage fleet, routes and drivers." },
    ],
  }),
  component: CompanyPage,
});

const busPrice = (year: number) => Math.max(8000, 20000 + (year - 1995) * 6000);

function useCompanyData(id: string) {
  const company = useQuery({ queryKey: ["company", id], queryFn: async () => (await supabase.from("companies").select("*").eq("id", id).single()).data });
  const buses = useQuery({ queryKey: ["buses", id], queryFn: async () => (await supabase.from("buses").select("*").eq("company_id", id).order("fleet_no")).data ?? [] });
  const routes = useQuery({ queryKey: ["routes", id], queryFn: async () => (await supabase.from("routes").select("*").eq("company_id", id).order("number")).data ?? [] });
  const drivers = useQuery({ queryKey: ["drivers", id], queryFn: async () => (await supabase.from("drivers").select("*").eq("company_id", id).order("name")).data ?? [] });
  return { company: company.data, buses: buses.data ?? [], routes: routes.data ?? [], drivers: drivers.data ?? [] };
}

function CompanyPage() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const { company, buses, routes, drivers } = useCompanyData(id);
  const refresh = () => ["company", "buses", "routes", "drivers"].forEach((k) => qc.invalidateQueries({ queryKey: [k, id] }));
  const [log, setLog] = useState<string[]>([]);

  if (!company) return <div className="p-8 text-muted-foreground">Loading depot…</div>;

  async function runDay() {
    if (!company) return;
    const r = simulateDay(routes.map((x) => ({ id: x.id, frequency_mins: x.frequency_mins, fare: Number(x.fare) })), buses, drivers.map((d) => Number(d.wage)));
    await supabase.from("companies").update({ balance: Number(company.balance) + r.profit, day: company.day + 1 }).eq("id", id);
    await Promise.all(buses.filter((b) => b.status === "In service" && b.route_id).map((b) =>
      supabase.from("buses").update({ mileage: b.mileage + 180 + Math.floor(Math.random() * 60) }).eq("id", b.id)));
    setLog((l) => [`Day ${company.day}: £${r.revenue.toLocaleString()} fares, £${r.costs.toLocaleString()} costs → ${r.profit >= 0 ? "+" : ""}£${r.profit.toLocaleString()} (${r.activeBuses} buses out)`, ...l].slice(0, 20));
    refresh();
  }

  async function spend(amount: number) {
    if (!company) return false;
    if (Number(company.balance) < amount) { toast.error("Not enough money"); return false; }
    await supabase.from("companies").update({ balance: Number(company.balance) - amount }).eq("id", id);
    return true;
  }

  return (
    <div className="min-h-screen">
      <div className="h-2" style={{ background: `linear-gradient(90deg, ${company.primary_color} 70%, ${company.secondary_color} 70%)` }} />
      <header className="mx-auto max-w-6xl px-4 py-4">
        <Link to="/dashboard" className="text-sm text-muted-foreground underline">← All companies</Link>
        <div className="mt-2 flex flex-wrap items-center gap-4">
          <BusSide primary={company.primary_color} secondary={company.secondary_color} label={company.short_name} double className="w-36" />
          <div className="flex-1">
            <h1 className="text-5xl leading-none">{company.name}</h1>
            <p className="text-muted-foreground">HQ {company.hq_town} · Day {company.day}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase text-muted-foreground">Balance</p>
            <p className={`font-display text-4xl ${Number(company.balance) < 0 ? "text-destructive" : "text-primary"}`}>£{Number(company.balance).toLocaleString()}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Stat label="Buses" value={buses.length} /><Stat label="Routes" value={routes.length} /><Stat label="Drivers" value={drivers.length} />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 pb-16">
        <Tabs defaultValue="fleet">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="fleet">Fleet</TabsTrigger><TabsTrigger value="routes">Routes</TabsTrigger>
            <TabsTrigger value="drivers">Roster</TabsTrigger><TabsTrigger value="ops">Operations</TabsTrigger>
          </TabsList>
          <TabsContent value="fleet"><Fleet companyId={id} company={company} buses={buses} routes={routes} refresh={refresh} spend={spend} /></TabsContent>
          <TabsContent value="routes"><Routes companyId={id} routes={routes} buses={buses} refresh={refresh} /></TabsContent>
          <TabsContent value="drivers"><Drivers companyId={id} drivers={drivers} refresh={refresh} /></TabsContent>
          <TabsContent value="ops">
            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm text-muted-foreground">Only buses marked “In service” and allocated to a route earn fares. Each bus costs £90/day to run; drivers are paid daily.</p>
              <Button size="lg" className="mt-3" onClick={runDay}>Run day {company.day}</Button>
              <ul className="mt-4 space-y-1 text-sm">{log.map((l, i) => <li key={i} className="border-b py-1">{l}</li>)}</ul>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
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
  const update = async (id: string, patch: Partial<Bus>) => { await supabase.from("buses").update(patch).eq("id", id); refresh(); };
  const remove = async (b: Bus) => {
    if (!confirm(`Sell ${b.fleet_no} for £${Math.round(busPrice(b.year) * 0.3).toLocaleString()}?`)) return;
    await supabase.from("buses").delete().eq("id", b.id);
    await supabase.from("companies").update({ balance: Number(company.balance) + Math.round(busPrice(b.year) * 0.3) }).eq("id", companyId);
    refresh();
  };
  return (
    <div className="mt-2">
      <AddBus companyId={companyId} company={company} routes={routes} refresh={refresh} spend={spend} />
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {buses.map((b) => (
          <div key={b.id} className="rounded-lg border bg-card p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-display text-2xl leading-none">{b.fleet_no} <span className="rounded bg-accent px-1.5 text-base text-accent-foreground">{b.registration}</span></p>
                <p className="text-sm">{b.model} · {b.year}</p>
                <p className="text-xs text-muted-foreground">{b.livery || "Fleet livery"} · {b.depot || "No depot"} · {b.mileage.toLocaleString()} mi</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => remove(b)}>Sell</Button>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Select value={b.status} onValueChange={(v) => update(b.id, { status: v })}>
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
          </div>
        ))}
      </div>
    </div>
  );
}

function AddBus({ companyId, company, routes, refresh, spend }: { companyId: string; company: Co; routes: Rt[]; refresh: () => void; spend: (n: number) => Promise<boolean> }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ fleet_no: "", registration: "", model: BUS_MODELS[0], year: 2012, depot: company.hq_town, livery: "", route_id: "none" });
  const price = busPrice(f.year);
  async function save() {
    if (!f.fleet_no) return toast.error("Fleet number needed");
    if (!(await spend(price))) return;
    const { error } = await supabase.from("buses").insert({ ...f, company_id: companyId, route_id: f.route_id === "none" ? null : f.route_id });
    if (error) return toast.error(error.message);
    toast.success(`${f.fleet_no} joins the fleet`); setOpen(false); refresh();
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
              <SelectContent>{BUS_MODELS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Year</Label><Input type="number" min={1970} max={2026} value={f.year} onChange={(e) => setF({ ...f, year: Number(e.target.value) })} /></div>
            <div><Label>Depot</Label>
              <Select value={f.depot} onValueChange={(v) => setF({ ...f, depot: v })}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{HERTS_TOWNS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
            </div>
          </div>
          <div><Label>Livery</Label><Input value={f.livery} onChange={(e) => setF({ ...f, livery: e.target.value })} placeholder="e.g. Green Line, Sapphire, heritage NBC" /></div>
          <div><Label>Allocate to route</Label>
            <Select value={f.route_id} onValueChange={(v) => setF({ ...f, route_id: v })}><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="none">Unallocated</SelectItem>{routes.map((r) => <SelectItem key={r.id} value={r.id}>{r.number}</SelectItem>)}</SelectContent></Select>
          </div>
          <Button onClick={save}>Buy for £{price.toLocaleString()}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Routes({ companyId, routes, buses, refresh }: { companyId: string; routes: Rt[]; buses: Bus[]; refresh: () => void }) {
  const [f, setF] = useState({ number: "", origin: "Hertford", destination: "Stevenage", via: "", frequency_mins: 30, fare: 2 });
  async function add() {
    if (!f.number) return toast.error("Route number needed");
    const { error } = await supabase.from("routes").insert({ ...f, company_id: companyId });
    if (error) return toast.error(error.message);
    setF({ ...f, number: "", via: "" }); refresh();
  }
  const townSelect = (k: "origin" | "destination") => (
    <Select value={f[k]} onValueChange={(v) => setF({ ...f, [k]: v })}><SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent>{HERTS_TOWNS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
  );
  return (
    <div className="mt-2 space-y-3">
      {routes.map((r) => {
        const n = buses.filter((b) => b.route_id === r.id).length;
        return (
          <div key={r.id} className="flex items-center gap-3 rounded-lg border bg-card p-3">
            <span className="blind min-w-16 px-2 py-1 text-center text-3xl">{r.number}</span>
            <div className="flex-1">
              <p className="font-semibold">{r.origin} → {r.destination}</p>
              <p className="text-xs text-muted-foreground">{r.via && `via ${r.via} · `}every {r.frequency_mins} min · £{Number(r.fare).toFixed(2)} · {n} bus{n === 1 ? "" : "es"}</p>
            </div>
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
          <div><Label>Via</Label><Input value={f.via} onChange={(e) => setF({ ...f, via: e.target.value })} /></div>
          <div><Label>Every (min)</Label><Input type="number" min={5} value={f.frequency_mins} onChange={(e) => setF({ ...f, frequency_mins: Number(e.target.value) })} /></div>
          <div><Label>Fare £</Label><Input type="number" step="0.1" min={0} value={f.fare} onChange={(e) => setF({ ...f, fare: Number(e.target.value) })} /></div>
        </div>
        <Button className="mt-3" onClick={add}>Register route</Button>
      </div>
    </div>
  );
}

function Drivers({ companyId, drivers, refresh }: { companyId: string; drivers: Drv[]; refresh: () => void }) {
  const [name, setName] = useState("");
  const [depot, setDepot] = useState("Hertford");
  async function hire() {
    if (!name) return toast.error("Driver name needed");
    await supabase.from("drivers").insert({ company_id: companyId, name, depot, staff_no: String(1000 + drivers.length + Math.floor(Math.random() * 900)) });
    setName(""); refresh();
  }
  return (
    <div className="mt-2 space-y-2">
      <div className="flex flex-wrap gap-2 rounded-lg border bg-card p-3">
        <Input className="flex-1" placeholder="Driver name" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="w-44"><Select value={depot} onValueChange={setDepot}><SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{HERTS_TOWNS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
        <Button onClick={hire}>Hire (£140/day)</Button>
      </div>
      {drivers.map((d) => (
        <div key={d.id} className="flex items-center justify-between rounded-md border bg-card px-3 py-2">
          <span><b>{d.name}</b> <span className="text-sm text-muted-foreground">#{d.staff_no} · {d.depot} · £{Number(d.wage)}/day</span></span>
          <Button size="sm" variant="ghost" onClick={async () => { await supabase.from("drivers").delete().eq("id", d.id); refresh(); }}>Release</Button>
        </div>
      ))}
    </div>
  );
}
