import { useParams } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { routeCycleFromNames, requiredBuses } from '@/lib/service-frequency';

type Company = { id: string; name: string; budget: number; day: number };
type Rt = { id: string; number: string; origin: string | null; destination: string | null; via: string | null; frequency_mins: number };
type Bus = { id: string; plate: string; route_id: string | null; status: string };
type Driver = { id: string; name: string; route_id: string | null };
type GameEvent = { id: number; type: 'breakdown' | 'rail'; msg: string; payload?: number; busId?: string };

let eventId = 0;

export default function CompanyPage() {
  const { id: companyId } = useParams({ from: '/_authenticated/company/$id' });
  const [company, setCompany] = useState<Company | null>(null);
  const [routes, setRoutes] = useState<Rt[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [events, setEvents] = useState<GameEvent[]>([]);

  async function refresh() {
    const [{ data: co }, { data: rt }, { data: bu }, { data: dr }] = await Promise.all([
      supabase.from('companies').select('*').eq('id', companyId).single(),
      supabase.from('routes').select('*').eq('company_id', companyId),
      supabase.from('buses').select('*').eq('company_id', companyId),
      supabase.from('drivers').select('*').eq('company_id', companyId),
    ]);
    if (co) setCompany(co as Company);
    setRoutes((rt ?? []) as Rt[]);
    setBuses((bu ?? []) as Bus[]);
    setDrivers((dr ?? []) as Driver[]);
  }

  useEffect(() => { refresh(); }, [companyId]);

  function dismiss(id: number) {
    setEvents(ev => ev.filter(e => e.id !== id));
  }

  async function advanceDay() {
    if (!company) return;
    const newEvents: GameEvent[] = [];

    // Breakdowns — 20% chance per active bus
    const activeBuses = buses.filter(b => b.status === 'In service');
    for (const bus of activeBuses) {
      if (Math.random() < 0.2) {
        await supabase.from('buses').update({ status: 'Broken down' }).eq('id', bus.id);
        newEvents.push({ id: ++eventId, type: 'breakdown', busId: bus.id, msg: `🔧 ${bus.plate} broke down — repair for £2,000` });
      }
    }

    // Rail replacement offer — 30% chance
    if (Math.random() < 0.3) {
      const lines = ['Thameslink', 'Great Northern', 'West Midlands Trains', 'East Midlands Railway'];
      const line = lines[Math.floor(Math.random() * lines.length)];
      const pay = Math.floor(Math.random() * 3000 + 2000);
      newEvents.push({ id: ++eventId, type: 'rail', payload: pay, msg: `🚆 ${line} needs rail replacement — accept for £${pay}` });
    }

    // Revenue from routes
    const revenue = routes.reduce((sum, r) => {
      const cycle = routeCycleFromNames(r.origin ?? '', r.via ?? '', r.destination ?? '');
      const needed = requiredBuses(r.frequency_mins, cycle);
      const active = buses.filter(b => b.route_id === r.id && b.status === 'In service').length;
      return sum + Math.min(active, needed) * 400;
    }, 0);

    const busCost = buses.filter(b => b.status === 'In service').length * 150;
    const wages = drivers.length * 120;
    const profit = revenue - busCost - wages;

    await supabase.from('companies').update({ budget: company.budget + profit, day: company.day + 1 }).eq('id', companyId);
    setEvents(prev => [...prev, ...newEvents]);
    await refresh();

    if (newEvents.length === 0) {
      alert(`Day ${company.day} done\nRevenue £${revenue} · Costs £${busCost + wages} · Net £${profit}`);
    }
  }

  if (!company) return <p className="p-8 text-center text-muted-foreground">Loading…</p>;

  const activeBuses = buses.filter(b => b.status === 'In service').length;
  const brokenBuses = buses.filter(b => b.status === 'Broken down').length;

  return (
    <main className="min-h-screen bg-background">

      {/* Header */}
      <div className="border-b bg-card px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold">{company.name}</h1>
              <p className="text-muted-foreground mt-1">Day {company.day} · £{company.budget.toLocaleString()}</p>
            </div>
            <Button onClick={advanceDay}>Advance day ▶</Button>
          </div>
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="rounded-lg border bg-muted/40 p-3">
              <p className="text-2xl font-bold">{activeBuses}</p>
              <p className="text-xs text-muted-foreground uppercase">Active buses</p>
            </div>
            {brokenBuses > 0 && (
              <div className="rounded-lg border border-red-300 bg-red-50 p-3">
                <p className="text-2xl font-bold text-red-600">{brokenBuses}</p>
                <p className="text-xs text-red-500 uppercase">Broken</p>
              </div>
            )}
            <div className="rounded-lg border bg-muted/40 p-3">
              <p className="text-2xl font-bold">{routes.length}</p>
              <p className="text-xs text-muted-foreground uppercase">Routes</p>
            </div>
            <div className="rounded-lg border bg-muted/40 p-3">
              <p className="text-2xl font-bold">{drivers.length}</p>
              <p className="text-xs text-muted-foreground uppercase">Staff</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Tabs defaultValue="routes">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="routes">Routes</TabsTrigger>
            <TabsTrigger value="fleet">Fleet</TabsTrigger>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="operations">Operations</TabsTrigger>
          </TabsList>

          {/* ROUTES */}
          <TabsContent value="routes" className="space-y-4">
            <AddRoute companyId={companyId} refresh={refresh} />
            {routes.length === 0 && <p className="text-center text-muted-foreground py-12">No routes yet.</p>}
            {routes.map(r => {
              const cycle = routeCycleFromNames(r.origin ?? '', r.via ?? '', r.destination ?? '');
              const needed = requiredBuses(r.frequency_mins, cycle);
              const active = buses.filter(b => b.route_id === r.id && b.status === 'In service').length;
              const ok = active >= needed;
              return (
                <Card key={r.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Route {r.number} · {r.origin} → {r.destination}</CardTitle>
                    {r.via && <p className="text-sm text-muted-foreground">Via {r.via}</p>}
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">Every {r.frequency_mins} min</Badge>
                      <Badge variant="outline">{cycle / 2} min journey</Badge>
                      <Badge variant="outline">{cycle} min round trip</Badge>
                    </div>
                    <p className={`text-sm font-medium ${ok ? 'text-green-600' : 'text-red-500'}`}>
                      {needed} buses needed for this {cycle}-min loop · {active} assigned
                      {!ok && ` ⚠ need ${needed - active} more`}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* FLEET */}
          <TabsContent value="fleet" className="space-y-4">
            <AddBus companyId={companyId} routes={routes} day={company.day} refresh={refresh} />
            {buses.length === 0 && <p className="text-center text-muted-foreground py-12">No buses yet.</p>}
            {buses.map(b => {
              const rt = routes.find(r => r.id === b.route_id);
              const broken = b.status === 'Broken down';
              return (
                <Card key={b.id} className={broken ? 'border-red-300' : ''}>
                  <CardContent className="pt-4 flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <p className="font-bold text-lg">{b.plate}</p>
                      <p className="text-sm text-muted-foreground">
                        {rt ? `Route ${rt.number}: ${rt.origin} → ${rt.destination}` : 'Unassigned'}
                      </p>
                      <Badge variant={broken ? 'destructive' : 'outline'} className="mt-1">{b.status}</Badge>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      {broken ? (
                        <Button size="sm" variant="destructive" onClick={async () => {
                          if (!company || company.budget < 2000) return alert('Not enough money!');
                          await supabase.from('buses').update({ status: 'In service' }).eq('id', b.id);
                          await supabase.from('companies').update({ budget: company.budget - 2000 }).eq('id', companyId);
                          refresh();
                        }}>Repair £2,000</Button>
                      ) : (
                        <RouteSelect value={b.route_id} table="buses" rowId={b.id} routes={routes} refresh={refresh} />
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* EMPLOYEES */}
          <TabsContent value="employees" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Employees</h2>
              <HireDriver companyId={companyId} refresh={refresh} />
            </div>
            {drivers.length === 0 && <p className="text-center text-muted-foreground py-12">No drivers yet.</p>}
            {drivers.map(d => {
              const rt = routes.find(r => r.id === d.route_id);
              return (
                <Card key={d.id}>
                  <CardContent className="pt-4 flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <p className="font-bold text-lg">{d.name}</p>
                      <p className="text-sm text-muted-foreground">Driver · £120/day</p>
                      {rt && <p className="text-sm mt-1">Route {rt.number}: {rt.origin} → {rt.destination}</p>}
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <RouteSelect value={d.route_id} table="drivers" rowId={d.id} routes={routes} refresh={refresh} />
                      <Button size="sm" variant="outline" onClick={async () => {
                        await supabase.from('drivers').delete().eq('id', d.id);
                        refresh();
                      }}>Release employee</Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* OPERATIONS */}
          <TabsContent value="operations" className="space-y-4">
            <h2 className="text-2xl font-bold">Operations</h2>
            {routes.length === 0 && <p className="text-center text-muted-foreground py-12">No routes yet.</p>}
            {routes.map(r => {
              const cycle = routeCycleFromNames(r.origin ?? '', r.via ?? '', r.destination ?? '');
              const needed = requiredBuses(r.frequency_mins, cycle);
              const active = buses.filter(b => b.route_id === r.id && b.status === 'In service').length;
              const assigned = drivers.filter(d => d.route_id === r.id).length;
              const ok = active >= needed;
              return (
                <Card key={r.id} className={ok ? '' : 'border-red-300'}>
                  <CardContent className="pt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-bold">Route {r.number}: {r.origin} → {r.destination}</p>
                      <Badge variant={ok ? 'default' : 'destructive'}>{ok ? 'Running' : 'Under-served'}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-sm">
                      <p>Buses: {active} / {needed} needed</p>
                      <p>Drivers: {assigned}</p>
                      <p>Every {r.frequency_mins} min</p>
                      <p>{cycle}-min round trip</p>
                    </div>
                    {!ok && (
                      <p className="text-xs text-red-500">
                        ⚠ Need {needed - active} more bus{needed - active !== 1 ? 'es' : ''} to run full service
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>

      {/* Event popups */}
      {events.length > 0 && (
        <div className="fixed bottom-4 right-4 left-4 max-w-md mx-auto space-y-2 z-50">
          {events.map(e => (
            <div key={e.id} className="bg-card border rounded-lg p-4 shadow-xl">
              <p className="text-sm font-medium mb-3">{e.msg}</p>
              <div className="flex gap-2">
                {e.type === 'breakdown' && e.busId && (
                  <>
                    <Button size="sm" onClick={async () => {
                      if (!company || company.budget < 2000) return alert('Not enough money!');
                      await supabase.from('buses').update({ status: 'In service' }).eq('id', e.busId);
                      await supabase.from('companies').update({ budget: company.budget - 2000 }).eq('id', companyId);
                      dismiss(e.id);
                      refresh();
                    }}>Repair £2,000</Button>
                    <Button size="sm" variant="outline" onClick={() => dismiss(e.id)}>Leave broken</Button>
                  </>
                )}
                {e.type === 'rail' && (
                  <>
                    <Button size="sm" onClick={async () => {
                      if (!company) return;
                      await supabase.from('companies').update({ budget: company.budget + (e.payload ?? 0) }).eq('id', companyId);
                      dismiss(e.id);
                      refresh();
                    }}>Accept £{e.payload}</Button>
                    <Button size="sm" variant="outline" onClick={() => dismiss(e.id)}>Decline</Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function RouteSelect({ value, table, rowId, routes, refresh }: {
  value: string | null; table: 'buses' | 'drivers'; rowId: string; routes: Rt[]; refresh: () => void;
}) {
  return (
    <Select value={value ?? 'none'} onValueChange={async v => {
      await supabase.from(table).update({ route_id: v === 'none' ? null : v }).eq('id', rowId);
      refresh();
    }}>
      <SelectTrigger className="w-48"><SelectValue placeholder="No route" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="none">No route</SelectItem>
        {routes.map(r => (
          <SelectItem key={r.id} value={r.id}>{r.number}: {r.origin} → {r.destination}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function AddRoute({ companyId, refresh }: { companyId: string; refresh: () => void }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ number: '', origin: '', destination: '', via: '', frequency_mins: 30 });
  const cycle = routeCycleFromNames(f.origin, f.via, f.destination);
  const needed = requiredBuses(f.frequency_mins, cycle);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm">+ Add route</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New route</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Route number</Label><Input value={f.number} onChange={e => setF(p => ({ ...p, number: e.target.value }))} placeholder="84" /></div>
          <div><Label>Origin</Label><Input value={f.origin} onChange={e => setF(p => ({ ...p, origin: e.target.value }))} placeholder="Hertford" /></div>
          <div><Label>Destination</Label><Input value={f.destination} onChange={e => setF(p => ({ ...p, destination: e.target.value }))} placeholder="Watford" /></div>
          <div><Label>Via (comma-separated)</Label><Input value={f.via} onChange={e => setF(p => ({ ...p, via: e.target.value }))} placeholder="Welwyn Garden City, Hatfield" /></div>
          <div><Label>Frequency (mins)</Label><Input type="number" value={f.frequency_mins} onChange={e => setF(p => ({ ...p, frequency_mins: Number(e.target.value) }))} /></div>
          {f.origin && f.destination && (
            <p className="text-sm bg-muted rounded p-2">{cycle}-min round trip → <strong>{needed} buses needed</strong></p>
          )}
          <Button className="w-full" onClick={async () => {
            if (!f.number || !f.origin || !f.destination) return;
            await supabase.from('routes').insert({ ...f, company_id: companyId });
            setOpen(false);
            setF({ number: '', origin: '', destination: '', via: '', frequency_mins: 30 });
            refresh();
          }}>Save route</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AddBus({ companyId, routes, day, refresh }: { companyId: string; routes: Rt[]; day: number; refresh: () => void }) {
  const [open, setOpen] = useState(false);
  const [plate, setPlate] = useState('');
  const [routeId, setRouteId] = useState('none');
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm">+ Purchase bus</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Purchase bus · £50,000</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Plate</Label><Input value={plate} onChange={e => setPlate(e.target.value)} placeholder="HX74 BUS" /></div>
          <div><Label>Route</Label>
            <Select value={routeId} onValueChange={setRouteId}>
              <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {routes.map(r => <SelectItem key={r.id} value={r.id}>{r.number}: {r.origin} → {r.destination}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full" onClick={async () => {
            if (!plate) return;
            await supabase.from('buses').insert({ plate, company_id: companyId, day, status: 'In service', route_id: routeId === 'none' ? null : routeId });
            setOpen(false); setPlate(''); setRouteId('none'); refresh();
          }}>Buy</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function HireDriver({ companyId, refresh }: { companyId: string; refresh: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm">+ Hire driver</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Hire driver · £120/day</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="John Smith" /></div>
          <Button className="w-full" onClick={async () => {
            if (!name) return;
            await supabase.from('drivers').insert({ name, company_id: companyId, route_id: null });
            setOpen(false); setName(''); refresh();
          }}>Hire</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 