import {createServerFn} from '@tanstack/react-start';
import {z} from 'zod';
import {requireSupabaseAuth} from '@/integrations/supabase/auth-middleware';
export const repairBus=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({companyId:z.string().uuid(),day:z.number().int().positive(),busId:z.string().uuid()})).handler(async({data,context})=>{
 const c=await context.supabase.from('companies').select('id').eq('id',data.companyId).single();
 if(c.error||!c.data)throw new Error('Company not found');
 const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
 const r=await supabaseAdmin.rpc('repair_game_bus',{p_company:data.companyId,p_user:context.userId,p_day:data.day,p_bus:data.busId});
 if(r.error)throw new Error(r.error.message);
 return {ok:true};
});