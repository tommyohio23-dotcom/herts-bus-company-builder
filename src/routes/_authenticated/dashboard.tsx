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
import { HERTS_TOWNS, PRESETS, type Preset } from "@/lib/herts";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Your companies — Herts Bus Manager" },
      { name: "description", content: "Choose or create a Hertfordshire bus company." },
      { property: "og:title", content: "Your companies — Herts Bus Manager" },
      { property: "og:description", content: "Your saved Herts bus companies." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: companies = [] } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => (await supabase.from("companies").select("*").order("created_at")).data ?? [],
  });

  async function startPreset(p: Preset) {
    const { data: c, error } = await supabase.from("companies").insert({
      name: p.name, short_name: p.short, primary_color: p.primary, secondary_color: p.secondary, preset_key: p.key, hq_town: p.hq,
    }).select().single();
    if (error || !c) return toast.error(error?.message ?? "Failed");
    const { data: routes } = await supabase.from("routes").insert(
      p.routes.map((r) => ({ company_id: c.id, number: r.number, origin: r.origin, destination: r.destination, via: r.via, frequency_mins: r.frequency, fare: r.fare })),
    ).select();
    await supabase.from("buses").insert(p.fleet.map((b, i) => ({
      company_id: c.id, ...b, livery: p.livery, depot: p.depots[i % p.depots.length], route_id: routes?.[i % (routes?.length || 1)]?.id ?? null,
    })));
    await supabase.from("drivers").insert(p.fleet.map((_, i) => ({ company_id: c.id, name: `Driver ${i + 1}`, depot: p.depots[i % p.depots.length], staff_no: String(1000 + i) })));
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
        <h1 className="text-5xl">Your companies</h1>
        {companies.length === 0 && <p className="text-muted-foreground">None yet — pick a classic operator or found your own below.</p>}
        <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {companies.map((c) => (
            <Link key={c.id} to="/company/$id" params={{ id: c.id }} className="card-raised rounded-lg bg-card p-3 transition hover:-translate-y-0.5">
              <BusSide primary={c.primary_color} secondary={c.secondary_color} label={c.short_name} className="w-full" />
              <p className="font-display text-2xl">{c.name}</p>
              <p className="text-sm text-muted-foreground">Day {c.day} · £{Number(c.balance).toLocaleString()}</p>
            </Link>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-4xl">Classic Herts operators</h2>
          <CustomCompany onDone={(id) => navigate({ to: "/company/$id", params: { id } })} />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {PRESETS.map((p) => (
            <div key={p.key} className="rounded-lg border bg-card p-3">
              <BusSide primary={p.primary} secondary={p.secondary} label={p.short} className="w-full" />
              <p className="font-display text-2xl">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.livery} · {p.routes.length} routes · {p.fleet.length} buses</p>
              <Button size="sm" className="mt-2 w-full" onClick={() => startPreset(p)}>Take control</Button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function CustomCompany({ onDone }: { onDone: (id: string) => void }) {
  const [name, setName] = useState("");
  const [short, setShort] = useState("");
  const [primary, setPrimary] = useState("#0b6b3a");
  const [secondary, setSecondary] = useState("#f2e6b8");
  const [hq, setHq] = useState("Hertford");
  async function create() {
    if (!name.trim()) return toast.error("Give your company a name");
    const { data, error } = await supabase.from("companies").insert({
      name, short_name: short || name.slice(0, 8), primary_color: primary, secondary_color: secondary, hq_town: hq, balance: 150000,
    }).select().single();
    if (error || !data) return toast.error(error?.message ?? "Failed");
    onDone(data.id);
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
              <SelectContent>{HERTS_TOWNS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Button onClick={create}>Create company (£150,000 start)</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
