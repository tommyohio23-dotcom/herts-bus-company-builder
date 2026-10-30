import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { BUS_MODELS, FEATURES } from './herts';
import { newBusPrice, upgradeCost } from './upgrades';

export const purchaseBusOrFeatures = createServerFn({method:'POST'}).middleware([requireSupabaseAuth])
  .inputValidator(z.object({companyId:z.string().uuid(),day:z.number().int().positive(),busId:z.string().uuid().optional(),features:z.array(z.string()),fleet_no:z.string().optional(),registration:z.string().optional(),model:z.string().optional(),year:z.number().int().min(1970).max(2026).optional(),depot:z.string().optional(),livery:z.string().optional(),route_id:z.string().uuid().nullable().optional(),quantity:z.number().int().min(1).max(50).optional()}))
  .handler(async({data,context})=>{
    const db=context.supabase;
    const c=await db.from('companies').select('*').eq('id',data.companyId).single();
    if(c.error||!c.data||c.data.transport_mode!=='bus')throw new Error('Bus company not found');
    if(data.features.some(f=>!FEATURES.includes(f)))throw new Error('Unknown feature');
    const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
    if(data.busId){
      const b=await db.from('buses').select('*').eq('id',data.busId).eq('company_id',data.companyId).single();
      if(b.error||!b.data)throw new Error('Bus not found');
      const cost=upgradeCost(data.features,b.data.features);
      const r=await supabaseAdmin.rpc('purchase_bus_or_features',{p_company:data.companyId,p_user:context.userId,p_day:data.day,p_cost:cost,p_bus:data.busId,p_payload:{...data,features:[...new Set(data.features)]}});
      if(r.error)throw new Error(r.error.message);
      return {cost,bought:1};
    }
    if(!data.fleet_no?.trim()||!data.model||!BUS_MODELS.includes(data.model)||!data.year||!data.depot)throw new Error('Choose bus details');
    if(data.route_id){const r=await db.from('routes').select('id').eq('id',data.route_id).eq('company_id',data.companyId).single();if(!r.data)throw new Error('Route not found');}
    const each=newBusPrice(data.year)+upgradeCost(data.features);
    const qty=data.quantity??1;
    const dep=await db.from('depots').select('capacity').eq('company_id',data.companyId).eq('town',data.depot).maybeSingle();
    if(!dep.data)throw new Error('Open a depot in '+data.depot+' first');
    const used=await db.from('buses').select('id',{count:'exact',head:true}).eq('company_id',data.companyId).eq('depot',data.depot);
    const room=dep.data.capacity-(used.count??0);
    if(qty>room)throw new Error(room<=0?`${data.depot} depot is full`:`Only room for ${room} more bus${room===1?'':'es'} at ${data.depot} depot`);
    const baseFleet=data.fleet_no.trim();
    const baseNum=/^\d+$/.test(baseFleet)?parseInt(baseFleet,10):null;
    let bought=0;
    for(let i=0;i<qty;i++){
      const fleet_no=baseNum!==null?String(baseNum+i):(qty===1?baseFleet:`${baseFleet}-${i+1}`);
      const registration=data.registration?.trim()?(qty===1?data.registration.trim():`${data.registration.trim()} ${i+1}`):undefined;
      const r=await supabaseAdmin.rpc('purchase_bus_or_features',{p_company:data.companyId,p_user:context.userId,p_day:data.day,p_cost:each,p_bus:'00000000-0000-0000-0000-000000000000',p_payload:{...data,features:[...new Set(data.features)],fleet_no,registration,quantity:undefined}});
      if(r.error){if(bought>0)return {cost:each*bought,bought,partial:true,reason:r.error.message};throw new Error(r.error.message);}
      bought++;
    }
    return {cost:each*bought,bought};
  });