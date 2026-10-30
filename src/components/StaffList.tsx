import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ApplicantPortrait } from './ApplicantPortrait';
import { chunk } from '@/lib/fetch-all';
import type { Tables } from '@/integrations/supabase/types';

const NONE = '__none__';
const PAGE = 60;

export function StaffList({ drivers, routes, depots, refresh }: { drivers: Tables<'drivers'>[]; routes: Tables<'routes'>[]; depots: Tables<'depots'>[]; refresh: () => void }) {
  const [role, setRole] = useState('All'), [depot, setDepot] = useState('All'), [shown, setShown] = useState(PAGE), [busy, setBusy] = useState(false), [moveTo, setMoveTo] = useState('');
  const roles = useMemo(() => [...new Set(drivers.map(d => d.role))].sort(), [drivers]);
  const list = drivers.filter(d => (role === 'All' || d.role === role) && (depot === 'All' || (depot === NONE ? !d.depot : d.depot === depot)));
  const managers = drivers.filter(d => d.role === 'Depot Manager');
  const managerOf = (town: string) => managers.find(m => m.depot === town);

  async function update(ids: string[], patch: { depot?: string; route_id?: string | null }, msg: string) {
    if (busy || !ids.length) return; setBusy(true);
    try { for (const part of chunk(ids)) { const r = await supabase.from('drivers').update(patch).in('id', part); if (r.error) throw r.error; } toast.success(msg); refresh(); }
    catch (e) { toast.error(e instanceof Error ? e.message : (e as { message?: string })?.message ?? 'Could not save'); }
    finally { setBusy(false); }
  }
  async function release(d: Tables<'drivers'>) {
    if (!confirm(`Release ${d.name}?`)) return;
    const r = await supabase.from('drivers').delete().eq('id', d.id); if (r.error) toast.error(r.error.message); else refresh();
  }

  return <div className="space-y-4">
    <div className="rounded-md border bg-card p-3">
      <h3 className="text-2xl">Depot managers</h3>
      <p className="text-sm text-muted-foreground">One manager per depot · {managers.length} manager{managers.length === 1 ? '' : 's'} for {depots.length} depot{depots.length === 1 ? '' : 's'}{managers.length > depots.length ? ' · release extra managers or open more depots' : ''}</p>
      <ul className="mt-2 grid gap-1 text-sm sm:grid-cols-2">{depots.map(d => <li key={d.id}><span className="font-semibold">{d.town}:</span> {managerOf(d.town)?.name ?? <span className="text-muted-foreground">No manager</span>}</li>)}</ul>
    </div>
    <div className="grid gap-2 sm:grid-cols-4">
      <Select value={role} onValueChange={v => { setRole(v); setShown(PAGE); }}><SelectTrigger aria-label="Filter by role"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="All">All roles</SelectItem>{roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select>
      <Select value={depot} onValueChange={v => { setDepot(v); setShown(PAGE); }}><SelectTrigger aria-label="Filter by depot"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="All">All depots</SelectItem><SelectItem value={NONE}>No depot</SelectItem>{depots.map(d => <SelectItem key={d.id} value={d.town}>{d.town}</SelectItem>)}</SelectContent></Select>
      <Select value={moveTo} onValueChange={setMoveTo}><SelectTrigger aria-label="Move shown staff to depot"><SelectValue placeholder="Move shown staff to…" /></SelectTrigger><SelectContent>{depots.map(d => <SelectItem key={d.id} value={d.town}>{d.town}</SelectItem>)}</SelectContent></Select>
      <Button disabled={busy || !moveTo || !list.length} onClick={() => update(list.filter(d => d.role !== 'Depot Manager').map(d => d.id), { depot: moveTo }, `Moved ${list.filter(d => d.role !== 'Depot Manager').length} staff to ${moveTo}`)}>Move {list.filter(d => d.role !== 'Depot Manager').length} to depot</Button>
    </div>
    <p className="text-sm text-muted-foreground">Showing {Math.min(shown, list.length)} of {list.length} employees ({drivers.length} total). Depot managers are moved one at a time.</p>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{list.slice(0, shown).map(d => <article className="rounded-md border bg-card p-4" key={d.id}>
      <div className="flex gap-3"><ApplicantPortrait index={d.portrait_index} name={d.name} className="h-20 w-20" /><div className="min-w-0"><h3 className="text-2xl">{d.name}</h3><p className="text-sm">{d.role}</p><p className="text-xs text-muted-foreground">#{d.staff_no} · £{d.wage}/day</p></div></div>
      <div className="mt-3 grid gap-2">
        <Select value={d.depot || NONE} onValueChange={v => update([d.id], { depot: v === NONE ? '' : v }, `${d.name} moved`)}><SelectTrigger aria-label={`Depot for ${d.name}`}><SelectValue /></SelectTrigger><SelectContent><SelectItem value={NONE}>No depot</SelectItem>{depots.map(x => <SelectItem key={x.id} value={x.town}>{x.town}{d.role === 'Depot Manager' && managerOf(x.town) && managerOf(x.town)!.id !== d.id ? ' (has manager)' : ''}</SelectItem>)}</SelectContent></Select>
        {d.role === 'Driver' && <Select value={d.route_id ?? NONE} onValueChange={v => update([d.id], { route_id: v === NONE ? null : v }, `${d.name} assignment saved`)}><SelectTrigger aria-label={`Route for ${d.name}`}><SelectValue /></SelectTrigger><SelectContent><SelectItem value={NONE}>No route</SelectItem>{routes.map(r => <SelectItem key={r.id} value={r.id}>Route {r.number} · {r.origin} → {r.destination}</SelectItem>)}</SelectContent></Select>}
      </div>
      {d.qualifications.length > 0 && <p className="mt-2 text-xs text-muted-foreground">{d.qualifications.join(' · ')}</p>}
      <Button className="mt-2" size="sm" variant="ghost" disabled={busy} onClick={() => release(d)}>Release employee</Button>
    </article>)}</div>
    {shown < list.length && <Button variant="outline" onClick={() => setShown(shown + PAGE * 2)}>Show more ({list.length - shown} left)</Button>}
  </div>;
}
