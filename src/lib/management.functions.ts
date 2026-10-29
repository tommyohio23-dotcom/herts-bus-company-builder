import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { DEPOT_PACKAGES, managementDay, marketListings, tenderDecision, tenderOffers } from './management';
import {assertFleetCoverage} from './service-frequency';

export const managementAction = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ companyId: z.string().uuid(), day: z.number().int().positive(), action: z.enum(['purchase','depot','day','bid']), key: z.string().optional(), town: z.string().optional(), fleetNo: z.string().optional(), bid: z.number().positive().optional() }))
  .handler(async ({ data, context }) => {
    const db = context.supabase;
    const { data: company, error } = await db.from('companies').select('*').eq('id',data.companyId).single();
    if (error || !company || company.user_id !== context.userId) throw new Error('Company not found');
    if (company.day !== data.day) throw new Error('Company changed; refresh and retry');
    const [busResult, routeResult, staffResult, depotResult] = await Promise.all([
      db.from('buses').select('*').eq('company_id',company.id), db.from('routes').select('*').eq('company_id',company.id),
      db.from('drivers').select('*').eq('company_id',company.id), db.from('depots').select('*').eq('company_id',company.id),
    ]);
    for (const result of [busResult,routeResult,staffResult,depotResult]) if (result.error) throw new Error(result.error.message);
    const buses = busResult.data ?? [], routes = routeResult.data ?? [], staff = staffResult.data ?? [], depots = depotResult.data ?? [];
    if (data.action === 'bid') {
      const offer = tenderOffers(company.day).find(t => t.key === data.key);
      if (!offer || !data.bid || data.bid > offer.budget) throw new Error('Choose a current tender and bid within its budget');
      const r = await db.rpc('submit_game_bid',{p_company:company.id,p_day:company.day,p_key:offer.key,p_bid:data.bid});
      if (r.error) throw new Error(r.error.message);
      return { message: 'Bid submitted', profit: null };
    }
    let payload;
    if (data.action === 'purchase') {
      const listing = marketListings(company.day).find(b => b.key === data.key);
      if (!listing || !data.fleetNo?.trim()) throw new Error('Choose a current bus and enter a fleet number');
      if (buses.some(b => b.fleet_no === data.fleetNo?.trim())) throw new Error('Fleet number already in use');
      payload = {...listing, market_key:listing.key, fleet_no:data.fleetNo.trim(), registration:'', depot:data.town ?? '', features:listing.features};
    } else if (data.action === 'depot') {
      const pack = DEPOT_PACKAGES.find(p => p.name === data.key);
      const { HERTS_TOWNS } = await import('./herts');
      if (!pack || !data.town || !HERTS_TOWNS.includes(data.town)) throw new Error('Choose a depot package and town');
      payload = {...pack, name:`${data.town} ${pack.name}`,town:data.town};
    } else {
      assertFleetCoverage(routes.filter(r=>r.contract_end_day==null||r.contract_end_day>=company.day),buses);
      const bids = await db.from('tender_bids').select('*').eq('company_id',company.id).eq('status','Pending');
      if (bids.error) throw new Error(bids.error.message);
      for (const bid of bids.data ?? []) {
        const offer = tenderOffers(bid.submitted_day).find(t => t.key === bid.tender_key);
        if (!offer || offer.close_day > company.day) continue;
        const won = tenderDecision(Number(bid.bid),offer.budget,buses.filter(b => b.status==='In service' && b.condition>=65).length,offer.required);
        const resolution = await db.rpc('resolve_game_bid',{p_company:company.id,p_key:bid.tender_key,p_won:won,p_route:offer});
        if (resolution.error) throw new Error(resolution.error.message);
      }
      payload = managementDay(routes.map(r => ({...r,fare:Number(r.fare),contract_payment:Number(r.contract_payment)})),buses,staff.map(d => Number(d.wage)),depots.map(d => Number(d.daily_rent)),company.day);
    }
    const result = await db.rpc('apply_management_action',{p_company:company.id,p_day:company.day,p_action:data.action,p_payload:payload});
    if (result.error) throw new Error(result.error.message);
    return { message: data.action==='purchase' ? 'Bus added to fleet' : data.action==='depot' ? 'Depot opened' : 'Operating day saved', profit: 'profit' in payload ? payload.profit : null };
  });