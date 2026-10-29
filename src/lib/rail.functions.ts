import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { applyRailAction, initialRailState, type RailState } from './rail';
const call=z.object({station:z.string().min(1),arrival:z.string(),departure:z.string(),platform:z.string().min(1)});
export const createRailCompany=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
  const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
  const c=await context.supabase.from('companies').insert({name:'Great Northern',short_name:'GN',primary_color:'#171f39',secondary_color:'#e94060',preset_key:'great-northern',hq_town:'Hornsey',transport_mode:'train',balance:3000000}).select().single();
  if(c.error||!c.data)throw new Error('Could not create train company');
  const r=await supabaseAdmin.rpc('save_rail_game',{p_company:c.data.id,p_user:context.userId,p_revision:-1,p_state:initialRailState()});
  if(r.error){await context.supabase.from('companies').delete().eq('id',c.data.id);throw new Error(r.error.message);}return {id:c.data.id};
});
export const railAction=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({companyId:z.string().uuid(),revision:z.number().int().nonnegative(),action:z.object({kind:z.enum(['purchase','upgrade','depot','service','withdraw','train','advert','review','release','bid','day']),key:z.string().optional(),features:z.array(z.enum(['USB charging ports','Leather seats','Free Wi-Fi','Air conditioning','Next-stop audio/visual','Wheelchair space','CCTV','Tables'])).optional(),number:z.string().max(50).optional(),depot:z.string().max(100).optional(),status:z.enum(['In service','Spare','Workshop']).optional(),role:z.string().optional(),wage:z.number().positive().max(1000).optional(),positions:z.number().int().min(1).max(10).optional(),description:z.string().max(1500).optional(),decision:z.enum(['shortlist','reject','offer']).optional(),bid:z.number().positive().optional(),service:z.object({id:z.string(),name:z.string().min(1),calls:z.array(call).min(2).max(40),trainId:z.string(),driverId:z.string(),fare:z.number().min(0).max(100),returnMinutes:z.number().int().min(5).max(180)}).optional()})})).handler(async({data,context})=>{
  const r=await context.supabase.from('rail_games').select('*').eq('company_id',data.companyId).single();if(r.error||!r.data)throw new Error('Train game not found');if(r.data.revision!==data.revision)throw new Error('Game changed; refresh and retry');
  const state=applyRailAction(r.data.state as unknown as RailState,data.action);
  const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
  const saved=await supabaseAdmin.rpc('save_rail_game',{p_company:data.companyId,p_user:context.userId,p_revision:data.revision,p_state:state});if(saved.error)throw new Error(saved.error.message);return {day:state.day,balance:state.balance};
});