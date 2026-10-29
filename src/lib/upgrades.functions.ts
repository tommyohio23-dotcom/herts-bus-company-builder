import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { BUS_MODELS, FEATURES, HERTS_TOWNS } from './herts';
import { newBusPrice, upgradeCost } from './upgrades';

export const purchaseBusOrFeatures = createServerFn({method:'POST'}).middleware([requireSupabaseAuth])
  .inputValidator(z.object({companyId:z.string().uuid(),day:z.number().int().positive(),busId:z.string().uuid().optional(),features:z.array(z.string()),fleet_no:z.string().optional(),registration:z.string().optional(),model:z.string().optional(),year:z.number().int().min(1970).max(2026).optional(),depot:z.string().optional(),livery:z.string().optional(),route_id:z.string().uuid().nullable().optional()}))
  .handler(async({data,context})=>{
    const db=context.supabase;
    const c=await db.from('companies').select('*').eq('id',data.companyId).single();
    if(c.error||!c.data||c.data.transport_mode!=='bus')throw new Error('Bus company not found');
    if(data.features.some(f=>!FEATURES.includes(f)))throw new Error('Unknown feature');
    let cost=0;
    if(data.busId){const b=await db.from('buses').select('*').eq('id',data.busId).eq('company_id',data.companyId).single();if(b.error||!b.data)throw new Error('Bus not found');cost=upgradeCost(data.features,b.data.features);}
    else {if(!data.fleet_no?.trim()||!data.model||!BUS_MODELS.includes(data.model)||!data.year||!data.depot||!HERTS_TOWNS.includes(data.depot))throw new Error('Choose bus details');if(data.route_id){const r=await db.from('routes').select('id').eq('id',data.route_id).eq('company_id',data.companyId).single();if(!r.data)throw new Error('Route not found');}cost=newBusPrice(data.year)+upgradeCost(data.features);}
    const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
    const r=await supabaseAdmin.rpc('purchase_bus_or_features',{p_company:data.companyId,p_user:context.userId,p_day:data.day,p_cost:cost,p_bus:data.busId??null,p_payload:{...data,features:[...new Set(data.features)]}});
    if(r.error)throw new Error(r.error.message);
    return {cost};
  });